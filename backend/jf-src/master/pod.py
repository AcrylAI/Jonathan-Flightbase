from utils.resource import CustomResource, token_checker
from flask_restplus import reqparse, Resource
from restplus import api
from utils.resource import response
import traceback

import utils.common as common
import utils.db as db
import utils.kube_parser as kube_parser
import utils.kube_pod_status as kube_pod_status
from TYPE import *


import os
import re
from lock import jf_pod_update_lock
ns = api.namespace('pod', description="Pod 관련용")
parser = reqparse.RequestParser()

pod_start_post = api.parser()
pod_start_post.add_argument('pod_name', type=str, required=True, location='json', help='running pod name')

pod_queue_get = api.parser()
pod_queue_get.add_argument('workspace_id', type=int, required=False, default=None, location='args', help='queue base workspace id ')

active_pod_get = api.parser()
active_pod_get.add_argument('workspace_id', type=int, required=False, default=None, location='args', help='queue base workspace id ')

def is_tool_pod(labels):
    if labels.get("work_func_type") == TRAINING_ITEM_B:
        return True
    return False

def is_jupyter_editor_pod(labels):
    # check (editor)
    if labels.get("work_func_type") == TRAINING_ITEM_B and labels.get("training_tool_type") == TOOL_TYPE[0]:
        return True
    return False

def is_jupyter_gpu_pod(labels):
    # check jupyter-gpu
    if labels.get("work_func_type") == TRAINING_ITEM_B and labels.get("training_tool_type") == TOOL_TYPE[1]:
        return True
    return False

def is_job_pod(labels):
    if labels.get("work_func_type") == TRAINING_ITEM_A:
        return True
    return False

def is_job_cpu_pod(labels):
    # check job-cpu
    if labels.get("work_func_type") == TRAINING_ITEM_A and int(labels.get("training_total_gpu")) == 0 and int(labels.get("training_index")) == 0:
        return True
    return False

def is_job_gpu_pod(labels):
    # check job-cpu
    if labels.get("work_func_type") == TRAINING_ITEM_A and int(labels.get("training_total_gpu")) > 0 and int(labels.get("training_index")) == 0:
        return True
    return False

def is_hps_pod(labels):
    if labels.get("work_func_type") == TRAINING_ITEM_C:
        return True
    return False

def is_hps_cpu_pod(labels):
    # check hps-cpu
    if labels.get("work_func_type") == TRAINING_ITEM_C and  int(labels.get("training_total_gpu")) == 0 and int(labels.get("training_index")) == 0:
        return True
    return False

def is_hps_gpu_pod(labels):
    # check hps-gpu
    if labels.get("work_func_type") == TRAINING_ITEM_C and  int(labels.get("training_total_gpu")) > 0 and int(labels.get("training_index")) == 0:
        return True
    return False

def is_deployment_pod(labels):
    if labels.get("work_func_type") == DEPLOYMENT_ITEM_A:
        return True
    return False

def is_deployment_cpu_pod(labels):
    #
    if labels.get("work_func_type") == DEPLOYMENT_ITEM_A and  int(labels.get("deployment_total_gpu")) == 0:
        return True
    return False

def is_deployment_gpu_pod(labels):
    #
    if labels.get("work_func_type") == DEPLOYMENT_ITEM_A and  int(labels.get("deployment_total_gpu")) > 0:
        return True
    return False

def pod_end(pod_item):

    def update_item_end_time(pod_labels, pod_status):
        # CREATE_KUBER_TYPE = ["job","tool","deployment"]
        # Training - editor   :  type = jupyter, editor=True ==> jupyter_id
        #        - tool : type = jupyter, editor=False ==> jupyter_id
        #        - job : type = job ==> job_id

        # Deployment - deployment : type = deployment ==> deployment_id
        if is_job_pod(labels=pod_labels):
            print("Job End Time UDATE!")
            db.update_job_end_time(job_id=pod_labels.get("job_id"), pod_status=pod_status)
        elif is_tool_pod(labels=pod_labels):
            print("Tool End Time UDATE!")
            db.update_training_tool_end_time(training_tool_id=pod_labels.get("training_tool_id"), pod_status=pod_status)
        elif is_deployment_pod(labels=pod_labels):
            print("Deployment End Time UDATE!")
            db.update_deployment_end_time(deployment_id=pod_labels.get("deployment_id"))
            db.update_deployment_worker_end_time(deployment_worker_id=pod_labels.get("deployment_worker_id"), pod_status=pod_status)
        elif is_hps_pod(labels=pod_labels):
            print("HPS End Time UDATE!")
            db.update_hyperparamsearch_end_time(hps_id=pod_labels.get("hps_id"), pod_status=pod_status)
    
    pod_labels = kube_parser.parsing_item_labels(pod_item)
    pod_name = kube_parser.parsing_item_name(pod_item)
    pod_status = kube_pod_status.get_pod_status(pod_item)

    delete_pod_resource_usage_log_dir(pod_name=pod_name)
    delete_pod_status_dir(pod_name=pod_name)
    # TODO Lock이 필요한지 테스트 필요 (2022-10-11 Yeobie)
    with jf_pod_update_lock:
        update_item_end_time(pod_labels=pod_labels, pod_status=pod_status)


