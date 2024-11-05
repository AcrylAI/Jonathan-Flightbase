from datetime import datetime, time
from functools import reduce
from itertools import permutations
import os
from platform import node
import stat
from utils.resource import CustomResource, token_checker
from flask_restplus import reqparse, Resource
import requests
import json
import kubernetes
import traceback
import threading

from restplus import api
import utils.db as db
from utils import common
from utils import kube
from utils import kube_network_attachment_definitions as kube_nad
from utils.resource import response
from settings import JF_WORKER_PORT, NODE_DB_IP_AUTO_CHAGE_TO_KUBER_INTERNAL_IP
from settings import CPU_POD_RUN_ON_ONLY_CPU_NODES, CPU_NODES, NO_USE_NODES
from settings import GPU_HISTORY_DATA, CPU_HISTORY_DATA, RAM_HISTORY_DATA
from TYPE import *
from utils.access_check import admin_access_check
from lock import jf_resource_log_lock
JF_WORKER_PORT = common.get_args().jf_worker_port if common.get_args().jf_worker_port is not None else JF_WORKER_PORT

HISTORY_LENGTH = 300 # 3600 * 24

# kubernetes.config.load_kube_config()
# coreV1Api = kubernetes.client.CoreV1Api()
# jf_ip = '192.168.1.14'

ns = api.namespace('nodes', description='노드 관련 API')

node_parser_get = api.parser()
node_parser_get.add_argument('server_type', type=str, required=False, default="gpu",location='args', help='server type = "cpu" "gpu" "storage" ' )

node_parser_post = api.parser()
node_parser_post.add_argument('ip', type=str, required=True, location='json', help='node ip' )
node_parser_post.add_argument('interface_1g', type=str, required=False, location='json', help='For 1G' )
node_parser_post.add_argument('interface_10g', type=str, required=False, location='json', help='For 10G' )
node_parser_post.add_argument('interface_ib', type=str, required=False, location='json', help='For ib' )
node_parser_post.add_argument('interfaces', type=list, required=True, location='json', help='Nodes all interfaces')
node_parser_post.add_argument(NODE_IS_CPU_SERVER_KEY, type=int, default=1, required=False, location='json', help='0 = False, 1 = True' )
node_parser_post.add_argument(NODE_IS_GPU_SERVER_KEY, type=int, default=1, required=False, location='json', help='0 = False, 1 = True' )
node_parser_post.add_argument(NODE_IS_NO_USE_SERVER_KEY, type=int, default=0, required=False, location='json', help='0 = False, 1 = True' )
node_parser_post.add_argument(NODE_CPU_LIMIT_PER_POD_DB_KEY, type=float, default=None, required=False, location='json', help='0.00 ~ MAX cores' )
node_parser_post.add_argument(NODE_CPU_CORE_LOCK_PER_POD_DB_KEY, type=int, default=0, required=False, location='json', help='0 = unlock | 1 = lock' )
node_parser_post.add_argument(NODE_CPU_CORE_LOCK_PERCENT_PER_POD_DB_KEY, type=int, default=100, required=False, location='json', help='lock On 이더라도 lock 허용치 0 ~ n %')
node_parser_post.add_argument(NODE_CPU_LIMIT_PER_GPU_DB_KEY, type=float, default=None, required=False, location='json', help='0.00 ~ MAX cores' )
node_parser_post.add_argument(NODE_CPU_CORE_LOCK_PER_GPU_DB_KEY, type=int, default=0, required=False, location='json', help='0 = unlock | 1 = lock' )
node_parser_post.add_argument(NODE_CPU_CORE_LOCK_PERCENT_PER_GPU_DB_KEY, type=int, default=100, required=False, location='json', help='lock On 이더라도 lock 허용치 0 ~ n %' )
node_parser_post.add_argument(NODE_MEMORY_LIMIT_PER_POD_DB_KEY, type=str, default=None, required=False, location='json', help='XXXGi' )
node_parser_post.add_argument(NODE_MEMORY_LOCK_PER_POD_DB_KEY, type=int, default=0, required=False, location='json', help='0 = unlock | 1 = lock' )
node_parser_post.add_argument(NODE_MEMORY_LOCK_PERCENT_PER_POD_DB_KEY, type=int, default=100, required=False, location='json', help='lock On 이더라도 lock 허용치 0 ~ n %' )
node_parser_post.add_argument(NODE_MEMORY_LIMIT_PER_GPU_DB_KEY, type=str, default=None, required=False, location='json', help='XXXGi' )
node_parser_post.add_argument(NODE_MEMORY_LOCK_PER_GPU_DB_KEY, type=int, default=0, required=False, location='json', help='0 = unlock | 1 = lock' )
node_parser_post.add_argument(NODE_MEMORY_LOCK_PERCENT_PER_GPU_DB_KEY, type=int, default=100, required=False, location='json', help='lock On 이더라도 lock 허용치 0 ~ n %' )
node_parser_post.add_argument('ephemeral_storage_limit', type=str, default=None, required=False, location='json', help='XXXGi' )

node_parser_put = api.parser()
node_parser_put.add_argument('id', type=int, required=True, location='json', help='node id' )
node_parser_put.add_argument('interface_1g', type=str, required=False, location='json', help='For 1G' )
node_parser_put.add_argument('interface_10g', type=str, required=False, location='json', help='For 10G' )
node_parser_put.add_argument('interface_ib', type=str, required=False, location='json', help='For ib' )
node_parser_put.add_argument('interfaces', type=list, required=True, location='json', help='Nodes all interfaces')
node_parser_put.add_argument(NODE_IS_CPU_SERVER_KEY, type=int, default=1, required=False, location='json', help='0 = False, 1 = True' )
node_parser_put.add_argument(NODE_IS_GPU_SERVER_KEY, type=int, default=1, required=False, location='json', help='0 = False, 1 = True' )
node_parser_put.add_argument(NODE_IS_NO_USE_SERVER_KEY, type=int, default=0, required=False, location='json', help='0 = False, 1 = True' )
node_parser_put.add_argument(NODE_CPU_LIMIT_PER_POD_DB_KEY, type=float, default=None, required=False, location='json', help='0.00 ~ MAX cores' )
node_parser_put.add_argument(NODE_CPU_CORE_LOCK_PER_POD_DB_KEY, type=int, default=0, required=False, location='json', help='0 = unlock | 1 = lock' )
node_parser_put.add_argument(NODE_CPU_CORE_LOCK_PERCENT_PER_POD_DB_KEY, type=int, default=100, required=False, location='json', help='lock On 이더라도 lock 허용치 0 ~ n %')
node_parser_put.add_argument(NODE_CPU_LIMIT_PER_GPU_DB_KEY, type=float, default=None, required=False, location='json', help='0.00 ~ MAX cores' )
node_parser_put.add_argument(NODE_CPU_CORE_LOCK_PER_GPU_DB_KEY, type=int, default=0, required=False, location='json', help='0 = unlock | 1 = lock' )
node_parser_put.add_argument(NODE_CPU_CORE_LOCK_PERCENT_PER_GPU_DB_KEY, type=int, default=100, required=False, location='json', help='lock On 이더라도 lock 허용치 0 ~ n %' )
node_parser_put.add_argument(NODE_MEMORY_LIMIT_PER_POD_DB_KEY, type=str, default=None, required=False, location='json', help='XXXGi' )
node_parser_put.add_argument(NODE_MEMORY_LOCK_PER_POD_DB_KEY, type=int, default=0, required=False, location='json', help='0 = unlock | 1 = lock' )
node_parser_put.add_argument(NODE_MEMORY_LOCK_PERCENT_PER_POD_DB_KEY, type=int, default=100, required=False, location='json', help='lock On 이더라도 lock 허용치 0 ~ n %' )
node_parser_put.add_argument(NODE_MEMORY_LIMIT_PER_GPU_DB_KEY, type=str, default=None, required=False, location='json', help='XXXGi' )
node_parser_put.add_argument(NODE_MEMORY_LOCK_PER_GPU_DB_KEY, type=int, default=0, required=False, location='json', help='0 = unlock | 1 = lock' )
node_parser_put.add_argument(NODE_MEMORY_LOCK_PERCENT_PER_GPU_DB_KEY, type=int, default=100, required=False, location='json', help='lock On 이더라도 lock 허용치 0 ~ n %' )
node_parser_put.add_argument('ephemeral_storage_limit', type=str, default=None, required=False, location='json', help='XXXGi' )

node_parser_delete = api.parser()
node_parser_delete.add_argument('id', type=int, required=True, location='json', help='node id' )


node_attach = api.parser()
node_attach.add_argument('node_id', type=int, required=True, location='args', help='node id' )

node_detach = api.parser()
node_detach.add_argument('node_id', type=int, required=True, location='args', help='node ip' )

node_network_interface_get = api.parser()
node_network_interface_get.add_argument('ip', type=str, required=True, location='args', help='node ip' )

node_device_info_get = api.parser()
node_device_info_get.add_argument('ip', type=str, required=True, location='args', help='node ip' )


node_integrated_info_get = api.parser()
node_integrated_info_get.add_argument('ip', type=str, required=True, location='args', help='node ip' )

node_resource_info_get = api.parser()
node_resource_info_get.add_argument('resource_type', type=str, required=True, location='args', help='cpu | ram | gpu (not yet)' )

def init_node_all():
    common.run_func_with_print_line(func=init_node_ip, line_message="INIT NODE IP")
    common.run_func_with_print_line(func=init_node_name, line_message="INIT NODE NAME")
    common.run_func_with_print_line(func=init_cpu_gpu_nodes, line_message="INIT CPU GPU NODES SETTING")
    common.run_func_with_print_line(func=init_node_gpu_cpu_model_label_setting, line_message="INIT NODE CPU GPU MODEL LABEL SETTING")
    common.run_func_with_print_line(func=kube_nad.update_network_attachment_definitions, line_message="INIT NODE NETWORK ATTACHMENT DEFINITION SETTING")

def init_node_ip():
    # NODE_DB_IP_AUTO_CHAGE_TO_KUBER_INTERNAL_IP
    print("NODE_DB_IP_AUTO_CHAGE_TO_KUBER_INTERNAL_IP = [{}]".format(NODE_DB_IP_AUTO_CHAGE_TO_KUBER_INTERNAL_IP))
    node_list = db.get_node_list()
    kube_node_list = kube.get_list_node()
    for node in node_list:
        node_id = node["id"]
        node_ip = node["ip"]
        node_name = node["name"]
        kuber_node_internal_ip = kube.get_node_ip(node_name=node_name.lower(), node_list=kube_node_list)
        if node_ip != kuber_node_internal_ip and kuber_node_internal_ip is not None:
            print("NODE [{}] DB NODE IP [{}] != KUBER INTERNAL IP [{}] - ".format(node_name, node_ip, kuber_node_internal_ip), end=" ")
            if NODE_DB_IP_AUTO_CHAGE_TO_KUBER_INTERNAL_IP:
                print("NODE [{}] IP changed TO Kuber IP.".format(node_name))
                db.update_node_ip(node_id=node_id, node_ip=kuber_node_internal_ip)
            else: 
                print("NODE [{}] IP change skip.".format(node_name))
            print("\n")

def init_node_name():
    # NODE_DB_NAME_AUTO_CHAGE_TO_KUBER_NODE_NAME
    print("NODE_DB_NAME_AUTO_CHAGE_TO_KUBER_NODE_NAME = [{}]".format(NODE_DB_NAME_AUTO_CHAGE_TO_KUBER_NODE_NAME))
    node_list = db.get_node_list()
    kube_node_list = kube.get_list_node()
    for node in node_list:
        node_id = node["id"]
        node_ip = node["ip"]
        node_name = node["name"]
        kube_node_name = kube.get_node_host_name(ip=node_ip, node_list=kube_node_list)
        if node_name != kube_node_name and kube_node_name is not None:
            print("DB NODE NAME != KUBER NODE NAME ", node_name, kube_node_name)
            if NODE_DB_NAME_AUTO_CHAGE_TO_KUBER_NODE_NAME:
                db.update_node_name(node_id=node_id, node_name=kube_node_name)
                node["name"] = kube_node_name
                node_name = kube_node_name


