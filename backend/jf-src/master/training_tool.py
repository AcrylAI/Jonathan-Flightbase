from flask_restplus import reqparse, Resource
from restplus import api

from utils.resource import CustomResource, token_checker
from utils.resource import response
import utils.scheduler as scheduler
import utils.kube as kube
from utils.kube import kube_data
import utils.kube_parser as  kube_parser
from utils.crypt import session_cipher, front_cipher
from utils.kube_create_func import create_file_browser_pod, create_jupyter_pod, create_rstudio_pod, update_jupyter_pod_service, create_ssh_pod, create_tool_empty
import utils.db as db
from utils.exceptions import *
import utils.common as common
from utils.crypt import session_cipher, front_cipher
from utils.access_check import workspace_access_check, training_access_check
from lock import jf_scheduler_lock
from TYPE import *
from FORM import *
from settings import *

import traceback
import re
import HELP
import random
import requests
ns = api.namespace('trainings', description='Training 관련 API')

training_tool_control_put = api.parser()
training_tool_control_put.add_argument('training_tool_id', type=int, required=True, location='json', help="tool id")
training_tool_control_put.add_argument('action', type=str, required=True, location='json', help="action = 'on' | 'off' ")

training_tool_jupyter_url_get_parser = api.parser()
training_tool_jupyter_url_get_parser.add_argument('training_tool_id', type=int, required=True, location='args', help="training_tool_id")
training_tool_jupyter_url_get_parser.add_argument('protocol', required=False, default=INGRESS_PROTOCOL, type=str, location='args', help='front protocol =? http or https')

training_tool_url_get_parser = api.parser()
training_tool_url_get_parser.add_argument('training_tool_id', type=int, required=True, location='args', help="training_tool_id")
training_tool_url_get_parser.add_argument('protocol', required=False, default=INGRESS_PROTOCOL, type=str, location='args', help='front protocol =? http or https')

training_tool_ssh_login_cmd_get_parser = api.parser()
training_tool_ssh_login_cmd_get_parser.add_argument('training_tool_id', type=int, required=True, location='args', help="training_tool_id")

training_tool_get = api.parser()
training_tool_get.add_argument('training_id', type=int, required=True, location='args', help="training_id")

training_tool_put = api.parser()
training_tool_put.add_argument('training_tool_id', type=int, required=True, location='json', help="training_tool_id")
training_tool_put.add_argument('port_list', type=list, required=False, default=None, location='json', help=HELP.PORT_LIST)
training_tool_put.add_argument('gpu_count', type=int, required=True, location='json', help='Training(Job, Hps) GPU Count')
training_tool_put.add_argument('gpu_model', type=dict, required=False, default=None, location='json', help=HELP.GPU_MODEL)
training_tool_put.add_argument('node_mode', type=int, required=False, default=1, location='json', help=HELP.NODE_MODE)
training_tool_put.add_argument('node_name', type=dict, required=False, default=None, location='json', help=HELP.NODE_NAME)
training_tool_put.add_argument('node_name_gpu', type=dict, required=False, default=None, location='json', help=HELP.NODE_NAME)
training_tool_put.add_argument('node_name_cpu', type=dict, required=False, default=None, location='json', help=HELP.NODE_NAME)
training_tool_put.add_argument('docker_image_id', type=int, required=False, location='json', help='Docker Image')


training_tool_replica_post = api.parser()
training_tool_replica_post.add_argument('training_id', type=int, required=True, location='json', help="training_id")
training_tool_replica_post.add_argument('training_tool_type', type=int, required=True, location='json', help="training_tool_type id (support only 1(jupyter) 4(ssh)) ")
training_tool_replica_post.add_argument('port_list', type=list, required=False, default=None, location='json', help=HELP.PORT_LIST)
training_tool_replica_post.add_argument('gpu_count', type=int, required=False, default=1, location='json', help='GPU Count')
training_tool_replica_post.add_argument('gpu_model', type=dict, required=False, default=None, location='json', help=HELP.GPU_MODEL)
training_tool_replica_post.add_argument('docker_image_id', type=int, required=False, default=None, location='json', help='Docker Image')
training_tool_replica_post.add_argument('set_default', type=int, required=False, default=0, location='json', help='0 = 설정한 값은 지금 생성에만 | 1 = 설정한 값이 default로')
training_tool_replica_post.add_argument('node_mode', type=int, required=False, default=1, location='json', help=HELP.NODE_MODE)
training_tool_replica_post.add_argument('node_name', type=dict, required=False, default=None, location='json', help=HELP.NODE_NAME)
training_tool_replica_post.add_argument('node_name_gpu', type=dict, required=False, default=None, location='json', help=HELP.NODE_NAME)
training_tool_replica_post.add_argument('node_name_cpu', type=dict, required=False, default=None, location='json', help=HELP.NODE_NAME)

training_tool_replica_delete = api.parser()
training_tool_replica_delete.add_argument('training_tool_id', type=int, required=True, location='json', help="training_tool_id")

training_tool_name_update_parser = api.parser()
training_tool_name_update_parser.add_argument('training_tool_id', type=int, required=True, location='json', help="training_tool_id")
training_tool_name_update_parser.add_argument('training_tool_name', type=str, required=True, location='json', help="training tool name : 규칙 없음. 자유")

training_tool_info_get = api.parser()
training_tool_info_get.add_argument('training_tool_id', type=int, required=True, location='args', help="training_tool_id - ")

training_tool_type_info_get = api.parser()
training_tool_type_info_get.add_argument('training_tool_type', type=int, required=True, location='args', help="tool_type - ")

def create_tool_item(training_id, only_default=False):

    training_info = db.get_training(training_id=training_id)
    gpu_count = training_info["gpu_count"]
    docker_image_id = training_info["image_id"]
    # if training_info["gpu_count"] < 1:
    #     gpu_count = 1 
    
    # 공통
    db.insert_training_tool(training_id=training_id, tool_type=TOOL_TYPE_ID[TOOL_JOB_KEY], gpu_count=gpu_count, init_mode=True) # job
    db.insert_training_tool(training_id=training_id, tool_type=TOOL_TYPE_ID[TOOL_HPS_KEY], gpu_count=gpu_count, init_mode=True) # hps
    db.insert_training_tool(training_id=training_id, tool_type=TOOL_TYPE_ID[TOOL_EDITOR_KEY], gpu_count=0, init_mode=True) # editor
    if training_info["type"] == TRAINING_TYPE_A and only_default == False:
        # advanced Only
        # db.insert_training_tool(training_id=training_id, tool_type=TOOL_TYPE_ID[TOOL_EDITOR_KEY], gpu_count=0) # editor
        db.insert_training_tool(training_id=training_id, tool_type=TOOL_TYPE_ID[TOOL_JUPYTER_KEY], gpu_count=gpu_count, init_mode=True) # jupyter
        db.insert_training_tool(training_id=training_id, tool_type=TOOL_TYPE_ID[TOOL_SSH_KEY], gpu_count=gpu_count, init_mode=True) # SSH
        # Rstudio 와 file browser는 기본으로 만들어주는 도구는 아님
        # db.insert_training_tool(training_id=training_id, tool_type=TOOL_TYPE_ID[TOOL_RSTUDIO_KEY], gpu_count=gpu_count) # rstudio
        # db.insert_training_tool(training_id=training_id, tool_type=TOOL_TYPE_ID[TOOL_FILEBROWSER_KEY], gpu_count=gpu_count) # file browser
    init_training_tool_default_port(training_id=training_id)

def init_training_tool_default_port(training_id):
    training_tool_list = db.get_training_tool_list(training_id=training_id)
    db_insert_port_list = []
    system_definition = 1
    description = "Default"
    port_status = 1
    for training_tool in training_tool_list: 
        tool_type = TOOL_TYPE.get(training_tool["tool_type"])
        if tool_type is None:
            print("WARN : TOOL TYPE Only [{}] exist. not {}".format(list(TOOL_TYPE.keys()), training_tool["tool_type"]))
            continue 
        default_port_list = TOOL_DEFAULT_PORT.get(tool_type)
        if default_port_list is None:
            print("WARN : TOOL DEFAULT PORT Only [{}] exist. not {}".format(list(TOOL_DEFAULT_PORT.keys()), training_tool["tool_type"]))
            continue 
        for port in default_port_list:
            db_insert_port_list.append((training_tool["training_id"], training_tool["id"], port["name"], port["port"], None, port["protocol"], description, system_definition, port["type"], port_status))

    db.insert_training_tool_port_list(port_list=db_insert_port_list)
    
def control_jupyter(training_tool_id, headers_user, action):
    if action == "on":
        result = run_training_tool(training_tool_id=training_tool_id, headers_user=headers_user)

    elif action == "off":
        result = stop_training_tool(training_tool_id=training_tool_id)

    return result



def create_training_tool_default_port(training_tool_id, default_port_list=None):
    db_insert_port_list = []
    if default_port_list is None:
        training_tool_info = db.get_training_tool(training_tool_id=training_tool_id)
        default_port_list = TOOL_DEFAULT_PORT[TOOL_TYPE[training_tool_info["tool_type"]]]
        system_definition = 1
        description = "Default"
        port_status = 1
        for port in default_port_list:
            db_insert_port_list.append(((training_tool_info["training_id"], training_tool_info["id"], port["name"], port["port"], None, port["protocol"], description, system_definition, port["type"], port_status)))
    else:
        training_tool_info = db.get_training_tool(training_tool_id=training_tool_id)
        for port in default_port_list:
            db_insert_port_list.append(((training_tool_info["training_id"], training_tool_info["id"], port["name"], port["target_port"], port["node_port"], port["protocol"], port["description"], port["system_definition"], port["service_type"], port["status"])))

    db.insert_training_tool_port_list(port_list=db_insert_port_list)

