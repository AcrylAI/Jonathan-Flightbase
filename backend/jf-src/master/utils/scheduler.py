import utils.kube as kube
import utils.db as db
import utils.common as common
import traceback
from utils.kube import kube_data
from utils.kube_create_func import create_hyperparamsearch_pod, create_job_pod
import utils.node_resource as node_resource
import sys
import os
sys.path.insert(0, os.path.abspath('..'))
from TYPE import *
import random
# Workspace GPU 타입 1. GPU 보장 2. GPU 가용 범위 내 자유로이 사용 (Workspace 상에는 자원이 남아 있지만 사용 못할 수 있음)
# 타입 1의 할당 가능 GPU = Total - GPU 보장 수 - 타입 2 중 MAX
# 타입 2의 할당 가능 GPU = Total - GPU 보장 수
# 사용 가능 GPU = Total - (GPU 보장 수 - GPU 보장 수 내 사용 중 GPU)

default_gpu_resource_key = NVIDIA_GPU_RESOURCE_LABEL_KEY

# TODO WS 자원이 없어서 JOB을 실행하지 못하는 경우 GPU를 예약하지 않도록 고려 필요 (2022-12-28 Yeobie)

def get_node_info_manager(requested_gpu_count, gpu_model=None, gpu_mode=None, node_name=None, pod_list=None, node_list=None, reserved_gpu_model=None):
    node_info_manager = node_resource.NodeInfoManager(pod_list=pod_list, node_list=node_list)
    if gpu_mode is not None:
        node_info_manager.update_node_info_list_by_gpu_mode(gpu_mode=gpu_mode)
    
    if gpu_model is not None and len(gpu_model) > 0:
        # 빈값은 전체 사용
        node_info_manager.update_node_info_list_by_gpu_model(gpu_model=gpu_model)
    elif node_name is not None and len(node_name) > 0:
        # 빈값은 전체 사용
        node_info_manager.update_node_info_list_by_node_name(node_name=node_name)
    
    if requested_gpu_count == 0:
        # CPU 사용
        node_info_manager.update_node_info_list_by_is_cpu_server()
    else:
        # GPU 사용
        node_info_manager.update_node_info_list_by_is_gpu_server()

    node_info_manager.update_node_info_list_by_reserved_gpu_model(reserved_gpu_model=reserved_gpu_model)
    node_info_manager.apply_node_resource_limit(gpu_model=gpu_model, node_name=node_name)

    return node_info_manager


def update_aval_gpu_node_info(aval_node_info, no_more_gpu_model_dict):
    # Random select case에서 이미 앞에서 제외한 GPU군은 빼고 할당
    del_node_index = []
    for i, node_info in enumerate(aval_node_info["node_list"]):
        # 같은 GPU 모델 군이면서, 선택 되었던 NODE군이면
        if no_more_gpu_model_dict.get(node_info.get("gpu_model")) is not None:
            no_more_gpu_node_list = no_more_gpu_model_dict.get(node_info.get("gpu_model"))
            if node_info["name"] in no_more_gpu_node_list:
                # aval node list에서 제외
                aval_node_info["aval_total"] -= node_info["aval"]
                del_node_index.append(i)


    del_node_index = sorted(del_node_index, reverse=True)
    for i in del_node_index:
        del aval_node_info["node_list"][i]

# # Job Queue

