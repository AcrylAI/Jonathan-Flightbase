from restplus import api
from flask_restplus import reqparse
from utils.resource import CustomResource, response, token_checker
import utils.db as db
from utils.resource import response
import utils.common as common
import utils.kube as kube
import traceback
from TYPE import TRAINING_TYPE, TRAINING_TYPE_A, TRAINING_TYPE_C, TRAINING_TYPE_D, TRAINING_BUILT_IN_TYPES
from TYPE import DEPLOYMENT_TYPE, DEPLOYMENT_TYPE_A, DEPLOYMENT_TYPE_B, DEPLOYMENT_TYPES, PORT_PROTOCOL_LIST, TOOL_DEFAULT_PORT, TOOL_TYPE
from TYPE import *
from utils.access_check import workspace_access_check, training_access_check
from utils.exceptions import *
from gpu import get_deployment_aval_gpu, get_training_aval_gpu

from deployment import get_training_checkpoints

from training import permission_check as training_permission_check, get_run_code_list_from_src, get_sample_code

from training_hyperparam import get_hyperparamsearch_saved_file_list, get_method_list

from settings import JF_BUILT_IN_MODELS_PATH, JF_WS_DIR

from nodes import check_node_have_inifni

from datasets import check_file

from built_in_model import get_built_in_paramters_info, comp_built_in_data_training_form_and_dataset

from storage import get_storage_list
import os
import base64

ns = api.namespace('options', description='option API')

deployment_option_get = api.parser()
deployment_option_get.add_argument('workspace_id', required=False, type=int, default=None, location='args', help='Workspace id ( not => return  workspace_list )')

data_training_form_get = api.parser()
data_training_form_get.add_argument('dataset_id', type=int, required=True, location='json', help="dataset_id")
data_training_form_get.add_argument('data_training_form', type=list, required=True, location='json', help="data_training_form (with childern)")

job_option_get = api.parser()
job_option_get.add_argument('training_id', type=int, required=True, location='args', help="training id")

job_deployment_option_get = api.parser()
job_deployment_option_get.add_argument('training_id', type=int, required=True, location='args', help="training id")
job_deployment_option_get.add_argument('job_group_number', type=int, required=True, location='args', help="job group id")

hps_option_get = api.parser()
hps_option_get.add_argument('training_id', type=int, required=True, location='args', help="training id")
hps_option_get.add_argument('hps_group_id', type=int, required=False, default=None, location='args', help="hps group id for load file list")

training_option_get = api.parser()
training_option_get.add_argument('workspace_id', required=False, type=int, default=None, location='args', help='Workspace id ( not => return  workspace_list )')

workspace_option_get = api.parser()

records_option_get = api.parser()
records_option_get.add_argument('workspace_id', required=False, type=int, default=None, location='args', help='Workspace id ( not => return  workspace_list )')
records_option_get.add_argument('usergroup_id', required=False, type=int, default=None, location='args', help='Usergroup id ( not => return  workspace_list )')

built_in_model_option_get = api.parser()

port_forwarding_option_get = api.parser()
port_forwarding_option_get.add_argument('training_tool_type', required=False, type=int, default=1, location='args', help='Tool Type (0 = editor, 1 = Jupyter, 4 = SSH) default = 1')
port_forwarding_option_get.add_argument('training_tool_id', required=False, type=int, default=None, location='args', help='training_tool_id')

training_tool_option_get = api.parser()
training_tool_option_get.add_argument('training_id', required=True, type=int,location='args', help='Tool Base Training ID')

deployment_dashboard_option_get = api.parser()
deployment_dashboard_option_get.add_argument('start_time', type=str, required=True, default=None, location='args', 
                                            help='search start time %Y-%m-%d %H:%M:%S')
deployment_dashboard_option_get.add_argument('end_time', type=str, required=True, default=None, location='args', 
                                            help='search end time %Y-%m-%d %H:%M:%S')
deployment_dashboard_option_get.add_argument('deployment_id', required=True, type=int,location='args', help='Deployment ID')

deployment_template_option_get = api.parser()
deployment_template_option_get.add_argument('workspace_id', required=True, type=int, location='args', help='Workspace ID')
deployment_template_option_get.add_argument('deployment_template_type', required=True, type=str, location='args', help='Deployment Template Type')

deployment_template_usertrained_option_get = api.parser()
deployment_template_usertrained_option_get.add_argument('training_id', required=True, type=int, location='args', help='Training ID')
deployment_template_usertrained_option_get.add_argument('sort_key', type=str, required=False, default=None, location='args', help="회차(id), 점수(target) | params 영역 key ")
deployment_template_usertrained_option_get.add_argument('order_by', type=str, required=False, default=None, location='args', help="ASC | DESC")
deployment_template_usertrained_option_get.add_argument('is_param', type=int, required=False, default=None, location='args', help="1 | 0")

deployment_template_custom_option_get = api.parser()
deployment_template_custom_option_get.add_argument('training_id', required=True, type=int, location='args', help='Training ID')


deployment_template_name_option_get = api.parser()
deployment_template_name_option_get.add_argument('workspace_id', required=True, type=int,location='args', help='Workspace ID')
deployment_template_name_option_get.add_argument('deployment_template_id', required=False, type=int, location='args', help='Deployment Template Group ID')
deployment_template_name_option_get.add_argument('deployment_template_name', required=True, type=str, location='args', help='Deployment Template Group Name')
deployment_template_name_option_get.add_argument('deployment_template_group_id', required=False, type=int, location='args', help='Deployment Template Group ID')

deployment_template_group_name_option_get = api.parser()
deployment_template_group_name_option_get.add_argument('workspace_id', required=True, type=int,location='args', help='Workspace ID')
deployment_template_group_name_option_get.add_argument('deployment_template_group_id', required=False, type=int, location='args', help='Deployment Template Group ID')
deployment_template_group_name_option_get.add_argument('deployment_template_group_name', required=True, type=str, location='args', help='Deployment Template Group Name')

deployment_template_docker_image_id_option_get = api.parser()
deployment_template_docker_image_id_option_get.add_argument('built_in_model_id', required=True, type=int,location='args', help='Built In Model ID')

deployment_template_new_name_option_get = api.parser()
deployment_template_new_name_option_get.add_argument('workspace_id', required=True, type=int,location='args', help='Workspace ID')


images_option_get = api.parser()
images_option_get.add_argument('workspace_id', required=False, type=int, default=None, location='args', help='Workspace id ( not => return  workspace_list )')


deployment_training_option_get = api.parser()
deployment_training_option_get.add_argument('training_id', required=True, type=int, location='args', help='Deployment Training ID')
deployment_training_option_get.add_argument('training_type', required=True, type=str, location='args', help='Deployment Training Type: job/hps')

## TEST
def get_gpu_model_status_temp():
    import random
    def get_default_form(node_name_list, gpu_model, gpu_type, all_gpu_total, all_gpu_used):
        def get_node_list(node_name, gpu_model, gpu_total, gpu_used):
            return [
                    {
                        "name": node_name, 
                        "model": gpu_model, 
                        "memory": "11178-MiB", 
                        "total": gpu_total, 
                        "used": gpu_used, 
                        "aval": gpu_total - gpu_used, 
                        "queue": 0, 
                        "resource_info": {
                            "network_interface": {
                                "interface_ib": None, "interface_10g": "enp4s0f0"
                            }, 
                            "name": node_name,
                            "ip": "192.168.1.12",
                            "cpu_model": "11th Gen Intel(R) Core(TM) i5-11400 @ 2.60GHz", 
                            "cpu_cores": 12, 
                            "pod_alloc_cpu_cores": 13.0, 
                            "pod_alloc_avaliable_cpu_cores_per_pod": -1, 
                            "pod_alloc_avaliable_cpu_cores_per_gpu": -1, 
                            "cpu_cores_limits/total": 1.08, 
                            "cpu_cores_total-limits": -1.0, 
                            "cpu_cores_limit_per_pod": 7, 
                            "cpu_cores_limit_per_gpu": 12, 
                            "ram": 62.71, 
                            "pod_alloc_avaliable_ram_per_pod": -1, 
                            "pod_alloc_avaliable_ram_per_gpu": -1, 
                            "pod_alloc_ram": 20.0, 
                            "ram_limits/total": 0.32, 
                            "ram_total-limits": 42.71, 
                            "ram_limit_per_pod": 10, 
                            "ram_limit_per_gpu": 10, 
                            "is_cpu_server": 1, 
                            "is_gpu_server": 1, 
                            "interface_ib": None, 
                            "interface_10g": "enp4s0f0", 
                            "cpu_cores_lock_per_pod": 0, 
                            "cpu_cores_lock_per_gpu": 0, 
                            "ram_lock_per_pod": 0, 
                            "ram_lock_per_gpu": 0, 
                            "cpu_cores_lock_percent_per_pod": 500.0, 
                            "cpu_cores_lock_percent_per_gpu": 100.0, 
                            "ram_lock_percent_per_pod": 500.0, 
                            "ram_lock_percent_per_gpu": 100.0, 
                            "resource_congestion_status_per_pod": 2, 
                            "resource_congestion_status_per_gpu": 2, 
                            "resource_generable_status_per_pod": True, 
                            "resource_generable_status_per_gpu": True
                        }
                    }
                ]

        temp_all_gpu_total = all_gpu_total
        temp_all_gpu_used = all_gpu_used
        
        node_list = []
        for node_name in node_name_list:
            gpu_total = random.randint(0, temp_all_gpu_total)
            gpu_used = random.randint(0, min(gpu_total, temp_all_gpu_used))
            node_list += get_node_list(node_name=node_name, gpu_model=gpu_model, gpu_total=gpu_total, gpu_used=gpu_used)

            temp_all_gpu_total -= gpu_total
            temp_all_gpu_used -= gpu_used

        gpu_model_status_temp = {
                "total": all_gpu_total, 
                "used": all_gpu_used, 
                "aval": all_gpu_total - all_gpu_used, 
                "type": gpu_type, 
                "gpu_info": {
                    "cuda_cores": "3584", "computer_capability": "6.1", "architecture": "Pascal"
                }, 
                "node_list": node_list, 
                "model": gpu_model, "queue": 0
            }
        
        return gpu_model_status_temp
    

    # {"model": "RTX-5000(DUMMY)", "total": 1, "aval": 0, "used": 0, "type": "general"},
    # {"model": "GTX-2080(DUMMY)", "total": 2, "aval": 2, "used": 0, "type": "general"},
    # {"model": "A100-PCIE-40GB|mig-1g.5gb(DUMMY)", "total": 5, "aval": 3, "used": 2, "type": "mig"},
    # {"model": "A100-PCIE-40GB|mig-2g.10gb(DUMMY)", "total": 2, "aval": 2, "used": 0, "type": "mig"},
    # {"model": "A100-PCIE-40GB|mig-3g.20gb(DUMMY)", "total": 1, "aval": 1, "used": 0, "type": "mig"},
    return [
        get_default_form(node_name_list=["node-a", "node-b","node-c"], gpu_model="RTX-5000(DUMMY)", gpu_type=GPU_GENERAL_MODE, all_gpu_total=20, all_gpu_used=5),
        get_default_form(node_name_list=["node-1", "node-2","node-3"], gpu_model="GTX-2080(DUMMY)", gpu_type=GPU_GENERAL_MODE, all_gpu_total=15, all_gpu_used=6),
        get_default_form(node_name_list=["node-1", "node-2","node-3"], gpu_model="A100-PCIE-40GB|mig-1g.5gb(DUMMY)", gpu_type=GPU_MIG_MODE, all_gpu_total=15, all_gpu_used=8),
        get_default_form(node_name_list=["node-11", "node-22","node-33"], gpu_model="A100-PCIE-40GB|mig-2g.10gb(DUMMY)", gpu_type=GPU_MIG_MODE, all_gpu_total=10, all_gpu_used=7),
        get_default_form(node_name_list=["node-111", "node-222","node-333"], gpu_model="A100-PCIE-40GB|mig-3g.20gb(DUMMY)", gpu_type=GPU_MIG_MODE, all_gpu_total=5, all_gpu_used=3)
    ]