def is_cpu_pod_run_on_only_cpu_nodes():
    from settings import CPU_POD_RUN_ON_ONLY_CPU_NODES
    # if this func True => kube.create @@ use nodeSelector {"cpu_worker": True}
    return CPU_POD_RUN_ON_ONLY_CPU_NODES
    

def get_cpu_worker_nodes():
    # if CPU_NODES is None or CPU_NODES == "":
    #     return []
    # return CPU_NODES.split(",")
    CPU_NODES = [ node["node_name"] for node in db.get_node_cpu_worker_list()]
    return CPU_NODES

def get_gpu_worker_nodes():
    # if CPU_NODES is None or CPU_NODES == "":
    #     return []
    # return CPU_NODES.split(",")
    GPU_NODES = [ node["node_name"] for node in db.get_node_gpu_worker_list()]
    return GPU_NODES



def get_no_use_nodes():
    # from settings import CPU_POD_RUN_ON_ONLY_CPU_NODES, CPU_NODES
    # if NO_USE_NODES is None or NO_USE_NODES == "":
    #     return []
    # return NO_USE_NODES.split(",")
    NO_USE_NODES = [ node["node_name"] for node in db.get_node_no_use_worker_list()]
    return NO_USE_NODES
    
def init_cpu_gpu_nodes():
    from utils.kube import get_select_node_gpu_info_list, set_node_labels
    # from all nodes setting labels
    # not in cpu nodes "cpu_worker": None, else "cpu_worker" : True
    # 
    # if is_cpu_pod_run_on_only_cpu_nodes == True:
    # print("CPU MODE - POD RUN ON CPU NODES MODE : ", is_cpu_pod_run_on_only_cpu_nodes())
    print("CPU GPU NODE SETTING - KUBER NODES : ", get_select_node_gpu_info_list(_init=True))
    print("CPU GPU NODE SETTING - CPU WORKER NODES : ",  get_cpu_worker_nodes())
    print("CPU GPU NODE SETTING - GPU WORKER NODES : ",  get_gpu_worker_nodes())
    print("CPU GPU NODE SETTING - NO USE NODES : ", get_no_use_nodes())
    for node_info in get_select_node_gpu_info_list(_init=True):
        labels = {
            'cpu_worker_node': None,
            'jfb/cpu_worker_node': None,
            'jfb/gpu_worker_node': None,
            CPU_WORKER_NODE_LABEL_KEY: None,
            GPU_WORKER_NODE_LABEL_KEY: None
        }
        if node_info["name"] in get_cpu_worker_nodes() or node_info["ip"] in get_cpu_worker_nodes():
            labels[CPU_WORKER_NODE_LABEL_KEY] =  True
            print("CPU WORKER NODE - ", node_info["name"])

        if node_info["name"] in get_gpu_worker_nodes() or node_info["ip"] in get_gpu_worker_nodes():
            labels[GPU_WORKER_NODE_LABEL_KEY] =  True
            print("GPU WORKER NODE - ", node_info["name"])
        
        if node_info["name"] in get_no_use_nodes() or node_info["ip"] in get_no_use_nodes():
            labels[CPU_WORKER_NODE_LABEL_KEY] = None
            labels[GPU_WORKER_NODE_LABEL_KEY] = None
            print("NO USE NODE - ", node_info["name"])
        set_node_labels(node_name=node_info["name"], labels=labels)


def init_node_gpu_cpu_model_label_setting():
    from utils.kube import get_list_node, set_node_labels
    from utils.kube_parser import parsing_node_list, parsing_node_ip
    print("---- NODE CPU GPU MODEL LABEL INIT ----")
    node_list = parsing_node_list(get_list_node())
    for node in node_list:
        node_gpu_label_setting(parsing_node_ip(node))
        node_cpu_label_setting(parsing_node_ip(node))



def node_gpu_label_setting(ip):
    from utils.kube import set_node_labels

    node_info = db.get_node_using_ip(ip=ip)
    if node_info is not None:
        # FROM DB
        if node_info["gpu_count"] != 0:
            # GPU SERVER
            node_gpu_list = db.get_node_gpu_list(node_id=node_info["id"])

            node_gpu_model = None 
            node_gpu_memory = None
            node_gpu_cuda_cores = None
            node_gpu_computer_capability = None
            node_gpu_architecture = None
            for node_gpu in node_gpu_list:
                if node_gpu["num"] == 0:
                    node_gpu_model = node_gpu["model"]
                    node_gpu_memory = node_gpu["memory"]
                    node_gpu_cuda_cores = node_gpu["cuda_cores"]
                    node_gpu_computer_capability = node_gpu["computer_capability"]
                    node_gpu_architecture = node_gpu["architecture"]

                if node_gpu_model == node_gpu["model"] and node_gpu["mig_mode"] != "Enabled":
                    node_gpu_memory = node_gpu["memory"]

            set_node_labels(node_name=node_info["name"], labels={
                GPU_MODEL_LABEL_KEY: node_gpu_model,
                GPU_MEMORY_LABEL_KEY: node_gpu_memory,
                GPU_CUDA_LABEL_KEY: node_gpu_cuda_cores,
                GPU_COMPUTER_CAPABILITY_LABEL_KEY: node_gpu_computer_capability,
                GPU_ARCHITECTURE_LABEL_KEY: node_gpu_architecture
            })
            print("NODE GPU INIT(DB) : ", node_info["name"], node_gpu_model)
        else :
            # CPU SERVER
            set_node_labels(node_name=node_info["name"], labels={
                    GPU_MODEL_LABEL_KEY: None,
                    GPU_MEMORY_LABEL_KEY: None,
                    GPU_CUDA_LABEL_KEY: None,
                    GPU_COMPUTER_CAPABILITY_LABEL_KEY: None,
                    GPU_ARCHITECTURE_LABEL_KEY: None
                })
            print("NODE NO GPU INIT(DB) : ", node_info["name"])

    else :
        # FROM WORKER
        get_status, device_info = common.get_worker_device_info(ip)
        # res = requests.get('http://{}:{}/worker/device_info'.format(ip, JF_WORKER_PORT))
        if get_status == True:
            system_info = device_info['system_info']
            name = system_info["node_name"]
            gpu_info = device_info['gpu_info']
            gpu_list = gpu_info["gpu_list"]
            
            node_gpu_model = None 
            node_gpu_memory = None
            node_gpu_cuda_cores = None
            node_gpu_computer_capability = None
            node_gpu_architecture = None
            if len(gpu_list) > 0:
                for gpu in gpu_list:
                    num = gpu.get("num")
                    model = gpu.get("model")
                    memory = gpu.get("mem_total")
                    cuda_cores = gpu.get("cuda_cores")
                    computer_capability = gpu.get("computer_capability")
                    architecture = gpu.get("architecture")
                    if num == 0 :
                        node_gpu_model = model
                        node_gpu_memory = memory
                        node_gpu_cuda_cores = cuda_cores
                        node_gpu_computer_capability = computer_capability
                        node_gpu_architecture = architecture


                    if node_gpu_model == model and gpu.get("mig_mode") != "Enabled":
                        node_gpu_memory = gpu.get("mem_total")

                set_node_labels(node_name=name, labels={
                    GPU_MODEL_LABEL_KEY: node_gpu_model,
                    GPU_MEMORY_LABEL_KEY: node_gpu_memory,
                    GPU_CUDA_LABEL_KEY: node_gpu_cuda_cores,
                    GPU_COMPUTER_CAPABILITY_LABEL_KEY: node_gpu_computer_capability,
                    GPU_ARCHITECTURE_LABEL_KEY: node_gpu_architecture
                })
                print("NODE GPU INIT(WORKER) : ", name, node_gpu_model)

            else:
                set_node_labels(node_name=name, labels={
                    GPU_MODEL_LABEL_KEY: None,
                    GPU_MEMORY_LABEL_KEY: None,
                    GPU_CUDA_LABEL_KEY: None,
                    GPU_COMPUTER_CAPABILITY_LABEL_KEY: None,
                    GPU_ARCHITECTURE_LABEL_KEY: None
                })
                print("NODE NO GPU INIT(WORKER) : ", name, None)

def node_cpu_label_setting(ip):
    from utils.kube import set_node_labels

    node_info = db.get_node_using_ip(ip=ip)
    if node_info is not None:
        cpu = node_info["cpu"]
        set_node_labels(node_name=node_info["name"], labels={
            CPU_MODEL_LABEL_KEY: cpu
            })
        print("NODE CPU INIT(DB) : ", node_info["name"])

    else :
        get_status, device_info = common.get_worker_device_info(ip)
        # res = requests.get('http://{}:{}/worker/device_info'.format(ip, JF_WORKER_PORT))
        if get_status == True:
            system_info = device_info['system_info']
            name = system_info["node_name"]
            cpu = system_info["cpu"]
                        
            set_node_labels(node_name=name, labels={
                CPU_MODEL_LABEL_KEY: cpu
                })
            print("NODE GPU INIT(WORKER) : ", name, cpu)

def device_info_to_db(ip, interfaces=None, node_options=None):
    if interfaces is None:
        interfaces = []
    if node_options is None:
        node_options = {}

    get_status, device_info = common.get_worker_device_info(ip=ip)
    if get_status == True:
        db.insert_node_from_device_info(ip=ip, device_info=device_info)
        node_id = db.get_node_using_ip(ip=ip)["id"]
        db.insert_node_gpu_from_device_info(node_id=node_id, device_info=device_info)
    
    db.insert_node_interface(node_id=node_id, interfaces=interfaces)

    if len(node_options) > 0:
        db.update_node_options(node_id=node_id, options=node_options)

def add_kuber_node(ip, interfaces, user, node_options=None): 
    try:       
        if node_options is None:
            node_options = {}

        node_check = db.get_node_using_ip(ip=ip)
        if node_check is not None and len(node_check) > 0:
            return response(status=0, message = "Already Added Node {}".format(ip))

        device_info_to_db(ip=ip, interfaces=interfaces, node_options=node_options)
                # print(gpu_ea)
        return response(status=1, message="Add [{}] Node to list".format(ip))
    except Exception as e:
        traceback.print_exc()
        return response(status = 0, message = "Failed add node")
        #return response(status = 0, message = "Failed add node : " + str(e))

def update_kuber_node(node_id, interfaces, node_options, user): 
    try:       
        message = ""
        insert_result = True
        delete_result = True
        option_result, option_message = db.update_node_options(node_id=node_id, options=node_options)
        if option_result == False:
            return response(status=0, message="Option update error : {}".format(option_message))

        node_interfaces = db.get_node_interface(node_id=node_id)
        cur_node_interfaces = [interface["interface"] for interface in node_interfaces ]
        add_interfaces = list(set(interfaces) - set(cur_node_interfaces))
        del_interfaces = list(set(cur_node_interfaces) - set(interfaces))
        if len(add_interfaces) > 0:
            insert_result, message = db.insert_node_interface(node_id=node_id, interfaces=add_interfaces)
            message+= "\n " + message
        if len(del_interfaces) > 0:
            delete_result, message = db.delete_node_interface(node_id=node_id, interfaces=del_interfaces)
            message+= "\n " + message

        return response(status=1, message="Updated")
        # if result and insert_result and delete_result:
        #     return response(status=1, message="Updated")
        # else:
        #     return response(status=0, message="DB Update Fail")
            #return response(status=0, message="DB Update Fail {}".format(message))
    except Exception as e:
        traceback.print_exc()
        return response(status = 0, message = "Failed Update node")
        #return response(status = 0, message = "Failed Update node : " + str(e))

