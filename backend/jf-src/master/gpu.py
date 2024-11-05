# from flask_restful import Resource
from restplus import api
from flask_restplus import reqparse
from utils.resource import CustomResource, response, token_checker
import utils.common as common
import utils.kube as kube
from utils.kube import kube_data
from TYPE import TRAINING_TYPE, DEPLOYMENT_TYPE
import utils.db as db
import re
import os
import traceback
from TYPE import *
import time
import datetime
from functools import wraps
from typing import List, Dict

ns = api.namespace('gpu', description='gpu 정보 관련 API')

parser = reqparse.RequestParser()

workspace_aval_gpu_get = api.parser()
workspace_aval_gpu_get.add_argument('start_datetime', required=True, type=str, location='args', help='workspace start date (YYYY-MM-DD HH:MM)')
workspace_aval_gpu_get.add_argument('end_datetime', required=True, type=str, location='args', help='workspace end date (YYYY-MM-DD HH:MM)')
workspace_aval_gpu_get.add_argument('workspace_id', required=False, type=int, location='args', help='workspace ID (For Update Case)')
workspace_aval_gpu_get.add_argument('guaranteed_gpu', type=int, required=False, location='args', default=1, help="Workspace 내에서 GPU 자원 보장 여부 0 | 1 (False, True) ")

training_aval_gpu_get = api.parser()
training_aval_gpu_get.add_argument('workspace_id', required=True, type=int, location='args', help='workspace ID')



def get_workspace_aval_gpu(workspace_id, start_datetime, end_datetime, guaranteed_gpu=1):
    try:
        workspace_list = db.get_workspace_list()    
        guarantee_workspace_list = [ workspace for workspace in workspace_list if workspace["guaranteed_gpu"] == 1]
        not_guarantee_workspace_list = [ workspace for workspace in workspace_list if workspace["guaranteed_gpu"] == 0]

        res_count = kube.get_allocated_gpu_count(start_datetime=start_datetime, end_datetime=end_datetime, update_workspace_id=workspace_id
                                                , workspace_list=guarantee_workspace_list)
        
        gpu_total = res_count["resource_total"]
        gpu_total_used = res_count["alloc_total"]

        not_guarantee_max = 0
        if guaranteed_gpu == 1:
            not_guarantee_max = get_not_guaranteed_max_gpu_from_workspace_list(workspace_list=not_guarantee_workspace_list, update_workspace_id=workspace_id,
                                            start_datetime=start_datetime, end_datetime=end_datetime)
        
        return {"gpu_total_used":gpu_total_used, "gpu_total":gpu_total, "gpu_free":gpu_total-gpu_total_used-not_guarantee_max}
    except :
        traceback.print_exc()
        raise

def _get_workspace_aval_gpu(workspace_id, start_datetime, end_datetime, guaranteed_gpu=1):
    result = {"gpu_total_used": 0, "gpu_total": 0, "gpu_free": 0 }
    try:
        result = get_workspace_aval_gpu(workspace_id=workspace_id, start_datetime=start_datetime, end_datetime=end_datetime, guaranteed_gpu=guaranteed_gpu)

        res = response(status=1, result=result)
        return res
    except Exception as e:
        traceback.print_exc()
        print(e)
        return response(status=0, result=result)
    
    
    
"""Custom start"""

def get_workspace_time_in_time_range(start_datetime: float, end_datetime: float, workspace: List[Dict]):
    """범위 내에 workspace가 시작/종료 되는 workspace 의 시작 or 종료 시점 반환"""
    wo_start_datetime: float = common.date_str_to_timestamp(workspace['start_datetime'])
    wo_end_datetime: float = common.date_str_to_timestamp(workspace['end_datetime'])
    
    # 종료시간에서 
    if (start_datetime <= wo_start_datetime <= end_datetime) \
        and (start_datetime <= wo_end_datetime <= end_datetime):
            return [workspace['start_datetime'], workspace['end_datetime']]
    elif (start_datetime <= wo_start_datetime <= end_datetime):
        return [workspace['start_datetime']]
    elif (start_datetime <= wo_end_datetime <= end_datetime):
        return [workspace['end_datetime']]
    else:
        return False