def get_built_in_model_list_order_by_checkpoint_exist(trained_built_in_model_list):
    no_checkpoint=[]
    is_checkpoint=[]
    for info in trained_built_in_model_list:
        checkpoint_count = info.get("checkpoint_count")
        if checkpoint_count == None or checkpoint_count == 0:
            no_checkpoint.append(info)
        else:
            is_checkpoint.append(info)
    return is_checkpoint+no_checkpoint

def update_custom_list_with_run_code_count(trained_custom_model_list):
    for info in trained_custom_model_list:
        info["run_code_count"]=len(info["run_code_list"])

def deployment_option(workspace_id, headers_user):
    try:
        if headers_user is None:
            return response(status=0, message="Jf-user is None in headers")
        if workspace_id == None:
            # workspace_list
            result = {
                "workspace_list" : db.get_workspace_name_and_id_list()
            }
            return response(status=1, result=result)
        workspace_name = db.get_workspace(workspace_id=workspace_id)["workspace_name"]
        # training_list = db.get_workspace_training_name_and_id_list(workspace_id=workspace_id, user_id=db.get_user_id(user_name=headers_user)["id"])
        user_id=db.get_user_id(user_name=headers_user)["id"]
        built_in_training_list = db.get_workspace_built_in_training_list(workspace_id, user_id)
        custom_training_list = db.get_workspace_custom_training_list(workspace_id, user_id)
        if built_in_training_list is None:
            built_in_training_list = []
        if custom_training_list is None:
            custom_training_list = []

        pod_list = kube.kube_data.get_pod_list()
        node_list = kube.kube_data.get_node_list()

        gpu_model_status = kube.get_gpu_model_usage_status_with_other_resource_info(pod_list=pod_list, node_list=node_list)
        cpu_model_status = kube.get_cpu_model_usage_status_with_other_resource_info(pod_list=pod_list, node_list=node_list)
        # gpu_model_status += gpu_model_status_temp

        # gpu_model_status += get_gpu_model_status_temp()

        built_in_model_list = db.get_built_in_model_list()
        trained_built_in_model_list = []
        trained_built_in_model_list = [ {
                                            "id": training["id"], 
                                            "name": training["name"], 
                                            "built_in_type": training["type"], 
                                            "built_in_model_name" : training["built_in_model_name"],
                                            "docker_image_id": training["docker_image_id"], 
                                            "enable_to_deploy_with_gpu": training["enable_to_deploy_with_gpu"],
                                            "enable_to_deploy_with_cpu": training["enable_to_deploy_with_cpu"],
                                            "deployment_multi_gpu_mode": training["deployment_multi_gpu_mode"],
                                            "deployment_status": training["deployment_status"], 
                                            "header_user_job_start_datetime": training["header_user_start_datetime"]
                                        } for training in built_in_training_list]
                                        # } for training in training_list if training["type"] in TRAINING_BUILT_IN_TYPES ]
        trained_built_in_model_list = get_training_checkpoints(workspace_name=workspace_name, model_list=trained_built_in_model_list)
        trained_built_in_model_list = get_built_in_model_list_order_by_checkpoint_exist(trained_built_in_model_list)
        trained_custom_model_list = [ {
                                            "id": training["id"],
                                            "name": training["name"],
                                            "run_code_list":get_run_code_list_from_src(workspace_name=workspace_name, training_name=training["name"]),
                                            "header_user_tool_start_datetime": training["header_user_start_datetime"]
                                        } for training in custom_training_list]
                                        # } for training in training_list if training["type"] != TRAINING_TYPE_C ]
        update_custom_list_with_run_code_count(trained_custom_model_list)
        result = {
            "built_in_model_kind_list": db.get_built_in_model_kind_and_created_by(), # TODO 삭제 예정
            "built_in_model_list" : built_in_model_list,
            "trained_built_in_model_list" : trained_built_in_model_list, # TODO 삭제 예정
            "trained_custom_model_list" : trained_custom_model_list, # TODO 삭제 예정
            "user_list": db.get_workspace_user_name_and_id_list(workspace_id),
            "gpu_total": get_deployment_aval_gpu(workspace_id)["result"]["total_gpu"], #TODO remove
            "gpu_usage_status": get_deployment_aval_gpu(workspace_id)["result"],
            "docker_image_list": db.get_docker_image_name_and_id_list(workspace_id),
            "gpu_model_status": gpu_model_status,
            "cpu_model_status": cpu_model_status
        }

        return response(status=1, result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message=e)

def deployment_training_option(training_id, training_type):
    from training_checkpoint import get_training_checkpoints_new
    try:
        result = get_training_checkpoints_new(training_id_list=[training_id], item_type=training_type)
        return response(status=1, result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message=e)


@ns.route("/deployments", methods=["GET"])
class GETDeployOption(CustomResource):
    @token_checker
    @ns.expect(deployment_option_get)
    def get(self):
        
        """
            Deployment 생성, 수정 시 필요 리스트 
            ---
            # inputs
                workspace_id (int)
            ---
            # returns
                user_list (list):
                    (dict)
                        id: 사용자 id
                        name: 사용자 이름
                gpu_total (int) 
                docker_image_list (list)
                    (dict)
                        id: 도커 이미지 id
                        name: 도커 이미지 이름
                gpu_model_status (list)
                    (dict)
                        total (int)
                        used (int)
                        aval (int)
                        type (str)
                        gpu_info (dict)
                            cuda_cores (str)
                            computer_capability (str)
                            architecture (str)
                        node_list (list)
                            (dict)

                        model (str)
                        queue (int)
                cpu_model_status (list)
                    (dict)
                        cpu_cores (int)
                        node_list (list)
                            (dict)

                        cpu_model (str)

        """
        args = deployment_option_get.parse_args()
        workspace_id = args["workspace_id"]
        res = deployment_option(workspace_id=workspace_id, headers_user=self.check_user())
        
        return self.send(res)

def set_dataset_comp_built_in_data_structure(dataset_list, workspace_name, data_training_form):
    # Search Depth
    # NEW
    for dataset in dataset_list:
        dataset["generable"] = True
        dataset["unsatisfied"] = {
            "dir": [],
            "file" : []
        }
        dataset["dir_list"] = {}
        dataset["file_list"] = {}

        depth_list = []

        for form in data_training_form:
            depth = ""
            form_depth_list = form["name"].split("/")
            if len(form_depth_list) == 1:
                depth = "/"
            else :
                for form_depth in form_depth_list[:-1]:
                    depth += "/" + form_depth
            
            selectable = False if form["argparse"] is None else True

            if form["type"] == "dir":
                form_dir_name = form["name"].split("/")[-1]
                path = '{}/{}/datasets/{}/{}{}'.format(JF_WS_DIR, workspace_name, dataset['type'], dataset['name'], depth)
                check_file_list = check_file(search_path="/", search_type="dir", search_page=1, search_size=9999, path=path, only_file_list=True)[0]
                if len(check_file_list) == 0:
                    check_file_list = [
                        {
                            'type': "dir", 
                            'name': "/", 
                            'size':0,
                            'modifier': None, 
                            'modified': None
                        }
                    ]
                temp_dir_list = []
                if form["argparse"] is None :
                    for dir_ in check_file_list:
                        if form_dir_name == dir_["name"]:
                            temp_dir_list.append(dir_)
                else : 
                    temp_dir_list = check_file_list
                    
                dataset["dir_list"][form["name"]] = {
                    "item_list": temp_dir_list,
                    "depth": depth,
                    "selectable": selectable
                }
            elif form["type"] == "file":
                form_file_name = form["name"].split("/")[-1]
                path = '{}/{}/datasets/{}/{}{}'.format(JF_WS_DIR, workspace_name, dataset['type'], dataset['name'], depth)
                check_file_list = check_file(search_path="/", search_type="file", search_page=1, search_size=9999, path=path, only_file_list=True)[0]
                temp_file_list = []
                for file_ in check_file_list:
                    if len(form_file_name.split(".")) > 1 and form["argparse"] is not None: # 확장자가 있음, argparse가 있음 (확장자를 가진 파일 탐색)
                        if form_file_name.split(".")[-1] in file_["name"]: 
                            temp_file_list.append(file_)
                    elif len(form_file_name.split(".")) == 1 and form["argparse"] is not None: # 파일이름만 있고, 확장자가 없음, argparse가 있음 (전체 내려줌)
                        temp_file_list.append(file_)
                    else:
                        if form_file_name == file_["name"]:
                            temp_file_list.append(file_)
                dataset["file_list"][form["name"]] = {
                    "item_list": temp_file_list,
                    "depth": depth,
                    "selectable": selectable
                }

        for key, value in dataset["dir_list"].items():
            if key == "/":
                continue
            if len(value["item_list"]) == 0:
                dataset["generable"] = False
                dataset["unsatisfied"]["dir"].append(key)

        for key, value in dataset["file_list"].items():
            if len(value["item_list"]) == 0:
                dataset["generable"] = False
                dataset["unsatisfied"]["file"].append(key)

