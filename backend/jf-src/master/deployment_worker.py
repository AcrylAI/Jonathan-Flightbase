from logging import error
from posix import listdir
from pyexpat import model
from sys import version_info
from restplus import api
from flask_restplus import reqparse
from utils.resource import CustomResource, response, token_checker
import utils.db as db
import traceback
from lock import jf_scheduler_lock
import utils.scheduler as scheduler
import utils.common as common
from TYPE import *
from settings import *
from utils.kube_create_func import create_deployment_pod, create_deployment_pod_new_method
# from utils.kube_create_func import create_deployment_pod_o
import utils.kube as kube
import json
# from deployment import get_deployment_running_info_o
from deployment import get_deployment_running_info, get_running_worker_dir
from deployment import get_statistic_result
from utils.access_check import deployment_access_check, check_inaccessible_deployment, check_deployment_access_level
import os
from ast import literal_eval
import subprocess
from utils.kube import kube_data
from utils.kube_parser import parsing_pod_restart_count
from flask_restplus import fields
from utils.exceptions import *
from utils.exceptions_deployment import *

POD_MEMORY_HISTORY_KEY = "mem_history"
POD_CPU_HISTORY_KEY = "cpu_history"
POD_GPU_HISTORY_KET = "gpu_history"

ns = api.namespace('deployments', description='deployment API')

# testing = api.model('Resource', {
#     'deployment_id': fields.String,
# })

deployment_worker_list_get = api.parser()
deployment_worker_list_get.add_argument('deployment_id', required=True, type=int, location='args', help='deployment id')
deployment_worker_list_get.add_argument('deployment_worker_running_status', required=False, type=int, default=2, location='args', help='0 : stop, 1 : running, 2: all')

deployment_worker_add = api.parser()
deployment_worker_add.add_argument('deployment_id', required=True, type=int, location='json', help='deployment id')

deployment_worker_delete = api.parser()
deployment_worker_delete.add_argument('deployment_worker_id_list', required=True, type=str, location='json', help='deployment_worker_id list')

deployment_worker_gpu_share_add = api.parser()
deployment_worker_gpu_share_add.add_argument('deployment_worker_id', required=True, type=int, location='json', help='deployment worker id')

deployment_worker_run = api.parser()
deployment_worker_run.add_argument('deployment_worker_id', required=True, type=int, location='args', help='deployment_worker_id')

deployment_worker_stop = api.parser()
deployment_worker_stop.add_argument('deployment_worker_id', required=True, type=int, location='args', help='deployment_worker_id id')

deployment_worker_description_update = api.parser()
deployment_worker_description_update.add_argument('deployment_worker_id', required=True, type=int, location='json', help='deployment_worker_id id')
deployment_worker_description_update.add_argument('description', required=True, type=str, location='json', help='Deployment Worker Description (1000)')


worker_api_monitor_parser = api.parser()
worker_api_monitor_parser.add_argument('deployment_worker_id', type=int, required=True, location='args', help='deployment worker id')
worker_api_monitor_parser.add_argument('start_time', type=str, required=False, default="2021-11-01 00:00:00", location='args', 
                                        help='search start time %Y-%m-%d %H:%M:%S')
worker_api_monitor_parser.add_argument('end_time', type=str, required=False, default="2021-11-07 00:00:00", location='args', 
                                        help='search end time %Y-%m-%d %H:%M:%S')
worker_api_monitor_parser.add_argument('interval', type=int, required=False, default=600, location='args', help='search interval second')
worker_api_monitor_parser.add_argument('absolute_location', type=bool, required=False, default=True, location='args', 
                                        help='dashboard streaming->True, user searching->False')
# worker_api_monitor_parser.add_argument('total_logic', type=str, required=False, default="median", location='args', 
#                                         help='graph logic = mean/median/percentile60')
# worker_api_monitor_parser.add_argument('function_response_time_logic', type=str, required=False, default="median", location='args',
#                                         help='function response time logic = mean/median/percentile60')
# worker_api_monitor_parser.add_argument('nginx_response_time_logic', type=str, required=False, default="median", location='args', 
#                                         help='nginx response time logic = mean/median/percentile60')
worker_api_monitor_parser.add_argument('search_type', type=str, required=False, default="range", location='args', help='search type range/live')

deployment_worker_pod_graph_get = api.parser()
deployment_worker_pod_graph_get.add_argument('deployment_worker_id', required=True, type=int, location='args', help='deployment_worker_id id')
deployment_worker_pod_graph_get.add_argument('interval', required=False, type=int, default=5, location='args', help='log interval (avg)')

deployment_worker_id_parser = api.parser()
deployment_worker_id_parser.add_argument('deployment_worker_id', required=True, type=int, default=None, location='args', help='Deployment id ')

deployment_worker_download_log_parser = api.parser()
deployment_worker_download_log_parser.add_argument('deployment_worker_id', type=int, required=True, location='args', help='deployment id')
deployment_worker_download_log_parser.add_argument('start_time', type=str, required=False, default=None, location='args', 
                                                    help='search start time %Y-%m-%d %H:%M:%S')
deployment_worker_download_log_parser.add_argument('end_time', type=str, required=False, default=None, location='args', 
                                                    help='search end time %Y-%m-%d %H:%M:%S')
deployment_worker_download_log_parser.add_argument('nginx_log', type=bool, required=False, location='args', help='nginx_log = True or No Key')
deployment_worker_download_log_parser.add_argument('api_log', type=bool, required=False, location='args', help='api_log = True or No Key')

# # 배포 실행 방법
# CAES 1. Custom - run_code
# CASE 2. Built_in - pretrained - built_in_model run_code
# CASE 3. Built_in - user_trained - built_in_model run_code + checkpoint_file
# CASE 4. Built_in - checkpoint_id (checkpoint_id가 built_in_model + checkpoint 파일을 들고 있음)

# # 배포 실행에 필요한 정보
# CASE 1. run_code = run_code
# CASE 2. 
# # run_code


def get_deployment_worker_list(deployment_id, deployment_worker_running_status, user_id):
    """
    deployment worker list 조회용
    """
    def is_changed(deployment_worker_info, deployment_info):
        if str(deployment_info) != str(deployment_worker_info):
            return deployment_info
        else :
            return False

    # 템플릿 적용
    def get_running_worker_info(deployment_worker_id, deployment_name, workspace_name, deployment_worker_info, pod_list, permission_level):
        # pod_all_resource_info = get_pod_all_resource(pod_list=pod_list, deployment_worker_id=deployment_worker_id, status=KUBE_POD_STATUS_RUNNING)
        run_version = [ check_deployment_worker_version_change(deployment_worker_id) ] + [ { k : v } for k, v in get_deployment_running_info(id=deployment_worker_id, is_worker=True).items() ]
        worker_run_time = get_deployment_worker_run_time(workspace_name=workspace_name, deployment_name=deployment_name, deployment_worker_id=deployment_worker_id)

        chart_data = get_deployment_worker_per_hour_chart_dict(deployment_worker_id=deployment_worker_id, workspace_name=workspace_name, deployment_name=deployment_name)
        resource_usage_graph = get_deployment_worker_resource_usage_graph(deployment_worker_id=deployment_worker_id, interval=60)["result"]
        return {
            "deployment_worker_id": deployment_worker_id,
            "description": deployment_worker_info["description"],
            "run_time": worker_run_time,
            "run_env":[
                { "docker_image": deployment_worker_info["image_name"] },
                { "gpu_model": common.convert_gpu_model(deployment_worker_info["gpu_model"]) },
                { "gpu_count": deployment_worker_info["gpu_count"] },
                { "run_code": deployment_worker_info["run_code"] },
            ],
            "run_version": run_version,
            "running_info": [
                { "configurations": deployment_worker_info["configurations"] },
                # { "cpu_cores": "{} | {}%".format(pod_all_resource_info["cpu_cores"], pod_all_resource_info["cpu_cores_usage"]) },
                # { "ram": "{} | {}%".format(pod_all_resource_info["ram"], pod_all_resource_info["ram_usage_per"]) },
                # { "gpus": pod_all_resource_info["gpus"] },
                # { "network": pod_all_resource_info["network"] },
                { "cpu_cores": "{} | {}%".format(resource_usage_graph["cpu_cores"]["cpu_cores_total"], resource_usage_graph["cpu_cores"]["cpu_cores_usage"]) },
                { "ram": "{} | {}%".format(resource_usage_graph["ram"]["ram_total"], resource_usage_graph["ram"]["ram_usage"]) },
                { "gpus": resource_usage_graph["gpus"] },
                { "network": resource_usage_graph["network"] },
                { "call_count_chart": chart_data["call_count_chart"]  },
                { "median_chart": chart_data["median_chart"] },
                { "nginx_abnormal_count_chart": chart_data["nginx_abnormal_count_chart"] },
                { "api_monitor_abnormal_count_chart": chart_data["api_monitor_abnormal_count_chart"] },
                { "mem_history" : resource_usage_graph.get("mem_history") },
                { "cpu_history" : resource_usage_graph.get("cpu_history") },
                { "gpu_history" : resource_usage_graph.get("gpu_history") }
            ],
            "worker_status": deployment_worker_status,
            "permission_level": permission_level
        }
    

    def get_stop_worker_info(deployment_worker_id, workspace_name, deployment_name, deployment_worker_info, permission_level):
        worker_run_time_info = get_deployment_worker_run_time_info(workspace_name=workspace_name, deployment_name=deployment_name, deployment_worker_id=deployment_worker_id)
        run_time = get_deployment_worker_run_time(workspace_name=workspace_name, deployment_name=deployment_name, deployment_worker_id=deployment_worker_id)
        return {
            "deployment_worker_id": deployment_worker_id,
            "operation_time": run_time,
            "start_datetime": worker_run_time_info.get(POD_RUN_TIME_START_TIME_KEY),
            "end_datetime": worker_run_time_info.get(POD_RUN_TIME_END_TIME_KEY),
            "description": deployment_worker_info["description"],
            "log_size": get_deployment_worker_log_size(workspace_name=workspace_name, deployment_name=deployment_name, deployment_worker_id=deployment_worker_id) ,
            "call_count": get_deployment_worker_nginx_call_count(workspace_name=workspace_name, deployment_name=deployment_name, deployment_worker_id=deployment_worker_id),
            "permission_level": permission_level
        }


    try:
        permission_level = check_deployment_access_level(user_id=user_id, deployment_id=deployment_id) # permission_level 3 넘어가면 삭제 불가능
        deployment_worker_list = db.get_deployment_worker_list(deployment_id=deployment_id)
        deployment_info = db.get_deployment(deployment_id=deployment_id)
        workspace_name = deployment_info["workspace_name"]
        deployment_name = deployment_info["name"]

        if deployment_worker_list is None or len(deployment_worker_list) == 0:
            return response(status=1, result=[])

        pod_list = kube.kube_data.get_pod_list()
        worker_list = []
        for deployment_worker_info in deployment_worker_list:
            deployment_worker_id = deployment_worker_info["id"]
            # 분기처리 삭제 예정 => Lyla
            # get_worker_info = get_running_worker_info_o
            # if  deployment_worker_info["template_id"]!=None:
            #     get_worker_info = get_running_worker_info
            deployment_worker_status = kube.get_deployment_worker_status(deployment_worker_id=deployment_worker_id, pod_list=pod_list)
            

            if deployment_worker_running_status == 1:
                # Run status Worker only
                if deployment_worker_status["status"] not in KUBER_RUNNING_STATUS:
                    continue

                worker_list.append(get_running_worker_info(deployment_worker_id=deployment_worker_id, deployment_name=deployment_name, 
                                                        workspace_name=workspace_name, deployment_worker_info=deployment_worker_info, pod_list=pod_list, permission_level=permission_level))

            elif deployment_worker_running_status == 0:
                # Stop status Worker only
                if deployment_worker_status["status"] not in KUBER_NOT_RUNNING_STATUS:
                    continue
                worker_list.append(get_stop_worker_info(deployment_worker_id=deployment_worker_id, deployment_name=deployment_name, 
                                                        workspace_name=workspace_name, deployment_worker_info=deployment_worker_info, permission_level=permission_level))
            elif deployment_worker_running_status == 2:

                worker_list.append(get_running_worker_info(deployment_worker_id=deployment_worker_id, deployment_name=deployment_name, 
                                                        workspace_name=workspace_name, deployment_worker_info=deployment_worker_info, pod_list=pod_list, permission_level=permission_level))

        return response(status=1, result=worker_list)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Get deployment worker list error {}".format(e))