def is_workspace_in_time_range(start_datetime: float, end_datetime: float, workspace: List[Dict]):
    """시간 범위 내에 workspace가 살아있는가"""
    ws_start_datetime = common.date_str_to_timestamp(workspace['start_datetime'])
    ws_end_datetime = common.date_str_to_timestamp(workspace['end_datetime'])
    
    if start_datetime < ws_end_datetime and end_datetime > ws_start_datetime:
        return True
    return False

def get_total_allocated_gpu(start_datetime: float, end_datetime: float, my_workspace_id: int, workspace_list: List[Dict]):
    """1. 시간 범위 내 포함된 workspace 에 할당된 GPU 총 합"""
    num_allocated_gpu: int = 0
    
    for workspace in workspace_list:
        if my_workspace_id == workspace['id']:
            continue
        if is_workspace_in_time_range(start_datetime, end_datetime, workspace):
            num_allocated_gpu += (workspace['gpu_deployment_total'] + workspace['gpu_training_total'])
    
    return num_allocated_gpu

def get_max_allocated_gpu(start_datetime: float, end_datetime: float, my_workspace_id: int, workspace_list: List[Dict]):
    """3. 범위 내에서 할당받은 값 중 가장 큰 GPU 개수 값"""
    max_allocated_gpu: int = 0
    
    for workspace in workspace_list:
        if my_workspace_id == workspace['id']:
            continue
        if is_workspace_in_time_range(start_datetime, end_datetime, workspace):
            total = workspace['gpu_deployment_total'] + workspace['gpu_training_total']
            max_allocated_gpu = max(max_allocated_gpu, total)
    
    return max_allocated_gpu

def find_max_allocated_gpu_in_time_range(start_datetime: float, end_datetime: float, workspace_list: list, my_workspace_id: int = None):
    """
    2. 범위 내에서 가장 많은 GPU를 할당받고 있는 시점의 GPU 개수 값

    Args:
        start_datetime (float): 
        end_datetime (float): 
        my_workspace_id (int):
        workspace_list (list): 시간 범위를 만족하는 workspace 목록

    Returns:
        _type_: _description_
    """
    result: Dict = {'resource_total': 0, 'alloc_total': 0, 'alloc_used': 0, 'workspace': {}}
    workspaces_one_day: List = []
    datetimes: List = []
    max_gpus: List = []

    # 일 년 간의 workspace 중 하루 내에 포함되는 workspace 추출
    for workspace in workspace_list:
        if workspace['id'] == my_workspace_id:
            continue
        if is_workspace_in_time_range(start_datetime, end_datetime, workspace):
            workspaces_one_day.append(workspace)

    # 하루 내에 포함되는 workspace 중 하루 내에 시작/종료 되는 시점(날짜) 추출
    for workspace in workspaces_one_day:
        datetime_ = get_workspace_time_in_time_range(start_datetime, end_datetime, workspace)
        if datetime_:
            datetimes.extend(datetime_)
    
    # 하루 내에 시작/종료 되는 workspace 가 있다면 -> 해당 workspace 시작/종료 날짜 기준으로 gpu 최대값 계산
    if datetimes:
        for datetime_ in datetimes:
            max_gpu = 0
            datetime_ = common.date_str_to_timestamp(datetime_)
            
            # 시작/종료 시간 조건에 포함하는 workspace 의 gpu 할당량 더하기
            for workspace in workspaces_one_day:
                wo_start_datetime = common.date_str_to_timestamp(workspace['start_datetime'])
                wo_end_datetime = common.date_str_to_timestamp(workspace['end_datetime'])
                
                if wo_start_datetime <= datetime_ <= wo_end_datetime: 
                    max_gpu += (workspace['gpu_training_total'] + workspace['gpu_deployment_total'])
                
            max_gpus.append(max_gpu)
        
        if max_gpus:
            result["alloc_total"] = max(max_gpus)
            return result
           
    # 하루 내에 시작/종료 되는 workspace 가 없다면 -> 하루 내 workspace 의 gpu 할당량 더하기
    else:
        max_gpu = 0
        for workspace in workspaces_one_day:
            max_gpu += (workspace['gpu_training_total'] + workspace['gpu_deployment_total'])
        result["alloc_total"] = max_gpu
        return result
                
    return None    
    