def update_training_tool_port(training_tool_id, new_port_list):
    old_port_list = db.get_training_tool_port_list(training_tool_id)
    old_port_id_list = []
    old_port_default_id_list = []
    for old_port in old_port_list:
        if old_port["system_definition"] == 0:
            old_port_id_list.append(old_port["id"])
        else:
            old_port_default_id_list.append(old_port["id"])

    changed_port_info_list = []
    changed_port_id_list = []
    new_add_port_info_list = []
    for new_port in new_port_list:
        if new_port.get("id") is None:
            new_add_port_info_list.append(new_port)
        else :
            changed_port_info_list.append(new_port)
            changed_port_id_list.append(new_port["id"])

    add_item, del_item = common.get_add_del_item_list(old=old_port_id_list, new=changed_port_id_list)
    print("OLD", old_port_id_list)
    print("NEW", changed_port_id_list)
    print("ADD", add_item)
    print("DEL", del_item)
    print("CHG", changed_port_id_list) # ID 있는 Port들은 이미 생성 되었던 포트들

    status = kube.get_training_tool_pod_status(training_tool_id=training_tool_id)["status"]
    if status in KUBER_RUNNING_STATUS:
        service_list = kube.get_list_service()
        all_port_list = kube.get_service_node_port_list(service_list=service_list)
        my_port_list = kube.get_service_node_port_list(service_list=service_list, training_tool_id=training_tool_id)
        ports_in_use_list = list(set(all_port_list) - set(my_port_list))
        for port_info in new_add_port_info_list + changed_port_info_list:
            if port_info.get("node_port") in ports_in_use_list:
                raise RuntimeError("port ({}) already in use".format(port_info.get("node_port")))

    db.delete_training_tool_port(training_tool_id=training_tool_id)

    # for del_port_id in del_item:
    #     db.delete_training_tool_port(training_port_id=del_port_id)


    for new_port_info in new_add_port_info_list:
        db.insert_training_tool_port(training_tool_id=training_tool_id, name=new_port_info.get("name"), 
                                    target_port=new_port_info.get("target_port"), node_port=new_port_info.get("node_port"),
                                    protocol=new_port_info.get("protocol"), description=new_port_info.get("description"), system_definition=new_port_info.get("system_definition"), 
                                    service_type=new_port_info.get("service_type"), status=new_port_info.get("status"))
    
    for changed_port_info in changed_port_info_list:
        # training_port_id=changed_port_info.get("id")
        db.insert_training_tool_port(training_port_id=changed_port_info.get("id"), training_tool_id=training_tool_id, name=changed_port_info.get("name"), 
                                    target_port=changed_port_info.get("target_port"), node_port=changed_port_info.get("node_port"),   
                                    protocol=changed_port_info.get("protocol"), description=changed_port_info.get("description"), system_definition=changed_port_info.get("system_definition"), 
                                    service_type=changed_port_info.get("service_type"), status=changed_port_info.get("status"))


    
    if status in KUBER_RUNNING_STATUS:
        update_running_training_tool_service(training_tool_id=training_tool_id, old_port_list=old_port_list)
        training_port_node_port_init(training_tool_id=training_tool_id)

def update_running_training_tool_service(training_tool_id, old_port_list):
    old_port_list = old_port_list 
    old_port_dict = common.gen_dict_from_list_by_key(target_list=old_port_list, id_key="id")

    current_port_list = [ port for port in db.get_training_tool_port_list(training_tool_id=training_tool_id) if port["status"] == 1 ]
    current_port_dict = common.gen_dict_from_list_by_key(target_list=current_port_list, id_key="id")

    service_port_list = kube.get_training_tool_item_port_list(training_tool_id=training_tool_id)
    service_port_dict = common.gen_dict_from_list_by_key(target_list=service_port_list, id_key="name")

    labels = kube.get_training_tool_item_labels(training_tool_id=training_tool_id)

    new_port_list = []
    for port_id, port_info in current_port_dict.items():
        old_port_info = old_port_dict.get(port_id)
        if old_port_info is not None:
            old_port_name = old_port_info[0].get("name")
            service_info = service_port_dict.get(old_port_name)
            # if service_info is not None and port_info[0]["node_port"] is None:
            #     service_node_port = service_info[0]["node_port"]
            #     port_info[0]["node_port"] = service_node_port
        new_port_list.append(port_info[0])

    kube.delete_service_training_tool(training_tool_id=training_tool_id)
    update_jupyter_pod_service(labels=labels, port_list=new_port_list)

def stop_all_training_tool(training_id):
    tool_list = db.get_training_tool_list(training_id=training_id)
    for tool in tool_list:
        stop_training_tool(tool["id"])

def stop_training_tool(training_tool_id):
    res, message = kube.kuber_item_remove(training_tool_id=training_tool_id)
    res = 1 if res == True else 0
    return response(status=res, message=message)

def run_training_tool(training_tool_id, headers_user):
    status = kube.get_training_tool_pod_status(training_tool_id=training_tool_id)["status"]
    if status in KUBER_RUNNING_STATUS:
        return response(status=0, message="Already running")

    user_id = db.get_user(user_name=headers_user)["id"]
    user_name = headers_user
    
    training_tool_info = db.get_training_tool_setting_info(training_tool_id=training_tool_id)
    tool_type = training_tool_info["tool_type"]
    training_tool_info["user_id"] = user_id
    training_tool_info["user_name"] = user_name
    run_result = None
    if tool_type in TOOL_JUPYTER_BASE_LIST:
        run_result, message = run_jupyter(training_tool_info)
    elif tool_type in TOOL_SSH_BASE_LIST:
        run_result, message = run_ssh(training_tool_info)
    elif tool_type in TOOL_RSTUDIO_BASE_LIST:
        run_result, message = run_rstudio(training_tool_info)
    elif tool_type in TOOL_FILEBROWSER_BASE_LIST:
        run_result, message = run_file_browser(training_tool_info)

    if run_result:
        training_port_node_port_init(training_tool_id=training_tool_id)
        return response(status=1, message="Training Tool [{}] Run".format(TOOL_TYPE[tool_type]))
    else :
        return response(status=0, message="Training Tool [{}] Cannot Run {}".format(TOOL_TYPE[tool_type], message))

def training_port_node_port_init(training_tool_id):
    service_list = kube.get_list_service() #kube_data.get_service_list()
    service_port_list = kube.get_service_port_info_list(training_tool_id=training_tool_id)
    
    for port_item in service_port_list:
        db.update_training_tool_port_empty_node_port(training_tool_id=training_tool_id, name=port_item["name"], node_port=port_item["node_port"])

    # for service_info in kube.find_kuber_item_name_and_item(item_list=service_list, training_tool_id=training_tool_id):
    #     for port_item in kube_parser.parsing_service_port_list(service_info["item"]):
    #         db.update_training_tool_port_empty_node_port(training_tool_id=training_tool_id, name=port_item["name"], node_port=port_item["node_port"])

# TODO run_tool_XXX 실패 시 메세지 전달 방법을 execptions_로 처리할 수 있도록 변경 필요 (2022-12-06 Yeobie)

def run_tool_default(training_tool_info):
    try:
        training_tool_id = training_tool_info["id"]
        training_tool_type = training_tool_info["tool_type"]
        training_tool_replica_number = training_tool_info["tool_replica_number"]
        workspace_name = training_tool_info["workspace_name"]
        workspace_id = training_tool_info["workspace_id"]
        training_id = training_tool_info["training_id"]
        training_name = training_tool_info["training_name"]
        owner_name = training_tool_info["owner_name"]
        training_type = training_tool_info["type"]
        image = training_tool_info["image"]
        image_name = training_tool_info["image_name"]
        image_id = training_tool_info["docker_image_id"]
        access = training_tool_info["access"]
        gpu_count = training_tool_info["gpu_count"]

        run_result = ''
        message = ''
        users  = [user["user_name"] for user in db.get_training_users(training_id=training_id, include_owner=False)]

        with jf_scheduler_lock:
            check_result = scheduler.check_immediate_running_item_resource_new(requested_gpu_count=gpu_count, gpu_usage_type=TRAINING_TYPE, 
                                                                            workspace_id=workspace_id, rdma_option=0, 
                                                                            gpu_model=training_tool_info["gpu_model"], node_name=training_tool_info["node_name"])
            if check_result is not None:
                if check_result.get_number_of_node() > 1:
                    # MULTIPLE NODE 필요한 상황
                    run_result = False
                    message = "There is no single node with the requested number of GPUs."
                else :
                    # SINGLE NODE
                    tool_pod_info = {
                        "workspace_name": workspace_name,
                        "workspace_id": workspace_id,
                        "training_name": training_name,
                        "training_id": training_id,
                        "training_tool_id": training_tool_id,
                        "training_tool_type": TOOL_TYPE[training_tool_type],
                        "training_tool_replica_number": training_tool_replica_number,
                        "owner": owner_name,
                        "executor_id": training_tool_info["user_id"],
                        "executor_name": training_tool_info["user_name"],
                        "training_type": training_type,
                        "gpu_count": gpu_count,
                        "image": image,
                        "image_id": image_id,
                        "image_name": image_name,
                        "users": users,
                        "ports": [ port  for port in db.get_training_tool_port_list(training_tool_id=training_tool_id) if port["status"] == 1 ],
                        "cluster_n": 0
                    }
                    try:
                        run_result, message = create_tool_empty(pod_info=tool_pod_info, node_info=check_result.node_info_list[0])
                    except CustomErrorList as ce:
                        run_result = False
                        message = ce.message

                    
            else:
                run_result = False
                message = "There are no nodes that satisfy the execution condition."
            # uwsgi.unlock()
        return run_result, message
    except Exception as e:
        traceback.print_exc()
        return False, str(e)

def run_jupyter(training_tool_info):
    try:
        training_tool_id = training_tool_info["id"]
        training_tool_type = training_tool_info["tool_type"]
        training_tool_replica_number = training_tool_info["tool_replica_number"]
        workspace_name = training_tool_info["workspace_name"]
        workspace_id = training_tool_info["workspace_id"]
        training_id = training_tool_info["training_id"]
        training_name = training_tool_info["training_name"]
        owner_name = training_tool_info["owner_name"]
        training_type = training_tool_info["type"]
        image = training_tool_info["image"]
        image_name = training_tool_info["image_name"]
        image_id = training_tool_info["docker_image_id"]
        access = training_tool_info["access"]
        gpu_count = training_tool_info["gpu_count"]

        run_result = ''
        message = ''
        users  = [user["user_name"] for user in db.get_training_users(training_id=training_id, include_owner=False)]

        with jf_scheduler_lock:
            check_result = scheduler.check_immediate_running_item_resource_new(requested_gpu_count=gpu_count, gpu_usage_type=TRAINING_TYPE, 
                                                                            workspace_id=workspace_id, rdma_option=0, 
                                                                            gpu_model=training_tool_info["gpu_model"], node_name=training_tool_info["node_name"])
            if check_result is not None:
                if check_result.get_number_of_node() > 1:
                    # MULTIPLE NODE 필요한 상황
                    run_result = False
                    message = "There is no single node with the requested number of GPUs."
                else :
                    # SINGLE NODE
                    jupyter_pod_info = {
                        "workspace_name": workspace_name,
                        "workspace_id": workspace_id,
                        "training_name": training_name,
                        "training_id": training_id,
                        "training_tool_id": training_tool_id,
                        "training_tool_type": TOOL_TYPE[training_tool_type],
                        "training_tool_replica_number": training_tool_replica_number,
                        "owner": owner_name,
                        "executor_id": training_tool_info["user_id"],
                        "executor_name": training_tool_info["user_name"],
                        "training_type": training_type,
                        "gpu_count": gpu_count,
                        "image": image,
                        "image_id": image_id,
                        "image_name": image_name,
                        "users": users,
                        "ports": [ port  for port in db.get_training_tool_port_list(training_tool_id=training_tool_id) if port["status"] == 1 ],
                        "cluster_n": 0
                    }
                    print("jupyter_pod_info", jupyter_pod_info, check_result.node_info_list[0].node_gpu_info.__dict__)
                    try:
                        # run_result, message = create_jupyter_pod(pod_info=jupyter_pod_info, node_groups=check_result["node_groups"])
                        run_result, message = create_jupyter_pod(pod_info=jupyter_pod_info, node_info=check_result.node_info_list[0])
                    except CustomErrorList as ce:
                        run_result = False
                        message = ce.message

                    
            else:
                run_result = False
                message = "There are no nodes that satisfy the execution condition."
            # uwsgi.unlock()
        return run_result, message
    except Exception as e:
        traceback.print_exc()
        return False, str(e)

