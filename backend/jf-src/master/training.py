# from flask_restful import Resource
from utils.resource import CustomResource, token_checker
from flask_restplus import reqparse, Resource
from flask import send_file
import datetime
import time

import utils.db as db
from utils.resource import response
import utils.kube as kube
from utils.kube import kube_data
from utils.common import JfLock
import utils.scheduler as scheduler
import utils.common as common
import threading

from utils.access_check import check_training_access_level

from restplus import api
import traceback
import settings
import os
import pwd, grp
import re
import glob
from lock import jf_scheduler_lock
import json
from TYPE import *
from utils.exceptions import *
from utils.access_check import workspace_access_check, training_access_check
# from utils.ssh_sync import update_public_training_etc, update_private_training_etc, update_training_etc
from utils.ssh_sync import update_training_etc
from settings import *
from training_tool import *

import HELP 

JF_ETC_DIR = settings.JF_ETC_DIR
INGRESS_PROTOCOL = settings.INGRESS_PROTOCOL

lock = threading.Lock()
get_lock = threading.Lock()
pod_queue = []

parser = reqparse.RequestParser()
# Router Function


ns = api.namespace('trainings', description='Training 관련 API')
#ns_etc = api.namespace('training_test', description='프로젝트 etc 관련 API')

#Job Graph GET
job_graph_get = api.parser()
job_graph_get.add_argument('job_id', required=True, default=None, type=int, location='args', help='Job ID')

#Job Graph GET
job_log_get = api.parser()
job_log_get.add_argument('job_id', required=True, default=None, type=int, location='args', help='Job ID')

#Job Graph GET
job_download_get = api.parser()
job_download_get.add_argument('job_id', required=True, default=None, type=int, location='args', help='Job ID')

#training GET
training_parser_get = api.parser()
training_parser_get.add_argument('search_key', required=False, default=None, type=str, location='args', help='training Search Key "name" or "user_name"... ')
training_parser_get.add_argument('size', required=False, default=None, type=int, location='args', help='training List Item Size')
training_parser_get.add_argument('page', required=False, default=None, type=int, location='args', help='training Page Number')
training_parser_get.add_argument('search_value', required=False, default=None, type=str, location='args', help='training Search value')
training_parser_get.add_argument('workspace_id', required=False, default=None, type=int, location='args', help='choosen workspace value')
training_parser_get.add_argument('sort', required=False, default=None, type=str, location='args', help='sort value')
training_parser_get.add_argument('training_type', required=False, default=None, type=str, location='args', help='training type value')

# training POST
training_parser_post = api.parser()
training_parser_post.add_argument('training_name', type=str, required=True, location='json', help='training Name' )
training_parser_post.add_argument('training_type', type=str, required=True, location='json', help='training Type : {}'.format(TRAINING_TYPES) )
training_parser_post.add_argument('built_in_model_id', type=int, required=False, default=None, location='json', help='training Type {} case'.format(TRAINING_TYPE_C))
training_parser_post.add_argument('workspace_id', type=int, required=True, location='json', help='training Location')
training_parser_post.add_argument('owner_id', type=int, required=True, location='json', help='Owner Id' )
training_parser_post.add_argument('users_id', type=list, required=False, default=None, location='json', help='Users Id - private 생성 시 사용함')
training_parser_post.add_argument('gpu_count', type=str, required=True, location='json', help='Training(Job, Hps) GPU Count' )
training_parser_post.add_argument('gpu_model', type=dict, required=False, default=None, location='json', help=HELP.GPU_MODEL)
training_parser_post.add_argument('node_mode', type=int, required=False, default=1, location='json', help='Node Mode ((0) Single, (1) Multiple)' )
training_parser_post.add_argument('node_name', type=dict, required=False, default=None, location='json', help=HELP.NODE_NAME + "미사용 예정 node_name_cpu, node_name_gpu로 대체 (2022-10-25 Yeobie)")
training_parser_post.add_argument('node_name_cpu', type=dict, required=False, default=None, location='json', help=HELP.NODE_NAME)
training_parser_post.add_argument('node_name_gpu', type=dict, required=False, default=None, location='json', help=HELP.NODE_NAME)
training_parser_post.add_argument('docker_image_id', type=int, required=False, location='json', help='Docker Image')
training_parser_post.add_argument('access', type=int, required=True, location='json', help='Access')
training_parser_post.add_argument('description', type=str, required=False, default="",location='json', help="description 200 len")

# # training DELETE
# training_parser_delete = api.parser()
# training_parser_delete.add_argument('training_id', type=int, required=True, location='json', help='training id')

# training PUT
training_parser_update = api.parser()
training_parser_update.add_argument('training_id', type=int, required=True, location='json', help='training ID' )
training_parser_update.add_argument('training_name', type=str, required=True, location='json', help='training Name (No change => Send Current Name)' )
training_parser_update.add_argument('built_in_model_id', type=int, required=False, default=None, location='json', help='training Type {} case'.format(TRAINING_TYPE_C))
training_parser_update.add_argument('owner_id', type=int, required=True, location='json', help='training Owner Id' )
training_parser_update.add_argument('users_id', type=list, required=False, default=None, location='json', help='Users Id' )
training_parser_update.add_argument('gpu_count', type=str, required=True, location='json', help='Training(Job, Hps) GPU Count' )
training_parser_update.add_argument('gpu_model', type=dict, required=False, default=None, location='json', help=HELP.GPU_MODEL)
training_parser_update.add_argument('node_mode', type=int, required=False, default=1, location='json', help='Node Mode ((0) Single, (1) Multiple)' )
training_parser_update.add_argument('node_name', type=dict, required=False, default=None, location='json', help=HELP.NODE_NAME)
training_parser_update.add_argument('docker_image_id', type=int, required=False, location='json', help='Docker Image')
training_parser_update.add_argument('access', type=int, required=True, location='json', help='Access')
training_parser_update.add_argument('description', type=str, required=False, default="", location='json', help="description 200 len")

# GET Training Info for create
create_deployment_info_get = api.parser()
create_deployment_info_get.add_argument('workspace_id', required=False, type=int, default=None, location='args', help='Workspace id ( not => return  workspace_list )')


training_id_parser = api.parser()
training_id_parser.add_argument('training_id', type=int, location='args', required=True, help='프로젝트ID')
training_id_parser.add_argument('gpu_model', type=str, location='args', required=False, help='Run GPU Type ex) gtx-1080, rtx-2080')

training_run_job_parser = api.parser()
training_run_job_parser.add_argument('jobs', type=list, required=True, location='json', help="JOBS ")
# training_run_job_parser.add_argument('training_id', type=int, required=True, location='json', help='training ID')
# training_run_job_parser.add_argument('job_name', type=str, required=True, location='json', help='Job Name ex) epochtest')
# training_run_job_parser.add_argument('docker_image_id', type=int, required=True, location='json', help='Docker Image ID')
# training_run_job_parser.add_argument('dataset_local_path', type=str, required=False, default=None, location='json', help='Dataset Path on local /datasets/image/imagenet')
# training_run_job_parser.add_argument('dataset_mount_path', type=str, required=False, default=None, location='json', help='Dataset Path on docker /dataset')
# training_run_job_parser.add_argument('run_code', type=str, required=True, location='json', help='runfile Path /src/main.py')
# training_run_job_parser.add_argument('parameter', type=list, required=False, default=[], location='json', help='[--epoch 10 --lr 0.01 ..., --epoch 5 --lr 0.01]')

training_stop_job_parser = api.parser()
training_stop_job_parser.add_argument('training_id', type=int, required=True, location='args', help="Training id ")

stop_jobs_parser = api.parser()
stop_jobs_parser.add_argument('training_id', type=int, required=True, location='args', help="training id")
stop_jobs_parser.add_argument('job_group_number', type=int, required=False, default=None, location='args', help="job_group_number (job_group_id = job_group_number). None 선언 시 해당 training의 전체 job 종료 및 삭제(pending 아이템에 대해)")

stop_job_parser = api.parser()
stop_job_parser.add_argument('job_id', type=int, required=True, location='args', help="Job id ")

create_info_parser = api.parser()
create_info_parser.add_argument('training_id', type=int, required=True, location='args', help="training id")


### JOB CRUD
training_job_get_parser = api.parser()
training_job_get_parser.add_argument('search_key', required=False, default=None, type=str, location='args', help='training JOB Search Key "name" or "user_name"... ')
training_job_get_parser.add_argument('size', required=False, default=None, type=int, location='args', help='training JOB List Item Size')
training_job_get_parser.add_argument('page', required=False, default=None, type=int, location='args', help='training JOB Page Number')
training_job_get_parser.add_argument('search_value', required=False, default=None, type=str, location='args', help='training JOB Search value')
training_job_get_parser.add_argument('training_id', required=False, default=None, type=int, location='args', help='choosen training_id value')
training_job_get_parser.add_argument('sort', required=False, default=None, type=str, location='args', help='sort value .. start_datetime, end_datatime')


training_job_post_parser = api.parser()
training_job_post_parser.add_argument('jobs', type=list, required=True, location='json', help=HELP.JOBS)
# training_run_job_parser.add_argument('training_id', type=int, required=True, location='json', help='training ID')
# training_run_job_parser.add_argument('job_name', type=str, required=True, location='json', help='Job Name ex) epochtest')
# training_run_job_parser.add_argument('docker_image_id', type=int, required=True, location='json', help='Docker Image ID')
# training_run_job_parser.add_argument('dataset_local_path', type=str, required=False, default=None, location='json', help='Dataset Path on local /datasets/image/imagenet')
# training_run_job_parser.add_argument('dataset_mount_path', type=str, required=False, default=None, location='json', help='Dataset Path on docker /dataset')
# training_run_job_parser.add_argument('run_code', type=str, required=True, location='json', help='runfile Path /src/main.py')
# training_run_job_parser.add_argument('parameter', type=list, required=False, default=[], location='json', help='[--epoch 10 --lr 0.01 ..., --epoch 5 --lr 0.01]')

training_job_delete_parser = api.parser()
training_job_delete_parser.add_argument("job_id_list", type=list, required=False, default=None, location='json', help="JOB id list - 지정 삭제 [3,6,8,10]")
training_job_delete_parser.add_argument("training_id", type=int, required=False, default=None, location='json', help="Training ID - 전체 삭제")

job_tensorboard_url_get_parser = api.parser()
job_tensorboard_url_get_parser.add_argument('job_id', type=int, required=True, location='args', help="job id")
job_tensorboard_url_get_parser.add_argument('protocol', required=False, default=INGRESS_PROTOCOL, type=str, location='args', help='front protocol =? http or https')

# training_jupyter_url_get_parser = api.parser()
# training_jupyter_url_get_parser.add_argument('training_id', type=int, required=True, location='args', help="JOB ids")

training_bookmark_post_parser = api.parser()
training_bookmark_post_parser.add_argument('training_id', type=int, required=True, location='json', help='Training ID')

training_bookmark_delete_parser = api.parser()
training_bookmark_delete_parser.add_argument('training_id', type=int, required=True, location='json', help='Training ID')

training_run_code_get_parser = api.parser()
training_run_code_get_parser.add_argument('training_id', type=int, required=True, location='args', help='Training ID')

training_id_get_parser = api.parser()
training_id_get_parser.add_argument('training_id', type=int, required=True, location='args', help='Training ID')

def is_training_good_name(training_name):
    is_good = common.is_good_name(name=training_name)
    if is_good == False:
        raise TrainingNameInvalidError

    return True


def get_training_tool_info(tool_editor_id, tool_editor_configurations, tool_jupyter_id, tool_jupyter_configurations, tool_jupyter_gpu_count,
                    tool_jupyter_image_name,
                    start_datetime, end_datetime, pod_list, service_list):
    tool_editor_status = kube.get_training_tool_pod_status(training_tool_id=tool_editor_id, pod_list=pod_list,
                                                                    start_datetime=start_datetime, end_datetime=end_datetime)
    tool_editor_ports = kube.get_service_port(training_tool_id=tool_editor_id, service_list=service_list)

    tool_jupyter_status = kube.get_training_tool_pod_status(training_tool_id=tool_jupyter_id, pod_list=pod_list,
                                                            start_datetime=start_datetime, end_datetime=end_datetime)
    tool_jupyter_ports = kube.get_service_port(training_tool_id=tool_jupyter_id, service_list=service_list)                                                        

    if tool_editor_status["status"] not in KUBER_RUNNING_STATUS:
        tool_editor_configurations = "-"

    if tool_jupyter_status["status"] not in KUBER_RUNNING_STATUS:
        tool_jupyter_configurations = "-"


    training_tool = {
        TOOL_TYPE[0]: {
            "status": tool_editor_status,
            "ports": tool_editor_ports,
            "configuration": [tool_editor_configurations],
            "training_tool_id": tool_editor_id,
            "tool_base": TOOL_BASE[0],
            "gpu_count": 0
        },
        TOOL_TYPE[1]: {
            "status": tool_jupyter_status,
            "ports": tool_jupyter_ports,
            "configuration": [tool_jupyter_configurations],
            "training_tool_id": tool_jupyter_id,
            "tool_base": TOOL_BASE[1],
            "gpu_count": tool_jupyter_gpu_count,
            "docker_image": tool_jupyter_image_name
        }
    }
    return training_tool