THIRTY_MINUTES = 1800
DAY = 86400
HOUR = 3600
KST = 32400  # Korea Standard Time (한국 표준 시간, UTC + 9시간)

def get_workspace_aval_gpu_timeline(workspace_id: int, start_datetime: str, end_datetime: str, guaranteed_gpu: int=1):
    """
    Description: 시간에 따른 사용 가능한 gpu 개수 리턴

    Args:
        workspace_id (int): 워크스페이스 id
        start_datetime (str): 시작 시간
        end_datetime (str): 끝나는 시간
        guaranteed_gpu (int, optional): 보장/비보장. Defaults to 1.

    Returns:
        dict: 날짜에 따른 사용가능한 gpu 목록
    """    
    result = {"gpu_total_used": 0, "gpu_total": 0, "gpu_free": 0}
    day_gpu_list = {}
    
    try:
        workspace_list: tuple = db.get_workspace_list()
        workspace_list: list = list(filter(lambda workspace: start_datetime <= workspace['end_datetime'] and end_datetime >= workspace['start_datetime'], workspace_list))
        guarantee_workspace_list: list = [ workspace for workspace in workspace_list if workspace["guaranteed_gpu"] == 1]
        not_guarantee_workspace_list: list = [ workspace for workspace in workspace_list if workspace["guaranteed_gpu"] == 0]
        
        num_my_total_gpu: int = kube.get_gpu_total_count()
        
        start_datetime_ts: float = common.date_str_to_timestamp(start_datetime)
        end_datetime_ts: float = common.date_str_to_timestamp(end_datetime)
        
        days = int(((end_datetime_ts - start_datetime_ts) / DAY) + 1)
        
        for i in range(days):
            start_day_utc_ts = start_datetime_ts + DAY * i
            end_day_utc_ts = start_datetime_ts + DAY * (i + 1) 
            start_day_kst_ts = start_day_utc_ts + KST
            start_day = datetime.datetime.fromtimestamp(start_day_kst_ts).strftime("%Y-%m-%d")
            
            res_count = find_max_allocated_gpu_in_time_range(start_datetime=start_day_utc_ts,
                                                                end_datetime=end_day_utc_ts,
                                                                my_workspace_id=workspace_id,
                                                                workspace_list=guarantee_workspace_list)
            gpu_total_used = res_count["alloc_total"]
            
            not_guarantee_max = get_max_allocated_gpu(start_datetime=start_day_utc_ts,
                                                    end_datetime=end_day_utc_ts,
                                                    my_workspace_id=workspace_id,
                                                    workspace_list=not_guarantee_workspace_list,)

            available_num_gpu = num_my_total_gpu - gpu_total_used
            day_gpu_list[start_day] = available_num_gpu
            
            if guaranteed_gpu == 1:
                day_gpu_list[start_day] -= not_guarantee_max
        
        res_count['resource_total'] = num_my_total_gpu
        res = response(status=1, result=day_gpu_list)
        return res
    except Exception as e:
        traceback.print_exc()
        print(e)
        return response(status=0, result=result)