def check_guarantee_resource(requested_gpu_count, workspace_id, node_list, pod_list, not_guarantee_pending=False):
    # 확인해야 할 사항들
    #   1. 내가 선택한 노드군이 GPU를 충분히 가지고 있는가 ? -> node_info_manager에서 이미 확인 가능
    #   2. 자원을 사용하려는 워크스페이스는 보장인가 아닌가?
    #   3. 보장이 아닌 경우 남아있는 GPU 개수가 보장 시켜주기 위한 GPU를 제외하더라도 만족하는가 ?
    #       - 알아야 하는 정보
    #           - 보장 GPU 를 제외한 사용 가능한 상태의 GPU 개수
    #               사용 가능 GPU = 전체 GPU - 사용 중 GPU 
    #               사용 중 GPU = 보장 사용 중 GPU + 비보장 사용 중 GPU
    #               보장을 제외하고 사용 가능 GPU = 사용 가능 GPU - 보장에서 사용 가능한 GPU 
    #               보장에서 사용 가능한 GPU = 보장 받은 GPU - 보장 사용 중 
    #           
    #       - 필요한 정보
    #           - 전체 노드에서 사용 가능한 GPU 
    #           - 보장받은 총 GPU
    #           - 보장받은 것 중 사용 중 GPU
    #       
    
    workspace = db.get_workspace(workspace_id=workspace_id)
    # 워크스페이스의 보장 여부 - 보장이 아니면 보장을 제외하고도 만족하는지 확인
    if workspace["guaranteed_gpu"] == 1:
        return True, ""
    
    available_total = kube.get_gpu_total_count(node_list=node_list) - kube.get_gpu_used_count(node_list=node_list, pod_list=pod_list)

    allocated_info = kube.get_allocated_gpu_count(node_list=node_list, pod_list=pod_list)
    available_total_without_guaranteed_gpu = available_total - ( allocated_info["alloc_total"] - allocated_info["alloc_used"] )
    # 보장 제외하고 만족하는지 확인
    if available_total_without_guaranteed_gpu < requested_gpu_count or not_guarantee_pending:
        return False, "Not enough GPUs. By Guaranteed GPU."
    else :
        return True, ""
    
def check_node_have_enough_gpu(req_gpu_count, aval_node_info, no_option_aval_node_info,
                                workspace_id, workspace_list=None, node_list=None, pod_list=None, not_guarantee_pending=False):
    # Node 자원에서 GPU가 충분한지
    aval_node_total = aval_node_info["aval_total"]
    all_mode_aval_node_total = no_option_aval_node_info["aval_total"]

    # 단순 가진 GPU 와 요청 GPU 비교
    if aval_node_total < req_gpu_count:
        return False, "Not enough GPUs. AVAL [{}] REQ [{}]".format(aval_node_total, req_gpu_count)

    workspace = db.get_workspace(workspace_id=workspace_id)
    # 워크스페이스의 보장 여부 - 보장이 아니면 보장을 제외하고도 만족하는지 확인
    if workspace["guaranteed_gpu"] == 1:
        return True, ""

    allocated_info = kube.get_allocated_gpu_count(workspace_list=workspace_list, node_list=node_list, pod_list=pod_list)
    aval_total = all_mode_aval_node_total - ( allocated_info["alloc_total"] - allocated_info["alloc_used"] )
    # 보장 제외하고 만족하는지 확인
    if aval_total < req_gpu_count or not_guarantee_pending:
        return False, "Not enough GPUs. By Guaranteed GPU."

    return True, ""

def check_workspace_resource(req_gpu_count, gpu_usage_type, workspace_id, pod_list=None):
    # 자신의 워크스페이스에서 사용 가능한 GPU를 만족하는지
    flag = False
    message = ""
    try:
        workspace = db.get_workspace(workspace_id=workspace_id)
        workspcae_status = common.get_workspace_status(workspace)
        
        if workspcae_status != "active":
            message = "workspace not active : [{}]".format(workspcae_status)
            return flag, message

        if workspace is None:
            message = "workspace not exist"
            return flag, message

        workspace_gpu_info = kube.get_workspace_gpu_count(workspace_id=workspace_id, pod_list=pod_list)
        # {'training_used': 0, 'training_total': 0, 'deployment_used': 0, 'deployment_total': 1}
        workspace_gpu_total = workspace_gpu_info["{}_total".format(gpu_usage_type)]
        workspace_gpu_used_total = workspace_gpu_info["{}_used".format(gpu_usage_type)]
        if workspace_gpu_total - workspace_gpu_used_total < int(req_gpu_count):
            return flag, "Not enough GPUs req: {}, aval: {}".format(req_gpu_count, workspace_gpu_total - workspace_gpu_used_total )
        flag = True
    except:
        traceback.print_exc()
    return flag, message

def check_workspace_and_node_resource(req_gpu_count, gpu_usage_type, workspace_id, pod_list=None,
                                        workspace_list=None, node_list=None, not_guarantee_pending=False):
    
    if req_gpu_count == 0:
        return True, ""

    flag, message = check_workspace_resource(req_gpu_count=req_gpu_count, gpu_usage_type=gpu_usage_type, workspace_id=workspace_id, pod_list=pod_list)
    if not flag:
        return flag, message


    if workspace_list is None:
        workspace_list = db.get_workspace_list()

    flag, message = check_guarantee_resource(requested_gpu_count=req_gpu_count, workspace_id=workspace_id, node_list=node_list, pod_list=pod_list, not_guarantee_pending=not_guarantee_pending)
 
    if not flag:
        print("CHECK ", flag, message)
        return flag, message
    
    return flag ,""