def get_training_info(db_training_info, pod_list=None, service_list=None):
    training_id = db_training_info["id"]
    training_name = db_training_info["training_name"]
    workspace_name = db_training_info["workspace_name"]
    training_description = db_training_info["description"]
    training_type = db_training_info["type"]
    training_access = db_training_info["access"]
    training_gpu_count = db_training_info["gpu_count"]
    training_built_model_name = db_training_info["built_in_model_name"]
    start_datetime = db_training_info["start_datetime"]
    end_datetime = db_training_info["end_datetime"]
    image_name = db_training_info["image_name"]

    training_status = kube.get_training_status(training_id=training_id, pod_list=pod_list,
                                            start_datetime=start_datetime, end_datetime=end_datetime)["status"]

    training_tool = get_training_tool_info(tool_editor_id=db_training_info["tool_editor_id"], tool_editor_configurations=db_training_info["tool_editor_configurations"], 
                                        tool_jupyter_id=db_training_info["tool_jupyter_id"], tool_jupyter_configurations=db_training_info["tool_jupyter_configurations"],
                                        tool_jupyter_gpu_count=db_training_info["tool_jupyter_gpu_count"], tool_jupyter_image_name=db_training_info["tool_jupyter_image_name"],
                                        start_datetime=db_training_info["start_datetime"], end_datetime=db_training_info["end_datetime"], 
                                        pod_list=pod_list, service_list=service_list)


    if db_training_info["gpu_model"] is None:
        gpu_model = {"Random Selection":[]}
    else :
        gpu_model = db_training_info["gpu_model"]

    job_pod_info = kube.get_pod_resource_info(pod_list=pod_list, training_id=training_id, work_func_type=TRAINING_ITEM_A)
    hps_pod_info = kube.get_pod_resource_info(pod_list=pod_list, training_id=training_id, work_func_type=TRAINING_ITEM_C)
    network = "-"
    cpu_cores = "-"
    ram = "-"
    if job_pod_info is not None:
        network = job_pod_info.get(POD_NETWORK_INTERFACE_LABEL_KEY)
        cpu_cores = job_pod_info.get("cpu")
        ram = job_pod_info.get("memory")
    elif hps_pod_info is not None:
        network = hps_pod_info.get(POD_NETWORK_INTERFACE_LABEL_KEY)
        cpu_cores = hps_pod_info.get("cpu")
        ram = hps_pod_info.get("memory")

    training_resource = {
        "gpu_count": db_training_info["gpu_count"],
        "gpu_configuration": gpu_model,
        "network": network,
        "cpu_cores": cpu_cores,
        "ram": ram
    }

    result = {
        "status": training_status, # expired? check
        "training_name": training_name,
        "training_id": training_id,
        "training_description": training_description,
        "training_type": training_type,
        "training_gpu_count": training_gpu_count,
        "training_built_in_model_name": training_built_model_name,
        "training_tool_info": training_tool,
        "training_docker_image": image_name,
        "access": training_access,
        "tensorboard_status": kube.get_training_tool_pod_status(training_tool_id=db_training_info["tool_editor_id"], pod_list=pod_list),
        "training_resource": training_resource
    }

    return result

import time
def get_training_detail_info(training_id, headers_user_id):
    from built_in_model import update_detail_basic_info
    def get_training_status():
        import random
        training_tool_list = db.get_training_tool_list(training_id=training_id)
        training_status = []
        pod_list = kube_data.get_pod_list(try_update=False)
        for training_tool in training_tool_list:
            # "status": KUBER_RUNNING_STATUS[random.randint(0,2)],
            pod_resource = kube.get_pod_resource_info(training_tool_id=training_tool["id"], pod_list=pod_list)
            cpu = None
            memory = None
            network = None
            if pod_resource is not None:
                cpu = pod_resource["cpu"]
                memory = pod_resource["memory"]
                network = pod_resource[POD_NETWORK_INTERFACE_LABEL_KEY]

            form = {
                "type": TOOL_TYPE[training_tool["tool_type"]], # job, jupyter ....
                "status": kube.get_training_tool_pod_status(training_tool_id=training_tool["id"], pod_list=pod_list),
                "docker_image": training_tool["image_name"],
                "network": network,
                "cpu_cores": cpu,
                "memory": memory,
                "configurations": training_tool["configurations"]
            }
            training_status.append(form)
        return training_status

    try:
        training_info = db.get_training(training_id=training_id)
        basic_info={
            "name": training_info["training_name"],
            "description": training_info["description"],
            "type": training_info["type"],
            "create_datetime": training_info["create_datetime"]
        }
        result = {
            "basic_info": basic_info,
            "access_info": {
                "access": training_info["access"],
                "owner": training_info["user_name"],
                "user_list": db.get_training_users(training_id=training_id, include_owner=False),
                "permission_level": check_training_access_level(user_id=headers_user_id, training_id=training_id)
            },
            # "training_status": get_training_status(), # 불필요
        }
        update_detail_basic_info(update_info=result, base_info=training_info)
        return response(status=1, result=result)
    except Exception as e:
        return response(status=0, message="Get Training detail info error : {}".format(e))