def delete_kuber_node(node_list, user_name, headers):    
    # kubernetes.client.CoreV1Api()
    node_status = kube.get_node_status_list()
    message = ''
    node_list = node_list.split(',')
    for node_ip in node_list:        
        try:
            db.delete_node(ip=node_ip)
            node_name = kube.get_node_host_name(node_ip)
            select_node_status = node_status[node_ip]
            if select_node_status["is_master"]:
                message += "{} is Master Node Cannot Delete ".format(node_name)
                continue
            kube.coreV1Api.delete_node(name=node_name)
            res = detach_requests(node_ip, headers)
            # res = requests.get('http://{}:{}/worker/remove_node'.format(node_ip, JF_WORKER_PORT))
            # res = json.loads(res.text)
            #message += res["message"]+"\n"
            # if res["status"] == 1:


        except Exception as e:
            message += "{} remove error\n".format(node_name)
            #message += "{} remove error:{}\n".format(node_name,e)
    return response(status=1, message = message)

def check_node_have_inifni():
    node_status = kube.get_node_status_list()
    node_list = db.get_node_list()
    for node in node_list:
        node_ip = node["ip"]
        if node_ip in node_status.keys():
            if node[INTERFACE_IB_KEY] != None:
                return True

    return False

def get_system_info_form_from_db(node_info=None, node_id=None, node_ip=None):
    # node_info from db.get_node_list
    #From Worker Data
    if node_info is None:
        node_info = db.get_node(node_id=node_id, node_ip=node_ip)

    db_system_info = {
        "cpu": node_info.get("cpu"),
        "cpu_cores": node_info.get("cpu_cores"),
        "os": node_info.get("os"),
        "ram": node_info.get("ram"),
        "driver_version": node_info.get("driver_version")
    }
    return db_system_info

def get_gpu_list_form_from_db(gpu_list=None, node_id=None):
    # node_info from db.get_node_list
    # node_gpu_list = db.get_node_gpu_list()
    if gpu_list is None:
        gpu_list = db.get_node_gpu_list(node_id=node_id)

    db_gpu_list = []
    for gpu_info in gpu_list:
        db_gpu_list.append({
            "num": gpu_info.get("num"),
            "architecture": gpu_info.get("architecture"),
            "computer_capability": gpu_info.get("computer_capability"),
            "cuda_cores": gpu_info.get("cuda_cores"),
            "model": gpu_info.get("model"),
            "nvlink": gpu_info.get("nvlink"),
            "memory": gpu_info.get("memory"),
            "mig_mode": gpu_info.get("mig_mode"),
            "mig_list": [ mig_gpu["instance"] for mig_gpu in db.get_node_mig_gpu(node_gpu_id=gpu_info["id"]) ]
        })
    return db_gpu_list

def get_worker_system_info_from_device_info(device_info):
    try:
        worker_res_system_info = device_info['system_info']
        worker_system_info ={
            "cpu": worker_res_system_info.get("cpu"),
            "cpu_cores": worker_res_system_info.get("cpu_cores"),
            "os": worker_res_system_info.get("os"),
            "ram": str(round(int(worker_res_system_info.get("ram")) / (1024 * 1024), 2)) + " GB" ,         # TODO 특정 함수로 GB -> Byte or Byte -> GB 할 수 있도록
            "driver_version": worker_res_system_info.get("driver_version")
        }
    except Exception as e:
        worker_system_info = {
            "cpu": "Worker Error",
            "cpu_cores": "Worker Error",
            "os": "Worker Error",
            "ram": "Worker Error",
            "driver_version": "Worker Error"               
        }
        traceback.print_exc()


    return worker_system_info

def get_worker_gpu_list_from_device_info(device_info):
    try:
        worker_gpu_list = []
        for gpu_info_ in device_info['gpu_info']['gpu_list']:
            worker_gpu_list.append({
                "num": gpu_info_["num"],
                "architecture": gpu_info_.get("architecture"),
                "computer_capability": gpu_info_.get("computer_capability"),
                "cuda_cores": gpu_info_.get("cuda_cores"),
                "model": gpu_info_.get("model"),
                "nvlink": gpu_info_.get("nvlink"),
                "memory": gpu_info_.get("mem_total"),
                "mig_mode": gpu_info_.get("mig_mode"),
                "mig_list": gpu_info_.get("mig_list")
            })
    except Exception as e:
        worker_gpu_list = [{
            "num": "0",
            "architecture": "Worker Error",
            "computer_capability": "Worker Error",
            "cuda_cores": "Worker Error",
            "model": "Worker Error",
            "nvlink": "Worker Error",
            "memory": "Worker Error",
            "mig_mode": "Worker Error",
            "mig_list": []
        }]
        traceback.print_exc()

    return worker_gpu_list

def get_general_and_mig_gpu_count(gpu_list):
    general_gpu_count = len(gpu_list)
    mig_gpu_count = 0
    for gpu in gpu_list:
        if gpu.get("mig_mode") == "Enabled":
            general_gpu_count -= 1
        
        if gpu.get("mig_list") is not None:
            mig_gpu_count += len(gpu.get("mig_list"))

    return general_gpu_count, mig_gpu_count

def update_node_info(node, db_system_info=None, db_gpu_list=None):
    worker_system_info = {
            "cpu": "Worker Error",
            "cpu_cores": "worker Error",
            "os": "Worker Error",
            "ram": "Worker Error",
            "driver_version": "Worker Error"               
        }
    worker_gpu_list = [{
                    "num": "0",
                    "architecture": "Worker Error",
                    "computer_capability": "Worker Error",
                    "cuda_cores": "Worker Error",
                    "model": "Worker Error",
                    "nvlink": "Worker Error",
                    "memory": "Worker Error",
                    "mig_mode": "Worker Error",
                    "mig_list": []
                }]
    try:
        if db_system_info is None:
            db_system_info = get_system_info_form_from_db(node_info=node)
        if db_gpu_list is None:
            db_gpu_list = get_gpu_list_form_from_db(node_id=node["id"])

        node_ip = node["ip"]
        get_status, device_info = common.get_worker_device_info(ip=node_ip)
        if get_status == True:
            worker_system_info = get_worker_system_info_from_device_info(device_info)
            worker_gpu_list = get_worker_gpu_list_from_device_info(device_info)

            # Compare DB and Worker Data
            gpu_comp_result = {}
            system_comp_result = common.dict_comp(base_dict=worker_system_info, target_dict=db_system_info)
            if len(worker_gpu_list) == len(db_gpu_list):
                for i in range(len(worker_gpu_list)):
                    # gpu_comp_result = common.dict_comp(base_dict=worker_gpu_list[i], target_dict=db_gpu_list[i], ignore_key_list=["mig_mode", "mig_list"])
                    gpu_comp_result = common.dict_comp(base_dict=worker_gpu_list[i], target_dict=db_gpu_list[i])
                    if gpu_comp_result == False:
                        break
            else :
                gpu_comp_result = False

            if len(worker_gpu_list) != len(db_gpu_list) or system_comp_result == False or gpu_comp_result == False:
                print("UPDATE!!!", system_comp_result, gpu_comp_result)
                # DB update Data
                db.update_node_auto(node_id=node["id"], name=node["name"], os=worker_system_info["os"], 
                                cpu=worker_system_info["cpu"], cpu_cores=worker_system_info["cpu_cores"],
                                ram=worker_system_info["ram"], driver_version=worker_system_info["driver_version"], 
                                gpu_count=len(worker_gpu_list))
                db.delete_node_gpu(node_id=node["id"])
                db.insert_node_gpu_from_gpu_list(node_id=node["id"], gpu_list=worker_gpu_list)

        
        get_status, worker_network_interfaces = common.get_worker_network_interfaces(ip=node_ip)
        if get_status == True:
            db_node_interface_list = [ interface["interface"] for interface in db.get_node_interface(node["id"])]
            add_item_list, del_item_list = common.get_add_del_item_list(worker_network_interfaces, db_node_interface_list)
            if len(add_item_list) > 0:
                db.insert_node_interface(node["id"], interfaces=add_item_list)
            if len(del_item_list) > 0:
                db.delete_node_interface(node["id"], interfaces=del_item_list)


    except requests.exceptions.ConnectionError as ce:
        print("WORKER CONNECT ERROR ")
        pass
    except :
        traceback.print_exc()
        pass
    
    return worker_system_info, worker_gpu_list