def pod_start(pod_name):
    import utils.kube as kube
    return response(status=1, message=pod_name)
    try:
        config = None
        print(pod_name)

        pod_info = kube.read_pod(pod_name=pod_name)
        pod_status = kube.get_pod_status(pod_info)
        pod_labels = pod_info.metadata.labels

        gpu_config, cpu_config = kube.get_pod_configuration(pod_name)
        gpu_list = []
        if gpu_config["num_gpus"] > 0:
            gpu_list = [ gpu.get("model") for gpu in gpu_config["list"] ]

        if is_tool_pod(labels=pod_labels): # JUPYTER
            # jupyter - jupyter_id (type = "jupyter" CREATE_KUBER_TYPE[1])
            if pod_labels.get("training_tool_type") == TOOL_TYPE[0] or len(gpu_list) == 0:
                config = cpu_config
            else:
                config = common.configuration_list_to_db_configuration_form(gpu_list)
            print("Jupyter Conf : " , config)
            db.update_training_tool_configurations(training_tool_id=pod_labels.get("training_tool_id"), configurations=config)
            db.update_training_tool_start_time(training_tool_id=pod_labels.get("training_tool_id"), executor_id=pod_labels.get("executor_id"),
                workspace_id=pod_labels.get("workspace_id"), training_name=pod_labels.get("training_name"), training_type=pod_labels.get("training_type"))

        elif is_job_pod(labels=pod_labels): # Job
            # job - job_id (type = "job" CREATE_KUBER_TYPE[0])
                if int(pod_labels.get("training_total_gpu")) > 0:
                    db_config = db.get_job(job_id=pod_labels.get("job_id"))["configurations"]
                    db_gpu_list = common.db_configurations_to_list(db_config)
                    config = common.configuration_list_to_db_configuration_form(gpu_list+db_gpu_list)
                else :
                    config = cpu_config
                #TODO Lock이 필요 할 수 있음 테스트 필요
                print("Job Conf : " , config)
                db.update_job_configurations(job_id=pod_labels.get("job_id"), configurations=config)
                db.update_job_start_time(job_id=pod_labels.get("job_id"), workspace_id=pod_labels.get("workspace_id"), training_name=pod_labels.get("training_name"))

        elif is_deployment_pod(labels=pod_labels): # Deployment
            # deployment - deployment_id (type = "deployment" CREATE_KUBER_TYPE[2])
            if pod_status["restart_count"] > 0:
                # 재시작시에 요청을 보내는데 이땐 처리하지 않도록
                return response(status=1, message=pod_name)
            if int(pod_labels.get("deployment_total_gpu")) > 0:
                config = common.configuration_list_to_db_configuration_form(gpu_list)
            else:
                config = cpu_config
            print("Deployment Conf : " , config)
            db.update_deployment_configurations(deployment_id=pod_labels.get("deployment_id"), configurations=config)
            db.update_deployment_worker_configurations(deployment_worker_id=pod_labels.get("deployment_worker_id"), configurations=config)
            db.update_deployment_start_time(deployment_id=pod_labels.get("deployment_id"), executor_id=pod_labels.get("executor_id"))
            db.update_deployment_worker_start_time(deployment_worker_id=pod_labels.get("deployment_worker_id"), executor_id=pod_labels.get("executor_id"))

        elif is_hps_pod(labels=pod_labels): # Hps
            if int(pod_labels.get("training_total_gpu")) > 0:
                db_config = db.get_hyperparamsearch(hps_id=pod_labels.get("hps_id"))["configurations"]
                db_gpu_list = common.db_configurations_to_list(db_config)
                config = common.configuration_list_to_db_configuration_form(gpu_list+db_gpu_list)
            else:
                config = cpu_config
            print("HPS Conf : " , config)
            db.update_hyperparamsearch_configurations(hps_id=pod_labels.get("hps_id"), configurations=config)
            db.update_hyperparamsearch_start_time(hps_id=pod_labels.get("hps_id"))
            
    except:
        traceback.print_exc()
        pass
        return response(status=0, message=pod_name)

    return response(status=1, message=pod_name)