# TODO 변경된 방식을 통하도록 변경 필요 (2022-11-30 Yeobie)
def check_immediate_running_item_resource_force(req_gpu_count, gpu_model=None, force_node_name=None, force_gpu_model=None):
    """
        Description : check_immediate_running_item_resource 가 동일한 역할을 하며 다른 점이라면 강제로 할당 받아옴 (GPU 공유하여 띄우기 위함)
                      - 지원 불가 상태 (2023-02-10 Yeobie)
                        현재 Deployment에서만 제공 예정 
                        스케쥴링 방식 업데이트로 인해서 해당 기능의 재개발 필요
    """
    pass

def check_immediate_running_item_resource_new(requested_gpu_count, gpu_usage_type, workspace_id, rdma_option=0, gpu_model=None, node_name=None):
    """
        Description : 즉시 실행하는 아이템들 (Tool, Deployment) 이 요청하는 자원, workspace 소속에 따라 가능한 노드 그룹을 내려주는 함수

        Args:
            requested_gpu_count (int): 요청하는 GPU 개수 (CPU 사용 시 1이 들어감)
            gpu_usage_type (str) : Type 종류는  TYPE.TRAINING_TYPE, TYPE.DEPLOYMENT_TYPE
            workspace_id (int) : 작업을 실행할 workspace id
            rdma_option (int) : 작업환경 내에서 rdma를 사용할 수 있도록 하느냐에 대한 옵션으로 즉시 실행의 경우 별도의 처리를 하고 있진 않음 (Infiniband 자원이 있는 경우 값에 상관 없이 자동 할당) 
                                0(미사용), 1(사용) 

            gpu_model (dict) : 사용할 GPU 그룹. (전체 선택 시 NULL) ex) { GPU_MODEL_KEY : [NODE_NAME1, NODE_NAME2]}
            node_name (dict) : 사용할 CPU 그룹 정보 + CPU RAM 제한 값 (값이 없는 경우 최대치 사용) ex) { NODE_NAME: {"cpu_cores_limit_per_pod": 1, "ram_limit_per_pod": 1}, "@all": {"is_active": false, "cpu_cores_limit_per_pod": 1, "ram_limit_per_pod": 1}}
    """
    flag, message = check_workspace_and_node_resource(req_gpu_count=requested_gpu_count, gpu_usage_type=gpu_usage_type, workspace_id=workspace_id)
    if flag:
        if requested_gpu_count > 0:
            # GPU 사용 케이스
            node_name = common.parsing_node_name(node_name=node_name)["node_name_gpu"]
            if requested_gpu_count == 1:
                # GPU를 1개만 쓸 땐 MIG / GENERAL 모두 사용가능
                node_info_manager = get_node_info_manager(requested_gpu_count=requested_gpu_count, gpu_model=gpu_model, node_name=node_name)
                return node_info_manager.get_node_info_manager_for_pod(requested_gpu_count=requested_gpu_count)
            else:
                # 2개 이상 쓸 땐 GENERAL만 가능
                node_info_manager = get_node_info_manager(requested_gpu_count=requested_gpu_count, gpu_mode=GPU_GENERAL_MODE, gpu_model=gpu_model, node_name=node_name)
                return node_info_manager.get_node_info_manager_for_pod(requested_gpu_count=requested_gpu_count)
        else:
            # CPU 사용 케이스
            node_name = common.parsing_node_name(node_name=node_name)["node_name_cpu"]
            node_info_manager = get_node_info_manager(requested_gpu_count=requested_gpu_count, node_name=node_name, gpu_mode=GPU_GENERAL_MODE)
            return node_info_manager.get_node_info_manager_for_cpu_pod()
            
def get_pod_queue():
    # print("NEW POD _QUEUE")
    pod_queue = []
    
    pod_queue += db.get_pod_queue_with_info() # Job
    pod_queue += db.get_hyperparamsearch_queue_with_info() # HPS 
    # print("???",pod_queue)

    return sorted(pod_queue, key=lambda pod_queue: (pod_queue["create_datetime"]))