def get_kuber_nodes(server_type):
    # Using Kuber and Worker Info
    def get_node_condition(node, node_status):
        condition = {}
        node_ip = node["ip"]
        # from kuber node name always lower
        if node_ip not in node_status.keys():
            condition = {
                "is_master": False,
                "reason": "detached",
                "status": "detached",
                "message": ""
            }
        else :
            # Kuber Status
            node_status_ = node_status[node_ip]
            if node_status_["status"] == "True":
                node_status_["status"]  = "attached"
            elif node_status_["status"] == "Unknown":
                if node_status_["reason"] == "NodeStatusUnknown":
                    node_status_["status"] = "error"
                else:
                    node_status_["status"] = "attaching"
            elif node_status_["status"] == "False":
                node_status_["status"] = "attaching"
            condition = node_status_
        
        try:
            res = requests.get('http://{}:{}/worker/ping'.format(node_ip, JF_WORKER_PORT), timeout=2)
            if res.status_code != 200:
                condition["status"] = "error"
                condition["reason"] = condition["reason"] + "\nWorker connection error"
        except:
            condition["status"] = "error"
            condition["reason"] = condition["reason"] + "\nWorker connection error"

        return condition

    def dict_compare(d1, d2):
        d1_keys = set(d1.keys())
        d2_keys = set(d2.keys())
        intersect_keys = d1_keys.intersection(d2_keys)
        added = d1_keys - d2_keys
        removed = d2_keys - d1_keys
        modified = {o : (str(d1[o]), str(d2[o])) for o in intersect_keys if str(d1[o]) != str(d2[o])}
        same = set(o for o in intersect_keys if d1[o] == d2[o])
        return added, removed, modified, same

    def is_lock(value):
        if int(value) == 1:
            return "On"    
        return "Off"

    def limit_total_rate(limit, total):
        if limit is None:
            return 100
        else :
            return round((float(limit)/float(total))*100, 2)

    try:
        node_list = db.get_node_list()
        kube_node_list = kube.get_list_node()
        kube_pod_list = kube.get_list_namespaced_pod()
        
        kube_general_gpu_info = kube.get_select_node_gpu_info_list(node_list=kube_node_list, pod_list=kube_pod_list, gpu_mode=GPU_GENERAL_MODE, _init=True)
        kube_general_gpu_info = common.gen_dict_from_list_by_key(kube_general_gpu_info, "name")
        kube_mig_gpu_info = kube.get_select_node_gpu_info_list(node_list=kube_node_list, pod_list=kube_pod_list, gpu_mode=GPU_MIG_MODE, _init=True)
        kube_mig_gpu_info = common.gen_dict_from_list_by_key(kube_mig_gpu_info, "name")

        node_status = kube.get_node_status_list(node_list=kube_node_list)
        node_resource_info_list = kube.get_select_node_resource_info_list(pod_list=kube_pod_list, node_list=kube_node_list, db_node_list=node_list, all=True)
        node_resource_info = common.gen_dict_from_list_by_key(node_resource_info_list, "name")
        
        gpu_total = 0
        gpu_used = 0
        gpu_free = 0

        

        node_gpu_list = db.get_node_gpu_list()
        result = []
        for node in node_list:
            node_id = node["id"]
            node_ip = node["ip"]
            node_name = node["name"].lower()

            # node 이름으로 찾은 kuber ip와 db ip가 서로 다른 경우
            kuber_node_internal_ip = kube.get_node_ip(node_name=node_name, node_list=kube_node_list)
            if node_ip != kuber_node_internal_ip and kuber_node_internal_ip is not None:
                print("DB NODE IP != KUBER INTERNAL IP ", node_ip, kuber_node_internal_ip)
                if NODE_DB_IP_AUTO_CHAGE_TO_KUBER_INTERNAL_IP:
                    db.update_node_ip(node_id=node_id, node_ip=kuber_node_internal_ip)
                    node["ip"] = kuber_node_internal_ip
                    node_ip = kuber_node_internal_ip
            
            # node ip로 찾은 kuber node name과 db node name이 서로 다른 경우
            kube_node_name = kube.get_node_host_name(ip=node_ip, node_list=kube_node_list)
            if node_name != kube_node_name and kube_node_name is not None:
                print("DB NODE NAME != KUBER NODE NAME ", node_name, kube_node_name)
                if NODE_DB_NAME_AUTO_CHAGE_TO_KUBER_NODE_NAME:
                    db.update_node_name(node_id=node_id, node_name=kube_node_name)
                    node["name"] = kube_node_name
                    node_name = kube_node_name

            node_labels =  kube.get_node_labels(node_ip=node_ip, node_list=kube_node_list) 
            if node_labels is None:
                node_labels = {}
            
            # Condition From Kuber
            # attached, attaching, detached, error
            condition = get_node_condition(node, node_status)

            
            gpu_list = []
            # Node GPU Configuration Info from DB
            for gpu_info in node_gpu_list:
                if gpu_info["node_id"] == node["id"]:
                    gpu_list.append(gpu_info)
            
            gpu_list = [gpu_info for gpu_info in node_gpu_list if gpu_info["node_id"] == node["id"]]
            gpu_ea = {} # { "GTX 1080": 3, "RTX 2080": 2}
            for gpu_ in gpu_list:
                if gpu_["model"] not in gpu_ea:
                    gpu_ea[gpu_["model"]] = 1
                else:
                    gpu_ea[gpu_["model"]] += 1
            gpu_configuration = []
            for gpu_ in gpu_ea.items():
                config = "{} x {}ea".format(gpu_[0],gpu_[1])
                gpu_configuration.append(config)

            #From DB Data
            db_gpu_list = get_gpu_list_form_from_db(gpu_list=gpu_list)

            #From Worker Data
            db_system_info = get_system_info_form_from_db(node_info=node)

            
            worker_system_info, worker_gpu_list =  update_node_info(node=node, db_system_info=db_system_info, db_gpu_list=db_gpu_list) # 2s ~

            general_total = 0
            general_used = 0
            if kube_general_gpu_info.get(node_name) is not None:
                general_info = kube_general_gpu_info.get(node_name)[-1]
                general_total = general_info["total"]
                general_used = general_info["used"]

            mig_total = 0
            mig_used = 0
            mig_detail = {}
            if kube_mig_gpu_info.get(node_name) is not None:
                mig_info = kube_mig_gpu_info[node_name][-1]
                mig_total = mig_info["total"]
                mig_used = mig_info["used"]
                mig_detail = mig_info["mig_detail"]

            gpu_usage = {
                "general_total": general_total,
                "general_used": general_used,
                "mig_total": mig_total,
                "mig_used": mig_used,
                "mig_detail": mig_detail
            }


            node_cpu_cores =  int(db_system_info["cpu_cores"])
            node_ram =  round(float(db_system_info["ram"].replace("GB","")), 2)  # TODO 특정 함수로 GB -> Byte or Byte -> GB 할 수 있도록
            
            #TODO CPU GPU server mode 인것에서 해당 모드에 맞으면 다 보여 줄 것 인지
            #CPU GPU type을 무엇으로 보고 있는 화면인지에 따라 구분할 것 인지 ?
            cpu_node_options = {
                "cpu_cores_limit" : node[NODE_CPU_LIMIT_PER_POD_DB_KEY],
                "cpu_cores_limit_rate" : limit_total_rate(node[NODE_CPU_LIMIT_PER_POD_DB_KEY], node_cpu_cores),
                "cpu_cores_lock": is_lock(node[NODE_CPU_CORE_LOCK_PER_POD_DB_KEY]),
                "ram_limit": node[NODE_MEMORY_LIMIT_PER_POD_DB_KEY],
                "ram_limit_rate": limit_total_rate(node[NODE_MEMORY_LIMIT_PER_POD_DB_KEY], node_ram),
                "ram_limit_lock": is_lock(node[NODE_MEMORY_LOCK_PER_POD_DB_KEY])
            }

            gpu_node_options = {
                "cpu_cores_limit" : node[NODE_CPU_LIMIT_PER_GPU_DB_KEY],
                "cpu_cores_limit_rate" : limit_total_rate(node[NODE_CPU_LIMIT_PER_GPU_DB_KEY], node_cpu_cores),
                "cpu_cores_lock": is_lock(node[NODE_CPU_CORE_LOCK_PER_GPU_DB_KEY]),
                "ram_limit": node[NODE_MEMORY_LIMIT_PER_GPU_DB_KEY],
                "ram_limit_rate": limit_total_rate( node[NODE_MEMORY_LIMIT_PER_GPU_DB_KEY], node_ram),
                "ram_limit_lock": is_lock(node[NODE_MEMORY_LOCK_PER_GPU_DB_KEY])
            }

            
            resource_usage = {
                NODE_NUM_OF_CPU_CORES_KEY : node_cpu_cores,
                NODE_POD_ALLOC_NUM_OF_CPU_CORES_KEY: "",
                NODE_MEMORY_SIZE_KEY: node_ram
            }
            if condition["status"]  == "attached":
                if node_resource_info.get(node_name) is not None:
                    resource_usage.update({
                        NODE_POD_ALLOC_NUM_OF_CPU_CORES_KEY: node_resource_info[node_name][-1][NODE_POD_ALLOC_NUM_OF_CPU_CORES_KEY],
                        NODE_POD_ALLOC_MEMORY_SIZE_KEY: node_resource_info[node_name][-1][NODE_POD_ALLOC_MEMORY_SIZE_KEY],
                    })
            else :
                resource_usage.update({
                    NODE_POD_ALLOC_NUM_OF_CPU_CORES_KEY: 0,
                    NODE_POD_ALLOC_MEMORY_SIZE_KEY: 0,
                })

            # CPU, GPU 필터에 따라서 server 모드가 활성화 인지 여부
            active_status = 1
            if server_type == "cpu" and node[NODE_IS_CPU_SERVER_KEY] == 0:
                active_status = 0

            if server_type == "gpu" and node[NODE_IS_GPU_SERVER_KEY] == 0:
                active_status = 0

            result.append({
                "id": node_id,
                "node_name": node_name,
                "ip": node_ip,
                "condition": condition,
                "gpu_usage": gpu_usage,
                "resource_usage": resource_usage,
                "db_system_info": db_system_info,
                "db_gpu_list": db_gpu_list,
                "gpu_configuration": gpu_configuration,
                "system_info" : worker_system_info,
                "gpu_list": worker_gpu_list,
                "cpu_node_options": cpu_node_options,
                "gpu_node_options": gpu_node_options,
                "labels": node_labels,
                "active_status": active_status
            })


        result = {"list":result}
        
        return response(status = 1, result = result)        
    except Exception as e:
        traceback.print_exc()
        return response(status = 0, message = "Failed to get node Info")
        #return response(status = 0, message = "Failed to get node Info : {}".format(str(e)))                

def get_node_network_interface(ip):
    try:
        get_status, interfaces = common.get_worker_network_interfaces(ip=ip)
        if get_status:
            return response(status=1, result=interfaces)
        else :
            return response(status=0, result=interfaces, message="Get node network interface Error")
            #return response(status=0, result=res["result"], message=res["message"])
    except Exception as e:
        return response(status=0, result=None, message="Get Node Network interfaces Error (check worker status) : {}".format(str(e)))

def get_node_device_info(ip):
    try:
        result = {
                    "num_gpus": None,
                    "cpu": None,
                    "cpu_cores": None,
                    "ram": None
                }
        get_status, device_info = common.get_worker_device_info(ip=ip)
        if get_status:
            system_info = device_info.get("system_info")
            gpu_info = device_info.get("gpu_info")
            if system_info is not None and gpu_info is not None:
                result = {
                    "num_gpus": gpu_info.get("num_gpus"),
                    "cpu": system_info.get("cpu"),
                    "cpu_cores": int(system_info.get("cpu_cores")),
                    "ram": round(float(system_info.get("ram")/1024/1024),2) # TODO 특정 함수로 GB -> Byte or Byte -> GB 할 수 있도록
                }
            else :
                result = {
                    "num_gpus": device_info.get("num_gpus"),
                    "cpu": None,
                    "cpu_cores": None,
                    "ram": None
                }

            return response(status=1, result=result)
        else :
            return response(status=0, result=result, message="Get node device info Error")
    except Exception as e:
        return response(status=0, result=None, message="Get Node Device info Error (check worker status) : {}".format(str(e)))

def get_node_integrated_info(ip):
    try:
        integrated_result = {
            "network_interfaces": get_node_network_interface(ip)["result"],
            "device_info": get_node_device_info(ip)["result"]
        }
        if get_node_network_interface(ip)["result"] is None or get_node_device_info(ip)["result"] is None:
            return response(status=0, result=integrated_result, message="Get node info error : check node ip or worker status or worker version or worker connection timeout(default=2s)(ref - settings.ini).")
        return response(status=1, result=integrated_result)
    except Exception as e :
        traceback.print_exc()
        return response(status=0, result=integrated_result, message="Get node info error {}".format(str(e)))

######################################################### GRAPH DATA #########################################################
def get_node_cpu_usage_rate(ip):
    get_status, cpu_usage = common.get_worker_cpu_usage(ip)
    if get_status == True:
        if type(cpu_usage) == type(str()):
            cpu_usage = float(cpu_usage.replace("%",""))
        rate = cpu_usage
    else :
        rate = None
    # 0 ~ 100
    return rate

def get_node_ram_usage_rate(ip):
    get_status, mem_usage_info = common.get_worker_mem_usage(ip)
    if get_status == True:
        mem_free = int(mem_usage_info["MemFree"].replace("kB",""))
        mem_total = int(mem_usage_info["MemTotal"].replace("kB",""))
        rate = round(1 - round(float(mem_free/mem_total),2),2) * 100
    else :
        rate = None
    return rate

def write_data_base_form(item_list, total_key, used_key):
    item_usage_info = {"total":0, "used": 0, "rate": 0}
    for node in item_list:
        item_usage_info["total"] += node[total_key]
        item_usage_info["used"] += node[used_key]

    if item_usage_info["total"] > 0:
        item_usage_info["rate"] = round(float(item_usage_info["used"] / item_usage_info["total"]) * 100, 2)
    else :
        item_usage_info["rate"] = 0

def write_cpu_ram_history_data(cpu_history_list, ram_history_list, pod_list=None, node_list=None):
    # TODO MEMORY CPU 사용량 체크 시 100% 넘어가는 부분 처리 필요.
    # resource counting 하는 곳에서 할 것인지 write 하는 부분에서 강제 100 처리 할 것 인지 
    node_cpu_ram_info_list = kube.get_select_node_resource_info_list(pod_list=pod_list, node_list=node_list)
    cpu_ram_usage_per_node = kube.get_pod_cpu_ram_usage_per_node(pod_list)

    write_cpu_history_data(cpu_history_list, node_cpu_ram_info_list, cpu_ram_usage_per_node)
    write_ram_history_data(ram_history_list, node_cpu_ram_info_list, cpu_ram_usage_per_node)
    