def get_pod_all_resource(pod_list, deployment_worker_id, status):
    """
    deployment worker resource 정보 조회
    """    
    cpu_cores = None # 할당 받은 총 cpu core 개수
    cpu_cores_usage_on_node = None # 노드 대비 cpu core 사용량 (0 ~ 1)
    cpu_cores_usage_on_pod = None # Pod 할당 받은 대비 cpu core 사용량 (0 ~ 1)
    ram = None # 할당 받은 RAM SIZE (Byte)
    ram_usage_per = None
    network = None
    gpus = {}


    if status in KUBER_NOT_RUNNING_STATUS:
        return {
            "cpu_cores": cpu_cores,
            "cpu_cores_usage": cpu_cores_usage_on_pod,
            "ram": ram,
            "ram_usage_per": ram_usage_per,
            "network": network,
            "gpus": gpus
        }

    pod_resource_info = kube.get_pod_resource_info(pod_list=pod_list, deployment_worker_id=deployment_worker_id)
    pod_resource_usage_info = kube.get_pod_cpu_ram_usage_info(pod_list=pod_list, deployment_worker_id=deployment_worker_id)
    pod_gpu_usage_info = kube.get_pod_gpu_usage_info(pod_list=pod_list, deployment_worker_id=deployment_worker_id)

    if pod_resource_info is not None:
        # 총 자원 정보
        cpu_cores = pod_resource_info["cpu"]
        ram = pod_resource_info["memory"]

        # POD 사용 정보
        cpu_cores_usage_on_node = pod_resource_usage_info.get(CPU_USAGE_ON_NODE_KEY) if pod_resource_usage_info.get(CPU_USAGE_ON_NODE_KEY) is not None else "Unknown"
        cpu_cores_usage_on_pod = pod_resource_usage_info.get(CPU_USAGE_ON_POD_KEY) if pod_resource_usage_info.get(CPU_USAGE_ON_POD_KEY) is not None else "Unknown"
        ram_usage_per = pod_resource_usage_info.get(MEM_USAGE_PER_KEY) if pod_resource_usage_info.get(MEM_USAGE_PER_KEY) is not None else "Unknwon"
        ram_usage_per = round(ram_usage_per, 2)
        network = pod_resource_info[POD_NETWORK_INTERFACE_LABEL_KEY]


    try:
        if pod_gpu_usage_info is not None:
            for k, v in pod_gpu_usage_info.items():
                # if k != "recordable":
                if v.get("recordable")==False:
                    gpus[k] ={
                        "utils_gpu": "unknown",
                        "utils_memory": "unknown",
                        "memory_used_ratio": "unknown",
                        "memory_used": "",
                        "memory_total": ""
                    }
                else:
                    util_gpu = v.get(GPU_UTIL_KEY)
                    util_memory = v.get(GPU_MEM_UTIL_KEY)
                    gpu_memory_free = v.get(GPU_MEM_FREE_KEY)
                    gpu_memory_used = v.get(GPU_MEM_USED_KEY)
                    gpu_memory_total= v.get(GPU_MEM_TOTAL_KEY)
                    gpu_memory_used_ratio = None
                    try:
                        if gpu_memory_used is not None and gpu_memory_total is not None:
                            gpu_memory_used_ratio = str(round(gpu_memory_used/gpu_memory_total * 100 ,2)) + "%"
                    except Exception as e:
                        traceback.print_exc()
                        gpu_memory_used_ratio = "Error ({}/{})".format(gpu_memory_used, gpu_memory_total)
                        
                    gpus[k] ={
                        "utils_gpu": util_gpu,
                        "utils_memory": util_memory,
                        "memory_used_ratio": gpu_memory_used_ratio,
                        "memory_used": gpu_memory_used,
                        "memory_total": gpu_memory_total
                    }
                    # gpus.append("GPU-{} \n GPU util {}% \n MEM util {}% \n MEM INFO {}MB/{}MB".format(k, util_gpu, util_memory, gpu_memory_used, gpu_memory_total))
                    # gpus.append()
                    # gpus.append("GPU-{} \n GPU util {}% \n MEM util {}% \n MEM INFO {}MB/{}MB".format(k, util_gpu, util_memory, gpu_memory_used, gpu_memory_total))
    except:
        traceback.print_exc()
        print("OLD VERSION Error")

    return {
        "cpu_cores": cpu_cores,
        "cpu_cores_usage": cpu_cores_usage_on_pod,
        "ram": ram,
        "ram_usage_per": ram_usage_per,
        "network": network,
        "gpus": gpus
    }

def add_deployment_worker_with_run_gpu_share(deployment_worker_id, headers_user):
    """
    Description :

    Args :
        deployment_id (int) 
        headers_user (str) : user name. from self.check_user()

    Returns :
        response()
    """
    try:
        pod_list = kube.kube_data.get_pod_list()
        gpu_uuid_list, node_name = kube.get_pod_gpu_uuid_list_and_node_name(pod_list=pod_list, deployment_worker_id=deployment_worker_id)
        #TODO GPU Copy를 못하는 - deployment worker가 종료된 상태거나, parsing이 불가능한 상태라면 실패 처리 필요
        print(gpu_uuid_list, node_name)
        if len(gpu_uuid_list) == 0 or node_name is None:
            raise Exception("Unable to get GPU share related information.")


        with jf_scheduler_lock:
            add_result = add_deployment_worker_gpu_share(deployment_worker_id=deployment_worker_id)
            if add_result["status"] == 1:
                return run_deployment_worker_gpu_share(deployment_worker_id=add_result["inserted_id"], headers_user=headers_user,
                                                        force_node_name=node_name, gpu_uuid_list=gpu_uuid_list, parent_deployment_worker_id=deployment_worker_id)
            else :
                return add_result
    except CustomErrorList as ce:
        traceback.print_exc()
        return ce.response()

    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Add Deployment worker error : {}".format(e))

def run_item_deleted(item_deleted_info):
    training_exception_map = {
        1: DeploymentSelectTrainingNotExistError,
        2: DeploymentSelectJobNotExistError,
        3: DeploymentSelectHPSNotExistError
    }
    if item_deleted_info.get("training")!=None and item_deleted_info.get("training")!=0 :
        raise training_exception_map[item_deleted_info["training"]]
    if item_deleted_info.get("built_in_model")==1:
        raise DeploymentSelectBuiltInModelNotExistError
    
# 템플릿 적용
def add_deployment_worker_with_run(deployment_id, headers_user):
    """
    Description :

    Args :
        deployment_id (int) 
        headers_user (str) : user name. from self.check_user()

    Returns :
        response()
    """
    try:
        deployment_info = db.get_deployment(deployment_id=deployment_id)

        workspace_id = deployment_info["workspace_id"]
        description = deployment_info["description"]
        # training_id = deployment_info["training_id"]
        # training_name = deployment_info["training_name"]
        # built_in_model_id = deployment_info["built_in_model_id"]
        # job_id = deployment_info["job_id"]
        # run_code = deployment_info["run_code"]
        # checkpoint = deployment_info["checkpoint"]
        # checkpoint_id = deployment_info["checkpoint_id"]
        gpu_count = deployment_info["gpu_count"]
        gpu_model = deployment_info["gpu_model"]
        node_mode = deployment_info["node_mode"]
        node_name = deployment_info["node_name"]
        docker_image_id = deployment_info["docker_image_id"] 
        token = deployment_info["token"]
        user_id = deployment_info["user_id"]
        executor_id = deployment_info["executor_id"]
        run_item_deleted(item_deleted_info=deployment_info["item_deleted"])
        with jf_scheduler_lock:
            check_result = scheduler.check_immediate_running_item_resource_new(requested_gpu_count=gpu_count, gpu_usage_type=DEPLOYMENT_TYPE, 
                                                                workspace_id=workspace_id, rdma_option=0, 
                                                                gpu_model=gpu_model, node_name=node_name)
            if check_result is None:
                print("Add Deployment Worker Fail : {}")
                raise DeploymentRunSchedulerError
                # return response(status=0, message="Add Deployment Worker Fail : {}".format(check_result["message"]))
            
            # 템플릿 분기 처리 변경 예정 => Lyla
            # if deployment_info["template_id"]==None:
            #     add_result = add_deployment_worker_o(deployment_id=deployment_id)
            #     if add_result["status"] == 1:
            #         return run_deployment_worker_o(deployment_worker_id=add_result["inserted_id"], headers_user=headers_user)
            #     else :
            #         return add_result
            # else:
            add_result = add_deployment_worker(deployment_id=deployment_id)
            if add_result["status"] == 1:
                return run_deployment_worker_new_method(deployment_worker_id=add_result["inserted_id"], headers_user=headers_user) # TODO 테스트중
            else :
                return add_result
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception as e:
        traceback.print_exc()
        raise e    

# 템플릿 적용
def add_deployment_worker(deployment_id):
    try:
        
        deployment_info = db.get_deployment(deployment_id=deployment_id)
        description = deployment_info["description"]
        template_id = deployment_info["template_id"]
        gpu_count = deployment_info["gpu_count"]
        gpu_model = deployment_info["gpu_model"]
        node_mode = deployment_info["node_mode"]
        node_name = deployment_info["node_name"]
        docker_image_id = deployment_info["docker_image_id"] 
        token = deployment_info["token"]
        user_id = deployment_info["user_id"]
        executor_id = deployment_info["executor_id"]

        # deployment_id, description, template_id, 
        # gpu_count, gpu_model, node_mode, node_name,
        # docker_image_id, token, user_id, executor_id

        inserted_id, message = db.insert_deployment_worker(deployment_id=deployment_id, description=description, template_id=template_id, 
                            gpu_count=gpu_count, gpu_model=gpu_model, node_mode=node_mode, node_name=node_name,
                            docker_image_id=docker_image_id, token=token, user_id=user_id, executor_id=executor_id)
        print("INSERTED ID ", inserted_id)
        if inserted_id == False:
            print("Add Deployment Worker error : {}".format(message))
            raise WorkerDBInsertError
            # return response(status=0, message="Add Deployment Worker error : {}".format(message))

        return response(status=1, message="OK", inserted_id=inserted_id)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Add Deployment Worker error")


def add_deployment_worker_gpu_share(deployment_worker_id):
    try:
        deployment_worker_info = db.get_deployment_worker(deployment_worker_id=deployment_worker_id)
        deployment_id = deployment_worker_info["deployment_id"]
        gpu_count = deployment_worker_info["gpu_count"]
        gpu_model = deployment_worker_info["gpu_model"]
        configurations = deployment_worker_info["configurations"]

        deployment_info = db.get_deployment(deployment_id=deployment_id)

        workspace_id = deployment_info["workspace_id"]
        description = deployment_info["description"]
        training_id = deployment_info["training_id"]
        training_name = deployment_info["training_name"]
        built_in_model_id = deployment_info["built_in_model_id"] # 확인 필요 => Lyla
        job_id = deployment_info["job_id"]
        run_code = deployment_info["run_code"]
        checkpoint = deployment_info["checkpoint"]
        checkpoint_id = deployment_info["checkpoint_id"]
        gpu_count = deployment_info["gpu_count"]
        gpu_model = deployment_info["gpu_model"]
        node_mode = deployment_info["node_mode"]
        node_name = deployment_info["node_name"]
        docker_image_id = deployment_info["docker_image_id"] 
        token = deployment_info["token"]
        user_id = deployment_info["user_id"]
        executor_id = deployment_info["executor_id"]


        inserted_id, message = db.insert_deployment_worker_o(deployment_id=deployment_id, description=description, training_id=training_id, training_name=training_name, 
                            built_in_model_id=built_in_model_id, job_id=job_id, run_code=run_code, checkpoint=checkpoint, checkpoint_id=checkpoint_id, 
                            gpu_count=gpu_count, gpu_model=gpu_model, node_mode=node_mode, node_name=node_name,
                            docker_image_id=docker_image_id, token=token, user_id=user_id, executor_id=executor_id, configurations=configurations)
        print("INSERTED ID ", inserted_id)
        if inserted_id == False:
            return response(status=0, message="Add Deployment Worker error : {}".format(message))

        return response(status=1, message="OK", inserted_id=inserted_id)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Add Deployment Worker error")