## YYYY-MM-DD 
# TODO remove 신규 함수로 대체
def get_workspace_aval_gpu_timeline_old(workspace_id, start_datetime, end_datetime, guaranteed_gpu=1):
    result = {"gpu_total_used": 0, "gpu_total": 0, "gpu_free": 0 }
    try:
        workspace_list = db.get_workspace_list()    
        guarantee_workspace_list = [ workspace for workspace in workspace_list if workspace["guaranteed_gpu"] == 1]
        not_guarantee_workspace_list = [ workspace for workspace in workspace_list if workspace["guaranteed_gpu"] == 0]
        # pod_list = kube_data.get_pod_list(try_update=True)
        pod_list = kube.get_list_namespaced_pod()
        # node_list = kube_data.get_node_list(try_update=True)
        node_list = kube.get_list_node()
        
        st = common.date_str_to_timestamp(start_datetime)
        et = common.date_str_to_timestamp(end_datetime)
        days = int(((et - st) / (3600 * 24)) + 1)
        day_gpu_list = {}
        for i in range(days):
            start_day_utc_ts = st + (3600 * 24) * i
            end_day_utc_ts = st + (3600 * 24) * (i + 1) 
            start_day_ts = start_day_utc_ts + 9 * 3600
            end_day_ts = end_day_utc_ts + 9 * 3600


            start_day = datetime.datetime.fromtimestamp(start_day_ts).strftime("%Y-%m-%d")
            end_day = datetime.datetime.fromtimestamp(end_day_ts).strftime("%Y-%m-%d %H:%M:%S")
            start_day_utc = datetime.datetime.fromtimestamp(start_day_utc_ts).strftime("%Y-%m-%d %H:%M:%S")
            end_day_utc = datetime.datetime.fromtimestamp(end_day_utc_ts).strftime("%Y-%m-%d %H:%M:%S")
            res_count = kube.get_allocated_gpu_count(start_datetime=start_day_utc, end_datetime=end_day_utc, update_workspace_id=workspace_id, 
                                                    workspace_list=guarantee_workspace_list, pod_list=pod_list, node_list=node_list)
            gpu_total = res_count["resource_total"]
            gpu_total_used = res_count["alloc_total"]
            # print(start_day , " ~ " , end_day , gpu_total - gpu_total_used)
            # print(start_day_utc , " ~ " , end_day_utc , gpu_total - gpu_total_used)
            not_guarantee_max = get_not_guaranteed_max_gpu_from_workspace_list(workspace_list=not_guarantee_workspace_list, update_workspace_id=workspace_id,
                                            start_datetime=start_day_utc, end_datetime=end_day_utc)

            day_gpu_list[start_day] = gpu_total - gpu_total_used
            if guaranteed_gpu == 1:
                
                day_gpu_list[start_day] -= not_guarantee_max
        # day_hour_list = {}
        # for i in range(days * 24):
        #     start_day = st + (3600 * i)
        #     end_day = st + (3600 * (i + 1))
        #     start_day = datetime.datetime.fromtimestamp(start_day).strftime("%Y-%m-%d %H")
        #     end_day = datetime.datetime.fromtimestamp(end_day).strftime("%Y-%m-%d %H")
        #     res_count = kube.get_allocated_gpu_count(start_datetime=start_day, end_datetime=end_day, update_workspace_id=workspace_id, 
        #                                             workspace_list=workspaces, pod_list=pod_list, node_list=node_list)
        #     print(start_day , " ~ " , end_day , res_count)
        #     gpu_total = res_count["resource_total"]
        #     gpu_total_used = res_count["alloc_total"]
        #     day_hour_list[start_day] = gpu_total-gpu_total_used

        # res = response(status=1, result=day_gpu_list, result_for_robert=day_hour_list)
        res = response(status=1, result=day_gpu_list)
        return res
    except Exception as e:
        traceback.print_exc()
        print(e)
        return response(status=0, result=result)

def get_training_aval_gpu(workspace_id):
    print("Testing training_aval_gpu")
    aval_gpu_info = {"total_gpu": 0, "free_gpu": 0, "guaranteed_gpu": 1}
    try:


        workspace_info = db.get_workspace(workspace_id=workspace_id)
        if workspace_info is None:
            return response(status=0, result=aval_gpu_info, message="Workspace id [{}] Not Exist".format(workspace_id))
        
        #TODO allocatable gpus 개념을 쓴다면  
        total_gpu = workspace_info["gpu_training_total"]
        
        workspace_used_gpu = kube.get_workspace_gpu_count(workspace_id=workspace_id)
        if workspace_used_gpu is None:
            workspace_used_gpu = 0
        else :
            workspace_used_gpu = workspace_used_gpu.get("{}_used".format(TRAINING_TYPE))
        free_gpu = total_gpu - workspace_used_gpu

        aval_gpu_info["total_gpu"] = total_gpu
        aval_gpu_info["free_gpu"] = free_gpu
        aval_gpu_info["guaranteed_gpu"] = workspace_info["guaranteed_gpu"]

        return response(status=1, result=aval_gpu_info)
        
    except Exception as e:
        traceback.print_exc()
        return response(status=0, result=aval_gpu_info, message="Get training available gpu Error")
        #return response(status=0, result=aval_gpu, message=str(e))