def write_cpu_history_data(history_list, node_resource_list, cpu_ram_usage_per_node):
    try:
        import json
        import time
        import random
        current_time = time.time()
        cpu_usage_info = {"total":0, "alloc": 0, "alloc_rate": 0, "usage_rate": 0, "usage_weight_rate": 0, "pod_usage_rate": 0}
        all_node_count = 0
        for node in node_resource_list:
            cpu_usage_rate = get_node_cpu_usage_rate(node["ip"])
            if cpu_usage_rate is None:
                # worker error case
                continue
            all_node_count += 1
            cpu_usage_info["total"] += node[NODE_NUM_OF_CPU_CORES_KEY]
            cpu_usage_info["alloc"] += node[NODE_POD_ALLOC_NUM_OF_CPU_CORES_KEY]
            cpu_usage_info["usage_rate"] += cpu_usage_rate
            cpu_usage_info["usage_weight_rate"] += cpu_usage_rate * node[NODE_NUM_OF_CPU_CORES_KEY]
            
            node_usage_info = cpu_ram_usage_per_node.get(node["name"])
            if node_usage_info is not None:
                #TODO weight
                cpu_usage_info["pod_usage_rate"] += round(node_usage_info[CPU_USAGE_ON_NODE_KEY] * node[NODE_NUM_OF_CPU_CORES_KEY], 2)

        if cpu_usage_info["total"] > 0:
            cpu_usage_info["alloc_rate"] = round(float(cpu_usage_info["alloc"] / cpu_usage_info["total"]) * 100, 2)
        else :
            cpu_usage_info["alloc_rate"] = 0

        if all_node_count > 0:
            cpu_usage_info["usage_rate"] = round(float(cpu_usage_info["usage_rate"]/all_node_count), 2)
            cpu_usage_info["usage_weight_rate"] =  round(float(cpu_usage_info["usage_weight_rate"]/cpu_usage_info["total"]), 2)

            cpu_usage_info["pod_usage_rate"] = round(float(cpu_usage_info["pod_usage_rate"]/cpu_usage_info["total"]), 2)
        else :
            cpu_usage_info["usage_rate"] = 0
            cpu_usage_info["usage_weight_rate"] = 0

        resource_usage_info = {
            "cpu": cpu_usage_info,
            "time": current_time
        }

        history_list.append(resource_usage_info)
                
        this = random.randint(0,1) 
        if len(history_list) > HISTORY_LENGTH:
            history_list = history_list[len(history_list)-HISTORY_LENGTH:len(history_list)]
        else:

            temp = []
            for i in range(HISTORY_LENGTH - len(history_list)):
                # d = 0
                # if  this == 1:
                #     if i/(HISTORY_LENGTH - len(history_list)) < 0.3:
                #         d = (i/(HISTORY_LENGTH/3)*100)

                #     elif i/(HISTORY_LENGTH - len(history_list)) < 0.6:
                #         d = 40

                #     elif i/(HISTORY_LENGTH - len(history_list)) < 1:
                #         d = max(((i-(HISTORY_LENGTH/3)*2)/(HISTORY_LENGTH/3)*100),40)
                # else :
                #     if i/(HISTORY_LENGTH - len(history_list)) < 0.3:
                #         d = max(100 - (i/(HISTORY_LENGTH/3)*100),40)

                #     elif i/(HISTORY_LENGTH - len(history_list)) < 0.6:
                #         d = 40

                #     elif i/(HISTORY_LENGTH - len(history_list)) < 1:
                #         d = max(100 - ((i-(HISTORY_LENGTH/3)*2)/(HISTORY_LENGTH/3)*100), 40)

                temp.append({
                    "cpu": {"total":0, "alloc": 0, "alloc_rate": 0, "usage_rate": 0, "usage_weight_rate": 0, "pod_usage_rate": 0},
                    # "cpu": {
                    #     "total":d, 
                    #     "alloc": d, 
                    #     "alloc_rate": d, 
                    #     "usage_rate": d, 
                    #     "usage_weight_rate": d, 
                    #     "pod_usage_rate": d
                    # },
                    "time": history_list[0]["time"] - (HISTORY_LENGTH - len(history_list) - i)
                })

            history_list = temp + history_list
        
        more_info = { "cpu_alloc_max": 0 , "cpu_alloc_rate_max": 0 , "cpu_usage_rate_max": 0 }
        for i, history in enumerate(history_list):
            # history["time"] = i - HISTORY_LENGTH
            more_info["cpu_alloc_max"] = max(history["cpu"]["total"], history["cpu"]["alloc"], more_info["cpu_alloc_max"])
            more_info["cpu_alloc_rate_max"] = max(history["cpu"]["alloc_rate"], more_info["cpu_alloc_rate_max"], 100)
            more_info["cpu_usage_rate_max"] = max(history["cpu"]["usage_rate"], more_info["cpu_usage_rate_max"], 100)


        history_data = {
            "history_list": history_list,
        }
        history_data.update(more_info)

        jsonString = json.dumps(history_data)
        jsonFile = open(CPU_HISTORY_DATA, "w")
        jsonFile.write(jsonString)
        jsonFile.close()
    except Exception as e:
        traceback.print_exc()

def write_ram_history_data(history_list, node_resource_list, cpu_ram_usage_per_node):
    try:
        import time
        current_time = time.time()
        ram_usage_info = {"total":0, "alloc": 0, "alloc_rate": 0,  "usage_rate": 0, "usage_weight_rate": 0, "pod_usage_rate": 0}
        all_node_count = 0
        for node in node_resource_list:
            ram_usage_rate = get_node_ram_usage_rate(node["ip"])
            if ram_usage_rate is None:
                # worker error case
                continue
            all_node_count += 1
            ram_usage_info["total"] += int(node[NODE_MEMORY_SIZE_KEY])
            ram_usage_info["alloc"] += int(node[NODE_POD_ALLOC_MEMORY_SIZE_KEY])
            ram_usage_info["usage_rate"] += ram_usage_rate
            ram_usage_info["usage_weight_rate"] += ram_usage_rate * int(node[NODE_MEMORY_SIZE_KEY])

            node_usage_info = cpu_ram_usage_per_node.get(node["name"])
            if node_usage_info is not None:
                #TODO weight
                pod_usage_rate = float(node_usage_info[MEM_USAGE_KEY]/int(node[NODE_MEMORY_SIZE_KEY]))
                ram_usage_info["pod_usage_rate"] += round((pod_usage_rate*100) * int(node[NODE_MEMORY_SIZE_KEY]) ,2)



        if ram_usage_info["total"] > 0:
            ram_usage_info["alloc_rate"] = round(float(ram_usage_info["alloc"] / ram_usage_info["total"]) * 100, 2)
        else :
            ram_usage_info["alloc_rate"] = 0

        if all_node_count > 0:
            ram_usage_info["usage_rate"] = round(float(ram_usage_info["usage_rate"]/all_node_count), 2)
            ram_usage_info["usage_weight_rate"] =  round(float(ram_usage_info["usage_weight_rate"]/ram_usage_info["total"]), 2)
            ram_usage_info["pod_usage_rate"] = round(float(ram_usage_info["pod_usage_rate"]/ram_usage_info["total"]), 2)
        else :
            ram_usage_info["usage_rate"] = 0
            ram_usage_info["usage_weight_rate"] = 0

        resource_usage_info = {
            "ram": ram_usage_info,
            "time": current_time
        }

        history_list.append(resource_usage_info)
                
  
        if len(history_list) > HISTORY_LENGTH:
            history_list = history_list[len(history_list)-HISTORY_LENGTH:len(history_list)]
        else:
            temp = []
            for i in range(HISTORY_LENGTH - len(history_list)):
                temp.append({
                    "ram": {"total":0, "alloc": 0, "alloc_rate": 0,  "usage_rate": 0, "usage_weight_rate": 0, "pod_usage_rate": 0 },
                    "time": history_list[0]["time"] - (HISTORY_LENGTH - len(history_list) - i)
                })

            history_list = temp + history_list
        
        more_info = { "ram_alloc_max": 0 , "ram_alloc_rate_max": 0, "ram_usage_rate_max": 0 }
        for i, history in enumerate(history_list):
            # history["time"] = i - HISTORY_LENGTH
            more_info["ram_alloc_max"] = max(history["ram"]["total"], history["ram"]["alloc"], more_info["ram_alloc_max"])
            more_info["ram_alloc_rate_max"] = max(history["ram"]["alloc_rate"], more_info["ram_alloc_rate_max"], 100)
            more_info["ram_usage_rate_max"] = max(history["ram"]["usage_rate"], more_info["ram_usage_rate_max"], 100)


        history_data = {
            "history_list": history_list
        }
        history_data.update(more_info)

        jsonString = json.dumps(history_data)
        jsonFile = open(RAM_HISTORY_DATA, "w")
        jsonFile.write(jsonString)
        jsonFile.close()

    except Exception as e:
        traceback.print_exc()

def write_gpu_history_data(history_list, pod_list=None, node_list=None):
    try:
        import json
        import time
        current_time = time.time()

        general_gpu_usage_info = { "total":0, "used": 0, "rate": 0} # rate = 0 ~ 100 
        mig_gpu_usage_info = { "total": 0, "used": 0, "rate": 0}
        for node_gpu in kube.get_select_node_gpu_info_list(gpu_mode=GPU_MIG_MODE, pod_list=pod_list, node_list=node_list):
            mig_gpu_usage_info["total"] += node_gpu["total"]
            mig_gpu_usage_info["used"] += node_gpu["used"]

        if mig_gpu_usage_info["total"] > 0:
            mig_gpu_usage_info["rate"] = round(float(mig_gpu_usage_info["used"] / mig_gpu_usage_info["total"]) * 100, 2)
        else :
            mig_gpu_usage_info["rate"] = 0

            
        for node_gpu in kube.get_select_node_gpu_info_list(gpu_mode=GPU_GENERAL_MODE, pod_list=pod_list, node_list=node_list):
            general_gpu_usage_info["total"] += node_gpu["total"]
            general_gpu_usage_info["used"] += node_gpu["used"]
            
        if general_gpu_usage_info["total"] > 0:
            general_gpu_usage_info["rate"] = round(float(general_gpu_usage_info["used"] / general_gpu_usage_info["total"]) * 100, 2)
        else :
            general_gpu_usage_info["rate"] = 0
        

        gpu_usage_info = {
            GPU_GENERAL_MODE: general_gpu_usage_info,
            GPU_MIG_MODE: mig_gpu_usage_info,
            "time": current_time
        }

        history_list.append(gpu_usage_info)
        
  
        if len(history_list) > HISTORY_LENGTH:
            history_list = history_list[len(history_list)-HISTORY_LENGTH:len(history_list)]
        else:
            temp = []
            for i in range(HISTORY_LENGTH - len(history_list)):
                temp.append({
                    GPU_GENERAL_MODE: {"total":0, "used": 0, "rate": 0},
                    GPU_MIG_MODE: {"total":0, "used": 0, "rate": 0},
                    "time": history_list[0]["time"] - (HISTORY_LENGTH - len(history_list) - i)
                })

            history_list = temp + history_list
        
        more_info = { "general_total_max": 0, "mig_total_max": 0 }
        for i, history in enumerate(history_list):
            # history["time"] = i - HISTORY_LENGTH
            more_info["general_total_max"] = max(history[GPU_GENERAL_MODE]["total"], more_info["general_total_max"])
            more_info["mig_total_max"] = max(history[GPU_MIG_MODE]["total"], more_info["mig_total_max"])


        history_data = {
            "history_list": history_list,
        }
        history_data.update(more_info)

        jsonString = json.dumps(history_data)
        jsonFile = open(GPU_HISTORY_DATA, "w")
        jsonFile.write(jsonString)
        jsonFile.close()
    except Exception as e :
        traceback.print_exc()
        
def read_gpu_history_data():
    while(1):
        try:
            with jf_resource_log_lock:
                fileObject = open(GPU_HISTORY_DATA, "r")
                jsonContent = fileObject.read()
                aList = json.loads(jsonContent)
                break
        except Exception as e:
            print("READ GPU HISTORY ERROR : {}".format(str(e)))
            traceback.print_exc()
    return aList

def read_cpu_history_data():
    while(1):
        try:
            with jf_resource_log_lock:
                fileObject = open(CPU_HISTORY_DATA, "r")
                jsonContent = fileObject.read()
                aList = json.loads(jsonContent)
            break
        except Exception as e:
            print("READ CPU HISTORY ERROR : {}".format(str(e)))
            traceback.print_exc()
    return aList

def read_ram_history_data():
    while(1):
        try:
            with jf_resource_log_lock:
                fileObject = open(RAM_HISTORY_DATA, "r")
                jsonContent = fileObject.read()
                aList = json.loads(jsonContent)
            break
        except Exception as e:
            print("READ RAM HISTORY ERROR : {}".format(str(e)))
            traceback.print_exc()
    return aList