def run_ssh(training_tool_info):
    try:
        training_tool_id = training_tool_info["id"]
        training_tool_type = training_tool_info["tool_type"]
        training_tool_replica_number = training_tool_info["tool_replica_number"]
        workspace_name = training_tool_info["workspace_name"]
        workspace_id = training_tool_info["workspace_id"]
        training_id = training_tool_info["training_id"]
        training_name = training_tool_info["training_name"]
        owner_name = training_tool_info["owner_name"]
        training_type = training_tool_info["type"]
        image = training_tool_info["image"]
        image_name = training_tool_info["image_name"]
        image_id = training_tool_info["docker_image_id"]
        access = training_tool_info["access"]
        gpu_count = training_tool_info["gpu_count"]

        run_result = ''
        message = ''
        users  = [user["user_name"] for user in db.get_training_users(training_id=training_id, include_owner=False)]
        with jf_scheduler_lock:
            check_result = scheduler.check_immediate_running_item_resource_new(requested_gpu_count=gpu_count, gpu_usage_type=TRAINING_TYPE, 
                                                                            workspace_id=workspace_id, rdma_option=0, 
                                                                            gpu_model=training_tool_info["gpu_model"], node_name=training_tool_info["node_name"])
            if check_result is not None:
                if check_result.get_number_of_node() > 1:
                    # MULTIPLE NODE 필요한 상황
                    run_result = False
                    message = "There is no single node with the requested number of GPUs."
                else :
                    # SINGLE NODE
                    ssh_pod_info = {
                        "workspace_name": workspace_name,
                        "workspace_id": workspace_id,
                        "training_name": training_name,
                        "training_id": training_id,
                        "training_tool_id": training_tool_id,
                        "training_tool_type": TOOL_TYPE[training_tool_type],
                        "training_tool_replica_number": training_tool_replica_number,
                        "owner": owner_name,
                        "executor_id": training_tool_info["user_id"],
                        "executor_name": training_tool_info["user_name"],
                        "training_type": training_type,
                        "gpu_count": gpu_count,
                        "image": image,
                        "image_name": image_name,
                        "image_id": image_id,
                        "users": users,
                        "ports": [ port  for port in db.get_training_tool_port_list(training_tool_id=training_tool_id) if port["status"] == 1 ],
                        "cluster_n": 0
                    }
                    try:
                        run_result, message = create_ssh_pod(pod_info=ssh_pod_info, node_info=check_result.node_info_list[0])
                    except CustomErrorList as ce:
                        run_result = False
                        message = ce.message

                    
            else:
                run_result = False
                message = "There are no nodes that satisfy the execution condition."

        return run_result, message
    except Exception as e:
        traceback.print_exc()
        return False, str(e)

def run_rstudio(training_tool_info):
    try:
        training_tool_id = training_tool_info["id"]
        training_tool_type = training_tool_info["tool_type"]
        training_tool_replica_number = training_tool_info["tool_replica_number"]
        workspace_name = training_tool_info["workspace_name"]
        workspace_id = training_tool_info["workspace_id"]
        training_id = training_tool_info["training_id"]
        training_name = training_tool_info["training_name"]
        owner_name = training_tool_info["owner_name"]
        training_type = training_tool_info["type"]
        image = training_tool_info["image"]
        image_name = training_tool_info["image_name"]
        image_id = training_tool_info["docker_image_id"]
        access = training_tool_info["access"]
        gpu_count = training_tool_info["gpu_count"]

        run_result = ''
        message = ''
        users  = [user["user_name"] for user in db.get_training_users(training_id=training_id, include_owner=False)]

        with jf_scheduler_lock:
            check_result = scheduler.check_immediate_running_item_resource_new(requested_gpu_count=gpu_count, gpu_usage_type=TRAINING_TYPE, 
                                                                            workspace_id=workspace_id, rdma_option=0, 
                                                                            gpu_model=training_tool_info["gpu_model"], node_name=training_tool_info["node_name"])
            if check_result is not None:
                if check_result.get_number_of_node() > 1:
                    # MULTIPLE NODE 필요한 상황
                    run_result = False
                    message = "There is no single node with the requested number of GPUs."
                else :
                    # SINGLE NODE
                    rstudio_pod_info = {
                        "workspace_name": workspace_name,
                        "workspace_id": workspace_id,
                        "training_name": training_name,
                        "training_id": training_id,
                        "training_tool_id": training_tool_id,
                        "training_tool_type": TOOL_TYPE[training_tool_type],
                        "training_tool_replica_number": training_tool_replica_number,
                        "owner": owner_name,
                        "executor_id": training_tool_info["user_id"],
                        "executor_name": training_tool_info["user_name"],
                        "training_type": training_type,
                        "gpu_count": gpu_count,
                        "image": image,
                        "image_id": image_id,
                        "image_name": image_name,
                        "users": users,
                        "ports": [ port  for port in db.get_training_tool_port_list(training_tool_id=training_tool_id) if port["status"] == 1 ],
                        "cluster_n": 0
                    }
                    try:
                        run_result, message = create_rstudio_pod(pod_info=rstudio_pod_info, node_info=check_result.node_info_list[0])
                    except CustomErrorList as ce:
                        run_result = False
                        message = ce.message

                    
            else:
                run_result = False
                message = "There are no nodes that satisfy the execution condition."
            # uwsgi.unlock()
        return run_result, message
    except Exception as e:
        traceback.print_exc()
        return False, str(e)

def run_file_browser(training_tool_info):
    try:
        training_tool_id = training_tool_info["id"]
        training_tool_type = training_tool_info["tool_type"]
        training_tool_replica_number = training_tool_info["tool_replica_number"]
        workspace_name = training_tool_info["workspace_name"]
        workspace_id = training_tool_info["workspace_id"]
        training_id = training_tool_info["training_id"]
        training_name = training_tool_info["training_name"]
        owner_name = training_tool_info["owner_name"]
        training_type = training_tool_info["type"]
        image = training_tool_info["image"]
        image_name = training_tool_info["image_name"]
        image_id = training_tool_info["docker_image_id"]
        access = training_tool_info["access"]
        gpu_count = training_tool_info["gpu_count"]

        run_result = ''
        message = ''
        users  = [user["user_name"] for user in db.get_training_users(training_id=training_id, include_owner=False)]

        with jf_scheduler_lock:
            check_result = scheduler.check_immediate_running_item_resource_new(requested_gpu_count=gpu_count, gpu_usage_type=TRAINING_TYPE, 
                                                                            workspace_id=workspace_id, rdma_option=0, 
                                                                            gpu_model=training_tool_info["gpu_model"], node_name=training_tool_info["node_name"])
            if check_result is not None:
                if check_result.get_number_of_node() > 1:
                    # MULTIPLE NODE 필요한 상황
                    run_result = False
                    message = "There is no single node with the requested number of GPUs."
                else :
                    # SINGLE NODE
                    file_browser_pod_info = {
                        "workspace_name": workspace_name,
                        "workspace_id": workspace_id,
                        "training_name": training_name,
                        "training_id": training_id,
                        "training_tool_id": training_tool_id,
                        "training_tool_type": TOOL_TYPE[training_tool_type],
                        "training_tool_replica_number": training_tool_replica_number,
                        "owner": owner_name,
                        "executor_id": training_tool_info["user_id"],
                        "executor_name": training_tool_info["user_name"],
                        "training_type": training_type,
                        "gpu_count": gpu_count,
                        "image": image,
                        "image_id": image_id,
                        "image_name": image_name,
                        "users": users,
                        "ports": [ port  for port in db.get_training_tool_port_list(training_tool_id=training_tool_id) if port["status"] == 1 ],
                        "cluster_n": 0
                    }
                    try:
                        run_result, message = create_file_browser_pod(pod_info=file_browser_pod_info, node_info=check_result.node_info_list[0])
                    except CustomErrorList as ce:
                        run_result = False
                        message = ce.message

                    
            else:
                run_result = False
                message = "There are no nodes that satisfy the execution condition."
            # uwsgi.unlock()
        return run_result, message
    except Exception as e:
        traceback.print_exc()
        return False, str(e)

SERVICE_MODE_INGRESS = "Ingress"
SERVICE_MODE_NODE_PORT = "NodePort"

def get_tool_address(ip, port, mode):
    """
        Description : Tool 주소 정의 시 MODE 에 따라서 address 결정 하는 방법 정의
                      mode가 SERVICE_MODE_INGRESS 경우 EXTERNAL_HOST_REDIRECT에 영향을 받고
                      mode가 SERVICE_MODE_NODE_PORT 경우 EXTERNAL_HOST_REDIRECT에 영향을 받지 않도록 구성

        Args :
            ip (str) : 
            port (int) :
            mode (str) : SERVICE_MODE_INGRESS, SERVICE_MODE_NODE_PORT

        Return :
            (str): ip:port or ip
    """
    if EXTERNAL_HOST_REDIRECT == True and mode == SERVICE_MODE_INGRESS :
        tool_address = ip
    else :
        tool_address = "{}:{}".format(ip, port)

    return tool_address
#TODO
#protocol 고도화 작업 해야함
def get_tool_url(training_tool_id, protocol):
    try:
        training_tool_info = db.get_training_tool_only(training_tool_id=training_tool_id)
        if training_tool_info is None:
            # TODO TEST (2022-09-29)
            raise ItemNotExistError


        if training_tool_info["tool_type"] in [ TOOL_EDITOR_ID, TOOL_JUPYTER_ID ]:
            return get_jupyter_url(training_tool_id=training_tool_id, protocol=protocol)
        elif training_tool_info["tool_type"] == TOOL_RSTUDIO_ID:
            protocol="http"
            return get_rstudio_url(training_tool_id=training_tool_id, protocol=protocol)
        elif training_tool_info["tool_type"] == TOOL_FILEBROWSER_ID:
            protocol="http"
            return get_filebrowser_url_and_pw_check(training_tool_id=training_tool_id, protocol=protocol)
        else:
            raise Exception("Unexpected Tool Type.")

    except :
        traceback.print_exc()
        return response(status=0, message="Tool Url Get Error")