def pod_start_new(labels, gpu_count, gpu_model=None, cpu_model=None):
    import utils.kube as kube
    try:
        config = None

        pod_labels = labels

        gpu_list = [ gpu_model ] * gpu_count

        if is_tool_pod(labels=pod_labels): # JUPYTER
            # jupyter - jupyter_id (type = "jupyter" CREATE_KUBER_TYPE[1])
            if pod_labels.get("training_tool_type") == TOOL_TYPE[0] or len(gpu_list) == 0:
                config = cpu_model
            else:
                config = common.configuration_list_to_db_configuration_form(gpu_list)
            print("Jupyter Conf : " , config)
            db.update_training_tool_configurations(training_tool_id=pod_labels.get("training_tool_id"), configurations=config)
            db.update_training_tool_start_time(training_tool_id=pod_labels.get("training_tool_id"), executor_id=pod_labels.get("executor_id"),
                workspace_id=pod_labels.get("workspace_id"), training_name=pod_labels.get("training_name"), training_type=pod_labels.get("training_type"))

        elif is_job_pod(labels=pod_labels): # Job
            # job - job_id (type = "job" CREATE_KUBER_TYPE[0])
            config_gpu_len = 0 
            if int(pod_labels.get("training_total_gpu")) > 0:
                db_config = db.get_job(job_id=pod_labels.get("job_id"))["configurations"]
                db_gpu_list = common.db_configurations_to_list(db_config)
                new_db_gpu_list = gpu_list + db_gpu_list
                config_gpu_len = len(new_db_gpu_list)
                config = common.configuration_list_to_db_configuration_form(new_db_gpu_list)
            else :
                config = cpu_model
            #TODO Lock이 필요 할 수 있음 테스트 필요
            print("Job Conf : " , config)
            db.update_job_configurations(job_id=pod_labels.get("job_id"), configurations=config)
            
            # GPU가 2개 이상인 경우 Node가 2개 이상일 수 있음
            if int(pod_labels.get("training_total_gpu")) <= 1 or config_gpu_len == int(pod_labels.get("training_total_gpu")):
                print("Update Job Start Time")
                db.update_job_start_time(job_id=pod_labels.get("job_id"), workspace_id=pod_labels.get("workspace_id"), training_name=pod_labels.get("training_name"))

        elif is_deployment_pod(labels=pod_labels): # Deployment
            # deployment - deployment_id (type = "deployment" CREATE_KUBER_TYPE[2])
            if int(pod_labels.get("deployment_total_gpu")) > 0:
                config = common.configuration_list_to_db_configuration_form(gpu_list)
            else:
                config = cpu_model
            print("Deployment Conf : " , config)
            db.update_deployment_configurations(deployment_id=pod_labels.get("deployment_id"), configurations=config)
            db.update_deployment_worker_configurations(deployment_worker_id=pod_labels.get("deployment_worker_id"), configurations=config)
            db.update_deployment_start_time(deployment_id=pod_labels.get("deployment_id"), executor_id=pod_labels.get("executor_id"))
            db.update_deployment_worker_start_time(deployment_worker_id=pod_labels.get("deployment_worker_id"), executor_id=pod_labels.get("executor_id"))

        elif is_hps_pod(labels=pod_labels): # Hps
            config_gpu_len = 0 
            if int(pod_labels.get("training_total_gpu")) > 0:
                db_config = db.get_hyperparamsearch(hps_id=pod_labels.get("hps_id"))["configurations"]
                db_gpu_list = common.db_configurations_to_list(db_config)
                new_db_gpu_list = gpu_list + db_gpu_list
                config_gpu_len = len(new_db_gpu_list)
                config = common.configuration_list_to_db_configuration_form(new_db_gpu_list)
            else:
                config = cpu_model
            print("HPS Conf : " , config)
            db.update_hyperparamsearch_configurations(hps_id=pod_labels.get("hps_id"), configurations=config)
            if int(pod_labels.get("training_total_gpu")) <= 1 or config_gpu_len == int(pod_labels.get("training_total_gpu")):
                print("Update Hps Start Time")
                db.update_hyperparamsearch_start_time(hps_id=pod_labels.get("hps_id"))
            
    except:
        pass


