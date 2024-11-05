from utils.resource import CustomResource, token_checker
import utils.common as common
import utils.kube as kube
import utils.kube_parser as kube_parser
import utils.scheduler as scheduler
import utils.db as db
from TYPE import *
from utils.access_check import check_training_access_level
from utils.access_check import workspace_access_check, training_access_check
from lock import jf_scheduler_lock
from restplus import api
from utils.resource import response
import traceback
ns = api.namespace('trainings', description='Training 관련 API')

stop_jobs_parser = api.parser()
stop_jobs_parser.add_argument('training_id', type=int, required=True, location='args', help="training id")
stop_jobs_parser.add_argument('job_group_number', type=int, required=False, default=None, location='args', help="job_group_number (job_group_id = job_group_number). None 선언 시 해당 training의 전체 job 종료 및 삭제(pending 아이템에 대해)")


def get_job_progress(training_id, pod_list=None, queue_list=None, job_list=None):
    """
    Description :
        활성화 되어있는 (Pending | Running) Job의 진행 사항

    Args :
        job_list (list(dict)) : [ (job info), (job info) ]
        pod_list (object) :
        queue_list (list(dict)) : [ (queue info), (queue info) ]

    Returns :
        (dict) : {
            'current_job_status': {
                'status': {'total': 10, 'done': 3, 'pending': 6, 'running': 1, 'status': 'running'}, 
                'progress': 30
            }, 
            'queue_job_status': {
                'status': {'total': 7, 'done': 0, 'pending': 7, 'running': 0, 'status': 'stop'}, 
                'progress': 0}
            },
            'current_job_info': {
            'id': 495,
            'name': 'bbbbb',
            'training_id': 78,
            'training_name': 'pvpvpvpvpv',
            'dataset_name': None,
            'image_name': '[jf]gpu_torch',
            'parameter': '',
            'create_datetime': '2022-03-16 09:10:02',
            'start_datetime': '2022-03-16 09:41:38',
            'end_datetime': None,
            'job_group_index': 1,
            'group_number': 41,
            'gpu_acceleration': 0,
            'unified_memory': 0,
            'rdma': 0,
            'configurations': 'Intel(R) Core(TM) i9-10900X CPU @ 3.70GHz',
            'network_interface': None,
            'gpu_count': 0,
            'runner_name': 'yeobie',
            'run_code': '/examples/hps_fast_test_mutiple_param.py',
            'workspace_name': 'robert-ws'}
        }
            
    """
    if pod_list is None:
        pod_list = kube.kube_data.get_pod_list()
        
    if queue_list is None:
        queue_list = scheduler.get_pod_queue()
        
    if job_list is None:
        job_list = db.get_job_list(training_id=training_id)
    
    
    #
    active_group_number_list = []
    
    # Get running group number
    job_pod_list = kube.find_kuber_item_name_and_item(item_list=pod_list, work_func_type=TRAINING_ITEM_A, training_id=training_id)
    for job_pod in job_pod_list:
        pod_job_group_number = kube_parser.parsing_item_labels(job_pod["item"]).get("job_group_number")
        if kube_parser.parsing_item_labels(job_pod["item"]).get("job_group_number"):
            active_group_number_list.append(int(pod_job_group_number))
        
        
    for queue_item in queue_list:
        if training_id == queue_item.get("training_id"):
            job_group_number = queue_item.get("job_group_number")
            if job_group_number:
                active_group_number_list.append(int(job_group_number))
    
    active_group_number_list = list(set(active_group_number_list))
    total_job_status = {'total':0, 'done':0, 'pending':0 , 'running':0}
    current_job_status = {'total':0, 'done':0, 'pending':0 , 'running':0}
    queue_job_status = {'total':0, 'done':0, 'pending':0 , 'running':0}
    
    def get_return_form(current_job_status, queue_job_status, current_job_info=None):
        def set_status(job_status):
            # running, stop, pending ...
            if job_status["running"] > 0:
                job_status["status"] = KUBE_POD_STATUS_RUNNING
            elif job_status["pending"] > 0:
                job_status["status"] = KUBE_POD_STATUS_PENDING
            else :
                job_status["status"] = KUBE_POD_STATUS_STOP
                
        if current_job_status["total"] > 0:
            current_job_progress = int(round((current_job_status["done"])/current_job_status["total"] ,2)*100)
        else :
            current_job_progress = 0
            
        set_status(current_job_status)
        set_status(queue_job_status)
            
        return {
            "current_job_status": {
                "status": current_job_status,
                "progress": current_job_progress
            },
            "queue_job_status": {
                "status": queue_job_status,
                "progress": 0
            },
            "current_job_info": current_job_info
        }
    
    if len(active_group_number_list) == 0:
        if len(job_list) == 0:
            return get_return_form(current_job_status=current_job_status, queue_job_status=queue_job_status)
        else:
            current_job_group_number= job_list[0].get("group_number")
    else:
        current_job_group_number = min(active_group_number_list)
    
    # Get Queue group number
    
    current_job_info = None
    for job in job_list:
        job_status = kube.get_job_status(job_id=job["id"], pod_list=pod_list, queue_list=queue_list)
        total_job_status['total'] += 1
        if job_status['status'] in KUBER_RUNNING_STATUS:
            job_status['status'] = KUBE_POD_STATUS_RUNNING

        total_job_status[job_status['status']] += 1
        
        if job['group_number'] == current_job_group_number:
            if current_job_info is not None:
                if job_status["status"] in [KUBE_POD_STATUS_DONE, KUBE_POD_STATUS_RUNNING]:
                    # Done, Running 케이스는 이면 최신화 (오름차순이므로 Running 보다 높은 id는 Pending)
                    current_job_info = job
                elif job_status["status"] == KUBE_POD_STATUS_PENDING:
                    # Pending 일 땐 가장 앞의 아이템
                    if current_job_info["id"] > job["id"]:
                        current_job_info = job
            else:
                current_job_info = job

            current_job_status['total'] += 1
            current_job_status[job_status['status']] += 1
            job_last_create_datetime_ts = common.date_str_to_timestamp(job["create_datetime"])
        
        elif job['group_number'] in active_group_number_list:
            queue_job_status['total'] += 1
            queue_job_status[job_status['status']] += 1


    return get_return_form(current_job_status=current_job_status, queue_job_status=queue_job_status, current_job_info=current_job_info)