def update_custom_deployment_run_info(deployment_worker_info):
    from deployment import load_custom_api_system_info_to_json
    deployment_id=deployment_worker_info["deployment_id"]
    # model_info_json = load_custom_api_system_info_to_json(deployment_id=deployment_id)
    model_info_json = load_custom_api_system_info_to_json(
                        run_code_path=deployment_worker_info[DEPLOYMENT_TEMPLATE_RUN_COMMAND_KEY].get(DEPLOYMENT_TEMPLATE_RUN_SCRIPT_KEY), 
                        training_name=deployment_worker_info["training_name"],
                        workspace_name=deployment_worker_info["workspace_name"])
    if model_info_json:
        deployment_worker_info["deployment_form_list"] = model_info_json["deployment_input_data_form_list"]
        for key in ["checkpoint_load_dir_path_parser","checkpoint_load_file_path_parser","deployment_num_of_gpu_parser"]:
            model_info_json.get(key)
    update_deployment_py_command_from_template(deployment_worker_info)
    # if '/src/' == deployment_worker_info[DEPLOYMENT_TEMPLATE_RUN_COMMAND_KEY].get(DEPLOYMENT_TEMPLATE_RUN_SCRIPT_KEY)[:5]:
    #     deployment_worker_info["deployment_py_command"] = deployment_worker_info[DEPLOYMENT_TEMPLATE_RUN_COMMAND_KEY].get(DEPLOYMENT_TEMPLATE_RUN_SCRIPT_KEY)[1:]
    # else:
    #     deployment_worker_info["deployment_py_command"] = deployment_worker_info[DEPLOYMENT_TEMPLATE_RUN_COMMAND_KEY].get(DEPLOYMENT_TEMPLATE_RUN_SCRIPT_KEY)

def update_deployment_py_command_from_template(deployment_worker_info):
    # deployment_py_command 에 (interpreter + command + arguments) 선언
    deployment_template_run_info = deployment_worker_info.get(DEPLOYMENT_TEMPLATE_RUN_COMMAND_KEY)
    if deployment_template_run_info != None:
        deployment_worker_info["deployment_py_command"] = ""
        if deployment_template_run_info.get(DEPLOYMENT_TEMPLATE_RUN_BINARY_KEY) !=None:
            deployment_worker_info["deployment_py_command"] += deployment_template_run_info[DEPLOYMENT_TEMPLATE_RUN_BINARY_KEY]+" "
        if deployment_template_run_info.get(DEPLOYMENT_TEMPLATE_RUN_SCRIPT_KEY) !=None:
            deployment_worker_info["deployment_py_command"] += deployment_template_run_info[DEPLOYMENT_TEMPLATE_RUN_SCRIPT_KEY]+" "
        if deployment_template_run_info.get(DEPLOYMENT_TEMPLATE_RUN_ARGUMENTS_KEY) !=None:
            deployment_worker_info["deployment_py_command"] += deployment_template_run_info[DEPLOYMENT_TEMPLATE_RUN_ARGUMENTS_KEY]
    
def update_json_deployment_run_info(deployment_worker_info):
    update_deployment_py_command_from_template(deployment_worker_info)
    deployment_template_mount_info = deployment_worker_info.get(DEPLOYMENT_TEMPLATE_MOUNT_KEY)
    if deployment_template_mount_info != None:
        # dataset access 값 받기
        if deployment_template_mount_info.get("dataset") != None and type(deployment_template_mount_info.get("dataset"))==list:
            for idx in range(len(deployment_template_mount_info["dataset"])):
                dataset_name = deployment_template_mount_info["dataset"][idx].get("name")
                dataset_access_info = db.get_dataset_access_by_dataset_name(workspace_id=deployment_worker_info["workspace_id"],
                                                                            dataset_name=dataset_name)
                deployment_template_mount_info["dataset"][idx]["access"] = dataset_access_info["access"]

def update_built_in_model_deployment_run_info(deployment_worker_info):
    additional_info = db.get_deployment_worker_built_in_pod_run_info(deployment_worker_info["built_in_model_id"])
    deployment_worker_info.update(additional_info)
    deployment_worker_info["deployment_form_list"] = db.get_built_in_model_data_deployment_form(deployment_worker_info["built_in_model_id"])

def get_deployment_run_code(deployment_worker_info):
    """
        # 작업 진행 중 
    """
    deployment_py_command = deployment_worker_info.get("deployment_py_command")
    # runcode 없는 경우 처리
    if deployment_py_command == None or deployment_py_command.replace(" ", "") == "":
        return None

    if deployment_py_command.split(' ')[0][-3:]=='.py' and deployment_py_command[:6]!="python":
        run_code = "python {deployment_py_command} ".format(deployment_py_command=deployment_py_command)
    else:
        run_code = "{deployment_py_command} ".format(deployment_py_command=deployment_py_command)
        
    if deployment_worker_info.get("deployment_num_of_gpu_parser") is not None and deployment_worker_info.get("deployment_num_of_gpu_parser") != "":
        run_code += " --{key} {value} ".format(key=deployment_worker_info["deployment_num_of_gpu_parser"], value=deployment_worker_info["gpu_count"])


    if deployment_worker_info.get(DEPLOYMENT_TEMPLATE_TYPE_KEY) in [DEPLOYMENT_RUN_CUSTOM, DEPLOYMENT_RUN_USERTRAINED, DEPLOYMENT_RUN_CHEKCPOINT]:
        checkpoint_base_path=deployment_worker_info.get(DEPLOYMENT_TEMPLATE_CHECKPOINT_DIR_KEY)
        checkpoint_file_path=deployment_worker_info.get(DEPLOYMENT_TEMPLATE_CHECKPOINT_FILE_KEY)

        if deployment_worker_info.get("checkpoint_load_dir_path_parser") is not None and deployment_worker_info.get("checkpoint_load_dir_path_parser") != "":
            run_code += "--{key} {value}/ ".format(key=deployment_worker_info.get("checkpoint_load_dir_path_parser"), value=checkpoint_base_path )

        if deployment_worker_info.get("checkpoint_load_file_path_parser") is not None and deployment_worker_info.get("checkpoint_load_file_path_parser") != "":
            run_code += "--{key} {value} ".format(key=deployment_worker_info.get("checkpoint_load_file_path_parser"), value=checkpoint_file_path )

    run_code = common.convert_run_code_to_run_command(run_code=run_code)

    return run_code

def update_deployment_template_info(deployment_worker_info):
    """
    Description: Update information about template of deployment worker .

    Args:
        deployment_worker_info (dict):
    """
    deployment_worker_info.update(deployment_worker_info["deployment_template_info"])
    del deployment_worker_info["deployment_template_info"]

    get_info_method_dic = {
        DEPLOYMENT_RUN_CUSTOM: update_custom_deployment_run_info,
        DEPLOYMENT_RUN_USERTRAINED: update_built_in_model_deployment_run_info,
        DEPLOYMENT_RUN_PRETRAINED: update_built_in_model_deployment_run_info,
        DEPLOYMENT_RUN_CHEKCPOINT: update_built_in_model_deployment_run_info,
        DEPLOYMENT_RUN_SANDBOX: update_json_deployment_run_info
    }
    # TODO template type 받는 방식 통일 후 변경 예정 => Lyla 22/12/18
    if deployment_worker_info.get(DEPLOYMENT_TEMPLATE_TYPE_KEY)==None:
        deployment_worker_info[DEPLOYMENT_TEMPLATE_TYPE_KEY] = deployment_worker_info[DEPLOYMENT_TEMPLATE_KIND_INFO_KEY][DEPLOYMENT_TEMPLATE_TYPE_KEY]
        deployment_worker_info["deployment_type"] = deployment_worker_info[DEPLOYMENT_TEMPLATE_KIND_INFO_KEY][DEPLOYMENT_TEMPLATE_DEPLOYMENT_TYPE_KEY]

    update_run_info = get_info_method_dic.get(deployment_worker_info[DEPLOYMENT_TEMPLATE_TYPE_KEY])
    if update_run_info !=None:
        update_run_info(deployment_worker_info)

    # info=DEPLOYMENT_JSON_TEMPLATE[template_info[DEPLOYMENT_TEMPLATE_TYPE_KEY]]
    # return info.update(json.loads(template_info))

# 템플릿 적용
def get_deployment_worker_info(deployment_worker_id):
    """
    Description: Get all deployment info about a deployment

    Args:
        deployment_worker_id (int): key value to run deployment

    Returns:
        dict: deployment_worker_info dictionary
    """

    deployment_worker_info={}
    # deployment_worker_info["checkpoint"]=None
    # deployment_worker_info["checkpoint_id"]=None
    # deployment_worker_info["checkpoint_dir_path"]=None
    # deployment_worker_info["checkpoint_workspace_name"]=None
    # deployment_worker_info["built_in_model_path"]=None
    # deployment_worker_info["built_in_model_id"]=None
    # deployment_worker_info["checkpoint_load_dir_path_parser"]=None 
    # deployment_worker_info["checkpoint_load_file_path_parser"]=None
    # deployment_worker_info["deployment_num_of_gpu_parser"]=None
    
    deployment_worker_info.update(db.get_deployment_worker_pod_run_info(deployment_worker_id=deployment_worker_id))

    update_deployment_template_info(deployment_worker_info)

    update_test_variable_and_db(deployment_worker_info)

    return deployment_worker_info


def update_test_variable_and_db(deployment_worker_info):
    """
    Description: Update the test variable and data form in deployment.

    Args:
        deployment_worker_info (dict): get_deployment_worker_info 를 통해 받은 dictionary

    Raises:
        DeploymentDataFormDBInsertError
        DeploymentDBUpdateInputTypeError
    """    
    # insert deployment data form
    from deployment import  init_current_deployment_data_form
    deployment_id=deployment_worker_info["deployment_id"]
    deployment_form_list=deployment_worker_info.get("deployment_form_list")
    init_result, message = init_current_deployment_data_form(deployment_id=deployment_id, 
                                                        built_in_model_id=deployment_worker_info.get("built_in_model_id"),
                                                        deployment_form_list=deployment_form_list)
    if init_result == False:
        print(message)
        raise DeploymentDataFormDBInsertError

    # Update data input type
    if deployment_form_list:
        deployment_worker_info["input_type"] = ",".join([ deployement_form["category"] for deployement_form in deployment_form_list])
    update_result, message = db.update_deployment_input_type(deployment_id=deployment_id, input_type=deployment_worker_info.get("input_type"))
    if update_result == False:
        print(message)
        raise DeploymentDBUpdateInputTypeError

# 템플릿 적용
def run_deployment_worker(deployment_worker_id, headers_user):
    """
    Description : Run Deployment Worker

    Args :
        deployment_worker_id (int) 
        headers_user (str) : user name. from self.check_user()

    Returns :
        response()
    """
    try:
        deployment_worker_info = get_deployment_worker_info(deployment_worker_id=deployment_worker_id)

        run_result = ""
        message = ""
        # with jf_scheduler_lock:
        check_result = scheduler.check_immediate_running_item_resource_new(requested_gpu_count=deployment_worker_info['gpu_count'], gpu_usage_type=DEPLOYMENT_TYPE, 
                                            workspace_id=deployment_worker_info["workspace_id"], rdma_option=0, 
                                            gpu_model=deployment_worker_info["gpu_model"], node_name=deployment_worker_info["node_name"])

        if check_result is not None:
            deployment_worker_info["executor_id"] = db.get_user(user_name=headers_user)["id"]
            deployment_worker_info["executor_name"] = headers_user
            deployment_worker_info[DEPLOYMENT_API_MODE_LABEL_KEY] = DEPLOYMENT_API_MODE
            run_result, message = create_deployment_pod(deployment_worker_info, check_result["node_groups"])

        else:
            run_result = False
            message = "No Resource"

        if run_result:
            return response(status=1, message="Deployment Run")
        else:
            return response(status=0, message="Deployment Cannot Run : [{}]".format(message))
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Deployment Cannot Run")