def update_data_training_form(dataset_id, data_training_form):
    dataset_info = db.get_dataset(dataset_id=dataset_id)
    dataset_list = [
        {
            "id": dataset_info["id"], 
            "name": dataset_info["name"], 
            "type": dataset_info["access"], 
            "workspace_name": dataset_info["workspace_name"] 
        }
    ]
    
    comp_built_in_data_training_form_and_dataset(dataset_list=dataset_list, data_training_form_list=data_training_form)
    return response(status=1, result=dataset_list[0].get("data_training_form"))

@ns.route("/data_training_form", methods=["GET","POST"])
class DataTrainingFormOption(CustomResource):
    @token_checker
    @ns.expect(data_training_form_get)
    def get(self):
        """
            Data training form 의 children data_list 전달용
            ---
            # inputs
            dataset_id
            data_training_form

                dataset_id (int) : 선택한 dataset_id
                data_training_form (list) : [ { built_in_data_training_form .... , children : [ { built_in_data_training_form .... , children : [ ... ] } ] } ]
                ex) 
                {
                    "dataset_id": 8,
                    "data_training_form": [
                                {
                                    "built_in_model_id": 1021,
                                    "type": "dir",
                                    "name": "/",
                                    "category": "Sample",
                                    "category_description": "Sample",
                                    "argparse": null,
                                    "children": [],
                                    "depth": 0,
                                    "full_path": "/",
                                    "selected": "/",
                                    "data_list": [],
                                    "generable": true
                                },
                                {
                                    "built_in_model_id": 1021,
                                    "type": "dir",
                                    "name": "acryl",
                                    "category": "acryl",
                                    "category_description": "",
                                    "argparse": null,
                                    "children": [],
                                    "depth": 1,
                                    "full_path": "acryl",
                                    "selected": "acryl",
                                    "data_list": [],
                                    "generable": true
                                },
                                {
                                    "built_in_model_id": 1021,
                                    "type": "dir",
                                    "name": "year",
                                    "category": "year",
                                    "category_description": "year 폴더 하위에는 month 폴더가 있음",
                                    "argparse": "year",
                                    "children": [
                                        {
                                            "built_in_model_id": 1021,
                                            "type": "file",
                                            "name": "month-meta-file-b",
                                            "category": "meta-file-b",
                                            "category_description": "",
                                            "argparse": null,
                                            "depth": 2,
                                            "full_path": "year/month-meta-file-b"
                                        },
                                        {
                                            "built_in_model_id": 1021,
                                            "type": "file",
                                            "name": "month-meta-file-a",
                                            "category": "meta-file-a",
                                            "category_description": "",
                                            "argparse": "aa",
                                            "depth": 2,
                                            "full_path": "year/month-meta-file-a"
                                        },
                                        {
                                            "built_in_model_id": 1021,
                                            "type": "dir",
                                            "name": "month-meta-dir",
                                            "category": "month-meta-category",
                                            "category_description": "",
                                            "argparse": null,
                                            "children": [],
                                            "depth": 2,
                                            "full_path": "year/month-meta-dir"
                                        },
                                        {
                                            "built_in_model_id": 1021,
                                            "type": "dir",
                                            "name": "month",
                                            "category": "month",
                                            "category_description": "month 폴더 하위에는 day 폴더가 있음",
                                            "argparse": "month",
                                            "children": [
                                                {
                                                    "built_in_model_id": 1021,
                                                    "type": "dir",
                                                    "name": "day",
                                                    "category": "day",
                                                    "category_description": "day 폴더 하위에는 hour 폴더가 있음",
                                                    "argparse": "day",
                                                    "children": [],
                                                    "depth": 3,
                                                    "full_path": "year/month/day"
                                                }
                                            ],
                                            "depth": 2,
                                            "full_path": "year/month"
                                        }
                                    ],
                                    "depth": 1,
                                    "full_path": "year",
                                    "selected": "2002",
                                    "data_list": [
                                        "2002",
                                        "2000",
                                        "image",
                                        "2010",
                                        ".jf_tmp",
                                        "acryl"
                                    ]
                                }
                            ]
                }
            ---
            # returns
            updated data_training_form
            return 받은 값을 기존에 쓰던 data_training_form 대체하여 사용
            selected 된 아이템의 children 에 data_list 나 selected가 업데이트 
            
                (dict) : 
                {
                    "result": [
                        {
                            "id": 8,
                            "name": "test-sample",
                            "type": "1",
                            "workspace_name": "robert-ws",
                            "generable": false,
                            "unsatisfied": {
                                "dir": [
                                    "year/month-meta-dir"
                                ],
                                "file": [
                                    "year/month-meta-file-b"
                                ]
                            },
                            "data_training_form": [
                                {
                                    "built_in_model_id": 1021,
                                    "type": "dir",
                                    "name": "/",
                                    "category": "Sample",
                                    "category_description": "Sample",
                                    "argparse": null,
                                    "children": [],
                                    "depth": 0,
                                    "full_path": "/",
                                    "selected": "/",
                                    "data_list": [],
                                    "generable": true
                                },
                                {
                                    "built_in_model_id": 1021,
                                    "type": "dir",
                                    "name": "acryl",
                                    "category": "acryl",
                                    "category_description": "",
                                    "argparse": null,
                                    "children": [],
                                    "depth": 1,
                                    "full_path": "acryl",
                                    "selected": "acryl",
                                    "data_list": [],
                                    "generable": true
                                },
                                {
                                    "built_in_model_id": 1021,
                                    "type": "dir",
                                    "name": "year",
                                    "category": "year",
                                    "category_description": "year 폴더 하위에는 month 폴더가 있음",
                                    "argparse": "year",
                                    "children": [
                                        {
                                            "built_in_model_id": 1021,
                                            "type": "file",
                                            "name": "month-meta-file-b",
                                            "category": "meta-file-b",
                                            "category_description": "",
                                            "argparse": null,
                                            "depth": 2,
                                            "full_path": "year/month-meta-file-b",
                                            "selected": null,
                                            "data_list": [],
                                            "generable": false
                                        },
                                        {
                                            "built_in_model_id": 1021,
                                            "type": "file",
                                            "name": "month-meta-file-a",
                                            "category": "meta-file-a",
                                            "category_description": "",
                                            "argparse": "aa",
                                            "depth": 2,
                                            "full_path": "year/month-meta-file-a",
                                            "selected": null,
                                            "data_list": [
                                                "my-file-a",
                                                "my-file-b",
                                                "my-file-c"
                                            ]
                                        },
                                        {
                                            "built_in_model_id": 1021,
                                            "type": "dir",
                                            "name": "month-meta-dir",
                                            "category": "month-meta-category",
                                            "category_description": "",
                                            "argparse": null,
                                            "children": [],
                                            "depth": 2,
                                            "full_path": "year/month-meta-dir",
                                            "selected": null,
                                            "data_list": [],
                                            "generable": false
                                        },
                                        {
                                            "built_in_model_id": 1021,
                                            "type": "dir",
                                            "name": "month",
                                            "category": "month",
                                            "category_description": "month 폴더 하위에는 day 폴더가 있음",
                                            "argparse": "month",
                                            "children": [
                                                {
                                                    "built_in_model_id": 1021,
                                                    "type": "dir",
                                                    "name": "day",
                                                    "category": "day",
                                                    "category_description": "day 폴더 하위에는 hour 폴더가 있음",
                                                    "argparse": "day",
                                                    "children": [],
                                                    "depth": 3,
                                                    "full_path": "year/month/day"
                                                }
                                            ],
                                            "depth": 2,
                                            "full_path": "year/month",
                                            "selected": null,
                                            "data_list": [
                                                "1-b",
                                                "1-a",
                                                "2-a"
                                            ]
                                        }
                                    ],
                                    "depth": 1,
                                    "full_path": "year",
                                    "selected": "2002",
                                    "data_list": [
                                        "2002",
                                        "2000",
                                        "image",
                                        "2010",
                                        ".jf_tmp",
                                        "acryl"
                                    ]
                                }
                            ]
                        }
                    ],
                    "message": null,
                    "status": 1
                }
        """
        args = data_training_form_get.parse_args()      
        
        dataset_id = args["dataset_id"]
        data_training_form = args["data_training_form"]
        
        res = update_data_training_form(dataset_id=dataset_id, data_training_form=data_training_form)
        return self.send(res)
    
    @token_checker
    @ns.expect(data_training_form_get)
    def post(self):
        args = data_training_form_get.parse_args()      
        
        dataset_id = args["dataset_id"]
        data_training_form = args["data_training_form"]
        
        res = update_data_training_form(dataset_id=dataset_id, data_training_form=data_training_form)
        return self.send(res)