def get_jupyter_url(training_tool_id, protocol):
    import time
    from utils.kube_setting_cmd import get_jupyter_lab_url_cmd
    """Returns None on failure."""

    URL_FILE_PATH = "/tmp/jupyter-url-token"

    def jupyter_url(pod_name, jupyter_address, protocol):
        try:
            cmd_res = None
            for i in range(10):
                try:
                    pod_cmd = get_jupyter_lab_url_cmd(n=i)
                    host_cmd = 'kubectl exec {pod_name} -- {pod_cmd}'.format(pod_name=pod_name, pod_cmd=pod_cmd)
                    print('==============================')
                    print('host_cmd: ', host_cmd)
                    print('nginx_port : ', nginx_port)
                    print('==============================')
                    cmd_res, *_ = common.launch_on_host(host_cmd)
                    if "?token=" in cmd_res:
                        break
                except :
                    print("URL GET Retry")
                time.sleep(0.1)

            for cmd in cmd_res.split("\n"):
                if "http://" in cmd:
                    cmd_res = cmd 
                    break

            print("?????", cmd_res)
            #EX1) cmd_res = http://0.0.0.0:8888/jupyter/7a971ecb54579ff453383a853ac2d4d9/?token=7a9abd0d44d1655bd825ef7539ac6a6267342a617951b837 :: /home/robert \n
            #EX2) cmd_res = http://h3783d0a5c26a5ed60bfb6611f5d9f21c:8888/jupyter/h3783d0a5c26a5ed60bfb6611f5d9f21c/?token=1532405c0631be6ca6cf98796d102fda5742a077566bec65 :: /home/robert
            last_line = cmd_res.split('\n')[0]
            url = last_line.split(' :: ')[0]
            # kubectl exec  hf3e4a3f93b74787446cafa10e3e386ab-0 -- /bin/bash -c ' echo "{url}" > /tmp/jupyter-token'
            # url = url.replace("http://0.0.0.0", "http://{ip}".format(ip=jupyter_ip))
            # url = url.replace(":8888/",":{port}/".format(port=nginx_port))
            # url = url.replace("http://0.0.0.0:8888/","http://{jupyter_ip}/".format(jupyter_ip=jupyter_ip))

            url = re.sub(r'http://.*:8888/', "http://{}/".format(jupyter_address), url)
            url = url.replace("http://", "{protocol}://".format(protocol=protocol))
            url = url.replace("\n","")
            return url
        except :
            traceback.print_exc()
            return None

    def save_url(pod_name, url):
        url_cmd = ' echo "{url}" > {file_path}'.format(url=url, file_path=URL_FILE_PATH)
        save_cmd = "kubectl exec {pod_name} -- /bin/bash -c '{url_cmd}'".format(pod_name=pod_name, url_cmd=url_cmd)
        try:
            stdout, stderr = common.launch_on_host(save_cmd)
        except Exception as e:
            # TODO CHECK
            traceback.print_exc()
            print("SAVE URL EXCEPTION - {}".format(e))
            
            return False
        return True
        
    def load_url(pod_name):
        check_pod_url_cmd="kubectl exec {pod_name} cat {file_path}".format(pod_name=jupyter_pod_name, file_path=URL_FILE_PATH)
        try:
            stdout, stderr = common.launch_on_host(check_pod_url_cmd)
        except Exception as e:
            traceback.print_exc()
            print("LOAD URL EXCEPTION - {}".format(e)) # LOAD URL EXCEPTION - cat: /tmp/jupyter-url-token: No such file or directory            
            return None
        return stdout
        
    def transform_url(loaded_url, jupyter_address, protocol):
        url = re.sub(r'.*://[^/]*/', "{protocol}://{address}/".format(protocol=protocol, address=jupyter_address), loaded_url)
        url = url.replace("\n","")
        return url 
        
    def is_url_from_same_pod(url, pod_name):
        if pod_name in url:
            return True
        else:
            return False
        
        
    try:
        training_info = db.get_training_tool_setting_info(training_tool_id=training_tool_id)
        cmd_res = ''
        user = training_info["owner_name"]
        jupyter_pod_name = kube.find_kuber_item_name(item_list=kube.kube_data.get_pod_list(), training_tool_id=training_tool_id)[0]
    except IndexError as ie:
        return response(status=0, message="Jupyter pod not Running")
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="DB ERROR {}".format(str(e)))

    try:
        # USER_CMD = "jupyter notebook list | grep http"
        # USER_CMD = "jupyter lab list | grep http"
        # user = "root"
        # pod_cmd = 'su - {user} -c "{cmd}"'.format(user=user, cmd=USER_CMD)
        # pod_cmd = '{cmd}'.format(user=user, cmd=USER_CMD)

        port_info = kube.get_service_port(pod_name=jupyter_pod_name)
        node_name = kube.get_pod_node_name(training_tool_id=training_tool_id)
        print("get jupyter_url node_name ", node_name)
        jupyter_ip = kube.get_node_ip(node_name, external=True)
        nginx_port = kube.get_nginx_port(protocol=protocol)
        # if EXTERNAL_HOST_REDIRECT == True:
        #     jupyter_address = jupyter_ip
        # else :
        #     jupyter_address = "{}:{}".format(jupyter_ip, nginx_port)
        
        jupyter_address = get_tool_address(ip=jupyter_ip, port=nginx_port, mode=SERVICE_MODE_INGRESS)
        url = jupyter_url(pod_name=jupyter_pod_name, jupyter_address=jupyter_address, protocol=protocol)
        
        if url is None:
            # URL GET ERROR 
            # GET URL From FILE
            loaded_url = load_url(pod_name=jupyter_pod_name)
            
            if loaded_url is None:
                # LOAD ERROR
                raise Exception("URL GET ERROR(0)")
            else :
                # CHECK URL FROM MY POD
                if is_url_from_same_pod(url=loaded_url, pod_name=jupyter_pod_name) == False:
                    raise Exception("URL GET ERROR(1)")
                
            
            url = transform_url(loaded_url=loaded_url, jupyter_address=jupyter_address, protocol=protocol)
            save_url(pod_name=jupyter_pod_name, url=url)
            print("URL FROM FILE")
        else :
            # URL GET SUCCESS
            # SAVE URL TO FILE
            print(save_url(pod_name=jupyter_pod_name, url=url))
            print("URL FROM CMD")
            
    except Exception as e:
        traceback.print_exc()
        print("KUBE EXEC ", e)
        return response(status=0, message="Jupyter is not running : {}".format(str(e)))
    return response(status=1, result={"url":url})

def get_rstudio_url(training_tool_id, protocol):
    import time
    from utils.kube_setting_cmd import get_jupyter_lab_url_cmd
    """Returns None on failure."""

    try:
        training_info = db.get_training_tool_setting_info(training_tool_id=training_tool_id)
        cmd_res = ''
        user = training_info["owner_name"]
        rstudio_pod_name = kube.find_kuber_item_name(item_list=kube.kube_data.get_pod_list(), training_tool_id=training_tool_id)[0]

    except IndexError as ie:
        return response(status=0, message="Jupyter pod not Running")
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="DB ERROR {}".format(str(e)))

    try:
        
        port_info = kube.get_service_port(service_list=kube.kube_data.get_service_list(),pod_name=rstudio_pod_name)
        node_name = kube.get_pod_node_name(training_tool_id=training_tool_id)
        print("get jupyter_url node_name ", node_name)
        rstudio_ip = kube.get_node_ip(node_name, external=True)
        # nginx_port = kube.get_nginx_port(protocol=protocol)
        node_port = port_info[DEFAULT_RSTUDIO_PORT_NAME]["node_port"]
        # if EXTERNAL_HOST_REDIRECT == True:
        #     rstudio_ip = rstudio_ip
        # else :
        #     rstudio_ip = "{}:{}".format(rstudio_ip, node_port)

        rstudio_address = get_tool_address(ip=rstudio_ip, port=node_port, mode=SERVICE_MODE_NODE_PORT)
        url = "{}://{}/".format(protocol, rstudio_address)

        
    except Exception as e:
        traceback.print_exc()
        print("KUBE EXEC ", e)
        return response(status=0, message="Rstudio is not running : {}".format(str(e)))
    return response(status=1, result={"url":url})

def update_filebrowser_admin_password_by_launch(training_tool_id : int, new_password : str, user_id : str="admin"):
    """
    Description: filebrowser password 강제 변경

    Args:
        training_tool_id (int): tool id
        new_password (str): new password
    """
    pod_name = kube.find_kuber_item_name(item_list=kube.kube_data.get_pod_list(), training_tool_id=training_tool_id)[0]
    host_cmd = "kubectl exec {pod_name} -- /bin/bash -c 'echo {new_password}/{user_id} > {FILEBROWSER_PASSWORD_CHANGE_SCRIPT_PATH}{FILEBROWSER_PASSWORD_CHANGE_LOG_FILE_NAME}'".format(\
        pod_name=pod_name, FILEBROWSER_PASSWORD_CHANGE_SCRIPT_PATH=FILEBROWSER_PASSWORD_CHANGE_SCRIPT_PATH, new_password=new_password, \
            FILEBROWSER_PASSWORD_CHANGE_LOG_FILE_NAME=FILEBROWSER_PASSWORD_CHANGE_LOG_FILE_NAME, \
                user_id=user_id)
    common.launch_on_host(host_cmd)
    result_cmd = "kubectl exec {pod_name} cat {FILEBROWSER_PASSWORD_CHANGE_FAILED_LOG_PATH}".format(pod_name=pod_name, \
        FILEBROWSER_PASSWORD_CHANGE_FAILED_LOG_PATH=FILEBROWSER_PASSWORD_CHANGE_FAILED_LOG_PATH)
    sttr , _ = common.launch_on_host(result_cmd)
    sttr = sttr.strip()
    if sttr:
        raise TrainingToolFilebrowserPasswordChangeError(message=sttr)