# 템플릿 적용
def run_deployment_worker_new_method(deployment_worker_id, headers_user):
    """
    Description :

    Args :
        deployment_worker_id (int) 
        headers_user (str) : user name. from self.check_user()

    Returns :
        response()
    """
    try:
        print("Run deployment worker - method TEST")
        deployment_worker_info = get_deployment_worker_info(deployment_worker_id=deployment_worker_id)

        run_result = ""
        message = ""

        check_result = scheduler.check_immediate_running_item_resource_new(requested_gpu_count=deployment_worker_info['gpu_count'], gpu_usage_type=DEPLOYMENT_TYPE, 
                                                    workspace_id=deployment_worker_info["workspace_id"], rdma_option=0, 
                                                    gpu_model=deployment_worker_info["gpu_model"], node_name=deployment_worker_info["node_name"])

        if check_result is not None:
            executor_id = db.get_user(user_name=headers_user)["id"]
            executor_name = headers_user
            owner_name = deployment_worker_info["owner_name"]

            # ENV/Volume/Label 용 정보
            workspace_id = deployment_worker_info["workspace_id"]
            workspace_name = deployment_worker_info["workspace_name"]
            deployment_id = deployment_worker_info["deployment_id"]
            deployment_name = deployment_worker_info["deployment_name"]
            deployment_worker_id = deployment_worker_info["deployment_worker_id"]
            deployment_type = deployment_worker_info["deployment_type"]
            deployment_template_type = deployment_worker_info[DEPLOYMENT_TEMPLATE_TYPE_KEY]

            # Pod 기반 정보
            total_gpu_count = deployment_worker_info["gpu_count"]
            node_info = check_result.node_info_list[0]
            docker_image_real_name = deployment_worker_info["image_real_name"]

            # Optional
            training_name = deployment_worker_info.get("training_name")
            mounts = deployment_worker_info.get(DEPLOYMENT_TEMPLATE_MOUNT_KEY)
            environments = deployment_worker_info.get(DEPLOYMENT_TEMPLATE_ENVIRONMENTS_KEY)
            workdir = deployment_worker_info.get(DEPLOYMENT_TEMPLATE_WORKING_DIRECTORY_KEY)
            api_path = deployment_worker_info.get("api_path")
            built_in_model_path = deployment_worker_info.get("built_in_model_path")
            checkpoint_dir_path = deployment_worker_info.get("checkpoint_dir_path")
            deployment_api_mode = DEPLOYMENT_API_MODE
            

            # 실행 정보
            run_code = get_deployment_run_code(deployment_worker_info=deployment_worker_info)

            run_result, message = create_deployment_pod_new_method(workspace_id=workspace_id, workspace_name=workspace_name, deployment_id=deployment_id, deployment_name=deployment_name, 
                                            deployment_worker_id=deployment_worker_id, executor_id=executor_id, executor_name=executor_name, owner_name=owner_name, 
                                            deployment_type=deployment_type, deployment_template_type=deployment_template_type, training_name=training_name,
                                            node_info=node_info, total_gpu_count=total_gpu_count,
                                            deployment_api_mode=deployment_api_mode, run_code=run_code, docker_image_real_name=docker_image_real_name,
                                            built_in_model_path=built_in_model_path, checkpoint_dir_path=checkpoint_dir_path, 
                                            mounts=mounts, environments=environments, workdir=workdir,
                                            api_path=api_path, gpu_uuid_list=None, parent_deployment_worker_id=None)
        else:
            run_result = False
            message = "No Resource"

        if run_result:
            return response(status=1, message="Deployment Run")
        else:
            print("Deployment Cannot Run : [{}]".format(message))
            raise DeploymentCreatePodError
            # return response(status=0, message="Deployment Cannot Run : [{}]".format(message))
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Deployment Cannot Run")

# template 삭제
def get_deployment_worker_info_o(deployment_worker_id):
    from deployment import load_custom_api_system_info_to_json, init_current_deployment_data_form, get_deployment_type_info
    # deployment_worker_id, deployment_id, deployment_name, deployment_type, workspace_name, gpu_count, gpu_model
    # image, owner_name, training_name, workspace_id, input_type, run_code
    # deployment_worker_info = db.get_deployment_worker_run_minimum_info(deployment_worker_id=deployment_worker_id)
    # deployment_id = db.get_deployment_worker(deployment_worker_id=deployment_worker_id).get("deployment_id")
    deployment_worker_info = db.get_deployment_worker_run_minimum_info(deployment_worker_id)
    # deployment_worker_info["deployment_worker_id"]=deployment_worker_id
    deployment_worker_info["checkpoint"]=None
    deployment_worker_info["checkpoint_id"]=None
    deployment_worker_info["checkpoint_dir_path"]=None
    deployment_worker_info["checkpoint_workspace_name"]=None
    deployment_worker_info["built_in_model_path"]=None
    deployment_worker_info["built_in_model_id"]=None
    deployment_worker_info["checkpoint_load_dir_path_parser"]=None 
    deployment_worker_info["checkpoint_load_file_path_parser"]=None
    deployment_worker_info["deployment_num_of_gpu_parser"]=None
    deployment_form_list=None
    input_type=None
    deployment_id = deployment_worker_info["deployment_id"]

    deployment_running_type = get_deployment_type_info(id=deployment_worker_id, is_worker=True)
    deployment_worker_info["running_type"] = deployment_running_type
    if deployment_running_type==None:
        return response(status=0, message="Deployment Run Type Undefined")

    # CASE 1. Custom - run_code
    # deployment_py_command, deployment_form_list 따로 받기
    # checkpoint_load_dir_path_parser,checkpoint_load_file_path_parser, deployment_num_of_gpu_parser
    if deployment_running_type==DEPLOYMENT_RUN_CUSTOM:
        model_info_json = load_custom_api_system_info_to_json(deployment_id=deployment_id)
        if model_info_json:
            deployment_form_list = model_info_json["deployment_input_data_form_list"]

            for key in ["checkpoint_load_dir_path_parser","checkpoint_load_file_path_parser","deployment_num_of_gpu_parser"]:
                if key in model_info_json.keys():
                    deployment_worker_info[key]=model_info_json[key]

        else:
            deployment_form_list = None
        if '/src/' == deployment_worker_info["run_code"][:5]:
            deployment_worker_info["deployment_py_command"] = deployment_worker_info["run_code"][1:]
        else:
            deployment_worker_info["deployment_py_command"] = deployment_worker_info["run_code"]


    # CASE 2. Built_in - checkpoint_id (checkpoint_id가 built_in_model + checkpoint 파일
    # checkpoint_id, checkpoint_dir_path, checkpoint_workspace_name, built_in_model_path
    elif deployment_running_type==DEPLOYMENT_RUN_CHEKCPOINT:
        additional_info = db.get_deployment_worker_checkpoint_run_info(deployment_worker_id=deployment_worker_id)
        deployment_worker_info.update(additional_info)
        deployment_form_list = db.get_built_in_model_data_deployment_form(deployment_worker_info["built_in_model_id"])

    # CASE 3. Built_in - pretrained - built_in_model run_code
    # CASE 4. Built_in - usertrained - built_in_model run_code + checkpoint_file
    elif deployment_running_type in [DEPLOYMENT_RUN_PRETRAINED, DEPLOYMENT_RUN_USERTRAINED]:
        additional_info = db.get_deployment_worker_built_in_run_info(deployment_worker_id=deployment_worker_id)
        deployment_worker_info.update(additional_info)
        deployment_form_list = db.get_built_in_model_data_deployment_form(deployment_worker_info["built_in_model_id"])

    # Insert data input form
    init_result, message = init_current_deployment_data_form(deployment_id=deployment_id, built_in_model_id=deployment_worker_info["built_in_model_id"],
                                                            deployment_form_list=deployment_form_list)
    if init_result == False:
        raise Exception("Insert deployemnt data form error : {}".format(message))

    # Update data input type
    if deployment_form_list:
        input_type = ",".join([ deployement_form["category"] for deployement_form in deployment_form_list])
    db.update_deployment_input_type(deployment_id=deployment_id, input_type=input_type)

    return deployment_worker_info


def run_deployment_worker_gpu_share(deployment_worker_id, headers_user, force_node_name, gpu_uuid_list, parent_deployment_worker_id):
    try:

        deployment_worker_info = get_deployment_worker_info_o(deployment_worker_id=deployment_worker_id)

        run_result = ""
        message = ""
        
        force_gpu_model = db.get_deployment_worker(deployment_worker_id=deployment_worker_id)["configurations"]
        check_result = scheduler.check_immediate_running_item_resource_force(req_gpu_count=deployment_worker_info['gpu_count'], gpu_model=deployment_worker_info["gpu_model"], 
                                                            force_node_name=force_node_name, force_gpu_model=force_gpu_model)

        if check_result["flag"] == True:
            deployment_worker_info["executor_id"] = db.get_user(user_name=headers_user)["id"]
            deployment_worker_info["executor_name"] = headers_user
            deployment_worker_info[DEPLOYMENT_API_MODE_LABEL_KEY] = DEPLOYMENT_API_MODE
            run_result, message = create_deployment_pod(pod_info=deployment_worker_info, node_groups=check_result["node_groups"], 
                                                        gpu_uuid_list=gpu_uuid_list, parent_deployment_worker_id=parent_deployment_worker_id)

        else:
            run_result = False
            message = check_result["message"]

        if run_result:
            return response(status=1, message="Deployment Run")
        else:
            print("Deployment Cannot Run : [{}]".format(message))
            # return response(status=0, message="Deployment Cannot Run : [{}]".format(message))
            raise DeploymentCreatePodError
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Deployment Cannot Run")


def is_parent_deployment_worker(deployment_worker_id):
    pod_list = kube.kube_data.get_pod_list()
    item_list = kube.find_kuber_item_name_and_item(item_list=pod_list, deployment_worker_id=deployment_worker_id)
    
    if len(item_list) == 0:
        raise ItemNotExistError
        
    deployment_worker_labels = kube.get_pod_item_labels(pod_list=pod_list, deployment_worker_id=deployment_worker_id)
    parent_deployment_worker_id = deployment_worker_labels.get(PARENT_DEPLOYMENT_WORKER_ID_LABEL_KEY)
    if str(deployment_worker_id) == str(parent_deployment_worker_id):
        return True
    else :
        return False

def stop_deployment_worker(deployment_worker_id):
    try:
        # 종료 하려는 deployment worker 의 pod이 parent_deployment_worker 인 경우와 아닌 경우로 구분하여 처리 필요
        pod_list = kube.kube_data.get_pod_list()
        worker_exist = kube.get_pod_count(pod_list=pod_list, deployment_worker_id=deployment_worker_id)
        if worker_exist == 0:
            raise StopDeploymentWorkerNotExistError
            # return response(status=0, message="Worker not running")

        deployment_worker_info = db.get_deployment_worker(deployment_worker_id=deployment_worker_id)
        deployment_id = deployment_worker_info["deployment_id"]
        pod_count = kube.get_pod_count(pod_list=pod_list, deployment_id=deployment_id)

        if is_parent_deployment_worker(deployment_worker_id=deployment_worker_id):
            # Parent Deployment Worker를 종료 시 

            child_pod_count = kube.get_pod_count(pod_list=pod_list, parent_deployment_worker_id=deployment_worker_id)
            left_pod_count = pod_count - child_pod_count # paranet group pod count 
            
            if left_pod_count > 0:
                # 종료될 child_pod을 제외하고 Pod이 하나라도 남아 있으면 service, ingress 유지
                res, message = kube.kuber_item_remove(parent_deployment_worker_id=deployment_worker_id, no_delete_service=True, no_delete_ingress=True)
            else:
                # 종료될 child_pod이 곧 전체 Pod
                res, message = kube.kuber_item_remove(deployment_id=deployment_id)
        else:
            # Child Pod 종료 및 일반 종료

            if pod_count > 1:
                # worker만 종료 
                print("REMOVE ONLY WORKER")
                res, message = kube.kuber_item_remove(deployment_worker_id=deployment_worker_id, no_delete_service=True, no_delete_ingress=True)
            else :
                # worker 전부 종료 = service ingress 회수
                # deployment_id로 된 모든 자원 회수
                print("REMOVE ALL WORKER")
                res, message = kube.kuber_item_remove(deployment_id=deployment_id)

        res = 1 if res == True else 0
        # Worker 종료 시 최신화 된 정보를 전달해주기 위해
        kube.kube_data.update_all_list()
        return response(status=res, message=message)

    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Deployment Cannot Stop {}".format(str(e)))

def stop_deployment_worker_with_delete(deployment_worker_id):
    return delete_deployment_worker(deployment_worker_id=deployment_worker_id)

def delete_deployment_worker(deployment_worker_id):
    try:
        stop_deployment_worker(deployment_worker_id=deployment_worker_id)
        info = db.get_deployment_worker_name_info(deployment_worker_id=deployment_worker_id)

        deployment_worker_log_dir = JF_DEPLOYMENT_WORKER_LOG_DIR_PATH.format(workspace_name=info["workspace_name"],
                                                                            deployment_name=info["deployment_name"],
                                                                            deployment_worker_id=deployment_worker_id)
        if os.path.isdir(deployment_worker_log_dir):
            os.system("rm -r {}".format(deployment_worker_log_dir))
        res, message = db.delete_deployment_worker(deployment_worker_id)
        if res:
            return response(status=1, message="OK")
        else:
            print("Delete Deployment Worker Error: {}".format(message))
            raise DeleteDeploymentWorkerDBError
    except CustomErrorList as ce:
        traceback.print_exc()
        return ce.response()
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Delete Deployment worker error : {}".format(e))

