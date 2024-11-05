from utils.resource import CustomResource, token_checker
from flask_restplus import reqparse, Resource
from restplus import api
from utils.resource import response
from flask import send_file, make_response
import traceback

import utils.common as common
import utils.kube as kube
import utils.kube_parser as kube_parser
import utils.db as db
from utils.kube import kube_data
from TYPE import *
import settings
import datasets
from training import permission_check, get_hyper_dataset_parameter, group_status 
from training import delete_item_checkpoints, delete_item_log, get_training_info
from training import get_log_metrict_parser_and_lines, check_training_is_running 
from built_in_model import get_built_in_paramters_info
from lock import jf_scheduler_lock
import os
import json

import utils.scheduler as scheduler
from utils.exceptions import *
from utils.access_check import workspace_access_check, training_access_check

import HELP

parser = reqparse.RequestParser()

ns = api.namespace('trainings', description='Training 관련 API')



def save_file_name_with_json(file_name):
    file_name = file_name if file_name[-5:] == ".json" else file_name + ".json"
    return file_name

def get_method(method_id):
    method_id = int(method_id)
    if method_id == 0:
        return "Bayesian Probability"
    elif method_id == 1:
        return "Normal Distribution"
    elif method_id == 2:
        return "Uniform Grid"

def get_method_list():
    method_list = [
        {"label": "Bayesian Probability", "value": 0},
        {"label": "Normal Distribution", "value": 1},
        {"label": "Uniform Grid", "value": 2}
    ]
    return method_list

def get_hyperparamsearch_progress(training_id, hps_list=None, pod_list=None, queue_list=None):
    """
    Description :
        활성화 되어있는 (Pending | Running) HPS의 진행 사항

    Args :
        training_id (int) : 조회 기준이 될 Training
        hps_list (list(dict)) : [ (hps info), (hps info) ]  (id는 내림차순. 0번이 가장 최신)
        pod_list (object) :
        queue_list (list(dict)) : [ (queue info), (queue info) ]

    Returns :
        (dict) : {
            'current_hps_status': {
                'status': {'total': 10, 'done': 3, 'pending': 6, 'running': 1, 'status': 'running'}, 
                'progress': 30
            }, 
            'queue_hps_status': {
                'status': {'total': 7, 'done': 0, 'pending': 7, 'running': 0, 'status': 'stop'}, 
                'progress': 0
            },
            'current_hps_info': {
                'id': 81,
                'hps_group_id': 56,
                'hps_group_index': 0,
                'docker_image_name': 'jf-default',
                'dataset_access': None,
                'dataset_name': None,
                'gpu_count': 0,
                'gpu_model': 'null',
                'node_mode': 1,
                'node_name': None,
                'search_parameter': ' --x=(0,100) ',
                'int_parameter': '',
                'method': '0',
                'init_points': 3,
                'search_count': 222,
                'search_interval': None,
                'load_file_name': None,
                'save_file_name': 'running-hps',
                'save_file_reset': 0,
                'gpu_acceleration': 0,
                'unified_memory': 0,
                'rdma': 0,
                'configurations': 'Intel(R) Core(TM) i9-10900X CPU @ 3.70GHz',
                'network_interface': None,
                'executor_id': 2,
                'create_datetime': '2022-03-03 02:13:40',
                'start_datetime': '2022-03-03 02:13:44',
                'end_datetime': '2022-03-03 21:56:37',
                'hps_g.id': 56,
                'training_id': 77,
                'name': 'running-hps',
                'docker_image_id': 1,
                'dataset_id': None,
                'run_code': '/examples/hps_fast_test_mutiple_param.py',
                'run_parameter': ' --time 10000 ',
                'creator_id': 2,
                'hps_g.create_datetime': '2022-03-03 02:13:40',
                'built_in_model_id': None,
                'training_name': 'pbpbpbpb',
                'creator': 'yeobie',
                'workspace_name': 'robert-ws'
            }
        }
            
    """
    def get_return_form(current_hps_status, queue_hps_status, current_hps_info=None, no_active=False):
        def set_status(hps_status, no_active=False):
            # running, stop, pending ...
            if hps_status["running"] > 0:
                hps_status["status"] = KUBE_POD_STATUS_RUNNING
            elif hps_status["pending"] > 0:
                hps_status["status"] = KUBE_POD_STATUS_PENDING
            else :
                hps_status["status"] = KUBE_POD_STATUS_STOP
            if no_active:
                hps_status["status"] = KUBE_POD_STATUS_STOP
                
        if current_hps_status["total"] > 0:
            current_hps_progress = int(round((current_hps_status["done"])/current_hps_status["total"] ,2)*100)
        else :
            current_hps_progress = 0
            
        set_status(current_hps_status, no_active)
        set_status(queue_hps_status, False)
            
        return {
            "current_hps_status": {
                "status": current_hps_status,
                "progress": current_hps_progress
            },
            "queue_hps_status": {
                "status": queue_hps_status,
                "progress": 0
            },
            "current_hps_info": current_hps_info
        }
    
    if pod_list is None:
        pod_list = kube.kube_data.get_pod_list()
        
    if queue_list is None:
        queue_list = scheduler.get_pod_queue()
        
    if hps_list is None:
        hps_list = db.get_hyperparamsearch_list(training_id=training_id)
    
    
    # Running Hps id list
    active_hps_id_list = []
    running_hps_id_list = []
    
    # Get running group number
    hps_pod_list = kube.find_kuber_item_name_and_item(item_list=pod_list, work_func_type=TRAINING_ITEM_C, training_id=training_id)
    for hps_pod in hps_pod_list:
        hps_id = kube_parser.parsing_item_labels(hps_pod["item"]).get("hps_id")
        if hps_id:
            active_hps_id_list.append(int(hps_id))
            running_hps_id_list.append(int(hps_id))
    
    # Get Queue Hps 
    for queue_item in queue_list:
        if training_id == queue_item.get("training_id"):
            hps_id = queue_item.get("hps_id")
            if hps_id:
                active_hps_id_list.append(int(hps_id))


    current_hps_status = {'total':0, 'done':0, 'pending':0 , 'running':0 }
    queue_hps_status = {'total':0, 'done':0, 'pending':0 , 'running':0 }
    
    # HPS는 search count 보다 조기 종료 할 수 있음. total과 done이 일치 하지 않으면서 종료 상태 존재.
    no_active = False

    if len(active_hps_id_list) == 0:
        if len(hps_list) == 0:
            return get_return_form(current_hps_status=current_hps_status, queue_hps_status=queue_hps_status, current_hps_info=None, no_active=True)
        else:
            no_active = True
            current_hps_id = hps_list[0].get("id")
    else:
        current_hps_id = min(active_hps_id_list)
    
    current_hps_info = None
    for hps_info in hps_list:
        hps_id = hps_info.get("id")
        if hps_id == current_hps_id:
                
            current_hps_info = hps_info
            
            log_item_list = get_hyperparam_log_file_data(hps_id=hps_id, log_type="json") # HPS의 종료 된 n iter 정보 저장. 업데이트 시점에 잠시 숫자가 0이 되는 문제가 있음
            try:
                log_item_count = len([ file for file in os.listdir(get_hyperparam_log_sub_file_path(hps_id=hps_id)) if file[-6:] == ".jflog" ])  # HPS LOG COUNT - N iter 동작중인 정보까지 포함
            except :
                log_item_count = 0
                
            last_item_count = get_hyperparam_num_of_last_log_item(log_item_list=log_item_list, current_hps_id=hps_id) # HPS 이어하기 하는 경우 이전에 쌓인 데이터들 개수

            search_count = hps_info["search_count"] or 0
            init_points = hps_info["init_points"] or 0
            search_count = search_count + init_points
            
            running = 1 if hps_id in running_hps_id_list else 0
            current_hps_status["running"] = running
            current_hps_status["done"]  = log_item_count - last_item_count - current_hps_status["running"]
            current_hps_status["pending"] = max(search_count - current_hps_status["done"] - current_hps_status["running"], 0)
            current_hps_status["total"] = search_count
        elif hps_id in active_hps_id_list :
            log_item_list = get_hyperparam_log_file_data(hps_id=hps_id, log_type="json") # HPS의 종료 된 n iter 정보 저장. 업데이트 시점에 잠시 숫자가 0이 되는 문제가 있음
            try:
                log_item_count = len([ file for file in os.listdir(get_hyperparam_log_sub_file_path(hps_id=hps_id)) if file[-6:] == ".jflog" ]) # HPS LOG COUNT - N iter 동작중인 정보까지 포함
            except :
                log_item_count = 0
            
            last_item_count = get_hyperparam_num_of_last_log_item(log_item_list=log_item_list, current_hps_id=hps_id) # HPS 이어하기 하는 경우 이전에 쌓인 데이터들 개수
            search_count = hps_info["search_count"] or 0
            init_points = hps_info["init_points"] or 0
            search_count = search_count + init_points
            
            queue_hps_status["done"]  += max(log_item_count - last_item_count, 0)
            queue_hps_status["pending"] += max(search_count - queue_hps_status["done"], 0)
            queue_hps_status["total"] += search_count
    
    return get_return_form(current_hps_status=current_hps_status, queue_hps_status=queue_hps_status, current_hps_info=current_hps_info, no_active=no_active)