def get_training_list(search_key=None, size=None, page=None, search_value=None, choosen_workspace=None, headers_user=None,
                sort=None, training_type=None):
    from training_hyperparam import get_hyperparam_log_sub_file_path, get_hyperparam_log_file_data, get_hyperparam_num_of_last_log_item, get_hyperparamsearch_progress
    from training_job import get_job_progress
    class TrainingResource():
        def __init__(self):
            self.training_configurations = []
            self.worker_usage_case = {"gpu":0 , "cpu": 0}
            
        def add_resource_configurations(self, configurations, gpu_count):    
            self.training_configurations += common.db_configurations_to_list(configurations)
            if gpu_count == 0:
                self.worker_usage_case["cpu"] += 1
            else:
                self.worker_usage_case["gpu"] += gpu_count
                
        def get_resource_info(self):
            if len(self.training_configurations) > 0:
                configurations = common.configuration_list_to_db_configuration_form(self.training_configurations).split(",")
            else :
                configurations = []

            return {
                "resource_usage": self.worker_usage_case,
                "configurations": configurations
            }

    def get_workbench_form(tool_id, tool_name, tool_type, tool_replica_number, tool_configuration, tool_status, tool_image_name):
        return {
            "tool_id": tool_id,
            "tool_name": tool_name,
            "tool_type": tool_type,
            "tool_replica_number": tool_replica_number,
            "tool_configuration": tool_configuration,
            "function_info": TOOL_DEFAULT_FUNCTION_LIST[TOOL_TYPE[tool_type]],
            "tool_status": tool_status,
            "tool_image_name": tool_image_name
        }
    
    def get_item_progress_type(job_status, job_create_timestamp, hps_status, hps_create_timestamp):
        # 둘 다 Pending 이면 먼저 만든 아이템
        # 둘 다 Stop 이면 나중에 만든 아이템
        # 하나 Stop 하나 Pending | Running - > Running | Penidng 우선 
        if job_status["status"]["status"] == hps_status["status"]["status"] == KUBE_POD_STATUS_PENDING:
            # PENDING CASE
            if hps_create_timestamp < job_create_timestamp:
                # HPS
                return TRAINING_ITEM_C
            else:
                # JOB
                return TRAINING_ITEM_A

        elif job_status["status"]["status"] == hps_status["status"]["status"] == KUBE_POD_STATUS_STOP:
            # STOP CASE
            if hps_create_timestamp <= job_create_timestamp:
                # JOB
                return TRAINING_ITEM_A
            else:
                # HPS
                return TRAINING_ITEM_C
            
        else:
            # 상태가 동일하지 않은 케이스 (Running이 동시에 하지는 않음)
            if job_status["status"]["status"] in KUBER_RUNNING_STATUS:
                # JOB - 실행 상태
                return TRAINING_ITEM_A
            elif hps_status["status"]["status"] in KUBER_RUNNING_STATUS:
                # HPS - 실행 상태 
                return TRAINING_ITEM_C
            else:
                # 위에서 어차피 둘다 동일 상태인건 없는 상황이니 
                # Pending이 된 아이템 보여주기
                if job_status["status"]["status"] == KUBE_POD_STATUS_PENDING:
                    return TRAINING_ITEM_A
                else:
                    return TRAINING_ITEM_C


    spend_time = 0
    spend_time2 = 0
    try:
        st = time.time()
        if headers_user is None:
            return response(status=0, message="Jf-user is None in headers")
        user_info = db.get_user(user_name=headers_user)
        if user_info is None:
            return response(status=1, message="OK", result={"list": [], "total": 0})

        if user_info['user_type'] == 0:
            #admin
            training_list = db.get_training_list(search_key=search_key, size=size, page=page, search_value=search_value,
                                                workspace_id=choosen_workspace, user_id=None, sort=sort, training_type=None)
            trainings_count = db.get_training_list(search_key=search_key, size=None, page=None, search_value=search_value,
                                                workspace_id=choosen_workspace, user_id=None, sort=sort, training_type=None)
        else:
            training_list = db.get_training_list(search_key=search_key, size=size, page=page, search_value=search_value,
                                                workspace_id=choosen_workspace, user_id=user_info['id'], sort=sort, training_type=training_type)
            trainings_count = db.get_training_list(search_key=search_key, size=None, page=None, search_value=search_value,
                                                workspace_id=choosen_workspace, user_id=user_info['id'], sort=sort, training_type=training_type)

        # 0.1 ~ 0.2
        if training_list is None:
            return response(status=0, message="training Get Error ", result=[])
        elif len(training_list) == 0:
            return response(status=1, message="OK", result={"list": [], "total": 0})

        user_bookmark_training_list = [ training_bookmark["training_id"] for training_bookmark in db.get_user_training_bookmark_list(user_id=user_info['id'])]
        # try_update True 케이스에서 11 화면을 띄우고 (1초 interval) 테스트 시 response time이 5초 ~ 
        # False 케이스에서 response time 1~2초 
        # -> 실제 get_trainings 처리 속도는 0.2 vs 0.5~1
        pod_list = kube_data.get_pod_list(try_update=False)
        service_list = kube_data.get_service_list(try_update=False)
        node_list = kube_data.get_node_list(try_update=False)
        # 0.01 ~ 0.02

        training_id_list = []
        workspaces_id = []
        for training in training_list:
            training_id_list.append(training["id"])
            workspaces_id.append(training["workspace_id"])

        users_list = db.get_trainings_users(trainings_id=training_id_list)
        jobs_lists = db.get_job_list(training_id_list=training_id_list)
        hpss_lists = db.get_hyperparamsearch_list(training_id_list=training_id_list)
        workspaces = db.get_workspaces(workspaces_id=workspaces_id)
        jobs_group_numbers = db.get_jobs_group_numbers(trainings_id=training_id_list)
        all_tool_list = db.get_training_tool_list(training_id_list=training_id_list)
        queue_list = scheduler.get_pod_queue()
        image_list = db.get_image_list(None)

        # queue_list = db.get_pod_queue()
        # job_queue_list = db.get_pod_queue_with_info()
        # hps_queue_list = db.get_hyperparamsearch_queue_with_info()
        # 0.5 ~ 0.7
        def gen_key_value_by_id(target_list, id_key, del_keys=[]):
            temp_dict = {}
            if target_list is None:
                return temp_dict
            for item in target_list:
                id_ = item[id_key]
                if id_ not in temp_dict.keys():
                    temp_dict[id_] = []
                for del_key in del_keys:
                    del item[del_key]
                temp_dict[id_].append(item)
            return temp_dict

        training_users_list = gen_key_value_by_id(target_list=users_list, id_key="training_id", del_keys=["training_id"])
        jobs_lists = gen_key_value_by_id(target_list=jobs_lists, id_key="training_id") # {training_id : [training_item, .. ,], ...}
        hpss_lists = gen_key_value_by_id(target_list=hpss_lists, id_key="training_id")
        workspaces = gen_key_value_by_id(target_list=workspaces, id_key="id") # {workspace_id : [workspace_item, .. , ], ...}
        jobs_group_numbers = gen_key_value_by_id(target_list=jobs_group_numbers, id_key="training_id") # {training_id : [{group_number, training_id}, ..]}
        all_tool_list = gen_key_value_by_id(target_list=all_tool_list, id_key="training_id")
        image_list_dict = common.gen_dict_from_list_by_key(target_list=image_list, id_key="id")

        #TODO Workspace별 user 목록 제공
        workspace_users = db.get_workspace_users(workspace_id=choosen_workspace)
        workspace_users_name = list(map(lambda x: x['user_name'], workspace_users))
        workspace_users_id = list(map(lambda x: x['id'], workspace_users))
        # print("@@@@ TIME", time.time() - st)
        part1 =[]
        part2 =[]
        part3 =[]
        part4 = []
        for training_n, training in enumerate(training_list):
            part1_st = time.time()
            training_resource_object = TrainingResource()
            item_status = {}
            item_progress = 0
            item_type = TRAINING_ITEM_A
            item_id = None

            training_id = training['id']
            training["gpu_network"] = "-"
            training["gpu_config"] = ["-"]
            training["dataset_name"] = "-"
            
            ## JOB INFO
            #TODO 코드 정리 필요. 함수화 (job, hps 중복되는 정보가 많음)
            job_list = jobs_lists.get(training['id']) if jobs_lists.get(training['id']) else []
            job_last_create_datetime_ts = 0

            job_progress_info = get_job_progress(training_id=training_id, pod_list=pod_list, queue_list=queue_list, job_list=job_list)
            new_job_status = job_progress_info["current_job_status"]
            current_job_info = job_progress_info["current_job_info"]
            if current_job_info is not None:
                job_last_create_datetime_ts = common.date_str_to_timestamp(current_job_info["create_datetime"])
                if new_job_status["status"]["status"] in KUBER_RUNNING_STATUS:
                    training_resource_object.add_resource_configurations(current_job_info["configurations"], current_job_info["gpu_count"])
            else:
                current_job_info = {}
            # new_job_status = get_job_progress(training_id=training_id, pod_list=pod_list, queue_list=queue_list, job_list=job_list)["current_job_status"]["status"]

            # job_last_group_number = jobs_group_numbers.get(training["id"])
            # if job_last_group_number is not None:
            #     job_last_group_number = job_last_group_number[-1].get("group_number")

            # total_job_status = {'total':0, 'done':0, 'pending':0 , 'running':0}
            # cur_job_status = {'total':0, 'done':0, 'pending':0 , 'running':0}
            
            # job_progress = 0
            # for job in job_list:
            #     job_status = kube.get_job_status(job_id=job["id"], pod_list=pod_list, queue_list=queue_list)
            #     total_job_status['total'] += 1
            #     if job_status['status'] in ["error", "installing"]:
            #         job_status['status'] = "running"
            #     total_job_status[job_status['status']] += 1
            #     if job['group_number'] == job_last_group_number:
            #         cur_job_status['total'] += 1
            #         cur_job_status[job_status['status']] += 1
            #         job_last_create_datetime_ts = common.date_str_to_timestamp(job["create_datetime"])

            #     if job_status["status"] == "running":
            #         training_resource_object.add_resource_configurations(job["configurations"], job["gpu_count"])
            #         training["image_name"] = job["image_name"]
            #         training["dataset_name"] = job["dataset_name"]
            #         training["job_gpu_count"] = job["gpu_count"]
            #         if job["configurations"] is not None:
            #             training["job_gpu_config"] = job["configurations"].split(",")
            #         if job["network_interface"] is not None:
            #             training["gpu_network"] = job["network_interface"]

            # try:
            #     job_progress = int(round((cur_job_status["total"]-cur_job_status["pending"])/cur_job_status["total"] ,2)*100)
            # except Exception as e:
            #     job_progress = 0

            part1.append(time.time() - part1_st)

            part2_st = time.time()

            ## HPS INFO
            hps_list = hpss_lists.get(training['id']) if hpss_lists.get(training['id']) else []
            hps_last_create_datetime_ts = 0

            hps_progress_info = get_hyperparamsearch_progress(training_id=training_id, pod_list=pod_list, queue_list=queue_list, hps_list=hps_list)
            new_hps_status = hps_progress_info["current_hps_status"]
            current_hps_info = hps_progress_info["current_hps_info"]
            if current_hps_info is not None:
                hps_last_create_datetime_ts = common.date_str_to_timestamp(current_hps_info["create_datetime"])
                if new_hps_status["status"]["status"] in KUBER_RUNNING_STATUS:
                    training_resource_object.add_resource_configurations(current_hps_info["configurations"], current_hps_info["gpu_count"])
            else:
                current_hps_info = {}
            # new_hps_status = get_hyperparamsearch_progress(training_id=training_id, hps_list=hps_list, pod_list=pod_list, queue_list=queue_list)["current_hps_status"]["status"]
            

            # total_hps_status = {'total':0, 'done':0, 'pending':0 , 'running':0}
            # cur_hps_status = {'total':0, 'done':0, 'pending':0 , 'running':0}
            # choosen_hps_id = None
            # min_ts = None
            # max_hps_id = None
            # max_hps_id_info = None
            # checked_current_running = False
            
            # hps_progress = 0
            # for hps in hps_list:
            #     if max_hps_id is None:
            #         max_hps_id = hps["id"]
            #         max_hps_id_info = hps
            #     if max_hps_id < hps["id"]:
            #         max_hps_id = hps["id"]
            #         max_hps_id_info = hps


            #     hps_status = kube.get_hyperparamsearch_status(hps_id=hps["id"], pod_list=pod_list, queue_list=queue_list)
            #     total_hps_status['total'] += 1
            #     if hps_status['status'] in ["error", "installing"]:
            #         hps_status['status'] = "running"
            #     total_hps_status[hps_status['status']] += 1
            #     # if job['group_number'] == job_last_group_number:
            #     #     cur_job_status['total'] += 1
            #     #     cur_job_status[job_status['status']] += 1
                
            #     hps_ts = common.date_str_to_timestamp(hps["create_datetime"])
            #     if hps_status["status"] == "running":
            #         checked_current_running = True
            #         if min_ts is None:
            #             min_ts = common.date_str_to_timestamp(hps["create_datetime"]) + 1
            #         if hps_ts < min_ts:
            #             min_ts = hps_ts
            #             try: 
            #                 choosen_hps_id = hps["id"]
            #                 last_items = 0
            #                 # if hps.get("load_file_name") is not None:
            #                 log_item_list = get_hyperparam_log_file_data(hps_id=hps["id"], workspace_name=hps["workspace_name"], training_name=hps["training_name"], log_type="json")
            #                 last_items = get_hyperparam_num_of_last_log_item(log_item_list=log_item_list, current_hps_id=hps["id"])

            #                 hps_last_create_datetime_ts = hps_ts
            #                 # num_search_item = len(os.listdir(get_hyperparam_log_sub_file_path(hps_id=hps["id"], workspace_name=hps["workspace_name"], training_name=hps["training_name"]))) - last_items
            #                 search_count = hps["search_count"] or 0
            #                 init_points = hps["init_points"] or 0
            #                 search_count = search_count + init_points
            #                 # cur_hps_status["done"]  = num_search_item
            #                 cur_hps_status["done"]  = len(log_item_list) - last_items
            #                 cur_hps_status["running"] = 1 if cur_hps_status["done"] != search_count else 0
            #                 cur_hps_status["pending"] = max(search_count - cur_hps_status["done"] - 1, 0)
            #                 cur_hps_status["total"] = search_count
            #             except FileNotFoundError as fne:
            #                 num_search_item = 0
            #                 pass
            #             except Exception as e:
            #                 traceback.print_exc()

            #         training["image_name"] = hps["docker_image_name"]
            #         training["dataset_name"] = hps["dataset_name"]
            #         training["hps_gpu_count"] = hps["gpu_count"]
            #         training_resource_object.add_resource_configurations(hps["configurations"], hps["gpu_count"])
            #         if hps["configurations"] is not None:
            #             training["hps_gpu_config"] = hps["configurations"].split(",")
            #         if hps["network_interface"] is not None:
            #             training["gpu_network"] = hps["network_interface"]
            #     elif hps_status["status"] == "pending":
            #         checked_current_running = True
            #         if min_ts is None:
            #             min_ts = common.date_str_to_timestamp(hps["create_datetime"]) + 1
            #         if hps_ts < min_ts:
            #             min_ts = hps_ts
            #             try: 
            #                 choosen_hps_id = hps["id"]
            #                 hps_last_create_datetime_ts = hps_ts
            #                 log_item_list = get_hyperparam_log_file_data(hps_id=hps["id"], workspace_name=hps["workspace_name"], training_name=hps["training_name"], log_type="json")
            #                 last_items = get_hyperparam_num_of_last_log_item(log_item_list=log_item_list, current_hps_id=hps["id"])
            #                 search_count = hps["search_count"] or 0
            #                 init_points = hps["init_points"] or 0
            #                 search_count = search_count + init_points
            #                 cur_hps_status["done"]  = len(log_item_list) - last_items
            #                 cur_hps_status["pending"] = search_count - cur_hps_status["done"]
            #                 cur_hps_status["total"] = search_count
            #             except FileNotFoundError as fne:
            #                 num_search_item = 0
            #                 pass
            #             except Exception as e:
            #                 traceback.print_exc()
            
            # if checked_current_running == False and max_hps_id is not None:
            #     try: 
            #         # print("???",training["training_name"], max_hps_id, max_hps_id_info)
            #         choosen_hps_id = max_hps_id
            #         hps_last_create_datetime_ts = common.date_str_to_timestamp(max_hps_id_info["create_datetime"])
            #         # num_search_item = len(os.listdir(get_hyperparam_log_sub_file_path(hps_id=max_hps_id, workspace_name=hps["workspace_name"], training_name=hps["training_name"])))
            #         log_item_list = get_hyperparam_log_file_data(hps_id=max_hps_id_info["id"], workspace_name=max_hps_id_info["workspace_name"], training_name=max_hps_id_info["training_name"], log_type="json")
            #         last_items = get_hyperparam_num_of_last_log_item(log_item_list=log_item_list, current_hps_id=max_hps_id_info["id"])
            #         search_count = max_hps_id_info["search_count"] or 0
            #         init_points = max_hps_id_info["init_points"] or 0
            #         search_count = search_count + init_points
            #         # num_search_item = min(num_search_item, search_count)
            #         cur_hps_status["done"]  = len(log_item_list) - last_items
            #         cur_hps_status["pending"] = 0
            #         cur_hps_status["total"] = search_count
            #     except FileNotFoundError as fne:
            #         num_search_item = 0
            #         pass
            #     except Exception as e:
            #         traceback.print_exc()
            # try:
            #     hps_progress = int(round(cur_hps_status["done"]/cur_hps_status["total"], 2)*100)
            # except Exception as e:
            #     hps_progress = 0

            # print(total_hps_status)
            # print(training["training_name"], job_last_create_datetime_ts, hps_last_create_datetime_ts)

            item_progress_type= get_item_progress_type(job_status=new_job_status, job_create_timestamp=job_last_create_datetime_ts,
                                    hps_status=new_hps_status, hps_create_timestamp=hps_last_create_datetime_ts)

            if item_progress_type == TRAINING_ITEM_A:
                item_status = new_job_status["status"]
                item_progress = new_job_status["progress"]
                item_type = TRAINING_ITEM_A
                item_id = current_job_info.get("id")
                item_group_id = current_job_info.get("group_number")
                docker_image_name = current_job_info.get("image_name")
                gpu_config = "TODO REMOVE"
                configurations = current_job_info.get("configurations")
                item_gpu_count = current_job_info.get("gpu_count")
            else :
                item_status = new_hps_status["status"]
                item_progress = new_hps_status["progress"]
                item_type = TRAINING_ITEM_C
                item_id = current_hps_info.get("id")
                item_group_id = current_hps_info.get("hps_group_id")
                docker_image_name = current_hps_info.get("docker_image_name")
                gpu_config = "TODO REMOVE"
                configurations = current_hps_info.get("configurations")
                item_gpu_count = current_hps_info.get("gpu_count")

            part2.append(time.time() - part2_st)

            part3_st = time.time()
            # TRAINING LIST PART 1 5.0 ~ 7 (단일 0.1~0.2)
            workspace = workspaces.get(training["workspace_id"])[0]
            # workspace_name = workspace["workspace_name"]
            # training["job_status"] = cur_job_status

            start_datetime = workspace["start_datetime"]
            end_datetime = workspace["end_datetime"]

            ports = {"editor": {}, "training": {}}
            jupyter_status = {"editor": {"status": "stop" }, "training": {"status": "stop"}}

            # training_tool = get_training_tool_info(tool_editor_id=training["tool_editor_id"], tool_editor_configurations=training["tool_editor_configurations"], 
            #                                     tool_jupyter_id=training["tool_jupyter_id"], tool_jupyter_configurations=training["tool_jupyter_configurations"],
            #                                     tool_jupyter_gpu_count=training["tool_jupyter_gpu_count"], tool_jupyter_image_name=training["tool_jupyter_image_name"],
            #                                     start_datetime=start_datetime, end_datetime=end_datetime, pod_list=pod_list, service_list=service_list)
            part3.append(time.time() - part3_st)
            # TRAINING LIST PART2 # 0.005 ~ 0.006

            part4_st = time.time()
            # training Status
            training['jupyter'] = jupyter_status
            # training["users"] = db.get_training_users(training_id=training['id'])
            training_users = training_users_list.get(training["id"])
            training["users"] = training_users if training_users is not None else []
            training_users_name = [ user["user_name"] for user in training["users"]]
            training_users_id = [ user["id"] for user in training["users"]]
            training_status = kube.get_training_status(training_id=training["id"], pod_list=pod_list, queue_list=queue_list,
                                                        start_datetime=start_datetime, end_datetime=end_datetime)
            training['status'] = training_status
            training["ports"] = ports
            st2 = time.time()
            # training["permission_level"], *_ = permission_check(user=headers_user, training_info=training,
            #                                                     workspace_users_name=workspace_users_name, training_users_name=training_users_name) #TODO 최적화
            spend_time2 += time.time() - st2
            # if training["permission_level"] == 0:
            #     training["ports"] = {"editor": {}, "training": {"ssh": {"node_port": "private"}}}
            #     training["access"] = 0
            
            st = time.time()
            training["permission_level"] = check_training_access_level(user_id=user_info['id'], training_id=training["id"],
                                                                        manager_id=workspace["manager_id"], owner_id=training["user_id"], access=training["access"], 
                                                                        workspace_users=workspace_users_id, training_users=training_users_id)


            spend_time += time.time() - st
            # TRAINING LIST PART3 # 1.3 ~ 1.5

            if training["id"] in user_bookmark_training_list:
                bookmark = 1
            else:
                bookmark = 0

            # resource from tool


            training_tool_list = all_tool_list.get(training['id'])
            workbench_list = []
            if training_tool_list is not None:
                for training_tool_info in training_tool_list:
                    if training_tool_info["tool_type"] in TOOL_ON_OFF_POSSIBLE_LIST:
                        tool_status = kube.get_training_tool_pod_status(training_tool_id=training_tool_info["id"], pod_list=pod_list, queue_list=queue_list)
                        if tool_status["status"] in KUBER_RUNNING_STATUS:
                            training_resource_object.add_resource_configurations(training_tool_info["configurations"], training_tool_info["gpu_count"])
                            image_id = kube.get_training_tool_item_labels(training_tool_id=training_tool_info["id"], pod_list=pod_list).get("image_id")
                            tool_image_name = None
                            if image_id and image_list_dict.get(int(image_id)):
                                tool_image_name = image_list_dict.get(int(image_id))[0]["name"]
                            workbench_list.append(
                                get_workbench_form(
                                    tool_id=training_tool_info["id"], tool_name=training_tool_info.get("name"), 
                                    tool_type=training_tool_info["tool_type"], tool_configuration=training_tool_info["configurations"],
                                    tool_replica_number=training_tool_info["tool_replica_number"], 
                                    tool_status=tool_status, tool_image_name=tool_image_name)
                            )
                        # if tool_status == KUBE_POD_STATUS_RUNNING:
                        #     workbench_list.append(
                        #         get_workbench_form(
                        #             tool_id=training_tool_info["id"], tool_name=training_tool_info.get("name"), 
                        #             tool_type=training_tool_info["tool_type"], tool_replica_number=training_tool_info["tool_replica_number"], 
                        #             tool_status=tool_status)
                        #     )
            
            part4.append(time.time() - part4_st)
            # resource from job hps

            training_list[training_n] = {
                "id": training["id"],
                "training_name": training["training_name"],
                "description": training["description"],
                "access": training["access"],
                "type": training["type"],
                "user_name": training["user_name"],
                "users" : training["users"],
                "create_datetime": training["create_datetime"],
                # "job_progress": item_progress, #TODO remove
                # "job_status": cur_job_status, #TODO remove
                "job_total_status": {"total": 0, "done": 0, "pending": 0, "running": 0}, # 임시 제거 예정 - Admin 쪽에서 사용
                "hps_total_status": {"total": 0, "done": 0, "pending": 0, "running": 0}, # 임시 제거 예정 - Admin 쪽에서 사용
                "item_progress" : {
                    "type": item_type,
                    "progress": item_progress,# 0~100
                    "status": item_status,
                    "item_id": item_id,
                    "item_group_id": item_group_id,
                    "docker_image_name": docker_image_name,
                    "gpu_config": gpu_config,
                    "configurations": configurations,
                    "gpu_count": item_gpu_count
                },
                "training_tool_list": workbench_list,
                "resource_info": training_resource_object.get_resource_info(),
                "built_in_model_name": training["built_in_model_name"],
                "built_in_description": training["built_in_model_description"],
                "last_run_datetime": training["last_run_datetime"],
                "image": "TODO Remove", #training["image_name"], #TODO remove
                "dataset_name": "TODO Remove", # training["dataset_name"], #TODO remove
                "gpu_count": "TODO Remove", # training["gpu_count"], #TODO remove
                "gpu_config": "TODO Remove", # training["gpu_config"], #TODO remove
                "gpu_network":"TODO Remove", # training["gpu_network"], #TODO remove
                "ports": ports, #TODO remove
                "status": training_status,
                "jupyter": jupyter_status,
                "permission_level": training["permission_level"],
                "workspace_name": training["workspace_name"],
                "workspace_id": training["workspace_id"], # Admin쪽에서 필요함
                "bookmark": bookmark
            }
            

        # print("GET SP TIME", spend_time)
        # print("GET SP TIME2", spend_time2)
        # print("part1", sum(part1))
        # print("part2", sum(part2))
        # print("part3", sum(part3))
        # print("part4", sum(part4))
        return response(status=1, message="OK", result={"list": training_list, "total": len(trainings_count)})


    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Get trainings Error", result=[])