def stop_jobs(training_id, job_group_number=None):
    from training import delete_item_checkpoints
    try:
        training_info = db.get_training(training_id=training_id)

        training_name = training_info["training_name"]
        workspace_name = training_info["workspace_name"]
        job_list = db.get_job_list(training_id=training_id)
        pod_list = kube.get_list_namespaced_pod()
        delete_job_list = []
        with jf_scheduler_lock:
            for job in job_list:
                if job_group_number is not None and job["group_number"] != job_group_number:
                    continue
                status = kube.get_job_status(job_id=job["id"], pod_list=pod_list)
                # if status["status"] in ["running", "pending"]:
                # running -> done
                if status["status"] in ["pending"]:
                    delete_job_list.append(job["id"])
                    delete_item_checkpoints(workspace_name=workspace_name, training_name=training_name, 
                                            item_name=job["name"], item_group_index=job["job_group_index"], item_type=TRAINING_ITEM_A)
            if len(delete_job_list) > 0:
                db.delete_pod_queues(training_id=training_id, job_id_list=delete_job_list)
                delete_result = db.delete_jobs(job_id_list=delete_job_list)
            if job_group_number:
                res, message = kube.kuber_item_remove(training_id=training_id, job_group_number=job_group_number, work_func_type=CREATE_KUBER_TYPE[0])
            else :
                res, message = kube.kuber_item_remove(training_id=training_id, work_func_type=CREATE_KUBER_TYPE[0])
            if res == False:
                return response(status=0, message="Stop training error : {}".format(message))

        return response(status=1, message=message)
    except:
        traceback.print_exc()
    return response(status=0, message="fail")




#TODO (2022-03-16) training_id로 삭제하면 다른 pending 아이템까지 삭제 
#training_id -> training_id + job_group_number 로 해당 group에 대한 아이템 삭제만 이뤄지도록 변경
@ns.route("/stop_jobs", methods=["GET"])
class StopJobs(CustomResource):
    @ns.expect(stop_jobs_parser)
    @token_checker
    @training_access_check(stop_jobs_parser, allow_max_level=3)
    def get(self):
        """
            JOB Group Stop
            ---
            # Inputs
            변수 입력에 따라서 케이스가 달라짐
            
                training_id (int) : (필수)
                job_group_number (int) : (선택) (job_group_id = job_group_number 같은 개념.)
                
                training_id - training의 Running, Pending 중인 job 종료 및 삭제
                training_id + job_group_number - training의 Running, Pending 중인 job 중 job_group_number 에 맞는 아이템만 종료 및 삭제
            ---
            # returns
            성공 실패 여부 전달
            
                status (int): 0(실패), 1(성공)
        """
        args = stop_jobs_parser.parse_args()

        training_id = args["training_id"]
        job_group_number = args["job_group_number"]
        res = stop_jobs(training_id=training_id, job_group_number=job_group_number)
        db.request_logging(self.check_user(), 'trainings/stop_jobs', 'get', str(args), res['status'])
        return self.send(res)