def get_gpu_options(gpu_count, training_type):
    #TODO 선택한 GPU군에서 만족하는 경우에만 (2021-12-08)
    infini_band = check_node_have_inifni()
    gpu_options = {
        "gpu_acceleration": True if gpu_count > 1 else False, 
        "unified_memory": True if training_type == TRAINING_TYPE_C else False, 
        "rdma": True if infini_band and gpu_count > 1 else False
        }
    return gpu_options

def get_retraining_option(training_id, built_in_model_id):
    from training_checkpoint import get_training_checkpoints_new   
    retraining_option = {
        "enable_retraining": 0,
        "checkpoint_load_file_path_parser_retraining": None,
        "checkpoint_load_dir_path_parser_retraining": None,
        "checkpoint_list": []
    }
    if built_in_model_id is None:
        return retraining_option

    built_in_model_info = db.get_built_in_model(model_id=built_in_model_id)
    
    if built_in_model_info is None:
        return retraining_option

    if built_in_model_info["enable_retraining"] == 1:
        retraining_option["enable_retraining"] = built_in_model_info["enable_retraining"]
        retraining_option["checkpoint_load_file_path_parser_retraining"]  = built_in_model_info["checkpoint_load_file_path_parser_retraining"]
        retraining_option["checkpoint_load_dir_path_parser_retraining"]  = built_in_model_info["checkpoint_load_dir_path_parser_retraining"]
        retraining_option["checkpoint_list"] = get_training_checkpoints_new(training_id_list=[training_id], item_type=TRAINING_ITEM_A)

    return retraining_option

def job_option(training_id, headers_user):
    from built_in_model import transform_data_training_form_with_child
    training_info = db.get_training(training_id=training_id)
    job_tool_info = db.get_training_tool(training_id=training_id, tool_type=TOOL_TYPE_ID[TOOL_JOB_KEY])
    check_result, res = training_permission_check(user=headers_user, training_info=training_info, permission_level=1)
    if not check_result:
        return res

    model_info = {} # model use image
    default_image = {} # training default image
    image_list = []
    dataset_list = []
    run_code_list = []
    parameters_info = {} # built_in default key(paramter) and value
    infini_band = check_node_have_inifni()
    training_type = training_info["type"]
    built_in_model_name = training_info["built_in_model_name"]
    built_in_model_id = training_info["built_in_model_id"]
    default_image = { "id": job_tool_info.get("docker_image_id") , "name": job_tool_info.get("docker_image_name") }
    gpu_count = job_tool_info["gpu_count"]

    #GET Image
    image_list = db.get_image_workspace_id(workspace_id=training_info["workspace_id"])
    image_list = [ {"id":image["id"], "name":image["name"]} for image in image_list if image["status"] == 2] # status=2 only
    #GET Dataset
    db_dataset_list = db.get_dataset_list(workspace_id=training_info["workspace_id"])
    # dataset_list = [{"id":dataset["id"], "name":dataset["dataset_name"], "type": dataset["access"] } for dataset in db_dataset_list]

    dataset_list = [{
        "id":dataset["id"], "name":dataset["dataset_name"], "type": dataset["access"], "workspace_name": dataset["workspace_name"]
    } for dataset in db_dataset_list]

    gpu_options = get_gpu_options(gpu_count=gpu_count, training_type=training_type) 

    # checkpoint_list = get_training_checkpoints_new(training_id_list=[training_id], item_type=TRAINING_ITEM_A)

    if training_info["type"] in [TRAINING_TYPE_A, TRAINING_TYPE_D]:
        try:
            #GET File
            run_code_list += get_sample_code()
            run_code_list += get_run_code_list_from_src(workspace_name=training_info["workspace_name"], training_name=training_info["training_name"])
            
            for dataset in dataset_list:
                dataset["generable"] = True

        except Exception as e:
            traceback.print_exc()
            return response(status=0, result={"image_list":image_list, "dataset_list": dataset_list, "run_code_list": run_code_list}, message="Create Job Info Error")
            #return response(status=0, result={"image_list":image_list, "dataset_list": dataset_list, "run_code_list": run_code_list}, message="Create Job Info Error : [{}]".format(e))
    elif training_info["type"] in TRAINING_BUILT_IN_TYPES: #built-in
        try:
            # run_code = "{}/{}/horomain.py".format(JF_BUILT_IN_MODELS_PATH, training_info["model"])
            model_info["data_training_form"] = transform_data_training_form_with_child(db.get_built_in_model_data_training_form(built_in_model_id))
            comp_built_in_data_training_form_and_dataset(dataset_list=dataset_list, data_training_form_list=model_info["data_training_form"])
            parameters_info = get_built_in_paramters_info(built_in_model_id=built_in_model_id)
                
            run_code = "built_in_run_code"
            run_code_list.append(run_code)
            
        except Exception as e:
            traceback.print_exc()
    
    result = {
        "model_info": model_info,
        "default_image": default_image,
        "image_list":image_list, 
        "dataset_list": dataset_list, 
        "run_code_list": run_code_list,
        "training_type": training_type, 
        "built_in_model_name": built_in_model_name, 
        "parameters_info": parameters_info,
        "gpu_options": gpu_options,
        "retraining_option": get_retraining_option(training_id=training_id, built_in_model_id=built_in_model_id)
    }

    return response(status=1, result=result)

def job_deployment_option(training_id, job_group_number):
    """
    Description: job_id 별로 checkpoint 가 존재하는지 여부 내려주기

    Args:
        training_id (int): training id
        job_group_number (int): job group number (training_id 내에서 unique 값)

    Returns:
        : job_id 별 배포 생성 가능 여부 dict

             
    """
    from training_checkpoint import get_checkpoint_list_in_folder
    try:
        # job_group_number, training_id 사용해서 job_group_number 내의 job_item_list 받아오기
        job_item_list = db.get_job_list_by_group_number(training_id, job_group_number)
        # job_item_list 의 job_id 별로 경로 받고 checkpoint file 체크해서 있으면 있다고 내려주기
        job_checkpoint_exist_list=[]
        for item in job_item_list:
            base_path = JF_TRAINING_JOB_CHECKPOINT_ITEM_PATH.format(workspace_name=item["workspace_name"], 
                                                                    training_name=item["training_name"], 
                                                                    job_name=item["name"], 
                                                                    job_group_index=item["job_group_index"])
            checkpoint_list=get_checkpoint_list_in_folder(base_path)
            if len(checkpoint_list)>0:
                check_result=True
            else:
                check_result=False
            job_checkpoint_exist_list.append(
                {
                    "job_id":item["id"],
                    "job_index":item["job_group_index"],
                    "exist_checkpoint":check_result
                }
            )
            # job_checkpoint_exist_list.append({item["id"]:check_result})
        result={
            "job_checkpoint_info":job_checkpoint_exist_list
        }
        return response(status=1, result=result)
    except:
        traceback.print_exc()
    return response(status=0, message="fail")



@ns.route("/jobs", methods=["GET"])
class GETJobOption(CustomResource):
    @token_checker
    @ns.expect(job_option_get)
    def get(self):
        args = job_option_get.parse_args()        
        training_id = args["training_id"]
        res = job_option(training_id=training_id, headers_user=self.check_user())
        return self.send(res)

@ns.route("/jobs/checkpoint_exist", methods=["GET"])
class GETJobDeploymentOption(CustomResource):
    @token_checker
    @ns.expect(job_deployment_option_get)
    def get(self):
        """
            job_id 별로 checkpoint 가 존재하는지 정보 리스트
            ---
            # inputs

                training_id - training id
                job_group_number - job 의 group id
            ---
            # returns
                status (int): 0(실패), 1(성공)
                # 성공 시 
                result (dict):
                    job_checkpoint_exist (list) : job id 별로 checkpoint 존재 boolean 값 dictionary
                        (dict) : job_id: 존재 여부 bool
                message (str): API로 부터 담기는 메세지
                example :
                {
                    "result": {
                        "job_checkpoint_info":[
                            {
                                "job_id": 91,
                                "job_index": 0,
                                "exist_checkpoint": true
                            },
                            {
                                "job_id": 92,
                                "job_index": 1,
                                "exist_checkpoint": true
                            }, ...
                        ]
                    },
                    "message": null,
                    "status": 1
                }
        Returns:
            _type_: _description_
        """
        args = job_deployment_option_get.parse_args()        
        training_id = args["training_id"]
        job_group_number = args["job_group_number"]
        res = job_deployment_option(training_id, job_group_number)
        return self.send(res)