def get_training(training_id, headers_user):
    try:
        if training_id is None: # TODO 전체 조회는 여기서 하지 않도록 확인 후 제거 (2022-10-24 Yeobie)
            trainings_info = db.get_training_list()
            for training_info in trainings_info:
                training_id = training_info["id"]
                training_info["users"] = db.get_training_users(training_id=training_id)
                training_info["ports"] = db.get_training_ports(training_id=training_id)
            return response(status=1, message="trainings Get ", result=trainings_info)
        else:
            training_info = db.get_training(training_id=training_id)
            if training_info["access"] == 1:
                training_info["users"] = []
            else :
                training_info["users"] = db.get_training_users(training_id=training_id, include_owner=False)
            training_info["ports"] = [ port for port in db.get_training_ports(training_id=training_id) if port["training_tool_id"] == training_info["tool_jupyter_id"] ] 
            workspace_name = training_info["workspace_name"]
            training_name = training_info["training_name"]
            tool_jupyter_id = training_info["tool_jupyter_id"]
            
            training_info["node_name_detail"] = common.parsing_node_name(training_info["node_name"])

            # training_info["gpu_model"] = {} if training_info["gpu_model"] is None else training_info["gpu_model"] 

            training_info["status"] = kube.get_training_tool_pod_status(training_tool_id=tool_jupyter_id)["status"]
            training_info["permission_level"], *_ = permission_check(user=headers_user, training_info=training_info)
            return response(status=1, message="training Get ", result=training_info)
    except Exception as e:
        traceback.print_exc()
        #return response(status=0, message="training Get Error : {}".format(e))
        return response(status=0, message="training Get Error")


def user_in_workspace_check(workspace_id, user_id):
    flag = False
    user_workspaces = db.get_user_workspace(user_id=user_id)
    for workspace in user_workspaces:
        if workspace["id"] == workspace_id:
            flag = True
            return flag

    return flag

def create_training_folder(workspace_name, training_name, owner_name):
    training_dir = '{}/{}/trainings/{}'.format(settings.JF_WS_DIR, workspace_name, training_name)
    # mkdir
    try:
        os.mkdir(training_dir)
    except:
        traceback.print_exc()
        common.rm_rf(training_dir)
        os.mkdir(training_dir)
        # return {"r": -14, "msg": 'training {} failed to create training dir.'.format(proj_name)}

    # get uid
    try:
        uid = pwd.getpwnam(owner_name).pw_uid
    except KeyError:
        traceback.print_exc()
        common.rm_rf(training_dir)
        raise Exception('User {} does not exist.'.format(owner_name))

    # get gid
    try:
        gid = grp.getgrnam(owner_name).gr_gid
    except KeyError:
        traceback.print_exc()
        common.rm_rf(training_dir)
        raise Exception('Group {} does not exist.'.format(owner_name))

    # chown uid:gid
    try:
        os.chown (training_dir, uid, gid)
    except:
        traceback.print_exc()
        common.rm_rf(training_dir)
        raise Exception('training {} failed to chown training dir.'.format(owner_name))
    return True

def create_training(training_name, training_type, workspace_id, owner_id, users_id, 
                    gpu_count, gpu_model, node_mode, node_name, node_name_cpu, node_name_gpu,
                    docker_image_id, access, description, built_in_model_id, headers_user):
    from training_tool import create_tool_item
    try:
        
        is_training_good_name(training_name=training_name)

        # Check training Name Already in Workspace
        create_training_info = db.get_training(training_name=training_name, workspace_id=workspace_id)
        if create_training_info is not None:
            if workspace_id == create_training_info["workspace_id"]:
                raise TrainingNameDuplicatedError
                # return response(status=0, message="Create training Name [{}] is Already Exist ".format(training_name))

        # Check Owner or Users Exist Check
        message=""
        owner_info = db.get_user(user_id=owner_id)
        if owner_info is None:
            message += "Owner ID [{}] Not Exist \n".format(owner_id)
        for user_id in users_id:
            user_info = db.get_user(user_id=user_id)
            if user_info is None:
                message += "User ID [{}] Not Exist \n".format(user_id)
        if message:
            return response(status=0, message=message)

        # Check Owner or Users belong to workspace
        message=""
        flag = user_in_workspace_check(workspace_id=workspace_id, user_id=owner_id)
        if flag == False:
            message+="Owner [{}] Not in Workspace \n".format(db.get_user_name(owner_id)["name"])
        for user_id in users_id:
            flag = user_in_workspace_check(workspace_id=workspace_id, user_id=user_id)
            if flag == False:
                message+="User [{}] Not in Workspace \n".format(db.get_user_name(user_id)["name"])
        if message:
            return response(status=0, message=message)

        node_name = common.combine_node_name(node_name_cpu=node_name_cpu, node_name_gpu=node_name_gpu, node_name=node_name)

        # 1. Create training
        insert_training_result, message = db.insert_training(training_name=training_name, training_type=training_type, workspace_id=workspace_id,
                                                            owner_id=owner_id, gpu_count=gpu_count, gpu_model=gpu_model, node_mode=node_mode, node_name=node_name, 
                                                            docker_image_id=docker_image_id,
                                                            access=access, built_in_model_id=built_in_model_id, description=description)

        workspace_info = db.get_workspace(workspace_id=workspace_id)
        workspace_name = workspace_info["workspace_name"]
        owner_name = db.get_user(user_id=owner_id)["name"]
        create_training_folder(workspace_name=workspace_name, training_name=training_name, owner_name=owner_name)
        if not insert_training_result:
            return response(status=0, message="Create training fail : {}".format(message))

        # 2. Insert Users in training
        training_info = db.get_training(training_name=training_name, workspace_id=workspace_id)
        training_id = training_info["id"]
        users_id.append(owner_id)
        trainings_id = [training_id]*len(users_id)
        insert_user_training_result, message = db.insert_user_training_s(trainings_id=trainings_id, users_id=users_id)
        create_tool_item(training_id=training_id)

        update_training_etc(workspace_name=workspace_name, training_list=[training_info])

        if not insert_user_training_result:
            return response(status=0, message="Insert Users in training fail : {}".format(message))


        db.logging_history(
            user=headers_user, task='training',
            action='create', workspace_id=workspace_id,
            task_name='[{}] {}'.format(training_type, training_name)
        )
        return response(status=1, message="Created training [{}]".format(training_name))
    
    except CustomErrorList as ce:
        raise ce
    except Exception as e:
        traceback.print_exc()
        raise e
        #return response(status=0, message="Insert training Exception Fail : {}".format(e))

def delete_training_folder(workspace_name, training_name):
    flag = True
    # TODO training_name이 빈 값이 들어오는 경우에 대한 예외 처리 필요
    is_training_good_name(training_name=training_name)

    training_dir = '{}/{}/trainings/{}'.format(settings.JF_WS_DIR, workspace_name, training_name)
    training_etc_dir = '{}/{}/{}'.format(JF_ETC_DIR, workspace_name, training_name)
    training_etc_jupyter_dir = '{}/{}/{}{}'.format(JF_ETC_DIR, workspace_name, training_name, JUPYTER_FLAG)
    try:
        common.rm_rf(training_dir)
        common.rm_rf(training_etc_dir, ignore_errors=True)
        common.rm_rf(training_etc_jupyter_dir, ignore_errors=True)
    except Exception as e:
        traceback.print_exc();
        return False, e
    return True, ""

def delete_training(id_list, headers_user):

    # Check training Status = Only Stop
    # delete training
    # delete training user (AUTO)
    # delete training port (AUTO)
    # delete training folder

    ## Not Exist training check ?

    try:
        message = ''
        check_flag = True
        delete_flag = True
        status = 0

        pod_list = kube.get_list_namespaced_pod()
        for training_id in id_list:
            training_info = db.get_training(training_id=training_id)
            training_tool_list = db.get_training_tool_list(training_id=training_id)
            workspace_name = training_info["workspace_name"]
            training_name = training_info["training_name"]
            
            is_training_good_name(training_name=training_name)

            training_status_info = kube.get_training_status(training_id=training_id, pod_list=pod_list)
            all_tool_pod_status = kube.get_training_all_tool_pod_status(training_tool_list=training_tool_list, pod_list=pod_list)

            if training_status_info["status"] != "stop":
                message += "training Status is not Stop : [{}]\n".format(training_status_info["status"])
                check_flag = False

            for k, v in all_tool_pod_status.items():
                if v["status"] not in ["stop", "expired"]:
                    message += "training [{}] Status is not Stop : [{}]\n".format(k, v["status"])
                    check_flag = False    

            # if jupyter_status_info["status"] not in ["stop", "expired"]:
            #     message += "training Jupyter(GPU) Status is not Stop : [{}]\n".format(jupyter_status_info["status"])
            #     check_flag = False

            # if editor_jupyter_status_info["status"] not in ["stop", "expired"]:
            #     message += "training Jupyter(CPU) Status is not Stop : [{}]\n".format(jupyter_status_info["status"])
            #     check_flag = False

        if not check_flag:
            return response(status=0, message=message)

        for training_id in id_list:
            training_info = db.get_training(training_id=training_id)
            check_result, res = permission_check(user=headers_user, training_info=training_info, permission_level=2)
            if not check_result:
                message += "permission error : {}".format(training_info['training_name'])
                delete_flag = False
                continue
            # if training_info['user_name'] != headers_user and headers_user != 'root' and training_info['manager_id'] != headers_user:
            #     message += "permission error : {}".format(training_info['training_name'])
            #     delete_flag = False
            #     continue
                #return response(status=0, message="permission error")
            if training_info is not None:
                training_name = training_info["training_name"]
                training_type = training_info["type"]
                workspace_name = training_info["workspace_name"]
                db.delete_training(training_id=training_id)
                delete_folder_result, for_message = delete_training_folder(training_name=training_name, workspace_name=workspace_name)

                if delete_folder_result == False:
                    message += "Delete Folder Fail"
                    #message += "Delete Folder Fail : {}".format(for_message)
                    delete_flag = False
                    continue
                else:
                    db.logging_history(
                        user=headers_user, task='training',
                        action='delete', workspace_id=training_info['workspace_id'],
                        task_name='[{}] {}'.format(training_type, training_name)
                    )
                    message += "Delete training : {}\n".format(training_name)
            else:
                message += "Not found training id : {}\n".format(training_id)
                delete_flag = False
                continue
        if delete_flag :
            status = 1
        return response(status=status, message=message)
    except CustomErrorList as ce:
        raise ce
    except Exception as e:
        # traceback.print_exc()
        # return response(status=0, message="Delete training Fail : {}".format(e))
        raise e

def update_training_folder_name(workspace_name, cur_training_name=None, new_training_name=None):
    flag = False
    if new_training_name is not None:
        try:
            cur_training_dir = '{}/{}/trainings/{}'.format(settings.JF_WS_DIR, workspace_name, cur_training_name)
            new_training_dir = '{}/{}/trainings/{}'.format(settings.JF_WS_DIR, workspace_name, new_training_name)
            os.rename(src=cur_training_dir,dst=new_training_dir)
            flag = True, ""
        except Exception as e:
            traceback.print_exc()
            return False, e
    return flag, ""

def update_training_folder_owner(workspace_name, training_name, owner_name):
    flag = False
    training_dir = '{}/{}/trainings/{}'.format(settings.JF_WS_DIR, workspace_name, training_name)
    # get uid
    try:
        uid = pwd.getpwnam(owner_name).pw_uid
    except KeyError:
        traceback.print_exc()
        raise Exception('User {} does not exist.'.format(owner_name))

    # get gid
    try:
        gid = grp.getgrnam(owner_name).gr_gid
    except KeyError:
        traceback.print_exc()
        raise Exception('Group {} does not exist.'.format(owner_name))

    # chown uid:gid
    try:
        os.chown (training_dir, uid, gid)
    except:
        traceback.print_exc()
        raise Exception('training {} failed to chown training dir.'.format(owner_name))
    flag = True
    return flag