import time
def res_check():

    def get_checkmode_list(pod):
        check_mode_list = []
        if pod["gpu_count"] <= 1:
            if pod["gpu_model"] is None:
                check_mode_list = [GPU_MIG_MODE, GPU_GENERAL_MODE]
            # elif "mig" in pod["gpu_model"]:
            #     check_mode_list = [GPU_MIG_MODE]
            else :
                for gpu_model in get_pod_gpu_model_model_key(pod["gpu_model"]):
                    if NVIDIA_GPU_MIG_BASE_FLAG in gpu_model:
                        if GPU_MIG_MODE not in check_mode_list:
                            check_mode_list.append(GPU_MIG_MODE)
                    else :
                        if GPU_GENERAL_MODE not in check_mode_list:
                            check_mode_list.append(GPU_GENERAL_MODE)
                    if len(check_mode_list) == 2:
                        break

                # check_mode_list = [GPU_GENERAL_MODE]
        else :
            # 2개 이상 사용함
            check_mode_list = [GPU_GENERAL_MODE]
        
        return check_mode_list

    def get_pod_gpu_model_model_key(pod_gpu_model):
        if pod_gpu_model is None:
            return None
        else :
            return list(pod_gpu_model.keys())

    def check_pod_gpu_model_is_no_more_gpu(pod_gpu_model, no_more_gpu_model_list):
        if pod_gpu_model is None:
            if pod_gpu_model in no_more_gpu_model_list:
                return True
        else :
            for pod_gpu_model_key in list(pod_gpu_model.keys()):
                if pod_gpu_model_key in no_more_gpu_model_list:
                    del pod_gpu_model[pod_gpu_model_key]
                    if len(pod_gpu_model) == 0:
                        return True
            if len(pod_gpu_model) > 0:
                return False

        return False

    def set_no_more_gpu_dict(pod_gpu_model, no_more_gpu_model_dict):
        if pod_gpu_model is None:
            no_more_gpu_model_dict[None] = []
            return 0
        
        for gpu_model, node_list in pod_gpu_model.items():
            if no_more_gpu_model_dict.get(gpu_model) is None:
                no_more_gpu_model_dict[gpu_model] = node_list
            else :
                no_more_gpu_model_dict[gpu_model] += node_list
                no_more_gpu_model_dict[gpu_model] = list(set(no_more_gpu_model_dict[gpu_model]))
        return 0

    def check_is_no_more_gpu(pod_gpu_model, no_more_gpu_model_dict):
        if pod_gpu_model is None:
            if None in no_more_gpu_model_dict.keys():
                return True
            else :
                return False

        for try_gpu_model, try_node_list in list(pod_gpu_model.items()):
            if no_more_gpu_model_dict.get(try_gpu_model) is not None:
                no_more_gpu_node_list = no_more_gpu_model_dict.get(try_gpu_model)
                new_try_node_list = list(set(try_node_list) - set(no_more_gpu_node_list))
                if len(new_try_node_list) == 0:
                    del pod_gpu_model[try_gpu_model]
                else :
                    pod_gpu_model[try_gpu_model] = new_try_node_list

        if len(pod_gpu_model) == 0:
            return True
        
        return False



    # kube_data.update_all_list()
    def delete_pod_from_memory_and_queue(pod, pod_queue, index):
        del pod_queue[index]
        if pod.get("job_id") is not None:
            db.delete_pod_queue(training_id=pod["training_id"], job_id=pod.get("job_id"))
        elif pod.get("hps_id") is not None: 
            db.delete_hyperparamsearch_queue(training_id=pod["training_id"], hps_id=pod.get("hps_id"))
            print("DEL HPS QUEUE")

    def delete_expired_pod(pod, pod_queue, index):
        if pod.get("job_id") is not None:
            # delete job
            db.delete_jobs(job_id_list=[pod.get("job_id")])
            pass
        elif pod.get("hps_id") is not None: 
            # delete hps
            db.delete_hyperparamsearchs(hps_id_list=[pod.get("hps_id")])
            pass
        delete_pod_from_memory_and_queue(pod, pod_queue, index)

    def is_queue_item_running_training(training_id, pod_list):
        # training이 이미 queue를 사용하는 아이템을 실행시키고 있는지 확인
        # 1개의 training에서는 1개의 아이템만 돌 수 있음 
        # 이 부분을 제거하면 자원이 허용하는 범위에서 계속 실행할 수 있음 
        if training_id is None:
            return False

        training_pod_list = kube.find_kuber_item_name(item_list=pod_list, training_id=training_id, work_func_type=TRAINING_ITEM_A) # JOB
        training_pod_list += kube.find_kuber_item_name(item_list=pod_list, training_id=training_id, work_func_type=TRAINING_ITEM_C) # HPS
        if len(training_pod_list) > 0:
            return True
        return  False
    
    st = time.time()
    # pod_queue = db.get_pod_queue_with_info()
    pod_queue = get_pod_queue()
    pod_list = kube_data.get_pod_list()
    node_list = kube_data.get_node_list()
    service_list = kube_data.get_service_list()
    ingress_list = kube_data.get_ingress_list()
    kube.resource_gpu_used_update(pod_list=pod_list, service_list=service_list, ingress_list=ingress_list)
    if len(pod_queue) == 0:
        return 0
    """
    queue_info = {
        # default
        "training_id"
        "training_name"
        "training_total_gpu"
        "training_type"
        "gpu_count"
        "workspace_id"
        "workspace_name"

        "rdma"
        "unified_memory"
        "gpu_acceleration"
        "create_datetime"


        # POD
        "job_group_index"
        "job_group_number"
        "job_id"
        "job_name"

        # HPS
        "hps_group_index"
        "hps_group_number"
        "hps_id"
        "hps_name"
    }
    """

    workspace_list = db.get_workspace_list()    
    guarantee_workspace_list = [ workspace for workspace in workspace_list if workspace["guaranteed_gpu"] == 1]
    not_guarantee_workspace_list = [ workspace for workspace in workspace_list if workspace["guaranteed_gpu"] == 0]

    # 
    general_running_workspace_list = []
    mig_running_workspace_list = []

    no_more_gpu_model_list = []
    no_more_gpu_model_dict = {} 
    # {
    #     "GPU_MODEL": ["NODE_LIST"] # [] = ALL,  ["NODE1","NODE2" ...] = selected
    # }
    no_more_general = False
    no_more_mig = False

    not_guarantee_pending = False
    for i, pod in enumerate(pod_queue):
        if check_is_no_more_gpu(pod["gpu_model"], no_more_gpu_model_dict) or ( no_more_general == True and no_more_mig == True ):
            # print("NO MORE GPU [{}]".format(get_pod_gpu_model_model_key(pod["gpu_model"])))
            continue  

        check_mode_list = get_checkmode_list(pod)

        # 같은 Training이 돌고 있으면 넘어감
        if is_queue_item_running_training(training_id=pod.get("training_id"), pod_list=pod_list):
            continue

        # GPU MODE  CASE
        # 1. gpu count
        # if pod["gpu_count"] > 1 --> GPU_GENERAL_MODE else mig
        # 2. gpu model 
        # if GPU MODEL == mig type --> mig else GPU_GENERAL_MODE


        pod_run = False
        for check_mode_i, gpu_mode in enumerate(check_mode_list):

            if gpu_mode == GPU_GENERAL_MODE:
                if no_more_general == True:
                    continue
                if pod["workspace_name"] in general_running_workspace_list and pod["gpu_count"] > 0:
                    continue
            elif gpu_mode == GPU_MIG_MODE:
                if no_more_mig == True:
                    continue
                if pod["workspace_name"] in mig_running_workspace_list and pod["gpu_count"] > 0:
                    continue


            # print("GPU MODE ", gpu_mode, "GPU MODEL", pod["gpu_model"])
            
            if pod["gpu_count"] == 0:
                node_name = common.parsing_node_name(pod["node_name"])["node_name_cpu"]
                node_info_manager = get_node_info_manager(requested_gpu_count=pod["gpu_count"], node_name=node_name, pod_list=pod_list, node_list=node_list)
                node_info_manager = node_info_manager.get_node_info_manager_for_cpu_pod()
                # aval_node_info = get_aval_cpu_node_info(pod_list=pod_list, node_list=node_list, gpu_model=pod["gpu_model"], node_name=pod["node_name"])
            else :
                # 옛날 방식에서는 gpu_model만 있고 node_name은 없음 
                # node_name이 없다는 뜻은 리소스 관리 X 
                node_name = common.parsing_node_name(pod["node_name"])["node_name_gpu"]
                node_info_manager = get_node_info_manager(requested_gpu_count=pod["gpu_count"], gpu_model=pod["gpu_model"], node_name=node_name, pod_list=pod_list, node_list=node_list, reserved_gpu_model=no_more_gpu_model_dict)
                if pod["gpu_count"] == 1:
                    node_info_manager.update_node_info_list_by_gpu_mode(gpu_mode=gpu_mode)
                    node_info_manager = node_info_manager.get_node_info_manager_for_pod(requested_gpu_count=pod["gpu_count"])
                elif pod["gpu_count"] > 1:
                    node_info_manager.update_node_info_list_by_gpu_mode(gpu_mode=GPU_GENERAL_MODE)
                    node_info_manager = node_info_manager.get_node_info_manager_for_pod(requested_gpu_count=pod["gpu_count"])



            flag, message = check_workspace_and_node_resource(req_gpu_count=pod["gpu_count"], gpu_usage_type=TRAINING_TYPE, workspace_id=pod["workspace_id"], 
                                            pod_list=pod_list, workspace_list=guarantee_workspace_list, node_list=node_list,
                                            not_guarantee_pending=not_guarantee_pending)
            if not flag:
                # print("Scheduler Check : {}".format(message))
                if "workspace not active" in message:
                    print("만료")
                    delete_expired_pod(pod, pod_queue, i)
                else :
                    # GPU를 특정하지 않으면 MIG -> General 순으로 찾음
                    # 
                    if pod["gpu_model"] is None:
                        if gpu_mode == GPU_GENERAL_MODE:
                            general_running_workspace_list.append(pod["workspace_name"])
                            no_more_general = True

                        if gpu_mode == GPU_MIG_MODE:
                            mig_running_workspace_list.append(pod["workspace_name"])
                            no_more_mig = True
                    else :
                        # 가장 먼저 특정 gpu 모델을 못쓰게 된 작업에 가장 최우선 순위를 주기 위해
                        # no_more_gpu_model_list+=get_pod_gpu_model_model_key(pod["gpu_model"])
                        set_no_more_gpu_dict(pod_gpu_model=pod["gpu_model"], no_more_gpu_model_dict=no_more_gpu_model_dict)
                continue

            if node_info_manager is not None and node_info_manager.get_number_of_node() > 0:
                mpi_port = kube.get_training_mpi_port(pod_list=pod_list)

                for j, node_info in enumerate(node_info_manager.node_info_list):
                    db.update_training_run(training_id=pod["training_id"])
                    result = ""
                    if pod["built_in_model_id"] is not None:
                        pod["built_in_model_info"] = db.get_built_in_model(model_id=pod["built_in_model_id"])

                    # JOB CASE
                    if pod.get("job_id") is not None:

                        # result = create_job_pod(pod_info=pod, node_groups=node_groups, interfaces=interfaces, training_index=j)
                        result = create_job_pod(pod_info=pod, node_info_manager=node_info_manager, training_index=j, mpi_port=mpi_port)
                        if result == True:
                            job_id = pod["job_id"]
                            network_interface_type = node_info_manager.node_info_list[j].get_requested_network_group_name()
                            db.update_job_network_interface(job_id=job_id, network_interface=network_interface_type)
                            pass

                    elif pod.get("hps_id") is not None: 
                        result = create_hyperparamsearch_pod(pod_info=pod, node_info_manager=node_info_manager, training_index=j, mpi_port=mpi_port)

                        if result == True:
                            pass

                delete_pod_from_memory_and_queue(pod, pod_queue, i)
                pod_run = True
                break
            else:
                print("TOTAL AVAL PASS BUT NO NODE GROUP")
                if pod["gpu_model"] is None:
                    if gpu_mode == GPU_GENERAL_MODE:
                        general_running_workspace_list.append(pod["workspace_name"])
                        no_more_general = True

                    if gpu_mode == GPU_MIG_MODE:
                        mig_running_workspace_list.append(pod["workspace_name"])
                        no_more_mig = True
                else :
                    # 가장 먼저 특정 gpu 모델을 못쓰게 된 작업에 가장 최우선 순위를 주기 위해
                    # no_more_gpu_model_list+=get_pod_gpu_model_model_key(pod["gpu_model"])
                    set_no_more_gpu_dict(pod_gpu_model=pod["gpu_model"], no_more_gpu_model_dict=no_more_gpu_model_dict)

        if pod_run == True:
            break    