def delete_deployment_workers(deployment_worker_id_list):
    try:
        deployment_worker_id_list=[i.strip() for i in deployment_worker_id_list.split(",")]
        for deployment_worker_id in deployment_worker_id_list:
            stop_deployment_worker(deployment_worker_id=deployment_worker_id)
            info = db.get_deployment_worker_name_info(deployment_worker_id=deployment_worker_id)

            deployment_worker_log_dir = JF_DEPLOYMENT_WORKER_LOG_DIR_PATH.format(workspace_name=info["workspace_name"], 
                                                                                deployment_name=info["deployment_name"],
                                                                                deployment_worker_id=deployment_worker_id)
            if os.path.isdir(deployment_worker_log_dir):
                os.system("rm -r {}".format(deployment_worker_log_dir))
        res, message = db.delete_deployment_workers(deployment_worker_id_list)
        if res:
            return response(status=1, message="OK")
        else:
            print("Delete Deployment Worker Error: {}".format(message))
            raise DeleteDeploymentWorkerDBError
    except CustomErrorList as ce:
        traceback.print_exc()
        return ce.response()
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Delete Deployment worker error : {}".format(e))

def update_deployment_worker_description(deployment_worker_id, description):
    try:

        update_result, message = db.update_deployment_worker_description(deployment_worker_id=deployment_worker_id, description=description)
        if update_result:
            return response(status=1, message="Updated")
        else:
            print("Deployment Worker description update error : {}".format(message))
            raise DeploymentWorkerDescriptionDBUpdateError
            # return response(status=0, message="Deployment Worker description update error : {}".format(message))


    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Deployment Worker description update error : {}".format(e))

def check_deployment_api_monitor_import(file_list):
    if POD_API_LOG_IMPORT_CHECK_FILE_NAME in file_list:
        # API MONITOR IMPORTED
        return True
    else:
        return False

def check_deployment_worker_log_file(workspace_name, deployment_name, deployment_worker_id, nginx_log=True, api_log=True):
    result = {
        "error": 0,
        "message": "",
        "monitor_log": [],
        "nginx_access_log": []
    }

    deployment_worker_log_dir = JF_DEPLOYMENT_WORKER_LOG_DIR_PATH.format(workspace_name=workspace_name, deployment_name=deployment_name, deployment_worker_id=deployment_worker_id)
    try :
        worker_log_dir_file_list = os.listdir(deployment_worker_log_dir)
    except OSError as ose:
        # No log
        result["error"] = 1
        result["message"] = "No Log"
        return result
    except Exception as e:
        traceback.print_exc()
        # Unknown error
        result["error"] = 1
        result["message"] = "Unknown error {}".format(e)
        return result

    if check_deployment_api_monitor_import(worker_log_dir_file_list) == False:
        # api monitor not imported
        result["message"] = "API Monitor Not Imported"
    
    monitor_file_path = "{}/{}".format(deployment_worker_log_dir, POD_API_LOG_FILE_NAME)
    nginx_access_file_path = "{}/{}".format(deployment_worker_log_dir, POD_NGINX_ACCESS_LOG_FILE_NAME)

    # monitor.txt 의 time, response_time 추출해 list 에 담기
    if api_log:
        try:
            with open(monitor_file_path, "r") as f:
                monitor_log = f.read().splitlines()
        except:
            monitor_log = []
            result["message"] = "No Monitor Log"
        result["monitor_log"] = monitor_log
        
    if nginx_log:
        try:
            with open(nginx_access_file_path, "r") as f:
                nginx_access_log = f.read().splitlines()
        except:
            print("NGINX ACCESS LOG ERROR ")
            traceback.print_exc()
            nginx_access_log = []
            result["message"] = "No Nginx Log"
        result["nginx_access_log"] = nginx_access_log
    return result

def check_deployment_worker_log_dir(workspace_name, deployment_name, start_time=None, end_time=None, deployment_worker_id=None):
    result = {
        "error":1,
        "message":"No worker made",
        "log_dir":[]
    }
    if start_time==None:
        start_time_ts=0
    else:
        start_time_ts=common.date_str_to_timestamp(start_time)
    if end_time==None:
        end_time_ts=30000000000
    else:
        end_time_ts=common.date_str_to_timestamp(end_time)
    log_dir_path = JF_DEPLOYMENT_PATH.format(workspace_name=workspace_name, deployment_name=deployment_name)+"/log"
    if os.path.exists(log_dir_path)==False:
        return result
    if deployment_worker_id!=None:
        log_dir_list = [str(deployment_worker_id)]
    else:
        log_dir_list = os.listdir(log_dir_path)
    for log_dir in log_dir_list:
        if os.path.isdir(os.path.join(log_dir_path, str(log_dir))):
            deployment_worker_run_time_file_path = GET_POD_RUN_TIME_FILE_PATH_IN_JF_API(workspace_name=workspace_name,
                                                                                        deployment_name=deployment_name,
                                                                                        deployment_worker_id=int(log_dir))
            if os.path.exists(deployment_worker_run_time_file_path):
                run_time_info=common.load_json_file(deployment_worker_run_time_file_path) # 경우에 따라서는 retry를 하지 않아도 되는 상황이 생길 수 있음
                if run_time_info !=None:
                # try:
                    run_start_ts = common.date_str_to_timestamp(run_time_info["start_time"])
                    run_end_ts = common.date_str_to_timestamp(run_time_info["end_time"])
                    if run_start_ts>end_time_ts or run_end_ts<start_time_ts:
                        result["message"]="No worker in time range"
                    else:
                        result["log_dir"].append(log_dir)
                # try:
                #     with open(deployment_worker_run_time_file_path, "r") as f:
                #         run_time_data = f.read()
                #         run_time_info = json.loads(run_time_data)
                #     run_start_ts = common.date_str_to_timestamp(run_time_info["start_time"])
                #     run_end_ts = common.date_str_to_timestamp(run_time_info["end_time"])
                #     if run_start_ts>end_time_ts or run_end_ts<start_time_ts:
                #         result["message"]="No worker in time range"
                #     else:
                #         result["log_dir"].append(log_dir)
                # except:
                #     traceback.print_exc()
                #     continue
            elif check_worker_dir_and_install(workspace_name, deployment_name, [log_dir])==False:
                result["message"]="Worker Installing"
    if len(result["log_dir"])==0:
        return result
    result["error"]=0
    result["message"]=""
    return result

def get_graph_log(end_time, start_time=None, deployment_id=None, deployment_worker_id=None, worker_list=None, nginx_log=True, api_log=True):
    from ast import literal_eval
    import time
    result={
        "error": 0,
        "message": "",
        "monitor_log": [],
        "nginx_access_log": [],
        "deployment_worker_id":None
    }
    if deployment_id!=None:
        info = db.get_deployment_name_info(deployment_id=deployment_id)
    elif deployment_worker_id!=None:
        info = db.get_deployment_worker_name_info(deployment_worker_id=deployment_worker_id)
    else:
        return None
    workspace_name = info.get("workspace_name")
    deployment_name = info.get("deployment_name")
    result_list = []
    if worker_list==None:
        log_dir_result = check_deployment_worker_log_dir(start_time=start_time, end_time=end_time,
                                                                workspace_name=workspace_name, deployment_name=deployment_name,
                                                                deployment_worker_id=deployment_worker_id)
        if log_dir_result["error"]==1:
            result["error"]=1
            result["message"]=log_dir_result["message"]
            result_list=[result]
            return result_list
        else:
            worker_list = log_dir_result["log_dir"]
    # else:
    # load_file_time=time.time()
    for log_dir in worker_list:
        result = check_deployment_worker_log_file(workspace_name, deployment_name, log_dir, nginx_log, api_log)
        result["deployment_worker_id"]=int(log_dir)
        result_list.append(result)
    # str 을 dic 형태로 변경
    # dic_log_time=time.time()
    if nginx_log:
        for result in result_list:
            result["nginx_access_log"] = [json.loads(dic) for dic in result["nginx_access_log"]]
    if api_log:
        for result in result_list:
            try:
                result["monitor_log"] = [json.loads(dic.replace("\'", "\"")) for dic in result["monitor_log"]]
            except:
                try:
                    result["monitor_log"] = [literal_eval(dic) for dic in result["monitor_log"]]
                except:
                    pass
    return result_list

def get_deployment_worker_nginx_call_count(workspace_name, deployment_name, deployment_worker_id):

    nginx_log_count_file = GET_POD_NGINX_LOG_COUNT_FILE_PATH_IN_JF_API(workspace_name=workspace_name, deployment_name=deployment_name, deployment_worker_id=deployment_worker_id)
    try:
        
        nginx_log_count_info = common.load_json_file(file_path=nginx_log_count_file)
        return nginx_log_count_info.get("total_count")
    except:
        traceback.print_exc()
        return None

def get_file_line_count(file_path, file_name):
    cmd = "cd {} && cat {} | wc -l".format(file_path, file_name)
    return int(subprocess.check_output(cmd, shell=True).strip().decode())

# def get_dir_size(dir_path):
#     cmd = "cd {} && du -b".format(dir_path)
#     out = subprocess.check_output(cmd, shell=True).strip().decode()
#     try:
#         out = out.split("\t")[0]
#         return int(out)
#     except:
#         traceback.print_exc()
#         return None

def get_deployment_worker_log_size(workspace_name, deployment_name, deployment_worker_id):
    # NGINX_ACCESS_LOG + API_MONITOR_LOG FILE
    deployment_worker_log_dir = JF_DEPLOYMENT_WORKER_LOG_DIR_PATH.format(workspace_name=workspace_name, 
                                                                        deployment_name=deployment_name, 
                                                                        deployment_worker_id=int(deployment_worker_id))
    total_log_size = 0
    for file_name in [POD_NGINX_ACCESS_LOG_FILE_NAME, POD_API_LOG_FILE_NAME]:
        if os.path.exists("{}/{}".format(deployment_worker_log_dir, file_name)):
            log_size = get_dir_size("{}/{}".format(deployment_worker_log_dir, file_name))
        else:
            log_size = 0
        if log_size is not None:
            total_log_size += log_size
        
    return total_log_size

def get_dir_size(file_path):
    if os.path.exists(file_path):
        cmd = "du -b {}".format(file_path)
        out = subprocess.check_output(cmd, shell=True).strip().decode()
        try:
            out = out.split("\t")[0]
            return int(out)
        except:
            traceback.print_exc()
            return None
    else:
        return 0

def get_nginx_success_count(file_path):
    result=0
    for i in [2,3]:
        grep_str = '"status": "{}[0-9][0-9]"'.format(i)
        cmd = "cd {} &&grep '{}' {} |wc -l".format(file_path, grep_str, POD_NGINX_ACCESS_LOG_FILE_NAME)
        result += int(subprocess.check_output(cmd, shell=True).strip().decode())
    return result

def get_log_size(workspace_name, deployment_name, deployment_worker_id_list=None):
    if deployment_worker_id_list is None:
        deployment_worker_id_list = check_deployment_worker_log_dir(workspace_name=workspace_name, deployment_name=deployment_name)["log_dir"]
    else :
        pass
    total_log_size_list=[]
    for deployment_worker_id in deployment_worker_id_list:
        deployment_worker_log_dir = JF_DEPLOYMENT_WORKER_LOG_DIR_PATH.format(workspace_name=workspace_name, 
                                                                            deployment_name=deployment_name, 
                                                                            deployment_worker_id=int(deployment_worker_id))
        log_size = get_dir_size(deployment_worker_log_dir)
        if log_size !=None:
            total_log_size_list.append(log_size)
        # for file_name in [POD_NGINX_ACCESS_LOG_FILE_NAME, POD_API_LOG_FILE_NAME]:
        #     if os.path.exists("{}/{}".format(deployment_worker_log_dir, file_name)):
        #         log_size = get_dir_size("{}/{}".format(deployment_worker_log_dir, file_name))
        #     else:
        #         log_size = 0
        #     if log_size !=None:
        #         total_log_size_list.append(log_size)
    return sum(total_log_size_list)
        