def get_node_gpu_usage_status_by_realtime():
    return read_gpu_history_data()

def get_node_gpu_usage_status_by_model():
    pod_list = kube.kube_data.get_pod_list()
    node_list = kube.kube_data.get_node_list()

    general_info = kube.get_select_node_gpu_info_list(pod_list=pod_list, node_list=node_list, gpu_mode=GPU_GENERAL_MODE)
    mig_info = kube.get_select_node_gpu_info_list(pod_list=pod_list, node_list=node_list, gpu_mode=GPU_MIG_MODE)
    def init_model(node):
        return {
                "total": node["total"],
                "used": node["used"],
                "usage_rate": round(node["used"]/node["total"] * 100, 2)
                # "node_list" : [
                #     {
                #         "name": node["name"],
                #         "total": node["total"],
                #         "used": node["used"],
                #         "usage_rate": round(node["used"]/node["total"] * 100, 2)
                #     }
                # ]
            }
    def add_model(gpu_usage_by_model_info, node):
            # usage_rate = 0
            # if gpu_usage_by_model_info["total"] > 0:
            #     usage_rate = round(gpu_usage_by_model_info["used"]/gpu_usage_by_model_info["total"] * 100, 2)
            # else :
            #     usage_rate = 0

            gpu_usage_by_model_info["total"] += node["total"]
            gpu_usage_by_model_info["used"] += node["used"]
            gpu_usage_by_model_info["usage_rate"] = round(gpu_usage_by_model_info["used"]/gpu_usage_by_model_info["total"] * 100, 2)
            # gpu_usage_by_model_info["node_list"].append({
            #     "name": node["name"],
            #     "total": node["total"],
            #     "used": node["used"],
            #     "usage_rate": round(node["used"]/node["total"] * 100, 2)
            # })
        
    gpu_usage_by_model = {}
    for node in general_info:
        if node["total"] == 0:
            continue
        gpu_model = node["gpu_model"]
        if gpu_usage_by_model.get(gpu_model) is None:
            gpu_usage_by_model[gpu_model] = init_model(node)
        else :
            add_model(gpu_usage_by_model[gpu_model], node)
            

    for node in mig_info:
        gpu_model = node["gpu_model"]
        for k, v in node.get("mig_detail").items():
            if v["total"] == 0:
                continue

            mig_device = gpu_model+ "\n" + k.replace("nvidia.com/","")
            if gpu_usage_by_model.get(mig_device) is None:
                gpu_usage_by_model[mig_device] = {
                    "total": v["total"],
                    "used": v["used"],
                    "usage_rate": round(v["used"]/v["total"] * 100, 2),
                    # "node_list": [
                    #     {
                    #         "name": node["name"],
                    #         "total": v["total"],
                    #         "used": v["used"],
                    #         "usage_rate": round(v["used"]/v["total"] * 100, 2)
                    #     }
                    # ]
                }
            else:
                gpu_usage_by_model[mig_device]["total"] += v["total"]
                gpu_usage_by_model[mig_device]["used"] += v["used"]
                gpu_usage_by_model[mig_device]["usage_rate"] = round(gpu_usage_by_model[mig_device]["used"]/gpu_usage_by_model[mig_device]["total"] * 100, 2)
                # gpu_usage_by_model[mig_device]["node_list"].append({
                #     "name": node["name"],
                #     "total": node["total"],
                #     "used": node["used"],
                #     "usage_rate": round(node["used"]/node["total"] * 100, 2)
                # })


    return gpu_usage_by_model

def get_node_gpu_usage_status_by_node():
    pod_list = kube.kube_data.get_pod_list()
    node_list = kube.kube_data.get_node_list()

    general_info = kube.get_select_node_gpu_info_list(pod_list=pod_list, node_list=node_list, gpu_mode=GPU_GENERAL_MODE)
    mig_info = kube.get_select_node_gpu_info_list(pod_list=pod_list, node_list=node_list, gpu_mode=GPU_MIG_MODE)
    def init_model(node):
        return {
                "total": node["total"],
                "used": node["used"],
                "usage_rate": round(node["used"]/node["total"] * 100, 2),
            }
    def add_model(gpu_usage_by_model_info, node):
        gpu_usage_by_model_info["total"] += node["total"]
        gpu_usage_by_model_info["used"] += node["used"]
        gpu_usage_by_model_info["usage_rate"] = usage_rate

        
    gpu_usage_by_model = {}
    for node in general_info:
        if node["total"] == 0:
            continue
        try:
            gpu_model = node["name"]+"\n"+node["gpu_model"]
        except: 
            traceback.print_exc()
            continue
        if gpu_usage_by_model.get(gpu_model) is None:
            gpu_usage_by_model[gpu_model] = init_model(node)
        else :
            add_model(gpu_usage_by_model[gpu_model], node)
            

    for node in mig_info:
        try:
            gpu_model = node["name"]+"\n"+node["gpu_model"]
        except: 
            traceback.print_exc()
            continue
        for k, v in node.get("mig_detail").items():
            if v["total"] == 0:
                continue
            mig_device = gpu_model+ "\n" + k.replace("nvidia.com/","")

            if gpu_usage_by_model.get(mig_device) is None:
                gpu_usage_by_model[mig_device] = {
                    "total": v["total"],
                    "used": v["used"],
                    "usage_rate": round(v["used"]/v["total"] * 100, 2)
                }
            else:
                gpu_usage_by_model[mig_device]["total"] += v["total"]
                gpu_usage_by_model[mig_device]["used"] += v["used"]
                gpu_usage_by_model[mig_device]["usage_rate"] = round(gpu_usage_by_model[mig_device]["used"]/gpu_usage_by_model[mig_device]["total"] * 100, 2)



    return gpu_usage_by_model

def get_node_gpu_usage_status_overview():
    pod_list = kube.kube_data.get_pod_list()
    node_list = kube.kube_data.get_node_list()

    general_info = kube.get_select_node_gpu_info_list(pod_list=pod_list, node_list=node_list, gpu_mode=GPU_GENERAL_MODE)
    mig_info = kube.get_select_node_gpu_info_list(pod_list=pod_list, node_list=node_list, gpu_mode=GPU_MIG_MODE)

    general_total = 0
    general_used = 0

    mig_total = 0
    mig_used = 0
    for node in general_info:
        general_total += node["total"]
        general_used += node["used"]
    
    for node in mig_info:
        mig_total += node["total"]
        mig_used += node["used"]


    gpu_usage_by_type = {
        GPU_ALL_MODE: {
            "total": general_total + mig_total,
            "used": general_used + mig_used
        },
        GPU_GENERAL_MODE: {
            "total":general_total,
            "used": general_used
        },
        GPU_MIG_MODE: {
            "total": mig_total,
            "used": mig_used
        }
    }

    return gpu_usage_by_type

def get_node_cpu_usage_status_by_realtime():
    return read_cpu_history_data()

def get_node_ram_usage_status_by_realtime():
    return read_ram_history_data()

def get_node_cpu_or_ram_alloc_status_overview(resource_type):
    pod_list = kube.kube_data.get_pod_list()
    node_list = kube.kube_data.get_node_list()
    node_resource_info_list = kube.get_select_node_resource_info_list(pod_list=pod_list, node_list=node_list)
    
    def _get(total_item_key, used_item_key, node_resource_info_list):
        resource_total = 0 
        resource_used = 0
        for node in node_resource_info_list:
            resource_total += node[total_item_key]
            resource_used += node[used_item_key]


        return {
            "total": round(resource_total, 2),
            "used": round(resource_used, 2)
        }

    if resource_type == "cpu":
        return {
            "cpu": _get(NODE_NUM_OF_CPU_CORES_KEY, NODE_POD_ALLOC_NUM_OF_CPU_CORES_KEY, node_resource_info_list)
        }
    
    if resource_type == "ram":
        return {
            "ram": _get(NODE_MEMORY_SIZE_KEY, NODE_POD_ALLOC_MEMORY_SIZE_KEY, node_resource_info_list)
        }

def get_node_cpu_alloc_status_by_node():
    pod_list = kube.kube_data.get_pod_list()
    node_list = kube.kube_data.get_node_list()
    node_resource_info_list = kube.get_select_node_resource_info_list(pod_list=pod_list, node_list=node_list)
    cpu_ram_usage_per_node = kube.get_pod_cpu_ram_usage_per_node(pod_list)

    cpu_alloc_status = { }
    for node in node_resource_info_list:
        cpu_usage_rate = get_node_cpu_usage_rate(node["ip"])
        cpu_model = node["name"] # + "\n"+ node["cpu_model"]
        total = node[NODE_NUM_OF_CPU_CORES_KEY]
        used = node[NODE_POD_ALLOC_NUM_OF_CPU_CORES_KEY]
        cpu_ram_usage_info = cpu_ram_usage_per_node.get(node["name"])
        pod_usage_rate = 0
        if cpu_ram_usage_info is not None:
            pod_usage_rate = cpu_ram_usage_info[CPU_USAGE_ON_NODE_KEY]

        if cpu_alloc_status.get(cpu_model) is None:
            cpu_alloc_status[cpu_model] = {
                NODE_CPU_MODEL_KEY: node[NODE_CPU_MODEL_KEY],
                "total": total,
                "used": used,
                "alloc_rate": round(used/total * 100, 2),
                "usage_rate": cpu_usage_rate,
                "pod_usage_rate": round(pod_usage_rate, 2)
                # "node_list": [
                #     {   
                #         "name": node["name"],
                #         "total": node["cpu_total"],
                #         "used": node["cpu_limits"]
                #     }
                # ]
            }
        else :
            cpu_alloc_status[cpu_model]["total"] += total
            cpu_alloc_status[cpu_model]["used"] += used
            cpu_alloc_status[cpu_model]["alloc_rate"] = round(cpu_alloc_status[cpu_model]["used"]/cpu_alloc_status[cpu_model]["total"] * 100, 2)
            cpu_alloc_status[cpu_model]["usage_rate"] = cpu_usage_rate
            # cpu_alloc_status[cpu_model]["node_list"].append({   
            #             "name": node["name"],
            #             "total": node["cpu_total"],
            #             "used": node["cpu_limits"]
            #         })

    #    {
    #         "jf-node-02": {
    #             "cpu_model": "11th Gen Intel(R) Core(TM) i5-11400 @ 2.60GHz", 
    #             "total": 12, 
    #             "used": 0, 
    #             "alloc_rate": 0.0, 
    #             "usage_rate": 2.21, 
    #             "pod_usage_rate": 0
    #         }, 
    #         "jf-node-06": {
    #             "cpu_model": "Intel(R) Core(TM) i9-10900X CPU @ 3.70GHz", 
    #             "total": 20, 
    #             "used": 50.0, 
    #             "alloc_rate": 250.0, 
    #             "usage_rate": 3.14, 
    #             "pod_usage_rate": 0.47
    #             }
    #    }

    return cpu_alloc_status