def update_training(training_id, training_name, owner_id, users_id, 
                    gpu_count, gpu_model, node_mode, node_name, 
                    docker_image_id, access, description, headers_user):
    """
        Description : Training Update 함수
                      기능적으로 변경 가능 항목
                        - training name 
                            - 정책적으로 제공하지 않음 - 2022-11-01 Yeobie
                            - 동작 중에 있는 작업이 있으면 변경 불가능
                        - owner 
                            - 동작 중에 있는 작업이 있으면 변경 불가능
                        - users
                            - 항상 가능
                        - training access type
                            - 항상 가능
    """
    try:
        cur_training_info = db.get_training(training_id=training_id)
        if cur_training_info is None:
            raise TrainingItemNotExistError

        workspace_name = cur_training_info["workspace_name"]
        workspace_id = cur_training_info["workspace_id"]
        cur_access = cur_training_info["access"]
        cur_training_name = cur_training_info["training_name"]
        cur_owner_id = cur_training_info["user_id"]
        cur_docker_image_id = cur_training_info["image_id"]
        cur_gpu_count = cur_training_info["gpu_count"]
        cur_descripiton = cur_training_info["description"]
        tool_editor_id = cur_training_info["tool_editor_id"]
        pod_list = kube.get_list_namespaced_pod()

        if cur_training_name != training_name:
            # Training 아이템의 이름 변경은 현재 정책 상 지원하지 않음. (2022-11-01 Yeobie)
            # 기능적으로는 존재함 - 해당 Training 에서 실행 중 아이템 / 해당 Training을 지정한 배포가 존재 시 변경 시 문제 발생 가능함
            raise TrainingNameChangeNotSupported

        log_desc_arr = []
        param_users_id = users_id.copy()
        if cur_descripiton != description: log_desc_arr.append("Description")
        if cur_gpu_count != gpu_count: log_desc_arr.append("GPU Usage")
        if cur_access != access: log_desc_arr.append("Access Type")
        if cur_owner_id != owner_id: log_desc_arr.append("Owner")

        # Admin, manager, Owner Work
        gpu_count_change = False if gpu_count == cur_gpu_count else True
        docker_image_change = False if docker_image_id == cur_docker_image_id else True
        owner_change = False if owner_id == cur_owner_id else True

        cur_user_list = db.get_training_users(training_id=training_id)
        # Pod Status Check
        # stop status = GPU COUNT CHANGE, DATASET CHANGE, DOCKER IMAGE CHANGE, OWNER CHANGE
        # if docker_image_change or owner_change:
        if owner_change:
            # Owner 변경시에만 동작중인것 있으면 불가.
            start_datetime = cur_training_info["start_datetime"]
            end_datetime = cur_training_info["end_datetime"]
            training_status_info = kube.get_training_status(training_id=training_id)
            editor_jupyter_status = kube.get_training_tool_pod_status(training_tool_id=tool_editor_id, pod_list=pod_list) 
            
            if training_status_info["status"] != "stop" and gpu_count_change:
                return response(status=0, message="training Status must be [stop] training : [{}]".format(training_status_info["status"]))
            if editor_jupyter_status["status"] != "stop" and owner_change:
                return response(status=0, message="training Status must be [stop] Jupyter(CPU) : [{}]".format(editor_jupyter_status["status"]))

        # TODO Projec Name Exist ?
        if cur_training_name != training_name:
            change_name_training_info = db.get_training(training_name=training_name, workspace_id=workspace_id)
            if change_name_training_info is not None:
                if workspace_id == change_name_training_info["workspace_id"]:
                    return response(status=0, message="Update training Name [{}] is Already Exist ".format(training_name))


        # Owner User Exist
        message=""
        owner_info = db.get_user(user_id=owner_id)
        if owner_info is None:
            message += "Owner ID [{}] Not Exist \n".format(owner_id)
        for user_id in users_id:
            user_info = db.get_user(user_id=user_id)
            if user_info is None:
                message += "User ID [{}] Not Exist \n".format(user_id)
        if message:
            return response(status=0, message=message)

        message=""
        flag = user_in_workspace_check(workspace_id=workspace_id, user_id=owner_id)
        if flag == False:
            message+="Owner [{}] Not in Workspace \n".format(db.get_user_name(owner_id)["name"])
        for user_id in users_id:
            flag = user_in_workspace_check(workspace_id=workspace_id, user_id=user_id)
            if flag == False:
                message+="User [{}] Not in Workspace \n".format(db.get_user_name(user_id)["name"])
        if message:
            return response(status=0, message=message)



        # training Update
        # training Folder MV, chown
        # training Port List update
        # training Users List update

        update_result, message = db.update_training(training_id=training_id, training_name=training_name, user_id=owner_id, 
                            gpu_count=gpu_count, gpu_model=gpu_model, node_mode=node_mode, node_name=node_name, 
                            docker_image_id=docker_image_id, access=access, description=description)
        if update_result == False:
            return response(status=0, message="training Update Fail")
            #return response(status=0, message="training Update Fail : {}".format(message))
        if training_name != cur_training_name:
            flag, message = update_training_folder_name(workspace_name=workspace_name, cur_training_name=cur_training_name, new_training_name=training_name)
            if flag == False:
                #TODO Rename Fail Case ?? Rollback Case
                return response(status=0, message="training Folder Rename Fail")
                #return response(status=0, message="training Folder Rename Fail : {}".format(message))

        if owner_change:
            owner_name = db.get_user(user_id=owner_id)["name"]
            flag = update_training_folder_owner(workspace_name=workspace_name, training_name=training_name, owner_name=owner_name)
            if flag == False:
                #TODO chown Fail case ?? Rollback case
                return response(status=0, message="training Owner chagne Fail ")

        # delete_user_list = []
        for cur_user in cur_user_list:
            if cur_user["id"] not in users_id:
                # delete_user_list.append(cur_user)
                db.delete_user_training(training_id=training_id, user_id=cur_user["id"])

        users_id.append(owner_id)
        trainings_id = [training_id] * len(users_id)
        insert_user_training_s_result, message = db.insert_user_training_s(trainings_id=trainings_id, users_id=users_id)
        if insert_user_training_s_result == False:
            return response(status=0, message="Update training Users Fail")
            #return response(status=0, message="Update training Users Fail : {}".format(message))

        ## SSH sync
        if (cur_access == 0 or access == 0):
            owner_name = db.get_user_name(owner_id)["name"]
            training_list = [db.get_training(training_id=training_id)]
            update_training_etc(workspace_name=workspace_name, training_list=training_list)

        match_count = 0
        for user_id in param_users_id:
            for cur_user in cur_user_list:
                if cur_user['id'] == user_id:
                    match_count += 1
                    break

        if match_count != len(users_id): log_desc_arr.append('Users') # users
        db.logging_history(
            user=headers_user, task='training',
            action='update', workspace_id=workspace_id,
            task_name='[{}] {}'.format(cur_training_info["type"], cur_training_info["training_name"]), 
            update_details='/'.join(log_desc_arr)
        )
        return response(status=1, message="Update training OK")
    except CustomErrorList as ce:
        raise ce
    except Exception as e:
        raise e
        # traceback.print_exc()
        # return response(status=0, message="training Update Fail Except : {}".format(e))


def training_job_into_queue(training, group_number=None):
    result = None
    try:
        training_id = training['id']

        # with JfLock(lock):
        job_list = db.get_training_group_number_jobs(training_id=training_id, group_number=group_number)
        jobs = []
        id_list = []
        for job in job_list:
            #TODO QUEUE to DB
            id_list.append({"training_id": training_id, "job_id": job["id"]})
        insert_pod_queue = db.insert_pod_queues(training_and_job_id_list=id_list) # [{training_id: x, job_id: y}]
        print("insert Queue result : ", insert_pod_queue)
        result = {"r": 1 , "message" : "Jobs append in Queue "}
    except:
        traceback.print_exc()
        result = {"r": 0, "message": "container_create fail"}
    return result

def check_training_is_running(training_id):
    return True
    status = kube.get_training_status(training_id=training_id)
    if status['status'] not in KUBER_NOT_RUNNING_STATUS:
        raise TrainingAlreadyRunningError


def run_training(training_id, user, gpu_model=None, group_number=None):
    #TODO 삭제 예정
    try:
        training = db.get_training(training_id=training_id)

        check_result, res = permission_check(user=user, training_info=training, permission_level=1)
        if not check_result:
            return res
        training['gpu_model'] = gpu_model # GTX 1080 or RTX 2080 ...
        
        check_training_is_running(training_id)

        if training["type"] in [TRAINING_TYPE_A, TRAINING_TYPE_D] or training["type"] in TRAINING_BUILT_IN_TYPES:
            print("into queue")
            ret = training_job_into_queue(training=training, group_number=group_number)
            print("into queue check", ret)
        elif training["type"] == TRAINING_TYPE_B:
            check_training_is_running(training_id)
            run_jupyter(training_id=training_id, headers_user=user)
            pass


        if ret['r'] == 1:
            # last run update
            db.update_training_run(training_id=training["id"])
            res = response(status=1, message="Run Start")
        else:
            res = response(status=0, message=ret["message"])
        print("???!@#",res)
        return res
    except CustomErrorList as ce:
        traceback.print_exc()
        return response(status=0, message=ce.message)
    except Exception as e:
        traceback.print_exc()
    return response(status=0, message="Run Error : {}".format(e))


def stop_training(training_id, user, editor=False):
    from training_hyperparam import stop_hpss
    from training_job import stop_jobs
    try:
        training_info = db.get_training(training_id=training_id)
        check_result, res = permission_check(user=user, training_info=training_info, permission_level=1)
        if not check_result:
            return res
        if training_info is None:
            return response(status=0, message="Not Found training")

        else:
            res = ""
            # if training_info["type"] == TRAINING_TYPE_B:
            #     # stop_jupyter(training_id=training_id, headers_user=user)#TODO REMOVE
            if training_info["type"] in [TRAINING_TYPE_A, TRAINING_TYPE_D] or training_info["type"] in TRAINING_BUILT_IN_TYPES:
                # Queue 삭제, DB 삭제
                stop_jobs(training_id=training_id)
                stop_hpss(training_id=training_id)

            kube.kuber_item_remove(training_id=training_id)
            # stop_jupyter(training_id=training_id, headers_user=user, editor=True)#TODO REMOVE
            return response(status=1, message="Stop {} training".format(training_info["training_name"]))
    except:
        traceback.print_exc()
    return response(status=0, message="fail")

def get_file_list_from_src(file_extension, training_id=None, workspace_name=None, training_name=None):
    if type(file_extension) != type([]):
        file_extension = [ file_extension ]
        
    file_list = []
    if workspace_name is None or training_name is None:
        training_info = db.get_training(training_id=training_id)
        workspace_name = training_info['workspace_name']
        training_name = training_info['training_name']
    
    # training_path = '{}/{}/trainings/{}/src'.format(JF_WS_DIR, workspace_name, training_name)
    training_src_path = JF_TRAINING_SRC_PATH.format(workspace_name=workspace_name, training_name=training_name)
    for (path, dir, files) in os.walk(training_src_path):                      
        # Log ignore
        if JF_TRAINING_JOB_LOG_DIR_POD_PATH == path.replace(training_src_path,''):
            continue
        if ".ipynb_checkpoints" in path:
            continue
        # res_list.append(path)
        for filename in files:
            if filename.split(".")[-1] in file_extension:
                file_list.append("{}{}/{}".format(JF_TRAINING_SRC_POD_PATH, path, filename).replace(training_src_path,''))
    return file_list 

def get_run_code_list_from_src(training_id=None, workspace_name=None, training_name=None):
    return get_file_list_from_src(training_id=training_id, workspace_name=workspace_name, training_name=training_name, file_extension=["py", "sh"])


def get_sample_code():
    return [
        "================EXAMPLE CODE=================",
        "/examples/hps_fast_test.py",
        "/examples/hps_fast_test_mutiple_param.py",
        "/examples/pytorch_synthetic_benchmark.py",
        "/examples/pytorch_synthetic_benchmark.sh",
        "/examples/pytorch_synthetic_benchmark_ddp.sh",
        "/examples/tensorflow2_mnist_hps.py",
        "/examples/pod_resource_checker.py",
        "============================================="
    ]