def get_deployment_api_total_count_info(worker_dir_list, workspace_name, deployment_name):
    # worker_dir_list = worker id list
    import time
    ndigits=3
    result={
        "total_call_count": 0,
        "total_success_rate":0,
        "total_log_size":0,
        "restart_count": 0
    }
    total_call_count=0
    # total_success=0
    total_nginx_success=0
    total_log_size_list=[]
    check_import_list=[]
    for worker_id_str in worker_dir_list:
        deployment_worker_log_dir = JF_DEPLOYMENT_WORKER_LOG_DIR_PATH.format(workspace_name=workspace_name, 
                                                                            deployment_name=deployment_name, 
                                                                            deployment_worker_id=int(worker_id_str))
        try:
            file_list = os.listdir(deployment_worker_log_dir)
        except FileNotFoundError as fne:
            continue
        nginx_count_info={
            "total_count":0,
            "success_count":0
        }
        nginx_log_count_file = GET_POD_NGINX_LOG_COUNT_FILE_PATH_IN_JF_API(workspace_name=workspace_name, deployment_name=deployment_name, deployment_worker_id=int(worker_id_str))

        if os.path.exists(nginx_log_count_file):
            data = common.load_json_file(file_path=nginx_log_count_file)
            if data is not None:
                nginx_count_info = data
            # try:
            #     for i in range(5):
            #         with open(nginx_log_count_file, "r") as f:
            #             nginx_count_info=json.load(f)
            # except:
            #     pass
        nginx_count=nginx_count_info["total_count"]
        # nginx_count = get_file_line_count(deployment_worker_log_dir, POD_NGINX_ACCESS_LOG_FILE_NAME)
        total_call_count+=nginx_count
        log_size = get_dir_size(deployment_worker_log_dir)
        if log_size !=None:
            total_log_size_list.append(log_size)
        check_import=check_deployment_api_monitor_import(file_list=file_list)
        check_import_list.append(check_import)
        # success = get_nginx_success_count(deployment_worker_log_dir)
        nginx_success = nginx_count_info["success_count"]
        # if check_import:
        #     try:
        #         monitor_count_file_path = "{}/{}".format(deployment_worker_log_dir, POD_API_LOG_COUNT_FILE_NAME)
        #         with open(monitor_count_file_path, "r") as f:
        #             monitor_count_info = literal_eval(f.read())
        #         success = monitor_count_info["success"]
        #     except:
        #         success = 0
        #     total_success+=success
        total_nginx_success+=nginx_success

    result["total_call_count"]=total_call_count
    result["total_success_rate"]=round((total_nginx_success/total_call_count)*100, ndigits=ndigits) if total_call_count>0 else 0

    result["total_log_size"]=sum(total_log_size_list)
    # result["restart_count"]="dummy"
    return result

def get_deployment_resource_info(worker_dir_list, deployment_id=None, deployment_worker_id=None):
    ndigits=3
    result = {
        "cpu_usage_rate":{
            "min": 0,
            "max": 0,
            "average": 0
        },
        "ram_usage_rate":{
            "min": 0,
            "max": 0,
            "average":0
        },
        "gpu_mem_usage_rate":{
            "min": 0,
            "max": 0,
            "average":0
        },
        "gpu_core_usage_rate":{
            "min": 0,
            "max": 0,
            "average":0
        },
        "gpu_use_mem":0,
        "gpu_total_mem":0,
        "gpu_mem_unit":"MiB"
    }
    if len(worker_dir_list)==0:
        return result
    pod_list = kube_data.get_pod_list()
    rate_dic={
        "cpu_usage_rate":[],
        "ram_usage_rate":[],
        "gpu_mem_usage_rate":[],
        "gpu_core_usage_rate":[],
        "worker_id":[],
        "gpu_use_mem":[],
        "gpu_total_mem":[]
    }
    for worker_id_str in worker_dir_list:
        # get cpu info
        rate_dic["worker_id"].append(int(worker_id_str))
        cpu_info = kube.get_pod_cpu_ram_usage_info(pod_list = pod_list, deployment_worker_id = int(worker_id_str))
        if cpu_info!=None:
            rate_dic["cpu_usage_rate"].append(cpu_info.get(CPU_USAGE_ON_POD_KEY))
            rate_dic["ram_usage_rate"].append(cpu_info.get(MEM_USAGE_PER_KEY))
        else:
            # index 통해 min max worker id 구하기 위해서
            rate_dic["cpu_usage_rate"].append(0)
            rate_dic["ram_usage_rate"].append(0)
        # get gpu info
        gpu_info = kube.get_pod_gpu_usage_info(pod_list = pod_list, deployment_worker_id = int(worker_id_str))
        # if gpu_info!=None and gpu_info["recordable"]==True:
        gpu_core_usage_rate_sum=0
        gpu_mem_usage_rate_sum=0
        gpu_use_mem_sum=0
        gpu_total_mem_sum=0
        if gpu_info!=None:
            gpu_core_usage_rate=[]
            gpu_mem_usage_rate=[]
            gpu_use_mem=[]
            gpu_total_mem=[]
            gpu_info_key=list(gpu_info.keys())
            # gpu_info_key.remove("recordable")
            gpu_count=0
            for key in gpu_info_key:
                if gpu_info[key].get("recordable")!=False:
                    gpu_core_usage_rate.append(gpu_info[key].get(GPU_UTIL_KEY))
                    gpu_mem_usage_rate.append(gpu_info[key].get(GPU_MEM_USED_KEY)/gpu_info[key].get(GPU_MEM_TOTAL_KEY)*100)
                    gpu_use_mem.append(gpu_info[key].get(GPU_MEM_USED_KEY))
                    gpu_total_mem.append(gpu_info[key].get(GPU_MEM_TOTAL_KEY))
                    gpu_count+=1
            if gpu_count!=0:
                gpu_core_usage_rate_sum=sum(gpu_core_usage_rate)/len(gpu_info.keys())
                gpu_mem_usage_rate_sum=(sum(gpu_use_mem)/sum(gpu_total_mem))*100
                gpu_use_mem_sum=sum(gpu_use_mem)
                gpu_total_mem_sum=sum(gpu_total_mem)

        # index 통해 min max worker id 구하기 위해서
        rate_dic["gpu_core_usage_rate"].append(gpu_core_usage_rate_sum)
        rate_dic["gpu_mem_usage_rate"].append(gpu_mem_usage_rate_sum)
        rate_dic["gpu_use_mem"].append(gpu_use_mem_sum)
        rate_dic["gpu_total_mem"].append(gpu_total_mem_sum)
    resource_key_list = list(rate_dic.keys())
    resource_key_list.remove("worker_id")
    resource_key_list.remove("gpu_use_mem")
    resource_key_list.remove("gpu_total_mem")
    for key in resource_key_list:
        result[key]["average"]=get_statistic_result([i for i in rate_dic[key] if i>0], logic="mean", ndigits=ndigits)
        result[key]["min"]=get_statistic_result([i for i in rate_dic[key] if i>0], logic="min", ndigits=ndigits)
        result[key]["max"]=get_statistic_result([i for i in rate_dic[key] if i>0], logic="max", ndigits=ndigits)
        if result[key]["min"]!=result[key]["max"]:
            result[key]["min_worker_id"]=rate_dic["worker_id"][rate_dic[key].index(min([i for i in rate_dic[key] if i>0]))]
            result[key]["max_worker_id"]=rate_dic["worker_id"][rate_dic[key].index(max(rate_dic[key]))]
    for key in ["gpu_use_mem", "gpu_total_mem"]:
        result[key]=sum(rate_dic[key])
    return result

def check_worker_dir_and_install(workspace_name, deployment_name, worker_dir_list): 
    worker_dir_list=[str(i) for i in worker_dir_list]
    status_list=[]
    for worker_id_str in worker_dir_list:
        deployment_worker_log_dir = JF_DEPLOYMENT_WORKER_LOG_DIR_PATH.format(workspace_name=workspace_name, 
                                                                            deployment_name=deployment_name, 
                                                                            deployment_worker_id=int(worker_id_str))
        try:
            if POD_NGINX_ACCESS_LOG_FILE_NAME not in os.listdir(deployment_worker_log_dir):
                # return False
                status_list.append(False)
        except FileNotFoundError:
            status_list.append(False)

    if len(status_list)==len(worker_dir_list):
        return False
    return True

def get_deployment_worker_dashboard_status(deployment_worker_id): 
    try:
        # from utils.kube_pod_status import get_deployment_worker_status
        info = db.get_deployment_worker_name_info(deployment_worker_id=deployment_worker_id)
        workspace_name = info.get("workspace_name")
        deployment_name = info.get("deployment_name")
        # get count info
        total_info = get_deployment_api_total_count_info(worker_dir_list=[deployment_worker_id], 
                                                        workspace_name=workspace_name, deployment_name=deployment_name)
        # get run time
        total_info["deployment_run_time"]=get_deployment_worker_run_time(workspace_name=workspace_name, deployment_name=deployment_name, 
                                                                        deployment_worker_id=deployment_worker_id)
        # get restart count
        pod_list = kube_data.get_pod_list()
        worker_pod_list=kube.find_kuber_item_name_and_item(item_list=pod_list, deployment_worker_id=deployment_worker_id)
        if len(worker_pod_list)>0:
            total_info["restart_count"]=parsing_pod_restart_count(pod=worker_pod_list[0]["item"])
        else:
            total_info["restart_count"]="unknown"

        result={
            "total_info":total_info,
            "worker_start_time":get_deployment_worker_run_start_time(workspace_name, deployment_name, deployment_worker_id)
        }
        return response(status=1, message="success getting worker dashboard status", result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="get worker dashboard status error")

def get_deployment_worker_dashboard_worker_info(deployment_worker_id):
    from utils.kube_pod_status import get_deployment_worker_status
    try:
        info = db.get_deployment_worker(deployment_worker_id=deployment_worker_id)
        # TODO 템플릿 분기처리 수정 예정 => Lyla 23/02/01
        # if info["template_id"]==None:
        #     get_running_info=get_deployment_running_info_o
        #     job_info = "{}/{}".format(info.get("job_name"), info.get("job_group_index")) if info.get("job_name") !=None else None
        # else:
        #     get_running_info=get_deployment_running_info
        job_info = "{}/{}".format(info.get("job_name"), info.get("job_group_index")) if info.get("job_name") !=None else None
        deployment_worker_running_info = get_deployment_running_info(id=deployment_worker_id, is_worker=True)
        pod_list = kube.kube_data.get_pod_list()
        status = get_deployment_worker_status(deployment_worker_id=id)
        pod_all_resource_info = get_pod_all_resource(pod_list=pod_list, deployment_worker_id=deployment_worker_id, status=status)
        version_type = deployment_worker_running_info.get("type")
        
        checkpoint = deployment_worker_running_info.get("checkpoint")
        # if checkpoint!=None and version_type==DEPLOYMENT_TYPE_A:
        #     if job_info !=None:
        #         # checkpoint = checkpoint[len(job_info)+1:]
        #         checkpoint = checkpoint.split(job_info)[-1]
        
        result = {
            "description": info.get("description"),
            "resource_info": {
                # "configuration" : "[temp]NVIDIA GeForce GTX 1080 Ti x 2ea,NVIDIA GeForce RTX 3060".split(","),
                "configuration": info.get("configurations").split(","),
                "node_name": "",# info.get("node_name"),
                "cpu_cores": pod_all_resource_info["cpu_cores"],
                "ram": pod_all_resource_info["ram"]
            },
            "version_info": {
                "create_datetime": info.get("create_datetime"),
                "docker_image": deployment_worker_running_info.get("docker_image"),
                "type": version_type,
                "training_name": deployment_worker_running_info.get("training_name"),
                "built_in_model_name": deployment_worker_running_info.get("built_in_model_name"),
                "run_code": deployment_worker_running_info.get("run_code"),
                "job_info": job_info,
                "checkpoint": checkpoint,
                "end_datetime": info.get("end_datetime")
            },
            "version_info_changed": check_deployment_worker_version_change(deployment_worker_id)
            # "running_info": deployment_worker_running_info
        }
        return response(status=1, result=result)
    except:
        traceback.print_exc()
        return response(status=0, message="Dashboard Worker info get error")


def get_deployment_worker_log_download(deployment_worker_id, start_time, end_time, nginx_log, api_log):
    try:
        from deployment import get_worker_info_dic, download_logfile
        info = db.get_deployment_worker_name_info(deployment_worker_id=deployment_worker_id)
        workspace_name = info.get("workspace_name")
        deployment_name = info.get("deployment_name")
        log_dir_path = JF_DEPLOYMENT_PATH.format(workspace_name=workspace_name, deployment_name=deployment_name)+"/log"
        deployment_path = JF_DEPLOYMENT_PATH.format(workspace_name=workspace_name, deployment_name=deployment_name)
        # get log filter by worker => log_worker_list
        worker_info = get_worker_info_dic(start_time=start_time, end_time=end_time, worker_list=[deployment_worker_id], deployment_path=deployment_path)
        if len(worker_info)==0:
            return response(status=0, message="No log in input time range")
        log_worker_list = worker_info.keys()
        # log worker list 통해 log list 받기 => [{"nginx_access_log":[], "monitor_log":[], "deployment_worker_id": },..]
        result_list = get_graph_log(start_time=start_time, end_time=end_time, deployment_worker_id=deployment_worker_id, 
                                    worker_list=log_worker_list, nginx_log=nginx_log, api_log=api_log)
        if len(result_list)==0:
            return response(status=0, message="unknown error")
        # worker 없는경우
        if len(result_list)==sum(result_list[i].get("error") for i in range(len(result_list))):
            return response(status=0, message=result_list[0]["message"])
        # log file download
        result = download_logfile(result_list, worker_info, deployment_path, start_time, end_time, nginx_log, api_log, deployment_name)
        return result

    except Exception as e:
        traceback.print_exc()
        # os.system('rm -r {}'.format(save_dir_name))
        return response(status=0, message="downloading log error")