#TODO API 시작시 한번 체크 후 정리기능 필요
def pod_resource_usage_clear():
    import utils.kube as kube

    all_running_pod_name_list = kube.find_kuber_item_name(item_list=kube.get_list_namespaced_pod())

    for resource_pod_dir_name in os.listdir(POD_RESOURCE_BASE_PATH_IN_JF_API.format(pod_name="")):
        if resource_pod_dir_name not in all_running_pod_name_list:
            # Delete Dir
            # delete_pod_resource_usage_log_dir(pod_name=resource_pod_dir_name)
            pass

def delete_pod_resource_usage_log_dir(pod_name):
    if pod_name == "" or pod_name == None:
        return -1
    pod_resource_usage_log_path = POD_RESOURCE_BASE_PATH_IN_JF_API.format(pod_name=pod_name)
    print("delete pod resource usage log ", pod_resource_usage_log_path)
    os.system("rm -r {}".format(pod_resource_usage_log_path))

#TODO API 시작시 한번 체크 후 정리기능 필요
# def pod_status_dir_clear():
#     import utils.kube as kube

#     all_running_pod_name_list = kube.find_kuber_item_name(item_list=kube.get_list_namespaced_pod())

#     for resource_pod_dir_name in os.listdir(POD_RESOURCE_BASE_PATH_IN_JF_API.format(pod_name="")):
#         if resource_pod_dir_name not in all_running_pod_name_list:
#             # Delete Dir
#             # delete_pod_status_dir(pod_name=resource_pod_dir_name)
#             pass

def delete_pod_status_dir(pod_name):
    if pod_name == "" or pod_name == None:
        return -1
    pod_status_path = POD_STATUS_IN_JF_API.format(pod_name=pod_name)
    print("delete pod status dir ", pod_status_path)
    os.system("rm -r {}".format(pod_status_path))