def get_filebrowser_url(training_tool_id, protocol, ingress_use : bool = False):
    import time
    from utils.kube_setting_cmd import get_jupyter_lab_url_cmd
    """Returns None on failure."""

    try:
        # training_info = db.get_training_tool_setting_info(training_tool_id=training_tool_id)
        # cmd_res = ''
        # user = training_info["owner_name"]
        filebrowser_pod_name = kube.find_kuber_item_name(item_list=kube.kube_data.get_pod_list(), training_tool_id=training_tool_id)[0]

    except IndexError as ie:
        return response(status=0, message="pod not Running")
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="DB ERROR {}".format(str(e)))

    try:

        port_info = kube.get_service_port(service_list=kube.kube_data.get_service_list(), pod_name=filebrowser_pod_name)
        node_name = kube.get_pod_node_name(training_tool_id=training_tool_id)
        filebrowser_ip = kube.get_node_ip(node_name, external=True)
        nginx_port = None
        node_port = None
        ingress_use = FILEBROWSER_INGRESS_USE
        if ingress_use:
            nginx_port = kube.get_nginx_port(protocol=protocol)
        else:
            node_port = port_info[DEFAULT_FILEBROWSER_PORT_NAME]["node_port"]
        # if EXTERNAL_HOST_REDIRECT == True:
        #     filebrowser_ip = filebrowser_ip
        # else :
        #     filebrowser_ip = "{}:{}".format(filebrowser_ip, node_port)

        filebrowser_address = get_tool_address(ip=filebrowser_ip, port=node_port or nginx_port, mode=SERVICE_MODE_NODE_PORT if node_port else SERVICE_MODE_INGRESS)
        base_url = ""
        if ingress_use:
            flag = FILEBROWSER_FLAG.replace("-","")
            base_url = "{flag}/{pod_name}/".format(flag=flag, pod_name=filebrowser_pod_name)
        url = "{}://{}/{}".format(protocol, filebrowser_address, base_url)

        
    except Exception as e:
        traceback.print_exc()
        print("KUBE EXEC ", e)
        return ""

    return url

def get_filebrowser_url_and_pw_check(training_tool_id, protocol, ingress_use : bool = False):
    url = get_filebrowser_url(training_tool_id=training_tool_id, protocol=protocol, ingress_use=ingress_use)

    training_info = db.get_training_tool_setting_info(training_tool_id=training_tool_id)
    # password 변경 check

    password = common.gen_hash("{}{}".format(training_info["workspace_id"], training_info["id"]))
    jwt_token = get_filebrowser_jwt_token(filebrowser_url=url, admin_id="admin", admin_pw=password)
    if jwt_token:
        # 비번 변경 하지 않은 상태
        return response(status=1, result={"url" : "" , "need_password_change" : True})
    return response(status=1, result={"url": url, "need_password_change" : False})

def get_ssh_login_cmd(training_tool_id, headers_user):

    item_list = kube.find_kuber_item_name(item_list=kube.kube_data.get_pod_list(), training_tool_id=training_tool_id)
    if len(item_list) == 0 :
        return response(status=0, message="Not running")

    pod_name = item_list[0]
    port_info = kube.get_service_port(pod_name=pod_name).get("ssh")
    
    if port_info is None:
        return response(status=0, message="No SSH Port")

    node_name = kube.get_pod_node_name(training_tool_id=training_tool_id)
    tool_ip = kube.get_node_ip(node_name, external=True)

    SSH_LOGIN_CMD = "ssh {user}@{ip} -p {port}".format(user=headers_user, ip=tool_ip, port=port_info["node_port"])
    
    return response(status=1, result=SSH_LOGIN_CMD)



@ns.route("/control_training_tool", methods=["PUT"])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class TrainingToolControl(CustomResource):
    @ns.expect(training_tool_control_put)
    @token_checker
    @training_access_check(training_tool_control_put)
    def put(self):
        args = training_tool_control_put.parse_args()
        training_tool_id = args["training_tool_id"]
        action = args["action"]

        control_result = control_jupyter(training_tool_id=training_tool_id, headers_user=self.check_user(), action=action)
        db.request_logging(self.check_user(), 'trainings/control_jupyter', 'get', str(args), 1)
        return self.send(control_result)

@ns.route("/jupyter_url", methods=["GET"])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class JupyterURL(CustomResource):
    @ns.expect(training_tool_jupyter_url_get_parser)
    @token_checker
    @training_access_check(training_tool_jupyter_url_get_parser)
    def get(self):
        """Gets Jupyter URL including token for browser access."""

        args = training_tool_jupyter_url_get_parser.parse_args()
        training_tool_id = args["training_tool_id"]
        protocol = args["protocol"]

        res = get_jupyter_url(training_tool_id=training_tool_id, protocol=protocol)
        print("JUPYTER URL", res)

        db.request_logging(self.check_user(), 'trainings/jupyter_url', 'get', str(args), res['status'])
        return self.send(res)

@ns.route("/rstudio_url", methods=["GET"])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class RstudioURL(CustomResource):
    @ns.expect(training_tool_jupyter_url_get_parser)
    # @token_checker
    # @training_access_check(training_tool_jupyter_url_get_parser)
    def get(self):
        """Gets Rstudio URL including token for browser access."""

        args = training_tool_jupyter_url_get_parser.parse_args()
        training_tool_id = args["training_tool_id"]
        protocol = args["protocol"]

        res = get_rstudio_url(training_tool_id=training_tool_id, protocol=protocol)
        print("RSTUDIO URL", res)

        db.request_logging(self.check_user(), 'trainings/rstudio_url', 'get', str(args), res['status'])
        return self.send(res)

###################test##########################
put_filebrowser_password_change = api.parser()
put_filebrowser_password_change.add_argument('training_tool_id', type=int, required=True, location='json', help="training_tool_id")
put_filebrowser_password_change.add_argument('protocol', type=str, required=True, location='json', help="protocol")
put_filebrowser_password_change.add_argument('new_password', type=str, required=True, location='json', help="new password")

post_filebrowser_password_change = api.parser()
post_filebrowser_password_change.add_argument('training_tool_id', type=int, required=True, location='json', help="training_tool_id")
post_filebrowser_password_change.add_argument('user_id', type=str, required=False, default="admin", location='json', help="user id default admin")
post_filebrowser_password_change.add_argument('new_password', type=str, required=True, location='json', help="new password")

@ns.route("/filebrowser-pw-change", methods=["GET","PUT", "POST"])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class FilebrowserPasswordChange(CustomResource):

    @token_checker
    def get(self):
        """
            filebrowser admin 비밀번호 변경 모달 정보 조회
            ---
            # return example
                {
                    "result": {
                        "admin" : "admin"
                    },
                    "message": null,
                    "status": 1
                }
               
        """
        try:
            res = response(status=1, result={"admin_id" : "admin"})
            return self.send(res)
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Create Network Group Error : {}".format(e)))

    @ns.expect(put_filebrowser_password_change)
    @token_checker
    def put(self):
        """
            filebrowser admin 비밀번호 변경 API
            ---
            # Input 
                training_tool_id : (int)
                protocol : (str)
                new_password : (str) # 암호화 비밀번호
            ---
            # Input Example
                {
                    "training_tool_id" : 1931,
                    "protocol" : "http",
                    "new_password" : "wqrw!@#$@F%!#%"
                }
            ---
            # Return Example
                # 변경 성공 시
                {
                    "message": "success",
                    "status": 1
                }
                # 이미 변경했다면
                {
                    "message": "success",
                    "status": 1
                }
        """
        args = put_filebrowser_password_change.parse_args()
        try:
            training_tool_id = args["training_tool_id"]
            protocol = args["protocol"]
            #TODO
            #protocol 고도화 작업 해야함
            protocol = "http"
            new_password = args["new_password"]
            # 복호화
            user_password = front_cipher.decrypt(new_password)
            # user_password = new_password
            training_info = db.get_training_tool_setting_info(training_tool_id=training_tool_id)

            jf_password = common.gen_hash("{}{}".format(training_info["workspace_id"], training_info["id"]))
            url = get_filebrowser_url(training_tool_id=training_tool_id, protocol=protocol)
            jwt_token = get_filebrowser_jwt_token(filebrowser_url=url, admin_id="admin", admin_pw=jf_password)
            if jwt_token == "":
                raise TrainingToolFilebrowserAlreadyChange
            update_filebrowser_admin_password_by_launch(training_tool_id=training_tool_id, new_password=user_password)
            # admin_info = get_filebrowser_admin_info(filebrowser_url=url, jwt_token=jwt_token)
            # result = update_filebrowser_admin_password(filebrowser_url=url, jwt_token=jwt_token, update_pw=user_password, admin_data=admin_info)
            # if result.status_code == 200:
            #     return self.send(response(status=1, message="success"))
            # else:
            #     raise Exception("filebrowser response code {}".format(result.status_code))
            return self.send(response(status=1, message="success"))
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Password create error : {}".format(e)))

    @ns.expect(post_filebrowser_password_change)
    @token_checker
    # @training_access_check(post_filebrowser_password_change)
    def post(self):
        """
            admin 사용자가 password를 잊었을 경우 강제로 변경하는 API(해당 학습 owner만 사용가능)
            ---
            # Input 
                training_tool_id : (int)
                user_id : (str) # 사용자가 password 변경할 admin 계정 아이디/ 설정하지 않을 경우 default : "admin"
                new_password : (str) # 암호화 비밀번호
            ---
            # Input Example
                {
                    "training_tool_id" : 1931,
                    "user_id" : "admin123",
                    "new_password" : "wqrw!@#$@F%!#%"
                }
            ---
            # Return Example
                # 변경 성공 시
                {
                    "result": null,
                    "message": "success",
                    "status": 1
                }
                # user id가 존재하지 않을경우
                {
                    "result": null,
                    "message": null,
                    "status": 0,
                    "error": {
                        "code": "004",
                        "location": "training",
                        "message": "Password change Faile because user id wrong(user id)",
                        "options": {}
                    }
                }
        """
        args = post_filebrowser_password_change.parse_args()
        try:
            training_tool_id = args["training_tool_id"]
            user_id = args["user_id"]
            new_password = args["new_password"]
            # 복호화
            user_password = front_cipher.decrypt(new_password)
            # user_password=new_password
            update_filebrowser_admin_password_by_launch(training_tool_id=training_tool_id, new_password=user_password, user_id=user_id)

            return self.send(response(status=1, message="success"))
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Password update error : {}".format(e)))

get_filebrowser_first_entry = api.parser()
get_filebrowser_first_entry.add_argument('training_tool_id', type=int, required=True, location='args', help="training_tool_id")
get_filebrowser_first_entry.add_argument('protocol', type=str, required=True, location='args', help="protocol")