def get_deployment_worker_resource_usage_graph(deployment_worker_id, interval):
    max_len = 300
    def get_gpu_history(pod_list, deployment_worker_id):
        def update_gpu_history_len(gpu_history):
            for gpu_id in gpu_history.keys():
                gpu_history[gpu_id] = gpu_history[gpu_id][-max_len:]

        gpu_history = {}
        gpu_history_data = kube.get_pod_gpu_usage_history_info(pod_list=pod_list, deployment_worker_id=deployment_worker_id)
        if gpu_history_data is None:
            return gpu_history
        
        origin_log_len = len(gpu_history_data)
        new_max_len = max_len
        if origin_log_len > max_len:
            new_max_len += (origin_log_len - max_len) % 10

        gpu_history_data = gpu_history_data[-new_max_len:]
        try:
            for i, gpu_usage_data in enumerate(gpu_history_data):
                # gpu_usage_data = json.loads(gpu_usage_data)
                for key in gpu_usage_data.keys():
                    if gpu_history.get(key) is None:
                        gpu_history[key] = []
                    if i >= max_len:
                        break
                    if i % 10 == 0:
                        gpu_history[key].append({
                            "x": i, #gpu_usage_data[key][TIMESTAMP_KEY],
                            GPU_UTIL_KEY: gpu_usage_data[key][GPU_UTIL_KEY],
                            GPU_MEM_UTIL_KEY: gpu_usage_data[key][GPU_MEM_UTIL_KEY],
                            GPU_MEM_USED_KEY: gpu_usage_data[key][GPU_MEM_USED_KEY],
                            GPU_MEM_TOTAL_KEY: gpu_usage_data[key][GPU_MEM_TOTAL_KEY]
                        })
        except:
            traceback.print_exc()
            print("OLD VER")
            update_gpu_history_len(gpu_history)
            
            return gpu_history
        
        update_gpu_history_len(gpu_history)
        return gpu_history

    def get_cpu_ram_history(pod_list, deployment_worker_id):
        pod_usage_history = kube.get_pod_cpu_ram_usage_history_info(pod_list=pod_list, deployment_worker_id=deployment_worker_id)
        if pod_usage_history is None:
            return {
                POD_CPU_HISTORY_KEY: [],
                POD_MEMORY_HISTORY_KEY: []
            }
        
        origin_log_len = len(pod_usage_history)
        new_max_len = max_len
        if origin_log_len > max_len:
            new_max_len += (origin_log_len - max_len) % 10
        cpu_history = []
        mem_history = []
        pod_usage_history = pod_usage_history[-new_max_len:]
        cpu_usage_on_pod = []
        mem_usage = []
        mem_usage_per = []
        for i, pod_usage_data in enumerate(pod_usage_history):
            # pod_usage_data = json.loads(pod_usage_data)
            if i >= max_len:
                break
            if i % 10 == 0:
                cpu_history.append({
                    "x": i,#pod_usage_data[TIMESTAMP_KEY],
                    CPU_USAGE_ON_POD_KEY: min(100, round(float(pod_usage_data[CPU_USAGE_ON_POD_KEY]), 2))
                })
                mem_history.append({
                    "x": i, #pod_usage_data[TIMESTAMP_KEY],
                    MEM_USAGE_KEY: round(float(pod_usage_data[MEM_USAGE_KEY]) ,2),
                    MEM_LIMIT_KEY: pod_usage_data[MEM_LIMIT_KEY] / (1024*1024*1024) ,
                    MEM_USAGE_PER_KEY: round(float(pod_usage_data[MEM_USAGE_PER_KEY]), 2)
                })


        return {
            POD_MEMORY_HISTORY_KEY: mem_history[-500:],
            POD_CPU_HISTORY_KEY: cpu_history[-500:]
        }

    pod_list = kube.kube_data.get_pod_list()
    deployment_worker_status = kube.get_deployment_worker_status(deployment_worker_id=deployment_worker_id, pod_list=pod_list)
    pod_all_resource_info = get_pod_all_resource(pod_list=pod_list, deployment_worker_id=deployment_worker_id, status=deployment_worker_status["status"])
    
    cpu_ram_history = get_cpu_ram_history(pod_list=pod_list, deployment_worker_id=deployment_worker_id)
    history = {
        POD_MEMORY_HISTORY_KEY : cpu_ram_history[POD_MEMORY_HISTORY_KEY],
        POD_CPU_HISTORY_KEY : cpu_ram_history[POD_CPU_HISTORY_KEY],
        POD_GPU_HISTORY_KET : get_gpu_history(pod_list=pod_list, deployment_worker_id=deployment_worker_id),
        "cpu_cores": {
            "cpu_cores_total" : pod_all_resource_info["cpu_cores"], 
            "cpu_cores_usage" : pod_all_resource_info["cpu_cores_usage"]
        },
        "ram": {
            "ram_total": pod_all_resource_info["ram"], 
            "ram_usage": pod_all_resource_info["ram_usage_per"]
        },
        "gpus": pod_all_resource_info["gpus"],
        "network": pod_all_resource_info["network"],
        "status": deployment_worker_status
    }
    # x = timestamp
    # percent = 0  ~ 100

    # history.update(pod_usage_history)
    # cpu_history = [ {"x": base + i, "percent":  random.randint(0,100) } for i in range(300) ] 

    # mem_history = [ {"x": base + i, "percent":  random.randint(0,100) } for i in range(300) ] 

    # history["cpu_history"] = cpu_history
    # history["mem_history"] = mem_history

    return response(status=1, result=history)

def get_worker_system_log(deployment_worker_id):
    """
    Description :
        kubectl logs {} 출력 전달

    Args :
        deployment_worker_id (int)

    """
    try:
        pod_list = kube.kube_data.get_pod_list()
        pod_logs = kube.get_pod_logs(pod_list=pod_list, deployment_worker_id=deployment_worker_id)
        
        # match_item_name_list = kube.find_kuber_item_name(item_list = pod_list, deployment_worker_id=deployment_worker_id)
        # error_log=""
        # if len(match_item_name_list)>0:
        #     # ingress_list = kube_data.get_ingress_list()
        #     cmd = 'kubectl logs {}'.format(match_item_name_list[0])
        #     error_log, *_ = common.launch_on_host(cmd, ignore_stderr=True)
            # error_log = ''.join([cha[1:] for cha in error_log.split("DEPLOYMENT RUNCODE START")[-1].split('\napi_checking ')])
            # error_log = error_log.split("DEPLOYMENT RUNCODE START")[-1]

        # pod_logs = ''.join([cha[1:] for cha in pod_logs.split("DEPLOYMENT RUNCODE START")[-1].split('\napi_checking ')])
        # pod_logs = pod_logs.split("DEPLOYMENT RUNCODE START")[-1]
        return response(status=1, message="Success Getting Deployment Error Log", result=pod_logs)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Error Getting Deployment Error Log")

def get_worker_system_log_download(deployment_worker_id):
    try:
        pod_list = kube.kube_data.get_pod_list()
        pod_logs = kube.get_pod_logs(pod_list=pod_list, deployment_worker_id=deployment_worker_id)
        
        return response(status=1, self_response=common.text_response_generator(data_str=pod_logs))
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Deployment worker system log download error")

# 템플릿 적용
def check_deployment_worker_version_change(deployment_worker_id):
    # from deployment import get_deployment_running_info_o
    from deployment import get_deployment_running_info
    # TODO 추후 db.get_deployment_id_from_worker_id 로 변경 예정
    deployment_worker_info = db.get_deployment_worker(deployment_worker_id=deployment_worker_id)
    deployment_id = deployment_worker_info.get("deployment_id")
    # get_running_info=get_deployment_running_info_o
    # if deployment_worker_info["template_id"] !=None:
    # get_running_info=get_deployment_running_info

    deployment_worker_running_info = get_deployment_running_info(id=deployment_worker_id, is_worker=True)
    deployment_running_info = get_deployment_running_info(id=deployment_id)
    result={
        "changed": False,
        "changed_items": []
    }
    if deployment_worker_running_info!=deployment_running_info:

        # added_list=[]
        # dropped_list=[]
        modified_list = []
        # if set(deployment_worker_running_info.keys())!=set(deployment_running_info.keys()):
        #     added_list = list(set(deployment_worker_running_info.keys())-set(deployment_running_info.keys()))
        #     dropped_list = list(set(deployment_running_info.keys())-set(deployment_worker_running_info.keys()))
        for key in deployment_worker_running_info.keys():
            if deployment_running_info.get(key)!=None:
                if deployment_worker_running_info[key]!=deployment_running_info[key]:
                    modified_list.append({
                        "item": key, 
                        "latest_version": deployment_running_info[key], # 실행 시 반영 될 정보
                        "current_version": deployment_worker_running_info[key] # 이미 실행 된 정보
                    })
        if len(modified_list)>0:
            result["changed"]= True
            # result["changed_items"]={"added":added_list, "droppped":dropped_list, "modified": modified_list}
            result["changed_items"]=modified_list
    return result

def get_deployment_worker_run_time_info(workspace_name, deployment_name, deployment_worker_id, *args, **kwargs):

    deployment_worker_run_time_file_path = GET_POD_RUN_TIME_FILE_PATH_IN_JF_API(workspace_name=workspace_name, deployment_name=deployment_name, deployment_worker_id=deployment_worker_id)
    try:
        data = common.load_json_file(file_path=deployment_worker_run_time_file_path, *args, **kwargs)
        if data is not None:
            run_time_info = data
        else :
            run_time_info = {}

        # with open(deployment_worker_run_time_file_path, "r") as f:
        #     run_time_data = f.read()
        #     run_time_info = json.loads(run_time_data)
    except:
        return {}

    return run_time_info

def get_deployment_worker_run_time(workspace_name, deployment_name, deployment_worker_id):
    run_time_info = get_deployment_worker_run_time_info(workspace_name=workspace_name, deployment_name=deployment_name, deployment_worker_id=deployment_worker_id)
    if run_time_info == {}:
        return None
    else :
        current_start_time_ts = common.date_str_to_timestamp(run_time_info[POD_RUN_TIME_START_TIME_KEY])
        current_end_time_ts = common.date_str_to_timestamp(run_time_info[POD_RUN_TIME_END_TIME_KEY])
        return current_end_time_ts - current_start_time_ts

def get_deployment_worker_run_start_time(workspace_name, deployment_name, deployment_worker_id):
    from datetime import datetime
    run_time_info = get_deployment_worker_run_time_info(workspace_name=workspace_name, deployment_name=deployment_name, deployment_worker_id=deployment_worker_id)
    if run_time_info == {}:
        return datetime.strftime(datetime.now(), POD_RUN_TIME_DATE_FORMAT)
    else :
        return run_time_info[POD_RUN_TIME_START_TIME_KEY]

def get_nginx_per_hour_time_table_dict(log_per_hour_info_list, time_time_count=24):
    if len(log_per_hour_info_list) == 0:
        return {}
    
    try:
        sorted_log_per_hour_info_list = sorted(log_per_hour_info_list, key=lambda log_per_hour_info_list: (log_per_hour_info_list[DEPLOYMENT_NGINX_PER_TIME_KEY]))
    except KeyError as ke:
        traceback.print_exc()
        return {}

    last_time = sorted_log_per_hour_info_list[-1][DEPLOYMENT_NGINX_PER_TIME_KEY]
    last_timestamp = common.date_str_to_timestamp(date_str=last_time, date_format=DEPLOYMENT_NGINX_NUM_OF_LOG_PER_HOUR_DATE_FORMAT)

    time_table = {}
    time_interval = 60 * 60 # test - (hour = 60 * 60)
    # last 24 item time list
    for i in range(time_time_count):
        date_time = common.get_date_time(timestamp=last_timestamp - time_interval * i, date_format=DEPLOYMENT_NGINX_NUM_OF_LOG_PER_HOUR_DATE_FORMAT)
        time_table[str(date_time)] = 0
        
    return time_table