# 추가, 변경 시 필요 정보 제공
def get_hyperparamsearch_group(hps_group_id, headers_user):
    try:
        pass
        
        hps_group_info = db.get_hyperparamsearch_group(hps_group_id=hps_group_id)
        last_hps_info = db.get_hyperparamsearch_group_items(hps_group_id=hps_group_id)[-1]
        built_in_paramters_info = {}
        built_in_training_form = []
        num_of_search_parameter = 0
        if hps_group_info.get("built_in_model_id") is not None:
            built_in_paramters_info = get_built_in_paramters_info(built_in_model_id=hps_group_info.get("built_in_model_id"))
            built_in_training_form = [ training_form["argparse"] 
            for training_form in db.get_built_in_model_data_training_form(model_id=hps_group_info.get("built_in_model_id")) 
            if training_form["argparse"] is not None or training_form["name"] != "/" ]

        dataset_parameter = {}
        run_parameter = common.parameter_str_to_dict(hps_group_info["run_parameter"])
        for k, v in run_parameter.items():
            if k in built_in_paramters_info.keys() or hps_group_info.get("built_in_model_id") is None :
                run_parameter[k] = {
                    "default_value": v,
                    "static": True    
                }
            if k in built_in_training_form:
                dataset_parameter[k] = v.replace("/user_dataset/","")
            # run_parameter[k]["static"] = True
        print(run_parameter)
        search_parameter = common.parameter_str_to_dict(last_hps_info["search_parameter"],"=")
        
        int_parameter = last_hps_info["int_parameter"].split(",") if last_hps_info["int_parameter"] is not None else []
        for k, v in search_parameter.items():
            if v[0] == "(" and v[-1] == ")":
                v = v[1:-1]
            min_, max_= v.split(",")
            search_parameter[k] = {
                "default_value": None,
                "static": False,
                "range_value_min" : min_,
                "range_value_max" : max_,
                "is_int": k in int_parameter,
                "search_count": last_hps_info["search_count"],
                "init_points": last_hps_info["init_points"],
                "search_interval": last_hps_info["search_interval"]
            }
        print(search_parameter)
        num_of_search_parameter = len(search_parameter)
        run_parameter.update(search_parameter)
        default_parameters_info = run_parameter

        result = { 
            "hps_name": hps_group_info["name"],
            "num_of_search_parameter" : num_of_search_parameter,
            "default_image": {"id": hps_group_info["docker_image_id"], "name" : hps_group_info["docker_image_name"]}, 
            "default_dataset": {"id" : hps_group_info["dataset_id"], "name" : hps_group_info["dataset_name"]},
            "default_dataset_sub": dataset_parameter,
            "default_run_code": hps_group_info["run_code"],
            "default_parameters_info": default_parameters_info,
            "default_search_method" : last_hps_info["method"],
            "default_load_file_name" : save_file_name_with_json(last_hps_info["save_file_name"]),
            "save_file_list": get_hyperparamsearch_saved_file_list(hps_group_id)
            # "parameters_info": {
            #     "batch_size": {
            #         "default_value": "32",
            #         "description": null,
            #         "static": True
            #     },
            #     "learning_rate": {
            #         "default_value": "0.001",
            #         "description": null,
            #         "static": False,
            #         "range_value_min" : 
            #         "range_value_max" : 
            #         "search_count": 
            #         "init_points":
            #         "search_interval":
            #     },
            #     "num_epoch": {
            #         "default_value": "20",
            #         "description": null
            #     }
        }
        return response(status=1, result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Get hyperparamsearch group error : {}".format(e))

import time
import os
def get_hyperparamsearch_list(training_id, search_key=None, size=None, page=None, search_value=None, sort=None, headers_user=None):
    try:
        result = []
        training_info = db.get_training(training_id=training_id)
        training_name = training_info["training_name"]
        workspace_name = training_info["workspace_name"]
        training_description = training_info["description"]
        training_type = training_info["type"]
        training_gpu_count = training_info["gpu_count"]
        training_built_model_name = training_info["built_in_model_name"]
        training_access = training_info["access"]
        tool_jupyter_id = training_info["tool_jupyter_id"]
        pod_list = kube_data.get_pod_list()
        service_list = kube_data.get_service_list()
        
        hyperparamsearch_list = db.get_hyperparamsearch_list(training_id=training_id)

        # print("!@#!@#",hyperparamsearch_list)
        hps_group_list = {}
        # {
        #     "hps_group_id": 
        #     "hps_name"
        # }
        score_read_time = 0
        log_file_exist_time = 0
        # hps_item_list = {}
        for hps_item in hyperparamsearch_list:
            if hps_group_list.get(hps_item["hps_group_id"]) is None:
                hyper_parameter, dataset_parameter = get_hyper_dataset_parameter(parameter=hps_item["run_parameter"], built_in_model_id=hps_item["built_in_model_id"])
                hps_group_list[hps_item["hps_group_id"]] = {
                    "group_id" : hps_item["hps_group_id"],
                    "name": hps_item["name"],
                    "create_datetime": hps_item["hps_g.create_datetime"],
                    "docker_image_name": hps_item["docker_image_name"],
                    "dataset_name": hps_item["dataset_name"],
                    "method":  get_method(hps_item["method"]),
                    "run_code": hps_item["run_code"],
                    "static_parameter": {
                        "hyper_parameter" : common.parameter_dict_to_list(hyper_parameter),
                        "dataset_parameter" : common.parameter_dict_to_list(dataset_parameter)
                    },
                    "creator": hps_item["creator"],
                    "hps_list": [],
                    "status": "개발중",
                    "status_counting": {
                        "running": 0,
                        "pending": 0,
                        "done": 0,
                        "error": 0
                    }
                }
            status_counting = hps_group_list[hps_item["hps_group_id"]]["status_counting"]
            status = kube.get_hyperparamsearch_status(hps_id=hps_item["id"], pod_list=pod_list)
            if status["status"] == "error":
                print("???", status)

            if status["status"] not in ["pending", "done"]:
                status_counting["running"] += 1
            else :
                status_counting[status["status"]] += 1

            hps_group_list[hps_item["hps_group_id"]]["status"] = group_status(status_counting)
            score = None
            score_parameter = {}
            hps_list = hps_group_list[hps_item["hps_group_id"]]["hps_list"]
            log_json_path = get_hyperparam_log_file_path(hps_id=hps_item["id"], workspace_name=hps_item["workspace_name"], training_name=hps_item["training_name"], log_type="json")
            st2 = time.time()
            try:
                # log_json_data = get_hyperparam_log_file_path(hps_id=hps_item["id"], log_type="json")
                try:
                    with open(log_json_path, "r") as j:
                        while True:
                            try:
                                iteration = next(j)
                            except StopIteration:
                                break
                            iteration = json.loads(iteration)
                    
                            if score is None:
                                score = iteration["target"]
                            
                            if score < iteration["target"]:
                                score = iteration["target"]
                                score_parameter = iteration["params"]
                except Exception as e:
                    # traceback.print_exc()
                    pass
            except:
                traceback.print_exc()
                pass
            score_read_time += time.time() - st2

            st3 = time.time()
            # log_file_exist = True if os.system("ls {} > /dev/null 2>&1".format(log_json_path)) == 0 else False # 0.45 ~ 0.5
            log_file_exist = os.path.isfile(log_json_path) # 0.001 
            log_file_exist_time += time.time() - st3

            hps_list.append({
                "id": hps_item["id"],
                "start_datetime": hps_item["start_datetime"],
                "end_datetime": hps_item["end_datetime"],
                "index": hps_item["hps_group_index"],
                "search_parameter": common.parameter_str_to_dict(hps_item["search_parameter"], "="),
                "search_count": hps_item["search_count"],
                "interval": hps_item["search_interval"],
                "init_points": hps_item["init_points"],
                "save_file": hps_item["save_file_name"] if hps_item["save_file_name"][-5:] == ".json" else hps_item["save_file_name"] + ".json",
                "load_file": hps_item["load_file_name"],
                "gpu_count": hps_item["gpu_count"],
                "configurations": hps_item["configurations"],
                "method":  get_method(hps_item["method"]),
                "score": score,
                "score_parameter" :score_parameter,
                "options" : {
                    "gpu_acceleration": hps_item["gpu_acceleration"],
                    "um": hps_item["unified_memory"],
                    "rdma": hps_item["rdma"]
                },
                "status" : status,
                "log_file" : log_file_exist
            })


        training_tool_info = db.get_training_tool(training_id=training_id, tool_type=TOOL_HPS_ID)

        result = {
            "list": list(hps_group_list.values()),
            "total": len(list(hps_group_list.values())),
            "training_info": get_training_info(db_training_info=training_info, pod_list=pod_list, service_list=service_list),
            "training_tool_info": {
                "tool_id": training_tool_info["id"],
                "docker_image_name": training_tool_info["docker_image_name"],
                "gpu_count": training_tool_info["gpu_count"],
                "gpu_model": training_tool_info["gpu_model"]
            }
        }
        # result.update(get_training_info(db_training_info=training_info, pod_list=pod_list, service_list=service_list))

        # print("score read time", score_read_time)
        # print("score log_file_exist_time time", log_file_exist_time)

        return response(status=1, result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Hyperparameter get Error : {}".format(e))


def create_hps(training_id, hps_name, docker_image_id, dataset_id, run_code, training_params,
               gpu_acceleration, unified_memory, rdma,
               search_params, int_params, search_count, search_interval, method, load_file_name, save_file_name, save_file_reset, init_points, 
               gpu_count, gpu_model, headers_user):
               # headers_user = creator (get by token)
    try:
        check_training_is_running(training_id)
        executor_id = db.get_user_id(user_name=headers_user)["id"]

        training_info = db.get_training(training_id=training_id)
        tool_info = db.get_training_tool(training_id=training_id, tool_type=TOOL_TYPE_ID[TOOL_HPS_KEY])
        check_result, res = permission_check(user=headers_user, training_info=training_info, permission_level=1)
        if not check_result:
            return res

        print("S TYPE" , type(search_params), "P TYPE", type(training_params))
        search_params = common.parameter_dict_to_str(search_params, "=") if type(search_params) == type({}) else search_params
        training_params = common.parameter_dict_to_str(training_params) if type(training_params) == type({}) else training_params
        print(search_params)
        print(training_params)
        # gen hyperparameter group        
        insert_result = db.insert_hyperparamsearch_group(training_id=training_id, hps_name=hps_name, docker_image_id=docker_image_id, 
                                        dataset_id=dataset_id, run_code=run_code, run_parameter=training_params, creator_id=executor_id)
        # if insert_result == False:
        #     return response(status=0, message="Already exsist group : {}".format(message))
        hps_group_info = db.get_hyperparamsearch_group(hps_name=hps_name, training_id=training_id)

        # gen hyperparameter search item
        hps_info = {}
        #From hps_group_info
        hps_info["hps_group_id"] = hps_group_info["id"]
        hps_info["hps_group_index"] = 0
        hps_info["dataset_access"] = hps_group_info["dataset_access"]
        hps_info["dataset_name"] = hps_group_info["dataset_name"]
        hps_info["docker_image_name"] = hps_group_info["docker_image_name"]
        #TODO HPS 생성 시 입력 받는 경우
        if gpu_count is None:
            gpu_count = tool_info["gpu_count"]
        if gpu_model is None:
            gpu_model = tool_info["gpu_model"]

        hps_info["gpu_count"] = gpu_count 
        hps_info["gpu_model"] = gpu_model
        hps_info["node_name"] = tool_info["node_name"]
        
        #From front
        hps_info["search_parameter"] = search_params
        hps_info["int_parameter"] = int_params
        hps_info["method"] = method
        hps_info["init_points"] = init_points
        hps_info["search_count"] = search_count
        hps_info["search_interval"] = search_interval
        hps_info["load_file_name"] = load_file_name
        hps_info["save_file_name"] = save_file_name
        hps_info["gpu_acceleration"] = gpu_acceleration
        hps_info["unified_memory"] = unified_memory
        hps_info["rdma"] = rdma
        hps_info["executor_id"] = executor_id
        db.insert_hyperparamsearchs([hps_info])

        # Insert into queue
        
        # queue_item_list = db.get_hyperparamsearch_queue_item_list(hps_group_id=hps_group_info["id"], hps_group_index=0)
        group_items = db.get_hyperparamsearch_group_items(hps_group_id=hps_group_info["id"])
        if len(group_items) > 0:
            hps_queue_info = group_items[-1]
            hps_id = hps_queue_info["id"]
            training_id = hps_queue_info["training_id"]
            print("INSERT QUEUE RESULT " , db.insert_hyperparamsearch_queue(training_id=training_id, hps_id=hps_id))
        else :
            return response(status=0, message="Hyperparameter group item search error")
    except CustomErrorList as ce:
        traceback.print_exc()
        return response(status=0, message=ce.message)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Create hyperparameter search system error : {}".format(e))
    
    db.logging_history(
        user=headers_user, task='hyperparamsearch',
        action='create', workspace_id=hps_group_info["workspace_id"],
        task_name=f'{hps_group_info["training_name"]} / {hps_name}(0)')
    return response(status=1, message="Created")


def create_hps_add(hps_group_id, training_id, hps_name, docker_image_id, dataset_id, run_code, training_params,
               gpu_acceleration, unified_memory, rdma,
               search_params, search_count, search_interval, method, int_params,
               load_file_name, save_file_name, save_file_reset, init_points,
               gpu_count, gpu_model, headers_user):
    try:
        #바뀔 수 있는 정보
        # dataset_id, 서브 item들도
        # run_code
        check_training_is_running(training_id)
        training_info = db.get_training(training_id=training_id)
        tool_info = db.get_training_tool(training_id=training_id, tool_type=TOOL_TYPE_ID[TOOL_HPS_KEY])
        check_result, res = permission_check(user=headers_user, training_info=training_info, permission_level=1)
        if not check_result:
            return res

        executor_id = db.get_user_id(user_name=headers_user)["id"]
        hps_group_info = db.get_hyperparamsearch_group(hps_group_id=hps_group_id)
        search_params = common.parameter_dict_to_str(search_params, "=") if type(search_params) == type({}) else search_params
        training_params = common.parameter_dict_to_str(training_params) if type(training_params) == type({}) else training_params

        if hps_group_info["docker_image_id"] != docker_image_id or hps_group_info["dataset_id"] != dataset_id or hps_group_info["run_code"] != run_code:
            update_result = db.update_hyperparamsearch_group(hps_group_id=hps_group_id, docker_image_id=docker_image_id, dataset_id=dataset_id, run_code=run_code, run_parameter=training_params)
            if update_result == False:
                return response(status=0, message="Update Hyperparamsearch group error ")
        
        # gen hyperparameter search item
        hps_info = {}
        #From hps_group_info
        hps_info["hps_group_id"] = hps_group_info["id"]
        hps_info["hps_group_index"] = int(db.get_hyperparamsearch_group_search_last_index(hps_group_id=hps_group_id)["last_index"]) + 1
        hps_info["dataset_access"] = hps_group_info["dataset_access"]
        hps_info["dataset_name"] = hps_group_info["dataset_name"]
        hps_info["docker_image_name"] = hps_group_info["docker_image_name"]

        #TODO HPS 생성 시 입력 받는 경우
        if gpu_count is None:
            gpu_count = tool_info["gpu_count"]
        if gpu_model is None:
            gpu_model = tool_info["gpu_model"]

        hps_info["gpu_count"] = gpu_count #TODO 지금은 training으로 부터 가져옴, HPS 생성 시 지정할 수 있도록 (group 값이 아니라 hps item에 종속)
        hps_info["gpu_model"] = gpu_model #TODO HPS 생성 시 컨트롤 하는 경우
        hps_info["node_name"] = tool_info["node_name"]

        #From front
        hps_info["search_parameter"] = search_params
        hps_info["int_parameter"] = int_params
        hps_info["method"] = method
        hps_info["init_points"] = init_points
        hps_info["search_count"] = search_count
        hps_info["search_interval"] = search_interval
        hps_info["load_file_name"] = load_file_name
        hps_info["save_file_name"] = save_file_name
        hps_info["gpu_acceleration"] = gpu_acceleration
        hps_info["unified_memory"] = unified_memory
        hps_info["rdma"] = rdma
        hps_info["executor_id"] = executor_id
        print("???", hps_info)
        db.insert_hyperparamsearchs([hps_info])

        # Insert into queue
        
        # queue_item_list = db.get_hyperparamsearch_queue_item_list(hps_group_id=hps_group_info["id"], hps_group_index=0)
        group_items = db.get_hyperparamsearch_group_items(hps_group_id=hps_group_info["id"])
        if len(group_items) > 0:
            hps_queue_info = group_items[-1]
            hps_id = hps_queue_info["id"]
            training_id = hps_queue_info["training_id"]
            print("INSERT QUEUE RESULT " , db.insert_hyperparamsearch_queue(training_id=training_id, hps_id=hps_id))
        else :
            return response(status=0, message="Hyperparameter group item search error")


    except CustomErrorList as ce:
        traceback.print_exc()
        return response(status=0, message=ce.message)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Create hyperparameter search item system error : {}".format(e))
    
    db.logging_history(
        user=headers_user, task='hyperparamsearch',
        action='add', workspace_id=hps_group_info["workspace_id"],
        task_name=f'{hps_group_info["training_name"]} / {hps_name}({hps_info["hps_group_index"]})')
    return response(status=1, message="Hyperparameter Search Added")

def delete_hps(hps_id_list, training_id, headers_user):
    def is_multiple_training_item(hps_list):
        training_id_set = set()
        for hps in hps_list:
            training_id_set.add(hps["training_id"])

        if len(training_id_set) > 1:
            return True
        else:
            return False

    def get_hps_delete_item_log(hps_list):
        log_dict = {}
        for hps in hps_list:
            item = log_dict.get(hps["name"], [])
            item.append(str(hps["hps_group_index"]))
            log_dict[hps["name"]] = item

        log_str = ""
        for key, value in log_dict.items():
            log_str += key + "(" + ",".join(value) + ") "

        return log_str
    try:

        if hps_id_list is not None:
            hps_list = db.get_hyperparamsearch_list_from_hps_id_list(hps_id_list=hps_id_list)
        elif training_id is not None:
            hps_list = db.get_hyperparamsearch_list_from_training_id(training_id=training_id)


        if len(hps_list) == 0:
            return response(status=0, message="Not Exist hyperparameter")
        
        if is_multiple_training_item(hps_list=hps_list):
            raise TrainingJobHpsDeleteMultipleTrainingError

        training_id = hps_list[0]["training_id"]
        training_info = db.get_training(training_id=training_id)

        check_result, res = permission_check(user=headers_user, training_info=training_info, permission_level=1)
        if not check_result:
            return res

        training_name = training_info["training_name"]
        workspace_name = training_info["workspace_name"]
        workspace_id = training_info["workspace_id"]
        pod_list = kube.get_list_namespaced_pod()
        
        log_hps_name = get_hps_delete_item_log(hps_list=hps_list)

        # check if deleting all of the hyperparamsearches in the hps group
        # add hps index(es) if not deleting all of them in the hps group
        # hps_group_id = hps_list[0]["group_id"]
        # hpses_in_group = db.get_hyperparamsearch_group_items(hps_group_id=hps_group_id)
        # if len(hpses_in_group) != len(hps_list):
        #     hps_indexes = [str(hps["hps_group_index"]) for hps in hps_list]
        #     log_hps_name = hps_name + f"({','.join(hps_indexes)})"
        # else:
        #     log_hps_name = hps_name

        # uwsgi.lock()
        with jf_scheduler_lock:
            running_hps_id = None
            for hps in hps_list:
                status = kube.get_hyperparamsearch_status(hps_id=hps["id"], pod_list=pod_list)
                delete_item_checkpoints(workspace_name=workspace_name, training_name=training_name, 
                                        item_name=hps["name"], item_group_index=hps["hps_group_index"], item_type=TRAINING_ITEM_C)
                delete_item_log(workspace_name=workspace_name, training_name=training_name, item_id=hps["id"], item_type=TRAINING_ITEM_C)
                if status["status"] in KUBER_RUNNING_STATUS:
                    # 러닝중인 것을 삭제 시
                    running_hps_id = hps["id"]
            if running_hps_id is not None:
                res, message = kube.kuber_item_remove(hps_id=running_hps_id)

            delete_result = db.delete_hyperparamsearchs(hps_id_list=[ hps["id"] for hps in hps_list ] )
                        
            db.logging_history(
                user=headers_user, task='hyperparamsearch',
                action='delete', workspace_id=workspace_id,
                task_name=f'{training_name} / {log_hps_name}')

            return response(status=1, message="Delete Hyperparamsearchs OK")
    except Exception as e:
        traceback.print_exc()
        raise e

def stop_hps(hps_id, headers_user):
    message = ""
    try:
        hps_info = db.get_hyperparamsearch(hps_id=hps_id)
        training_info = db.get_training(training_id=hps_info["training_id"])
        check_result, res = permission_check(user=headers_user, training_info=training_info, permission_level=1)
        if not check_result:
            return res

        # pod_list = kube_data.get_pod_list(try_update=True)
        pod_list = kube.get_list_namespaced_pod()
        # uwsgi.lock()
        with jf_scheduler_lock:
            status = kube.get_hyperparamsearch_status(hps_id=hps_id, pod_list=pod_list)
            if status["status"] not in KUBER_NOT_RUNNING_STATUS:
                res, message = kube.kuber_item_remove(hps_id=hps_id, work_func_type=CREATE_KUBER_TYPE[3])
                if res == False:
                    return response(status=0, message="Stop hyperparamsearch error : {} ".format(message))
                

        return response(status=1, message="Stop hyperparamsearch OK")
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Stop hyperparamsearch error : {}".format(e))
    # return response(status=0, message="fail")

def stop_hpss(training_id):
    message = ""
    try:
        hps_list = db.get_hyperparamsearch_list(training_id=training_id)

        pod_list = kube.get_list_namespaced_pod()
        delete_hps_list = []
        with jf_scheduler_lock:
            for hps in hps_list:
                status = kube.get_hyperparamsearch_status(hps_id=hps["id"], pod_list=pod_list)
                if status["status"] not in KUBER_NOT_RUNNING_STATUS:
                    res, message = kube.kuber_item_remove(hps_id=hps["id"], work_func_type=CREATE_KUBER_TYPE[3])

                if status["status"] in ["pending"]:    
                    delete_hps_list.append(hps["id"])
            print("DELETE HPS LIST ", delete_hps_list)
            db.delete_hyperparamsearch_queues(training_id=training_id, hps_id_list=delete_hps_list)
            db.delete_hyperparamsearchs(hps_id_list=delete_hps_list)
        return response(status=1, message="Stop hyperparamsearch OK")
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Stop hyperparamsearch error : {}".format(e))

def stop_hps_group(hps_group_id, headers_user):
    try:
        hps_item_list = db.get_hyperparamsearch_group_items(hps_group_id=hps_group_id)
        training_info = db.get_training(training_id=hps_item_list[0]["training_id"])
        check_result, res = permission_check(user=headers_user, training_info=training_info, permission_level=1)
        if not check_result:
            return res

        # pod_list = kube_data.get_pod_list(try_update=True)
        pod_list = kube.get_list_namespaced_pod()
        delete_hps_list = []
        with jf_scheduler_lock:
            for hps_item in hps_item_list:
                status = kube.get_hyperparamsearch_status(hps_id=hps_item["id"], pod_list=pod_list)
                if status["status"] in ["pending"]:    
                    delete_hps_list.append(hps_item["id"])
            db.delete_hyperparamsearch_queues(training_id=training_info["id"], hps_id_list=delete_hps_list)
            db.delete_hyperparamsearchs(hps_id_list=delete_hps_list)
            res, message = kube.kuber_item_remove(hps_group_id=hps_group_id, work_func_type=CREATE_KUBER_TYPE[3])
            if res == False:
                return response(status=0, message="Stop group hyperparamsearch error : {} ".format(message))
        
        return response(status=1, message="Stop group hyperparamsearch OK")
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Stop group hyperparamsearch error : {}".format(e))


def get_hyperparamsearch_saved_file_list(hps_group_id):
    # /jfbcore/jf-data/workspaces/test-ws/trainings/jonathan-ji/job-checkpoints/
    if hps_group_id is None:
        return []

    hps_group_info = db.get_hyperparamsearch_group(hps_group_id=hps_group_id)
    # print("!@#!%!@%",hps_group_info)
    workspace_name = hps_group_info["workspace_name"]
    training_name = hps_group_info["training_name"]
    hps_group_name = hps_group_info["name"]
    path = '{JF_WS_BASE}/{workspace_name}/trainings/{training_name}/{hps_save_load_files_path}/{hps_group_name}/'.format(
        JF_WS_BASE=settings.JF_WS_DIR, 
        workspace_name=workspace_name, 
        training_name=training_name,
        hps_save_load_files_path=JF_TRAINING_HPS_SAVE_LOAD_FILE_DIR_NAME,
        hps_group_name=hps_group_name
        )

    check_file_list = datasets.check_file(search_path="/", search_type="file", search_page=1, search_size=9999, path=path)[0]
    if len(check_file_list) > 0:
        check_file_list =  [ file_["name"] for file_ in check_file_list ] 
    print("CFL : ",check_file_list)
    return check_file_list

def get_hyperparam_log_file_path(hps_id, workspace_name=None, training_name=None, log_type="jflog"):
    base_path = settings.JF_WS_DIR
    log_name = "{}.{}".format(hps_id, log_type)
    if workspace_name is None or training_name is None:
        res = db.get_hyperparamsearch(hps_id)
        workspace_name = res["workspace_name"]
        training_name = res["training_name"]

    log_path = "{base_path}/{workspace_name}/trainings/{training_name}/{default_hps_log_path}/{log_name}".format(
        base_path=base_path, 
        workspace_name=workspace_name, 
        training_name=training_name, 
        default_hps_log_path=JF_TRAINING_HPS_LOG_DIR_NAME,
        log_name=log_name
        )
    return log_path

def get_hyperparam_log_file_data(hps_id, workspace_name=None, training_name=None, log_type="jflog"):
    import time
    """
    Args :
        log_type(str): "json" - main log 로 n_iter 별 input, target 값 저장하는 로그 데이터  | "jflog" 
    """
    log_item_list = []
    try:
        log_path = get_hyperparam_log_file_path(hps_id=hps_id, workspace_name=workspace_name, training_name=training_name, log_type=log_type)
        with open(log_path, "r") as j:
            while True:
                try:
                    iteration = next(j)
                except StopIteration:
                    break
                iteration = json.loads(iteration)
                log_item_list.append(iteration)
    except FileNotFoundError as fnf:
        pass
    except Exception as e:
        traceback.print_exc()
    return log_item_list

def get_hyperparam_num_of_last_log_item(log_item_list, current_hps_id):
    item_hps_id = []
    for log_item in log_item_list:
        item_hps_id.append(log_item.get("hps_id"))
    # print(len(log_item_list), len(item_hps_id), item_hps_id.count(current_hps_id))
    num_of_last_log_item = len(log_item_list) - item_hps_id.count(str(current_hps_id))

    return num_of_last_log_item
        
def get_hyperparam_log_sub_file_path(hps_id, workspace_name=None, training_name=None):
    base_path = settings.JF_WS_DIR
    if workspace_name is None or training_name is None:
        res = db.get_hyperparamsearch(hps_id=hps_id)
        workspace_name = res["workspace_name"]
        training_name = res["training_name"]

    log_path = "{base_path}/{workspace_name}/trainings/{training_name}/{default_hps_log_path}/{hps_id}".format(
        base_path=base_path, 
        workspace_name=workspace_name, 
        training_name=training_name, 
        default_hps_log_path=JF_TRAINING_HPS_LOG_DIR_NAME,
        hps_id=hps_id
        )
    return log_path

def delete_hyperparam_save_load_files(workspace_name, training_name, hps_name):
    file_base_path = kube.get_hps_save_load_file_base_path(workspace_name=workspace_name, training_name=training_name)
    hps_file_base_path = "{}/{}".format(file_base_path, hps_name)
    print(hps_file_base_path)
    os.system("rm -r {}".format(hps_file_base_path))



def sort_log_table(log_table, sort_key=None, order_by=None, is_param=False):
    if sort_key == None and order_by == None:
        return log_table
    if len(log_table) <= 1:
        return log_table
    
    if order_by not in ["ASC","DESC"]:
        raise Exception("Not Support order_by : {}".format(order_by))

    if is_param == True and sort_key not in log_table[0]["params"].keys():
        raise Exception("Not Support params sort_key : {} | support list = {}".format(sort_key, list(log_table[0]["params"].keys())))
    elif is_param == False and sort_key not in ["target", "id"]:
        raise Exception("Not Support non params sort_key : {} | support list = {}".format(sort_key, ["target", "id"]))
    
    last_item = None
    if log_table[-1]["target"] == None:
        last_item = log_table[-1]
        log_table = log_table[:-1]
    
    if is_param == False:
        if order_by == "ASC":
            log_table = sorted(log_table, key=lambda log_table: (log_table[sort_key]))
        elif order_by == "DESC":
            log_table = sorted(log_table, key=lambda log_table: (-log_table[sort_key]))
            
    elif is_param == True:
        if order_by == "ASC":
            log_table = sorted(log_table, key=lambda log_table: (log_table["params"][sort_key]))
        elif order_by == "DESC":
            log_table = sorted(log_table, key=lambda log_table: (-log_table["params"][sort_key]))
            
    if last_item is not None:
        log_table.append(last_item)
    return log_table

def get_hps_log_table_detail(log_json_data):
    result = {
        "log_table": [],
        "parameter_settings": {},
        "status": {}
    }
    max_target = None
    max_id = None
    log_table = []
    cnt = 1 
    with open(log_json_data, "r") as j:
        while True:
            try:
                iteration = next(j)
            except StopIteration:
                break

            iteration = json.loads(iteration)
            iteration["id"] = cnt
            if max_target is None:
                max_target = iteration["target"]
                result["max_index"] = iteration["id"] - 1
                result["max_item"] = iteration
            
            if max_target < iteration["target"]:
                max_target = iteration["target"]
                result["max_index"] = iteration["id"] - 1
                result["max_item"] = iteration
            cnt += 1
            log_table.append(iteration)
    result["log_table"] = log_table
    return result

def get_hps_log_table(hps_id, sort_key, order_by, is_param):
        # for i in log_table:
        #     print(i)

    result = {
        "log_table": [],
        "parameter_settings": {},
        "status": {}
    }
    
    try:
        pod_list = kube_data.get_pod_list()
        hps_status = kube.get_hyperparamsearch_status(hps_id=hps_id, pod_list=pod_list)
        res = db.get_hyperparamsearch(hps_id=hps_id)
        log_json_data = get_hyperparam_log_file_path(hps_id=hps_id, workspace_name=res["workspace_name"], training_name=res["training_name"], log_type="json")
        sub_path_dir = get_hyperparam_sub_log_file_path(hps_id=hps_id, workspace_name=res["workspace_name"], training_name=res["training_name"])
        search_parameter = common.parameter_str_to_dict(res["search_parameter"],"=")
        run_parameter = common.parameter_str_to_dict(res["run_parameter"]," ")
        
        result = get_hps_log_table_detail(log_json_data)
        log_table = result["log_table"]
        # max_target = None
        # max_id = None
        # log_table = []
        # cnt = 1 
        # with open(log_json_data, "r") as j:
        #     while True:
        #         try:
        #             iteration = next(j)
        #         except StopIteration:
        #             break

        #         iteration = json.loads(iteration)
        #         iteration["id"] = cnt
        #         if max_target is None:
        #             max_target = iteration["target"]
        #             result["max_index"] = iteration["id"] - 1
        #             result["max_item"] = iteration
                
        #         if max_target < iteration["target"]:
        #             max_target = iteration["target"]
        #             result["max_index"] = iteration["id"] - 1
        #             result["max_item"] = iteration
                    

        #         cnt += 1
        #         log_table.append(iteration)


        if hps_status["status"] == "running":
            emty_iteration = {"params": {}}
            emty_iteration["target"] = None
            emty_iteration["hps_id"] = str(hps_id)
            emty_iteration["id"] = len(log_table) + 1 

            for k, v in search_parameter.items():
                emty_iteration["params"][k] = None
        


            # print("RU")
            log_table.append(emty_iteration)
        else :
            if len(os.listdir(sub_path_dir)) > len(log_table):
                emty_iteration = {"params": {}}
                emty_iteration["target"] = None
                emty_iteration["id"] = len(log_table) + 1 

                for k, v in search_parameter.items():
                    emty_iteration["params"][k] = None
                log_table.append(emty_iteration)

        # if hps_status["status"] == "running":
        
        

        # # print("RU")

        log_table = sort_log_table(log_table=log_table, sort_key=sort_key, order_by=order_by, is_param=is_param)        

        if result.get("max_item") is not None:
            for i, data in enumerate(log_table):       
                if data["id"] == result["max_item"]["id"]:
                    result["max_index"] = i

        # print(len(log_table))
        search_parameter.update(run_parameter)
        result["log_table"] = log_table
        result["parameter_settings"] = common.parameter_dict_to_list(search_parameter)
        result["status"] = hps_status
        #For parameter settings
        
    except FileNotFoundError as fne:
        traceback.print_exc()
        print("FileNotFoundError : {}".format(fne))
        return response(status=0, message="Hyperparam log FileNotFoundError : {}".format(fne))
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Hyperparam log error : {}".format(e))
    return response(status=1, result=result)

def get_hps_log_table_download(hps_id):
    try:
        res = db.get_hyperparamsearch(hps_id)
        if res is None:
            return response(status=0, message="HPS id not exist")
        log_json_data = get_hyperparam_log_file_path(hps_id=hps_id, workspace_name=res["workspace_name"], training_name=res["training_name"], log_type="json")
        base_header_list = ["id","target"]
        param_header_list = []
        data_list = []
        n_iter = 1
        with open(log_json_data, "r") as j:
            while True:
                try:
                    iteration = next(j)
                except StopIteration:
                    break
                iteration = json.loads(iteration)
                iteration["id"] = n_iter
                n_iter += 1
                if len(param_header_list) == 0:
                    param_header_list = list(iteration["params"].keys())
                    # print(param_header_list)
                    
                item = [ str(iteration[base_header]) for base_header in base_header_list ] + [ str(iteration["params"][param_header]) for param_header in param_header_list ]
                data_list.append(item)
                # data_list.append(",".join(item))

        # header = ",".join(base_header_list + param_header_list)
        header = base_header_list + param_header_list
        # print(header)
        data_list = [header] + data_list + ["TEST"]
        # data = "\n".join(data_list)
        # print(data)
        # csv = header + "\n" + data


        # temp = "a,b,c,d\n1,2,3,4\n"
        # download_response = make_response(csv)
        # download_response.headers['Content-Disposition'] = 'attachment; filename=mycsv.csv'
        # download_response.mimetype='text/csv'
        # return download_response

        # return common.csv_response_generator(data_list=data_list)
        return response(status=1, self_response=common.csv_response_generator(data_list=data_list))
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="HPS Search-result-table download error : {}".format(e))
    

def get_hyperparam_sub_log_file_path(hps_id, table_item_id=None, workspace_name=None, training_name=None, log_type="jflog"):
    base_path = settings.JF_WS_DIR
    log_name = "{}.{}".format(table_item_id, log_type) if table_item_id is not None else ""
    if workspace_name is None or training_name is None:
        res = db.get_hyperparamsearch(hps_id)
        workspace_name = res["workspace_name"]
        training_name = res["training_name"]

    log_path = "{base_path}/{workspace_name}/trainings/{training_name}/{default_hps_log_path}/{hps_id}/{log_name}".format(
        base_path=base_path, 
        workspace_name=workspace_name, 
        training_name=training_name, 
        default_hps_log_path=JF_TRAINING_HPS_LOG_DIR_NAME,
        hps_id=hps_id,
        log_name=log_name
        )
    return log_path

def get_hps_log(hps_id, table_item_id):
    result = {
        "metrics_data": {},
        "metrics_info": {
            "x": {"label":None, "value":[]},
            "key_order": [],
            },
        "log": []
    }
    try:
        res = db.get_hyperparamsearch(hps_id)
        
            # return response(status=1, result=result, message="table_item_id None")
        graph_log_path = None
        if table_item_id is None:
            # 실행 자체에 에러가 발생할 경우를 위해 고려
            log_path = get_hyperparam_log_file_path(hps_id=res["id"], workspace_name=res["workspace_name"], training_name=res["training_name"])
        else :
            log_path = get_hyperparam_sub_log_file_path(hps_id=hps_id, table_item_id=table_item_id, workspace_name=res["workspace_name"], training_name=res["training_name"])
            graph_log_path = get_hyperparam_sub_log_file_path(hps_id=hps_id, table_item_id=table_item_id, workspace_name=res["workspace_name"], training_name=res["training_name"], log_type="jflog_graph")

        result["metrics_data"], result["metrics_info"], lines = get_log_metrict_parser_and_lines(log_path, graph_log_path)
        if table_item_id is None:
            for i, line in enumerate(lines):
                if line.find("ERROR LOG") == 0:
                    break
            lines = lines[i:]



        #For log
        length = len(lines)
        if length > 200:
            result_lines = lines[:100] + lines[-100:]
        else:
            result_lines = lines
        result["log"] = result_lines

        return response(status=1, message="OK", result=result, length=length) # 변경
        # return response(status=1, message="OK", result=result, length=length)
    except FileNotFoundError as fe:
        return response(status=0, message="Hps log not exist.", result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Hps Log Error ", result=result, length = 0)

def get_hps_download(hps_id, table_item_id):
    try:
        log_path = get_hyperparam_sub_log_file_path(hps_id, table_item_id)

        return log_path

    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Can't find file ", path="")
