
import utils.common as common
import utils.kube_parser as kube_parser
from datetime import datetime
import utils.db as db
import time

import sys
import os
sys.path.insert(0, os.path.abspath('..'))
from TYPE import *

def get_pod_status(pod_item):
    # 모든 error 상황을 커버하지는 못함. 발견된 현상에 대해 추가 필요.
    # status = error, installing, running
    def get_state_info(pod_item):
        return pod_item.status.container_statuses[0].state

    def get_message_and_reasone(state_info):
        try:
            message = state_info.message
        except:
            message = "Unknown"
            
        try:
            reason = state_info.reason
        except:
            reason = "Unknown"
        
        return {
            "message": message,
            "reason": reason
        }
        

    def get_terminated_info(pod_item):
        terminated = get_state_info(pod_item=pod_item).terminated
        return get_message_and_reasone(terminated)

    def get_waiting_info(pod_item):
        waiting = get_state_info(pod_item=pod_item).waiting
        return get_message_and_reasone(waiting)

    pod_creation_time = pod_item.metadata.creation_timestamp 
    pod_creation_time = pod_creation_time if type(pod_creation_time) == type(str) else pod_creation_time.strftime("%Y-%m-%d %H:%M:%S")
    pod_creation_time_ts = common.date_str_to_timestamp(pod_creation_time)
    current_ts = common.date_str_to_timestamp(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    # print("creation time info", pod_creation_time, pod_creation_time_ts)
    # print("interval : ", current_ts - pod_creation_time_ts)
    interval = current_ts - pod_creation_time_ts
    # interval = 1
    status = {"status": None, "reason": None, "resolution": None, "message": None, "phase": pod_item.status.phase, "interval": interval, "restart_count": kube_parser.parsing_pod_restart_count(pod_item)}
    if interval < 5:
        status["status"] = "running"
        status["reason"] = "pod starting : {}".format(interval)
        return status
    
    if pod_item.status.container_statuses is None:
        # Container가 실행되지 못한 상태
        # Node 지정할 경우 발생 할 수 있는 문제 ( 전체 자원은 충분하나 선택된 노드에는 자원이 없을 수 있음 )
        # 최초 실행 시에도 다음과 같은 상태가 나오기도 함.
        # 노드가 에러이거나, 없는 경우 걸림 : waiting reason 없음, container statues : None, 20초뒤에 자동으로 terminating 됨

        pod_status_reason = {
            "Evicted": "Data must be placed in $HOME/src. If there are many additionally installed packages, after committing the docker image restart with the image or ask the administrator to increase the temporary capacity. (default: 10Gi)"
        }

        status["status"] = "error"
        status["reason"] = pod_item.status.reason
        status["message"] = pod_item.status.message

        known_resolution = pod_status_reason.get(status["reason"])
        if known_resolution is None:
            status["resolution"] = "Check Node Resource or status or restart."
        else:
            status["resolution"] = known_resolution

        return status
    
    # ---------------------------------------------------------------------------------------------
    # waiting reason이 있는 경우 error
    container_waiting_reason = {'CrashLoopBackOff' : 'This error can be caused by a variery of issues',
                                'ErrImagePull' : 'Wrong image name, Check the image or tag exist',
                                'ImagePullBackOff' : 'Wrong image name, Check the image or tag exist',
                                'InvalidImageName' : 'Wrong image name, Check the image or tag exist',
                                'CreateContainerConfigError' : 'ConfigMap or Secret is missing. Identify the missing ConfigMap or Secret',
                                'CreateContainerError' : 'Container experienced an error when starting. Modify image specification to resolve it or Add a valid command to start the container',
                                'RunContainerError': "Run Container Error. Check  Driver, package version or status. "}
    try:
        if pod_item.status.container_statuses[0].state.waiting.reason in container_waiting_reason.keys():
            status["status"] = "error"
            status["reason"] = pod_item.status.container_statuses[0].state.waiting.reason
            status["resolution"] = container_waiting_reason[str(pod_item.status.container_statuses[0].state.waiting.reason)]
            try:
                status["message"] = pod_item.status.container_statuses[0].state.waiting.message
            except:
                pass
    
        # ContainerCreating
        elif pod_item.status.container_statuses[0].state.waiting.reason == "ContainerCreating":
            status["status"] = "installing"
            status["reason"] = "Take a long time to download image or Image have problem"
            status["resolution"] = "wait, and if pod restarts repeatly, this situation is error"
        return status
    
    except:
        pass
    # ---------------------------------------------------------------------------------------------
    if pod_item.status.phase == "Running":        
        try:
            if pod_item.status.container_statuses[0].state.running is None:
                status["status"] = "error"
                status["reason"] = "Pod is running, But container is waiting, " + str(pod_item.status.container_statuses[0].state.waiting.reason)
            else :
                status["status"] = "running"
        except Exception as e:
            status["status"] = "installing"
            status["reason"] = f"container creating : {e}"
    # ---------------------------------------------------------------------------------------------
    elif pod_item.status.phase == "Pending":
        # 1 pod = 1 docker
        if pod_item.status.container_statuses[0] is None:
            status["status"] = "installing"
            status["reason"] = "container creating : {pod_item.status.container_statuses[0]} is None"
        if pod_item.status.container_statuses[0].state is None:
            status["status"] = "installing"
            status["reason"] = "container creating : {pod_item.status.container_statuses[0].state} is None"
        return status
    # ---------------------------------------------------------------------------------------------
    elif pod_item.status.phase == "Failed":
        # 종료 상태
        status["status"] = "error"
        try :
            terminated_info = get_terminated_info(pod_item)
            status.update(terminated_info)
        except:
            status["reason"] =  pod_item.status.reason
            status["resolution"] = "Check the log"
    # ---------------------------------------------------------------------------------------------
    elif pod_item.status.phase == "Succeeded":
        # 종료 상태 
        # JOB, HPS 는 다음 상태에서 종료로 넘어감
        reason = pod_item.status.reason
        if reason is None or reason == "":
            reason = "Container Terminated"

        status["status"] = "running" 
        status["reason"] =  reason
        status["resolution"] = "Restart if unintentional shutdown."
    # ---------------------------------------------------------------------------------------------
    else :
        status["status"] = "error"
        status["reason"] = "unknown {}".format(pod_item.status.reason)
        status["resolution"] = "Check the log. Or Restart"
        
    if status["status"] == None:
        print("!!!", pod_item.status.phase)
        print("@@@", pod_item.status.container_statuses[0])
        print("?",pod_item)

    return status

def get_pod_training_tool_status(pod_item):

    pod_name = kube_parser.parsing_item_name(item=pod_item)
    labels = kube_parser.parsing_item_labels(item=pod_item)
    workspace_name = labels.get("workspace_name")
    training_name = labels.get("training_name")
    training_tool_type = labels.get("training_tool_type")


    # TOOL-JUPYTER
    # flag = JUPYTER_FLAG if training_tool_type == TOOL_TYPE[0] else ""
    # cmd_installing_check = "ls /jf-data/etc_host/{}/{}/.installing  > /dev/null 2>&1".format(workspace_name, training_name)
    # cmd_error_check = "ls /jf-data/etc_host/{}/{}/.error > /dev/null 2>&1".format(workspace_name, training_name)

    cmd_installing_check = "ls {}/{} > /dev/null 2>&1".format(POD_STATUS_IN_JF_API.format(pod_name=pod_name), POD_STATUS_INSTALLING_FLAG)
    cmd_error_check = "ls {}/{} > /dev/null 2>&1".format(POD_STATUS_IN_JF_API.format(pod_name=pod_name), POD_STATUS_ERROR_FLAG)

    if os.system(cmd_installing_check) == 0:
        status = {'status': 'installing', 'reason': None}
    elif os.system(cmd_error_check) == 0:
        status = {'status': 'error', 'reason': "The tool is closed or is not operating normally.", "resolution": "try restart."}
    else :
        status = {'status': 'running', 'reason': None}

    return status

def get_pod_deployment_status(pod_item):

    workspace_name = pod_item.metadata.labels.get("workspace_name")
    deployment_name = pod_item.metadata.labels.get("deployment_name")

    cmd_installing_check = "ls /jf-data/workspaces/{}/deployments/{}/.installing  > /dev/null 2>&1".format(workspace_name, deployment_name)

    if os.system(cmd_installing_check) == 0:
        status = {'status': 'installing', 'reason': 'API Starting'}
    else :
        status = {'status': 'running', 'reason': None}

    return status

def get_pod_deployment_worker_status(pod_item):
    # workspace_name = kube_parser.parsing_item_labels(pod_item).get("workspace_name")
    # deployment_name = kube_parser.parsing_item_labels(pod_item).get("deployment_name")
    # deployment_worker_id = kube_parser.parsing_item_labels(pod_item).get("deployment_worker_id")

    # cmd_installing_check = "ls /jf-data/workspaces/{}/deployments/{}/{}/.installing  > /dev/null 2>&1".format(workspace_name, deployment_name, deployment_worker_id)
    
    pod_name = kube_parser.parsing_item_name(item=pod_item)
    labels = kube_parser.parsing_item_labels(item=pod_item)

    cmd_installing_check = "ls {}/{} > /dev/null 2>&1".format(POD_STATUS_IN_JF_API.format(pod_name=pod_name), POD_STATUS_INSTALLING_FLAG)
    cmd_error_check = "ls {}/{} > /dev/null 2>&1".format(POD_STATUS_IN_JF_API.format(pod_name=pod_name), POD_STATUS_ERROR_FLAG)

    if os.system(cmd_installing_check) == 0:
        status = {'status': KUBE_POD_STATUS_INSTALLING, 'reason': 'API Starting'}
    elif os.system(cmd_error_check) == 0:
        status = {'status': KUBE_POD_STATUS_ERROR, 'reason': "API has been terminated"}
    else :
        status = {'status': KUBE_POD_STATUS_RUNNING, 'reason': None}

    return status

def get_item_stop_status(start_datetime, end_datetime):
    start_time_milliseconds = common.date_str_to_timestamp(start_datetime) #float(datetime.strptime(end_datetime, "%Y-%m-%d").strftime('%s.%f'))
    end_time_milliseconds = common.date_str_to_timestamp(end_datetime) #float(datetime.strptime(end_datetime, "%Y-%m-%d").strftime('%s.%f'))

    if time.time() >= end_time_milliseconds:
        return {"status": "expired", "reason": "TimeOut"}
    elif time.time() <= start_time_milliseconds:
        return {"status": "reserved", "reason": "Not Active"}
    else :
        return {"status": "stop", "reason": None}

def get_training_pod_status(training_id, pod_list=None):
    from utils.kube import kube_data
    if pod_list is None:
        pod_list = kube_data.get_pod_list()

    # return get_specific_pod_status(pod_list=pod_list, training_id=training_id, editor=False, work_type=TRAINING_TYPE)
    # return get_specific_pod_status(pod_list=pod_list, training_id=training_id, training_tool_type=[None, TOOL_TYPE[1]], work_type=TRAINING_TYPE) # editor 미포함
    return get_specific_pod_status(pod_list=pod_list, training_id=training_id, work_type=TRAINING_TYPE)

####################################################################################################

def get_specific_pod_status(pod_list=None, **kwargs):
    from utils.kube import kube_data, find_kuber_item_name_and_item
    if pod_list is None:
        pod_list = kube_data.get_pod_list()

    item_list = find_kuber_item_name_and_item(pod_list, **kwargs)
    if len(item_list) > 0:
        return get_pod_status(item_list[0]["item"])
    else:
        return None

def get_specific_training_tool_pod_status(pod_list, **kwargs):
    from utils.kube import find_kuber_item_name_and_item

    item_list = find_kuber_item_name_and_item(pod_list, **kwargs)
    if len(item_list) > 0:
        pod_status = get_pod_status(item_list[0]["item"])
        if pod_status["status"] == "running" and pod_status["interval"] > 5:
            tool_status = get_pod_training_tool_status(item_list[0]["item"])
            tool_status_status = tool_status["status"]
            tool_status_reason = tool_status["reason"]
            tool_status_resolution = tool_status.get("resolution")
            if pod_status["phase"] == "Succeeded":
                # JOB, HPS는 정상 상황이지만 Jupyter, SSH는 오류의 상황
                labels = kube_parser.parsing_item_labels(item_list[0]["item"])
                if labels.get("training_tool_type") in [ TOOL_EDITOR_KEY, TOOL_JUPYTER_KEY, TOOL_SSH_KEY ]:
                    pod_status["status"] = KUBE_POD_STATUS_ERROR
                else:
                    pod_status["status"] = tool_status_status
                    pod_status["reason"] = tool_status_reason
            else:
                pod_status["status"] = tool_status_status
                pod_status["reason"] = tool_status_reason
            
            pod_status["resolution"] = tool_status_resolution
            
        elif pod_status["interval"] <= 5:
            pod_status["status"] = "installing"
        return pod_status
    else:
        return None

def get_specific_training_tool_pod_status_list(pod_list, **kwargs):
    from utils.kube import find_kuber_item_name_and_item

    item_list = find_kuber_item_name_and_item(pod_list, **kwargs)
    status_list = []
    if len(item_list) > 0:
        for i in range(len(item_list)):
            pod_status = get_pod_status(item_list[i]["item"])
            if pod_status["status"] == "running" and pod_status["interval"] > 5:
                tool_status = get_pod_training_tool_status(item_list[i]["item"])
                pod_status["status"] = tool_status["status"]
                pod_status["reason"] = tool_status["reason"]
            elif pod_status["interval"] <= 5:
                pod_status["status"] = "installing"
            status_list.append(pod_status)
        return status_list
    else:
        return []

def get_specific_deployment_pod_status(pod_list, **kwargs):
    from utils.kube import find_kuber_item_name_and_item

    item_list = find_kuber_item_name_and_item(pod_list, **kwargs)
    if len(item_list) > 0:
        pod_status = get_pod_status(item_list[0]["item"])
        if pod_status["status"] == "running" and pod_status["interval"] > 5:
            deployment_status = get_pod_deployment_status(item_list[0]["item"])
            pod_status["status"] = deployment_status["status"]
            pod_status["reason"] = deployment_status["reason"]
        elif pod_status["interval"] <= 5:
            pod_status["reason"] = "container creating."
            pod_status["status"] = "installing"
        return pod_status
    else:
        return None

def get_specific_deployment_worker_pod_status(pod_list, **kwargs):
    # 하나라도 running 상태가 있으면 API 처리를 해줄 수 있으므로 Running 임.
    from utils.kube import find_kuber_item_name_and_item

    item_list = find_kuber_item_name_and_item(pod_list, **kwargs)
    pod_status_list = []
    if len(item_list) > 0:
        for item in item_list:
            pod_status = get_pod_status(item["item"])
            if pod_status["status"] == "running" and pod_status["interval"] > 5:
                deployment_status = get_pod_deployment_worker_status(item["item"])
                pod_status["status"] = deployment_status["status"]
                pod_status["reason"] = deployment_status["reason"]
            elif pod_status["interval"] <= 5:
                pod_status["reason"] = "container creating."
                pod_status["status"] = "installing"
            
            pod_status_list.append(pod_status)
        
        installing_flag = False
        for status in pod_status_list:
            if status["status"] == KUBE_POD_STATUS_RUNNING:
                pod_status = status
                break
            elif status["status"] == KUBE_POD_STATUS_INSTALLING:
                installing_flag = True
                pod_status = status
            elif installing_flag:
                # Installing 중인게 있는 상태에서 Error 케이스면 일단 installing 우선
                pass
            else :
                pod_status = status
        return pod_status
    else:
        return None


####################################################################################################

def get_service_status(service_id, pod_list=None, start_datetime=None, end_datetime=None):
    status = get_deployment_worker_status(deployment_id=service_id, pod_list=pod_list, start_datetime=start_datetime, end_datetime=end_datetime)
    if status["status"] == "running":
        status["status"] = "active"
    return status

def get_job_status(job_id, pod_list=None, queue_list=None):
    from utils.kube import kube_data
    if pod_list is None:
        # pod_list = coreV1Api.list_namespaced_pod(namespace="default")
        pod_list = kube_data.get_pod_list()
    if queue_list is None:
        queue_list = db.get_pod_queue()

    status = get_specific_pod_status(job_id=job_id, pod_list=pod_list)
    if status is None:
        status = {"status": None, "reason": None}
        for i, item in enumerate(queue_list):
            if job_id == item.get("job_id"):
                status["status"] = "pending"
                status["reason"] = "{}/{}".format(i+1,len(queue_list))
                return status
        status["status"] = "done"
    else :
        # if status["status"] == "error" or status["status"] == "installing":
        if status["status"] == "installing":
            status["status"] = "running"
    return status

def get_hyperparamsearch_status(hps_id, pod_list=None, queue_list=None):
    from utils.kube import kube_data
    if pod_list is None:
        # pod_list = coreV1Api.list_namespaced_pod(namespace="default")
        pod_lsit = kube_data.get_pod_list()
    if queue_list is None:
        queue_list = db.get_hyperparamsearch_queue()

    status = get_specific_pod_status(hps_id=hps_id, pod_list=pod_list)
    if status is None:
        status = {"status": None, "reason": None}
        for i, item in enumerate(queue_list):
            if hps_id == item.get("hps_id"):
                status["status"] = "pending"
                status["reason"] = "{}/{}".format(i+1,len(queue_list))
                return status
        status["status"] = "done"
    else :
        # if status["status"] == "error" or status["status"] == "installing":
        if status["status"] == "installing":
            status["status"] = "running"
    return status

def get_deployment_status(deployment_id, pod_list=None, start_datetime=None, end_datetime=None):
    from utils.kube import kube_data
    if pod_list is None:
        # pod_list = coreV1Api.list_namespaced_pod(namespace="default")
        pod_list = kube_data.get_pod_list()

    if start_datetime is None:
        start_datetime = "2000-01-01 00:00"
    if end_datetime is None:
        end_datetime = "9999-01-01 00:00"

    start_time_milliseconds = common.date_str_to_timestamp(start_datetime) #float(datetime.strptime(end_datetime, "%Y-%m-%d").strftime('%s.%f'))
    end_time_milliseconds = common.date_str_to_timestamp(end_datetime) #float(datetime.strptime(end_datetime, "%Y-%m-%d").strftime('%s.%f'))


    status = get_specific_deployment_pod_status(deployment_id=deployment_id, pod_list=pod_list)
    if status is None:
        status = get_item_stop_status(start_datetime, end_datetime)
    else :
        # if status["status"] == "installing":
        #     status["status"] = "running"
        if status["phase"] == "Succeeded":
            status["status"] = "error"

    return status

def get_deployment_worker_status(deployment_worker_id=None, deployment_id=None, pod_list=None, start_datetime=None, end_datetime=None):
    """
    Description : 

    Args :
        deployment_worker_id (int) : 특정 deployment_worker_id 만 조회 시

        deployment_id (int) : deployment_id를 가진 worker들 status 종합하여 (하나라도 running이면 ?) (deployment_id 밑에 worker 종류 외에도 생기면 추가 옵션이 필요)

        pod_list (object) : from kube_data.get_pod_list()
        start_datetime (str) : Workspace 시작 시간 ex ) "2000-01-01 00:00" - 예약 상태 표시용
        end_datetime (str) : Workspace 만료 시간 ex ) "2000-01-01 00:00" - 만료 상태 표시용
    """
    from utils.kube import kube_data
    if pod_list is None:
        # pod_list = coreV1Api.list_namespaced_pod(namespace="default")
        pod_list = kube_data.get_pod_list()

    if start_datetime is None:
        start_datetime = "2000-01-01 00:00"
    if end_datetime is None:
        end_datetime = "9999-01-01 00:00"

    start_time_milliseconds = common.date_str_to_timestamp(start_datetime) #float(datetime.strptime(end_datetime, "%Y-%m-%d").strftime('%s.%f'))
    end_time_milliseconds = common.date_str_to_timestamp(end_datetime) #float(datetime.strptime(end_datetime, "%Y-%m-%d").strftime('%s.%f'))

    find_options = {}
    if deployment_id:
        find_options["deployment_id"] = deployment_id
    if deployment_worker_id:
        find_options["deployment_worker_id"] = deployment_worker_id

    status = get_specific_deployment_worker_pod_status(**find_options, pod_list=pod_list)
    if status is None:
        status = get_item_stop_status(start_datetime, end_datetime)
    else :
        # if status["status"] == "installing":
        #     status["status"] = "running"
        if status["phase"] == "Succeeded":
            status["status"] = "error"

    return status

def get_training_status(training_id, pod_list=None, queue_list=None, start_datetime=None, end_datetime=None):
    import utils.scheduler as scheduler
    from utils.kube import kube_data

    if pod_list is None:
        pod_list = kube_data.get_pod_list()
    if start_datetime is None:
        start_datetime = "2000-01-01 00:00"
    if end_datetime is None:
        end_datetime = "9999-01-01 00:00"

    pod_status = get_training_pod_status(training_id=training_id, pod_list=pod_list)

    if pod_status is None:
        if queue_list is None:
            # queue_list = db.get_pod_queue_with_info()
            queue_list = scheduler.get_pod_queue()
        # Pending
        for i, pod in enumerate(queue_list):
            if training_id == pod.get("training_id"):
                pod_status = {'status': 'pending', 'reason': '{}/{}'.format(i, len(queue_list))}
                return pod_status
        # Stop (아무곳에도 정보가 없음)
        pod_status = get_item_stop_status(start_datetime, end_datetime)

        return pod_status
    else :
        if pod_status["status"] == "error" or pod_status["status"] == "installing":
        # if pod_status["status"] == "installing":
            pod_status["status"] = "running"

    return pod_status

def get_training_job_status(training_id, pod_list=None, queue_list=None, start_datetime=None, end_datetime=None):
    """
    Description : Training 내 job status 조회. 개별 아이템에 대한 세세한 조회가 아닌 
    해당 training에 있는 job 상태가 running, pending, stop 인지 확인용

    Args :
        training_id (int) : 조회 할 training id
        pod_list (list(object)) : kube_data.get_pod_list()
        queue_list (list) : scheduler.get_pod_queue()

        start_datetime (str): Workspace의 시작 시간  ex) "2000-01-01 00:00"
        end_datetime (str): Workspace의 만료 시간  ex) "9999-01-01 00:00"
    """
    import utils.scheduler as scheduler
    from utils.kube import kube_data

    if pod_list is None:
        pod_list = kube_data.get_pod_list()
    if start_datetime is None:
        start_datetime = "2000-01-01 00:00"
    if end_datetime is None:
        end_datetime = "9999-01-01 00:00"

    pod_status = get_specific_pod_status(training_id=training_id, work_func_type=TRAINING_ITEM_A, pod_list=pod_list)
    if pod_status is None:
        if queue_list is None:
            queue_list = scheduler.get_pod_queue()
        # Pending
        for i, pod in enumerate(queue_list):
            if training_id == pod.get("training_id") and pod.get("job_id") is not None:
                pod_status = {'status': 'pending', 'reason': '{}/{}'.format(i, len(queue_list))}
                return pod_status

        # Stop (아무곳에도 정보가 없음)
        pod_status = get_item_stop_status(start_datetime, end_datetime)

        return pod_status
    else :
        if pod_status["status"] == "error" or pod_status["status"] == "installing":
        # if pod_status["status"] == "installing":
            pod_status["status"] = "running"

    return pod_status   

#TODO training으로 옮기기. (성격 안맞음)
def get_training_all_tool_pod_status(training_tool_list, pod_list=None, start_datetime=None, end_datetime=None):
    all_tool_pod_status = {}
    for training_tool in training_tool_list:
        training_tool_id = training_tool["id"]
        training_tool_type = TOOL_TYPE[training_tool["tool_type"]]
        all_tool_pod_status[training_tool_type] = get_training_tool_pod_status(training_tool_id=training_tool_id, pod_list=pod_list, start_datetime=start_datetime, end_datetime=end_datetime)
    return all_tool_pod_status

def get_training_tool_pod_status(training_tool_id, pod_list=None, queue_list=None, start_datetime=None, end_datetime=None):
    """
    Description : Tool ID 를 통해 해당 Tool의 상태 조회. (job,hps + tool 모두 가능)

    Args :
        training_tool_id (int) : 조회할 Tool ID
        pod_list (list(object)) : kube_data.get_pod_list()
        queue_list (list) : scheduler.get_pod_queue()

        start_datetime (str): Workspace의 시작 시간  ex) "2000-01-01 00:00"
        end_datetime (str): Workspace의 만료 시간  ex) "9999-01-01 00:00"

    Returns :
        (dict) : {
            "status": (str) "running" | "pending" | "installing" ...
            "reason": (str) ...
        }
    """
    from utils.kube import kube_data
    from utils.scheduler import get_pod_queue
    if pod_list is None:
        # pod_list = coreV1Api.list_namespaced_pod(namespace="default")
        pod_list = kube_data.get_pod_list()
    if start_datetime is None:
        start_datetime = "2000-01-01 00:00"
    if end_datetime is None:
        end_datetime = "9999-01-01 00:00"
    
    if training_tool_id is None:
        return {"status": "stop", "reason": None}
    status = get_specific_training_tool_pod_status(training_tool_id=training_tool_id, pod_list=pod_list)
    if status is None:
        if queue_list is None:
            queue_list = get_pod_queue()
        
        # Pending
        for i, pod in enumerate(queue_list):
            if training_tool_id == pod.get("training_tool_id"):
                pod_status = {'status': 'pending', 'reason': '{}/{}'.format(i, len(queue_list))}
                return pod_status

        status = get_item_stop_status(start_datetime, end_datetime)
    return status

def get_training_tool_pod_status_list(training_id, pod_list=None, start_datetime=None, end_datetime=None):
    from utils.kube import kube_data
    if pod_list is None:
        pod_list = kube_data.get_pod_list()
    if start_datetime is None:
        start_datetime = "2000-01-01 00:00"
    if end_datetime is None:
        end_datetime = "9999-01-01 00:00"
    
    # status_list len == 0 -> stoped
    status_list = get_specific_training_tool_pod_status_list(training_id=training_id, pod_list=pod_list)
    return status_list