def get_nginx_access_per_hour_chart(time_table, log_per_hour_info_list, data_key):
    time_table = dict(time_table)
    for data in log_per_hour_info_list:
        try:
            common.update_dict_key_count(dict_item=time_table, key=data[DEPLOYMENT_NGINX_PER_TIME_KEY], add_count=data[data_key], exist_only=True)        
        except KeyError as ke:
            # traceback.print_exc()
            pass

    chart_data = list(time_table.values())
    chart_data.reverse()

    # 최소 개수가 24개
    if len(chart_data) < 24:
        dummy = [0] * ( 24 - len(chart_data) )
        chart_data = dummy + chart_data

    return chart_data       

def get_call_count_per_hour_chart(time_table, log_per_hour_info_list):
    return get_nginx_access_per_hour_chart(time_table=time_table, log_per_hour_info_list=log_per_hour_info_list, data_key=DEPLOYMENT_NGINX_PER_TIME_NUM_OF_CALL_LOG_KEY)


def get_median_per_hour_chart(time_table, log_per_hour_info_list):
    return get_nginx_access_per_hour_chart(time_table=time_table, log_per_hour_info_list=log_per_hour_info_list, data_key=DEPLOYMENT_NGINX_PER_TIME_RESPONSE_TIME_MEDIAN_KEY)


def get_nginx_abnormal_call_count_per_hour_chart(time_table, log_per_hour_info_list):
    return get_nginx_access_per_hour_chart(time_table=time_table, log_per_hour_info_list=log_per_hour_info_list, data_key=DEPLOYMENT_NGINX_PER_TIME_NUM_OF_ABNORMAL_LOG_COUNT_KEY)

def get_api_monitor_abnormal_call_count_per_hour_chart(time_table, log_per_hour_info_list):
    return get_nginx_access_per_hour_chart(time_table=time_table, log_per_hour_info_list=log_per_hour_info_list, data_key=DEPLOYMENT_API_MONITOR_PER_TIME_NUM_OF_ABNORMAL_LOG_COUNT_KEY)


def get_deployment_worker_nginx_access_log_per_hour_info_list(deployment_worker_id, workspace_name, deployment_name):

    deployment_worker_nginx_access_log_per_hour_file_path = GET_POD_NGINX_ACCESS_LOG_PER_HOUR_FILE_PATH_IN_JF_API(workspace_name=workspace_name, deployment_name=deployment_name, deployment_worker_id=deployment_worker_id)
    nginx_access_log_per_hour_info_list = []
    try:
        with open(deployment_worker_nginx_access_log_per_hour_file_path, "r") as f:
            per_hour_data_list = f.readlines()
            for per_hour_data in per_hour_data_list:
                nginx_access_log_per_hour_info_list.append(json.loads(per_hour_data))
    except FileNotFoundError as fne:
        return []
    except json.decoder.JSONDecodeError as je:
        return []
    except Exception as e:
        traceback.print_exc()
        return []

    return nginx_access_log_per_hour_info_list

def get_deployment_worker_per_hour_chart_dict(deployment_worker_id, workspace_name, deployment_name):
    log_per_hour_info_list = get_deployment_worker_nginx_access_log_per_hour_info_list(deployment_worker_id=deployment_worker_id, workspace_name=workspace_name, deployment_name=deployment_name)
    time_table = get_nginx_per_hour_time_table_dict(log_per_hour_info_list=log_per_hour_info_list)
    call_count_chart = get_call_count_per_hour_chart(time_table=time_table, log_per_hour_info_list=log_per_hour_info_list)
    median_chart = get_median_per_hour_chart(time_table=time_table, log_per_hour_info_list=log_per_hour_info_list)
    nginx_abnormal_count_chart = get_nginx_abnormal_call_count_per_hour_chart(time_table=time_table, log_per_hour_info_list=log_per_hour_info_list)
    api_monitor_abnormal_count_chart= get_api_monitor_abnormal_call_count_per_hour_chart(time_table=time_table, log_per_hour_info_list=log_per_hour_info_list)

    return {
        "call_count_chart": call_count_chart,
        "median_chart": median_chart,
        "nginx_abnormal_count_chart": nginx_abnormal_count_chart,
        "api_monitor_abnormal_count_chart": api_monitor_abnormal_count_chart
    }    


@ns.route("/worker", methods=['GET','POST','DELETE'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DeploymentWorker(CustomResource):
    @token_checker
    @ns.expect(deployment_worker_list_get)
    def get(self):
        """Deployment Worker 조회"""
        args = deployment_worker_list_get.parse_args()
        deployment_id = args["deployment_id"]
        deployment_worker_running_status = args["deployment_worker_running_status"]

        res = get_deployment_worker_list(deployment_id=deployment_id, deployment_worker_running_status=deployment_worker_running_status, user_id=self.check_user_id())

        return self.send(res)
    @token_checker
    @ns.expect(deployment_worker_add)
    def post(self):
        """Deployment Worker 생성"""
        args = deployment_worker_add.parse_args()
        try:
            deployment_id = args["deployment_id"]

            res = add_deployment_worker_with_run(deployment_id=deployment_id, headers_user=self.check_user())
            return self.send(res)
            
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

    @ns.expect(deployment_worker_delete)
    @token_checker
    @deployment_access_check(deployment_worker_delete, allow_max_level=3)
    def delete(self):
        """Deployment worker 삭제"""
        args = deployment_worker_delete.parse_args()
        try:
            deployment_worker_id_list = args["deployment_worker_id_list"]

            res = delete_deployment_workers(deployment_worker_id_list=deployment_worker_id_list)

            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

@ns.route("/worker-gpu-share", methods=["POST"])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DeploymentWorkerGPUShare(CustomResource):
    @token_checker
    @ns.expect(deployment_worker_gpu_share_add)
    def post(self):
        """Deployment GPU Share 하는 Worker 생성"""
        args = deployment_worker_gpu_share_add.parse_args()
        deployment_worker_id = args["deployment_worker_id"]

        res = add_deployment_worker_with_run_gpu_share(deployment_worker_id=deployment_worker_id, headers_user=self.check_user())

        return self.send(res)


@ns.route("/worker/run", methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DeploymentWorkerRUN(CustomResource):
    @token_checker
    @ns.expect(deployment_worker_run)
    def get(self):
        """Deployment Worker RUN"""
        args = deployment_worker_run.parse_args()
        deployment_worker_id = args["deployment_worker_id"]

        res = run_deployment_worker(deployment_worker_id=deployment_worker_id, headers_user=self.check_user())

        return self.send(res)

@ns.route("/worker/stop", methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DeploymentWorkerSTOP(CustomResource):
    @ns.expect(deployment_worker_stop)
    @token_checker
    @deployment_access_check(deployment_worker_stop)
    def get(self):
        """Deployment Worker STOP"""
        args = deployment_worker_stop.parse_args()   
        try:
            deployment_worker_id = args["deployment_worker_id"]
            # stop_deployment_worker_with_delete(deployment_worker_id=deployment_worker_id)
            res = stop_deployment_worker(deployment_worker_id=deployment_worker_id)

            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

@ns.route("/worker/description", methods=['PUT'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DeploymentWorkerDescriptionUpdate(CustomResource):
    @token_checker
    @ns.expect(deployment_worker_description_update)
    @deployment_access_check(deployment_worker_description_update)
    def put(self):
        """Deployment Worker description update"""
        args = deployment_worker_description_update.parse_args()
        try:
            deployment_worker_id = args["deployment_worker_id"]
            description = args["description"]
            res = update_deployment_worker_description(deployment_worker_id=deployment_worker_id, description=description)

            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))


@ns.route("/worker/dashboard_resource_graph", methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DeploymentWorkerGraph2(CustomResource):
    @token_checker
    @ns.expect(deployment_worker_pod_graph_get)
    def get(self):
        """Deployment Worker Graph"""
        args = deployment_worker_pod_graph_get.parse_args()
        deployment_worker_id = args["deployment_worker_id"]
        interval = args["interval"]

        res = get_deployment_worker_resource_usage_graph(deployment_worker_id=deployment_worker_id, interval=interval)

        return self.send(res)

@ns.route("/worker/system_log/<int:deployment_worker_id>", methods=['GET'], doc={'params': {'deployment_worker_id': 'deployment worker ID'}})
class DeploymentWorkerSystemLog(CustomResource):
    @token_checker
    @ns.expect(deployment_worker_id_parser)
    def get(self, deployment_worker_id):
        """Deployment system log 조회"""
        res = get_worker_system_log(deployment_worker_id=deployment_worker_id)
        return self.send(res)

@ns.route("/worker/system_log_download/<int:deployment_worker_id>", methods=['GET'], doc={'params': {'deployment_worker_id': 'deployment worker ID'}})
class DeploymentWorkerSystemLogDownload(CustomResource):
    @token_checker
    @ns.expect(deployment_worker_id_parser)
    def get(self, deployment_worker_id):
        """
            Deployment System Log Download API 
            ---
            # inputs
            /worker/system_log_download/{deployment_worker_id} (동작 중인 Worker만 다운로드 가능)

            ---
            # returns

                text 다운로드 response
        """
        res = get_worker_system_log_download(deployment_worker_id=deployment_worker_id)
        return self.send(res)


@ns.route("/worker/dashboard_status", methods=["GET"])
class DeploymentWorkerDashboardStatus(CustomResource):
    @ns.expect(deployment_worker_id_parser)
    @token_checker
    def get(self):
        """
            Deployment worker dashboard current status info
            ---
            # returns
            Deployment worker dashboard 의 상위 정보들
                
                status (int): 0(실패), 1(성공)
                # 성공 시
                result (dict):
                    total_info (dict): 작동 시간, 전체 콜 수, 응답 성궁률, 재시작 횟수
                        total_call_count (int)
                        total_success_rate (float): nginx 200 인 count 의 비율
                        total_log_size (int): 워커 경로의 size (byte)
                        restart_count (int): 워커 pod의 재시작 횟수
                        running_worker_count (int): 동작중인 워커 개수. 1
                        error_worker_count (int): 에러 워커 개수
                        deployment_run_time (float): 워커 실행 시간
                    worker_start_time (str): 워커 시작 시간 ex) "2022-02-18 03:11:30"
                message (str): API로 부터 담기는 메세지
                    
        """
        args = deployment_worker_id_parser.parse_args()
        deployment_worker_id = args["deployment_worker_id"]
        res = get_deployment_worker_dashboard_status(deployment_worker_id=deployment_worker_id)
        return self.send(res)


@ns.route("/worker/dashboard_worker_info", methods=["GET"])
class DeploymentWorkerDashboardInfo(CustomResource):
    @ns.expect(deployment_worker_id_parser)
    @token_checker
    def get(self):
        """
            Deployment Worker dashboard worker info
            ---
            # returns
            Deployment Worker dashboard 의 워커 정보 자세히 보기 정보들

                status (int): 0(실패), 1(성공)
                # 성공 시
                result (dict):
                    description (str): 배포 description
                    resource_info (dict): 워커의 자원 정보
                        configuration (list): ex) Intel(R) Core(TM) i9-9900KF CPU @ 3.60GHz
                        node_name (str): 
                        cpu_cores (str): CPU Core 개수
                        ram (str): RAM 용량 ex) 61Gi
                    version_info (dict): 배포의 버전 정보
                        create_datetime (str): ex) 2022-02-07 09:20:10
                        end_datetime (str): ex) 2022-02-07 09:20:10
                        docker_image (str): docker image 이름
                        type (str): custom | built-in
                        training_name (str): training 이름
                        built_in_model_name (str): built in model 이름
                        run_code (str): ex) /src/get_api.py
                        job_info (str): [job_name]/[job_group_index] ex) job1/0
                        checkpoint (str): checkpoint 파일 경로 ex) 01-0.94.json
                    version_info_changed (dict): 현재의 배포 정보와 다른 정보 표시
                        changed (bool): 현재의 배포 버전과 워커의 배포 버전이 다른지 여부
                                            * True = 버전이 다름
                                            * False = 버전이 동일함
                        changed_items (list): ex) [{item: "run_code", latest_version: "/src/app.py", current_version: "/src/app2.py"},...]
                message (str): API로 부터 담기는 메세지
                    
        """ 
        args = deployment_worker_id_parser.parse_args()
        deployment_worker_id = args["deployment_worker_id"]
        res = get_deployment_worker_dashboard_worker_info(deployment_worker_id=deployment_worker_id)
        return self.send(res)
        
