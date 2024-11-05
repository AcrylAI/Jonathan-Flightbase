import os
import re
import subprocess
import traceback
import time

from flask_restplus import reqparse, Resource
from werkzeug.datastructures import FileStorage
from utils.common import dec_round, launch_on_host

import utils.storage

import records
import json
import settings
from restplus import api
import settings
import utils.db as db
import utils.kube as kube
import utils.storage as sto
from utils.resource import CustomResource, token_checker
from utils.kube import kube_data
from utils.resource import response
import utils.scheduler as scheduler
from utils.exceptions import *
from utils.access_check import workspace_access_check
# Router Function

ns = api.namespace('dashboard', description='대시보드 관련 API')

dashboard_parser = api.parser()
dashboard_parser.add_argument('workspace_id', required=False, type=int, location='args', help='workspace id')

# admin 페이지의 dashboard 정보를 가지고 옴
def get_admin_dashboard_info():
    try:
        reval = {
            "history":[],
            "totalCount":[],
            "timeline":[],
            "usage":{}
        }
        reval["history"] = db.get_records_for_dashboard()
        reval["totalCount"] = db.get_admin_dashboard_total_count()
        reval["timeline"] = records.get_all_workspace_gpu_usage(days=31)
        reval["detailed_timeline"] = records.get_workspace_gpu_usage_10_mins(workspace_id='ALL', cutoff=72)
        reval["usage"]['hdd'] = dashboard_get_total_storage_usage()
        reval["usage"]['gpuByType'] = get_all_current_gpu_usage_by_type()
        reval["usage"]['gpuByGuarantee'] = get_all_current_gpu_usage_by_guarantee()

    except Exception as e:
        traceback.print_exc()
        raise GetAdminDashboardError
        # return response(status=0, message="Get admin dashboard info Error")
    return response(status=1, result=reval)


def dashboard_get_total_storage_usage():
    current_st = utils.storage.workspace_storage_type
    if current_st == -1:
        return {'total': 0, 'used': 0}
    else:
        if current_st == 1 or current_st == 3:
            try:
                ws_mnt_stat = json.loads(launch_on_host("mfs_util get_workspace_mnt_stat")[0])[0]
                if 'T' in ws_mnt_stat[1]:
                    total = float(re.sub('[^\d|\.]', '', ws_mnt_stat[1])) * 1000
                else:
                    total = float(re.sub('[^\d|\.]', '', ws_mnt_stat[1]))
                if 'T' in ws_mnt_stat[2]:
                    used = float(re.sub('[^\d|\.]', '', ws_mnt_stat[2])) * 1000
                else:
                    used = float(re.sub('[^\d|\.]', '', ws_mnt_stat[2]))
                if total != 0:
                    return {'total': round(total), 'used': round(used)}
            except Exception as e:
                traceback.print_exc()
        elif current_st == 2:
            try:
                # df_result = subprocess.check_output("df | grep ^/dev/", shell=True)
                df_result = subprocess.check_output("df {} | head -2 | tail -1".format(settings.MAIN_STORAGE_PATH), shell=True)
                ret = list(filter(None, df_result.decode('utf-8').split(' ')))
                return {'total':round(int(ret[1])/(1024*1024)),'used':round(int(ret[2])/(1024*1024))}
            except Exception as e:
                traceback.print_exc()
                return {'total':0,'used':0}
        elif current_st == 4:
            res = sto.get_total_storage_usage()
            return res["all"]
    return {'total': 0, 'used': 0}

def get_all_current_gpu_usage_by_type():
    current_total_gpu_count = kube.get_gpu_total_count()
    pod_gpu_usage_by_item_type = kube.get_pod_gpu_usage_by_item_type(pod_list=kube_data.get_pod_list())

    usage = {
            "total": current_total_gpu_count,
            "deployment": pod_gpu_usage_by_item_type["deployment"],
            "training": pod_gpu_usage_by_item_type["training"],
            "available": current_total_gpu_count - (pod_gpu_usage_by_item_type["deployment"] + pod_gpu_usage_by_item_type["training"])}

    return usage