@ns.route("/filebrowser-first-entry", methods=["GET"])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class FilebrowserChecker(CustomResource):
    
    @ns.expect(get_filebrowser_first_entry)
    @token_checker
    def get(self):
        """
            Filebrowser password 재 설정 시 초기 입장인지 확인하기 위한 api
            ---
            # Input 
                training_tool_id : (int)
                protocol : (str)
            ---
            # Input Example
                {
                    "training_tool_id" : 1931,
                    "protocol" : "http"
                }
            ---
            # Return Example
                # 초기입장이 아닐경우
                {
                    "status" : 1,
                    "result" : false
                }
                # 초기 입장일 경우
                {
                    "status" : 1,
                    "result" : true
                }
        """
        args = get_filebrowser_first_entry.parse_args()
        try:
            training_tool_id = args["training_tool_id"]
            protocol = args["protocol"]

            training_info = db.get_training_tool_setting_info(training_tool_id=training_tool_id)

            jf_password = common.gen_hash("{}{}".format(training_info["workspace_id"], training_info["id"]))
            url = get_filebrowser_url(training_tool_id=training_tool_id, protocol=protocol)
            jwt_token = get_filebrowser_jwt_token(filebrowser_url=url, admin_id="admin", admin_pw=jf_password)
            if jwt_token == "":
                result = False
            else:
                result = True
            return self.send(response(status=1, result=result))
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Filebrowser first entry : {}".format(e)))

def get_filebrowser_jwt_token(filebrowser_url : str, admin_id : str, admin_pw : str) -> str:
    params = {
        "password" : admin_pw,
        "recaptcha" : "",
        "username" : admin_id
    }
    result = requests.post(filebrowser_url+"api/login", json=params)
    if result.status_code == 200:
        jwt_token = result.text
        return jwt_token
    elif result.status_code == 403: # 접속 거부 -> id 및 pw 가 올바르지 않음 
        return ""
    else:
        raise Exception("filebrowser url unknown")

# def get_filebrowser_admin_info(filebrowser_url : str, jwt_token : str) -> dict:
#     cookie = {
#         "auth" : jwt_token
#     }
#     headers = {
#         "X-Auth" : jwt_token
#     }
#     result = requests.get(filebrowser_url+"api/users/1", headers=headers, cookies=cookie)
#     user_data = json.loads(result.text)
#     return user_data

# def update_filebrowser_admin_password(filebrowser_url : str, jwt_token : str, update_pw : str, admin_data : dict):
#     admin_data["password"] = "admin123"
#     cookie = {
#         "auth" : jwt_token
#     }
#     headers = {
#         "X-Auth" : jwt_token
#     }
#     param = {
#         "data" : admin_data,
#         "what" : "user",
#         "which" : ["all"]
#     }
#     result = requests.put(filebrowser_url+"api/users/1", headers=headers, cookies=cookie, json=param)
#     return result

################################################

@ns.route("/tool-url", methods=["GET"])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class TOOLURL(CustomResource):
    @ns.expect(training_tool_url_get_parser)
    @token_checker
    @training_access_check(training_tool_url_get_parser)
    def get(self):
        """Gets Tool URL including token for browser access."""

        args = training_tool_url_get_parser.parse_args()
        training_tool_id = args["training_tool_id"]
        protocol = args["protocol"]

        res = get_tool_url(training_tool_id=training_tool_id, protocol=protocol)

        # db.request_logging(self.check_user(), 'trainings/rstudio_url', 'get', str(args), res['status'])
        return self.send(res)


@ns.route("/ssh_login_cmd", methods=["GET"])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class SSHLoginCMD(CustomResource):
    @ns.expect(training_tool_ssh_login_cmd_get_parser)
    @token_checker
    @training_access_check(training_tool_ssh_login_cmd_get_parser)
    def get(self):
        """Gets Jupyter URL including token for browser access."""

        args = training_tool_ssh_login_cmd_get_parser.parse_args()
        training_tool_id = args["training_tool_id"]

        res = get_ssh_login_cmd(training_tool_id=training_tool_id, headers_user=self.check_user())
        print("SSH CMD", res)

        db.request_logging(self.check_user(), 'trainings/ssh_login_cmd', 'get', str(args), res['status'])
        return self.send(res)



################ TOOL CONTROL ################
def get_training_tool_basic_form(data_empty=False, ):
    if data_empty == True:
        basic_form = {
                PORT_INFO_KEY: {},
                RESOURCE_INFO_KEY: {},
                DOCKER_IMAGE_INFO_KEY: {}
            }
    else:
        basic_form = {
            PORT_INFO_KEY: {
                "port_forwarding_info" : None # db.get_training_tool_port_list(training_tool_id=training_tool_info["id"])
            },
            RESOURCE_INFO_KEY: {
                "gpu_count": None, # training_tool_info["gpu_count"],
                "gpu_model": None, # training_tool_info["gpu_model"],
                "node_name": None, # training_tool_info["node_name"],
                "node_name_detail": None # common.parsing_node_name(training_tool_info["node_name"])
            },
            DOCKER_IMAGE_INFO_KEY: {
                "name": None, # training_tool_info["docker_image_name"], 
                "id": None #training_tool_info["docker_image_id"]
            }
        }
    return basic_form

def set_training_tool_type_visible_disable_form(basic_form, training_tool_type, training_tool_status=None):
    def visible_form(training_tool_type, basic_form):
        key_list = TOOL_EDIT_UI_VISIBLE_LIST_BY_TYPE[TOOL_TYPE[training_tool_type]]
        for result_key in basic_form.keys():
            if result_key in key_list:
                basic_form[result_key]["visible"] = True
            else :
                basic_form[result_key]["visible"] = False

    def disable_form(training_tool_type, training_tool_status, basic_form):
        key_list = [DOCKER_IMAGE_INFO_KEY, RESOURCE_INFO_KEY]

        for result_key in basic_form.keys():
            if result_key in key_list:
                if TOOL_TYPE[training_tool_type]==TOOL_EDITOR_KEY:
                    basic_form[result_key]["disable"] = True
                else:
                    basic_form[result_key]["disable"] = training_tool_status in KUBER_RUNNING_STATUS
            else :
                basic_form[result_key]["disable"] = False

    visible_form(training_tool_type=training_tool_type, basic_form=basic_form)
    disable_form(training_tool_type=training_tool_type, training_tool_status=training_tool_status, basic_form=basic_form)

def get_training_tool_by_tool_type(training_tool_type):
    basic_form = get_training_tool_basic_form(data_empty=True)
    set_training_tool_type_visible_disable_form(basic_form=basic_form, training_tool_type=training_tool_type)

    return basic_form

def get_training_tool_by_tool_id(training_tool_id):
    training_tool_info = db.get_training_tool(training_tool_id=training_tool_id)
    if training_tool_info is None:
        raise TrainingItemNotExistError(message="tool")
    basic_form = get_training_tool_basic_form(data_empty=True)

    training_tool_id = training_tool_info["id"]
    training_tool_type = training_tool_info["tool_type"]
    docker_image_name = training_tool_info["docker_image_name"]
    docker_image_id = training_tool_info["docker_image_id"]
    gpu_count = training_tool_info["gpu_count"]
    gpu_model = training_tool_info["gpu_model"]
    node_name = training_tool_info["node_name"]
    node_name_detail = common.parsing_node_name(node_name)
    port_list = db.get_training_tool_port_list(training_tool_id=training_tool_id)


    basic_form[PORT_INFO_KEY].update({
        "port_forwarding_info": port_list
    })
    basic_form[RESOURCE_INFO_KEY].update({
        "gpu_count": gpu_count,
        "gpu_model": gpu_model,
        "node_name": node_name,
        "node_name_detail": node_name_detail
    })
    basic_form[DOCKER_IMAGE_INFO_KEY].update({
        "id": docker_image_id,
        "name": docker_image_name
    })
    training_tool_status = kube.get_training_tool_pod_status(training_tool_id=training_tool_id)["status"]
    set_training_tool_type_visible_disable_form(basic_form=basic_form, training_tool_type=training_tool_type, training_tool_status=training_tool_status)

    return basic_form