# ROUTER
# response_test = []
@ns.route('/start', methods=['POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class PodStart(CustomResource):
    
    @ns.expect(pod_start_post)
    def post(self):
        """Pod Start POST"""

        # 1. jupyter editor (cpu)  training_id, editor or jupyter_id, editor
        # 2. jupyter (gpu)  training_id, editor or jupyter_id, editor
        # 3. job  training_id 
        # 4. deployment  
        args = pod_start_post.parse_args()

        pod_name = args["pod_name"]
        with jf_pod_update_lock:
            response = pod_start(pod_name=pod_name)

        return self.send(response)

def queue_result_sample():
    return {
        "queue_list": [
            {
                "item_type": "other_workspace",
                "count": 9
            },
            {
                "item_type": "training_group",
                "training_name": "hps-pendingtttt",
                "item_list": [{
                "workspace_name": "robert-ws",
                "workspace_id": 1,
                "training_name": "hps-pendingtttt",
                "training_id": 16,
                "training_type": "advanced",
                "owner_name": "yeobie",
                "users": None,
                "image": "jf_default:latest",
                "hps_name": "qeb421g",
                "hps_id": 56,
                "gpu_count": 2,
                "hps_group_number": 21,
                "run_code": "/examples/hps_fast_test_mutiple_param.py",
                "run_parameter": "",
                "search_parameter": " --x=(0,10) ",
                "int_parameter": "",
                "method": "0",
                "search_count": 10000,
                "search_interval": None,
                "init_points": 0,
                "hps_group_index": 1,
                "dataset_name": None,
                "dataset_access": None,
                "gpu_model": None,
                "unified_memory": 0,
                "gpu_acceleration": 0,
                "rdma": 0,
                "create_datetime": "2021-03-05 02:13:34",
                "save_file_name": "qeb421g",
                "load_file_name": "qeb421g.json",
                "model": None,
                "built_in_path": None,
                "built_in_model_id": None,
                "creator_name": "yeobie",
                "item_type": "hps"
            },
            {
                "workspace_name": "robert-ws",
                "workspace_id": 1,
                "training_name": "tt",
                "training_id": 10,
                "job_group_number": 1,
                "job_name": "built-sim-1",
                "gpu_count": 2,
                "create_datetime": "2021-03-05 02:14:00",
                "creator_name": "yeobie",
                "item_type": "job",
                "num_of_job": 4
            }]
            },
            {
                "workspace_name": "robert-ws",
                "workspace_id": 1,
                "training_name": "hps-pendingtttt",
                "training_id": 16,
                "training_type": "advanced",
                "owner_name": "yeobie",
                "users": None,
                "image": "jf_default:latest",
                "hps_name": "qeb421g",
                "hps_id": 56,
                "gpu_count": 2,
                "hps_group_number": 21,
                "run_code": "/examples/hps_fast_test_mutiple_param.py",
                "run_parameter": "",
                "search_parameter": " --x=(0,10) ",
                "int_parameter": "",
                "method": "0",
                "search_count": 10000,
                "search_interval": None,
                "init_points": 0,
                "hps_group_index": 1,
                "dataset_name": None,
                "dataset_access": None,
                "gpu_model": None,
                "unified_memory": 0,
                "gpu_acceleration": 0,
                "rdma": 0,
                "create_datetime": "2021-03-05 02:13:34",
                "save_file_name": "qeb421g",
                "load_file_name": "qeb421g.json",
                "model": None,
                "built_in_path": None,
                "built_in_model_id": None,
                "creator_name": "yeobie",
                "item_type": "hps"
            },
            {
                "workspace_name": "robert-ws",
                "workspace_id": 1,
                "training_name": "tt",
                "training_id": 10,
                "job_group_number": 1,
                "job_name": "built-sim-1",
                "gpu_count": 2,
                "create_datetime": "2021-03-05 02:14:00",
                "creator_name": "yeobie",
                "item_type": "job",
                "num_of_job": 4
            },
            {
                "workspace_name": "robert-ws",
                "workspace_id": 1,
                "training_name": "hps-test",
                "training_id": 1,
                "training_type": "advanced",
                "owner_name": "yeobie",
                "users": None,
                "image": "jf_default:latest",
                "hps_name": "tt4",
                "hps_id": 57,
                "gpu_count": 1,
                "hps_group_number": 12,
                "run_code": "/src/hps_graph_test.py",
                "run_parameter": "",
                "search_parameter": " --x=(0,10) ",
                "int_parameter": "",
                "method": "0",
                "search_count": 1000,
                "search_interval": None,
                "init_points": 0,
                "hps_group_index": 5,
                "dataset_name": None,
                "dataset_access": None,
                "gpu_model": None,
                "unified_memory": 0,
                "gpu_acceleration": 0,
                "rdma": 0,
                "create_datetime": "2021-03-05 02:15:57",
                "save_file_name": "tt4",
                "load_file_name": "tt4.json",
                "model": None,
                "built_in_path": None,
                "built_in_model_id": None,
                "creator_name": "yeobie",
                "item_type": "hps"
            },
            {
                "item_type": "other_workspace",
                "count": 6
            }
        ],
        "running_list": [
            {
                "workspace_name": "robert-ws",
                "workspace_id": 1,
                "training_name": "tt",
                "training_id": 10,
                "job_group_number": 1,
                "job_name": "built-sim-1",
                "gpu_count": 2,
                "create_datetime": "2021-03-05 02:14:00",
                "creator_name": "yeobie",
                "item_type": "job",
                "num_of_job": 4,
                "job_group_index": 2
            }
        ],
        "gpu_resource": {
            "node": {
                "total": 2,
                "free": 1,
                "used": 1
            },
            "workspace": {
                "total": 0,
                "free": 0,
                "used": 0
            }
        }
    }


def get_queue_list(workspace_id):
    from utils.scheduler import get_pod_queue
    import utils.kube as kube
    pod_list = kube.kube_data.get_pod_list()
    node_list = kube.kube_data.get_node_list()
    workspace_info = db.get_workspace(workspace_id=workspace_id)
    guaranteed_gpu = workspace_info["guaranteed_gpu"]
    def get_job_info(item):
        return {
            "job_id": item["job_id"],
            "job_group_index": item["job_group_index"],
            "run_code": item["run_code"],
            "parameter": item["parameter"],
            "dataset_name": item["dataset_name"],
            "dataset_access": item["dataset_access"],
            "gpu_model": item["gpu_model"],
            "unified_memory": item["unified_memory"],
            "gpu_acceleration": item["gpu_acceleration"],
            "rdma": item["rdma"],
            "model": item["model"],
            "built_in_path": item["built_in_path"],
            "built_in_model_id": item["built_in_model_id"]
        }


    job_group_key_dic = {}
    queue_list = []
    db_queue_list = get_pod_queue() 

    # GPU 사용 하는 것만
    for i, item in enumerate(db_queue_list):
        item_type = ""
        if item.get("job_id") is not None:
            item_type = TRAINING_ITEM_A
        elif item.get("hps_id") is not None:
            item_type = TRAINING_ITEM_C

        if workspace_id is not None and workspace_id != item["workspace_id"] :
            if len(queue_list) == 0:
                queue_list.append({"item_type": "other_workspace", "count": 1})
            elif queue_list[-1].get("item_type") == "other_workspace":
                queue_list[-1]["count"] += 1
            else:
                queue_list.append({"item_type": "other_workspace", "count": 1})
            continue

        if item["gpu_count"] == 0:
            continue


        # JOB
        if item_type == TRAINING_ITEM_A:
            job_group_key = "{}-{}-{}".format(item["training_id"], item["job_group_number"], common.date_str_to_timestamp(item["create_datetime"]))
            if job_group_key_dic.get(job_group_key) is None: 
                item_info = {
                        "workspace_name": item["workspace_name"],
                        "workspace_id": item["workspace_id"],
                        "training_name": item["training_name"],
                        "training_id": item["training_id"],
                        "job_group_number": item["job_group_number"],
                        "job_name": item["job_name"],
                        "gpu_count": item["gpu_count"],
                        "executor": item["creator_name"],
                        "item_type": item_type,
                        # "job_list": [
                        #     get_job_info(item)
                        # ],
                        "num_of_job": 1
                    }
                queue_list.append(item_info)
                job_group_key_dic[job_group_key] = {} 
                job_group_key_dic[job_group_key]["index"] = len(queue_list) -1 
                job_group_key_dic[job_group_key]["item"] = item_info
            else :
                # job_group_key_dic[job_group_key]["item"]["job_list"].append(get_job_info(item))
                job_group_key_dic[job_group_key]["item"]["num_of_job"] += 1


        elif item_type == TRAINING_ITEM_C:
            item_info = {
                "workspace_name": item["workspace_name"],
                "workspace_id": item["workspace_id"],
                "training_name": item["training_name"],
                "training_id": item["training_id"],
                "hps_group_index": item["hps_group_index"],
                "hps_name": item["hps_name"],
                "gpu_count": item["gpu_count"],
                "executor": item["creator_name"],
                "item_type": item_type,
            }
            queue_list.append(item_info)



    duple_index = []
    running_list = []
    running_pod_list = kube.find_kuber_item_name_and_item(item_list=pod_list, work_func_type=CREATE_KUBER_TYPE, workspace_id=workspace_id)
    for pod in running_pod_list:
        labels = pod["item"].metadata.labels
        
        # if int(labels["workspace_id"]) != workspace_id:
        #     # for only base workspace pod list
        #     continue

        if labels.get("work_func_type") == TRAINING_ITEM_A:
            # JOB
            if int(labels.get("training_index")) == 0 and int(labels.get("training_total_gpu")) > 0:
                job_group_key = "{}-{}-{}".format(labels["training_id"], labels["job_group_number"], labels["create_datetime"])
                if job_group_key_dic.get(job_group_key) is not None:
                    running_list.append(job_group_key_dic.get(job_group_key)["item"])
                    # running_list[-1]["job_list"] = [{
                    #     "job_id": int(labels["job_id"]),
                    #     "job_group_index": int(labels["job_group_index"]),
                    #     "running": True
                    # }] + running_list[-1]["job_list"]
                    running_list[-1]["job_group_index"] = int(labels["job_group_index"])
                    duple_index.append(job_group_key_dic.get(job_group_key)["index"])
                else :
                    running_list.append({
                        "workspace_name": labels["workspace_name"],
                        "workspace_id": int(labels["workspace_id"]),
                        "training_name": labels["training_name"],
                        "training_id": int(labels["training_id"]),
                        "job_name": labels["job_name"],
                        "job_group_number": int(labels["job_group_number"]),
                        "gpu_count": int(labels.get("training_total_gpu")),
                        "item_type": labels.get("work_func_type"),
                        # "job_list": [{
                        #     "job_id": int(labels["job_id"]),
                        #     "job_group_index": int(labels["job_group_index"]),
                        #     "running": True
                        # }],
                        "num_of_job": 0,
                        "job_group_index": int(labels["job_group_index"])
                    })  
        elif labels.get("work_func_type") == TRAINING_ITEM_B:
            # JUPYTER
            labels["training_total_gpu"] = int(labels.get("training_total_gpu")) if labels.get("training_total_gpu") is not None else 0
            if int(labels.get("training_total_gpu")) > 0:
                running_list.append({
                        "workspace_name": labels["workspace_name"],
                        "workspace_id": int(labels["workspace_id"]),
                        "training_name": labels["training_name"],
                        "training_id": int(labels["training_id"]),
                        "gpu_count": int(labels["training_total_gpu"]),
                        "item_type": TRAINING_ITEM_B,
                        "executor": labels.get("executor_name"),
                    })
        elif labels.get("work_func_type") == TRAINING_ITEM_C:
            #HPS
            if int(labels.get("training_index")) == 0 and int(labels.get("training_total_gpu")) > 0:
                running_list.append({
                    "workspace_name": labels["workspace_name"],
                    "workspace_id": int(labels["workspace_id"]),
                    "training_name": labels["training_name"],
                    "training_id": int(labels["training_id"]),
                    "hps_name": labels["hps_name"],
                    "hps_id": int(labels["hps_id"]),
                    "hps_group_index": int(labels["hps_group_index"]),
                    "hps_group_id": int(labels["hps_group_id"]),
                    "gpu_count": int(labels.get("training_total_gpu")),
                    "executor": labels.get("executor_name"),
                    "item_type": TRAINING_ITEM_C
                })

    duple_index = sorted(duple_index, reverse=True)
    for i in duple_index:
        del queue_list[i]

    # Training Case Only
    workspace_gpu_count = kube.get_workspace_gpu_count(workspace_id=workspace_id, pod_list=pod_list)
    workspace_total = workspace_gpu_count["{}_total".format(TRAINING_TYPE)]
    workspace_used = workspace_gpu_count["{}_used".format(TRAINING_TYPE)]
    workspace_free = workspace_total - workspace_used

    # Node resource Info 
    node_gpu_usage_status = kube.get_node_gpu_usage_status(guaranteed_gpu=guaranteed_gpu)
    node_total = node_gpu_usage_status["total"]
    node_used = node_gpu_usage_status["used"]
    node_free = node_gpu_usage_status["free"]

    gpu_resource = {
        "node": {
            "total": node_total, 
            "free": node_free, 
            "used": node_used
        },
        "workspace": {
            "total": workspace_total, 
            "free": workspace_free, 
            "used": workspace_used
        }
    }
    
    # kube.get_node_resource()
    return response(status=1, result={
        "queue_list": queue_list,
        "running_list": running_list,
        "gpu_resource" : gpu_resource
        }, result_sample=queue_result_sample())
    


def get_active_list(workspace_id, headers_user_id):
    from utils.scheduler import get_pod_queue
    import utils.kube as kube
    import utils.db as db

    pod_list = kube.kube_data.get_pod_list()
    node_list = kube.kube_data.get_node_list()

    active_list = {
        "editor": [],
        "jupyter-gpu": [],
        "job-cpu": [],
        "job-gpu": [],
        "hps-cpu": [],
        "hps-gpu": [],
        "deployment-cpu": [],
        "deployment-gpu": []
    }

    if workspace_id is None:
        # 전체 workspace ( 내가 속한 )
        workspace_id_list = [ str(workspace["id"]) for workspace in db.get_user_workspace(user_id=headers_user_id) ] 
        active_pod_list = kube.find_kuber_item_name_and_item(item_list=pod_list, work_func_type=CREATE_KUBER_TYPE, workspace_id=workspace_id_list)
    else :
        # 현재 보고 있는 workspace
        active_pod_list = kube.find_kuber_item_name_and_item(item_list=pod_list, work_func_type=CREATE_KUBER_TYPE, workspace_id=workspace_id)

 

    for pod in active_pod_list:
        labels = pod["item"].metadata.labels
        item_common_info = {
            "workspace_id": int(labels.get("workspace_id")),
            "workspace_name": labels.get("workspace_name"),
            "executor": labels.get("executor_name"),
            "item_type": labels.get("work_func_type")
        }
        
        # editor
        if is_jupyter_editor_pod(labels):
            item_info = {
                "training_id": int(labels.get("training_id")),
                "training_name": labels.get("training_name"),
                "gpu_count": int(labels.get("training_total_gpu"))
            }
            item_common_info.update(item_info)
            active_list["editor"].append(item_common_info)
        # jupyter-gpu
        elif is_jupyter_gpu_pod(labels):
            item_info = {
                "training_id": int(labels.get("training_id")),
                "training_name": labels.get("training_name"),
                "gpu_count": int(labels.get("training_total_gpu"))
            }
            item_common_info.update(item_info)
            active_list["jupyter-gpu"].append(item_common_info)
        # job-cpu
        elif is_job_cpu_pod(labels):
            item_info = {
                "job_name": labels.get("job_name"),
                "training_id": int(labels.get("training_id")),
                "training_name": labels.get("training_name"),
                "gpu_count": int(labels.get("training_total_gpu")),
                "num_of_job": 9999,
                "job_group_index": int(labels.get("job_group_index")),
            }
            item_common_info.update(item_info)
            active_list["job-cpu"].append(item_common_info)
        # job-gpu
        elif is_job_gpu_pod(labels):
            item_info = {
                "job_name": labels.get("job_name"),
                "training_id": int(labels.get("training_id")),
                "training_name": labels.get("training_name"),
                "gpu_count": int(labels.get("training_total_gpu")),
                "num_of_job": 9999,
                "job_group_index": int(labels.get("job_group_index")),
            }
            item_common_info.update(item_info)
            active_list["job-gpu"].append(item_common_info)
        # hps-cpu
        elif is_hps_cpu_pod(labels):
            item_info = {
                "hps_name": labels.get("hps_name"),
                "training_id": int(labels.get("training_id")),
                "training_name": labels.get("training_name"),
                "gpu_count": int(labels.get("training_total_gpu")),
                "hps_group_index": int(labels.get("hps_group_index"))
            }
            item_common_info.update(item_info)
            active_list["hps-cpu"].append(item_common_info)
        # hps-gpu
        elif is_hps_gpu_pod(labels):
            item_info = {
                "hps_name": labels.get("hps_name"),
                "training_id": int(labels.get("training_id")),
                "training_name": labels.get("training_name"),
                "gpu_count": int(labels.get("training_total_gpu")),
                "hps_group_index": int(labels.get("hps_group_index"))
            }
            item_common_info.update(item_info)
            active_list["hps-gpu"].append(item_common_info)
        # deploy-cpu
        elif is_deployment_cpu_pod(labels):
            item_info = {
                "deployment_id": int(labels.get("deployment_id")),
                "deployment_name": labels.get("deployment_name"),
                "gpu_count": int(labels.get("deployment_total_gpu")),
            }
            item_common_info.update(item_info)
            active_list["deployment-cpu"].append(item_common_info)
        # deploy-gpu
        elif is_deployment_gpu_pod(labels):
            item_info = {
                "deployment_id": int(labels.get("deployment_id")),
                "deployment_name": labels.get("deployment_name"),
                "gpu_count": int(labels.get("deployment_total_gpu")),
            }
            item_common_info.update(item_info)
            active_list["deployment-gpu"].append(item_common_info)
        # job-gpu
        # if labels.get("work_func_type") == TRAINING_ITEM_A:
        #     if int(labels.get("training_index")) == 0 and int(labels.get("training_total_gpu")) > 0:
        # elif labels.get("work_func_type") == TRAINING_ITEM_B:
        # elif labels.get("work_func_type") == TRAINING_ITEM_C:

        


    return response(status=1, result={
        "active_list": active_list
    })


# 보장 workspace 내  돌고 있는 정보
# training_id, training_name, 
# item_type(job | hps | jupyter), item_name, gpu_count
# detail
# 진행 된 시간?, 남은 아이템 개수


# pending 상태
# 1. workspace 자원이 없어서 (할당 받은거 이상을 사용하려고 하는 상황)
# 2. 비보장에서 node 자원이 없어서 (워크스페이스 자원은 충분하지만 클러스터 전체에서 사용 할 수 있는 GPU가 부족)  
# EX) 0/4 인 상황이지만. 노드 GPU 10개 중 6개는 보장이 쓰고, 나머지 4개 중 다른 비보장이 이미 쓰고 있음
# 2-1. 선택한 GPU 타입이 부족해서.
# 3. 같은 training에서 job이나 hps가 이미 돌고 있어서

@ns.route('/list_queue', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class PodQueue(CustomResource):
    @ns.expect(pod_queue_get)
    def get(self):
        """GET"""
        args = pod_queue_get.parse_args()
        workspace_id = args["workspace_id"]
        response = get_queue_list(workspace_id=workspace_id)

        return self.send(response)


@ns.route('/list_active', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class PodActive(CustomResource):
    @ns.expect(active_pod_get)
    def get(self):
        """GET"""
        args = active_pod_get.parse_args()
        workspace_id = args["workspace_id"]
        response = get_active_list(workspace_id=workspace_id, headers_user_id=self.check_user_id())

        return self.send(response)