def get_deployment_aval_gpu(workspace_id):
    aval_gpu_info = {"total_gpu": 0, "free_gpu": 0}
    try:

        workspace_info = db.get_workspace(workspace_id=workspace_id)
        if workspace_info is None:
            return response(status=0, result=aval_gpu_info, message="Workspace id [{}] Not Exist".format(workspace_id))

        total_gpu = workspace_info["gpu_deployment_total"]

        workspace_used_gpu = kube.get_workspace_gpu_count(workspace_id=workspace_id)
        if workspace_used_gpu is None:
            workspace_used_gpu = 0
        else :
            workspace_used_gpu = workspace_used_gpu.get("{}_used".format(DEPLOYMENT_TYPE))
        free_gpu = total_gpu - workspace_used_gpu

        aval_gpu_info["total_gpu"] = total_gpu
        aval_gpu_info["free_gpu"] = free_gpu


        return response(status=1, result=aval_gpu_info)
        
    except Exception as e:
        traceback.print_exc()
        return response(status=0, result=aval_gpu_info, message="Get deployment available gpu Error")
        #return response(status=0, result=aval_gpu, message=str(e))

def get_not_guaranteed_max_gpu_from_workspace_list(workspace_list, update_workspace_id=None, start_datetime=None, end_datetime=None):
    def within_rage_check(base_start_datetime_ts, base_end_datetime_ts, target_start_datetime_ts, target_end_datetime_ts):
        if ((base_start_datetime_ts <= target_start_datetime_ts and target_start_datetime_ts < base_end_datetime_ts)
            or (base_start_datetime_ts < target_end_datetime_ts and target_end_datetime_ts <= base_end_datetime_ts)
            or (base_start_datetime_ts <= target_start_datetime_ts and target_end_datetime_ts <= base_end_datetime_ts)
            or (base_start_datetime_ts >= target_start_datetime_ts and target_end_datetime_ts >= base_end_datetime_ts)):
            return True
        return False
    
    select_start_datetime_ts = common.date_str_to_timestamp(start_datetime)
    select_end_datetime_ts = common.date_str_to_timestamp(end_datetime)
    max_gpu = 0
    for workspace in workspace_list:
        # Update 시 
        if workspace["id"] == update_workspace_id:
            continue

        workspace_start_datetime_ts = common.date_str_to_timestamp(workspace["start_datetime"])
        workspace_end_datetime_ts = common.date_str_to_timestamp(workspace["end_datetime"])

        if within_rage_check(workspace_start_datetime_ts, workspace_end_datetime_ts, select_start_datetime_ts, select_end_datetime_ts):
            total = int(workspace['gpu_deployment_total'])+int(workspace['gpu_training_total'])
            max_gpu = max(max_gpu, total)
    
    # print("TEST ", start_datetime, end_datetime, max_gpu)
    return max_gpu