def get_training_tool(training_tool_id):
    def visible_form(training_tool_type, result):
        key_list = TOOL_EDIT_UI_VISIBLE_LIST_BY_TYPE[TOOL_TYPE[training_tool_type]]
        for result_key in result.keys():
            if result_key in key_list:
                result[result_key]["visible"] = True
            else :
                result[result_key]["visible"] = False

    def disable_form(training_tool_type, training_tool_status, result):
        key_list = [DOCKER_IMAGE_INFO_KEY, RESOURCE_INFO_KEY]

        for result_key in result.keys():
            if result_key in key_list:
                if TOOL_TYPE[training_tool_type]==TOOL_EDITOR_KEY:
                    result[result_key]["disable"] = True
                else:
                    result[result_key]["disable"] = training_tool_status in KUBER_RUNNING_STATUS
            else :
                result[result_key]["disable"] = False

    try:
        training_tool_info = db.get_training_tool(training_tool_id=training_tool_id)
        if training_tool_info is None:
            return response(status=0, message="Training Tool Not exist.")

        training_tool_id = training_tool_info["id"]
        training_tool_type = training_tool_info["tool_type"]
        docker_image_name = training_tool_info["docker_image_name"]
        docker_image_id = training_tool_info["docker_image_id"]
        gpu_count = training_tool_info["gpu_count"]
        gpu_model = training_tool_info["gpu_model"]
        port_list = db.get_training_tool_port_list(training_tool_id=training_tool_id)
        
        # ui_form = training_tool_edit_ui_form(training_tool_id=training_tool_id, docker_image_name=docker_image_name, docker_image_id=docker_image_id, 
                                            # gpu_count=gpu_count, gpu_model=gpu_model, port_list=port_list)

        # training_tool_edit_ui_visible_form(ui_key_list=TOOL_EDIT_UI_VISIBLE_LIST_BY_TYPE[TOOL_TYPE[training_tool_type]], ui_form=ui_form)

        ui_form = {
            PORT_INFO_KEY: port_info_form(port_list=port_list),
            DOCKER_IMAGE_INFO_KEY: docker_image_info_form(docker_image_name=docker_image_name, docker_image_id=docker_image_id),
            RESOURCE_INFO_KEY: resource_info_form(gpu_count=gpu_count, gpu_model=gpu_model)
        }   
        training_tool_edit_ui_visible_form(ui_key_list=TOOL_EDIT_UI_VISIBLE_LIST_BY_TYPE[TOOL_TYPE[training_tool_type]], ui_form=ui_form)

        training_tool_status = kube.get_training_tool_pod_status(training_tool_id=training_tool_id)["status"]
        
        result = {
            "port_info": {
                "port_forwarding_info" : port_list
            },
            "resource_info": {
                "gpu_count": training_tool_info["gpu_count"],
                "gpu_model": training_tool_info["gpu_model"],
                "node_name": training_tool_info["node_name"],
                "node_name_detail": common.parsing_node_name(training_tool_info["node_name"])
            },
            "docker_image_info": {
                "name": training_tool_info["docker_image_name"], 
                "id": training_tool_info["docker_image_id"]
            }
        }

        visible_form(training_tool_type=training_tool_type, result=result)
        disable_form(training_tool_type=training_tool_type, training_tool_status=training_tool_status, result=result)

        return response(status=1, result_old=ui_form, result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Training tool Get error : {}".format(e))



def get_training_tool_list(training_id):
    from training_job import get_job_progress
    from training_hyperparam import get_hyperparamsearch_progress
    def function_info_list(tool_type):
        type_list = TOOL_DEFAULT_FUNCTION_LIST[TOOL_TYPE[tool_type]]
        f_l = []
        for type_ in type_list:
            f_l.append({"type": type_})
        return f_l

    try:
        result = {
            "queue_tool": [],
            "integrated_tool": [],
            "training_info": {
                "name": None,
                "type": None
            }
        }
        training_info = db.get_training(training_id=training_id)
        pod_list = kube.kube_data.get_pod_list()
        service_list = kube.kube_data.get_service_list()
        training_tool_list = db.get_training_tool_list(training_id=training_id)
        queue_list = scheduler.get_pod_queue()

        image_list = db.get_image_list(None)
        job_list = db.get_job_list(training_id=training_id)
        hps_list = db.get_hyperparamsearch_list(training_id=training_id)

        image_list_dict = common.gen_dict_from_list_by_key(target_list=image_list, id_key="id")

        result["training_info"]["name"] = training_info["training_name"]
        result["training_info"]["type"] = training_info["type"]

        for training_tool_info in training_tool_list:
            #TODO JOB, HPS 또한 TOOL ID를 가지고 있기 때문에 get_training_tool_pod_status에서 같이 처리 할 수 있도록 기능 개발
            # if training_tool_info["tool_type"] == TOOL_JOB_ID:
            #     pod_status = kube.get_training_job_status(training_id=training_id, pod_list=pod_list)
            # else:
            pod_status = kube.get_training_tool_pod_status(training_tool_id=training_tool_info["id"], pod_list=pod_list, queue_list=queue_list)
            pod_image_name = None
            if pod_status["status"] in KUBER_RUNNING_STATUS:
                image_id = kube.get_training_tool_item_labels(training_tool_id=training_tool_info["id"], pod_list=pod_list).get("image_id")
                if image_id and image_list_dict.get(int(image_id)):
                    pod_image_name = image_list_dict.get(int(image_id))[0]["name"]

            pod_resource_info = kube.get_pod_resource_info(training_tool_id=training_tool_info["id"], pod_list=pod_list)
            tool_editor_ports = common.gen_list_from_dict(kube.get_service_port(training_tool_id=training_tool_info["id"], service_list=service_list), "name")
            if pod_resource_info is not None:
                cpu_cores = pod_resource_info["cpu"]
                ram = pod_resource_info["memory"]
                network = pod_resource_info[POD_NETWORK_INTERFACE_LABEL_KEY]
            else :
                cpu_cores = None
                ram = None
                network = None

            info = {
                "training_tool_id": training_tool_info["id"],
                "tool_status": pod_status,
                "tool_type": training_tool_info["tool_type"],
                "tool_type_name": TOOL_TYPE[training_tool_info["tool_type"]],
                "tool_replica_number": training_tool_info["tool_replica_number"],
                "tool_name": training_tool_info["name"] if training_tool_info["name"] is not None else TOOL_TYPE[training_tool_info["tool_type"]],
                "run_env": [
                    # {"tool_replica_number": training_tool_info["tool_replica_number"]},
                    {"docker_image": training_tool_info["image_name"]},
                    {"gpu_model": common.convert_gpu_model(training_tool_info["gpu_model"])},
                    {"gpu_count": training_tool_info["gpu_count"]},
                    {"port_forwarding_info": db.get_training_tool_port_list(training_tool_id=training_tool_info["id"])} # 1234 
                ],
                "running_info": [
                    {"docker_image": pod_image_name }, # TODO 실제 동작 중 Pod의 Docker image ID 와 일치하는 Docker Name을 제공 or labels에 docker image name 저장
                    {"configurations": training_tool_info["configurations"]},
                    {"network": network},
                    {"cpu_cores": cpu_cores},
                    {"ram": ram},
                    {"port_forwarding_info": tool_editor_ports} # ssh  포함 1234 -> 32111
                ],
                "function_info": function_info_list(tool_type=training_tool_info["tool_type"]),
                "on_off_possible": training_tool_info["tool_type"] in TOOL_ON_OFF_POSSIBLE_LIST,
                "start_datetime": training_tool_info["start_datetime"],
                "end_datetime": training_tool_info["end_datetime"]
            }

            if TOOL_BASE[training_tool_info["tool_type"]] == "ui":
                if training_tool_info["tool_type"] == TOOL_JOB_ID:
                    job_progress_info = get_job_progress(training_id=training_id, job_list=job_list, pod_list=pod_list, queue_list=queue_list)
                    info["progress"] = job_progress_info["current_job_status"] 
                    info["queue_progress"] = job_progress_info["queue_job_status"] 
                elif training_tool_info["tool_type"] == TOOL_HPS_ID:
                    hps_progress_info = get_hyperparamsearch_progress(training_id=training_id, hps_list=hps_list, pod_list=pod_list, queue_list=queue_list)
                    info["progress"] = hps_progress_info["current_hps_status"]
                    info["queue_progress"] = hps_progress_info["queue_hps_status"]

                result["queue_tool"].append(info)
            else:
                result["integrated_tool"].append(info)

        return response(status=1, result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Training Tool List get Error : {}".format(e))

def update_training_tool(training_tool_id, gpu_count, gpu_model, node_name, node_name_gpu, node_name_cpu, node_mode, docker_image_id, port_list):
    try:    
        training_tool_info = db.get_training_tool(training_tool_id=training_tool_id)
        if training_tool_info["tool_type"] == TOOL_EDITOR_ID:
            if gpu_count != 0:
                return response(status=0, message="Training Tool [{}] cannot change gpu count.".format(TOOL_EDITOR_KEY))

        node_name = common.combine_node_name(node_name_cpu=node_name_cpu, node_name_gpu=node_name_gpu, node_name=node_name)

        update_training_tool_result = db.update_training_tool(training_tool_id=training_tool_id, gpu_count=gpu_count, gpu_model=gpu_model, docker_image_id=docker_image_id,
                                node_name=node_name, node_mode=node_mode)
        if update_training_tool_result == False:
            return response(status=0, message="Update Training Tool Error ")
        
        update_training_tool_port_result = update_training_tool_port(training_tool_id=training_tool_id, new_port_list=port_list)
        if update_training_tool_port_result == False:
            return response(status=0, message="Update Training Tool Port Error ")

        return response(status=1, message="OK")    
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Training Tool Update Error : {}".format(e))

def training_tool_replica_limit_check(training_id : int, training_tool_type : str, limit_number : int) -> bool:
    tool_list = db.get_training_tool_list(training_id=training_id, tool_type=training_tool_type)
    if len(tool_list) == 0:
        return True
    elif (tool_list[-1]["tool_replica_number"] + 1) >= limit_number :
        return False
    return True

FILEBROWSER_REPLICA_LIMIT = 1

def create_training_tool_replica(training_id, tool_type, gpu_count, gpu_model, node_name, node_name_gpu, node_name_cpu,
                                node_mode, docker_image_id, port_list, set_default):
    try:
        # 2021-12-13 기준 Jupyter만 생성 가능.
        if tool_type not in [TOOL_JUPYTER_ID, TOOL_SSH_ID, TOOL_RSTUDIO_ID, TOOL_FILEBROWSER_ID]:
            return response(status=0, message="Not support Tool type for replica create. Support List : [{}]".format([TOOL_JUPYTER_ID, TOOL_SSH_ID]))

        # Training Exist Check
        training_info = db.get_training(training_id=training_id)
        if training_info is None:
            return response(status=0, message="Not Exist Training.")
            
        if tool_type==TOOL_FILEBROWSER_ID and training_tool_replica_limit_check(training_id=training_id, training_tool_type=TOOL_FILEBROWSER_ID, limit_number=FILEBROWSER_REPLICA_LIMIT) == False:
            raise Exception("filebrowser is no more created")

        tool_list = db.get_training_tool_list(training_id=training_id, tool_type=tool_type)
        if len(tool_list) == 0:
            # First Item - Training은 존재하나 tool이 하나도 없는 경우 (모든 Tool을 삭제 했거나, 옛날 버전)
            next_replica_number = 0
            # return response(status=0, message="Not Exist Training.")
        else:
            # Get Next replica Number (last replica number + 1)
            next_replica_number = tool_list[-1]["tool_replica_number"] + 1

        node_name = common.combine_node_name(node_name_cpu=node_name_cpu, node_name_gpu=node_name_gpu, node_name=node_name)

        # Create Training Tool Replica and set Default Port
        db.insert_training_tool(training_id=training_id, tool_type=tool_type, gpu_count=gpu_count, tool_replica_number=next_replica_number, 
                                gpu_model=gpu_model, node_name=node_name, docker_image_id=docker_image_id)
        training_tool_id = db.get_training_tool(training_id=training_id, tool_type=tool_type, tool_replica_number=next_replica_number)["id"]
        create_training_tool_default_port(training_tool_id=training_tool_id, default_port_list=port_list)

        if set_default == 1:
            db.update_training_set_default(training_id=training_id, gpu_count=gpu_count, gpu_model=gpu_model, node_mode=node_mode, node_name=node_name, docker_image_id=docker_image_id)

        return response(status=1, message="OK")
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Training Tool replica Create error : {}".format(e))

def delete_training_tool_replica(training_tool_id):
    try:
        
        # Training Tool Exist Check
        training_tool_info = db.get_training_tool(training_tool_id=training_tool_id)
        if training_tool_info is None:
            return response(status=0, message="Training Tool not exist.")

        # Replica Number Check (0 = cannot delete) -> 0번이여도 삭제 가능하도록 정책 변경 (2022-09-29 Yeobie)
        # tool_replica_number = ["tool_replica_number"]
        # if training_tool_info["tool_replica_number"] == 0:
        #     return response(status=0, message="Replica number 0 cannot delete.")

        if training_tool_info["tool_type"] in [TOOL_EDITOR_ID, TOOL_JOB_ID, TOOL_HPS_ID]:
            return response(status=0, message="Training Tool - [{},{},{}] Cannot Delete.".format(TOOL_EDITOR_KEY, TOOL_JOB_KEY, TOOL_HPS_KEY))

        # Running Tool Cannot delete
        tool_pod_status = kube.get_training_tool_pod_status(training_tool_id=training_tool_id)
        if tool_pod_status["status"] not in KUBER_NOT_RUNNING_STATUS:
            return response(status=0, message="Training Tool Replica Cannot Delete. status : [{}]".format(tool_pod_status["status"]))

        # Delete.
        delete_result, message = db.delete_training_tool(training_tool_id=training_tool_id)
        if delete_result:
            return response(status=1, message="OK")
        else:
            return response(status=0, message="Training Tool replica delete db error : {}".format(e))

    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Training Tool replica Delete Error : {}".format(e))

@ns.route('/tool', methods=['GET','PUT'])
class TrainingTools(CustomResource):
    @ns.response(200, "Success")
    @ns.response(400, 'Validatissssson Error')
    @ns.expect(training_tool_get)
    @token_checker
    @training_access_check(training_tool_get)
    def get(self):
        """
        Training Tool 목록 조회
        """
        # TEST CASE
        # 권한 없는 유저 - inaccessible
        # 권한 있는 유저 - 정상동작
        # 없는 Training ID 조회 - Item Not Exist.
        args = training_tool_get.parse_args()
        training_id = args["training_id"]
        res = get_training_tool_list(training_id=training_id)
        return self.send(res)

    @ns.expect(training_tool_put)
    @token_checker
    @training_access_check(training_tool_put)
    def put(self):
        """
        Training Tool 수정 API
        ---
        # Input example
            {
                "training_tool_id": 317777,
                "docker_image_id": 1,
                "gpu_count": 0,
                "gpu_model": {"NVIDIA-GeForce-GTX-1080-Ti": ["jf-node-02"]},
                "node_name": {"jf-node-02":{"cpu_cores_limit_per_gpu":2,"ram_limit_per_gpu":2,"cpu_cores_limit_per_pod":10,"ram_limit_per_pod":10}}, # 제거 예정 2022-11-01 Yeobie
                "node_name_cpu": {"jf-node-02": {"cpu_cores_limit_per_pod": 1, "ram_limit_per_pod": 1}, "jf-node-03": {"cpu_cores_limit_per_pod": 1, "ram_limit_per_pod": 1}},
                "node_name_gpu": {"jf-node-02": {"cpu_cores_limit_per_gpu": 1, "ram_limit_per_gpu": 1}, "jf-node-04": {"cpu_cores_limit_per_gpu": 1, "ram_limit_per_gpu": 1}},
                "port_list": [ {"name":"SSH", "target_port":22, "protocol":"TCP", "description":"rer", "node_port": 33333, "status": 1, "service_type": "NodePort", "system_definition":1 },
                {"name":"my-port2", "target_port":122, "protocol":"TCP", "description":"my-port2", "node_port": 31111, "status": 1, "service_type": "NodePort", "system_definition":1 },
                {"name":"my-port3", "target_port":222, "protocol":"TCP", "description":"my-port3", "node_port": 32222, "status": 1, "service_type": "NodePort", "system_definition":1 },
                {"name":"my-port4", "target_port":322, "protocol":"TCP", "description":"my-port4", "node_port": 32211, "status": 0, "service_type": "NodePort", "system_definition":0 }
                ],
                "set_default": 0
            }
        
        # returns
            dict (
                status (int) : 0 = 실패, 1 = 성공 
                result : None 
                message (str) : status = 0 일 때, 담기는 매세지
            )
             
        """
        args = training_tool_put.parse_args()
        training_tool_id = args["training_tool_id"]
        port_list = args["port_list"]
        if port_list is None:
            port_list = []
        gpu_count = args["gpu_count"]
        gpu_model = args["gpu_model"]
        node_name = args["node_name"]
        node_name_gpu = args["node_name_gpu"]
        node_name_cpu = args["node_name_cpu"]
        node_mode = args["node_mode"]
        docker_image_id = args["docker_image_id"]

        res = update_training_tool(training_tool_id=training_tool_id, gpu_count=gpu_count, gpu_model=gpu_model,
                            node_name=node_name, node_name_gpu=node_name_gpu, node_name_cpu=node_name_cpu, node_mode=node_mode, 
                            docker_image_id=docker_image_id, port_list=port_list)

        return self.send(res)

@ns.route('/tool_replica', methods=["POST","DELETE"])
class TrainingToolReplica(CustomResource):
    @ns.expect(training_tool_replica_post)
    @token_checker
    @training_access_check(training_tool_replica_post)
    def post(self):
        """
        Training Tool Repica 생성 API. 
        ---
        # Input example
            # 변경 전
            {
                "training_id": 93,
                "training_tool_type": 4
            }
            # 변경 후 (생성 시 설정 추가)
            {
                "training_id": 93,
                "training_tool_type": 4,
                "docker_image_id": 2,
                "gpu_count":33,
                "gpu_model": {"NVIDIA-GeForce-GTX-1080-Ti":["jf-node-03"], "TEST-GPU":["node1","node2"]},
                "node_name": {"jf-node-02":{"cpu_cores_limit_per_gpu":2,"ram_limit_per_gpu":2,"cpu_cores_limit_per_pod":10,"ram_limit_per_pod":10}}, # 제거 예정 2022-11-01 Yeobie
                "node_name_cpu": {"jf-node-02": {"cpu_cores_limit_per_pod": 1, "ram_limit_per_pod": 1}, "jf-node-03": {"cpu_cores_limit_per_pod": 1, "ram_limit_per_pod": 1}},
                "node_name_gpu": {"jf-node-02": {"cpu_cores_limit_per_gpu": 1, "ram_limit_per_gpu": 1}, "jf-node-04": {"cpu_cores_limit_per_gpu": 1, "ram_limit_per_gpu": 1}},
                "port_list": [ {"name":"SSH", "target_port":22, "protocol":"TCP", "description":"rer", "node_port": 33333, "status": 1, "service_type": "NodePort", "system_definition":1 },
                {"name":"my-port2", "target_port":122, "protocol":"TCP", "description":"my-port2", "node_port": 31111, "status": 1, "service_type": "NodePort", "system_definition":1 },
                {"name":"my-port3", "target_port":222, "protocol":"TCP", "description":"my-port3", "node_port": 32222, "status": 1, "service_type": "NodePort", "system_definition":1 },
                {"name":"my-port4", "target_port":322, "protocol":"TCP", "description":"my-port4", "node_port": 32211, "status": 0, "service_type": "NodePort", "system_definition":0 }
                ],
                "set_default": 0
            }
        
        # returns
            dict (
                status (int) : 0 = 실패, 1 = 성공 
                result : None 
                message (str) : status = 0 일 때, 담기는 매세지
            )
             
        """
        # TEST CASE
        # 권한 없는 유저 접근 시 - 접근 불가
        # 권한 있는 유저 접근 시 - 정상 동작
        # 없는 Training ID - Not Exist 
        # Jupyter 외 Training Tool Type - Not support Tool
        args = training_tool_replica_post.parse_args()
        training_id = args["training_id"]
        training_tool_type = args["training_tool_type"]

        port_list = args["port_list"]
        gpu_count = args["gpu_count"]
        gpu_model = args["gpu_model"]
        node_name = args["node_name"]
        node_name_gpu = args["node_name_gpu"]
        node_name_cpu = args["node_name_cpu"]
        node_mode = args["node_mode"]
        docker_image_id = args["docker_image_id"]
        set_default = args["set_default"]

        res = create_training_tool_replica(training_id=training_id, tool_type=training_tool_type,
                                        gpu_count=gpu_count, gpu_model=gpu_model, node_name=node_name, node_name_gpu=node_name_gpu, node_name_cpu=node_name_cpu,
                                        node_mode=node_mode, docker_image_id=docker_image_id, port_list=port_list, set_default=set_default)

        return self.send(res)

    @ns.expect(training_tool_replica_delete)
    @token_checker
    @training_access_check(training_tool_replica_delete)
    def delete(self):
        # TEST CASE
        # 권한 없는 유저 접근 시 - this training inaccessible
        # 권한 있는 유저 접근 시 - 정상 동작
        # 없는 Training Tool ID - Not exist item.
        # 실행중인 Training Tool 삭제 시     - 이미 동작 중

        args = training_tool_replica_delete.parse_args()
        training_tool_id = args["training_tool_id"]

        res = delete_training_tool_replica(training_tool_id=training_tool_id)

        return self.send(res)


@ns.route('/tool/<int:training_tool_id>', methods=['GET'])
class TrainingTool(CustomResource):
    @token_checker
    def get(self, training_tool_id):
        """ Training Tool 단일 조회 - Tool 편집 시 활용 """
        res = get_training_tool(training_tool_id=training_tool_id)
        return self.send(res)

@ns.route('/tool-info', methods=['GET'])
class TrainingTool2(CustomResource):
    @ns.expect(training_tool_info_get)
    @token_checker
    @training_access_check(training_tool_info_get)
    def get(self):
        """ Training Tool 단일 조회 - Tool 편집 시(training_tool_id) 활용 """

        args = training_tool_info_get.parse_args()
        try:
            training_tool_id = args["training_tool_id"]
            res = get_training_tool_by_tool_id(training_tool_id=training_tool_id)

            return self.send(response(status=1, result=res))
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            return self.send(response(status=0, message="Unknown Error : {}".format(e)))

@ns.route('/tool-type-info', methods=['GET'])
class TrainingToolTypeInfo(CustomResource):
    @ns.expect(training_tool_type_info_get)
    @token_checker
    def get(self):
        """ Tool Type에 대한 정보 조회 """

        args = training_tool_type_info_get.parse_args()
        try:
            training_tool_type = args["training_tool_type"]
            res = get_training_tool_by_tool_type(training_tool_type=training_tool_type)
            return self.send(response(status=1, result=res))
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            return self.send(response(status=0, message="Unknown Error : {}".format(e)))


def training_tool_name_update(training_tool_id, training_tool_name):
    try:
        db.update_training_tool_name(training_tool_id=training_tool_id, training_tool_name=training_tool_name)

        return response(status=1, message="Ok")
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Training Tool name update error : {}".format(e))




@ns.route('/tool/name', methods=['PUT'])
class TrainingToolNameUpdate(CustomResource):
    @ns.expect(training_tool_name_update_parser)
    @token_checker
    @training_access_check(training_tool_name_update_parser)
    def put(self):
        """
            Tool Name 변경용 API
            ---
            # returns
            변경 정상 여부
            
                (dict) :
                {
                    "status" : (int) 0 (실패) | 1 (성공)
                    "message" : (str) Error message | OK
                }

        """
        args = training_tool_name_update_parser.parse_args()
        training_tool_id = args["training_tool_id"]
        training_tool_name = args["training_tool_name"]
        res = training_tool_name_update(training_tool_id=training_tool_id, training_tool_name=training_tool_name)
        return self.send(res)