def hyperparamsearch_option(training_id, hps_group_id, headers_user):
    from built_in_model import transform_data_training_form_with_child
    training_info = db.get_training(training_id=training_id)
    hps_tool_info = db.get_training_tool(training_id=training_id, tool_type=TOOL_TYPE_ID[TOOL_HPS_KEY])
    check_result, res = training_permission_check(user=headers_user, training_info=training_info, permission_level=1)
    if not check_result:
        return res

    model_info = {} # model use image
    default_image = {} # training default image
    image_list = []
    dataset_list = []
    run_code_list = []
    parameters_info = {} # built_in default key(paramter) and value
    infini_band = check_node_have_inifni()
    
    training_type = training_info["type"]
    built_in_model_name = training_info["built_in_model_name"]
    built_in_model_id = training_info["built_in_model_id"]
    default_image = { "id": hps_tool_info.get("docker_image_id") , "name": hps_tool_info.get("docker_image_name") }
    gpu_count = hps_tool_info["gpu_count"]

    method_list =  get_method_list()
    
    #GET Image
    image_list = db.get_image_workspace_id(workspace_id=training_info["workspace_id"])
    image_list = [ {"id":image["id"], "name":image["name"]} for image in image_list if image["status"] == 2] # status=2 only
    #GET Dataset
    db_dataset_list = db.get_dataset_list(workspace_id=training_info["workspace_id"])
    # dataset_list = [{"id":dataset["id"], "name":dataset["dataset_name"], "type": dataset["access"] } for dataset in db_dataset_list]

    dataset_list = [{
        "id":dataset["id"], "name":dataset["dataset_name"], "type": dataset["access"], "workspace_name": dataset["workspace_name"]
    } for dataset in db_dataset_list]

    gpu_options = get_gpu_options(gpu_count=gpu_count, training_type=training_info["type"]) 

    if training_info["type"] in [TRAINING_TYPE_A, TRAINING_TYPE_D]:
        try:
            #GET File
            run_code_list += get_sample_code()
            run_code_list += get_run_code_list_from_src(workspace_name=training_info["workspace_name"], training_name=training_info["training_name"])
            
            for dataset in dataset_list:
                dataset["generable"] = True

        except Exception as e:
            traceback.print_exc()
            return response(status=0, result={"image_list":image_list, "dataset_list": dataset_list, "run_code_list": run_code_list}, message="Create Job Info Error")
            #return response(status=0, result={"image_list":image_list, "dataset_list": dataset_list, "run_code_list": run_code_list}, message="Create Job Info Error : [{}]".format(e))
    elif training_info["type"] in TRAINING_BUILT_IN_TYPES: #built-in
        try:
            # run_code = "{}/{}/horomain.py".format(JF_BUILT_IN_MODELS_PATH, training_info["model"])
            model_info["data_training_form"] = transform_data_training_form_with_child(db.get_built_in_model_data_training_form(built_in_model_id))
            comp_built_in_data_training_form_and_dataset(dataset_list=dataset_list, data_training_form_list=model_info["data_training_form"])
            parameters_info = get_built_in_paramters_info(built_in_model_id=built_in_model_id)
                
            run_code = "built_in_run_code"
            run_code_list.append(run_code)
            
        except Exception as e:
            traceback.print_exc()

    load_file_list = get_hyperparamsearch_saved_file_list(hps_group_id=hps_group_id)

    result = {
        "model_info": model_info,
        "default_image": default_image,
        "image_list":image_list, 
        "dataset_list": dataset_list, 
        "run_code_list": run_code_list,
        "training_type": training_type, 
        "built_in_model_name": built_in_model_name, 
        "parameters_info": parameters_info,
        "gpu_options": gpu_options,
        "method_list" : method_list,
        "load_file_list": load_file_list
        }

    return response(status=1, result=result)

@ns.route("/hyperparamsearchs", methods=["GET"])
class GETHpsOption(CustomResource):
    @token_checker
    @ns.expect(hps_option_get)
    def get(self):
        args = hps_option_get.parse_args()        
        training_id = args["training_id"]
        hps_group_id = args["hps_group_id"]
        res = hyperparamsearch_option(training_id=training_id, hps_group_id=hps_group_id, headers_user=self.check_user())
        return self.send(res)

def training_option(workspace_id):
    # check_result, res = training_permission_check(user=headers_user, workspace_id=workspace_id, create_training=True)
    # if not check_result:
    #     return res

    if workspace_id == None:
        # workspace_list
        result = {
            "workspace_list" : db.get_workspace_name_and_id_list()
        }
        return response(status=1, result=result)

    # built_in_model_list = db.get_built_in_model_name_and_id_list(created_by="JF")
    pod_list = kube.kube_data.get_pod_list()
    node_list = kube.kube_data.get_node_list()

    gpu_model_status = kube.get_gpu_model_usage_status_with_other_resource_info(pod_list=pod_list, node_list=node_list)
    cpu_model_status = kube.get_cpu_model_usage_status_with_other_resource_info(pod_list=pod_list, node_list=node_list)
    # gpu_model_status += gpu_model_status_temp

    # gpu_model_status += get_gpu_model_status_temp()

    node_list = [

    ]
    built_in_model_list = db.get_built_in_model_list()
    
    built_in_model_thumbnail_image_info = {}
    for info in built_in_model_list:
        if info.get("thumbnail_path") != None:
            thumbnail_file_path = os.path.join(JF_BUILT_IN_MODELS_PATH, info.get("path"), info.get("thumbnail_path"))
            if os.path.isfile(thumbnail_file_path):
                with open(thumbnail_file_path, "rb") as image_file:
                    file_extension = info["thumbnail_path"].split('.')[-1]
                    built_in_model_thumbnail_image_info[info["id"]] = 'data:image/{};base64,'.format(
                        file_extension) + str(base64.b64encode(image_file.read()).decode())
    result = {
        "user_list": db.get_workspace_user_name_and_id_list(workspace_id),
        "gpu_total": get_training_aval_gpu(workspace_id)["result"]["total_gpu"], #TODO remove
        "gpu_usage_status": get_training_aval_gpu(workspace_id)["result"],
        "gpu_model_status": gpu_model_status,
        "cpu_model_status": cpu_model_status,
        "docker_image_list": db.get_docker_image_name_and_id_list(workspace_id),
        "built_in_model_kind_list": db.get_built_in_model_kind_and_created_by(),
        "built_in_model_list": built_in_model_list,
        "built_in_model_thumbnail_image_info":built_in_model_thumbnail_image_info
    }
    return response(status=1, result=result)


@ns.route("/trainings", methods=["GET"])
class GETTrainingOption(CustomResource):
    @token_checker
    @workspace_access_check(training_option_get)
    @ns.expect(training_option_get)
    def get(self):
        args = training_option_get.parse_args()        
        workspace_id = args["workspace_id"]
        res = training_option(workspace_id=workspace_id)
        return self.send(res)


def workspace_option(headers_user):
    if headers_user != "root":
        return response(status=0, message="permission denied")
    user_list = [ { "name": user["name"] , "id" : user["id"], "type": "user"} for user in db.get_user_list() if user["name"] != "root"]
    group_list = [ { 
                    "name": user_group["name"], 
                    "id" : user_group["id"], 
                    "type": "group", 
                    "user_id_list" : user_group["user_id_list"].split(",") if user_group["user_id_list"] is not None else [] , 
                    "user_name_list" : user_group["user_name_list"].split(",") if user_group["user_name_list"] is not None else [] } 
                    for user_group in db.get_usergroup_list() ]
    storage_list = get_storage_list()
    for i, group in enumerate(group_list):
        user_list_temp = []
        for j in range(len(group["user_id_list"])):
            user_list_temp.append(
                {
                    "name": group["user_name_list"][j],
                    "id" : int(group["user_id_list"][j]),
                    "type" : "user"
                }
            )
        group_list[i] = {
            "name" : group_list[i]["name"],
            "id" : group_list[i]["id"],
            "user_list": user_list_temp
        }
        
    result = {
        "user_list": user_list,
        "group_list": group_list,
        "storage_list": storage_list
    }
    return response(status=1, result=result)


@ns.route("/workspaces", methods=["GET"])
class GETWorkspaceOption(CustomResource):
    @token_checker
    @ns.expect(workspace_option_get)
    def get(self):
        args = workspace_option_get.parse_args()        
        res = workspace_option(headers_user=self.check_user())
        return self.send(res)