def get_node_ram_alloc_status_by_node():
    pod_list = kube.kube_data.get_pod_list()
    node_list = kube.kube_data.get_node_list()
    node_resource_info_list = kube.get_select_node_resource_info_list(pod_list=pod_list, node_list=node_list)
    cpu_ram_usage_per_node = kube.get_pod_cpu_ram_usage_per_node(pod_list)

    ram_alloc_status = { }
    for node in node_resource_info_list:
        node_name = node["name"]
        ram_usage_rate = get_node_ram_usage_rate(node["ip"])
        cpu_ram_usage_info = cpu_ram_usage_per_node.get(node["name"])
        pod_usage_rate = 0
        if cpu_ram_usage_info is not None:
            pod_usage = cpu_ram_usage_info[MEM_USAGE_KEY] # Pod에서 사용하고 있는 RAM 사용량 (GiB) 합. Pod 내부에서의 사용량 Percent는 의미가 없음
            pod_usage_rate = round(pod_usage/node[NODE_MEMORY_SIZE_KEY] * 100, 2)

        if ram_alloc_status.get(node_name) is None:
            ram_alloc_status[node_name] = {
                "total": node[NODE_MEMORY_SIZE_KEY],
                "limits": node[NODE_POD_ALLOC_MEMORY_SIZE_KEY],
                "alloc_rate": round(node[NODE_POD_ALLOC_MEMORY_SIZE_KEY]/node[NODE_MEMORY_SIZE_KEY] * 100,2),
                "usage_rate": ram_usage_rate, 
                "pod_usage_rate": round(pod_usage_rate, 2),
            }
        else :
            ram_alloc_status[node_name]["total"] += node[NODE_MEMORY_SIZE_KEY]
            ram_alloc_status[node_name]["limits"] += node[NODE_POD_ALLOC_MEMORY_SIZE_KEY]
            ram_alloc_status[node_name]["alloc_rate"] = round(ram_alloc_status[node_name][NODE_POD_ALLOC_MEMORY_SIZE_KEY]/ram_alloc_status[node_name][NODE_MEMORY_SIZE_KEY],2)
            ram_alloc_status[node_name]["usage_rate"] = ram_usage_rate # round(random.random() * 100, 2)

    return ram_alloc_status
######################################################### GRAPH DATA #########################################################

def get_node_update_info(node_id):
    # 수정 시 조회 정보
    result = {
                    "num_gpus": None,
                    "cpu": None,
                    "cpu_cores": None,
                    "ram": None
                }
    try:
        node_info = db.get_node(node_id)
        result = {
            "device_info":{
                "num_gpus": node_info["gpu_count"],
                "cpu": node_info["cpu"],
                "cpu_cores": int(node_info["cpu_cores"]),
                "ram": float(node_info["ram"].replace("GB","")) # TODO 특정 함수로 GB -> Byte or Byte -> GB 할 수 있도록
            },
            "network_interfaces": node_info["interfaces"].split(","),
            "ip": node_info["ip"],
            NODE_IS_CPU_SERVER_KEY: node_info[NODE_IS_CPU_SERVER_KEY],
            NODE_IS_GPU_SERVER_KEY: node_info[NODE_IS_GPU_SERVER_KEY],
            NODE_IS_NO_USE_SERVER_KEY: node_info[NODE_IS_NO_USE_SERVER_KEY],
            NODE_CPU_LIMIT_PER_POD_DB_KEY: node_info[NODE_CPU_LIMIT_PER_POD_DB_KEY],
            NODE_CPU_CORE_LOCK_PER_POD_DB_KEY: node_info[NODE_CPU_CORE_LOCK_PER_POD_DB_KEY],
            NODE_CPU_CORE_LOCK_PERCENT_PER_POD_DB_KEY: node_info.get(NODE_CPU_CORE_LOCK_PERCENT_PER_POD_DB_KEY),
            NODE_CPU_LIMIT_PER_GPU_DB_KEY: node_info[NODE_CPU_LIMIT_PER_GPU_DB_KEY],
            NODE_CPU_CORE_LOCK_PER_GPU_DB_KEY: node_info[NODE_CPU_CORE_LOCK_PER_GPU_DB_KEY], 
            NODE_CPU_CORE_LOCK_PERCENT_PER_GPU_DB_KEY: node_info.get(NODE_CPU_CORE_LOCK_PERCENT_PER_GPU_DB_KEY),
            NODE_MEMORY_LIMIT_PER_POD_DB_KEY: node_info[NODE_MEMORY_LIMIT_PER_POD_DB_KEY],
            NODE_MEMORY_LOCK_PER_POD_DB_KEY: node_info[NODE_MEMORY_LOCK_PER_POD_DB_KEY],
            NODE_MEMORY_LOCK_PERCENT_PER_POD_DB_KEY: node_info.get(NODE_MEMORY_LOCK_PERCENT_PER_POD_DB_KEY),
            NODE_MEMORY_LIMIT_PER_GPU_DB_KEY: node_info[NODE_MEMORY_LIMIT_PER_GPU_DB_KEY],
            NODE_MEMORY_LOCK_PER_GPU_DB_KEY: node_info[NODE_MEMORY_LOCK_PER_GPU_DB_KEY],
            NODE_MEMORY_LOCK_PERCENT_PER_GPU_DB_KEY: node_info.get(NODE_MEMORY_LOCK_PERCENT_PER_GPU_DB_KEY),
            "ephemeral_storage_limit": node_info["ephemeral_storage_limit"]
        } 
        return response(status=1, result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, result=None, message="Get Node Device info Error : {}".format(str(e)))

def get_kuber_node(node_id):
    try:
        # worker_url = 'http://{}:{}/worker/network_interfaces'.format(node_info["ip"], JF_WORKER_PORT)
        # node_info["interface_list"] = json.loads(requests.get(worker_url).text)["result"]
        node_info = get_node_update_info(node_id)["result"]
    except Exception as e:
        traceback.print_exc()
        # return response(status=0, result=None, message="get kuber node error")
        return response(status=0, result=None, message="get kuber node error : {}".format(str(e)))
    return response(status=1, result=node_info)

def attach_node(node_id, headers):
    try:
        node_info= db.get_node(node_id=node_id)
        
        join_command, *_ = common.launch_on_host("kubeadm token create --print-join-command", ignore_stderr=True)
        #TODO GET -> POST
        data = {
            "join_command": join_command
        }
        res = requests.post('http://{}:{}/worker/node'.format(node_info["ip"], JF_WORKER_PORT), json=data, headers=headers)
        res = json.loads(res.text)
        # res = requests.get('http://{}:{}/worker/add_node?join_command={}'.format(node_info["ip"], JF_WORKER_PORT, join_command), headers=headers)
        # res = json.loads(res.text)

        # print('http://{}:{}/worker/add_node?join_command={}'.format(node_info["ip"], JF_WORKER_PORT, join_command))
        # print('res' ,res)
        status = 1
        message = ""
        # Kube Join Error Case 
        # error execution phase preflight: [preflight] Some fatal errors occurred
        # [Error @@@@] : 
        if res["result"] is None:
            return response(status=0, message="Attach Node Error : {}".format(res.get("message")))

        for out in res["result"]["kube_join"]["out"].split("\n"):
            if out.find("ERROR") != -1:
                status = 0
                message += "{} \n".format(out)


    except Exception as e:
        traceback.print_exc()
        # return response(status=0, message="Attach Node Error")
        return response(status=0, message="Attach Node Error : {}".format(str(e)))
    if status == 0:
        # return response(status=0, message="Attach Error")
        return response(status=0, message="Attach Error : [{}]".format(message))
    return response(status=1, message="Attached ")

def detach_requests(ip, headers):
    res = requests.delete('http://{}:{}/worker/node'.format(ip, JF_WORKER_PORT), headers=headers)
    # res = requests.get('http://{}:{}/worker/remove_node'.format(node_info["ip"], JF_WORKER_PORT), headers=headers)
    res = json.loads(res.text)
    return res

def detach_node(node_id, headers):
    # Worker 노드는 두가지 위치에서 해제가 가능하며 둘 다 성공적으로 해야 완전히 해제
    # 1. Master에서 worker node 제거
    # 2. Worker에서 worker 종료
    # 1번만 이뤄질 경우 시스템에 문제 X (Worker api가 꺼져있는 경우 1번만 이뤄질 수 있음- 해당 경우에 대해 따로 메세지 worker node에서는 정상 종료되지 못하였다.)
    # 2번만 이뤄질 경우 Master에는 여전히 연결되어 보이기 때문에 연결은 되어 있으나 통신오류로 보임 (이 경우 system 상에서 제외하고 자원을 사용하기는 하나 완전히 괜찮다고는 못함)
    # 2번만 이뤄진 경우 목록에서 여전히 on(error 상태도 일단은 on) 으로 보이기 때문에 다시 종료 할 수 있음
    message = ""
    try:
        node_info= db.get_node(node_id=node_id)
        try:
            res = detach_requests(node_info["ip"], headers)
            #TODO GET -> DELETE
            # res = requests.delete('http://{}:{}/worker/node'.format(node_info["ip"], JF_WORKER_PORT), headers=headers)
            # # res = requests.get('http://{}:{}/worker/remove_node'.format(node_info["ip"], JF_WORKER_PORT), headers=headers)
            # res = json.loads(res.text)
        except :
            # 1번 Error 케이스 사실상 무시해도 상관 없음
            message += "not detached normally in worker node."
            traceback.print_exc()
            pass
        # kube.coreV1Api.delete_node(name=node_info["name"])
        kube.delete_node(node_name=node_info["name"])
        pass
    except Exception as e:
        # 2번 error 케이스
        traceback.print_exc()
        # return response(status=0, message="Detach NoDe Error")
        return response(status=0, message="Detach Node Error : {}".format(str(e)))
    return response(status=1, message="Detached. {} ".format(message))

@ns.route('/<int:node_id>', methods=['GET'], doc={'params': {'node_id': 'node ID'}})
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class trainingSimple(CustomResource):
    @token_checker
    @admin_access_check()
    def get(self, node_id):
        """Node ID 단순 조회"""
        node_id = node_id

        response = get_kuber_node(node_id=node_id)

        return self.send(response)