def get_kuber_gpu_resource_status():
    def parsing_general_resource_info():
        general_resource_info = {} 
        #         {
        #             @GPU_MODEL : {
        #                 "total": ,
        #                 "used" : ,
        #                 "node_list" : [{"node_name": , "total":, "used"}]
        #             },
        #         }
        
        gpu_info_list = kube.get_select_node_gpu_info_list(gpu_mode=GPU_GENERAL_MODE)
        for gpu_info in gpu_info_list:
            gpu_model = gpu_info.get("gpu_model")
            total = gpu_info.get("total")
            used = gpu_info.get("used")
            if general_resource_info.get(gpu_model) is None:
                general_resource_info[gpu_model] = {
                    "total": total,
                    "used": used,
                    "node_list" : [
                        {
                            "name": gpu_info.get("name"),
                            "ip": gpu_info.get("ip"),
                            "total": total,
                            "used": used
                        }
                    ]
                }
            else :
                general_resource_info[gpu_model]["total"] += total
                general_resource_info[gpu_model]["used"] += used
                general_resource_info[gpu_model]["node_list"].append({
                            "name": gpu_info.get("name"),
                            "ip": gpu_info.get("ip"),
                            "total": total,
                            "used": used
                        })
                
        return general_resource_info
                
    def parsing_mig_resource_info():
        mig_resource_info = {} 
        #         {
        #             @GPU_MODEL+@MIG_KEY : {
        #                 "total": ,
        #                 "used" : ,
        #                 "node_list" : [{"node_name": , "total":, "used"}]
        #             },
        #         }
        gpu_info_list = kube.get_select_node_gpu_info_list(gpu_mode=GPU_MIG_MODE)
        for gpu_info in gpu_info_list:
            for mig_key, mig_info in gpu_info.get("mig_detail").items():
                gpu_model = "{}+{}".format(gpu_info.get("gpu_model"), mig_key.replace(NVIDIA_GPU_BASE_LABEL_KEY, ""))
                total = mig_info.get("total")
                used = mig_info.get("used")
                
                if mig_resource_info.get(gpu_model) is None:
                    mig_resource_info[gpu_model] = {
                        "total": total,
                        "used": used,
                        "node_list" : [
                            {
                                "name": gpu_info.get("name"),
                                "ip": gpu_info.get("ip"),
                                "total": total,
                                "used": used
                            }
                        ]
                    }
                else :
                    mig_resource_info[gpu_model]["total"] += total
                    mig_resource_info[gpu_model]["used"] += used
                    mig_resource_info[gpu_model]["node_list"].append({
                                "name": gpu_info.get("name"),
                                "ip": gpu_info.get("ip"),
                                "total": total,
                                "used": used
                            })
                
        return mig_resource_info
    
    general_resource_info = parsing_general_resource_info()
    mig_resource_info = parsing_mig_resource_info()

    return { 
        GPU_GENERAL_MODE : general_resource_info, 
        GPU_MIG_MODE: mig_resource_info
    }

                

@ns.route("/workspace_aval_gpu", methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class WorkspaceAvalGPU(CustomResource):
    @token_checker
    @ns.expect(workspace_aval_gpu_get)
    def get(self):
        """Workspace 사용 가능 GPU 조회 (시간 범위에 따라서)"""
        args = workspace_aval_gpu_get.parse_args()
        start_datetime = args["start_datetime"]
        end_datetime = args["end_datetime"]
        workspace_id = args["workspace_id"]
        guaranteed_gpu = args["guaranteed_gpu"]
        # response = get_gpu(headers_user=self.check_user())

        return self.send(_get_workspace_aval_gpu(workspace_id=workspace_id, start_datetime=start_datetime, end_datetime=end_datetime, guaranteed_gpu=guaranteed_gpu))        


@ns.route("/workspace_aval_gpu_timeline", methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class WorkspaceAvalGPUNEW(CustomResource):
    @token_checker
    @ns.expect(workspace_aval_gpu_get)
    def get(self):
        """Workspace 사용 가능 GPU 조회 (시간 범위에 따라서)"""
        args = workspace_aval_gpu_get.parse_args()
        start_datetime = args["start_datetime"]
        end_datetime = args["end_datetime"]
        workspace_id = args["workspace_id"]
        guaranteed_gpu = args["guaranteed_gpu"]
        
        # response = get_gpu(headers_user=self.check_user())
        return self.send(get_workspace_aval_gpu_timeline(workspace_id=workspace_id, start_datetime=start_datetime, end_datetime=end_datetime, guaranteed_gpu=guaranteed_gpu))

@ns.route("/aval_gpu", methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class trainingAvalGPU(CustomResource):
    @token_checker
    @ns.expect(training_aval_gpu_get)
    def get(self):
        """training 사용 가능 GPU 조회 (Workspace에 기반)"""        
        args = training_aval_gpu_get.parse_args()
        workspace_id = args["workspace_id"]
        # response = get_gpu(headers_user=self.check_user())

        return self.send(get_training_aval_gpu(workspace_id=workspace_id))