# ROUTER
@ns.route('', methods=['GET', 'POST', 'PUT'])
@ns.route('/<id_list>', methods=['DELETE'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class Training(CustomResource):
    @ns.expect(training_parser_get)
    @token_checker
    @workspace_access_check(training_parser_get)
    def get(self):
        """Training Key - Value Page 조회"""
        args = training_parser_get.parse_args()
        # training_id = args['training_id']

        page = args["page"]
        size = args["size"]
        search_key = args["search_key"]
        search_value = args["search_value"]
        choosen_workspace = args["workspace_id"]
        sort = args["sort"]
        training_type = args["training_type"]

        # try:
        #     check_inaccessible_workspace(user_id=self.check_user_id(), workspace_id=choosen_workspace)
        # except CustomErrorList as ce:
        #     traceback.print_exc()
        #     return self.send(response(status=0, **ce.response()))

        res = get_training_list(search_key=search_key, size=size, page=page, search_value=search_value,
                choosen_workspace=choosen_workspace, headers_user=self.check_user(), sort=sort, training_type=training_type)
        return self.send(res)

    @ns.expect(training_parser_post)
    @token_checker
    @workspace_access_check(training_parser_post)
    def post(self):
        """
            TRAINING 생성
            ---
            # Input example
                {
                    "access": 1,
                    "description": "aaaa",
                    "docker_image_id": 1,
                    "gpu_count":0,
                    "gpu_model": {"NVIDIA-GeForce-GTX-1080-Ti": ["jf-node-02"]},
                    "node_mode": 0,
                    "node_name": {"jf-node-02": {"cpu_cores_limit_per_gpu": 1, "ram_limit_per_gpu": 1, "cpu_cores_limit_per_pod": 1, "ram_limit_per_pod": 1}}, # 삭제 예정
                    "node_name_cpu": {"cpu-select-node": {"cpu_cores_limit_per_pod": 1, "ram_limit_per_pod": 1}},
                    "node_name_gpu": {"gpu-select-node": {"cpu_cores_limit_per_gpu": 1, "ram_limit_per_gpu": 1}},
                    "owner_id": 2,
                    "training_name": "c-test",
                    "training_type": "advanced",
                    "workspace_id": 1
                }
            ---
            # returns
                dict (
                    status (int) : 0 = 실패, 1 = 성공 
                    result : None 
                    message (str) : status = 0 일 때, 담기는 매세지
                )
        """
        try:
            args = training_parser_post.parse_args()

            training_name = args["training_name"]
            training_type = args["training_type"]
            built_in_model_id = args["built_in_model_id"]
            workspace_id = args["workspace_id"]
            owner_id = args["owner_id"]
            users_id = args["users_id"]
            if users_id is None:
                users_id = []
            gpu_count = args["gpu_count"]
            gpu_model = args["gpu_model"]
            node_mode = args["node_mode"]
            node_name = args["node_name"]
            node_name_cpu = args["node_name_cpu"]
            node_name_gpu = args["node_name_gpu"]
            docker_image_id = args["docker_image_id"]
            access = args["access"]
            description = args["description"]

            res = create_training(training_name=training_name, training_type=training_type, workspace_id=workspace_id,
                                        owner_id=owner_id, users_id=users_id, 
                                        gpu_count=gpu_count, gpu_model=gpu_model, node_mode=node_mode, 
                                        node_name=node_name, node_name_cpu=node_name_cpu, node_name_gpu=node_name_gpu,
                                        docker_image_id=docker_image_id,
                                        access=access, description=description,
                                        built_in_model_id=built_in_model_id,
                                        headers_user=self.check_user())


            return self.send(res)
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Create Training Error {}".format(e)))

    @ns.param('id_list', 'id list')
    @token_checker
    @training_access_check(allow_max_level=3)
    def delete(self, id_list):
        try:
            id_list = id_list.split(',')
            res = delete_training(id_list, self.check_user())
            return self.send(res)
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Training Delete Error : {}".format(e)))


    @ns.expect(training_parser_update)
    @token_checker
    @training_access_check(training_parser_update, allow_max_level=3)
    def put(self):
        """
            TRAINING 수정
            ---
            # Input example
                {
                    "training_id": 153,
                    "access": 1,
                    "description": "aaaa",
                    "docker_image_id": 1,
                    "gpu_count":0,
                    "gpu_model": {"NVIDIA-GeForce-GTX-1080-Ti": ["jf-node-02"]},
                    "node_mode": 0,
                    "node_name": {"jf-node-02": {"cpu_cores_limit_per_gpu": 2, "ram_limit_per_gpu": 2, "cpu_cores_limit_per_pod": 2, "ram_limit_per_pod": 2}},
                    "owner_id": 3,
                    "training_name": "c-test",
                    "training_type": "advanced",
                    "workspace_id": 1
                }
            ---
            # returns
                dict (
                    status (int) : 0 = 실패, 1 = 성공 
                    result : None 
                    message (str) : status = 0 일 때, 담기는 매세지
                )
        """
        try:
            args = training_parser_update.parse_args()
            
            training_id = args["training_id"]
            training_name = args["training_name"]
            built_in_model_id = args["built_in_model_id"]
            owner_id = args["owner_id"]
            users_id = args["users_id"]
            if users_id is None:
                users_id = []
            # Tool 개념이 들어가면서 Training Update시에는 관리하지 않음. (다른 곳에서 수정을 하는 구조.) 2022-11-01 Yeobie
            gpu_count = args["gpu_count"] 
            gpu_model = args["gpu_model"]
            node_mode = args["node_mode"]
            node_name = args["node_name"]
            docker_image_id = args["docker_image_id"] 

            access = args["access"]
            description = args["description"]

            print("call user permission level ",self.permission_level) # from deco

            res = update_training(training_id=training_id, training_name=training_name, owner_id=owner_id, users_id=users_id,
                                        gpu_count=gpu_count,  gpu_model=gpu_model, node_mode=node_mode, node_name=node_name, 
                                        docker_image_id=docker_image_id, access=access, description=description, headers_user=self.check_user())
            return self.send(res)
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            return self.send(response(status=0, message="Training Update Error : {}".format(e)))


@ns.route('/<int:training_id>', methods=['GET'], doc={'params': {'training_id': 'training ID'}})
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class TrainingSimple(CustomResource):
    @token_checker
    def get(self, training_id):
        """프로젝트 ID 단순 조회"""
        training_id = training_id
        res = get_training(training_id=training_id, headers_user=self.check_user())
        # db.request_logging(self.check_user(), 'trainings/'+str(training_id), 'get', str(args), res['status']) #TODO args 없음
        return self.send(res)

@ns.route('/detail/<int:training_id>', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class TrainingDetail(CustomResource):
    @token_checker
    @training_access_check()
    def get(self, training_id):
        """training 상세 조회"""
        training_id = training_id
        res = get_training_detail_info(training_id=training_id, headers_user_id=self.check_user_id())
        # db.request_logging(self.check_user(), 'trainings/'+str(training_id), 'get', str(args), res['status']) #TODO args 없음
        return self.send(res)


@ns.route("/stop", methods=["GET"])
class TrainingStop(CustomResource):
    @token_checker
    @ns.expect(training_id_parser)
    def get(self):
        """프로젝트 Stop"""
        args = training_id_parser.parse_args()
        training_id = args['training_id']
        res = stop_training(training_id=training_id, user=self.check_user())
        db.request_logging(self.check_user(), 'trainings/stop', 'get', str(args), res['status'])
        return self.send(res)


@ns.route("/run_job", methods=["POST"])
class RunJob(CustomResource):
    @token_checker
    @ns.expect(training_run_job_parser)
    def post(self):
        """JOB Run"""
        args = training_run_job_parser.parse_args()

        jobs = args["jobs"]
        res = create_job(jobs_info=jobs, creator=self.check_user())
        # training_id = args['training_id']
        # job_name = args['job_name']
        # docker_image_id = args['docker_image_id']
        # dataset_path = args['dataset_path']
        # dataset_mount_path = args['dataset_mount_path']
        # run_code = args['run_code']
        # parameter = args['parameter']
        db.request_logging(self.check_user(), 'trainings/run_job', 'post', str(args), res['status'])
        return self.send(res)

@ns.route("/stop_job", methods=["GET"])
class StopJob(CustomResource):
    @token_checker
    @ns.expect(stop_job_parser)
    def get(self):
        """JOB STOP"""
        args = stop_job_parser.parse_args()

        job_id = args["job_id"]
        res = stop_job(job_id=job_id, headers_user=self.check_user())
        db.request_logging(self.check_user(), 'trainings/stop_job', 'get', str(args), res['status'])
        return self.send(res)



def get_tensorboard_url(job_id, protocol, headers_user):
    """Returns None on failure."""
    #TODO Built-in 이면 안켜져 있을 경우 jupyter  자동 실행 필요.
    try:
        job_info = db.get_job(job_id=job_id)
        training_id = job_info["training_id"]
        training_info = db.get_training(training_id=training_id)
        check_result, res = permission_check(user=headers_user, training_info=training_info, permission_level=1)
        if not check_result:
            return res

    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Get tensorboard url Permission Check Error")
        #return response(status=0, message="Permission Check Error {}".format(str(e)))

    # try:
    #     run_result = run_jupyter(training_id=training_id, editor=True, headers_user=headers_user)
    #     if run_result["message"] != "Already running":
    #         return response(status=1, message="Tensorboard Pod preparing Please try later.")

    # except Exception as e:
    #     traceback.print_exc()
    #     return response(status=0, message="Tensorboard Pod run error : {}".format(e))

    try:
        jupyter_pod_name = kube.find_kuber_item_name(item_list=kube.kube_data.get_pod_list(), training_id=training_id, editor=True)[0]
    except Exception as e:
        traceback.print_exc()
        print("Tensorboard Pod Not Running ", e)
        return response(status=0, message="Tensorboard Pod Not Running")
        #return response(status=0, message="DB ERROR {}".format(str(e)))
    try:
        node_name = kube.get_pod_node_name(training_id=training_id, editor=True)
        print("get tensorboard_url node_name ", node_name)
        jupyter_ip = kube.get_node_ip(node_name, external=True)
        nginx_port = kube.get_nginx_port(protocol=protocol)
        if settings.EXTERNAL_HOST_REDIRECT == True:
            jupyter_ip = jupyter_ip
        else :
            jupyter_ip = "{}:{}".format(jupyter_ip, nginx_port)

        # print('==============================')
        # print('host_cmd: ', host_cmd)
        # print('nginx_port : ', nginx_port)
        # print('==============================')
        # cmd_res = None
        # for i in range(100):
        #     try:
        #         cmd_res, *_ = common.launch_on_host(host_cmd)
        #         break
        #     except :
        #         print("URL GET Retry")
        #     time.sleep(0.1)
        checkpoint_path = get_job_checkpoint_path(job_id=job_id, in_jupyter=True)
        url = "http://0.0.0.0/tensorboard/{jupyter_pod_name}/#scalars&regexInput={checkpoint_path}".format(jupyter_pod_name=jupyter_pod_name, checkpoint_path=checkpoint_path)
        url = url.replace("http://0.0.0.0/","http://{jupyter_ip}/".format(jupyter_ip=jupyter_ip))
        url = url.replace("http://", "{protocol}://".format(protocol=protocol))
        # url = "http://{}/?{}".format(jupyter_url,token)
    except Exception as e:
        traceback.print_exc()
        print("KUBE EXEC ", e)
        return response(status=0, message="Tensorboard is not running : {}".format(str(e)))
    return response(status=1, result={"url":url})



@ns.route("/tensorboard_url", methods=["GET"])
class TensorboardURL(CustomResource):
    @token_checker
    @ns.expect(job_tensorboard_url_get_parser)
    def get(self):
        """Gets Tensorboard URL including token for browser access."""

        args = job_tensorboard_url_get_parser.parse_args()
        job_id = args["job_id"]
        protocol = args["protocol"]

        res = get_tensorboard_url(job_id=job_id, protocol=protocol, headers_user=self.check_user())
        # if jupyter_url is not None:
        #     res = {"result":{'url':jupyter_url}, "status":1, "message":"OK"}
        # else:
        #     res = {"result":None, "status":0, "message":"jupyter server is not running."}

        db.request_logging(self.check_user(), 'trainings/jupyter_url', 'get', str(args), res['status'])
        return self.send(res)

def get_hyper_dataset_parameter(parameter, built_in_model_id):

    hyper_parameter = {}
    dataset_parameter = {}
    job_param_dict = common.parameter_str_to_dict(parameter)
    if built_in_model_id is None:
        return job_param_dict, {}
    built_in_parameter_list = db.get_built_in_model_parameter(built_in_model_id)



    for k, v in job_param_dict.items():
        if k in [built_in_param["parameter"] for built_in_param in built_in_parameter_list ]:
            hyper_parameter[k] = v
        else :
            dataset_parameter[k] = v
    return hyper_parameter, dataset_parameter

def group_status(status_counting):
    group_status = "done"
    if status_counting["running"] > 0:
        group_status = "running"
    elif status_counting["pending"] > 0:
        group_status = "pending"
    return group_status

def get_jobs(search_key=None, size=None, page=None, search_value=None, training_id=None, headers_user=None, sort=None):
    job_list = []
    training_status = "unknown"

    try:
        job_list = db.get_job_list(search_key=search_key, size=size, page=page, search_value=search_value, training_id=training_id, sort=sort)
        total = db.get_job_list(search_key=search_key, size=None, page=None, search_value=search_value, training_id=training_id, sort=sort)

        training_info = db.get_training(training_id=training_id)
        training_name = training_info["training_name"]
        workspace_name = training_info["workspace_name"]
        training_description = training_info["description"]
        training_type = training_info["type"]
        training_access = training_info["access"]
        training_gpu_count = training_info["gpu_count"]
        training_built_model_name = training_info["built_in_model_name"]
        pod_list = kube_data.get_pod_list(try_update=False)
        service_list = kube_data.get_service_list(try_update=False)

        # training_status = kube.get_training_status(training_id=training_info["id"], pod_list=pod_list,
        #                                             start_datetime=training_info["start_datetime"], end_datetime=training_info["end_datetime"])["status"]
        
        prv_job_name = ""
        job_group_list = {}
        job_group = {}
        for job in job_list:
            if job_group_list.get(job["group_number"]) is None:
                job_group_list[job["group_number"]] = {
                    "name": job["name"],
                    "gpu_count": job["gpu_count"],
                    "group_id": job["group_number"],
                    "status": "",
                    "status_counting": {"running": 0, "pending": 0, "done": 0, "error": 0},
                    "options" : {"gpu_acceleration": job["gpu_acceleration"], "um": job["unified_memory"] ,"rdma": job["rdma"]},
                    "docker_image_name" : job["image_name"],
                    "dataset_name" : job["dataset_name"],
                    "run_code" : job["run_code"],
                    "creator": job["runner_name"],
                    "jobs": [],
                    "create_datetime": job["create_datetime"]
                }
            
            
            if training_type in TRAINING_BUILT_IN_TYPES:
                hyper_parameter, dataset_parameter = get_hyper_dataset_parameter(parameter=job["parameter"], built_in_model_id=training_info["built_in_model_id"])
                job["hyper_parameter"] = hyper_parameter
                job["dataset_parameter"] = dataset_parameter
            else :
                job["hyper_parameter"] = common.parameter_str_to_dict(job["parameter"])
            
            status_counting = job_group_list[job["group_number"]]["status_counting"]
            status = kube.get_job_status(job_id=job["id"], pod_list=pod_list)

            if status["status"] not in ["pending", "done"]:
                status_counting["running"] += 1
            else :
                status_counting[status["status"]] += 1

            log_path = get_job_log_file_path(job_id=job["id"], workspace_name=workspace_name, training_name=training_name)
            job_group_list[job["group_number"]]["status"] = group_status(status_counting)
            jobs = job_group_list[job["group_number"]]["jobs"]
            # log_file_exist = True if os.system("ls {} > /dev/null 2>&1".format(log_path)) == 0 else False
            log_file_exist = os.path.isfile(log_path) 
            jobs.append({
                    "id": job["id"],
                    "hyper_parameter": common.parameter_dict_to_list(job.get("hyper_parameter")),
                    "dataset_parameter" : common.parameter_dict_to_list(job.get("dataset_parameter")),
                    "start_datetime": job["start_datetime"],
                    "end_datetime": job["end_datetime"],
                    "index": job["job_group_index"],
                    "status": status,
                    "log_file": log_file_exist
                })

        for k, v in job_group_list.items():
            v ["jobs"].reverse()

        training_tool_info = db.get_training_tool(training_id=training_id, tool_type=TOOL_JOB_ID)

        result = {
            "list": list(job_group_list.values()),
            "total": len(list(job_group_list.values())),
            "training_tool": get_training_info(db_training_info=training_info, pod_list=pod_list, service_list=service_list),
            "training_tool_info": {
                "tool_id": training_tool_info["id"],
                "docker_image_name": training_tool_info["docker_image_name"],
                "gpu_count": training_tool_info["gpu_count"],
                "gpu_model": training_tool_info["gpu_model"]
            }
            # "status": training_status, # expired? check
            # "training_name": training_name,
            # "training_id": training_id,
            # "training_description": training_description,
            # "training_type": training_type,
            # "training_gpu_count": training_gpu_count,
            # "training_built_in_model_name": training_built_model_name,
            # "access": training_access,
            # "tensorboard_status": kube.get_training_tool_pod_status(training_tool_id=training_info["tool_editor_id"], pod_list=pod_list)
        }
        # result.update(get_training_info(db_training_info=training_info, pod_list=pod_list, service_list=service_list))
        # return response(status=1, result={"list":job_list, "total":len(total), "status": training_status})
        # if result["tensorboard_status"]["status"] == "stop" and training_type in TRAINING_BUILT_IN_TYPES:
        #     run_result = run_jupyter(training_id=training_id, editor=True, headers_user=headers_user)
        return response(status=1, result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, result={"list":job_list, "total":len(total), "status": training_status}, message=str(e))

def create_job(jobs_info, creator, limit=None):
    # jobs_info = {training_id, job_name, docker_image_id, dataset_path, dataset_mount_path, run_code, parameter, creator}
    # Job limit (Check number of job_group is running )
    # get job group number From training Or Job table
    # insert jobs in job table
    # run training
    try:
        training_id = jobs_info[0]["training_id"]
        
        

        training = db.get_training(training_id=training_id)
        tool_info = db.get_training_tool(training_id=training_id, tool_type=TOOL_TYPE_ID[TOOL_JOB_KEY])

        check_result, res = permission_check(user=creator, training_info=training, permission_level=1)
        if not check_result:
            return res

        # if gpu_model is None:
        #     gpu_model = tool_info['gpu_model']

        workspace_name = training['workspace_name']
        workspace_id = training['workspace_id']
        training_name = training['training_name']
        
        check_training_is_running(training_id)

        duplicate_result, message = db.get_job_duplicate_name(training_id=training_id, job_name=jobs_info[0]["job_name"])
        if duplicate_result is None:
            return response(status=0, message="check duplicate job error")
            #return response(status=0, message="check duplicate job error : {}".format(message))
        if duplicate_result["count"] > 0:
            return response(status=0, message="duplicate job name")

        group_number = db.get_job_group_number(training_id=training_id)["max"]
        if group_number is None:
            group_number = 0
        else :
            group_number += 1
        creator_id = db.get_user(user_name=creator)["id"]
        job_name = ''
        for job_info in jobs_info:
            if job_name == '':
                job_name = job_info['job_name']

            if job_info["docker_image_id"] is not None and job_info["docker_image_id"] != "default":
                image_info = db.get_image(image_id=job_info["docker_image_id"])
                job_info["docker_image_name"] = image_info["name"]
            else:
                job_info["docker_image_id"] = tool_info["docker_image_id"]
                job_info["docker_image_name"] = tool_info["docker_image_name"]

            if job_info["dataset_id"] is not None and job_info["dataset_id"] != "/":
                dataset_info = db.get_dataset(dataset_id=job_info["dataset_id"])
                job_info["dataset_access"] = dataset_info["access"]
                job_info["dataset_name"] = dataset_info["name"]
            else:
                job_info["dataset_id"]  = None
                job_info["dataset_access"] = None
                job_info["dataset_name"] = None
                
            if type(job_info["parameter"]) == type({}):
                job_info["parameter"] = common.parameter_dict_to_str(job_info["parameter"])

            job_info["node_name"] = tool_info.get("node_name")
            if job_info.get("gpu_model") is not None:
                job_info["gpu_model"] = job_info["gpu_model"]
            else :
                job_info["gpu_model"] = tool_info["gpu_model"]

            if job_info.get("gpu_count") is None:
                job_info["gpu_count"] = tool_info["gpu_count"]

        result = db.insert_jobs(jobs_info=jobs_info, creator_id=creator_id, group_number=group_number)
        
        job_count = len(jobs_info)
        if job_count == 1:
            log_job_name = job_name + "(0)"
        elif job_count > 1:
            log_job_name = job_name + f"(0~{job_count-1})"
        else:
            log_job_name = job_name
        db.logging_history(
            user=creator, task='job',
            action='create', workspace_id=workspace_id,
            task_name='{} / {}'.format(training_name, log_job_name)
        )
        return run_training(training_id=training_id, user=creator, group_number=group_number)
    
    except CustomErrorList as ce:
        traceback.print_exc()
        return response(status=0, message=ce.message)
    except Exception as e:
        return response(status=0, message="Create Job error : {}".format(str(e)))

def delete_job(job_id_list, training_id, headers_user):
    def is_multiple_training_item(job_list):
        training_id_set = set()
        for job in job_list:
            training_id_set.add(job["training_id"])

        if len(training_id_set) > 1:
            return True
        else:
            return False

    def get_job_delete_item_log(job_list):
        log_dict = {}
        for job in job_list:
            item = log_dict.get(job["name"], [])
            item.append(str(job["job_group_index"]))
            log_dict[job["name"]] = item

        log_str = ""
        for key, value in log_dict.items():
            log_str += key + "(" + ",".join(value) + ") "

        return log_str

    """
        삭제 시 하나의 Training 안에 있는 아이템만 삭제 허용
    """
    if job_id_list is not None:
        job_list = db.get_job_list_from_job_id_list(job_id_list=job_id_list)
    elif training_id is not None:
        job_list = db.get_job_list_from_training_id(training_id=training_id)

    if len(job_list) == 0:
        return response(status=0, message="Not Exist Job")
    
    if is_multiple_training_item(job_list=job_list):
        raise TrainingJobHpsDeleteMultipleTrainingError

    training_id = job_list[0]["training_id"]
    training_info = db.get_training(training_id=training_id)

    # TODO 개선 필요
    check_result, res = permission_check(user=headers_user, training_info=training_info, permission_level=1)
    if not check_result:
        return res

    training_name = training_info["training_name"]
    workspace_name = training_info["workspace_name"]
    workspace_id = training_info["workspace_id"]
    job_name = job_list[0]["name"]
    

    # check if deleting all of the jobs in the job group
    # add job index(es) if not deleting all of them in the job group
    job_group_number = job_list[0]["group_number"]
    log_job_name = job_name

    log_job_name = get_job_delete_item_log(job_list=job_list)

    # jobs_in_group = db.get_training_group_number_jobs(training_id=training_id, group_number=job_group_number)
    # if len(jobs_in_group) != len(job_id_list):
    #     job_indexes = [str(job["job_group_index"]) for job in job_list]
    #     log_job_name = job_name + f"({','.join(job_indexes)})"
    # else:
    #     log_job_name = job_name

    pod_list = kube.get_list_namespaced_pod()
    with jf_scheduler_lock:
        running_job_id = None
        for job in job_list:
            status = kube.get_job_status(job_id=job["id"], pod_list=pod_list)
            delete_item_checkpoints(workspace_name=workspace_name, training_name=training_name, 
                                    item_name=job["name"], item_group_index=job["job_group_index"], item_type=TRAINING_ITEM_A)
            delete_item_log(workspace_name=workspace_name, training_name=training_name, item_id=job["id"], item_type=TRAINING_ITEM_A)
            if status["status"] in KUBER_RUNNING_STATUS:
                # 러닝중인 것을 삭제 시
                # if status["status"] == "running":
                    # running_job_id = job["id"]
                running_job_id = job["id"]
                res, message = kube.kuber_item_remove(job_id=running_job_id)
        # if running_job_id is not None:
        #     res, message = kube.kuber_item_remove(job_id=running_job_id)
        #DELETE FROM DB
        #QUEUE = DELETE CASCADE

        delete_result = db.delete_jobs(job_id_list=[ job["id"] for job in job_list ])
    # uwsgi.unlock()
    if delete_result:
        db.logging_history(
            user=headers_user, task='job',
            action='delete', workspace_id=workspace_id,
            task_name=f'{training_name} / {log_job_name}')
        return response(status=1, message="Delete Jobs OK")
    else:
        return response(status=0, message="Delete Jobs DB Fail")

def delete_item_log(workspace_name, training_name, item_type, item_id):
    # Job = id.jflog
    # HPS = id.jflog, id.json, id/sub_id.jflog
    base_path = kube.get_item_log_base_path(workspace_name=workspace_name, training_name=training_name, item_type=item_type)
    rm_list = []
    if item_type == TRAINING_ITEM_A:
        item_log_path = "{}/{}.jflog".format(base_path, item_id)
        rm_list = [item_log_path]
    elif item_type == TRAINING_ITEM_C:
        item_log_path = "{}/{}.jflog".format(base_path, item_id)
        item_log_json_path = "{}/{}.json".format(base_path, item_id)
        item_log_sub_path = "{}/{}".format(base_path, item_id)
        rm_list = [item_log_path, item_log_json_path, item_log_sub_path]
    
    for rm_path in rm_list:
        print("rm -r -f {}".format(rm_path))
        os.system("rm -r -f {}".format(rm_path))


def delete_item_checkpoints(workspace_name, training_name, item_name, item_group_index, item_type=TRAINING_ITEM_A):
    base_path = kube.get_item_checkpoints_base_path(workspace_name=workspace_name, training_name=training_name, item_type=item_type)
    item_checkpoints_base_path = "{}/{}".format(base_path, item_name)
    item_checkpoints_path = "{}/{}/".format(item_checkpoints_base_path, item_group_index)
    print(item_checkpoints_path)
    os.system("rm -r {}".format(item_checkpoints_path))
    try:
        if len(os.listdir(item_checkpoints_base_path)) == 0:
            os.system("rm -r {}".format(item_checkpoints_base_path))
    except:
        pass

def stop_job(job_id, headers_user):
    message = ""
    try:
        job_info = db.get_job(job_id=job_id)
        training_info = db.get_training(training_id=job_info["training_id"])
        check_result, res = permission_check(user=headers_user, training_info=training_info, permission_level=1)
        if not check_result:
            return res

        training_name = training_info["training_name"]
        workspace_name = training_info["workspace_name"]
        # pod_list = kube_data.get_pod_list(try_update=True)
        pod_list = kube.get_list_namespaced_pod()
        # uwsgi.lock()
        with jf_scheduler_lock:
            status = kube.get_job_status(job_id=job_id, pod_list=pod_list)
            if status["status"] in KUBER_RUNNING_STATUS:
                res, message = kube.kuber_item_remove(training_id=job_info["training_id"], work_func_type=CREATE_KUBER_TYPE[0])
                if res == False:
                    return response(status=0, message="Stop job error : {} ".format(message))
        # uwsgi.unlock()
        return response(status=1, message=message)
    except:
        traceback.print_exc()
    return response(status=0, message="fail")

def get_training_name(training_id):
    try:
        training_info = db.get_training(training_id=training_id)
        training_name = training_info["training_name"]
        return response(status=1, result=training_name, message="OK")
        
    except:
        traceback.print_exc()
        return response(status=0, message="fail")


def get_log_metrict_parser_and_lines(log_path, graph_log_path=None):
    def metrics_parser(line):
        line = line.replace("'","\"")
        # print("For Log  :", line)
        metrics = json.loads(line)
        try:
            pattern = re.compile(r'"x"[""]*:.*{[^}]*}') #For finding "x" info and replacing to null
            x_ = re.search(pattern, line)
            items_without_x = line.replace(x_.group(0),"")
        except:
            items_without_x = line
            pass
        try:
            pattern = re.compile(r'".*?"') #For finding key and print order
            key_order = [ key.replace('"',"") for key in re.findall(pattern, items_without_x) ]
        except:
            key_order = []
            pass

        try:
            x = metrics.pop("x")
        except:
            x = {"label": None, "value":[]}
            x["value"] = [i for i in range(len(metrics[key_order[0]]))]
            pass

        metrics_data = metrics
        metrics_info = {"x":x, "key_order": key_order}

        return metrics_data, metrics_info


    metrics_data = {}
    metrics_info = {"x": {"label": None, "value":[]}, "key_order": []}
    with open(log_path ,'r',errors='ignore') as fin:
        lines = fin.read().splitlines()

    #For metrics
    parser_key = "JF Training Metrics"
    for i, line in enumerate(lines):
        try:
            # if lines[i-1] == "=================" and lines[i+1] == "=================":
            if parser_key in line:
                if line.find(":") < line.find("{"):
                    line = line.replace(":","",1)

                line = line.replace(parser_key,"")
                metrics_data, metrics_info = metrics_parser(line)
        except:
            traceback.print_exc()
            pass

    if graph_log_path is not None and os.path.isfile(graph_log_path):
        try:
            graph_data_line = ""
            with open(graph_log_path, 'r', errors='ignore') as fin:
                graph_data_line = fin.read()
            lines.append("FROM graph_log_path")
            metrics_data, metrics_info = metrics_parser(graph_data_line)
        except:
            traceback.print_exc()

    return metrics_data, metrics_info, lines

def get_job_checkpoint_path(job_id, workspace_name=None, training_name=None, job_name=None, group_index=None, in_jupyter=True):
    #TODO job-checkpoints 를 파라미터화
    base_path = settings.JF_WS_DIR
    
    if in_jupyter == True:
        if job_name is None or group_index is None:
            res = db.get_job(job_id=job_id)
            job_name = res["name"]
            group_index = res["job_group_index"]

        checkpoint_path = "{job_name}/{group_index}".format(
            job_name=job_name,
            group_index=group_index
        )
    else :
        if workspace_name is None or training_name is None or job_name is None or group_index is None:
            res = db.get_job(job_id=job_id)
            workspace_name = res["workspace_name"]
            training_name = res["training_name"]
            job_name = res["name"]
            group_index = res["group_index"]

        checkpoint_path = "{base_path}/{workspace_name}/trainings/{training_name}/job-checkpoints/{job_name}/{group_index}".format(
            base_path=base_path,
            workspace_name=workspace_name,
            training_name=training_name,
            job_name=job_name,
            group_index=group_index
        )
    return checkpoint_path

def get_job_log_file_path(job_id, workspace_name=None, training_name=None, log_type="jflog"):
    base_path = settings.JF_WS_DIR
    log_name = "{}.{}".format(job_id, log_type)
    if workspace_name is None or training_name is None:
        res = db.get_job(job_id)
        workspace_name = res["workspace_name"]
        training_name = res["training_name"]

    log_path = "{base_path}/{workspace_name}/trainings/{training_name}/{default_job_log_path}/{log_name}".format(
        base_path=base_path, 
        workspace_name=workspace_name, 
        training_name=training_name, 
        default_job_log_path=JF_TRAINING_JOB_LOG_DIR_NAME,
        log_name=log_name
        )
    return log_path

def get_job_log(job_id):
    result = {
        "parameter_settings": "",
        "metrics_data": {},
        "metrics_info": {
            "x": {"label":None, "value":[]},
            "key_order": [],
            },
        "log": [],
        "status":  {
            "status": None, 
            "reason": None
            }
    }
    try:
        res = db.get_job(job_id)
        log_path = get_job_log_file_path(job_id=job_id, workspace_name=res["workspace_name"], training_name=res["training_name"], log_type="jflog")
        graph_path = get_job_log_file_path(job_id=job_id, workspace_name=res["workspace_name"], training_name=res["training_name"], log_type="jflog_graph")

        #For parameter settings
        result["parameter_settings"] = common.parameter_dict_to_list(common.parameter_str_to_dict(res["parameter"]))

        result["metrics_data"], result["metrics_info"], lines = get_log_metrict_parser_and_lines(log_path, graph_path)
        
        #For log
        length = len(lines)
        if length > 200:
            result_lines = lines[:100] + lines[-100:]
        else:
            result_lines = lines
        result["log"] = result_lines
        result["status"] = kube.get_job_status(job_id=job_id, pod_list=kube_data.get_pod_list())
        return response(status=1, message="OK", result=result, length=length) # 변경
        # return response(status=1, message="OK", result=result, length=length)
    except FileNotFoundError as fe:
        return response(status=0, message="Job log not exist.", result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Job Log Error ", result=result, length = 0)

# @ns.route('/job_log', methods=['GET'])
# @ns.response(200, 'Success')
# @ns.response(400, 'Validation Error')
# class JobLog(CustomResource):
#     @token_checker
#     @training_access_check(job_log_get, allow_max_level=4)
#     @ns.expect(job_log_get)
#     def get(self):
#         args = job_log_get.parse_args()

#         job_id = args["job_id"]

#         res = get_job_log(job_id=job_id)
#         db.request_logging(self.check_user(), 'trainings/job_log', 'get', str(args), res['status'])
#         return self.send(res)

def get_job_download(job_id):
    try:
        res = db.get_job_graph_info(job_id)
        # base_path = "/jfbcore/jf-data/workspaces/"
        # base_path = "/jf-data/workspaces/"
        # log_name = "{}-{}".format(res['group_number'], res['job_group_index'])
        log_name = "{}.jflog".format(job_id)
        logs_path = "{base_path}/{log_name}".format(base_path=JF_TRAINING_JOB_LOG_DIR_PATH.format(workspace_name=res['workspace_name'], training_name=res['training_name']), log_name=log_name)
        # logs_path = "{base_path}{ws_name}/trainings/{pj_name}/{job_log_dir}/{log_name}".format(base_path=base_path, ws_name=res['workspace_name'], pj_name=res['training_name'], job_log_dir=JF_TRAINING_JOB_LOG_DIR_POD_PATH, log_name=log_name)
        return response(status=1, self_response=send_file(logs_path, as_attachment=True, cache_timeout=1))

    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Can't find file ", path="")


# @ns.route('/job_download', methods=['GET'])
# @ns.response(200, 'Success')
# @ns.response(400, 'Validation Error')
# class JobDownload(CustomResource):
#     @token_checker
#     @ns.expect(job_download_get)
#     def get(self):
#         args = job_download_get.parse_args()

#         job_id = args["job_id"]

#         res = get_job_download(job_id=job_id)
#         # db.request_logging(self.check_user(), 'trainings/job_download', 'get', str(args), res['status'])
#         return self.send(res)



def permission_check(user, workspace_id=None, training_info=None, permission_level=0, create_training=False,
                    workspace_users_name=None, training_users_name=None):
    # permission level =  root(3) >= workspace owner ,training owner(2) >= user(1)
    # root ?
    # public ?
    #
    # private ?
    # pb.users == pv.users
    # 1. jupyter 실행 O, 종료 O
    # 2. training 수정 O(GPU만.), [삭제 X],
    # 3. job 남이 돌린거 삭제 가능 O..
    # 4. job 실행 -> o
    # 5. Private 에서 User 추가나 삭제 X
    # UI 부분 비활성화로
    workspace_manager = ""
    training_id = ""
    training_owner = ""
    workspace_manager = ""
    access = ""
    if training_info is not None:
        training_id = training_info["id"]
        workspace_id = training_info["workspace_id"]
        training_owner = training_info["user_name"]
        workspace_manager = training_info["manager_name"]
        access = training_info["access"]

    user_list = []
    error_message = ""
    if user is None:
        return 0, response(status=0, message="Jf-user is None in headers")

    if create_training == True:
        # training Create
        user_list = workspace_users_name if workspace_users_name is not None else list(map(lambda x: x['user_name'], db.get_workspace_users(workspace_id=workspace_id)))
        if user == 'root' or user == training_owner or user in user_list:
            return 2, ""
        else:
            error_message = "Must be a root or workspace user"
            return 0, response(status=0, message="Permission error : {}".format(error_message))

    # root or training owner or workspace_manager
    if user == 'root' or user == training_owner or user == workspace_manager:
        return 2, ""
    elif permission_level >= 2:
        error_message = "Must be a root or training owner"
        return 0, response(status=0, message="permission error : {}".format(error_message))

    if access == 1:
        # public
        user_list = workspace_users_name if workspace_users_name is not None else list(map(lambda x: x['user_name'], db.get_workspace_users(workspace_id=workspace_id)))
        error_message = "Must be a root or Workspace user"
    else:
        # private
        user_list = training_users_name if training_users_name is not None else list(map(lambda x: x['user_name'], db.get_training_users(training_id=training_id)))
        error_message = "Must be a root or this training user"

    if user in user_list:
        return 1, ""

    return 0, response(status=0, message="Permission error : {}".format(error_message))



def get_all_items(result_job, result_hps):
    try:
        result = {
            "training_info": {},
            "job_list": [],
            "hyperparam_list": []
        }

        if result_job["status"] == 0 or result_hps["status"] == 0:
            message = result_job["message"] + result_hps["message"]
            return response(status=0, result=result, message=message) 


        training_info = {}
        for k,v in result_job["result"].items():
            if k == "list":
                continue
            training_info[k] = v

        #TODO 임시
        # training_info["training_resource"] = {
        #     "gpu_count": 2,
        #     "gpu_configuration": ["GeForce GTX 1080 Ti x 2ea"],
        #     "network": "10G Ethernet",
        #     "cpu_cores": 2.0,
        #     "ram": "10GB"
        # }

        
        result["training_info"] = training_info
        result["job_list"] = result_job["result"]["list"]
        result["hyperparam_list"] = result_hps["result"]["list"]

        return response(status=1, result=result, message="")
    except Exception as e:
        traceback.print_exc()
        return response(status=0, result=result, message="Get training all items error : {}".format(e))

@ns.route('/all_items', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class GETSubItems(CustomResource):
    @token_checker
    @training_access_check(training_job_get_parser)
    @ns.expect(training_job_get_parser)
    def get(self):
        from training_hyperparam import get_hyperparamsearch_list
        """Job, Hyperparam Key - Value Page 조회"""
        args = training_job_get_parser.parse_args()
        # training_id = args['training_id']

        page = args["page"]
        size = args["size"]
        search_key = args["search_key"]
        search_value = args["search_value"]
        sort = args["sort"]
        training_id = args["training_id"]


        # response = get_training(training_id=training_id)
        res_j = get_jobs(search_key=search_key, size=size, page=page, search_value=search_value,
                                training_id=training_id, headers_user=self.check_user(), sort=sort)
        
        
        res_h = get_hyperparamsearch_list(search_key=search_key, size=size, page=page, search_value=search_value,
                        training_id=training_id, headers_user=self.check_user(), sort=sort)

        res = get_all_items(result_job=res_j, result_hps=res_h)
        # training_info = {}
        # for k,v in res_j["result"].items():
        #     if k == "list":
        #         continue
        #     training_info[k] = v

        # res = response(status=1, result={
        #     "training_info": training_info,
        #     "job_list": res_j["result"]["list"], 
        #     "hyperparam_list": res_h["result"]["list"],
        #     },
        #     message="")
        # if res_h["status"] == 0 or res_j["status"] == 0:
        #     res["message"] = res_j["message"] + res_h["message"]
        #     return res 

        # db.request_logging(self.check_user(), 'trainings/jobs', 'get', str(args), res['status'])

        return self.send(res)

custom_deployment_json_str_ex={
    "run_code_name":"dddkfsdf.py",
    "checkpoint_load_dir_path_parser":"weight_dir",
    "checkpoint_load_file_path_parser":"weight",
    "deployment_num_of_gpu_parser":None,
    "exist_default_checkpoints":False,

    "deployment_input_data_form_list": [
        {
            "method": "POST",
            "location": "form",
            "api_key": "coordinate",
            "value_type": "str",
            "category": "canvas-coordinate",
            "category_description": "IMG (jpg, jpeg, png, bmp)"
        }
    ],
    "deployment_output_types": [
        "text",
        "columnchart",
        "piechart"
    ]
}

def get_training_run_code(training_id):
    training_info = db.get_training(training_id=training_id)
    workspace_name = training_info.get("workspace_name")
    training_name = training_info.get("training_name")
    result = get_file_list_from_src(training_id=training_id, workspace_name=workspace_name, training_name=training_name, file_extension=["py","sh"])
    return response(status=1, result=result, message="Get runcode list success")

def add_training_bookmark(training_id, user_id):
    try:
        result, message = db.insert_training_bookmark(training_id=training_id, user_id=user_id)

        if result == True:
            return response(status=1)
        else :
            return response(status=0, message="Add training bookmark error : {}".format(message))
    except CustomErrorList as ce:
        traceback.print_exc()
        return response(status=0, message=ce.message)


def delete_training_bookmark(training_id, user_id):
    result, message = db.delete_training_bookmark(training_id=training_id, user_id=user_id)

    if result == True:
        return response(status=1)
    else :
        return response(status=0, message="Delete training bookmark error : {}".format(message))

#TODO 2021-12-14 접근 권한 체크
@ns.route('/bookmark', methods=["POST","DELETE"])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class GETSubItems(CustomResource):
    @token_checker
    # @training_access_check(training_job_get_parser)
    @ns.expect(training_bookmark_post_parser)
    def post(self):
        """Training Bookmark 추가"""
        args = training_bookmark_post_parser.parse_args()
        training_id = args["training_id"]

        res = add_training_bookmark(training_id=training_id, user_id=self.check_user_id())

        return self.send(res)

    @token_checker
    # @training_access_check(training_job_get_parser)
    @ns.expect(training_bookmark_delete_parser)
    def delete(self):
        """Training Bookmark 제거"""
        args = training_bookmark_post_parser.parse_args()
        training_id = args["training_id"]

        res = delete_training_bookmark(training_id=training_id, user_id=self.check_user_id())

        return self.send(res)


@ns.route("/run_code", methods=["GET"])
class GetTrainingRunCode(CustomResource):
    @token_checker
    @ns.expect(training_run_code_get_parser)
    def get(self):
        """Training Runcode 조회"""
        args = training_run_code_get_parser.parse_args()
        training_id = args["training_id"]

        res = get_training_run_code(training_id=training_id)

        return self.send(res)

@ns.route("/training_name", methods=["GET"])
class GetTrainingNameFromId(CustomResource):
    @token_checker
    @ns.expect(training_id_get_parser)
    def get(self):
        """Training 이름 조회"""
        args = training_id_get_parser.parse_args()
        training_id = args["training_id"]

        res = get_training_name(training_id=training_id)

        return self.send(res)