# ROUTER
@ns.route('', methods=['GET', 'POST','PUT'])
@ns.route('/<node_list>', methods=['DELETE'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class Nodes(CustomResource):
    @ns.expect(node_parser_get)
    @token_checker
    @admin_access_check()
    def get(self):    
        args = node_parser_get.parse_args()
        server_type = args["server_type"]
        res = get_kuber_nodes(server_type=server_type)   

        db.request_logging(self.check_user(), 'nodes', 'get', None, res['status'])

        return self.send(res)

    @ns.expect(node_parser_post)
    @token_checker
    @admin_access_check()
    def post(self):
        args = node_parser_post.parse_args()  
        ip = args['ip']

        interface_1g = args["interface_1g"]
        interface_10g = args["interface_10g"]
        interface_ib = args["interface_ib"]
        interfaces = args["interfaces"]
        is_cpu_server = args[NODE_IS_CPU_SERVER_KEY]
        is_gpu_server = args[NODE_IS_GPU_SERVER_KEY]
        no_use_server = args[NODE_IS_NO_USE_SERVER_KEY]
        cpu_cores_limit_per_pod = args[NODE_CPU_LIMIT_PER_POD_DB_KEY]
        cpu_cores_lock_per_pod = args[NODE_CPU_CORE_LOCK_PER_POD_DB_KEY]
        cpu_cores_lock_percent_per_pod = args[NODE_CPU_CORE_LOCK_PERCENT_PER_POD_DB_KEY]
        cpu_cores_limit_per_gpu = args[NODE_CPU_LIMIT_PER_GPU_DB_KEY]
        cpu_cores_lock_per_gpu = args[NODE_CPU_CORE_LOCK_PER_GPU_DB_KEY]
        cpu_cores_lock_percent_per_gpu = args[NODE_CPU_CORE_LOCK_PERCENT_PER_GPU_DB_KEY]
        ram_limit_per_pod = args[NODE_MEMORY_LIMIT_PER_POD_DB_KEY]
        ram_lock_per_pod = args[NODE_MEMORY_LOCK_PER_POD_DB_KEY]
        ram_lock_percent_per_pod = args[NODE_MEMORY_LOCK_PERCENT_PER_POD_DB_KEY]
        ram_limit_per_gpu = args[NODE_MEMORY_LIMIT_PER_GPU_DB_KEY]
        ram_lock_per_gpu = args[NODE_MEMORY_LOCK_PER_GPU_DB_KEY]
        ram_lock_percent_per_gpu = args[NODE_MEMORY_LOCK_PERCENT_PER_GPU_DB_KEY]
        ephemeral_storage_limit = args['ephemeral_storage_limit']

        node_options = {
            NODE_IS_CPU_SERVER_KEY: is_cpu_server,
            NODE_IS_GPU_SERVER_KEY: is_gpu_server,
            NODE_IS_NO_USE_SERVER_KEY: no_use_server,
            NODE_CPU_LIMIT_PER_POD_DB_KEY: cpu_cores_limit_per_pod,
            NODE_CPU_CORE_LOCK_PER_POD_DB_KEY: cpu_cores_lock_per_pod,
            NODE_CPU_CORE_LOCK_PERCENT_PER_POD_DB_KEY: cpu_cores_lock_percent_per_pod,
            NODE_CPU_LIMIT_PER_GPU_DB_KEY: cpu_cores_limit_per_gpu,
            NODE_CPU_CORE_LOCK_PER_GPU_DB_KEY: cpu_cores_lock_per_gpu,
            NODE_CPU_CORE_LOCK_PERCENT_PER_GPU_DB_KEY: cpu_cores_lock_percent_per_gpu,
            NODE_MEMORY_LIMIT_PER_POD_DB_KEY: ram_limit_per_pod,
            NODE_MEMORY_LOCK_PER_POD_DB_KEY: ram_lock_per_pod,
            NODE_MEMORY_LOCK_PERCENT_PER_POD_DB_KEY: ram_lock_percent_per_pod,
            NODE_MEMORY_LIMIT_PER_GPU_DB_KEY: ram_limit_per_gpu,
            NODE_MEMORY_LOCK_PER_GPU_DB_KEY: ram_lock_per_gpu,
            NODE_MEMORY_LOCK_PERCENT_PER_GPU_DB_KEY: ram_lock_percent_per_gpu,
            "ephemeral_storage_limit": ephemeral_storage_limit
        }

        res = add_kuber_node(ip=ip, interfaces=interfaces, user=self.check_user(), node_options=node_options)
        db.request_logging(self.check_user(), 'nodes', 'post', str(args), res['status'])

        kube_nad.update_network_attachment_definitions()

        return self.send(res)

    @ns.param('node_list', 'node list')
    @token_checker
    @admin_access_check()
    def delete(self, node_list):
        res = delete_kuber_node(node_list, self.check_user(), headers=self.get_jf_headers())
        # db.request_logging(self.check_user(), 'nodes/'+str(node_list), 'delete', None, res['status'])

        kube_nad.update_network_attachment_definitions()

        return self.send(res)

    @ns.expect(node_parser_put)
    @token_checker
    @admin_access_check()
    def put(self):
        args = node_parser_put.parse_args()  
        node_id = args['id']
        interface_1g = args["interface_1g"] 
        if interface_1g == 'none':
            interface_1g = None
        interface_10g = args["interface_10g"]
        if interface_10g == 'none':
            interface_10g = None
        interface_ib = args["interface_ib"]
        if interface_ib == 'none':
            interface_ib = None
        interfaces = args["interfaces"]
        is_cpu_server = args[NODE_IS_CPU_SERVER_KEY]
        is_gpu_server = args[NODE_IS_GPU_SERVER_KEY]
        no_use_server = args[NODE_IS_NO_USE_SERVER_KEY]
        cpu_cores_limit_per_pod = args[NODE_CPU_LIMIT_PER_POD_DB_KEY]
        cpu_cores_lock_per_pod = args[NODE_CPU_CORE_LOCK_PER_POD_DB_KEY]
        cpu_cores_lock_percent_per_pod = args[NODE_CPU_CORE_LOCK_PERCENT_PER_POD_DB_KEY]
        cpu_cores_limit_per_gpu = args[NODE_CPU_LIMIT_PER_GPU_DB_KEY]
        cpu_cores_lock_per_gpu = args[NODE_CPU_CORE_LOCK_PER_GPU_DB_KEY]
        cpu_cores_lock_percent_per_gpu = args[NODE_CPU_CORE_LOCK_PERCENT_PER_GPU_DB_KEY]
        ram_limit_per_pod = args[NODE_MEMORY_LIMIT_PER_POD_DB_KEY]
        ram_lock_per_pod = args[NODE_MEMORY_LOCK_PER_POD_DB_KEY]
        ram_lock_percent_per_pod = args[NODE_MEMORY_LOCK_PERCENT_PER_POD_DB_KEY]
        ram_limit_per_gpu = args[NODE_MEMORY_LIMIT_PER_GPU_DB_KEY]
        ram_lock_per_gpu = args[NODE_MEMORY_LOCK_PER_GPU_DB_KEY]
        ram_lock_percent_per_gpu = args[NODE_MEMORY_LOCK_PERCENT_PER_GPU_DB_KEY]
        ephemeral_storage_limit = args['ephemeral_storage_limit']

        node_options = {
            NODE_IS_CPU_SERVER_KEY: is_cpu_server,
            NODE_IS_GPU_SERVER_KEY: is_gpu_server,
            NODE_IS_NO_USE_SERVER_KEY: no_use_server,
            NODE_CPU_LIMIT_PER_POD_DB_KEY: cpu_cores_limit_per_pod,
            NODE_CPU_CORE_LOCK_PER_POD_DB_KEY: cpu_cores_lock_per_pod,
            NODE_CPU_CORE_LOCK_PERCENT_PER_POD_DB_KEY: cpu_cores_lock_percent_per_pod,
            NODE_CPU_LIMIT_PER_GPU_DB_KEY: cpu_cores_limit_per_gpu,
            NODE_CPU_CORE_LOCK_PER_GPU_DB_KEY: cpu_cores_lock_per_gpu,
            NODE_CPU_CORE_LOCK_PERCENT_PER_GPU_DB_KEY: cpu_cores_lock_percent_per_gpu,
            NODE_MEMORY_LIMIT_PER_POD_DB_KEY: ram_limit_per_pod,
            NODE_MEMORY_LOCK_PER_POD_DB_KEY: ram_lock_per_pod,
            NODE_MEMORY_LOCK_PERCENT_PER_POD_DB_KEY: ram_lock_percent_per_pod,
            NODE_MEMORY_LIMIT_PER_GPU_DB_KEY: ram_limit_per_gpu,
            NODE_MEMORY_LOCK_PER_GPU_DB_KEY: ram_lock_per_gpu,
            NODE_MEMORY_LOCK_PERCENT_PER_GPU_DB_KEY: ram_lock_percent_per_gpu,
            "ephemeral_storage_limit": ephemeral_storage_limit
        }
        # response = add_kuber_node(ip=ip, interface_1g=interface_1g, interface_10g=interface_10g, interface_ib=interface_ib, user=self.check_user())
        res = update_kuber_node(node_id=node_id, interfaces=interfaces, node_options=node_options, user=self.check_user())
        
        init_cpu_gpu_nodes()
        # db.request_logging(self.check_user(), 'nodes', 'put', str(args), res['status'])
        
        kube_nad.update_network_attachment_definitions()

        return self.send(res)

@ns.route("/attach/<int:node_id>", methods=["PUT"], doc={'params': {'node_id': 'Node ID'}})
class NodeAttach(CustomResource):
    # @ns.expect(node_attach)
    @token_checker
    @admin_access_check()
    def put(self, node_id):
        """Node Attach """
        # args = node_attach.parse_args()
        node_id = node_id

        return self.send(attach_node(node_id=node_id, headers=self.get_jf_headers()))

@ns.route("/detach/<int:node_id>", methods=["PUT"], doc={'params': {'node_id': 'Node ID'}})
class NodeDetach(CustomResource):
    # @ns.expect(node_detach)
    @token_checker
    @admin_access_check()
    def put(self, node_id):
        """Node detach """
        # args = node_detach.parse_args()
        node_id = node_id

        return self.send(detach_node(node_id=node_id, headers=self.get_jf_headers()))



# ROUTER
@ns.route('/network_interface', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NodesGetNetworkInfo(CustomResource):
    @token_checker
    @ns.expect(node_network_interface_get)
    def get(self):
        args = node_network_interface_get.parse_args()  
        ip = args['ip']
        response = get_node_network_interface(ip=ip)
        # db.request_logging(self.check_user(), 'nodes/network_interface', 'get', str(args), res['status'])

        return self.send(response)

# ROUTER
@ns.route('/device_info', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NodesGetDeviceInfo(CustomResource):
    # @token_checker
    @ns.expect(node_device_info_get)
    def get(self):
        args = node_device_info_get.parse_args()  
        ip = args['ip']
        response = get_node_device_info(ip=ip)
        # db.request_logging(self.check_user(), 'nodes/network_interface', 'get', str(args), res['status'])

        return self.send(response)

# ROUTER
@ns.route('/node_info', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NodesGetNodeIntegInfo(CustomResource):
    # @token_checker
    @ns.expect(node_integrated_info_get)
    def get(self):
        args = node_integrated_info_get.parse_args()  
        ip = args['ip']
        response = get_node_integrated_info(ip=ip)
        # db.request_logging(self.check_user(), 'nodes/network_interface', 'get', str(args), res['status'])

        return self.send(response)


# ROUTER
@ns.route('/gpu_history', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NodesGPUHistory(CustomResource):
    # @token_checker
    def get(self):
         
        res = response(status=1, result=get_node_gpu_usage_status_by_realtime())
        # db.request_logging(self.check_user(), 'nodes/network_interface', 'get', str(args), res['status'])

        return self.send(res)

@ns.route('/cpu_history', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NodesCPUHistory(CustomResource):
    # @token_checker
    def get(self):
         
        res = response(status=1, result=get_node_cpu_usage_status_by_realtime())
        # db.request_logging(self.check_user(), 'nodes/network_interface', 'get', str(args), res['status'])

        return self.send(res)

@ns.route('/ram_history', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NodesRAMHistory(CustomResource):
    # @token_checker
    def get(self):
         
        res = response(status=1, result=get_node_ram_usage_status_by_realtime())
        # db.request_logging(self.check_user(), 'nodes/network_interface', 'get', str(args), res['status'])

        return self.send(res)



@ns.route('/gpu_usage_status_by_model', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NodesGPUUsageSTatusByModel(CustomResource):
    # @token_checker
    def get(self):
         
        res = response(status=1, result=get_node_gpu_usage_status_by_model())
        # db.request_logging(self.check_user(), 'nodes/network_interface', 'get', str(args), res['status'])
        
        return self.send(res)

@ns.route('/gpu_usage_status_by_node', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NodesGPUUsageSTatusByNode(CustomResource):
    # @token_checker
    def get(self):
         
        res = response(status=1, result=get_node_gpu_usage_status_by_node())
        # db.request_logging(self.check_user(), 'nodes/network_interface', 'get', str(args), res['status'])
        
        return self.send(res)

@ns.route('/gpu_usage_status_overview', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NodesGPUUsageSTatusOverView(CustomResource):
    # @token_checker
    def get(self):
         
        res = response(status=1, result=get_node_gpu_usage_status_overview())
        # db.request_logging(self.check_user(), 'nodes/network_interface', 'get', str(args), res['status'])
        
        return self.send(res)


@ns.route('/resource_usage_status_overview', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NodesResourceUsageSTatusOverView(CustomResource):
    # @token_checker
    @ns.expect(node_resource_info_get)
    def get(self):
        args = node_resource_info_get.parse_args()  
        resource_type = args['resource_type']
        res = response(status=1, result=get_node_cpu_or_ram_alloc_status_overview(resource_type))
        # db.request_logging(self.check_user(), 'nodes/network_interface', 'get', str(args), res['status'])
        
        return self.send(res)


# TODO model -> node
@ns.route('/cpu_usage_status_by_model', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NodesCpuUsageSTatusByModel(CustomResource):
    # @token_checker
    def get(self):
        res = response(status=1, result=get_node_cpu_alloc_status_by_node())
        # db.request_logging(self.check_user(), 'nodes/network_interface', 'get', str(args), res['status'])
        
        return self.send(res)

@ns.route('/ram_usage_status_by_node', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NodesRamUsageSTatusByNode(CustomResource):
    # @token_checker
    def get(self):
        res = response(status=1, result=get_node_ram_alloc_status_by_node())
        # db.request_logging(self.check_user(), 'nodes/network_interface', 'get', str(args), res['status'])
        
        return self.send(res)



#TODO Node Update Label
#kubectl label nodes <노드 이름> <레이블 키>=<레이블 값>