def records_option(workspace_id, usergroup_id, headers_user):
    try:
        if headers_user != "root":
            return response(status=0, message="permission denied")
        result = {
            "training_list" : []
        }
        if workspace_id == None and usergroup_id == None:
            # workspace_list
            result = {
                "workspace_list": db.get_workspace_name_and_id_list_activate_first()
            }
        elif workspace_id is not None:
            training_list = db.get_training_name_and_id_list_new(str(workspace_id))
            training_list = [training for training in training_list if training["name"] is not None or training["id"] is not None]

            result = {
                "training_list" : training_list
            }
            
        elif usergroup_id is not None:
            usergroup_info, message = db.get_usergroup(usergroup_id=usergroup_id)
            training_list = db.get_users_training(user_id_list=usergroup_info["user_id_list"])
            training_list = [ {"id": training["id"], "name":training["name"] } for training in training_list ]
            result = {
                "training_list": training_list
            }
        return response(status=1, result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Get Option error : {}".format(e))
            

@ns.route("/records", methods=["GET"])
class GETRecordOption(CustomResource):
    @token_checker
    @ns.expect(records_option_get)
    def get(self):
        args = records_option_get.parse_args()        
        workspace_id = args["workspace_id"]
        usergroup_id = args["usergroup_id"]
        res = records_option(workspace_id=workspace_id, usergroup_id=usergroup_id, headers_user=self.check_user())
        return self.send(res)


def usergroup_option(headers_user):
    try:
        if headers_user != "root":
            return response(status=0, message="permission denied")
        group_user_id_list =  [ info["user_id"] for info in db.get_user_list_has_group()] 

        user_list = [ { "name": user["name"] , "id" : user["id"] } for user in db.get_user_list() if user["name"] != "root" and user["id"] not in group_user_id_list ]

        result = {
            "user_list" : user_list
        }
        
        return response(status=1, result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Get Option error : {}".format(e))
            

@ns.route("/usergroup", methods=["GET"])
class GETUserGroupOption(CustomResource):
    @token_checker
    def get(self):  
        res = usergroup_option(headers_user=self.check_user())
        return self.send(res)

def user_option(headers_user):
    try:
        if headers_user != "root":
            return response(status=0, message="permission denied")

        usergroup_list = [ {"id":group_info["id"], "name":group_info["name"]}  for group_info in db.get_usergroup_list() ] 

        result = {
            "usergroup_list" : usergroup_list
        }
        
        return response(status=1, result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Get Option error : {}".format(e))
            

@ns.route("/user", methods=["GET"])
class GETUserOption(CustomResource):
    @token_checker
    def get(self):  
        res = user_option(headers_user=self.check_user())
        return self.send(res)

def built_in_model_option():
    try:
        # built_in_model_name_list = ji_built_in_info_list
        built_in_models = os.listdir(JF_BUILT_IN_MODELS_PATH)
        # built_in_path_db = [built_in_model["path"] for built_in_model in db.get_built_in_model_list()]
        built_in_model_path_list = []
        for path in built_in_models:
            # if os.path.isdir(os.path.join(JF_BUILT_IN_MODELS_PATH,path)):
            #     if path in built_in_path_db:
            #         built_in_model_path_list.append({"name":path, "generable":False})
            #     else:
            #         built_in_model_path_list.append({"name":path, "generable":True})
            built_in_model_path_list.append({"name":path, "generable":True})
        # built_in_model_path = list(set(built_in_model_path)-set(built_in_path_jf))
        
        result = {
            "built_in_model_name_list" : [],
            "built_in_model_kind_list": db.get_built_in_model_kind_and_created_by(),
            "built_in_model_path_list": built_in_model_path_list,
            "docker_image_list": [model["name"] for model in db.get_docker_image_name_and_id_list()]
        }

        return response(status=1, result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Get Option error : {}".format(e))
        
def built_in_model_kind_option():
    try:
        built_in_model_kind_list=db.get_built_in_model_kind()
        result = {
            "built_in_model_kind_list": [info["kind"]for info in built_in_model_kind_list],
            # "built_in_model_kind_list": [{"kind":info["kind"], "kind_kr":info.get("kind_kr")} for info in built_in_model_kind_list],
        }

        return response(status=1, result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Get Option error : {}".format(e))

@ns.route("/built_in_models_kind", methods=["GET"])
class GETBuiltInKindOption(CustomResource):
    @token_checker
    @ns.expect(built_in_model_option_get)
    def get(self):
        """built in model 종류 필터링 """
        # args = built_in_model_option_get.parse_args()        
        res = built_in_model_kind_option()
        return self.send(res)
        

@ns.route("/built_in_models", methods=["GET"])
class GETBuiltInOption(CustomResource):
    @token_checker
    @ns.expect(built_in_model_option_get)
    def get(self):
        """built in model 템플릿 생성, 수정 시 필요 리스트 """
        # args = built_in_model_option_get.parse_args()        
        res = built_in_model_option()
        
        return self.send(res)


def checkpoint_option():
    try:
        return response(status=1, result={
            "built_in_model_list": db.get_built_in_model_list(),
            "checkpoint_list": db.get_checkpoint_list()
        })
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Get Checkpoint option error : {}".format(e))

@ns.route("/checkpoints", methods=["GET"])
class GETCheckpointOption(CustomResource):
    @ns.expect(built_in_model_option_get)
    @token_checker
    def get(self):
        """Checkpoint 업로드 시 필요 정보 리스트 """
        # args = built_in_model_option_get.parse_args()        
        res = checkpoint_option()
        
        return self.send(res)


def port_forwarding_option(training_tool_type=None, training_tool_id=None):
    try:
        ports_in_use_list = []
        training_tool_running = False
        service_list = kube.kube_data.get_service_list()
        all_port_list = kube.get_service_node_port_list(service_list=service_list)
        my_port_list = []

        if training_tool_id is not None:
            
            training_tool_info = db.get_training_tool(training_tool_id=training_tool_id)
            if training_tool_info is None:
                raise ItemNotExistError
            
            if kube.get_training_tool_pod_status(training_tool_id=training_tool_id)["status"] in KUBER_RUNNING_STATUS:
                training_tool_running = True

            default_port_list = TOOL_DEFAULT_PORT[TOOL_TYPE[training_tool_info["tool_type"]]]
            my_port_list = kube.get_service_node_port_list(service_list=service_list, training_tool_id=training_tool_id)

        elif training_tool_type is not None:
            default_port_list = TOOL_DEFAULT_PORT[TOOL_TYPE[training_tool_type]]
        
        ports_in_use_list = list(set(all_port_list) - set(my_port_list))

        return response(status=1, result={
            "target_port_range": [0, 65535],
            "node_port_range": [30000, 32767],
            "port_protocol_list": PORT_PROTOCOL_LIST,
            "default_port_list": default_port_list,
            "node_ports_in_use_list": ports_in_use_list,
            "training_tool_running": training_tool_running
        })
    except Exception as e:
        return response(status=0, message="Port Forwarding option get error : {}".format(e))



@ns.route("/port-forwarding", methods=["GET"])
class GETPortForwardingOption(CustomResource):
    @ns.expect(port_forwarding_option_get)
    @token_checker
    def get(self):
        """
            Port forwarding 관련 필요 정보 리스트 
            ---
            # inputs
            port-forwarding 조회는 parameter 값에 따라서 조회 내용이 조금 달라짐
                
                training_tool_type - default (1) 
                training_tool_id - default (None)
                
                # training_tool_type | training_tool_id 로 조회
                training_tool_type - 해당 tool type에 맞는 default_port_list 를 returns으로 전달 (생성 시 사용)
                training_tool_id - 해당 tool_id가 사용하고 있는 port 정보를 포함하여 전달. (수정 시 사용)
            ---
            # returns
            Port Forwarding 추가 및 변경 시 UI상 조건이 되는 정보들

                status (int): 0(실패), 1(성공)
                # 성공 시 
                result (dict):
                    target_port_range (list) : 입력할 수 있는 PORT RANGE [ MIN, MAX ] ex) [0, 65535]
                    node_port_range (list) :  입력할 수 있는 NODE PORT RANGE [ MIN, MAX ] ex) [30000, 32767]
                    port_protocol_list (list) :  포트포워딩의 PROTOCOL LIST [ "TCP", "UDP" ... ]
                    default_port_list (list) : 기본적으로 포함하고 있는 PORT LIST [ {"name":"ssh", "port":22, "protocol":"TCP", "type": "NodePort"}.. ]
                    node_ports_in_use_list (list) : 이미 사용 중 NODE PORT 리스트. 여기에 있는 Port List를 Node Port로 지정하려고 할 때 경고 표시  [ 32113, 31431 ... ].
                    training_tool_running (bool. True | False) : 사용자가 node_ports_in_use_list에 있는것을 NodePort에 입력 시 
                                                                    * False = 노란 경고
                                                                    * True  = 빨간 경고 + 수정 버튼 비활성화
                message (str): API로 부터 담기는 메세지
                example :
                {
                    "result": {
                        "target_port_range": [
                            0,
                            65535
                        ],
                        "node_port_range": [
                            30000,
                            32767
                        ],
                        "port_protocol_list": [
                            "TCP",
                            "UDP"
                        ],
                        "default_port_list": [
                            {
                                "name": "ssh",
                                "port": 22,
                                "protocol": "TCP",
                                "type": "NodePort"
                            },
                            {
                                "name": "jupyter",
                                "port": 8888,
                                "protocol": "TCP",
                                "type": "ClusterIP"
                            }
                        ],
                        "node_ports_in_use_list": [
                            32183,
                            31506,
                            32532,
                            31029,
                            31111,
                            30712,
                            32479
                        ],
                        "training_tool_running": false
                    },
                    "message": null,
                    "status": 1
                }
        """
        # args = built_in_model_option_get.parse_args()        
        args = port_forwarding_option_get.parse_args()        
        training_tool_type = args["training_tool_type"]
        training_tool_id = args["training_tool_id"]

        res = port_forwarding_option(training_tool_type=training_tool_type, training_tool_id=training_tool_id)
        
        return self.send(res)


def training_tool_option(training_id):
    training_info = db.get_training_only(training_id)
    
    workspace_id = training_info["workspace_id"]
    built_in_model_id = training_info["built_in_model_id"]

    training_option_result = training_option(workspace_id=workspace_id)["result"]
    # common.delete_dict_key(target_dict=training_option_result["result"], save_key_list=["gpu_total", "gpu_usage_status", "gpu_model_status", "docker_image_list"])
    
    result = {
        "resource_info": {
            "gpu_total": training_option_result["gpu_total"],
            "gpu_usage_status": training_option_result["gpu_usage_status"],
            "gpu_model_status": training_option_result["gpu_model_status"],
            "cpu_model_status": training_option_result["cpu_model_status"]
        },
        "docker_info": {
            "docker_image_list": training_option_result["docker_image_list"]
        },
        "built_in_model_info": None # Custom 학습은 None으로 내려 줌
    }
    if built_in_model_id is not None:
        # Built in mode만
        try:
            for built_in_model_info in training_option_result["built_in_model_list"]:
                if built_in_model_info["id"] == built_in_model_id:
                    result["built_in_model_info"] = built_in_model_info
        except:
            pass

        
    # result_old=training_option_result["result"]
    return response(status=1, result=result)

@ns.route("/trainings/tool", methods=["GET"])
class GETTrainingToolOption(CustomResource):
    @ns.expect(training_tool_option_get)
    @token_checker
    @training_access_check(training_tool_option_get)
    def get(self):
        """Training Tool 관련 필요 정보 리스트 """
        # args = built_in_model_option_get.parse_args()        
        args = training_tool_option_get.parse_args()        
        training_id = args["training_id"]
        res = training_tool_option(training_id)
        
        return self.send(res)

def deployment_dashboard(deployment_id, start_time, end_time):
    from utils.kube import kube_data
    # get worker count
    from deployment_worker import check_deployment_worker_log_dir
    info = db.get_deployment_name_info(deployment_id=deployment_id)
    workspace_name = info.get("workspace_name")
    deployment_name = info.get("deployment_name")
    log_dir_result = check_deployment_worker_log_dir(workspace_name, deployment_name, start_time, end_time, deployment_worker_id=None)
    message="success"
    if log_dir_result["error"]==1:
        message=log_dir_result["message"]
        # return response(status=0, message=log_dir_result["message"])
    return response(status=1, result={
        "deployment_running_worker":log_dir_result["log_dir"]
        # "resolution_list":resolution_list
    }, message=message)

@ns.route("/deployments/dashboard", methods=["GET"])
class GetDeploymentDashboardOption(CustomResource):
    @ns.expect(deployment_dashboard_option_get)
    @token_checker
    def get(self):
        """Deployment Id"""
        args = deployment_dashboard_option_get.parse_args()        
        deployment_id = args["deployment_id"]
        start_time = args["start_time"]
        end_time = args["end_time"]
        res = deployment_dashboard(deployment_id=deployment_id, start_time=start_time, end_time=end_time)
        
        return self.send(res)

def get_deployment_template_option(workspace_id, deployment_template_type, headers_user):
    def get_built_in_model_info(training_info_list, deployment_template_type):
        result_list=[]
        for info in training_info_list:
            result = {
                "docker_image_id": info.get("docker_image_id"),
                "enable_to_deploy_with_gpu":info.get("enable_to_deploy_with_gpu"),
                "enable_to_deploy_with_cpu":info.get("enable_to_deploy_with_cpu"),
                "deployment_multi_gpu_mode": info.get("deployment_multi_gpu_mode"),
                "deployment_status": 1,
                "is_thumbnail":0
            }
            if info.get("type")==DEPLOYMENT_TYPE_A:
                if info["deployment_status"] != 1 or (info["enable_to_deploy_with_gpu"]!=1 and info["enable_to_deploy_with_cpu"]!=1):
                    result["deployment_status"]=0
            if deployment_template_type==DEPLOYMENT_RUN_PRETRAINED:
                result["deployment_status"]=info["exist_default_checkpoint"]
                if info["deployment_status"] != 1 or (info["enable_to_deploy_with_gpu"]!=1 and info["enable_to_deploy_with_cpu"]!=1):
                    result["deployment_status"]=0
            if info.get("thumbnail_path") !=None:
                result["is_thumbnail"]=1
            result_list.append(result)
        return result_list
    try:
        user_id=db.get_user_id(user_name=headers_user)["id"]
        built_in_model_list = db.get_built_in_model_list()
        result={}
        if deployment_template_type==DEPLOYMENT_RUN_USERTRAINED:
            built_in_training_list = db.get_workspace_built_in_training_list(workspace_id, user_id)
            custom_training_list = db.get_workspace_custom_training_list(workspace_id, user_id)
            # print("CHECK1", built_in_training_list)
            # print("CHECK2", custom_training_list)
            if built_in_training_list is None or len(built_in_training_list)==0:
                built_in_training_list = []
            if custom_training_list is None or len(custom_training_list)==0:
                custom_training_list = []
            # 리스트 두개 합치기
            usertrained_training_list_tmp = built_in_training_list+custom_training_list

            # 빌트인 모델 정보(배포 가능 방식, 배포 가능 여부, 썸네일 이미지) + 나머지 값들 업데이트
            usertrained_training_list = get_built_in_model_info(usertrained_training_list_tmp, deployment_template_type)
            built_in_key_list = ["built_in_model_id", "built_in_model_name", "built_in_model_kind"]
            training_key_list = ["id", "name", "description", "user_id", "user_name", "type", "header_user_start_datetime", "bookmark"]
            for i in range(len(usertrained_training_list)):
                for col in built_in_key_list:
                    usertrained_training_list[i][col]=usertrained_training_list_tmp[i].get(col)
                for col in training_key_list:
                    usertrained_training_list[i]["training_"+col]=usertrained_training_list_tmp[i][col]
                training_type = usertrained_training_list_tmp[i]["type"]
                usertrained_training_list[i]["deployment_type"] = DEPLOYMENT_TYPE_A if training_type==TRAINING_TYPE_C else DEPLOYMENT_TYPE_B
            # id 역순으로 sorting
            result["usertrained_training_list"]=sorted(usertrained_training_list, key=lambda x:(x["training_bookmark"], x["training_id"]), reverse=True)
        elif deployment_template_type==DEPLOYMENT_RUN_PRETRAINED:
            pretrained_built_in_model_list = get_built_in_model_info(built_in_model_list, deployment_template_type)
            built_in_key_list = ["id", "name","kind", "description"]
            for i in range(len(pretrained_built_in_model_list)):
                for col in built_in_key_list:
                    pretrained_built_in_model_list[i]["built_in_model_"+col]=built_in_model_list[i][col]
            result["pretrained_built_in_model_list"]=pretrained_built_in_model_list

        built_in_model_thumbnail_image_info = {}
        for info in built_in_model_list:
            if info.get("thumbnail_path") != None:
                thumbnail_file_path = os.path.join(JF_BUILT_IN_MODELS_PATH, info.get("path"), info.get("thumbnail_path"))
                if os.path.isfile(thumbnail_file_path):
                    with open(thumbnail_file_path, "rb") as image_file:
                        file_extension = info["thumbnail_path"].split('.')[-1]
                        built_in_model_thumbnail_image_info[info["id"]] = 'data:image/{};base64,'.format(
                            file_extension) + str(base64.b64encode(image_file.read()).decode())
        built_in_model_kind_list = db.get_built_in_model_kind_and_created_by()
        # Sally 님 요청으로 key 값 변경: kind => label
        for info in built_in_model_kind_list:
            info["label"] = info["kind"]
            del info["kind"]
        result["built_in_model_kind_list"] = built_in_model_kind_list
        result["built_in_model_thumbnail_image_info"] = built_in_model_thumbnail_image_info
        return response(status=1, result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Get Deployment Template Option Fail")

def get_runcode_from_training_id(training_id):
    try:
        training_info = db.get_training(training_id=training_id)
        run_code_list = get_run_code_list_from_src(workspace_name=training_info["workspace_name"], 
                                                    training_name=training_info["training_name"])
        return response(status=1, result={"run_code_list":run_code_list})
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Get Deployment Template Option Fail")

def get_checkpoint_from_training_id(training_id, sort_key, order_by, is_param):
    try:
        from training_checkpoint import get_job_checkpoint_info, get_hps_checkpoint_info
        result = {
            "job_list":get_job_checkpoint_info(training_id=training_id),
            "hps_list":get_hps_checkpoint_info(training_id=training_id, sort_key=sort_key, order_by=order_by, is_param=is_param)
        }
        return response(status=1, result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Get Deployment Template Option Fail")

def check_duplicate_template_group_name(workspace_id, deployment_template_group_id, deployment_template_group_name):
    try:
        is_duplicated=False
        deployment_template_group_info = db.get_deployment_template_group_by_unique_key(deployment_template_group_name=deployment_template_group_name, 
                                                                    workspace_id=workspace_id,
                                                                    deployment_template_group_id=deployment_template_group_id)
        if deployment_template_group_info != None:
            # orininal_info = db.get_deployment_template_group(deployment_template_group_id=deployment_template_group_id)
            # if orininal_info["name"]!=deployment_template_group_name:
            is_duplicated=True
        return response(status=1, result={"is_duplicated":is_duplicated}, message="OK")
    except:
        return response(status=0, message="fail")  

def check_duplicate_template_name(workspace_id, deployment_template_id, deployment_template_name, deployment_template_group_id):
    try:
        is_duplicated=False
        deployment_template_info = db.get_deployment_template_by_unique_key(deployment_template_name=deployment_template_name, 
                                                                    workspace_id=workspace_id,
                                                                    deployment_template_id=deployment_template_id,
                                                                    deployment_template_group_id=deployment_template_group_id)
        if deployment_template_info != None:
            # orininal_info = db.get_deployment_template_group(deployment_template_group_id=deployment_template_group_id)
            # if orininal_info["name"]!=deployment_template_group_name:
            is_duplicated=True
        return response(status=1, result={"is_duplicated":is_duplicated}, message="OK")
    except:
        return response(status=0, message="fail")  

def get_built_in_model_docker_image_id(built_in_model_id):
    try:
        built_in_model_info = db.get_built_in_model(model_id=built_in_model_id)
        return response(status=1, result={"docker_image_id":built_in_model_info.get("docker_image_id")}, message="OK")
    except:
        return response(status=0, message="fail")

@ns.route("/deployments/templates", methods=["GET"])
class GetDeploymentTemplateOption(CustomResource):
    @ns.expect(deployment_template_option_get)
    @token_checker
    def get(self):
        """
            Deployment Template 학습에서 가져오기 + built-in 모델 사용하기 모달 리스트 조회
            ---
            # inputs
                workspace_id (int)
                deployment_template_type (str)
                    * 학습에서 가져오기: usertrained
                    * built-in 모델 사용하기: pretrained
                    * 설정값 직접 입력하기: json
            ---
            # returns
            workspace 내의 template 정보 리스트

                status (int): 0(실패), 1(성공)
                message (str): API로 부터 담기는 메세지
                # 성공 시 
                result (dict):
                    usertrained_training_list (list) : 학습 리스트, "학습에서 가져오기" 에서 사용
                        (dict)
                            docker_image_id : 도커이미지 ID 배포에서 docker_image_list 사용을 위해 필요
                            enable_to_deploy_with_gpu : GPU
                            enable_to_deploy_with_cpu : CPU
                            deployment_multi_gpu_mode : Multi-GPU
                            deployment_status : 활성화 여부
                            is_thumbnail : 썸네일 이미지 존재 여부
                                * 0 : 없음, 기본 icon 사용
                                * 1 : 있음, built_in_model_thumbnail_image_info 에 built_in_model_id key 값으로 base64 이미지 사용
                            built_in_model_id : 생성 시 받을 값
                            built_in_model_name : Model name 값
                            built_in_model_kind : 검색 시 사용
                            training_id : 생성 시 받을 값
                            training_name : training 이름
                            training_description : training 설명
                            training_user_id : Owner
                            training_type : advanced / built-in
                                * advanced : 코드 아이콘
                                * built-in : 바람개비 아이콘
                            training_header_user_start_datetime : 
                            training_bookmark : 북마크
                            deployment_type : custom / built-in
                                * custom : 코드 아이콘
                                * built-in : 바람개비 아이콘
                    pretrained_built_in_model_list (list) : 빌트인 모델 리스트, "built-in 모델 사용하기" 에서 사용
                        (dict)
                            docker_image_id : 도커이미지 ID 배포에서 docker_image_list 사용을 위해 필요
                            enable_to_deploy_with_gpu : GPU
                            enable_to_deploy_with_cpu : CPU
                            deployment_multi_gpu_mode : Multi-GPU
                            deployment_status : 활성화 여부
                            is_thumbnail : 썸네일 이미지 존재 여부
                                * 0 : 없음, 기본 icon 사용
                                * 1 : 있음, built_in_model_thumbnail_image_info 에 built_in_model_id key 값으로 base64 이미지 사용
                            built_in_model_id : 생성 시 받을 값
                            built_in_model_name : Model name 값
                            built_in_model_kind : 검색 / 필터에 사용
                            built_in_model_description : 빌트인 모델 설명
                    built_in_model_kind_list (list) : "built-in 모델 사용하기" 에서 사용, 카테고리
                        (dict)
                            label : 모델 종류
                            created_by : 모델 생성자
                    built_in_model_thumbnail_image_info (dict) : 썸네일 이미지
                        key: built_in_model_id string
                        value : base64 이미지
        """
        args = deployment_template_option_get.parse_args()
        workspace_id = args["workspace_id"]
        deployment_template_type = args["deployment_template_type"]
        res = get_deployment_template_option(workspace_id=workspace_id, deployment_template_type=deployment_template_type, 
                headers_user=self.check_user())
        
        return self.send(res)

@ns.route("/deployments/templates/usertrained", methods=["GET"])
class GetDeploymentTemplateBuiltInOption(CustomResource):
    @ns.expect(deployment_template_usertrained_option_get)
    @token_checker
    def get(self):
        """
            Deployment Template 학습에서 가져오기 모달 Job, Checkpoint 리스트 조회
            ---
            # inputs
                training_id (int)
                sort_key (str): 회차(id), 점수(target) | params 영역 key
                order_by (str): ASC | DESC
                is_param (int): 1 | 0
            ---
            # returns
            workspace 내의 template 정보 리스트

                status (int): 0(실패), 1(성공)
                message (str): API로 부터 담기는 메세지
                # 성공 시 
                result (dict):
                    job_list (list):
                        (dict):
                            job_name (str)
                            job_create_datetime (str) : ex) 2022-11-15 01:36:26
                            job_runner_name (str)
                            job_group_list (list) : Job 클릭 후 하위의 그룹 리스트
                                (dict)
                                    job_id (int)
                                    job_group_name (int): int 값으로 +1 한 뒤 string 으로 변환하면 group name 이 된다.
                                        * 예: "job_group_name": 0 => "JOB 1"
                                    run_parameter (dict): parameter - default 값 으로 내려줌
                                    checkpoint_list (list):
                                        checkpoint 파일들

                    hps_list (list): 
                        hps_name (str): HPS 이름
                        hps_create_datetime (str): ex) 2022-11-15 01:36:26
                        hps_runner_name (str): owner
                        hps_group_list (list): HPS 클릭 후 하위의 그룹 리스트
                            (dict)
                                hps_id (int):
                                hps_group_name (int): 값에 +1 한 뒤 string 으로 변환하면 group name 이 된다.
                                        * 예: "hps_group_name": 0 => "HPS 1"
                                best_score (int) : best score 값
                                best_hps_number (int) : best 일때의 hps number
                                run_parameter (dict) : 파라미터 부분 오른쪽
                                search_parameter (dict) 파라미터 부분 왼쪽
                                hps_number_info (dict) 
                                    log_table (list) :
                                        (dict)
                                            target (int): Score
                                            params (dict)
                                                key: param
                                                value: 파라미터 값
                                            datetime (dict)
                                                datetime (str): ex)"2022-04-12 09:03:28"
                                                elapsed
                                                delta
                                            hps_id (int) : hps id, 템플릿 생성 시 필요
                                            id (int) : hps 회차 (No.), 템플릿 생성 시 필요
                                            checkpoint_list (list) :  빈 리스트일 경우 선택 비활성화, 템플릿 생성 시 필요
                                    parameter_settings (dict):
                                    status (dict):
                                    max_index (int) : log table 에서 best score 일때의 index
                                    max_item (dict) : best score 값 정보
                                        target (float) : best score
                                        params (dict) : 
                                            * 예) { "dropout_rate": 0.30, "learning_rate": 0.0028, ...}
                                        datetime (dict)
                                            datetime: 2022-11-15 02:15:18
                                            elapsed: 2167.977708
                                            delta: 50.848016
                                        hps_id (int)
                                        id (int) : hps number
                                        checkpoint_list (list)
        """                         
        args = deployment_template_usertrained_option_get.parse_args()
        training_id = args["training_id"]
        sort_key = args["sort_key"]
        order_by = args["order_by"]
        is_param = bool(args["is_param"])
        res = get_checkpoint_from_training_id(training_id=training_id, sort_key=sort_key, order_by=order_by, is_param=is_param)
        
        return self.send(res)

@ns.route("/deployments/templates/custom", methods=["GET"])
class GetDeploymentTemplateCustomOption(CustomResource):
    @ns.expect(deployment_template_custom_option_get)
    @token_checker
    def get(self):
        """
            Deployment Template 학습에서 가져오기 모달 Custom Script 리스트 조회
            ---
            # inputs
                training_id (int)
            ---
            # returns
            workspace 내의 template 정보 리스트

                status (int): 0(실패), 1(성공)
                message (str): API로 부터 담기는 메세지
                # 성공 시 
                result (dict):
                    * run_code_list (list) : Script 리스트
                        * api script 값: ex) "/jf-training-home/src/test-doc.py"
        """
        args = deployment_template_custom_option_get.parse_args()
        training_id = args["training_id"]
        res = get_runcode_from_training_id(training_id=training_id)
        
        return self.send(res)


@ns.route("/deployments/templates/check-name", methods=["GET"])
class GetDeploymentTemplateNameDuplicateOption(CustomResource):
    @ns.expect(deployment_template_name_option_get)
    @token_checker
    def get(self):
        """
            Deployment Template Group 이름 중복 여부 조회.
            ---
            # inputs
                workspace_id (int)
                deployment_template_name (str): 템플릿 그룹 이름
                deployment_template_group_id (str): 템플릿 그룹 이름
            ---
            # returns
            dict
                status (int) : 0 = 실패, 1 = 성공 
                result (dict)
                    is_duplicated : 
                        * 중복 = True
                        * 중복아님 = False
                message (str) : status = 0 일 때, 담기는 매세지
        """
        args = deployment_template_name_option_get.parse_args()
        workspace_id = args["workspace_id"]
        deployment_template_id = args["deployment_template_id"]
        deployment_template_name = args["deployment_template_name"]
        deployment_template_group_id = args["deployment_template_group_id"]
        res = check_duplicate_template_name(workspace_id=workspace_id,
                                            deployment_template_id=deployment_template_id, 
                                            deployment_template_name=deployment_template_name,
                                            deployment_template_group_id=deployment_template_group_id)
        return self.send(res)

@ns.route("/deployments/templates/check-group-name", methods=["GET"])
class GetDeploymentTemplateGroupNameDuplicateOption(CustomResource):
    @ns.expect(deployment_template_group_name_option_get)
    @token_checker
    def get(self):
        """
            Deployment Template Group 이름 중복 여부 조회.
            ---
            # inputs
                workspace_id (int)
                deployment_template_group_name (str): 템플릿 그룹 이름
            ---
            # returns
            dict
                status (int) : 0 = 실패, 1 = 성공 
                result (dict)
                    is_duplicated : 
                        * 중복 = True
                        * 중복아님 = False
                message (str) : status = 0 일 때, 담기는 매세지
        """
        args = deployment_template_group_name_option_get.parse_args()
        workspace_id = args["workspace_id"]
        deployment_template_group_id = args["deployment_template_group_id"]
        deployment_template_group_name = args["deployment_template_group_name"]
        res = check_duplicate_template_group_name(workspace_id=workspace_id,
                                            deployment_template_group_id=deployment_template_group_id, 
                                            deployment_template_group_name=deployment_template_group_name)
        return self.send(res)

@ns.route("/deployments/templates/docker-image-id", methods=["GET"])
class GetDeploymentTemplateDockerImageIDOption(CustomResource):
    @ns.expect(deployment_template_docker_image_id_option_get)
    @token_checker
    def get(self):
        """
            Deployment Template Built In Model ID 통해 Docker Image ID 조회
            ---
            # inputs
                built_in_model_id (int)
            ---
            # returns
            dict
                status (int) : 0 = 실패, 1 = 성공 
                result (dict)
                    docker_image_id (int)
                message (str) : status = 0 일 때, 담기는 매세지
        """
        args = deployment_template_docker_image_id_option_get.parse_args()
        built_in_model_id = args["built_in_model_id"]

        res = get_built_in_model_docker_image_id(built_in_model_id=built_in_model_id)
        return self.send(res)

def images_option(workspace_id):
    if workspace_id is None:
        result = {
            "workspace_list" : db.get_workspace_name_and_id_list()
        }
        return response(status=1, result=result)

    result = {
        "user_list": db.get_workspace_user_name_and_id_list(workspace_id),
    }

    return response(status=1, result=result)


@ns.route("/images", methods=["GET"])
class GETImagesOption(CustomResource):
    @token_checker
    @workspace_access_check(images_option_get)
    @ns.expect(images_option_get)
    def get(self):
        args = images_option_get.parse_args()
        workspace_id = args["workspace_id"]
        res = images_option(workspace_id=workspace_id)
        return self.send(res)