def get_all_current_gpu_usage_by_guarantee():
    current_total_gpu_count = kube.get_gpu_total_count()
    workspaces_gpu_info = kube.get_workspace_gpu_count()
    guaranteed_gpu_used = 0
    unguaranteed_gpu_used = 0

    workspaces = db.get_workspace_list()
    workspaces_with_guaranteed_gpu = []
    guaranteed_gpu_total_count_of_active_ws = 0
    for ws in workspaces:
        if ws["guaranteed_gpu"] == 1:
            workspaces_with_guaranteed_gpu.append(ws["id"])
            ws_status = records.get_current_status_by_time(
                start_time=ws["start_datetime"],
                end_time=ws["end_datetime"])
            if ws_status == "active":
                guaranteed_gpu_total_count_of_active_ws += ws["gpu_deployment_total"]
                guaranteed_gpu_total_count_of_active_ws += ws["gpu_training_total"]

    for ws_id, ws_gpu_usage_info in workspaces_gpu_info.items():
        if ws_gpu_usage_info["training_used"] > 0:
            if ws_id in workspaces_with_guaranteed_gpu:
                guaranteed_gpu_used += ws_gpu_usage_info["training_used"]
            else:
                unguaranteed_gpu_used += ws_gpu_usage_info["training_used"]

        if ws_gpu_usage_info["deployment_used"] > 0:
            if ws_id in workspaces_with_guaranteed_gpu:
                guaranteed_gpu_used += ws_gpu_usage_info["deployment_used"]
            else:
                unguaranteed_gpu_used += ws_gpu_usage_info["deployment_used"]

    usage = {
        "total": current_total_gpu_count,
        "guaranteed_used": guaranteed_gpu_used,
        "unguaranteed_used": unguaranteed_gpu_used,
        "guaranteed_aval": guaranteed_gpu_total_count_of_active_ws - guaranteed_gpu_used,
    }

    usage["unguaranteed_aval"] = usage["total"] \
                                - usage["guaranteed_used"] \
                                - usage["unguaranteed_used"] \
                                - usage["guaranteed_aval"]

    if usage["unguaranteed_aval"] < 0:
        usage["over_limit"] = usage["unguaranteed_aval"] * (-1)
        usage["unguaranteed_used"] = unguaranteed_gpu_used - usage["over_limit"]
        usage["unguaranteed_aval"] = 0
        usage["guaranteed_aval"] = 0

    return usage


def get_current_gpu_usage(workspace_id):
    result = {"gpu": [
        {"total": 0, "type": "Training", "used": 0},
        {"total": 0, "type": "Deployment", "used": 0}
        ]}
    workspace_gpu_info = kube.get_workspace_gpu_count(workspace_id=workspace_id,pod_list=kube_data.get_pod_list())
    if workspace_gpu_info is None:
        return result

    result["gpu"] = [
                {"type": "Training", "used": workspace_gpu_info["training_used"], "total": workspace_gpu_info["training_total"]},
                {"type": "Deployment", "used": workspace_gpu_info["deployment_used"], "total": workspace_gpu_info["deployment_total"]}]

    return result


def get_user_dashboard_info(workspace_id, headers_user):
    try:
        reval = {
            "info":[],
            "totalCount":[],
            "timeline":[],
            "usage":[],
            "history":[],
            "training_items":[]
        }

        user_info = db.get_user_id(headers_user)
        user_id = user_info['id']

        pod_list = kube_data.get_pod_list()
        queue_list = scheduler.get_pod_queue()
        reval['info'] = db.get_user_dashboard_info(workspace_id) or []
        reval['totalCount'] = db.get_user_dashboard_total_count(workspace_id, user_id) or []
        reval['timeline'] = records.get_workspace_gpu_usage(workspace_id)
        reval['detailed_timeline'] = records.get_workspace_gpu_usage_10_mins(workspace_id)
        reval['usage'] = get_current_gpu_usage(workspace_id)
        reval['training_items'] = db.get_user_dashboard_jobs(workspace_id, pod_list, queue_list) or []
        reval['training_items'] += db.get_user_dashboard_hyperparamsearchs(workspace_id, pod_list, queue_list) or []
        reval['history'] = db.get_records_for_dashboard(workspace_id)

        reval['training_items'] = sorted(reval['training_items'], key=lambda item: -item["create_datetime"])[:10]

        reval['manager'] = db.get_workspace(workspace_id=workspace_id)["manager_id"] == user_id

    except Exception as e:
        traceback.print_exc()
        raise GetUserDashboardError
        # return response(status=0, message="Get user dashboard info Error", result=reval)
    return response(status=1, result=reval)


# ROUTER
@ns.route('/admin')
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DashboardAdmin(CustomResource):
    @token_checker
    def get(self):
        try:
            res = get_admin_dashboard_info()
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            return self.send(response(status=0, message=e))

@ns.route('/user')
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DashboardUser(CustomResource):
    @token_checker
    @workspace_access_check(dashboard_parser)
    @ns.expect(dashboard_parser)
    def get(self):
        try:
            args = dashboard_parser.parse_args()
            workspace_id = args['workspace_id']

            # 2
            # try:
            #     check_inaccessible_workspace(user_id=self.check_user_id(), workspace_id=workspace_id)
            # except CustomErrorList as ce:
            #     traceback.print_exc()
            #     # return self.send(response(status=0, message=ce.message, redirect=True))
            #     return self.send(response(status=0, **ce.response()))

            res = get_user_dashboard_info(workspace_id, self.check_user())
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            return self.send(response(status=0, message=e))