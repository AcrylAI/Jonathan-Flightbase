from sys import dont_write_bytecode
from typing_extensions import runtime
from restplus import api
from flask_restplus import reqparse
from flask import send_from_directory, jsonify, wrappers
from utils.resource import CustomResource, response, token_checker
import utils.db as db
from utils.resource import response
import utils.kube as kube
from utils.kube import get_node_status, kube_data
# from utils.kube_create_func import create_deployment_pod_o
from utils.kube_create_func import update_deployment_pod_ingress, PodName
import traceback
from TYPE import TRAINING_TYPE, TRAINING_TYPE_A, TRAINING_TYPE_C, TRAINING_TYPE_D, TRAINING_BUILT_IN_TYPES
from TYPE import DEPLOYMENT_TYPE, DEPLOYMENT_TYPE_A, DEPLOYMENT_TYPE_B, DEPLOYMENT_TYPE_C, DEPLOYMENT_TYPES
from TYPE import *
# from settings import DEPLOYMENT_API_MODE, JF_BUILT_IN_MODELS_PATH, JF_TRAINING_PATH, JF_DEPLOYMENT_LOG_DIR_PATH
from settings import *
# from settings import DEPLOYMENT_API_MODE, JF_BUILT_IN_MODELS_PATH, JF_TRAINING_PATH, JF_DEPLOYMENT_WORKER_LOG_DIR_PATH
import utils.common as common
from lock import jf_scheduler_lock
from datetime import date, datetime, timedelta
import utils.scheduler as scheduler
from utils.exceptions import *
from utils.exceptions_deployment import *
from utils.access_check import deployment_access_check, workspace_access_check, check_deployment_access_level
from utils.access_check import check_inaccessible_deployment_template, check_deployment_template_access_level
from utils.access_check import check_inaccessible_deployment
import HELP

import string
import hashlib
import os
import pwd, grp
import random
import settings
import json
import subprocess
from ast import literal_eval
import statistics
import math

#TODO operating_type -> instance_type 으로 DB 정보 변경 필요해보임.
DEPLOYMENT_FLAG = kube.DEPLOYMENT_FLAG
INGRESS_PROTOCOL = settings.INGRESS_PROTOCOL
# KUBER_NOT_RUNNING_STATUS = TYPE.KUBER_NOT_RUNNING_STATUS
ns = api.namespace('deployments', description='deployment API')


deployment_get = api.parser()
deployment_get.add_argument('workspace_id', required=False, type=int, default=None, location='args', help='Workspace id')
deployment_get.add_argument('training_id', required=False, type=str, default=None, location='args', help='Training id(training 페이지 내에서 조회하는 경우)')
deployment_get.add_argument('sort', required=False, type=str, default=None, location='args', help='Sort Type')
deployment_get.add_argument('protocol', required=False, default=INGRESS_PROTOCOL, type=str, location='args', help='front protocol =? http or https')

deployment_post = api.parser()
deployment_post.add_argument('workspace_id', required=True, type=int, location='json', help='Workspace id')
deployment_post.add_argument('deployment_name', required=True, type=str, location='json', help='deployment name')
deployment_post.add_argument('description', required=False, default="",type=str, location='json', help='deployment description')
deployment_post.add_argument('deployment_type', required=True, type=str, location='json', help='deployment type : {}'.format(DEPLOYMENT_TYPES))
deployment_post.add_argument('training_id', required=False, type=int, default=None, location='json', help='training_id = training model (id)')
deployment_post.add_argument('job_id', required=False, type=int, default=None, location='json', help='job_id = checkpoint(id)')
deployment_post.add_argument('hps_id', required=False, type=int, default=None, location='json', help='hps_id = checkpoint(id)')
deployment_post.add_argument('hps_number', required=False, type=int, default=None, location='json', help='hps_number')
deployment_post.add_argument('command', required=False, type=dict, default=None, location='json', help='command = {"binary":"python", "script":"/jf-training-home/src/get_api.py", "arguments":"--a aa --b bb -c"}')
deployment_post.add_argument('environments', required=False, type=list, default=None, location='json', help='environments = [{"name":"FLASK_APP","value":"app"},{"name":"FLASK_ENV","value":"development"}]')
# 삭제 예정 run_code
deployment_post.add_argument('run_code', required=False, type=str, default=None, location='json', help='run_code = /src/[RUN CODE] (only in custom model)')
deployment_post.add_argument('checkpoint', required=False, type=str, default=None, location='json', help='checkpoint = job_name/grop_index/checkpoint (name)')
deployment_post.add_argument('built_in_model_id', required=False, type=int, default=None, location='json', help='For default built-in')

deployment_post.add_argument('instance_type', required=True, type=str, location='json', help='instance_type : CPU or GPU ')
deployment_post.add_argument('gpu_count', required=False, default=0, type=int, location='json', help='instance_type = GPU case -> gpu_count ')
deployment_post.add_argument('gpu_model', type=dict, required=False, default=None, location='json', help=HELP.GPU_MODEL)
deployment_post.add_argument('node_mode', type=int, required=False, default=1, location='json', help='Node Mode ((0) Single, (1) Multiple)' )
deployment_post.add_argument('node_name', type=dict, required=False, default=None, location='json', help=HELP.NODE_NAME + "삭제 예정 (2022-11-07 Yeobie)")
deployment_post.add_argument('node_name_cpu', type=dict, required=False, default=None, location='json', help=HELP.NODE_NAME)
deployment_post.add_argument('node_name_gpu', type=dict, required=False, default=None, location='json', help=HELP.NODE_NAME)
deployment_post.add_argument('access', type=int, required=True, location='json', help='Access Type : 0 = private, 1 = public')
deployment_post.add_argument('owner_id', type=int, required=True, location='json', help='Owner Id' )
deployment_post.add_argument('users_id', type=list, required=False, default=None, location='json', help='Users Id' )
deployment_post.add_argument('docker_image_id', type=int, required=True, location='json', help='Docker Image ID (-1 = jf default)' )
deployment_post.add_argument('training_type', type=str, required=False, default="job", location='json', help='training type = job / hps' )
deployment_post.add_argument('deployment_template', type=dict, required=False, default=None, location='json', help='deployment template' )
deployment_post.add_argument('deployment_template_id', type=int, required=False, default=None, location='json', help='deployment template id' )
deployment_post.add_argument('deployment_template_name', type=str, required=False, default=None, location='json', help='Deployment Template Name' )
deployment_post.add_argument('deployment_template_description', type=str, required=False, default="", location='json', help='Deployment Template Description' )
deployment_post.add_argument('deployment_template_group_id', type=int, required=False, default=None, location='json', help='Deployment Template Group ID' )
deployment_post.add_argument('deployment_template_group_name', type=str, required=False, default=None, location='json', help='Deployment Template Group Name' )
deployment_post.add_argument('deployment_template_group_description', type=str, required=False, default="", location='json', help='Deployment Template Group Description' )


deployment_put = api.parser()
deployment_put.add_argument('deployment_id', required=True, type=int, location='json', help='deployment id ')
deployment_put.add_argument('description', required=False, default="",type=str, location='json', help='deployment description')
deployment_put.add_argument('deployment_type', required=True, default="built-in", type=str, location='json', help='deployment type : {}'.format(DEPLOYMENT_TYPES))
deployment_put.add_argument('training_id', required=False, type=int, location='json', help='training_id = training model (id)')
deployment_put.add_argument('job_id', required=False, type=int, location='json', help='job_id = checkpoint(id)')
deployment_put.add_argument('hps_id', required=False, type=int, location='json', help='hps_id = checkpoint(id)')
deployment_put.add_argument('hps_number', required=False, type=int, default=None, location='json', help='hps_number')
deployment_put.add_argument('command', required=False, type=dict, default=None, location='json', help='command = {"binary":"python", "script":"/jf-training-home/src/get_api.py", "arguments":"--a aa --b bb -c"}')
deployment_put.add_argument('environments', required=False, type=list, default=None, location='json', help='environments = [{"name":"FLASK_APP","value":"app"},{"name":"FLASK_ENV","value":"development"}]')
# 삭제 예정
deployment_put.add_argument('run_code', required=False, type=str, default=None, location='json', help='run_code = /src/[RUN CODE] (only in custom model)')
deployment_put.add_argument('checkpoint', required=False, type=str, location='json', help='checkpoint = job_name/grop_index/checkpoint (name)')
deployment_put.add_argument('built_in_model_id', required=False, type=int, default=None, location='json', help='For default built-in')
deployment_put.add_argument('instance_type', required=True, type=str, location='json', help='instance_type : CPU or GPU ')
deployment_put.add_argument('gpu_count', required=False, default=0, type=int, location='json', help='instance_type = GPU case -> gpu_count ')
deployment_put.add_argument('gpu_model', type=dict, required=False, default=None, location='json', help=HELP.GPU_MODEL)
deployment_put.add_argument('node_mode', type=int, required=False, default=1, location='json', help='Node Mode ((0) Single, (1) Multiple)' )
deployment_put.add_argument('node_name', type=dict, required=False, default=None, location='json', help=HELP.NODE_NAME)
deployment_put.add_argument('node_name_cpu', type=dict, required=False, default=None, location='json', help=HELP.NODE_NAME)
deployment_put.add_argument('node_name_gpu', type=dict, required=False, default=None, location='json', help=HELP.NODE_NAME)
deployment_put.add_argument('access', type=int, required=True, location='json', help='Access Type : 0 = private, 1 = public')
deployment_put.add_argument('owner_id', type=int, required=True, location='json', help='Owner Id' )
deployment_put.add_argument('users_id', type=list, required=False, default=None, location='json', help='Users Id' )
deployment_put.add_argument('docker_image_id', type=int, required=True, location='json', help='Docker Image ID (-1 = jf default)' )
deployment_put.add_argument('training_type', type=str, required=False, default="job", location='json', help='training type = job / hps' )
deployment_put.add_argument('deployment_template', type=dict, required=False, default=None, location='json', help='deployment template' )
deployment_put.add_argument('deployment_template_id', type=int, required=False, default=None, location='json', help='deployment template id' )
deployment_put.add_argument('deployment_template_name', type=str, required=False, default=None, location='json', help='Deployment Template Name' )
deployment_put.add_argument('deployment_template_description', type=str, required=False, default="", location='json', help='Deployment Template Description' )
deployment_put.add_argument('deployment_template_group_id', type=int, required=False, default=None, location='json', help='Deployment Template Group ID' )
deployment_put.add_argument('deployment_template_group_name', type=str, required=False, default=None, location='json', help='Deployment Template Group Name' )
deployment_put.add_argument('deployment_template_group_description', type=str, required=False, default="", location='json', help='Deployment Template Group Description' )



create_deployment_info_get = api.parser()
create_deployment_info_get.add_argument('workspace_id', required=False, type=int, default=None, location='args', help='Workspace id ( not => return  workspace_list )')

deployment_id_parser = api.parser()
deployment_id_parser.add_argument('deployment_id', required=True, type=int, default=None, location='args', help='Deployment id ')

deployment_checkpoint_post = api.parser()
deployment_checkpoint_post.add_argument('workspace_id', required=True, type=int, location='json', help='Workspace id')
deployment_checkpoint_post.add_argument('checkpoint_id', required=True, type=str, default=None, location='json', help='checkpoint = job_name/grop_index/checkpoint (name)')
# deployment_checkpoint_post.add_argument('built_in_model_id', required=False, type=int, default=None, location='json', help='For default built-in')
deployment_checkpoint_post.add_argument('owner_id', type=int, required=True, location='json', help='Owner Id' )
deployment_checkpoint_post.add_argument('gpu_count', required=True, default=0, type=int, location='json', help='instance_type = GPU case -> gpu_count ')

create_deployment_api_parser = api.parser()
create_deployment_api_parser.add_argument('custom_deployment_json', type=str, required=True, location='json', help="Custom deployment information json in string")

total_api_monitor_parser = api.parser()
total_api_monitor_parser.add_argument('deployment_id', type=int, required=True, location='args', help='deployment id')
total_api_monitor_parser.add_argument('start_time', type=str, required=False, default="2021-11-01 00:00:00", location='args', 
                                        help='search start time %Y-%m-%d %H:%M:%S')
total_api_monitor_parser.add_argument('end_time', type=str, required=False, default="2021-11-07 00:00:00", location='args', 
                                        help='search end time %Y-%m-%d %H:%M:%S')
total_api_monitor_parser.add_argument('interval', type=int, required=False, default=600, location='args', help='search interval second')
total_api_monitor_parser.add_argument('worker_list', type=str, required=False, default=None, location='args', help='worker list')
total_api_monitor_parser.add_argument('absolute_location', type=bool, required=False, default=True, location='args', 
                                        help='dashboard streaming->True, user searching->False')
# total_api_monitor_parser.add_argument('total_logic', type=str, required=False, default="median", location='args', 
#                                         help='graph logic = mean/median/percentile60')
# total_api_monitor_parser.add_argument('processing_time_logic', type=str, required=False, default="median", location='args', 
#                                         help='function response time logic = mean/median/percentile60')
# total_api_monitor_parser.add_argument('response_time_logic', type=str, required=False, default="median", location='args', 
#                                         help='nginx response time logic = mean/median/percentile60')
total_api_monitor_parser.add_argument('search_type', type=str, required=False, default="range", location='args', help='search type range/live')


download_log_parser = api.parser()
download_log_parser.add_argument('deployment_id', type=int, required=True, location='args', help='deployment id')
download_log_parser.add_argument('worker_list', type=str, required=False, default=None, location='args', help='worker list')
download_log_parser.add_argument('start_time', type=str, required=False, default=None, location='args', 
                                        help='search start time %Y-%m-%d %H:%M:%S')
download_log_parser.add_argument('end_time', type=str, required=False, default=None, location='args', 
                                        help='search end time %Y-%m-%d %H:%M:%S')
download_log_parser.add_argument('nginx_log', type=bool, required=False, location='args', help='nginx_log=True or No Key')
download_log_parser.add_argument('api_log', type=bool, required=False, location='args', help='api_log=True or No Key')


deployment_bookmark_post_parser = api.parser()
deployment_bookmark_post_parser.add_argument('deployment_id', type=int, required=True, location='json', help='deployment id')

deployment_bookmark_delete_parser = api.parser()
deployment_bookmark_delete_parser.add_argument('deployment_id', type=int, required=True, location='json', help='deployment id')

delete_log_parser = api.parser()
delete_log_parser.add_argument('deployment_id', type=int, required=True, location='args', help='deployment id')
delete_log_parser.add_argument('end_time', type=str, required=False, default=None, location='args', 
                                help='search end time %Y-%m-%d')
delete_log_parser.add_argument('worker_list', type=str, required=False, default=None, location='args', help='100, 101')

get_worker_list_by_date_parser = api.parser()
get_worker_list_by_date_parser.add_argument('deployment_id', type=int, required=True, location='args', help='deployment id')
get_worker_list_by_date_parser.add_argument('end_time', type=str, required=True, default=None, location='args', 
                                            help='search end time %Y-%m-%d %H:%M:%S')

deployment_api_path_update_parser = api.parser()
deployment_api_path_update_parser.add_argument('deployment_id', type=int, required=True, location='json', help='deployment id')
deployment_api_path_update_parser.add_argument('api_path', type=str, required=True, location='json', help='user define api address')

deployment_template_delete_parser = api.parser()
deployment_template_delete_parser.add_argument('deployment_template_id', type=int, required=True, location='json', help='deployment id')

deployment_template_list_get_parser = api.parser()
deployment_template_list_get_parser.add_argument('workspace_id', type=int, required=True, location='args', help='workspace id')
deployment_template_list_get_parser.add_argument('deployment_template_group_id', type=int, required=False, default=None, location='args', help='deployment template group id')
deployment_template_list_get_parser.add_argument('is_ungrouped_template', type=int, required=False, default=0, location='args', help='ungrouped=1')

deployment_template_group_get_parser = api.parser()
deployment_template_group_get_parser.add_argument('workspace_id', type=int, required=True, location='args', help='workspace id')

deployment_template_group_post_parser = api.parser()
deployment_template_group_post_parser.add_argument('workspace_id', required=True, type=int, location='json', help='Workspace id')
deployment_template_group_post_parser.add_argument('deployment_template_group_name', type=str, required=True, location='json', help='Deployment Template Group Name' )
deployment_template_group_post_parser.add_argument('deployment_template_group_description', type=str, required=False, default=None, location='json', help='Deployment Template Group Description' )

deployment_template_group_put_parser = api.parser()
deployment_template_group_put_parser.add_argument('workspace_id', required=True, type=int, location='json', help='Workspace id')
deployment_template_group_put_parser.add_argument('deployment_template_group_id', required=True, type=int, location='json', help='Deployment Template Group id')
deployment_template_group_put_parser.add_argument('deployment_template_group_name', type=str, required=False, location='json', help='Deployment Template Group Name' )
deployment_template_group_put_parser.add_argument('deployment_template_group_description', type=str, required=False, default=None, location='json', help='Deployment Template Group Description' )


deployment_template_get_parser = api.parser()
deployment_template_get_parser.add_argument('workspace_id', type=int, required=True, location='args', help='workspace id')
deployment_template_get_parser.add_argument('deployment_template_id', type=int, required=True, location='args', help='deployment template id')

deployment_template_post_parser = api.parser()
deployment_template_post_parser.add_argument('workspace_id', type=int, required=True, location='json', help='workspace id')
deployment_template_post_parser.add_argument('deployment_template_id', type=int, required=False, location='json', help='Deployment Template id')
deployment_template_post_parser.add_argument('deployment_template_name', type=str, required=True, location='json', help='Deployment Template Name' )
deployment_template_post_parser.add_argument('deployment_template_description', type=str, required=False, default=None, location='json', help='Deployment Template Description' )
deployment_template_post_parser.add_argument('deployment_template_group_id', required=False, type=int, location='json', help='Deployment Template Group id')
deployment_template_post_parser.add_argument('deployment_template_group_name', type=str, required=False, location='json', help='Deployment Template Group Name' )
deployment_template_post_parser.add_argument('deployment_template_group_description', type=str, required=False, default=None, location='json', help='Deployment Template JSON' )
deployment_template_post_parser.add_argument('deployment_template', type=dict, required=False, default=None, location='json', help='Deployment Template JSON String' )
deployment_template_post_parser.add_argument('deployment_type', required=False, type=str, location='json', help='deployment type : {}'.format(DEPLOYMENT_TYPES))
deployment_template_post_parser.add_argument('training_id', required=False, type=int, default=None, location='json', help='training_id = training model (id)')
deployment_template_post_parser.add_argument('training_type', type=str, required=False, default=None, location='json', help='training type = job / hps' )
deployment_template_post_parser.add_argument('job_id', required=False, type=int, default=None, location='json', help='job_id')
deployment_template_post_parser.add_argument('hps_id', required=False, type=int, default=None, location='json', help='hps_id')
deployment_template_post_parser.add_argument('hps_number', required=False, type=int, default=None, location='json', help='hps_number')
deployment_template_post_parser.add_argument('checkpoint', required=False, type=str, default=None, location='json', help='checkpoint = job_name/grop_index/checkpoint (name)')
deployment_template_post_parser.add_argument('command', required=False, type=dict, default=None, location='json', help='command = {"binary":"python", "script":"/jf-training-home/src/get_api.py", "arguments":"--a aa --b bb -c"}')
deployment_template_post_parser.add_argument('environments', required=False, type=list, default=None, location='json', help='environments = [{"name":"FLASK_APP","value":"app"},{"name":"FLASK_ENV","value":"development"}]')
deployment_template_post_parser.add_argument('built_in_model_id', required=False, type=int, default=None, location='json', help='For default built-in')

deployment_template_put_parser = api.parser()
deployment_template_put_parser.add_argument('workspace_id', type=int, required=True, location='json', help='workspace id')
deployment_template_put_parser.add_argument('deployment_template_id', type=int, required=True, location='json', help='deployment template id')
deployment_template_put_parser.add_argument('deployment_template_name', type=str, required=False, location='json', help='Deployment Template Name' )
deployment_template_put_parser.add_argument('deployment_template_description', type=str, required=False, default=None, location='json', help='Deployment Template Description' )
deployment_template_put_parser.add_argument('deployment_template_group_id', required=False, type=int, location='json', help='Deployment Template Group id')
deployment_template_put_parser.add_argument('deployment_template_group_name', type=str, required=False, location='json', help='Deployment Template Group Name' )
deployment_template_put_parser.add_argument('deployment_template_group_description', type=str, required=False, default=None, location='json', help='Deployment Template Group Description' )

deployment_template_id_parser = api.parser()
deployment_template_id_parser.add_argument('template_id', type=int, required=True, location='args', help='deployment template id' )

import hashlib
import random
import time
def gen_hash(text):
    text = text + str(time.time) + str(random.random())
    text = text
    hash_ = hashlib.md5(text.encode())
    return hash_.hexdigest()

# Deployment 목록 조회 시 worker개수, gpu-cpu개수, configuration 정보 제공용 
class DeploymentStatus():
    def __init__(self):
        self.deployment_status = KUBE_POD_STATUS_STOP
        self.worker_status_dict = {KUBE_POD_STATUS_RUNNING: 0, KUBE_POD_STATUS_INSTALLING:0, KUBE_POD_STATUS_ERROR: 0}
        self.worker_configurations = []
        self.worker_usage_case = {"gpu":0 , "cpu": 0}
        self.worker_count = 0
        self.running_worker_list = []

    def set_status(self, deployment_worker_list, pod_list=None):
        for deployment_worker_info in deployment_worker_list:
            configurations = deployment_worker_info["configurations"]
            gpu_count = deployment_worker_info["gpu_count"]
            pod_status = kube.get_deployment_worker_status(deployment_worker_id=deployment_worker_info["id"], pod_list=pod_list)["status"]
            self.add_status(pod_status, configurations, gpu_count)
            if pod_status in KUBER_RUNNING_STATUS:
                self.add_running_worker_list(
                    deployment_worker_id=deployment_worker_info["id"], deployment_worker_status=pod_status, gpu_count=gpu_count, configurations=configurations,
                    description=deployment_worker_info["description"], create_datetime=deployment_worker_info["create_datetime"])

    def add_running_worker_list(self, deployment_worker_id, deployment_worker_status, gpu_count, configurations, description, create_datetime):
        self.running_worker_list.append({
                "id": deployment_worker_id, # For stop button
                "status": deployment_worker_status,
                "gpu_count": gpu_count,
                "configurations": configurations,
                "description": description,
                "create_datetime": create_datetime
            })

    def add_status(self, pod_status, configurations, gpu_count):
        worker_status_dict = self.worker_status_dict
        if pod_status in KUBER_RUNNING_STATUS:
            self.worker_count += 1
            worker_status_dict[pod_status] += 1
            if worker_status_dict[KUBE_POD_STATUS_RUNNING] > 0 and worker_status_dict[KUBE_POD_STATUS_ERROR] == 0:
                self.deployment_status = KUBE_POD_STATUS_RUNNING
            elif worker_status_dict[KUBE_POD_STATUS_ERROR] > 0:
                self.deployment_status = KUBE_POD_STATUS_ERROR
            elif worker_status_dict[KUBE_POD_STATUS_INSTALLING] > 0:
                self.deployment_status = KUBE_POD_STATUS_INSTALLING
            
            self.worker_configurations += common.db_configurations_to_list(configurations)

            if gpu_count == 0:
                self.worker_usage_case["cpu"] += 1
            else:
                self.worker_usage_case["gpu"] += gpu_count
            
        else:
            if self.deployment_status is None:
                self.deployment_status = KUBE_POD_STATUS_STOP
    
    def get_status(self):
        configurations = common.configuration_list_to_db_configuration_form(self.worker_configurations).split(",")
        return {
            "status": self.deployment_status,
            "worker":{
                "count": self.worker_count,
                "status": self.worker_status_dict,
                "resource_usage": self.worker_usage_case,
                "configurations": configurations
            }
        }

    def get_running_worker_list(self):
        return self.running_worker_list
# deployment id 단순조회

# 템플릿 적용
def get_deployment(deployment_id, headers_user):
    try:
        deployment_info = db.get_deployment(deployment_id=deployment_id)
        user_info = db.get_user(user_name=headers_user)
        workspace_users = db.get_workspace_users(workspace_id=deployment_info["workspace_id"])
        workspace_users_id = list(map(lambda x: x['id'], workspace_users))
        if deployment_info["access"]==1:
            users=[]
        else:
            users = db.get_deployment_users(deployment_id=deployment_id)

        # TODO 분기처리 수정 예정 => Lyla 22/12/28
        # if deployment_info["deployment_template_info"] != None:
        deployment_info.update(deployment_info["deployment_template_info"])
        deployment_info["type"] = deployment_info[DEPLOYMENT_TEMPLATE_KIND_INFO_KEY][DEPLOYMENT_TEMPLATE_DEPLOYMENT_TYPE_KEY]
        if deployment_info.get(DEPLOYMENT_TEMPLATE_CHECKPOINT_FILE_KEY) != None:
            deployment_info["checkpoint"] = deployment_info[DEPLOYMENT_TEMPLATE_CHECKPOINT_FILE_KEY].split(JF_TRAINING_JOB_CHECKPOINT_BASE_POD_PATH+"/")[-1]
        if deployment_info.get(DEPLOYMENT_TEMPLATE_RUN_COMMAND_KEY) != None:
            # run_code 삭제 예정 => Lyla 23/01/01
            deployment_info["run_code"] = deployment_info[DEPLOYMENT_TEMPLATE_RUN_COMMAND_KEY][DEPLOYMENT_TEMPLATE_RUN_SCRIPT_KEY]

        permission_level = check_deployment_access_level(user_id=user_info["id"], deployment_id=deployment_id, owner_id=deployment_info["user_id"],
                                                            access=deployment_info["access"], workspace_users=workspace_users_id)

        result = {
            "workspace_id": deployment_info["workspace_id"],
            "workspace_name": deployment_info["workspace_name"],
            "deployment_name": deployment_info["name"],
            "description": deployment_info["description"],
            "deployment_type": deployment_info["type"], # 삭제 예정
            "training_id": deployment_info.get("training_id"), # 삭제 예정
            "training_name": deployment_info.get("training_name"), # 삭제 예정
            "job_id": deployment_info["job_id"], # 삭제 예정
            "run_code": deployment_info.get("run_code"), # 삭제 예정
            "checkpoint": deployment_info.get("checkpoint"), # 삭제 예정
            "instance_type": deployment_info["operating_type"],
            "gpu_count": deployment_info["gpu_count"],
            "gpu_model": deployment_info["gpu_model"],
            "node_name": deployment_info["node_name"],
            "node_name_detail": common.parsing_node_name(deployment_info["node_name"]),
            "node_mode": deployment_info["node_mode"],
            "docker_image_id": deployment_info["docker_image_id"],
            "built_in_model_id": deployment_info.get("built_in_model_id"), # 삭제 예정
            "access": deployment_info["access"],
            "user_id": deployment_info["user_id"],
            "users":  users,
            "permission_level": permission_level,
            "deployment_template_id": deployment_info["template_id"],
            "deployment_template_type": deployment_info[DEPLOYMENT_TEMPLATE_KIND_INFO_KEY][DEPLOYMENT_TEMPLATE_TYPE_KEY],
            "deployment_template": get_deployment_template_detail_info(deployment_template=deployment_info, template_key="deployment_template_info")
        }

    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="deployment get error")
        #return response(status=0, message="deployment get error : {} ".format(str(e)))
    return response(status=1, result=result)

# 템플릿 적용
def get_deployment_detail_info(deployment_id, headers_user):
    from deployment_worker import get_log_size
    from built_in_model import update_detail_basic_info
    # get_training_detail_info 와 유사
    try:
        pod_list = kube_data.get_pod_list(try_update=False)
        ingress_service_list = kube_data.get_ingress_service_list(try_update=False)
        service_list = kube_data.get_service_list(try_update=False)
        kuber_node_list = kube_data.get_node_list(try_update=False)
        ingress_list = kube_data.get_ingress_list()

        deployment_info = db.get_deployment(deployment_id=deployment_id)

        # TODO 분기처리 수정 예정 => Lyla 22/12/28
        # if deployment_info["deployment_template_info"] != None:
        deployment_info.update(deployment_info["deployment_template_info"])
        deployment_info["type"] = deployment_info[DEPLOYMENT_TEMPLATE_KIND_INFO_KEY][DEPLOYMENT_TEMPLATE_DEPLOYMENT_TYPE_KEY]
        user_info = db.get_user(user_name=headers_user)
        workspace_id = deployment_info["workspace_id"]
        workspace_users = db.get_workspace_users(workspace_id=workspace_id)
        workspace_users_id = list(map(lambda x: x['id'], workspace_users))
        api_address = kube.get_deployment_full_api_address(deployment_id=deployment_info["id"], protocol=INGRESS_PROTOCOL,
                                            pod_list=pod_list, node_list=kuber_node_list, 
                                            ingress_service_list=ingress_service_list, ingress_list=ingress_list, service_list=service_list,
                                            path=deployment_info["api_path"])

        deployment_worker_id_list = [ data["id"] for data in db.get_deployment_worker_list(deployment_id=deployment_id) ]
        worker_count = len(kube.find_kuber_item_name(item_list=pod_list, deployment_id=deployment_id))

        try:
            permission_level = check_deployment_access_level(user_id=user_info["id"], deployment_id=deployment_id, owner_id=deployment_info["user_id"],
                                                            access=deployment_info["access"], workspace_users=workspace_users_id)
        except Exception as e:
            # 조회 중 삭제 되는 경우
            traceback.print_exc()
            permission_level = 4
            # pass
        basic_info = {
            "name": deployment_info["name"],
            "description": deployment_info["description"],
            "type": deployment_info["type"],
            "create_datetime": deployment_info["create_datetime"]
        }

        result = {
            "basic_info": basic_info,
            "access_info": {
                "access": deployment_info["access"],
                "owner": deployment_info["owner_name"],
                "user_list": db.get_deployment_users(deployment_id=deployment_id),
                "permission_level": permission_level
            },
            "usage_status_info":{
                "api_address": api_address, # From Node
                "worker_count": worker_count,
                "total_log_size":get_log_size(deployment_info["workspace_name"], deployment_info["name"], deployment_worker_id_list=deployment_worker_id_list)
            }
        }
        update_detail_basic_info(update_info=result, base_info=deployment_info)
        return response(status=1, result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Get Deployment detail info error : {}".format(e))

def get_deployment_worker_setting_info(deployment_id):
    try:
        #TODO checkpoint 설명을 위한 정보 추가 필요.
        #TODO 버그
        # From Job + (예정)  Hps, checkpoint 
        running_info = get_deployment_running_info(id=deployment_id)
        result = {
            "type": None,
            "gpu_count": None,
            "gpu_model": None,
            "built_in_model_name": None,
            "training_name": None,
            "docker_image": None,
            "run_code": None,
            "checkpoint": None,
            "job_name": None
        }
        # result.update(running_info)
        for key in result:
            result[key]=running_info.get(key)
        if result["gpu_count"] != None:
            if int(result["gpu_count"]) > 0:
                if result["gpu_model"]==None:
                    result["gpu_model"]="random"
        return response(status=1, result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0)

def get_item_deleted(item_deleted_info, built_in_model_name, deployment_type):
    item_deleted_list=[]
    if built_in_model_name==None:
        if deployment_type==DEPLOYMENT_TYPE_A:
            item_deleted_list.append("built_in_model")
    if item_deleted_info != None:
        if item_deleted_info.get("dataset")!=None and item_deleted_info.get("dataset")!=0:
            item_deleted_list.append("dataset")
        if item_deleted_info.get("training")!=None and item_deleted_info.get("training")!=0:
            item_deleted_list.append(TRAINING_ITEM_DELETED_INFO[item_deleted_info["training"]])
    return item_deleted_list
# TODO 템플릿 적용중 
# training 관련 추가 적용 필요 11/17
def get_deployment_list(workspace_id, training_id, sort, protocol, headers_user):
    deployment_list = db.get_deployment_list(sort=sort, workspace_id=workspace_id, training_id=training_id)
    workspace_users = db.get_workspace_users(workspace_id=workspace_id)
    workspace_users_name = list(map(lambda x: x['user_name'], workspace_users))
    workspace_users_id = list(map(lambda x: x['id'], workspace_users))
    deployment_user_list = db.get_deployment_users()
    deployment_worker_list = db.get_deployment_worker_list()

    user_info = db.get_user(user_name=headers_user)
    built_in_model_list = db.get_built_in_model_list()
    built_in_model_list_dict = common.gen_dict_from_list_by_key(target_list=built_in_model_list, id_key="id")
    deployment_user_list_dict = common.gen_dict_from_list_by_key(target_list=deployment_user_list, id_key="deployment_id")
    deployment_worker_list_dict = common.gen_dict_from_list_by_key(target_list=deployment_worker_list, id_key="deployment_id")
    user_deployment_bookmark_list = [ deployment_bookmark["deployment_id"] for deployment_bookmark in db.get_user_deployment_bookmark_list(user_id=user_info["id"]) ] 

    

    pod_list = kube_data.get_pod_list(try_update=False)
    ingress_service_list = kube_data.get_ingress_service_list(try_update=False)
    service_list = kube_data.get_service_list(try_update=False)
    kuber_node_list = kube_data.get_node_list(try_update=False)
    ingress_list = kube_data.get_ingress_list()

    result = []

    for deployment_info in deployment_list:

        deployment_id = deployment_info["id"]
        deployment_name = deployment_info["name"]
        workspace_name = deployment_info["workspace_name"]
        if deployment_info.get("deployment_template_info") != None:
            deployment_info.update(deployment_info["deployment_template_info"])
            deployment_info["type"] = deployment_info["deployment_template_info"][DEPLOYMENT_TEMPLATE_KIND_INFO_KEY][DEPLOYMENT_TEMPLATE_DEPLOYMENT_TYPE_KEY]
        try:
            permission_level = check_deployment_access_level(user_id=user_info["id"], deployment_id=deployment_id, owner_id=deployment_info["user_id"],
                                                                access=deployment_info["access"], workspace_users=workspace_users_id)
        except Exception as e:
            # 조회 중 삭제 되는 경우
            # traceback.print_exc()
            continue

        deployment_worker_info_list = deployment_worker_list_dict.get(deployment_id) #db.get_deployment_worker_list(deployment_id=deployment_id)
        if deployment_worker_info_list is None:
            deployment_worker_info_list = []
        deployment_status = DeploymentStatus()
        deployment_status.set_status(deployment_worker_info_list, pod_list)

        status = kube.get_deployment_status(deployment_id=deployment_id, pod_list=pod_list,
                                            start_datetime=deployment_info["workspace_start_datetime"],
                                            end_datetime=deployment_info["workspace_end_datetime"])

        if status["status"] in KUBER_RUNNING_STATUS:
            call_count_chart = get_deployment_call_count_per_hour_chart(deployment_id=deployment_id, deployment_name=deployment_name, workspace_name=workspace_name)
        else :
            call_count_chart = [] # [ random.randint(0,10000) for i in range(24)] 

        api_address = kube.get_deployment_full_api_address(deployment_id=deployment_id, protocol=protocol,
                                                        pod_list=pod_list, node_list=kuber_node_list,
                                                        ingress_service_list=ingress_service_list, ingress_list=ingress_list, service_list=service_list)

        if built_in_model_list_dict.get(deployment_info["built_in_model_id"]):
            built_in_model_name = built_in_model_list_dict.get(deployment_info["built_in_model_id"])[0]["name"]
        else:
            built_in_model_name = None

        if deployment_id in user_deployment_bookmark_list:
            bookmark = 1
        else:
            bookmark = 0

        result.append({
            "id": deployment_id,
            "workspace_name": deployment_info["workspace_name"], # admin 쪽에서 쓰임
            "deployment_name": deployment_info["name"],
            "deployment_type": deployment_info["type"],
            "user_name": deployment_info["user_name"],
            "users": deployment_user_list_dict.get(deployment_id), # admin 쪽에서 쓰임
            "access": deployment_info["access"],
            "bookmark": bookmark,
            "training_name": {"name": "삭제 예정", "exist": True }, # 삭제 예정
            "loaded_model": {"name": "삭제 예정", "exist": True }, # 삭제 예정
            "built_in_model_name": deployment_info.get(DEPLOYMENT_TEMPLATE_BUILT_IN_NAME_KEY), 
            "description": deployment_info["description"],
            "deployment_template_name": deployment_info["deployment_template_name"],
            "deployment_template_description": deployment_info["deployment_template_description"],
            "deployment_template_group_name": deployment_info["deployment_template_group_name"],
            "deployment_template_group_description": deployment_info["deployment_template_group_description"],
            "item_deleted": get_item_deleted(item_deleted_info=deployment_info["item_deleted"], built_in_model_name=built_in_model_name, deployment_type=deployment_info["type"]),
            "permission_level": permission_level,
            "status": status,
            "deployment_status": deployment_status.get_status(),
            "call_count_chart": call_count_chart,
            "api_address": api_address,
            "token": deployment_info["token"],
            "create_datetime": deployment_info["create_datetime"]
        })
    
    return response(status=1, result=result)

def get_deployment_admin_list(protocol):
    from deployment_worker import get_deployment_api_total_count_info, get_log_size
    try:
        deployment_list = db.get_deployment_list()
        deployment_user_list = db.get_deployment_users()
        deployment_worker_list = db.get_deployment_worker_list()
        built_in_model_list = db.get_built_in_model_list()

        built_in_model_list_dict = common.gen_dict_from_list_by_key(target_list=built_in_model_list, id_key="id")
        deployment_worker_list_dict = common.gen_dict_from_list_by_key(target_list=deployment_worker_list, id_key="deployment_id")
        deployment_user_list_dict = common.gen_dict_from_list_by_key(target_list=deployment_user_list, id_key="deployment_id")

        pod_list = kube_data.get_pod_list(try_update=False)
        ingress_service_list = kube_data.get_ingress_service_list(try_update=False)
        service_list = kube_data.get_service_list(try_update=False)
        kuber_node_list = kube_data.get_node_list(try_update=False)
        ingress_list = kube_data.get_ingress_list()

        result = []
        for deployment_info in deployment_list:
            # TODO 유저 목록 조회와 동일한 형태로 template info 조회 하도록 변경 필요 (2023-01-25 Yeobie)
            if deployment_info["deployment_template_info"] is not None:
                deployment_info.update(deployment_info["deployment_template_info"])
                
            del deployment_info["deployment_template_info"]
            deployment_id = deployment_info["id"]
            deployment_name = deployment_info["name"]
            if deployment_info.get("type")==None:
                try:
                    deployment_type = deployment_info[DEPLOYMENT_TEMPLATE_KIND_INFO_KEY][DEPLOYMENT_TEMPLATE_DEPLOYMENT_TYPE_KEY]
                except:
                    deployment_type = None
            else:
                deployment_type = deployment_info["type"]
            workspace_name = deployment_info["workspace_name"]
            user_name = deployment_info["user_name"]
            deployment_create_datetime = deployment_info["create_datetime"]

            deployment_worker_info_list = deployment_worker_list_dict.get(deployment_id) #db.get_deployment_worker_list(deployment_id=deployment_id)
            if deployment_worker_info_list is None:
                deployment_worker_info_list = []
            deployment_status = DeploymentStatus()
            deployment_status.set_status(deployment_worker_info_list, pod_list)

            
            if built_in_model_list_dict.get(deployment_info["built_in_model_id"]):
                built_in_model_name = built_in_model_list_dict.get(deployment_info["built_in_model_id"])[0]["name"]
            else:
                built_in_model_name = None

            api_address = kube.get_deployment_full_api_address(deployment_id=deployment_id, protocol=protocol,
                                                        pod_list=pod_list, node_list=kuber_node_list, 
                                                        ingress_service_list=ingress_service_list, ingress_list=ingress_list, service_list=service_list)
            worker_dir_list = [ deployment_worker_info["id"] for deployment_worker_info in deployment_worker_info_list ]

            # api_total_count_info = get_deployment_api_total_count_info(worker_dir_list=worker_dir_list, workspace_name=workspace_name, deployment_name=deployment_name)
            # call_count = api_total_count_info["total_call_count"] #1200ms
            log_size = get_log_size(workspace_name=workspace_name, deployment_name=deployment_name, deployment_worker_id_list=worker_dir_list)

            call_count = -1 
            run_time = get_deployment_run_time(workspace_name=workspace_name, deployment_name=deployment_name, retry_count=1)
            result.append({
                "id": deployment_id,
                "workspace_name": workspace_name, # admin 쪽에서 쓰임
                "deployment_name":deployment_name,
                "deployment_type": deployment_type,
                "user_name": user_name,
                "operation_time" : run_time,
                "log_size": log_size, 
                "deployment_status": deployment_status.get_status(), # 큰틀의 상태, 워커, 자원 쪽 정보로 사용
                "users": deployment_user_list_dict.get(deployment_id), # admin 쪽에서 쓰임
                "access": deployment_info["access"],
                "create_datetime": deployment_create_datetime,
                "built_in_model_name": built_in_model_name,
                "description": deployment_info["description"],
                "deployment_worker_list": deployment_status.get_running_worker_list(),
                "api_address": api_address,
                "token": deployment_info["token"]
            })

        return response(status=1, result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, result=[], message="Deployment List get Error : {}".format(e))

def getfiles(dirpath):
    listfile = [s for s in os.listdir(dirpath) if os.path.isfile(os.path.join(dirpath, s))]
    listfile.sort(key=lambda s: os.path.getmtime(os.path.join(dirpath, s)))
    listtmp = os.listdir(dirpath)
    listdir = list(set(listtmp)-set(listfile))
    return listfile + listdir

def get_training_checkpoints(workspace_name, model_list):
    def find_file_in_folder(path, base=None):
        if base is None:
            base = path
        files = []
        try:
            # dirlist = os.listdir(path)
            # print("====\n1:",dirlist)
            dirlist = getfiles(path)
            # print("====\n2:",dirlist2)
        except OSError as e :
            return files

        for name in dirlist:
            next_ = path+"/"+name
            if os.path.isdir(next_) == True:
                files+=find_file_in_folder(next_, base)

            file_ = next_.replace(base,"")
            if file_[0] == "/":
                file_ = file_[1:]
            files.append(file_)

        return files

    training_id_list =[ training["id"] for training in model_list ]
    if len(training_id_list) == 0:
        return model_list
    jobs_lists =  db.get_job_list(training_id_list=training_id_list, order_by="DESC", sort="id")
    checkpoints_list = {} # training_name : []
    if jobs_lists is None:
        return model_list
    for job in jobs_lists:
        if checkpoints_list.get(job["training_name"]) is None:
            checkpoints_list[job["training_name"]] = []

        base_path = kube.get_item_checkpoints_base_path(workspace_name=workspace_name, training_name=job["training_name"], item_type=TRAINING_ITEM_A)
        job_checkpoints_base_path = "{}/{}".format(base_path, job["name"])
        # job_checkpoint_path = "{}/{}/{}/".format(job_checkpoints_base_path, job["job_group_index"], 'check')
        job_checkpoint_path = "{}/{}/".format(job_checkpoints_base_path, job["job_group_index"])
        job_files = find_file_in_folder(job_checkpoint_path)
        files = []
        try:
            for item in job_files:
                # ckpt 형태로 checkpoint가 저장되는 경우
                if "ckpt" in item and ".index" in item:
                    item = item.split(".")[:-1]
                    item = ".".join(item)
                    item = "{}/{}/{}".format(job["name"], job["job_group_index"], item)
                    
                    if item not in files:
                        files.append(item)

                # elif ".hdf5" in item or ".pth" in item or ".h5" in item or ".pt" in item:
                elif [ item for extension in CHECKPOINT_EXTENSION if extension in item ]:

                    # item = item.split(".")[:-1]
                    # item = ".".join(item)
                    item = "{}/{}/{}".format(job["name"], job["job_group_index"], item)
                    files.append(item)
            # files = list(set(files))
            # files = sorted(files, reverse=True)
            # if len(files) == 0:
            #     continue
            for i in range(len(files)):
                files[i] = {"name": "/".join(files[i].split("/")[2:]), "id": job["id"]}

            for i in range(len(model_list)):
                if model_list[i].get("checkpoint_count") is None:
                    model_list[i]["checkpoint_count"] = 0
                if model_list[i]["name"] == job["training_name"]:
                    if len(files) == 0:
                        break
                    if model_list[i].get("job_list") is None:
                        model_list[i]["job_list"] = []
                    if job["name"] not in [ _["name"] for _ in model_list[i]["job_list"]]:
                        model_list[i]["job_list"].append({"name": job["name"], "id": job["group_number"]})

                    for j in range(len(model_list[i]["job_list"])):
                        if model_list[i]["job_list"][j]["name"] == job["name"]:
                            if model_list[i]["job_list"][j].get("group_list") is None:
                                model_list[i]["job_list"][j]["group_list"] = []

                            if job["job_group_index"] not in [ _["name"] for _ in model_list[i]["job_list"][j]["group_list"]]:
                                model_list[i]["job_list"][j]["group_list"].append({"name": job["job_group_index"], "id": job["job_group_index"]})


                        for v in range(len(model_list[i]["job_list"][j]["group_list"])):
                            if model_list[i]["job_list"][j]["group_list"][v]["name"] == job["job_group_index"]:
                                if model_list[i]["job_list"][j]["group_list"][v].get("checkpoint_list") is None:
                                    model_list[i]["job_list"][j]["group_list"][v]["checkpoint_list"] = files
                                    model_list[i]["checkpoint_count"] += len(files)
                                    break
        except Exception as e:
            pass
        checkpoints_list[job["training_name"]] += files
    return model_list



def user_in_workspace_check(workspace_id, user_id):
    flag = False
    user_workspaces = db.get_user_workspace(user_id=user_id)
    for workspace in user_workspaces:
        if workspace["id"] == workspace_id:
            flag = True
            return flag

    return flag


def create_deployment_folder(workspace_name, deployment_name, owner_name):
    deployment_dir = '{}/{}/deployments/{}'.format(settings.JF_WS_DIR, workspace_name, deployment_name)
    # mkdir
    try:
        os.mkdir(deployment_dir)
    except:
        traceback.print_exc()
        common.rm_rf(deployment_dir)
        os.mkdir(deployment_dir)
        # return {"r": -14, "msg": 'deployment {} failed to create deployment dir.'.format(proj_name)}

    # get uid
    try:
        uid = pwd.getpwnam(owner_name).pw_uid
    except KeyError:
        traceback.print_exc()
        common.rm_rf(deployment_dir)
        raise Exception('User {} does not exist.'.format(owner_name))

    # get gid
    try:
        gid = grp.getgrnam(owner_name).gr_gid
    except KeyError:
        traceback.print_exc()
        common.rm_rf(deployment_dir)
        raise Exception('Group {} does not exist.'.format(owner_name))

    # chown uid:gid
    try:
        os.chown (deployment_dir, uid, gid)
    except:
        traceback.print_exc()
        common.rm_rf(deployment_dir)
        raise Exception('deployment {} failed to chown deployment dir.'.format(owner_name))
    return True

def permission_check(user, workspace_id=None, deployment_info=None, permission_level=0, create_deployment=False):
    workspace_manager = ""
    deployment_id = ""
    deployment_owner = ""
    workspace_manager = ""
    access = ""
    if deployment_info is not None:
        deployment_id = deployment_info["id"]
        workspace_id = deployment_info["workspace_id"]
        deployment_owner = deployment_info["owner_name"]
        workspace_manager = deployment_info["manager_name"]
        access = deployment_info["access"]

    user_list = []
    error_message = ""
    if user is None:
        return 0, response(status=0, message="Jf-user is None in headers")

    if create_deployment == True:
        # deployment Create
        user_list = list(map(lambda x: x['user_name'], db.get_workspace_users(workspace_id=workspace_id)))
        if user == 'root' or user == deployment_owner or user in user_list:
            return 2, ""
        else:
            error_message = "Must be a root or workspace user"
            return 0, response(status=0, message="Permission error : {}".format(error_message))

    # root or deployment owner or workspace_manager
    if user == 'root' or user == deployment_owner or user == workspace_manager:
        return 2, ""
    elif permission_level >= 2:
        error_message = "Must be a root or deployment owner"
        return 0, response(status=0, message="permission error : {}".format(error_message))

    if access == 1:
        # public
        user_list = list(map(lambda x: x['user_name'], db.get_workspace_users(workspace_id=workspace_id)))
        error_message = "Must be a root or Workspace user"
    else:
        # private
        user_list = list(map(lambda x: x['user_name'], db.get_deployment_users(deployment_id=deployment_id)))
        error_message = "Must be a root or this deployment user"

    if user in user_list:
        return 1, ""

    return 0, response(status=0, message="Permission error : {}".format(error_message))

def load_custom_api_system_info_to_json(deployment_id=None, run_code_path=None, workspace_name=None, 
                                        training_name=None):
    """
    Description : loads custom API system info into json
    Args :
        deployment_id (int) : deployment id 로 정보 추가
        -------------------
        run_code_path (str) : JF_TRAINING_POD_PATH 기준으로 작성되어 있음 - 실제 HOST 경로는 다름 변환 필요
        workspace_name (str) : HOST 경로 재작성용
        training_name (str) : HOST 경로 재작성용
    """
    try:
        # create 의 경우 run code path 를 통해 system info 읽음
        if run_code_path:
            pass
        # run 의 경우 id 를 통해 systme info 읽음
        else:
            deployment_info = db.get_deployment(deployment_id=deployment_id)
            workspace_id = deployment_info.get("workspace_id")
            workspace_name = db.get_workspace(workspace_id=workspace_id).get("workspace_name")
            training_name = deployment_info.get("training_name")
            run_code_path = deployment_info.get("run_code")
            # run_code_path = "{}/{}".format(JF_TRAINING_PATH.format(workspace_name=workspace_name, training_name=training_name), run_code_name) #'/jf-data/workspaces/{}/trainings/{}{}'.format(workspace_name, training_name, run_code_name)
        """
        시스템 정보
        아래 스크립트 삭제시 JF deploy 실행이 안됩니다.
        #JF_DEPLOYMENT_INPUT_DATA_INFO_START
        {
            "deployment_input_data_form_list": [
                {
                    "method": "POST",
                    "location": "file",
                    "api_key": "num_image",
                    "value_type": "image",
                    "category": "image",
                    "category_description": "numberic"
                }
            ]
        }
        #JF_DEPLOYMENT_INPUT_DATA_INFO_END
        """
        run_code_path = common.path_convert(full_path=run_code_path, old_path=JF_TRAINING_POD_PATH, new_path=JF_TRAINING_PATH.format(workspace_name=workspace_name, training_name=training_name))
        with open(run_code_path, mode="r", encoding="utf8") as f:
            api_txt = f.read()
            if '#JF_DEPLOYMENT_INPUT_DATA_INFO_START' in api_txt:
                api_str_list = api_txt.split("#JF_DEPLOYMENT_INPUT_DATA_INFO_START")
                # print("=========\n1: "+str(api_str_list))
                # print("=========\n1-2: "+str(len(api_str_list)))
                # print("=========\n1-3: "+str(api_str_list[0]))
                # print("=========\n2: "+str(api_str_list[1]))
                # print("=========\n3: "+str(api_str_list[1].split('\n"""')))
                api_str = api_str_list[1].split("#JF_DEPLOYMENT_INPUT_DATA_INFO_END")[0]
                try:
                    system_info_json = json.loads(api_str)
                    return system_info_json
                except:
                    pass
        return None
    except Exception as e:
        traceback.print_exc()
        return None

def init_current_deployment_data_form(deployment_id, built_in_model_id=None, deployment_form_list=None):
    """Init current deployment data form. Insert deployment_data.

    Args:
        deployment_id (int): 
        built_in_model_id (int, optional): . Defaults to None.
        deployment_form_list (list, optional): [{
                            "built_in_model_id": 1012,
                            "location":"form",
                            "api_key":"file",
                            "value_type":"file",
                            "category":"image",
                            "category_description":""
                            },...]. Defaults to None.

    Returns:
        bool: db insert deployment data form success=True, fail=False
    """
    db.delete_deployment_data_form(deployment_id=deployment_id)
    # if deployment_type=="custom":
    #     system_info_json = load_custom_api_system_info_to_json(deployment_id=deployment_id)
    #     deployment_form_list = system_info_json.get("deployment_input_data_form_list")
    # else:
    # deployment_form_list = db.get_built_in_model_data_deployment_form(model_id=built_in_model_id) if deployment_form_list is None else deployment_form_list

    # built in model 의 경우
    if built_in_model_id is not None:
        deployment_form_list = db.get_built_in_model_data_deployment_form(model_id=built_in_model_id)

    # custom deployment 에서 api 만 사용하는 경우 deployment form list 가 None 일 수 있다.
    if deployment_form_list:
        for deployment_form in deployment_form_list:
            insert_deployment_input_form_result, message = db.insert_deployment_data_form(deployment_id=deployment_id, location=deployment_form["location"], method=deployment_form["method"],
                                            api_key=deployment_form["api_key"], value_type=deployment_form["value_type"], category=deployment_form["category"],
                                            category_description=deployment_form["category_description"])
            if insert_deployment_input_form_result == False:
                message = "Insert deployment input form error : {}".format(message)
                return insert_deployment_input_form_result, message

    return True, ""

def get_create_deployment_template_type_with_version(deployment_type, training_id, checkpoint_id):
    """
    Description : Returns the type of deployment template in create/update.

    Args:
        deployment_type (str): built-in / custom
        training_id (int): training id
        checkpoint_id (int): checkpoint id

    Returns:
        str: template type in ["custom v1", "usertrained v1", "pretrained v1", "checkpoint v1"]
    """
    if deployment_type == DEPLOYMENT_TYPE_B:
        deployment_template_type_with_version = DEPLOYMENT_RUN_CUSTOM_V1
    elif deployment_type == DEPLOYMENT_TYPE_A and training_id != None and checkpoint_id == None:
        deployment_template_type_with_version = DEPLOYMENT_RUN_USERTRAINED_V1
    elif deployment_type == DEPLOYMENT_TYPE_A and training_id == None and checkpoint_id == None:
        deployment_template_type_with_version = DEPLOYMENT_RUN_PRETRAINED_V1
    elif deployment_type == DEPLOYMENT_TYPE_A and training_id == None and checkpoint_id != None:
        deployment_template_type_with_version = DEPLOYMENT_RUN_CHEKCPOINT_V1
    else:
        return None
    return deployment_template_type_with_version

def update_deployment_template_checkpoint_path(deployment_template, checkpoint_file_path):
    """
    Description : Update deployment deployment_template .

    Args:
        deployment_template (dict): deployment_template json
        checkpoint_file_path (str): checkpoint file path in pod
    """
    # deployment_template 추가정보 저장 job / hps
    if deployment_template[DEPLOYMENT_TEMPLATE_KIND_INFO_KEY][DEPLOYMENT_TEMPLATE_TYPE_KEY] == DEPLOYMENT_RUN_USERTRAINED:
        checkpoint_pod_path=DEPLOYMENT_USERTRAINED_CHECKPOINT_POD_PATH_DIC[deployment_template[DEPLOYMENT_TEMPLATE_TRAINING_TYPE_KEY]]
        # job 일때
        if deployment_template[DEPLOYMENT_TEMPLATE_TRAINING_TYPE_KEY]==TRAINING_ITEM_A:
            # job_info = db.get_job_name_group_index_by_job_id(job_id = deployment_template[DEPLOYMENT_TEMPLATE_JOB_ID_KEY])
            job_name = deployment_template[DEPLOYMENT_TEMPLATE_JOB_NAME_KEY]
            job_group_index = deployment_template[DEPLOYMENT_TEMPLATE_JOB_GROUP_INDEX_KEY]
            # file_name = "/".join(checkpoint_file_path.split('/')[2:])
            # TODO 삭제 예정
            name_index = "{}/{}/".format(job_name, job_group_index)
            if checkpoint_file_path[:len(name_index)]==name_index:
                checkpoint_file_path = checkpoint_file_path[len(name_index):]
            deployment_template[DEPLOYMENT_TEMPLATE_CHECKPOINT_DIR_KEY] = checkpoint_pod_path.format(
                                                                            job_name=job_name, job_group_index=job_group_index)
            deployment_template[DEPLOYMENT_TEMPLATE_CHECKPOINT_FILE_KEY] ='{}/{}'.format(
                                                                            deployment_template[DEPLOYMENT_TEMPLATE_CHECKPOINT_DIR_KEY], 
                                                                            checkpoint_file_path)
        # hps 일때
        elif deployment_template[DEPLOYMENT_TEMPLATE_TRAINING_TYPE_KEY]==TRAINING_ITEM_C:
            hps_name = deployment_template[DEPLOYMENT_TEMPLATE_HPS_NAME_KEY]
            hps_group_index = deployment_template[DEPLOYMENT_TEMPLATE_HPS_GROUP_INDEX_KEY]
            hps_number = deployment_template[DEPLOYMENT_TEMPLATE_HPS_NUMBER_KEY]
            # file_name = "/".join(checkpoint_file_path.split('/')[3:])
            # deployment_template[DEPLOYMENT_TEMPLATE_HPS_NAME_KEY] = hps_name
            # deployment_template[DEPLOYMENT_TEMPLATE_HPS_GROUP_INDEX_KEY] = hps_group_index
            # deployment_template[DEPLOYMENT_TEMPLATE_HPS_NUMBER_KEY] = hps_number
            deployment_template[DEPLOYMENT_TEMPLATE_CHECKPOINT_DIR_KEY] = checkpoint_pod_path.format(
                                                                            hps_name=hps_name, hps_group_index=hps_group_index,
                                                                            hps_number=hps_number)
            deployment_template[DEPLOYMENT_TEMPLATE_CHECKPOINT_FILE_KEY] ='{}/{}'.format(
                                                                        deployment_template[DEPLOYMENT_TEMPLATE_CHECKPOINT_DIR_KEY], 
                                                                        checkpoint_file_path)
                                                                        
    # elif deployment_template[DEPLOYMENT_TEMPLATE_TYPE_KEY] == DEPLOYMENT_RUN_CHEKCPOINT_V1:
        # TODO deployment_template 수정사항 - checkpoint 생성 관련 해서는 이미 처리 되어 있기 때문에 현재는 불필요
        # deployment_template[DEPLOYMENT_TEMPLATE_CHECKPOINT_FILE_KEY] ='{}/{}'.format(JF_CHECKPOINT_POD_PATH, checkpoint)
        # pass

def deployment_name_and_user_info_validation_check(workspace_id, deployment_name, owner_id, users_id):
    """
    Description: 배포 사용자, 배포 Owner 있는지 체크, 배포 이름 중복 체크

    Args:
        workspace_id (int): workspace id
        deployment_name (str): 배포 이름
        owner_id (int): 배포 owner id
        users_id (list):    public 배포 => 워크스페이스 사용자들
                            private 배포 => 허용된 사용자

    Raises:
        DeploymentNameExistError: 이름 중복 에러
        DeploymentOwnerIDNotExistError: owner 아이디 없음 에러
        DeploymentUserIDNotExistError: 사용자 아이디 없음 에러
        DeploymentNoOwnerInWorkspaceError: 워크스페이스에 해당 메니저 없음 에러
        DeploymentNoUserInWorkspaceError: 워크스페이스에 해당 사용자 없음 에러
    """    
    ## Info Unique Check
    # Deployment Name exist Check
    deployment_info = db.get_deployment(deployment_name=deployment_name)
    if deployment_info is not None:
        if workspace_id == deployment_info["workspace_id"]:
            raise DeploymentNameExistError

    # Check Owner or Users Exist Check
    owner_info = db.get_user(user_id=owner_id)
    if owner_info is None:
        raise DeploymentOwnerIDNotExistError
    for user_id in users_id:
        user_info = db.get_user(user_id=user_id)
        if user_info is None:
            raise DeploymentUserIDNotExistError
    
    # Check Owner or Users belong to workspace
    flag = user_in_workspace_check(workspace_id=workspace_id, user_id=owner_id)
    if flag == False:
        raise DeploymentNoOwnerInWorkspaceError
    for user_id in users_id:
        flag = user_in_workspace_check(workspace_id=workspace_id, user_id=user_id)
        if flag == False:
            raise DeploymentNoUserInWorkspaceError

def insert_deployment_template_group(workspace_id, deployment_template_group_name, deployment_template_group_description, user_id):
    deployment_template_group_info = db.get_deployment_template_group_by_unique_key(deployment_template_group_name=deployment_template_group_name, 
                                                                    workspace_id=workspace_id)
    if deployment_template_group_info != None:
        raise DeploymentTemplateGroupNameExistError
    insert_deployment_template_group_result = db.insert_deployment_template_group(workspace_id=workspace_id,
                                            deployment_template_group_name=deployment_template_group_name, 
                                            deployment_template_group_description=deployment_template_group_description,
                                            user_id=user_id)
    if not insert_deployment_template_group_result['result']:
        raise DeploymentTemplateGroupDBInsertError
    deployment_template_group_id = insert_deployment_template_group_result['id']
    return deployment_template_group_id

def check_and_insert_deployment_template_group(deployment_template_group_id, deployment_template_group_name, 
                                                deployment_template_group_description, workspace_id, user_id):
    # template group name + workspace id 통해 존재하는지 체크
    if deployment_template_group_id == None:
        # template group id 없는 경우
        # template group name 이 있으면 (그룹 새로 생성하는 경우) 그룹 생성
        if deployment_template_group_name != None:
            deployment_template_group_id = insert_deployment_template_group(
                            workspace_id=workspace_id, 
                            deployment_template_group_name=deployment_template_group_name, 
                            deployment_template_group_description=deployment_template_group_description, 
                            user_id=user_id)
    else:
        # template group id 가 있는 경우 그룹 존재 하는지 체크
        deployment_template_group_info = db.get_deployment_template_group(deployment_template_group_id=deployment_template_group_id)
        if deployment_template_group_info == None:
            raise DeploymentTemplateGroupNotExistError
    return deployment_template_group_id

def insert_template_group_and_template(workspace_id, deployment_template_group_id, 
                                    deployment_template_name, deployment_template_description,
                                    deployment_template_group_name, deployment_template_group_description, 
                                    deployment_template, owner_id):
    """deployment template group, deployment template 이름 중복 체크 후 DB insert

    Args:
        workspace_id (int): 워크스페이스 id
        deployment_template_group_id (int): deployment_template_group id
        deployment_template_name (str): deployment_template 이름
        deployment_template_description (str): deployment_template 설명
        deployment_template_group_name (str): deployment_template_group 이름
        deployment_template_group_description (str): deployment_template_group 설명
        deployment_template (dict): 배포 템플릿
        owner_id (id): 생성자 id

    Raises:
        DeploymentTemplateGroupDBInsertError: _description_
        DeploymentTemplateGroupNameExistError: _description_
        DeploymentTemplateNameExistError: _description_
        DeploymentTemplateDBInsertError: _description_

    Returns:
        int: INSERT 한 deployment_template 의 id
    """
    # template group id 값 존재하는지 확인
    # template group id 없는 경우 (새로 생성) 이름 체크
    # template group db insert
    deployment_template_group_id = check_and_insert_deployment_template_group(
                                                deployment_template_group_id=deployment_template_group_id, 
                                                deployment_template_group_name=deployment_template_group_name, 
                                                deployment_template_group_description=deployment_template_group_description,
                                                workspace_id=workspace_id, user_id=owner_id)

    # workspace id + template group id + template 이름으로 is_deleted 값 0 인 항목들 중 template_name 중복 체크
    # 그룹 없는경우 중복체크 불필요
    if deployment_template_group_id != None:
        if deployment_template_name != None:
            deployment_template_info = db.get_deployment_template_by_unique_key(deployment_template_name=deployment_template_name, 
                                                                    deployment_template_group_id=deployment_template_group_id, 
                                                                    workspace_id=workspace_id)
            if deployment_template_info != None: 
                duplicated_template_info = db.get_deployment_template(deployment_template_id = deployment_template_info['id'])
                if duplicated_template_info['template'] == deployment_template:
                    return duplicated_template_info['id']
                else:
                    raise DeploymentTemplateNameExistError

    # template 정보 DB INSERT
    is_deleted = 0
    if deployment_template_name==None:
        is_deleted = 1
    insert_deployment_template_result = db.insert_deployment_template(workspace_id=workspace_id, 
                            deployment_template_name=deployment_template_name, 
                            deployment_template_group_id=deployment_template_group_id, 
                            deployment_template_description=deployment_template_description, 
                            deployment_template=deployment_template, 
                            user_id=owner_id, is_deleted=is_deleted)
    if not insert_deployment_template_result['result']:
        raise DeploymentTemplateDBInsertError
    return insert_deployment_template_result['id']

def check_duplicate_deployment_template_info(deployment_template, workspace_id):
    deployment_template_info_list = db.get_deployment_template_exist(deployment_template=deployment_template, 
                                            workspace_id=workspace_id, is_deleted=1)
    # print("deployment_template_info_list:",deployment_template_info_list)
    if deployment_template_info_list != None:
        if len(deployment_template_info_list)!=0:
            return deployment_template_info_list[0]["id"]
    return None


def check_deployment_template_id_info(deployment_template_id, deployment_template):
    """배포 템플릿 id 정보와 입력받은 template 내용이 같은지 확인

    Args:
        deployment_template_id (int): template id
        deployment_template (dict): template

    Returns:
        bool: 같을경우 True, 다를경우 False
    """
    deployment_template_current_info = db.get_deployment_template(deployment_template_id=deployment_template_id)
    deployment_template_current = deployment_template_current_info["template"]
    if deployment_template_current != deployment_template:
        return False
    return True

def get_deployment_form_list_and_input_type(deployment_template, workspace_name):
    """
    Description: get deployment form list and input type from template

    Args:
        deployment_template (dict): _description_
        workspace_name (str): workspace name

    Returns:
        _type_: _description_
    """
    deployment_template_type = deployment_template[DEPLOYMENT_TEMPLATE_KIND_INFO_KEY][DEPLOYMENT_TEMPLATE_TYPE_KEY]
    deployment_form_list = None
    if deployment_template_type == DEPLOYMENT_RUN_CUSTOM:
        deployment_form_list = load_custom_api_system_info_to_json(
                                    run_code_path=deployment_template[DEPLOYMENT_TEMPLATE_RUN_COMMAND_KEY].get(DEPLOYMENT_TEMPLATE_RUN_SCRIPT_KEY), 
                                    workspace_name=workspace_name, 
                                    training_name=deployment_template[DEPLOYMENT_TEMPLATE_TRAINING_NAME_KEY])
        if deployment_form_list:
            deployment_form_list = deployment_form_list.get("deployment_input_data_form_list")
    elif deployment_template_type in [DEPLOYMENT_RUN_USERTRAINED, DEPLOYMENT_RUN_PRETRAINED, DEPLOYMENT_RUN_CHEKCPOINT]:
        deployment_form_list = db.get_built_in_model_data_deployment_form(model_id=deployment_template[DEPLOYMENT_TEMPLATE_BUILT_IN_ID_KEY])
    # deployment form 정의된 경우 input_type 값 받기
    if deployment_form_list:
        input_type = ",".join([ deployement_form["category"] for deployement_form in deployment_form_list])
    else:
        input_type = None
    return {
        "deployment_form_list":deployment_form_list,
        "input_type":input_type
    }

def create_template_by_template_params(template_params, workspace_id, owner_id,
                                deployment_template_id, deployment_template_name, deployment_template_description,
                                deployment_template_group_id, deployment_template_group_name, deployment_template_group_description,
                                deployment_template_type_with_version=None):
    """Create deployment template + insert template to db

    Args:
        template_params (dict): template infos
        workspace_id (int): workspace id
        owner_id (int): deployment creator id
        deployment_template_id (int): template id (배포 생성시 template 통해 생성 안하는 경우 None)
        deployment_template_name (str): template name (배포 생성시 template 생성 안한 경우 None)
        deployment_template_description (str): template 설명 (배포 생성시 template 생성 안한 경우 None)
        deployment_template_group_id (int): template group (배포 생성시 template group 생성 안한 경우 None)
        deployment_template_group_name (str): template group name (배포 생성시 template group 생성 안한 경우 None)
        deployment_template_group_description (str): template group description (배포 생성시 template group 생성 안한 경우 None)

    Returns:
        int: deployment template id
    """
    try:
        # template 생성을 위한 item 값들 확인 및 추가 (training, built in model, job, hps)
        check_update_deployment_template_param_info(template_params=template_params, workspace_id=workspace_id)
        
        # template type 을 통해 기본 틀 생성
        checkpoint = template_params.get(DEPLOYMENT_TEMPLATE_CHECKPOINT_FILE_KEY)
        # template type 찾기
        if deployment_template_type_with_version==None:
            deployment_type = template_params[DEPLOYMENT_TEMPLATE_DEPLOYMENT_TYPE_KEY]
            training_id = template_params[DEPLOYMENT_TEMPLATE_TRAINING_ID_KEY]
            deployment_template_type_with_version = get_create_deployment_template_type_with_version(deployment_type=deployment_type, training_id=training_id, 
                                                            checkpoint_id=None)
        deployment_template = DEPLOYMENT_JSON_TEMPLATE[deployment_template_type_with_version]

        # JSON 템플릿인 경우와 아닌 경우 나눠 템플릿 dictionary생성
        if deployment_template_type_with_version == DEPLOYMENT_RUN_SANDBOX_V1:
            deployment_template.update(template_params)
        else:
            for template_key in deployment_template:
                if template_params.get(template_key) != None:
                    deployment_template[template_key] = template_params[template_key]

        # template 추가정보 저장
        update_deployment_template_checkpoint_path(deployment_template=deployment_template, checkpoint_file_path=checkpoint)
        
        # 이름 없는(사용자가 저장 안함) 템플릿에 대해서 기존 다른 이름 없는 템플릿들과 중복체크
        if deployment_template_id==None and deployment_template_name==None:
            deployment_template_id = check_duplicate_deployment_template_info(deployment_template, workspace_id)
        elif deployment_template_id != None:
            check_info = check_deployment_template_id_info(deployment_template_id=deployment_template_id, deployment_template=deployment_template)
            if check_info==False:
                deployment_template_id = None

        # 템플릿 정보 db insert
        if deployment_template_id==None:
            deployment_template_id = insert_template_group_and_template(workspace_id=workspace_id, 
                                        deployment_template_group_id=deployment_template_group_id, 
                                        deployment_template_name=deployment_template_name, 
                                        deployment_template_description=deployment_template_description,
                                        deployment_template_group_name=deployment_template_group_name, 
                                        deployment_template_group_description=deployment_template_group_description,
                                        deployment_template=deployment_template, 
                                        owner_id=owner_id)
        return {
            "deployment_template_id":deployment_template_id,
            "deployment_template":deployment_template
        }
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception as e:
        traceback.print_exc()
        raise e
# 템플릿 적용
def create_deployment(workspace_id, deployment_name, description, deployment_type, 
                    training_id, job_id, hps_id, hps_number, training_type, command, environments, run_code,
                    checkpoint, instance_type, built_in_model_id,
                    gpu_count, gpu_model, node_name, node_name_cpu, node_name_gpu, 
                    node_mode, access, owner_id, users_id, docker_image_id, 
                    deployment_template_id, deployment_template, deployment_template_name, deployment_template_description,
                    deployment_template_group_id, deployment_template_group_name, deployment_template_group_description,
                    headers_user):
    try:
        # deployment name check
        is_deployment_good_name(deployment_name=deployment_name)
        ## Info Unique Check
        deployment_name_and_user_info_validation_check(workspace_id=workspace_id, deployment_name=deployment_name, 
                                            owner_id=owner_id, users_id=users_id)

        workspace_info = db.get_workspace(workspace_id=workspace_id)
        workspace_name = workspace_info.get("workspace_name")

        # TODO 삭제 예정 custom 인경우 현재는 run_code 로 받으나 추후 변경 예정
        if deployment_type==DEPLOYMENT_TYPE_B:
            if run_code != None and command==None:
                command = DEPLOYMENT_TEMPLATE_RUN_COMMAND_INFO
                command[DEPLOYMENT_TEMPLATE_RUN_SCRIPT_KEY]=run_code

        if deployment_template != None:
            deployment_template_params = deployment_template
            deployment_template_type_with_version = DEPLOYMENT_RUN_SANDBOX_V1
        else:
            # 템플릿 기본정보 아이템 생성
            deployment_template_params = {
                DEPLOYMENT_TEMPLATE_DEPLOYMENT_TYPE_KEY: deployment_type,
                DEPLOYMENT_TEMPLATE_TRAINING_TYPE_KEY: training_type,
                DEPLOYMENT_TEMPLATE_TRAINING_ID_KEY: training_id,
                DEPLOYMENT_TEMPLATE_BUILT_IN_ID_KEY: built_in_model_id,
                DEPLOYMENT_TEMPLATE_JOB_ID_KEY: job_id,
                DEPLOYMENT_TEMPLATE_HPS_ID_KEY: hps_id,
                DEPLOYMENT_TEMPLATE_HPS_NUMBER_KEY: hps_number,
                DEPLOYMENT_TEMPLATE_CHECKPOINT_FILE_KEY: checkpoint,
                DEPLOYMENT_TEMPLATE_RUN_COMMAND_KEY: command,
                DEPLOYMENT_TEMPLATE_ENVIRONMENTS_KEY: environments
            }
            deployment_template_type_with_version = None

        # template 저장
        deployment_template_info = create_template_by_template_params(template_params=deployment_template_params, workspace_id=workspace_id, owner_id=owner_id,
                                deployment_template_id=deployment_template_id, deployment_template_name=deployment_template_name, 
                                deployment_template_description=deployment_template_description,
                                deployment_template_group_id=deployment_template_group_id, deployment_template_group_name=deployment_template_group_name, 
                                deployment_template_group_description=deployment_template_group_description, 
                                deployment_template_type_with_version=deployment_template_type_with_version)
        deployment_template = deployment_template_info["deployment_template"]
        deployment_template_id = deployment_template_info["deployment_template_id"]

        # 빌트인/커스텀 모델의 deployment form list 정보 받기
        deployment_form_list_input_type = get_deployment_form_list_and_input_type(deployment_template=deployment_template, 
                                                                                workspace_name=workspace_name)
        deployment_form_list = deployment_form_list_input_type["deployment_form_list"]
        input_type = deployment_form_list_input_type["input_type"]
        
        # pod default api 경로 받기
        default_api_path = PodName(workspace_name=workspace_name, item_name=deployment_name, item_type=DEPLOYMENT_ITEM_A).get_base_pod_name()
        # node 이름
        node_name = common.combine_node_name(node_name_cpu=node_name_cpu, node_name_gpu=node_name_gpu, node_name=node_name)

        # 배포 정보 DB 저장
        insert_deployment_result = db.insert_deployment(
                workspace_id=workspace_id, deployment_name=deployment_name, description=description,
                operating_type=instance_type, gpu_count=gpu_count, gpu_model=gpu_model, node_name=node_name, node_mode=node_mode,
                input_type=input_type, access=access, owner_id=owner_id, docker_image_id=docker_image_id, 
                deployment_template_id=deployment_template_id, api_path=default_api_path)
        # 배포 ID 받기
        deployment_id = insert_deployment_result["id"]

        if not insert_deployment_result["result"]:
            print("Create Deployment DB Insert Error: {}".format(insert_deployment_result["message"]))
            raise CreateDeploymentDBInsertError

        # Insert data input form
        init_result, message = init_current_deployment_data_form(deployment_id=deployment_id, deployment_form_list=deployment_form_list)
        if init_result == False:
            print("Insert deployemnt data form error : {}".format(message))
            raise DeploymentDataFormDBInsertError

        # Insert User deployment
        users_id.append(owner_id)
        deployments_id = [deployment_id]*len(users_id)
        insert_user_deployment_s_result, message = db.insert_user_deployment_s(deployments_id=deployments_id, users_id=users_id)
        if not insert_user_deployment_s_result:
            raise DeploymentUserDBInsertError
        
        # create deployment folder
        workspace_name = workspace_info["workspace_name"]
        owner_name = db.get_user(user_id=owner_id)["name"]
        create_deployment_folder(workspace_name=workspace_name, deployment_name=deployment_name, owner_name=owner_name)

        db.logging_history(
            user=headers_user, task='deployment',
            action='create', workspace_id=workspace_id,
            task_name=deployment_name
        )

        return response(status=1, message="Created Deployment")
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception as e:
        raise e



def check_update_deployment_template_param_info(template_params, workspace_id):
    training_id = template_params.get(DEPLOYMENT_TEMPLATE_TRAINING_ID_KEY)
    job_id = template_params.get(DEPLOYMENT_TEMPLATE_JOB_ID_KEY)
    hps_id = template_params.get(DEPLOYMENT_TEMPLATE_HPS_ID_KEY)
    # sandbox info
    deployment_template_mount_info = template_params.get(DEPLOYMENT_TEMPLATE_MOUNT_KEY)
    deployment_template_environment_info = template_params.get(DEPLOYMENT_TEMPLATE_ENVIRONMENTS_KEY)
    
    # 학습 정보
    if training_id != None:
        training_info = db.get_training(training_id=training_id) 
        if training_info == None:
            raise DeploymentSelectTrainingNotExistError
        template_params[DEPLOYMENT_TEMPLATE_TRAINING_NAME_KEY] = training_info["training_name"]
        if training_info["built_in_model_id"] != None:
            template_params[DEPLOYMENT_TEMPLATE_BUILT_IN_ID_KEY] = training_info["built_in_model_id"]

    # 빌트인 정보
    if template_params.get(DEPLOYMENT_TEMPLATE_BUILT_IN_ID_KEY) != None:
        built_in_model_info = db.get_built_in_model(model_id=template_params[DEPLOYMENT_TEMPLATE_BUILT_IN_ID_KEY])
        if built_in_model_info == None:
            raise DeploymentSelectBuiltInModelNotExistError
        template_params[DEPLOYMENT_TEMPLATE_BUILT_IN_NAME_KEY] = built_in_model_info["name"]

    # JOB 정보
    if job_id != None:
        job_info = db.get_job(job_id=job_id)
        if job_info == None:
            raise DeploymentSelectJobNotExistError
        template_params[DEPLOYMENT_TEMPLATE_JOB_NAME_KEY] = job_info["name"]
        template_params[DEPLOYMENT_TEMPLATE_JOB_GROUP_INDEX_KEY] = job_info["job_group_index"]
    
    # HPS 정보
    if hps_id != None:
        hps_info = db.get_hyperparamsearch(hps_id=hps_id)
        if hps_info == None:
            raise DeploymentSelectJobNotExistError
        template_params[DEPLOYMENT_TEMPLATE_HPS_NAME_KEY] = hps_info["hps_group_name"]
        template_params[DEPLOYMENT_TEMPLATE_HPS_GROUP_INDEX_KEY] = hps_info["hps_group_index"]
    
    # mount 정보
    if deployment_template_mount_info != None:
        custom_params = {
            "training_name_list": [],
            "dataset_name_list": []
        }
        for mount_field in ["training", "dataset"]:
            if deployment_template_mount_info.get(mount_field)!= None and type(deployment_template_mount_info.get(mount_field))==list:
                delete_index_list = []
                for idx in range(len(deployment_template_mount_info[mount_field])):
                    if deployment_template_mount_info[mount_field][idx].get("name") == None:
                        delete_index_list.append(idx)
                    else:
                        custom_params[mount_field+"_name_list"].append(deployment_template_mount_info[mount_field][idx].get("name") )
                delete_index_list.reverse()
                for idx in delete_index_list:
                    del deployment_template_mount_info[mount_field][idx]
                if len(deployment_template_mount_info[mount_field])==0:
                    del deployment_template_mount_info[mount_field]
        if custom_params["training_name_list"] != []:
            for training_name in custom_params["training_name_list"]:
                training_info = db.get_training(training_name=training_name, workspace_id=workspace_id)
                if training_info == None:
                    raise DeploymentSelectTrainingNotExistError
            
        if custom_params["dataset_name_list"] != []:
            for dataset_name in custom_params["dataset_name_list"]:
                dataset_info = db.get_dataset(dataset_name=dataset_name, workspace_id=workspace_id)
                if dataset_info == None:
                    raise DeploymentSelectDatasetNotExistError
            
    if deployment_template_environment_info != None and type(deployment_template_environment_info)==list:
        delete_index_list = []
        for idx in range(len(deployment_template_environment_info)):
            if type(deployment_template_environment_info[idx]) != dict:
                delete_index_list.append(idx)
                continue
            if deployment_template_environment_info[idx].get("name")==None or deployment_template_environment_info[idx].get("value")==None:
                delete_index_list.append(idx)
                continue
            if deployment_template_environment_info[idx].get("name")=="":
                delete_index_list.append(idx)
                continue
        delete_index_list.reverse()
        for idx in delete_index_list:
            del deployment_template_environment_info[idx]
            
def check_update_deployment_template_info(deployment_template):
    # check command info: 필수 command (binary / code) 가 없는 경우 command field 삭제
    # deployment_template_run_info = deployment_template.get(DEPLOYMENT_TEMPLATE_RUN_COMMAND_KEY)
    # if deployment_template_run_info != None:
    #     is_valid_command = False
    #     if deployment_template_run_info.get(DEPLOYMENT_TEMPLATE_RUN_BINARY_KEY) !=None:
    #         is_valid_command = True
    #     if deployment_template_run_info.get(DEPLOYMENT_TEMPLATE_RUN_SCRIPT_KEY) !=None:
    #         is_valid_command = True
    #     if is_valid_command == False:
    #         del deployment_template[DEPLOYMENT_TEMPLATE_RUN_COMMAND_KEY]

    # check mount info: dataset, training mount 의 경우 필수 항목 (name) 이 없는 경우 field 삭제
    deployment_template_mount_info = deployment_template.get(DEPLOYMENT_TEMPLATE_MOUNT_KEY)
    if deployment_template_mount_info != None:
        for mount_field in ["training", "dataset"]:
            if deployment_template_mount_info.get(mount_field)!= None and type(deployment_template_mount_info.get(mount_field))==list:
                idx_list = []
                for idx in range(len(deployment_template_mount_info[mount_field])):
                    if deployment_template_mount_info[mount_field][idx].get("name") == None:
                        idx_list.append(idx)
                idx_list.reverse()
                for idx in idx_list:
                    del deployment_template_mount_info[mount_field][idx]
                if len(deployment_template_mount_info[mount_field])==0:
                    del deployment_template_mount_info[mount_field]

def convert_deployment_db_to_template(deployment_id=None, deployment_worker_id=None):
    """배포, 워커 id 통해 template 생성 DB INSERT 및 배포, 워커의 template_id UPDATE

    Args:
        deployment_id (int, optional): deployment id. Defaults to None.
        deployment_worker_id (int, optional): deployment worker id. Defaults to None.

    Raises:
        ValueError: 배포 id 가 db에 없음
        ValueError: 배포 워커 id 가 db에 없음
        RuntimeError: 배포id 또는 워커 id 를 입력받아야함
        RuntimeError: 템플릿에 type 정보 없음
        RuntimeError: 템플릿 DB INSERT 에러
        RuntimeError: 배포/워커 DB template_id UPDATE 에러

    Returns:
        int: template_id 
    """    
    try:
        if deployment_id:
            info = db.get_deployment(deployment_id=deployment_id)
            if info==None:
                raise ValueError("No matching deployment_id in DB")
            # deployment_name=info["name"]
        elif deployment_worker_id:
            info = db.get_deployment_worker(deployment_worker_id=deployment_worker_id)
            if info==None:
                raise ValueError("No matching deployment_worker_id in DB")
            # deployment_name=info["deployment_name"]
            deployment_id = db.get_deployment_id_from_worker_id(deployment_worker_id=deployment_worker_id)
        
        if deployment_id==None:
            raise RuntimeError("deployment_id or deployment_worker_id needed")

        workspace_id = info["workspace_id"]
        if info.get("type") == None:
            raise RuntimeError("Field 'type' should be 'built-in' / 'custom'")
        
        deployment_template_type_with_version = get_create_deployment_template_type_with_version(deployment_type=info["type"], training_id=info["training_id"], 
                                                            checkpoint_id=info["checkpoint_id"])
        
        # template_type 통해 기본 template 포맷 받아오기
        template = DEPLOYMENT_JSON_TEMPLATE[deployment_template_type_with_version]
        # 배포 정보에 template key 있는경우 기본 포맷에 value 추가
        for template_key in template:
            if template_key in info:
                template[template_key] = info[template_key]

        # template_type = usertrained_v1 의 경우 checkpoint 경로 업데이트
        if deployment_template_type_with_version==DEPLOYMENT_RUN_USERTRAINED_V1:
            template[DEPLOYMENT_TEMPLATE_TRAINING_TYPE_KEY]="job"
            check_update_deployment_template_param_info(template_params=template, workspace_id=workspace_id)
            update_deployment_template_checkpoint_path(deployment_template=template, checkpoint_file_path=info["checkpoint"])
        elif deployment_template_type_with_version==DEPLOYMENT_RUN_CUSTOM_V1:
            template[DEPLOYMENT_TEMPLATE_RUN_COMMAND_KEY][DEPLOYMENT_TEMPLATE_RUN_SCRIPT_KEY]=info["run_code"]

        template_info_list = db.get_deployment_template_exist(deployment_template=template, workspace_id=workspace_id, is_deleted=1)
        if template_info_list != None:
            len_template_info = len(template_info_list)
        else:
            len_template_info = 0
        if len_template_info>0:
            template = template_info_list[0]
            template_id = template["id"]
        else:
            template_id = insert_template_group_and_template(workspace_id=workspace_id, 
                                        deployment_template_group_id=None,
                                        deployment_template_group_name=None,
                                        deployment_template_group_description="", 
                                        deployment_template_name=None,
                                        deployment_template_description="", 
                                        deployment_template=template, 
                                        owner_id=info['user_id'])
        if deployment_worker_id:
            update_result, message = db.update_deployment_worker_template_id(deployment_worker_id=deployment_worker_id, 
                                                                            deployment_template_id=template_id)
        else:
            update_result, message = db.update_deployment_template_id(deployment_id=deployment_id, deployment_template_id=template_id)
        if update_result==False:
            raise RuntimeError("DB template id update error {}".format(message))
        return template_id
    except Exception as e:
        raise e

def to_template():
    """배포, 워커 전체 template 생성 DB INSERT 및 배포, 워커의 template_id UPDATE
    """
    error_list = []
    done_list = []
    deployment_list = db.get_deployment_list()
    # template_id 없는 경우만 배포 id 값 담기
    deployment_id_list = [info["id"] for info in deployment_list if info.get("template_id")==None]
    for deployment_id in deployment_id_list:
        try:
            convert_deployment_db_to_template(deployment_id=deployment_id)
            done_list.append(deployment_id)
        except Exception as e:
            e = str(e)
            # 에러난 경우 error_list 에 담아서 loop 끝난 후 print
            if len(e)>50:
                e = e[:50]
            error_list.append({
                "id":deployment_id,
                "error":e
            })
    deployment_worker_list=db.get_deployment_worker_list()
    # template_id 없는 경우만 배포 워커 id 값 담기
    deployment_worker_id_list = [info["id"] for info in deployment_worker_list if info.get("template_id")==None]
    worker_error_list=[]
    worker_done_list=[]
    for worker_id in deployment_worker_id_list:
        try:
            convert_deployment_db_to_template(deployment_worker_id = worker_id)
            worker_done_list.append(worker_id)
        except Exception as e:
            e = str(e)
            # 에러난 경우 error_list 에 담아서 loop 끝난 후 print
            if len(e)>50:
                e = e[:50]
            worker_error_list.append({
                "id":worker_id,
                "error":e
            })
    if len(error_list)>0:
        print("Deployment Convert Error")
        print(error_list)
        print("================")
    if len(worker_error_list)>0:
        print("Deployment Worker Convert Error")
        print(worker_error_list)
        print("================")
    print("convert success deployment:",done_list)
    print("convert success worker:",worker_done_list)
    print("================")
    print("convert fail deployment:",[info['id'] for info in error_list])
    print("convert fail worker:",[info['id'] for info in worker_error_list])
    print("================")
    print("done")

# 임시, 삭제 예정
def change_template_form(deployment_template_id):
    template_info = db.get_deployment_template(deployment_template_id=deployment_template_id)
    template = template_info["template"]
    deployment_template_type = template.get("template_type")
    if deployment_template_type==None:
        return {
            "status":True,
            "message":"Not OLD Form"
        }
    template_base = DEPLOYMENT_JSON_TEMPLATE[deployment_template_type]
    for key in template_base:
        if template.get(key) !=None:
            template_base[key] = template[key]
    if template_base[DEPLOYMENT_TEMPLATE_KIND_INFO_KEY][DEPLOYMENT_TEMPLATE_TYPE_KEY]==DEPLOYMENT_RUN_CUSTOM:
        template_base[DEPLOYMENT_TEMPLATE_RUN_COMMAND_KEY][DEPLOYMENT_TEMPLATE_RUN_SCRIPT_KEY]=template["run_code"]
    print("template:", template_base)
    result, message = db.update_deployment_template_back(deployment_template_id=deployment_template_id, deployment_template=template_base)
    if result==False:
        return {
            "status":False,
            "message":message
        }
    return {
            "status":True
        }

# 임시, 삭제 예정
def update_all_old_template():
    template_infos = db.get_deployment_template_list(workspace_id=4)
    failures=[]
    successes=[]
    for info in template_infos:
        deployment_template_id = info["id"]
        try:
            result = change_template_form(deployment_template_id)
            if result["status"]==False:
                failures.append(deployment_template_id)
            else:
                successes.append(deployment_template_id)
        except:
            traceback.print_exc()
            failures.append(deployment_template_id)
    print("FAIL IDS:", failures)
    print("SUCCESS IDS:", successes)

# 템플릿 적용
def update_deployment(deployment_id, description, deployment_type,
                        training_id, job_id, hps_id, hps_number, training_type, command, run_code, environments,
                        checkpoint, instance_type,  built_in_model_id,
                        gpu_count, gpu_model, node_name, node_name_cpu, node_name_gpu, node_mode,
                        access, owner_id, users_id, docker_image_id, deployment_template,
                        deployment_template_id, deployment_template_name, deployment_template_group_id, deployment_template_group_name,
                        deployment_template_description, deployment_template_group_description,
                        headers_user):
    try:
        # Update Deployment
        deployment_info = db.get_deployment(deployment_id=deployment_id)
        workspace_id = deployment_info['workspace_id']
        workspace_name = deployment_info['workspace_name']

        # TODO 삭제 예정 custom 인경우 현재는 run_code 로 받으나 추후 변경 예정
        if deployment_type==DEPLOYMENT_TYPE_B:
            if run_code != None and command==None:
                command = DEPLOYMENT_TEMPLATE_RUN_COMMAND_INFO
                command[DEPLOYMENT_TEMPLATE_RUN_SCRIPT_KEY]=run_code

        if deployment_template != None:
            deployment_template_params = deployment_template
            deployment_template_type_with_version = DEPLOYMENT_RUN_SANDBOX_V1
        else:
            deployment_template_params = {
                DEPLOYMENT_TEMPLATE_DEPLOYMENT_TYPE_KEY: deployment_type,
                DEPLOYMENT_TEMPLATE_TRAINING_TYPE_KEY: training_type,
                DEPLOYMENT_TEMPLATE_TRAINING_ID_KEY: training_id,
                DEPLOYMENT_TEMPLATE_BUILT_IN_ID_KEY: built_in_model_id,
                DEPLOYMENT_TEMPLATE_JOB_ID_KEY: job_id,
                DEPLOYMENT_TEMPLATE_HPS_ID_KEY: hps_id,
                DEPLOYMENT_TEMPLATE_HPS_NUMBER_KEY: hps_number,
                DEPLOYMENT_TEMPLATE_CHECKPOINT_FILE_KEY: checkpoint,
                DEPLOYMENT_TEMPLATE_RUN_COMMAND_KEY: command,
                DEPLOYMENT_TEMPLATE_ENVIRONMENTS_KEY: environments
            }
            deployment_template_type_with_version = None

        # template 저장
        deployment_template_info = create_template_by_template_params(template_params=deployment_template_params, workspace_id=workspace_id, owner_id=owner_id,
                                deployment_template_id=deployment_template_id, deployment_template_name=deployment_template_name, 
                                deployment_template_description=deployment_template_description,
                                deployment_template_group_id=deployment_template_group_id, deployment_template_group_name=deployment_template_group_name, 
                                deployment_template_group_description=deployment_template_group_description,
                                deployment_template_type_with_version=deployment_template_type_with_version)
        deployment_template = deployment_template_info["deployment_template"]
        deployment_template_id = deployment_template_info["deployment_template_id"]

        # 빌트인/커스텀 모델의 deployment form list 정보 받기
        deployment_form_list_input_type = get_deployment_form_list_and_input_type(deployment_template=deployment_template, 
                                                                                workspace_name=workspace_name)
        deployment_form_list = deployment_form_list_input_type["deployment_form_list"]
        input_type = deployment_form_list_input_type["input_type"]
        
        node_name = common.combine_node_name(node_name_cpu=node_name_cpu, node_name_gpu=node_name_gpu, node_name=node_name)

        update_deployment_result, message = db.update_deployment(deployment_id=deployment_id, description=description, operating_type=instance_type, 
                                                                gpu_count=gpu_count, gpu_model=gpu_model, node_mode=node_mode, node_name=node_name,
                                                                input_type=input_type, access=access, owner_id=owner_id,
                                                                docker_image_id=docker_image_id, deployment_template_id=deployment_template_id)
        if not update_deployment_result:
            print("Update Deployment Error : {}".format(message))
            raise UpdateDeploymentDBInsertError
        
        # Insert data input form
        init_result, message = init_current_deployment_data_form(deployment_id=deployment_id, deployment_form_list=deployment_form_list)
        if init_result == False:
            print("Insert deployemnt data form error : {}".format(message))
            raise DeploymentDataFormDBInsertError

        # Update user deployment
        org_users_id = [ user["id"] for user in db.get_deployment_users(deployment_id=deployment_id) ]
        users_id.append(owner_id)
        del_user = list(set(org_users_id) - set(users_id))
        add_user = list(set(users_id) - set(org_users_id))

        # Insert User deployment
        insert_result, message = db.insert_user_deployment_s(deployments_id=[deployment_id]*len(add_user), users_id=add_user)
        if not insert_result:
            print("insert user deployment error : {}".format(str(message)))
            raise DeploymentUserDBInsertError
        
        # Delete User deployment
        delete_result, message = db.delete_user_deployment_s(deployments_id=[deployment_id]*len(del_user), users_id=del_user)
        if not delete_result:
            print("delete user deployment error : {}".format(str(message)))
            raise DeploymentDBDeleteUserError

        deployment_name = deployment_info['name']
        workspace_id = deployment_info['workspace_id']
        db.logging_history(
            user=headers_user, task='deployment',
            action='update', workspace_id=workspace_id,
            task_name=deployment_name
        )

        return response(status=1 , message="Updated Deployment")

    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception as e:
        traceback.print_exc()
        # return response(status=0, message="Update Deployment Error")
        raise e

def is_deployment_good_name(deployment_name):
    is_good = common.is_good_name(name=deployment_name)
    if is_good == False:
        raise DeploymentNameInvalidError
    return True

def delete_deployment_folder(workspace_name, deployment_name):
    flag = True
    is_deployment_good_name(deployment_name=deployment_name)
    deployment_dir = '{}/{}/deployments/{}'.format(settings.JF_WS_DIR, workspace_name, deployment_name)
    try:
        common.rm_rf(deployment_dir)
    except Exception as e:
        traceback.print_exc()
        return False, e
    return True, ""


def delete_deployment(deployment_ids, headers_user):
    try:
        deployment_list = db.get_deployments_from_deployment_id_list(deployment_id_list=deployment_ids)
        if len(deployment_list) == 0:
            raise DeleteDeploymentNotExistError

        deployment_id = deployment_list[0]["id"]
        deployment_info = db.get_deployment(deployment_id)
        workspace_name = deployment_info["workspace_name"]

        pod_list = kube.get_list_namespaced_pod()

        # uwsgi.lock()
        with jf_scheduler_lock:
            for deployment in deployment_list:
                # 배포 pod 삭제
                status = kube.get_deployment_status(deployment_id=deployment["id"], pod_list=pod_list)
                if status["status"] not in KUBER_NOT_RUNNING_STATUS:
                    res, message = kube.kuber_item_remove(deployment_id=deployment["id"])
                # 배포 폴더 삭제
                delete_folder_result, for_message = delete_deployment_folder(workspace_name=workspace_name, deployment_name=deployment["name"])
                if delete_folder_result ==False:
                    print("Delete deployment folder fail: {}".format(for_message))
                    raise DeleteDeploymentFolderError

            deployment_ids = [_.get('id') for _ in deployment_list]
            delete_result = db.delete_deployments(deployment_ids=deployment_ids)

            # 템플릿 삭제 시 is_deleted=1 인 템플릿 item에 대해서 참조하는 배포/워커 없으면 delete
            delete_not_used_deployment_template()
        # uwsgi.unlock()

        if delete_result:
            for deployment in deployment_list:
                db.logging_history(
                    user=headers_user, task='deployment',
                    action='delete', workspace_id=deployment["workspace_id"],
                    task_name=deployment["name"]
                )
            return response(status=1, message="Delete Deployments OK")
        else:
            raise DeleteDeploymentDBError
            # return response(status=0, message="Delete Deployments DB Fail")
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Delete Deployments Error")

def stop_deployment(deployment_id):
    try:
        deployment_info = db.get_deployment(deployment_id)
        # workspace_name = deployment_info.get("workspace_name")
        # deployment_name = deployment_info.get("name")
        # deployment_dir = '{}/{}/deployments/{}'.format(settings.JF_WS_DIR, workspace_name, deployment_name)
        # os.system("rm {deployment_dir}/*".format(deployment_dir=deployment_dir))
        if deployment_info is None:
            return response(status=0, message="Not Found Deployment")

        # check_result, res = permission_check(user=headers_user, deployment_info=deployment_info, permission_level=1)
        # if not check_result:
        #     return res

        res, message = kube.kuber_item_remove(deployment_id=deployment_id)
        res = 1 if res == True else 0
        return response(status=res, message=message)

    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Deployment Cannot Stop")


def get_error_log(deployment_id):
    try:
        pod_list = kube_data.get_pod_list()
        match_item_name_list = kube.find_kuber_item_name(item_list = pod_list, deployment_id=deployment_id)
        error_log=""
        if len(match_item_name_list)>0:
            cmd = 'kubectl logs {}'.format(match_item_name_list[0])
            error_log, *_ = common.launch_on_host(cmd, ignore_stderr=True)
            error_log = ''.join([cha[1:] for cha in error_log.split("DEPLOYMENT RUNCODE START")[-1].split('\napi_checking ')])
            error_log = error_log.split("DEPLOYMENT RUNCODE START")[-1]
        return response(status=1, message="Success Getting Deployment Log", result=error_log)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Error Getting Deployment Log")

# 템플릿 적용
def create_deployment_with_ckpt(workspace_id, checkpoint_id, owner_id, gpu_count, headers_user):
    from checkpoint import get_checkpoint_file_and_dir_full_path_in_pod
    try:
        # checkpoint = /jfbcore/jf-data/ckpt_data/[ckpt ID]/FILE_PATH
        checkpoint_info = db.get_checkpoint(checkpoint_id=checkpoint_id)
        if checkpoint_info is None:
            return response(status=0, message="Create Deployment Error : Checkpoint {} not exist.".format(checkpoint_id))

        checkpoint = checkpoint_info.get("checkpoint_file_path")
        checkpoint_dir_path = checkpoint_info.get("checkpoint_dir_path")
        checkpoint, checkpoint_dir_path = get_checkpoint_file_and_dir_full_path_in_pod(file_path=checkpoint, dir_path=checkpoint_dir_path)

        built_in_model_id = checkpoint_info.get("built_in_model_id")
        # user_id = checkpoint_info.get("user_id")
        workspace_info = db.get_workspace(workspace_id=workspace_id)
        workspace_name = workspace_info["workspace_name"]
        # run_code = "built_in_run_code"
        deployment_form_list = db.get_built_in_model_data_deployment_form(model_id=built_in_model_id)
        deployment_name = ''.join(random.choices(string.ascii_lowercase, k=8))
        deployment_type = DEPLOYMENT_TYPE_A
        input_type = ",".join([ deployement_form["category"] for deployement_form in deployment_form_list])
        docker_image_name = db.get_built_in_model(model_id=built_in_model_id).get("run_docker_name")
        docker_image_id = db.get_docker_image(docker_image_name=docker_image_name).get('id')
        access = 0
        instance_type = 'gpu' if gpu_count>0 else 'cpu'

        deployment_template_params={
            DEPLOYMENT_TEMPLATE_DEPLOYMENT_TYPE_KEY: deployment_type,
            DEPLOYMENT_TEMPLATE_CHECKPOINT_FILE_KEY: checkpoint,
            DEPLOYMENT_TEMPLATE_BUILT_IN_ID_KEY: built_in_model_id
        }

        # template 저장
        deployment_template_info = create_template_by_template_params(template_params=deployment_template_params, 
                                workspace_id=workspace_id, owner_id=owner_id,
                                deployment_template_id=deployment_template_id, deployment_template_name=None, 
                                deployment_template_description=None,
                                deployment_template_group_id=None, deployment_template_group_name=None, 
                                deployment_template_group_description=None, deployment_template_type_with_version=DEPLOYMENT_RUN_CHEKCPOINT_V1)
        deployment_template = deployment_template_info["deployment_template"]
        deployment_template_id = deployment_template_info["deployment_template_id"]


        description = checkpoint_info.get("description")
        if description==None:
            description=""
        insert_deployment_result = db.insert_deployment(
                                    workspace_id=workspace_id, deployment_name=deployment_name, description=description,
                                    operating_type=instance_type, 
                                    gpu_count=gpu_count, gpu_model=None, node_name=None, node_mode=1,
                                    input_type=input_type, access=access, owner_id=owner_id, 
                                    docker_image_id=docker_image_id, deployment_template_id=deployment_template_id)
        if not insert_deployment_result["result"]:
            print("Create Deployment DB Insert Error: {}".format(insert_deployment_result["message"]))
            raise CreateDeploymentDBInsertError
        # create_deployment_folder
        owner_name = db.get_user(user_id=owner_id)["name"]
        create_deployment_folder(workspace_name=workspace_name, deployment_name=deployment_name, owner_name=owner_name)
        # User, data input form
        # deployment_id = db.get_deployment(deployment_name=deployment_name)["id"]
        deployment_id = insert_deployment_result["id"]
        # Insert data input form
        if built_in_model_id is not None:
            init_result, message = init_current_deployment_data_form(deployment_id=deployment_id, built_in_model_id=built_in_model_id)
            if init_result == False:
                return response(status=0, message="Insert deployemnt data form error : {}".format(message))
        # # Run
        # run_deployment_ = run_deployment(deployment_id, headers_user)
        # # print(run_deployment_)
        # if run_deployment_["status"] == 1:
        return response(status=1, result={"inference_id": deployment_id}, message="Created Deployment")
        # else:
        #     delete_deployment([deployment_id], "root")
        #     return response(status=0, message=run_deployment_["message"])
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception as e:
        raise e

custom_deployment_json_str_ex={
    "api_file_name":"dddkfsdf.py",
    "checkpoint_load_dir_path_parser":"weight_dir",
    "checkpoint_load_file_path_parser":"weight",
    "deployment_num_of_gpu_parser":None,

    "deployment_input_data_form_list": [
        {
            "method": "POST",
            "location": "form",
            "api_key": "coordinate",
            "value_type": "str",
            "category": "canvas-coordinate",
            "category_description": "IMG (jpg, jpeg, png, bmp)"
        }
    ],
    "deployment_output_types": [
        "text",
        "columnchart",
        "piechart"
    ]
}

def create_deployment_api(custom_deployment_json_str):
    try:
        custom_deployment_json_rep = custom_deployment_json_str.replace("\'", "\"")
        # print(custom_deployment_json_rep)
        custom_deployment_json = json.loads(custom_deployment_json_rep)
        system_info_json={}
        for key in custom_deployment_json.keys():
            if key in ["api_file_name","deployment_output_types"]:
                pass
            else:
                system_info_json[key] = custom_deployment_json[key]
        for key in DEFAULT_CUSTOM_DEPLOYMENT_JSON:
            if key not in custom_deployment_json.keys():
                custom_deployment_json[key]=None

        # training_path = '/jf-data/workspaces/{}/trainings/{}/src'.format(workspace_name, training_name)
        # with open(os.path.join(JF_BUILT_IN_MODELS_PATH,'jf_auto_gen_api_example.py'), mode="r", encoding="utf8") as f:
        with open(JF_DEPLOYMENT_DEFAULLT_CUSTOM_API_PATH, mode="r", encoding="utf8") as f:
            jf_api_guide = f.read().splitlines()
        base_idx = jf_api_guide.index("시스템 정보")+3
        jf_api_guide.insert(base_idx, json.dumps(system_info_json, indent=4))


        # if "checkpoint_load_dir_path_parser" in custom_deployment_json.keys():
        if custom_deployment_json["checkpoint_load_dir_path_parser"]:
            idx = jf_api_guide.index("배포 실행 명령어 관련 자동생성 영역")
            jf_api_guide.insert(idx+2, "parser.add_argument('--{}', type=str, default='/job-checkpoints')".format(custom_deployment_json["checkpoint_load_dir_path_parser"]))
        # if "checkpoint_load_file_path_parser" in custom_deployment_json.keys():
        if custom_deployment_json["checkpoint_load_file_path_parser"]:
            idx = jf_api_guide.index("배포 실행 명령어 관련 자동생성 영역")
            jf_api_guide.insert(idx+2, "parser.add_argument('--{}', type=str, default='/job-checkpoints/ckpt')".format(custom_deployment_json["checkpoint_load_file_path_parser"]))
        # if "deployment_num_of_gpu_parser" in custom_deployment_json.keys():
        if custom_deployment_json["deployment_num_of_gpu_parser"]:
            idx = jf_api_guide.index("배포 실행 명령어 관련 자동생성 영역")
            jf_api_guide.insert(idx+2, "parser.add_argument('--{}', type=int, default=None)".format(custom_deployment_json["deployment_num_of_gpu_parser"]))
        
        if "deployment_input_data_form_list" in custom_deployment_json.keys():
            location_dic = {"body":"json", "args":"args.get", "file":"files", "form":"form"}
            input_form_list = custom_deployment_json["deployment_input_data_form_list"]
            idx = jf_api_guide.index("        TEST API 받아오는 부분 자동 생성 영역")
            category_index={}
            for input_form in reversed(input_form_list):
                if input_form["category"] not in category_index.keys():
                    category_index[input_form["category"]]=1
                input_form["category_idx"]=category_index[input_form["category"]]
                category_index[input_form["category"]]+=1

            for input_form in input_form_list:
                category = input_form["category"].replace('-','_')
                if input_form["location"]=="args":
                    request_line = "        jf_{category}{category_idx} = request.{location}('{api_key}')"
                elif input_form["location"]=="file":
                    request_line = "        jf_{category}{category_idx}_files = request.{location}.getlist('{api_key}')"
                    request_line += "\n        jf_{category}{category_idx} = request.{location}['{api_key}']"
                else:
                    request_line = "        jf_{category}{category_idx} = request.{location}['{api_key}']"
                jf_api_guide.insert(idx+2, request_line.format(category = category, category_idx = input_form["category_idx"],
                                                                location = location_dic[input_form["location"]],
                                                                api_key = input_form["api_key"]))
        if "deployment_output_types" in custom_deployment_json.keys():
            output_types = custom_deployment_json["deployment_output_types"]
            idx = jf_api_guide.index("        return jsonify(output)")-1
            jf_api_guide.insert(idx, "        }")
            jf_api_guide.insert(idx, "        output = {")
            for output_type in output_types:
                idx = jf_api_guide.index("        return jsonify(output)")-2
                output_idx = jf_api_guide.index('            "{}": ['.format(output_type))
                for i in range(5):
                    jf_api_guide.insert(idx+i, jf_api_guide[output_idx+i])
            idx = jf_api_guide.index("        return jsonify(output)")-1
            jf_api_guide[idx-2]=jf_api_guide[idx-2][:-1]

        form_example_index = jf_api_guide.index("        Output 자동 생성 영역 (OUTPUT Category)")
        del_end_index = jf_api_guide.index('            "table": [')
        for rm_idx in range(del_end_index-form_example_index + 5):
            del jf_api_guide[form_example_index+1]
        # with open(os.path.join(training_path,custom_deployment_json["run_code_name"]), mode="w", encoding="utf8") as f:
        #     f.write("\n".join(jf_api_guide))
        # os.system('chmod 664 {}/{}'.format(training_path,custom_deployment_json["run_code_name"]))
        result = {
            "custom_api_script":"\n".join(jf_api_guide),
            "api_file_name":custom_deployment_json["api_file_name"]
        }
        return response(status=1, result = result, message="Created default deployment api" )
    except:
        traceback.print_exc()
        return response(status=0, message="Creating default deployment api error")


def get_time_variables(start_time, end_time, interval, absolute_location):
    from datetime import datetime, timedelta
    # time string type 에서 datetime type 으로 변경
    # start_time_obj = datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S")
    # end_time_obj = datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S")
    start_timestamp = common.date_str_to_timestamp(start_time, POD_RUN_TIME_DATE_FORMAT)
    end_timestamp = common.date_str_to_timestamp(end_time, POD_RUN_TIME_DATE_FORMAT)
    # 프론트 요청에서 time 범위 꼬이는 경우가 자주 발생해 예외처리
    if start_timestamp>end_timestamp:
        end_timestamp=start_timestamp+interval
    # interval time delta 로 변경
    # interval_timedelta = timedelta(seconds = interval)
    additional_start_sec = 0
    if absolute_location:
        # interval 기준으로 범위 나누기: start time 의 timestamp 을 interval 로 나누어 나머지값 구함
        additional_start_sec = interval-start_timestamp%interval
    # additional_start_sec = timedelta(seconds = additional_start_sec)
    total_idx_count = (end_timestamp-start_timestamp-additional_start_sec)//interval
    additional_end_count = 1 if (end_timestamp-start_timestamp-additional_start_sec)%interval else 0
    additional_start_count = 1 if additional_start_sec else 0
    total_idx_count += additional_end_count+additional_start_count
    result = {
        "start_timestamp":start_timestamp,
        "end_timestamp":end_timestamp,
        "additional_start_sec":additional_start_sec,
        "additional_start_count":additional_start_count,
        "total_idx_count":int(total_idx_count),
    }
    return result


def get_default_api_monitor_graph_result(time, gpu_num_list, processing_response_key_list, 
                                        interval=None, search_type="range"):
    search_dic={
        "range":600,
        "live":1
    }
    dic = {
        "time": time,
        "time_local": 0,
        "monitor_count": [],
        "nginx_count": [], # nginx count
        "success_count": [],
        "error_count": [], # abnormal processing
        "monitor_error_count": [], # abnormal processing api
        "nginx_error_count": [], # abnormal processing nginx
        "error_rate": 0,
        "monitor_error_rate": 0,
        "nginx_error_rate": 0,
        "average_cpu_usage_on_pod": [], # cpu
        "average_mem_usage_per": [], # ram
        "worker_count": [0], # worker
        "time_list":[time],
        "gpu_resource":{}
    }
    for res_key in ["processing_time", "response_time"]:
        for key in processing_response_key_list:
            dic["{}_{}".format(key, res_key)]=[]
    for gpu_num in gpu_num_list:
        dic["gpu_resource"][gpu_num]={}
        dic["gpu_resource"][gpu_num]["gpu_memory_total"]=0
        dic["gpu_resource"][gpu_num]["average_gpu_memory_used"]=0
        dic["gpu_resource"][gpu_num]["average_gpu_memory_used_per"]=0 # gpu mem
        dic["gpu_resource"][gpu_num]["average_util_gpu"]=0 # gpu core
        dic["gpu_resource"][gpu_num]["average_util_gpu_memory"]=0
        dic["gpu_resource"][gpu_num]["count"]=0
    if interval<=search_dic[search_type]:
        return dic
    else:
        dic["time_list"]=[time+i*search_dic[search_type] for i in range(interval//search_dic[search_type])]
        dic["worker_count"]=[0 for i in range(interval//search_dic[search_type])]
        return dic



def update_nginx_error_log(error_log_list, result_list=None, i=None, log_dic=None):
    def all_dashboard(error_log_list, result_list, i):
        for result_dic in result_list:
            if result_dic[i].get("nginx_error_log_list") is not None:              
                error_log_list += [ error_log for error_log in result_dic[i].get("nginx_error_log_list") ]

    def only_worker(error_log_list, log_dic):
        # print("ERROR LOG ", log_dic.get("nginx_error_log_list"))
        error_log_list += log_dic.get("nginx_error_log_list")

    if log_dic is None:
        all_dashboard(error_log_list=error_log_list, result_list=result_list, i=i)
    else :
        only_worker(error_log_list=error_log_list, log_dic=log_dic)

def update_nginx_access_count_info(nginx_access_count_info, result_list=None, i=None, log_dic=None):
    def all_dashboard(nginx_access_count_info, result_list, i):
        for result_dic in result_list:
            if result_dic[i].get("nginx_access_count_info") is not None:
                for k, v in result_dic[i].get("nginx_access_count_info").items():
                    common.update_dict_key_count(dict_item=nginx_access_count_info, key=k, add_count=v)
    
    def only_worker(nginx_access_count_info, log_dic):
        for k, v in log_dic.get("nginx_access_count_info").items():
            common.update_dict_key_count(dict_item=nginx_access_count_info, key=k, add_count=v)

    if log_dic is None:
        all_dashboard(nginx_access_count_info=nginx_access_count_info, result_list=result_list, i=i)
    else :
        only_worker(nginx_access_count_info=nginx_access_count_info, log_dic=log_dic)

def update_monitor_error_log(error_log_list, log_dic=None):
    # print("ERROR LOG ", log_dic.get("monitor_error_log_list"))
    error_log_list += log_dic.get("monitor_error_log_list")


def update_code_dic(total_code_dic, code_dic):
    if len(code_dic)>0:
        for key in code_dic.keys():
            # if type(key) in [tuple]:
                # print(code_dic)
            detail_key = str(key)
            if key>=200 and key<600:
                main_key = detail_key[0]+"00"
            else:
                main_key = "rest"
            if detail_key in total_code_dic[main_key].keys():
                total_code_dic[main_key][detail_key]+=code_dic[key]
            else:
                total_code_dic[main_key][detail_key]=code_dic[key]

    return total_code_dic

def get_statistic_result(result, logic="mean", ndigits=3):
    
    def calculate_percentile(arry, percentile):
        size = len(arry)
        return sorted(arry)[int(math.ceil((size * percentile) / 100)) - 1]
    if len(result)==0:
        return 0
    elif logic in ["mean","average"]:
        return round(statistics.mean(result), ndigits=ndigits)
    elif logic == "median":
        return round(statistics.median(result), ndigits=ndigits)
    elif logic == "min":
        return round(min(result), ndigits=ndigits)
    elif logic == "max":
        return round(max(result), ndigits=ndigits)
    elif logic[:10]=="percentile":
        return round(calculate_percentile(arry=result, percentile=int(logic[10:])), ndigits=ndigits)

def flatten_list(input_list):
    return [item for sublist in input_list for item in sublist if type(sublist)==list]

def get_result_from_history_file(workspace_name, deployment_name, worker_list, start_time, end_time, interval, 
                                absolute_location, search_type):
    history_list=[]
    ndigits=5
    processing_response_key_list = ["min", "max", "average", "median", "99", "95", "90"]
    if worker_list!=None:
        for deployment_worker_id in worker_list:
            deployment_worker_log_dir = JF_DEPLOYMENT_WORKER_LOG_DIR_PATH.format(workspace_name=workspace_name, 
                                                                                deployment_name=deployment_name, 
                                                                                deployment_worker_id=deployment_worker_id)
            if search_type=="range":
                history_file_path = "{}/{}".format(deployment_worker_log_dir, POD_DASHBOARD_HISTORY_FILE_NAME)
                history_file_back_path = "{}/{}".format(deployment_worker_log_dir, POD_DASHBOARD_HISTORY_BACK_FILE_NAME)
            else:
                history_file_path = "{}/{}".format(deployment_worker_log_dir, POD_DASHBOARD_LIVE_HISTORY_FILE_NAME)
                history_file_back_path = "{}/{}".format(deployment_worker_log_dir, POD_DASHBOARD_LIVE_HISTORY_BACK_FILE_NAME)

            if os.path.exists(history_file_path):
                data = common.load_json_file(file_path=history_file_path)
                if data is not None:
                    history_list.append(data)
                else:
                    data = common.load_json_file(file_path=history_file_back_path)
                    if data is not None:
                        history_list.append(data)
                    else:
                        raise Exception("Json Decode error")
                # with open(history_file_path, "r") as f:
                #     # history_dic=json.load(f)
                #     history_list.append(json.load(f))

    # from datetime import datetime, timedelta
    time_variable_result = get_time_variables(start_time, end_time, interval, absolute_location)
    start_timestamp = time_variable_result["start_timestamp"]
    # end_timestamp=time_variable_result["end_timestamp"]
    additional_start_sec = time_variable_result["additional_start_sec"]
    # additional_start_count=time_variable_result["additional_start_count"]
    total_idx_count = time_variable_result["total_idx_count"]
    
    # 기본 time 만 포함한 graph 틀
    result = []
    # 초기 gpu list 받기
    gpu_num_list = []
    if len(history_list) > 0 :
        for result_dic in history_list:
            key_list = list(result_dic.keys())
            if len(key_list)>0:
                graph_result = result_dic[key_list[0]]["graph_result"]
                if len(graph_result)>0:
                    tmp_num_list = list(graph_result["gpu_resource"].keys())
                    gpu_num_list = tmp_num_list if len(tmp_num_list)>len(gpu_num_list) else gpu_num_list

    # 앞에 추가 start sec 이 있는경우
    if additional_start_sec > 0:
        for i in range(total_idx_count):
            time_stamp = start_timestamp+interval*(i-1)+additional_start_sec
            dic = get_default_api_monitor_graph_result(time=time_stamp, gpu_num_list=gpu_num_list, 
                                                        interval=interval, search_type=search_type, 
                                                        processing_response_key_list=processing_response_key_list)
            if len(gpu_num_list)>=1:
                for gpu_num in gpu_num_list:
                    dic["gpu_resource"][gpu_num]["gpu_memory_total"]=[]
                    dic["gpu_resource"][gpu_num]["average_gpu_memory_used"]=[]
                    dic["gpu_resource"][gpu_num]["average_gpu_memory_used_per"]=[]
                    dic["gpu_resource"][gpu_num]["average_util_gpu"]=[]
                    dic["gpu_resource"][gpu_num]["average_util_gpu_memory"]=[]
                    dic["gpu_resource"][gpu_num]["count"]=[]
            result.append(dic)
        # 첫번째 시간 start_time_obj 로 받기
        result[0]["time"] = start_timestamp
    # 앞에 추가 sec 이 없는 경우
    else:
        for i in range(total_idx_count):
            time_stamp = start_timestamp+interval*i
            dic = get_default_api_monitor_graph_result(time=time_stamp, gpu_num_list=gpu_num_list,
                                                        interval=interval, search_type=search_type, 
                                                        processing_response_key_list=processing_response_key_list)
            if len(gpu_num_list)>=1:
                for gpu_num in gpu_num_list:
                    dic["gpu_resource"][gpu_num]["gpu_memory_total"]=[]
                    dic["gpu_resource"][gpu_num]["average_gpu_memory_used"]=[]
                    dic["gpu_resource"][gpu_num]["average_gpu_memory_used_per"]=[]
                    dic["gpu_resource"][gpu_num]["average_util_gpu"]=[]
                    dic["gpu_resource"][gpu_num]["average_util_gpu_memory"]=[]
                    dic["gpu_resource"][gpu_num]["count"]=[]
            result.append(dic)
    key_list = list(result[0].keys())
    rm_key_list = ["time", "time_local", "gpu_resource", "worker_count", "time_list", "error_rate", "nginx_error_rate", "monitor_error_rate"]
    for res_key in ["processing_time", "response_time"]:
        for key in processing_response_key_list:
            rm_key_list.append("{}_{}".format(key, res_key))
    for rm_k in rm_key_list:
        key_list.remove(rm_k)
    if len(gpu_num_list)>=1:
        key_gpu_list = list(result[0]["gpu_resource"]['0'].keys())

    nginx_access_count_info={}
    error_log_list=[]
    total_code_dic={}
    processing_response_key_list_count = ["min", "max", "average", "median", "99", "95", "90", "count"]
    response_value_list = [[] for i in processing_response_key_list_count]
    processing_value_list = [[] for i in processing_response_key_list_count]
    response_time_info={
        "response_time":dict(zip(processing_response_key_list_count, response_value_list)),
        "processing_time":dict(zip(processing_response_key_list_count, processing_value_list)),
        "time":[]
    }
    # result 내의 result_dic 에 각 값의 list 담기
    for result_dic in result:
        time_iter=0
        for t_stamp in result_dic["time_list"]:

            time_str = str(t_stamp)
            for history_dic in history_list:
                if history_dic.get(time_str) !=None:
                    graph_result = history_dic[time_str]["graph_result"]
                    for key in key_list:
                        append_value = graph_result[key]
                        result_dic[key].append(append_value if append_value!=[] else 0)
                    if len(gpu_num_list)>=1:
                        for gpu_num in gpu_num_list:
                            if graph_result["gpu_resource"].get(gpu_num)!=None:
                                for key_gpu in key_gpu_list:
                                    append_value = graph_result["gpu_resource"][gpu_num][key_gpu]
                                    result_dic["gpu_resource"][gpu_num][key_gpu].append(append_value if append_value!=[] else 0)
                    result_dic["worker_count"][time_iter]+=1
                    error_log_list.extend(history_dic[time_str]["error_log_list"])

                    for key in history_dic[time_str]["total_code_dic"].keys():
                        if total_code_dic.get(key)!=None:
                            for detail_key in history_dic[time_str]["total_code_dic"][key].keys():
                                if total_code_dic[key].get(detail_key) != None:
                                    total_code_dic[key][detail_key]+=history_dic[time_str]["total_code_dic"][key][detail_key]
                                else:
                                    total_code_dic[key][detail_key]=history_dic[time_str]["total_code_dic"][key][detail_key]
                        else:
                            total_code_dic[key]=history_dic[time_str]["total_code_dic"][key]
                            
                    for key in history_dic[time_str]["nginx_access_count_info"].keys():
                        if nginx_access_count_info.get(key)!=None:
                            nginx_access_count_info[key]+=history_dic[time_str]["nginx_access_count_info"][key]
                        else:
                            nginx_access_count_info[key]=history_dic[time_str]["nginx_access_count_info"][key]
                    for res_key in ["processing_time", "response_time"]:
                        for key in processing_response_key_list:
                            # response_time_info[res_key][key].append(history_dic[time_str]["total_info"][res_key][key])
                            result_dic["{}_{}".format(key,res_key)].append(history_dic[time_str]["total_info"][res_key][key])
            time_iter+=1
    # list 값들 합치기 (average or sum)
    if len(gpu_num_list)>=1:
        key_gpu_list.remove("count")
        key_gpu_list.remove("gpu_memory_total")
    cpu_key_list=["average_mem_usage_per", "average_cpu_usage_on_pod"]
    # api_response_key_list=[i+"_response_time" for i in ["min", "max", "average"]]
    # nginx_response_key_list=[i+"_nginx_response_time" for i in ["min", "max", "average"]]
    api_response_key_list=[]
    nginx_response_key_list=[]
    for key in processing_response_key_list:
        nginx_response_key_list.append("{}_{}".format(key, "response_time"))
        api_response_key_list.append("{}_{}".format(key, "processing_time"))
    count_dic = {"processing_time":"success_count", "response_time":"nginx_count"}

    total_error_count_list=[]
    total_call_count_list=[]
    nginx_error_count_list=[]
    monitor_error_count_list=[]
    monitor_call_count_list=[]
    for result_dic in result:
        del result_dic["time_list"]
        result_dic["worker_count"]=max(result_dic["worker_count"])
        monitor_count = sum(result_dic["monitor_count"])
        success_count = sum(result_dic["success_count"])
        nginx_count=sum(result_dic["nginx_count"])
        result_dic["error_count"]=sum(result_dic["error_count"])
        result_dic["nginx_error_count"]=sum(result_dic["nginx_error_count"])
        result_dic["monitor_error_count"]=sum(result_dic["monitor_error_count"])
        # result_dic["error_rate"]=round(result_dic["error_count"]/nginx_count, ndigits)
        # result_dic["nginx_error_rate"]=round(result_dic["nginx_error_count"]/nginx_count, ndigits)
        # result_dic["monitor_error_rate"]=round(result_dic["monitor_error_count"]/count, ndigits)
        if nginx_count>0:
            range_list=list(range(len(result_dic["nginx_count"])))
            result_dic["error_rate"]=round(result_dic["error_count"]/(nginx_count+result_dic["error_count"]), ndigits)
            result_dic["nginx_error_rate"]=round(result_dic["nginx_error_count"]/(nginx_count+result_dic["error_count"]), ndigits)
            for key in nginx_response_key_list:
                logic=key.split("_")[0]
                if logic=="average":
                    average_dic = [result_dic[key][i]*result_dic["nginx_count"][i] for i in range_list if result_dic["nginx_count"][i]>0]
                    result_dic[key]=round(sum(average_dic)/nginx_count, ndigits)
                elif logic in [ "99", "95", "90"]:
                    result_dic[key]=get_statistic_result([i for i in result_dic[key] if i>0],logic="median", ndigits=ndigits)

                else:
                    result_dic[key]=get_statistic_result([i for i in result_dic[key] if i>0],logic=logic, ndigits=ndigits)
        else:
            for key in nginx_response_key_list:
                result_dic[key]=0
        if monitor_count>0:
            result_dic["monitor_error_rate"]=round(result_dic["monitor_error_count"]/monitor_count, ndigits)
            range_list=list(range(len(result_dic["monitor_count"])))
            for key in cpu_key_list:
                average_dic=[result_dic[key][i]*result_dic["monitor_count"][i] for i in range_list]
                result_dic[key]=round(sum(average_dic)/monitor_count, ndigits)
            if len(gpu_num_list)>=1:
                for gpu_num in gpu_num_list:
                    for key in key_gpu_list:
                        if sum(result_dic["gpu_resource"][gpu_num]["count"])>0:
                            gpu_range_list=range(len(result_dic["gpu_resource"][gpu_num]["count"]))
                            average_dic=[result_dic["gpu_resource"][gpu_num][key][i]*result_dic["gpu_resource"][gpu_num]["count"][i] for i in gpu_range_list]
                            result_dic["gpu_resource"][gpu_num][key]=round(sum(average_dic)/sum(result_dic["gpu_resource"][gpu_num]["count"]), ndigits)
                        else:
                            result_dic["gpu_resource"][gpu_num][key]=0
                    result_dic["gpu_resource"][gpu_num]["gpu_memory_total"]=sum(set(result_dic["gpu_resource"][gpu_num]["gpu_memory_total"]))
                    result_dic["gpu_resource"][gpu_num]["count"]=sum(result_dic["gpu_resource"][gpu_num]["count"])
        else:
            for key in cpu_key_list:
                result_dic[key]=0
            if len(gpu_num_list)>=1:
                for gpu_num in gpu_num_list:
                    for key in key_gpu_list:
                        result_dic["gpu_resource"][gpu_num][key]=0
                    result_dic["gpu_resource"][gpu_num]["gpu_memory_total"]=sum(set(result_dic["gpu_resource"][gpu_num]["gpu_memory_total"]))
                    result_dic["gpu_resource"][gpu_num]["count"]=sum(result_dic["gpu_resource"][gpu_num]["count"])
        if success_count>0:
            range_list=list(range(len(result_dic["success_count"])))
            for key in api_response_key_list:
                logic=key.split("_")[0]
                if logic=="average":
                    average_dic = [result_dic[key][i]*result_dic["success_count"][i] for i in range_list if result_dic["success_count"][i]>0]
                    result_dic[key]=sum(average_dic)/success_count
                elif logic in [ "99", "95", "90"]:
                    result_dic[key]=get_statistic_result([i for i in result_dic[key] if i>0],logic="median", ndigits=ndigits)
                else:
                    result_dic[key]=get_statistic_result([i for i in result_dic[key] if i>0],logic=logic, ndigits=ndigits)
        else:
            for key in api_response_key_list:
                result_dic[key]=0
        
        result_dic["monitor_count"]=monitor_count
        result_dic["success_count"]=success_count
        result_dic["nginx_count"]=nginx_count
        total_call_count_list.append(result_dic["nginx_count"]+result_dic["nginx_error_count"])
        total_error_count_list.append(result_dic["error_count"])
        nginx_error_count_list.append(result_dic["nginx_error_count"])
        monitor_error_count_list.append(result_dic["monitor_error_count"])
        monitor_call_count_list.append(result_dic["monitor_count"])

        # for key in ["min", "max", "average"]:
            # response_time_info["processing_time"][key].append(result_dic[key+"_response_time"])
            # response_time_info["response_time"][key].append(result_dic[key+"_nginx_response_time"])


        for res_key in ["processing_time", "response_time"]:
            response_time_info[res_key]["count"].append(result_dic[count_dic[res_key]])
            for key in processing_response_key_list:
                response_time_info[res_key][key].append(result_dic["{}_{}".format(key,res_key)])
                # response_time_info[res_key][key].append(result_dic["{}_{}".format(key,res_key)])

        response_time_info["time"].append(result_dic["time"])

    # print("response_time_info: ",response_time_info)
    for key in ["processing_time", "response_time"]:
        response_time_info[key]["total_average"]=[response_time_info[key]["average"][i]*response_time_info[key]["count"][i] 
                        for i in range(len(response_time_info[key]["count"])) if response_time_info[key]["count"][i]>0]
        if len(response_time_info[key]["total_average"])>0:
            response_time_info[key]["total_average"]=sum(response_time_info[key]["total_average"])/sum(response_time_info[key]["count"])
        else:
            response_time_info[key]["total_average"]=0
        if len(response_time_info[key]["max"])>0:
            max_idx = response_time_info[key]["max"].index(max(response_time_info[key]["max"]))
            response_time_info[key]["max_time"]=response_time_info["time"][max_idx]
    total_error_rate_list=[total_error_count_list[i]/total_call_count_list[i] for i in range(total_idx_count) if total_error_count_list[i]>0]
    nginx_error_rate_list=[nginx_error_count_list[i]/total_call_count_list[i] for i in range(total_idx_count) if nginx_error_count_list[i]>0]
    monitor_error_rate_list=[monitor_error_count_list[i]/monitor_call_count_list[i] for i in range(total_idx_count) if monitor_error_count_list[i]>0]
    return_result = {
        "graph_result":result,
        "nginx_access_count_info": nginx_access_count_info,
        "error_log_list": error_log_list,
        "code_list": total_code_dic,
        "total_info":{
            "call":{
                "total":sum(total_call_count_list),
                "min":get_statistic_result([i for i in total_call_count_list if i>0], "min", ndigits),
                "max":get_statistic_result(total_call_count_list, "max", ndigits)
            },
            "abnormal":{
                "total":{
                    "count":sum(total_error_count_list),
                    "max_count":get_statistic_result(total_error_count_list, "max", ndigits),
                    "rate":round(sum(total_error_count_list)/sum(total_call_count_list), ndigits) if sum(total_call_count_list)>0 else 0,
                    "max_rate":get_statistic_result(total_error_rate_list, "max", ndigits)
                },
                "nginx":{
                    "count":sum(nginx_error_count_list),
                    "max_count":get_statistic_result(nginx_error_count_list, "max", ndigits),
                    "rate":round(sum(nginx_error_count_list)/sum(total_call_count_list), ndigits) if sum(total_call_count_list)>0 else 0,
                    "max_rate":get_statistic_result(nginx_error_rate_list, "max", ndigits)
                },
                "api":{
                    "count":sum(monitor_error_count_list),
                    "max_count":get_statistic_result(monitor_error_count_list, "max", ndigits),
                    "rate":round(sum(monitor_error_count_list)/sum(monitor_call_count_list), ndigits) if sum(monitor_call_count_list)>0 else 0,
                    "max_rate":get_statistic_result(monitor_error_rate_list, "max", ndigits)
                }
            },
            "processing_time":{
                "average":round(response_time_info["processing_time"]["total_average"], ndigits),
                "median":get_statistic_result([i for i in response_time_info["processing_time"]["median"] if i>0], "median", ndigits),
                "99":get_statistic_result([i for i in response_time_info["processing_time"]["99"] if i>0], "median", ndigits),
                "95":get_statistic_result([i for i in response_time_info["processing_time"]["95"] if i>0], "median", ndigits),
                "90":get_statistic_result([i for i in response_time_info["processing_time"]["90"] if i>0], "median", ndigits),
                "min":get_statistic_result([i for i in response_time_info["processing_time"]["min"] if i>0], "min", ndigits),
                "max":get_statistic_result(response_time_info["processing_time"]["max"], "max", ndigits),
                "max_timestamp":response_time_info["processing_time"].get("max_time")
            },
            "response_time":{
                "average":round(response_time_info["response_time"]["total_average"], ndigits),
                "median":get_statistic_result([i for i in response_time_info["response_time"]["median"] if i>0], "median", ndigits),
                "99":get_statistic_result([i for i in response_time_info["response_time"]["99"] if i>0], "median", ndigits),
                "95":get_statistic_result([i for i in response_time_info["response_time"]["95"] if i>0], "median", ndigits),
                "90":get_statistic_result([i for i in response_time_info["response_time"]["90"] if i>0], "median", ndigits),
                "min":get_statistic_result([i for i in response_time_info["response_time"]["min"] if i>0], "min", ndigits),
                "max":get_statistic_result(response_time_info["response_time"]["max"], "max", ndigits),
                "max_timestamp":response_time_info["response_time"].get("max_time")
            }
        }
    }
    return return_result

def get_deployment_api_monitor_graph(deployment_id, start_time, end_time, interval, absolute_location, worker_list, search_type="range", get_csv=False):
    try:
        # from deployment_worker import get_deployment_api_total_count_info, get_deployment_resource_info
        from deployment_worker import check_deployment_worker_log_dir, check_worker_dir_and_install
        info = db.get_deployment_name_info(deployment_id=deployment_id)
        workspace_name = info.get("workspace_name")
        deployment_name = info.get("deployment_name")
        message = "Success getting dashboard history info"
        if worker_list != None:
            worker_list = [int(i.strip()) for i in worker_list.split(",")]
        else:
            # worker 없는경우
            log_dir_result = check_deployment_worker_log_dir(workspace_name=workspace_name, deployment_name=deployment_name,
                                                            start_time=start_time, end_time=end_time)
            if log_dir_result["error"]==1:
                message = log_dir_result["message"]
                # return response(status=0, message=log_dir_result["message"])
            else:
                worker_list = [int(i) for i in log_dir_result["log_dir"]]
        # check worker installing
        if worker_list !=None:
            if check_worker_dir_and_install(workspace_name, deployment_name, worker_list)==False:
                message = "Worker Installing"
            # return response(status=0, message="Worker Installing")

        # result = get_result_from_history_file(workspace_name, deployment_name, worker_list)
        result = get_result_from_history_file(workspace_name=workspace_name, deployment_name=deployment_name,
                                            worker_list=worker_list, start_time=start_time, end_time=end_time, 
                                            interval=interval, absolute_location=absolute_location, search_type=search_type)
        if get_csv==True:
            if len(result["error_log_list"])==0:
                raise DeploymentAbnormalHistoryCSVNotExistError
                # return response(status=0, message="No abnormal history result")
            csv_result=[]
            csv_result.append(list(result["error_log_list"][0].keys()))
            for error_dic in result["error_log_list"]:
                csv_result.append(list(error_dic.values()))
            return common.csv_response_generator(data_list=csv_result)
            # return response(status=1, result=csv_result, message="Success getting abnormal history csv")
        return response(status=1, result=result, message=message)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="get dashboard history error")

def get_deployment_dashboard_status(deployment_id):
    try:
        from deployment_worker import get_deployment_api_total_count_info, get_deployment_resource_info
        from deployment_worker import check_deployment_worker_log_dir
        info = db.get_deployment_name_info(deployment_id=deployment_id)
        workspace_name = info.get("workspace_name")
        deployment_name = info.get("deployment_name")
        log_dir_result = check_deployment_worker_log_dir(workspace_name=workspace_name, deployment_name=deployment_name)
        message="success"
        if log_dir_result["error"]==1:
            message = log_dir_result["message"]
            # return response(status=0, message=log_dir_result["message"])
            
        # # check worker installing
        # if check_worker_install(workspace_name, deployment_name, log_dir_result["log_dir"])==False:
        #     return response(status=0, message="Worker Installing")
        # get count info
        total_info = get_deployment_api_total_count_info(worker_dir_list=log_dir_result["log_dir"], workspace_name=workspace_name, deployment_name=deployment_name)

        # get worker count
        running_worker_list = get_running_worker_dir(deployment_id=deployment_id)
        total_info["running_worker_count"]=len(running_worker_list["running_worker_list"])
        total_info["error_worker_count"]=len(running_worker_list["error_worker_list"])
        
        # get run time
        if log_dir_result["error"]!=1:
            total_info["deployment_run_time"]=get_deployment_run_time(deployment_id=deployment_id)
        else:
            total_info["deployment_run_time"]=0
        
        # get resource info
        resource_info = get_deployment_resource_info(worker_dir_list=running_worker_list["running_worker_list"]+running_worker_list["error_worker_list"], 
                                                    deployment_id=deployment_id)
        result={
            "total_info":total_info,
            "resource_info":resource_info,
            "worker_start_time":get_worker_start_time(deployment_id=deployment_id)
        }
        return response(status=1, message=message, result=result)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="get dashboard status error")

# template 삭제
def get_deployment_type_info(id, is_worker=False):
    # deployment_type: "custom", "checkpoint", "pretrained", "usertrained" 
    if is_worker:
        deployment_info = db.get_deployment_worker_type_info(deployment_worker_id=id)
    else:
        deployment_info = db.get_deployment_type_info(deployment_id=id)
    # print("dep info: {}".format(str(deployment_info)))
    return get_deployment_type_from_info(deployment_info)

# template 삭제
def get_deployment_type_from_info(deployment_info):
    deployment_running_type=None
    if deployment_info !=None:
        if deployment_info["type"]=="custom":
            deployment_running_type=DEPLOYMENT_RUN_CUSTOM

        if deployment_info["type"]=="built-in" and deployment_info["checkpoint_id"]!=None:
            deployment_running_type=DEPLOYMENT_RUN_CHEKCPOINT

        if deployment_info["type"]=="built-in" and deployment_info["training_id"]==None and deployment_info["checkpoint_id"]==None:
            deployment_running_type=DEPLOYMENT_RUN_PRETRAINED

        if deployment_info["type"]=="built-in" and deployment_info["checkpoint"]!=None and deployment_info["training_id"] !=None:
            deployment_running_type=DEPLOYMENT_RUN_USERTRAINED
    # print("dep running type: {}".format(deployment_running_type))
    return deployment_running_type

# 템플릿 적용
def get_deployment_running_info(id, is_worker=False):
    if is_worker:
        deployment_version_info = db.get_deployment_worker_pod_run_info(id)
    else:
        deployment_version_info= db.get_deployment_pod_run_info(id)
    deployment_version_info.update(deployment_version_info["deployment_template_info"])
    deployment_version_info["type"] = deployment_version_info[DEPLOYMENT_TEMPLATE_KIND_INFO_KEY][DEPLOYMENT_TEMPLATE_DEPLOYMENT_TYPE_KEY]
    if deployment_version_info["type"]==DEPLOYMENT_TYPE_A:
        additional_info = db.get_deployment_worker_built_in_pod_run_info(deployment_version_info["built_in_model_id"])
        if additional_info != None:
            deployment_version_info.update(additional_info)
        deployment_version_info["checkpoint"] = deployment_version_info.get(DEPLOYMENT_TEMPLATE_CHECKPOINT_FILE_KEY)
    elif deployment_version_info["type"]==DEPLOYMENT_TYPE_B:
        run_code_info = deployment_version_info.get(DEPLOYMENT_TEMPLATE_RUN_COMMAND_KEY)
        if run_code_info != None:
            deployment_version_info["run_code"] = run_code_info.get(DEPLOYMENT_TEMPLATE_RUN_SCRIPT_KEY)
    del deployment_version_info["deployment_template_info"]

    return deployment_version_info

def get_deployment_worker_list_from_folder(workspace_name, deployment_name):
    
    deployment_log_dir = JF_DEPLOYMENT_LOG_DIR_PATH.format(workspace_name=workspace_name, deployment_name=deployment_name)

    worker_list = []
    try:
        for name in os.listdir(deployment_log_dir):
            full_path = os.path.join(deployment_log_dir, name)
            if os.path.isdir(full_path):
                worker_list.append(name)
    except FileNotFoundError as fne:
        return []
    except Exception as e:
        traceback.print_exc()
        return []
    return worker_list


def get_deployment_run_time_list(deployment_id=None, workspace_name=None, deployment_name=None, *args, **kwargs):
    """
    Description : deployment_id or workspace_name deployment_name 조합으로 해당 조건에 맞는 worker 들의 run time 정보를 list로 가져오는 함수

    Args :
        deployment_id (int) : 
        ----------------------
        workspace_name (str) :
        deployment_name (str) :

    Returns :
        (list): [ { "start_time": "2022-03-10 03:24:13", "end_time": "2022-03-10 05:49:31" } ... ]
    """
    from deployment_worker import get_deployment_worker_run_time_info
    
    if deployment_id is not None:
        deployment_info = db.get_deployment(deployment_id=deployment_id)
        if deployment_info is None:
            return []
        workspace_name = deployment_info["workspace_name"]
        deployment_name = deployment_info["name"]

    run_time_info_list = []
    for deployment_worker_id in get_deployment_worker_list_from_folder(workspace_name=workspace_name, deployment_name=deployment_name):
        run_time_info = get_deployment_worker_run_time_info(workspace_name=workspace_name, deployment_name=deployment_name, deployment_worker_id=deployment_worker_id, *args, **kwargs)
        if run_time_info is not None:
            run_time_info_list.append(run_time_info)

    return run_time_info_list

def get_deployment_run_time(deployment_id=None, workspace_name=None, deployment_name=None, *args, **kwargs):
    """
    Description : deployment_id or workspace_name deployment_name 조합으로 해당 조건에 맞는 deployment의 run_time의 ts 값 내려주는 함수

    Args :
        deployment_id (int) : 
        ----------------------
        workspace_name (str) :
        deployment_name (str) :

    Returns :
        (int): run time timestamp

    """
    import utils.common as common
    run_time_list = get_deployment_run_time_list(deployment_id=deployment_id, workspace_name=workspace_name, deployment_name=deployment_name, *args, **kwargs)
    # print("RUN TIME LIST" , run_time_list)
    run_time_list = [dic for dic in run_time_list if dic!={}]
    run_time_list = sorted(run_time_list, key=lambda run_time: (run_time["start_time"], run_time["end_time"]))

    base_start_time_ts = -1
    base_end_time_ts = -1
    run_time_ts = 0
    for i, run_time in enumerate(run_time_list):
        current_start_time_ts = common.date_str_to_timestamp(run_time["start_time"])
        current_end_time_ts = common.date_str_to_timestamp(run_time["end_time"])
        
        if base_start_time_ts == -1:
            base_start_time_ts = current_start_time_ts
        if base_end_time_ts == -1:
            base_end_time_ts = current_end_time_ts
            
        if (base_start_time_ts <= current_start_time_ts and current_start_time_ts <= base_end_time_ts) and i != len(run_time_list) -1 :
            base_end_time_ts = current_end_time_ts
        else:
            if i == len(run_time_list) -1:
                base_end_time_ts = current_end_time_ts
            run_time_ts += base_end_time_ts - base_start_time_ts
            base_start_time_ts = -1
            base_end_time_ts = -1

    return run_time_ts

def get_deployment_nginx_access_log_per_hour_list(deployment_id, workspace_name, deployment_name):
    from deployment_worker import get_deployment_worker_nginx_access_log_per_hour_info_list

    deployment_worker_id_list = get_deployment_worker_list_from_folder(workspace_name=workspace_name, deployment_name=deployment_name)
    worker_num_of_log_per_hour_info_list = []
    for deployment_worker_id in deployment_worker_id_list:
        per_hour_info_list = get_deployment_worker_nginx_access_log_per_hour_info_list(workspace_name=workspace_name, deployment_name=deployment_name, deployment_worker_id=deployment_worker_id)
        if per_hour_info_list:
            worker_num_of_log_per_hour_info_list += per_hour_info_list
    return worker_num_of_log_per_hour_info_list

def get_deployment_call_count_per_hour_chart(deployment_id, workspace_name, deployment_name):
    from deployment_worker import get_nginx_per_hour_time_table_dict, get_call_count_per_hour_chart
    # deployment_info = db.get_deployment(deployment_id=deployment_id)
    # workspace_name = deployment_info["workspace_name"]
    # deployment_name = deployment_info["name"]
    log_per_hour_info_list = get_deployment_nginx_access_log_per_hour_list(deployment_id=deployment_id, workspace_name=workspace_name, deployment_name=deployment_name)
    time_table = get_nginx_per_hour_time_table_dict(log_per_hour_info_list=log_per_hour_info_list)

    return get_call_count_per_hour_chart(time_table=time_table, log_per_hour_info_list=log_per_hour_info_list)



def check_worker_time_range(start_time, end_time, worker_start_time, worker_end_time):
    # print("start_time", start_time)
    # print("end_time", end_time)
    # print("worker_start_time", worker_start_time)
    # print("worker_end_time", worker_end_time)
    result=False
    if worker_start_time<start_time:
        if worker_end_time>=start_time:
            result=True
    elif worker_start_time<end_time:
        result=True
    return result

def get_running_worker_dir(deployment_id):
    from utils.kube_pod_status import get_deployment_worker_status
    from utils.kube_parser import parsing_item_labels
    result = {}
    pod_list = kube_data.get_pod_list()
    # match_item_name_list = kube.find_kuber_item_name(item_list = pod_list, deployment_id=deployment_id)
    match_item_name_list = kube.find_kuber_item_name_and_item(item_list=pod_list, deployment_id=deployment_id)
    worker_dir_list=[]
    if len(match_item_name_list)>0:
        for item in match_item_name_list:
            worker_dir_list.append(parsing_item_labels(item["item"]).get("deployment_worker_id"))
        # worker_dir_list=[int(i.split("-")[-1]) for i in match_item_name_list]
    # print("worker_dir_list: ", worker_dir_list)
    error_worker_list=[]
    running_worker_list=[]
    for id in worker_dir_list:
        status = get_deployment_worker_status(deployment_worker_id=id)
        if status["status"] in KUBER_RUNNING_STATUS:
            running_worker_list.append(id)
        if status["status"]==KUBE_POD_STATUS_ERROR:
            error_worker_list.append(id)
    result["running_worker_list"]=running_worker_list
    result["error_worker_list"]=error_worker_list
    return result

def get_worker_info_dic(start_time, end_time, worker_list, deployment_path, deployment_id=None):
    # time to time object
    if start_time!=None and end_time!=None:
        start_time_obj=datetime.strptime(start_time, POD_RUN_TIME_DATE_FORMAT)
        end_time_obj=datetime.strptime(end_time, POD_RUN_TIME_DATE_FORMAT)
        start_timestamp=common.date_str_to_timestamp(start_time, POD_RUN_TIME_DATE_FORMAT)
        end_timestamp=common.date_str_to_timestamp(end_time, POD_RUN_TIME_DATE_FORMAT)
    # get worker list if pod run time in time range
    running_worker_list = get_running_worker_dir(deployment_id=deployment_id)
    running_worker_list=running_worker_list["running_worker_list"]
    worker_info_dic={}
    now_time_obj = datetime.now()
    # now_timestamp = common.date_str_to_timestamp()
    for i in range(len(worker_list)):
        try:
            pod_run_time_path = "{}/log/{}/{}".format(deployment_path, worker_list[i], POD_RUN_TIME_FILE_NAME)
            with open(pod_run_time_path, "r") as f:
                run_time=json.load(f)
        except FileNotFoundError:
            continue
        # print("pod run time",run_time)
        worker_start_time_obj=datetime.strptime(run_time["start_time"], POD_RUN_TIME_DATE_FORMAT)
        worker_end_time_obj=datetime.strptime(run_time["end_time"], POD_RUN_TIME_DATE_FORMAT)
        worker_start_timestamp=common.date_str_to_timestamp(run_time["start_time"], POD_RUN_TIME_DATE_FORMAT)
        worker_end_timestamp=common.date_str_to_timestamp(run_time["end_time"], POD_RUN_TIME_DATE_FORMAT)
        check_range=True
        if start_time!=None and end_time!=None:
            check_range = check_worker_time_range(start_time_obj, end_time_obj, worker_start_time_obj, worker_end_time_obj)
        if check_range:
            worker_dic={
                "start_time":run_time["start_time"],
                "end_time":datetime.strftime(now_time_obj, POD_RUN_TIME_DATE_FORMAT) if worker_list[i] in running_worker_list else run_time["end_time"],
                "start_time_obj":worker_start_time_obj,
                "end_time_obj": now_time_obj if worker_list[i] in running_worker_list else worker_end_time_obj
            }
            worker_info_dic[worker_list[i]]=worker_dic
    return worker_info_dic

def get_date_int(time_str, mode="api"):
    if mode=="nginx":
        return time_str.split("T")[0].replace("-","")
    else:
        return time_str.split(" ")[0].replace("-","")

def get_time_int(time_str, mode="api"):
    if mode=="nginx":
        return time_str.split("T")[1][:8].replace(":","")
    else:
        return time_str.split(" ")[1].replace(":","")

def download_logfile(result_list, worker_info, deployment_path, start_time, end_time, nginx_log, api_log, deployment_name):
    from datetime import datetime
    def time_file_name(time_str):
        return time_str[2:].replace("-", "").replace(":", "").replace(" ", "-")
    
    mode_log_dic = {"nginx": "nginx_access_log", "api": "monitor_log"}
    mode_time_dic = {"nginx": "time_local", "api": "time"}

    mode_dic = {"nginx": nginx_log, "api": api_log}
    mode_list = [key for key in mode_dic.keys() if mode_dic[key]]
    # filter log by time
    if start_time!=None and end_time!=None:
        if start_time==end_time:
            end_time=end_time+" 23:59:59"
            end_time=end_time+" 00:00:00"
        for mode in mode_list:
            for idx in range(len(result_list)):
                log_list = result_list[idx][mode_log_dic[mode]]
                time_key = mode_time_dic[mode]
                start_idx=0
                end_idx=len(log_list)-1
                for log_dic in log_list:
                    if common.date_str_to_timestamp(log_dic[time_key])>=common.date_str_to_timestamp(start_time):

                    # if get_date_int(log_dic[time_key], mode)>=get_date_int(start_time):
                        # if get_time_int(log_dic[time_key], mode)>=get_time_int(start_time):
                        start_idx = log_list.index(log_dic)
                        break
                for log_dic in list(reversed(log_list)):
                    if common.date_str_to_timestamp(log_dic[time_key])<=common.date_str_to_timestamp(end_time):
                        # if get_time_int(log_dic[time_key], mode)<=get_time_int(end_time):
                        end_idx = log_list.index(log_dic)
                        break
                result_list[idx][mode_log_dic[mode]] = log_list[start_idx: end_idx+1]
                # print("start_idx", start_idx)
                # print("end_idx", end_idx)
                # print(common.date_str_to_timestamp(log_dic[time_key]))
                # print(common.date_str_to_timestamp(start_time))
    else:
        start_time = min([worker_info[key]["start_time_obj"] for key in  worker_info.keys()])
        start_time = datetime.strftime(start_time, POD_RUN_TIME_DATE_FORMAT)
        end_time = max([worker_info[key]["end_time_obj"] for key in  worker_info.keys()])
        end_time = datetime.strftime(end_time, POD_RUN_TIME_DATE_FORMAT)
    # make temporary directory  
    tmp_dir_name = ''.join(random.choices(string.ascii_lowercase, k=8))
    save_dir_name = "{}/{}".format(deployment_path, tmp_dir_name)
    os.makedirs(save_dir_name)
    # print("cwd_original: ",str(os.getcwd()))
    os.chdir(save_dir_name)
    # print("cwd: ",str(os.getcwd()))
    # make download name
    WORKER_TIME = "{start_time}-{end_time}"
    log_time = "{start_time}-{end_time}".format(start_time=time_file_name(start_time), end_time=time_file_name(end_time))
    FILE_NAME = "{mode}_{worker_id}__{log_time}__{worker_time}.txt"
    # save logs
    file_name_list=[]
    for mode in mode_list:
        # save log by worker
        for log_dic in result_list:
            log_str = "\n".join([str(i) for i in log_dic[mode_log_dic[mode]]])
            # print("log str: ",log_str[:100])
            dic = worker_info[log_dic["deployment_worker_id"]]
            worker_time = WORKER_TIME.format(start_time=time_file_name(dic["start_time"]), end_time=time_file_name(dic["end_time"]))
            file_name = FILE_NAME.format(mode=mode,worker_id=log_dic["deployment_worker_id"], log_time=log_time, worker_time=worker_time)
            with open(file_name, mode="w") as f:
                f.write(log_str)
            file_name_list.append(file_name)
    # send tar file
    worker_str = "-".join([str(i) for i in worker_info.keys()])
    tar_file_name = "{}_{}_{}.tar".format(deployment_name, worker_str, log_time)
    # print("tar file name: "+ tar_file_name)
    file_name_list_str = " ".join(file_name_list)
    os.system('tar -cvf {} {}'.format(tar_file_name, file_name_list_str))
    result = send_from_directory(directory = save_dir_name, filename = tar_file_name, as_attachment= True)
    os.system('rm -r {}'.format(save_dir_name))
    result.headers["Access-Control-Expose-Headers"] = 'Content-Disposition'
    return result

def get_deployment_log_download(deployment_id, worker_list, start_time, end_time, nginx_log, api_log):
    try:
        from deployment_worker import get_graph_log, check_deployment_worker_log_dir, check_worker_dir_and_install
        info = db.get_deployment_name_info(deployment_id=deployment_id)
        workspace_name = info.get("workspace_name")
        deployment_name = info.get("deployment_name")
        # worker list 받기
        if worker_list != None:
            worker_list = [int(i.strip()) for i in worker_list.split(",")]
        else:
            # worker list 가 없는 경우
            log_dir_result = check_deployment_worker_log_dir(workspace_name=workspace_name, deployment_name=deployment_name, 
                                                            start_time=start_time, end_time=end_time)
            if log_dir_result["error"]==1:
                print(log_dir_result["message"])
                raise DeploymentWorkerLogDirNotExistError
                # return response(status=0, message=log_dir_result["message"])
            worker_list = [int(i) for i in log_dir_result["log_dir"]]
        deployment_path = JF_DEPLOYMENT_PATH.format(workspace_name=workspace_name, deployment_name=deployment_name)
        if check_worker_dir_and_install(workspace_name=workspace_name, deployment_name=deployment_name, worker_dir_list=worker_list)==False:
            raise DeploymentWorkerDirNotExistError
            # return response(status=0, message="worker directory does not exist")
        # get log filter by worker => log_worker_list
        worker_info = get_worker_info_dic(start_time, end_time, worker_list, deployment_path, deployment_id)
        if len(worker_info)==0:
            raise DeploymentNoLogError
            # return response(status=0, message="No log in input time range")
        log_worker_list = worker_info.keys()
        # log worker list 통해 log list 받기 => [{"nginx_access_log":[], "monitor_log":[], "deployment_worker_id": },..]
        result_list = get_graph_log(start_time=start_time, end_time=end_time, deployment_id=deployment_id, deployment_worker_id=None, 
                                    worker_list=log_worker_list, nginx_log=nginx_log, api_log=api_log)
        if len(result_list)==0:
            return response(status=0, message="unknown error")
        # worker 없는경우
        if len(result_list)==sum(result_list[i].get("error") for i in range(len(result_list))):
            raise DeploymentNoWorkerInTimeRangeError
            # return response(status=0, message=result_list[0]["message"])
        # log file download
        result = download_logfile(result_list=result_list, worker_info=worker_info, deployment_path=deployment_path,
                                start_time=start_time, end_time=end_time, nginx_log=nginx_log, 
                                api_log=api_log, deployment_name=deployment_name)
        os.chdir("/jf-src/master")
        return result

    except Exception as e:
        traceback.print_exc()
        os.chdir("/jf-src/master")
        return response(status=0, message="downloading log error")

def get_deployment_log_delete(deployment_id, end_time, worker_list=None, get_worker_list=False):
    from deployment_worker import check_deployment_worker_log_dir, get_graph_log, delete_deployment_worker
    from datetime import datetime
    try:
        deployment_name_info = db.get_deployment_name_info(deployment_id=deployment_id)
        workspace_name = deployment_name_info.get("workspace_name")
        deployment_name = deployment_name_info.get("deployment_name")
        # worker list 가 없는 경우
        log_dir_result = check_deployment_worker_log_dir(workspace_name=workspace_name, deployment_name=deployment_name, 
                                                        end_time=end_time)
        if log_dir_result["error"]==1:
            return response(status=0, message=log_dir_result["message"])
        running_worker_dir = get_running_worker_dir(deployment_id)
        if worker_list ==None:
            worker_list=log_dir_result["log_dir"]
        else:
            worker_list = [i.strip() for i in worker_list.split(',')]
        # edit_file_list = [POD_API_LOG_FILE_NAME, POD_API_LOG_COUNT_FILE_NAME, 
        #                 POD_NGINX_ACCESS_LOG_FILE_NAME, POD_RUN_TIME_FILE_NAME]
        edit_file_list = [POD_API_LOG_FILE_NAME, POD_NGINX_ACCESS_LOG_FILE_NAME]
        # 기준 시간 없는 경우
        if end_time==None:
            for log_dir in worker_list:
                # running 아닌 worker 의 경우 worker 삭제
                if log_dir not in running_worker_dir["running_worker_list"]:
                    result=delete_deployment_worker(int(log_dir))
                else:
                    deployment_worker_log_dir = JF_DEPLOYMENT_WORKER_LOG_DIR_PATH.format(workspace_name=workspace_name,
                                                                                    deployment_name=deployment_name,
                                                                                    deployment_worker_id=log_dir)
                    for file_name in edit_file_list:
                        file_path = "{}/{}".format(deployment_worker_log_dir, file_name)
                        # nginx log 의 경우 빈 파일로 남겨둠
                        # if file_name==POD_NGINX_ACCESS_LOG_FILE_NAME:
                        with open(file_path, "w") as f:
                            f.write("")
                        # nginx 아닌경우 삭제
                        # elif os.path.exists(file_path):
                        #     os.system("rm {}".format(file_path))
        # 시간 정해진 경우
        else:
            complete_delete_list=[]
            partial_delete_list=[]
            # stop worker 만 해당됨
            result_worker_dir=list(set(worker_list)-set(running_worker_dir["running_worker_list"]))
            # 모든 worker 가 running 인 경우
            if len(result_worker_dir)==0:
                return response(status=0, message="all workers are running")
            result_list = get_graph_log(end_time=end_time, deployment_id=deployment_id, worker_list=list(result_worker_dir))
            if len(result_list)==0:
                return response(status=0, message="unknown error")
            # worker 없는경우
            if len(result_list)==sum(result_list[i].get("error") for i in range(len(result_list))):
                return response(status=0, message=result_list[0]["message"])
            
            mode_log_dic = {"nginx": "nginx_access_log", "api": "monitor_log"}
            mode_time_dic = {"nginx": "time_local", "api": "time"}
            mode_path_dic = {"nginx": POD_NGINX_ACCESS_LOG_FILE_NAME, "api": POD_API_LOG_FILE_NAME}
            split_str_dic = {"nginx": '"time_local":"{}"', "api": "'time': '{}'"}
            for result_dic in result_list:
                deployment_worker_log_dir = JF_DEPLOYMENT_WORKER_LOG_DIR_PATH.format(workspace_name=workspace_name,
                                                                    deployment_name=deployment_name,
                                                                    deployment_worker_id=str(result_dic["deployment_worker_id"]))
                with open("{}/{}".format(deployment_worker_log_dir, POD_RUN_TIME_FILE_NAME), mode="r", encoding="utf8") as f:
                    run_time_dic = json.load(f)
                # if end_time >= worker pod run time -> delete worker
                if common.date_str_to_timestamp(run_time_dic["end_time"], POD_RUN_TIME_DATE_FORMAT)<=common.date_str_to_timestamp(end_time, POD_RUN_TIME_DATE_FORMAT):
                    if get_worker_list:
                        complete_delete_list.append(int(result_dic["deployment_worker_id"]))
                    else:
                        result=delete_deployment_worker(int(result_dic["deployment_worker_id"]))
                # if start_time > end time 일때 pass
                elif common.date_str_to_timestamp(run_time_dic["start_time"], POD_RUN_TIME_DATE_FORMAT)>common.date_str_to_timestamp(end_time, POD_RUN_TIME_DATE_FORMAT):
                    pass
                else:
                    if get_worker_list:
                        partial_delete_list.append(int(result_dic["deployment_worker_id"]))
                    else:
                        for mode in ['nginx', 'api']:
                            time_key=mode_time_dic[mode]
                            for log_dic in result_dic[mode_log_dic[mode]]:
                                # if get_date_int(log_dic[time_key], mode)>=get_date_int(end_time):
                                if common.date_str_to_timestamp(log_dic[time_key])>=common.date_str_to_timestamp(end_time):
                                    break
                                    # if get_time_int(log_dic[time_key], mode)>=get_time_int(end_time):
                                    #     break

                            split_str = split_str_dic[mode].format(log_dic[time_key])
                            with open("{}/{}".format(deployment_worker_log_dir, mode_path_dic[mode]), mode="r", encoding="utf8") as f:
                                log_str_list=f.read().split(split_str)[1:]
                            with open("{}/{}".format(deployment_worker_log_dir, mode_path_dic[mode]), mode="w", encoding="utf8") as f:
                                f.write("{"+split_str+split_str.join(log_str_list))
                            # if mode=="api":
                            #     idx = result_dic[mode_log_dic[mode]].index(log_dic)
                            #     status_dic={
                            #             "success":len([dic for dic in result_dic[mode_log_dic[mode]][idx:] if dic["status"]=="success"]),
                            #             "error":len([dic for dic in result_dic[mode_log_dic[mode]][idx:] if dic["status"]=="error"])
                            #         }
                            #     with open("{}/{}".format(deployment_worker_log_dir, POD_API_LOG_COUNT_FILE_NAME), mode="w", encoding="utf8") as f:
                            #         json.dump(status_dic, f, indent=4, ensure_ascii=False)
                            #     run_time_dic["start_time"]=datetime.strftime(datetime.now(), POD_RUN_TIME_DATE_FORMAT)
                            #     with open("{}/{}".format(deployment_worker_log_dir, POD_RUN_TIME_FILE_NAME), mode="w", encoding="utf8") as f:
                            #         json.dump(run_time_dic, f, ensure_ascii=False)
        if get_worker_list:
            if len(complete_delete_list)==0 and len(partial_delete_list)==0:
                return response(status=0, message="No worker in time range to delete")
            else:
                result={
                    "complete":complete_delete_list,
                    "partial":partial_delete_list
                }
                return response(status=1, result=result, message="success getting worker list")
        else:
            return response(status=1, message="success deleting log")
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="deleting log error")

def add_deployment_bookmark(deployment_id, user_id):
    try:
        result, message = db.insert_deployment_bookmark(deployment_id=deployment_id, user_id=user_id)

        if result == True:
            return response(status=1)
        else :
            print("Add deployment bookmark error : {}".format(message))
            # return response(status=0, message="Add deployment bookmark error : {}".format(message))
            raise DeploymentBookmarkDBInsertError
    except CustomErrorList as ce:
        traceback.print_exc()
        return response(status=0, message=ce.message)


def delete_deployment_bookmark(deployment_id, user_id):
    result, message = db.delete_deployment_bookmark(deployment_id=deployment_id, user_id=user_id)

    if result == True:
        return response(status=1)
    else :
        print("Delete deployment bookmark error : {}".format(message))
        # return response(status=0, message="Delete deployment bookmark error : {}".format(message))
        raise DeploymentBookmarkDBDeleteError

def update_deployment_api_path(deployment_id, api_path):
    import re
    try:
        m = re.search(pattern="^[a-z0-9][a-z0-9\/\-]*[a-z0-9\-]", string=api_path)
        if m is not None:
            if len(api_path) != len(m.group()):
                # return response(status=0, message="Not allow api address : '{}'".format("^[a-z0-9][a-z0-9\/\-]*[a-z0-9\-]"))
                raise DeploymentAPIPathNotAllowedError
                    
        result, message = db.update_deployment_api_path(deployment_id=deployment_id, api_path=api_path)
        pod_list = kube.get_list_namespaced_pod()
        if result:
            status = kube.get_deployment_status(deployment_id=deployment_id, pod_list=pod_list)["status"]
            if status in KUBER_RUNNING_STATUS:
                labels = kube.get_deployment_item_labels(deployment_id=deployment_id, get_mode="one", pod_list=pod_list)
                update_deployment_pod_ingress(api_path=api_path, labels=labels)

            return response(status=1, message="OK")
        else :
            raise DeploymentAPIPathDBInsertError
            # return response(status=0, message=message)
    except CustomErrorList as ce:
        return response(status=0, message=ce.message)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Deployment api address update error : {}".format(e))

def get_deployment_name(deployment_id):
    try:
        info = db.get_deployment_name_info(deployment_id=deployment_id)
        deployment_name = info.get("deployment_name")
        return response(status=1, result=deployment_name, message="OK")
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="fail")     

def get_worker_start_time(deployment_id):
    # import utils.common as common
    run_time_list = get_deployment_run_time_list(deployment_id=deployment_id)
    # print("RUN TIME LIST" , run_time_list)
    run_time_list = [dic for dic in run_time_list if dic!={}]
    run_time_list = sorted(run_time_list, key=lambda run_time: (run_time[POD_RUN_TIME_START_TIME_KEY], run_time[POD_RUN_TIME_END_TIME_KEY]))
    # print(run_time_list)
    if len(run_time_list)>0:
        return run_time_list[0][POD_RUN_TIME_START_TIME_KEY]
    else:
        return datetime.strftime(datetime.now(), POD_RUN_TIME_DATE_FORMAT)


# def get_new_name(name_list, name_str):
#     if len(name_list) > 1:
#         int_list = [int(i) for i in name_list.split("_") if i.isnumeric()==True]
#         if len(int_list)>0:
#             name_tail = max(int_list)+1
#         else:
#             name_tail = 1
#         return "{}_{}".format(name_str, name_tail)
#     else:
#         return name_str

def get_new_name(name_list, name_str):
    tail_set = set()
    default_exist = False
    # 템플릿 생성 시 새로운 이름 default 값 받기
    # 기존 템플릿 이름에서 "new-template~" 인 경우에 대해 뒤의 값이 [-int] 인 경우 담기
    for current_name in name_list:
        if current_name==None:
            continue
        if current_name[:len(name_str)]==name_str:
            if current_name == name_str:
                default_exist = True
            else:
                current_tail_list = current_name.split("{}-".format(name_str))
                if len(current_tail_list) == 2:
                    current_tail = current_tail_list[1]
                    if current_tail.isnumeric()==True:
                        tail_set.add(int(current_tail))
    if default_exist==False:
        return name_str
    else:
        i = 0
        k = 1
        tail_set=sorted(tail_set)
        for i in range(len(tail_set)):
            if i+1!=tail_set[i]:
                k = 0
                break
        return "{}-{}".format(name_str, i+1+k)

def get_deployment_template_list(workspace_id, deployment_template_group_id, is_ungrouped_template, headers_user):
    try:
        if is_ungrouped_template==1:
            deployment_template_info_list = db.get_deployment_template_list_n(workspace_id=workspace_id, is_ungrouped_template=is_ungrouped_template)
        elif deployment_template_group_id!=None:
            deployment_template_info_list = db.get_deployment_template_list_n(workspace_id=workspace_id, deployment_template_group_id=deployment_template_group_id)
        else:
            deployment_template_info_list = db.get_deployment_template_list_n(workspace_id=workspace_id)
        built_in_model_list = db.get_built_in_model_list()
        built_in_model_list_dict = common.gen_dict_from_list_by_key(target_list=built_in_model_list, id_key="id")
        
        deployment_template_info_result = []
        deployment_template_name_list = []
        for info in deployment_template_info_list:
            info.update(info["template"])
            deployment_template_name_list.append(info["name"])
            # id, name, description, template, user_id, create_datetime
            template_detail_info = get_deployment_template_detail_info(info)
            deployment_template_info_result.append({
                "id": info["id"],
                "deployment_template_group_id":info["deployment_template_group_id"],
                "name": info["name"],
                "description": info["description"],
                "deployment_template_type": info[DEPLOYMENT_TEMPLATE_KIND_INFO_KEY][DEPLOYMENT_TEMPLATE_TYPE_KEY],
                "deployment_template": template_detail_info,
                "item_deleted": get_item_deleted(item_deleted_info=info["item_deleted"], 
                                                 built_in_model_name=info.get("built_in_model_name_real"), 
                                                 deployment_type=template_detail_info.get("deployment_type")),
                "user_id": info["user_id"],
                "user_name": info["user_name"],
                "create_datetime": info["create_datetime"],
                "permission_level": check_deployment_template_access_level(user_id=headers_user, deployment_template_id=info["id"])
            })
        
        # 템플릿 생성 시 새로운 이름 default 값 받기 
        deployment_template_new_name = get_new_name(name_list=deployment_template_name_list,
                                                    name_str=DEPLOYMENT_TEMPLATE_DEFAULT_NAME)
        result = {
            "deployment_template_info_list":deployment_template_info_result,
            "deployment_template_new_name": deployment_template_new_name
        }
        return response(status=1, result=result, message="OK")
    except:
        traceback.print_exc()
        return response(status=0, message="Deployment Template Get Fail")   

def get_deployment_template_detail_info(deployment_template, template_key = "template"):
    if deployment_template[DEPLOYMENT_TEMPLATE_KIND_INFO_KEY][DEPLOYMENT_TEMPLATE_TYPE_KEY] == DEPLOYMENT_RUN_SANDBOX:
        result = deployment_template[template_key]
        del result[DEPLOYMENT_TEMPLATE_KIND_INFO_KEY]
    else:
        result = {
            "deployment_type": deployment_template[DEPLOYMENT_TEMPLATE_KIND_INFO_KEY][DEPLOYMENT_TEMPLATE_DEPLOYMENT_TYPE_KEY],
            "training_id": deployment_template.get(DEPLOYMENT_TEMPLATE_TRAINING_ID_KEY),
            "training_name": deployment_template.get(DEPLOYMENT_TEMPLATE_TRAINING_NAME_KEY),
            "command": deployment_template.get(DEPLOYMENT_TEMPLATE_RUN_COMMAND_KEY),
            "environments": deployment_template.get(DEPLOYMENT_TEMPLATE_ENVIRONMENTS_KEY),
            "built_in_model_id": deployment_template.get(DEPLOYMENT_TEMPLATE_BUILT_IN_ID_KEY),
            "built_in_model_name": deployment_template.get("built_in_model_name"),
            "training_type": deployment_template.get(DEPLOYMENT_TEMPLATE_TRAINING_TYPE_KEY),
            "job_id": deployment_template.get(DEPLOYMENT_TEMPLATE_JOB_ID_KEY),
            "job_name": deployment_template.get("job_name"),
            "job_group_index": deployment_template.get("job_group_index"),
            "hps_id": deployment_template.get("hps_id"),
            "hps_name": deployment_template.get("hps_name"),
            "hps_group_index": deployment_template.get("hps_group_index"),
            "hps_number": None,
            "checkpoint": deployment_template.get(DEPLOYMENT_TEMPLATE_CHECKPOINT_FILE_KEY)
        }
        if deployment_template.get(DEPLOYMENT_TEMPLATE_TRAINING_TYPE_KEY)==TRAINING_ITEM_C:
            if deployment_template.get("hps_name")==None:
                hps_info = db.get_hyperparamsearch_list_from_hps_id_list([deployment_template.get("hps_id")])
                deployment_template["hps_name"] = hps_info["hps_name"]
                deployment_template["hps_group_index"] = hps_info["hps_group_index"]
                
            hps_base_path = JF_TRAINING_HPS_CHECKPOINT_ITEM_POD_PATH.format(
                hps_name=deployment_template["hps_name"], hps_group_index=deployment_template["hps_group_index"]
            )
            # print("base path",hps_base_path)
            result["hps_number"]=deployment_template[DEPLOYMENT_TEMPLATE_CHECKPOINT_FILE_KEY].split(hps_base_path)[1].split("/")[1]
    return result

def get_deployment_template(workspace_id, deployment_template_id):
    try:
        deployment_template_info = db.get_deployment_template_list(deployment_template_id)
        deployment_template_info.update(deployment_template_info["template"])
        result = {
            "workspace_id": workspace_id,
            "workspace_name": deployment_template_info["workspace_name"],
            "name": deployment_template_info["name"],
            "description": deployment_template_info["description"],
            "user_id": deployment_template_info["user_id"],
            "user_name": deployment_template_info["user_name"],
            "deployment_template_type": deployment_template_info[DEPLOYMENT_TEMPLATE_KIND_INFO_KEY][DEPLOYMENT_TEMPLATE_TYPE_KEY],
            "deployment_template": get_deployment_template_detail_info(deployment_template_info)
        }
        return response(status=1, result=result, message="OK")
    except:
        traceback.print_exc()
        return response(status=0, message="Create Deployment Template Fail")  
            
def create_deployment_template(workspace_id, deployment_template_id, deployment_template_name, deployment_template_description, 
                                deployment_template_group_id, deployment_template_group_name, deployment_template_group_description,
                                deployment_template, deployment_type, training_id, training_type, job_id, hps_id, hps_number,
                                checkpoint, command, environments, built_in_model_id, headers_user):
    try:
        # 템플릿 기본정보 아이템 생성
        if deployment_template != None:
            deployment_template_params = deployment_template
            deployment_template_type_with_version = DEPLOYMENT_RUN_SANDBOX_V1
        else:
            deployment_template_params = {
                DEPLOYMENT_TEMPLATE_DEPLOYMENT_TYPE_KEY: deployment_type,
                DEPLOYMENT_TEMPLATE_CHECKPOINT_FILE_KEY: checkpoint,
                DEPLOYMENT_TEMPLATE_RUN_COMMAND_KEY: command,
                DEPLOYMENT_TEMPLATE_BUILT_IN_ID_KEY: built_in_model_id,
                DEPLOYMENT_TEMPLATE_TRAINING_ID_KEY: training_id,
                DEPLOYMENT_TEMPLATE_JOB_ID_KEY: job_id,
                DEPLOYMENT_TEMPLATE_HPS_ID_KEY: hps_id,
                DEPLOYMENT_TEMPLATE_HPS_NUMBER_KEY: hps_number,
                DEPLOYMENT_TEMPLATE_TRAINING_TYPE_KEY: training_type,
                DEPLOYMENT_TEMPLATE_ENVIRONMENTS_KEY: environments
            }
            deployment_template_type_with_version = None
        # template 저장
        deployment_template_info = create_template_by_template_params(template_params=deployment_template_params, workspace_id=workspace_id, owner_id=headers_user,
                                deployment_template_id=deployment_template_id, deployment_template_name=deployment_template_name, 
                                deployment_template_description=deployment_template_description,
                                deployment_template_group_id=deployment_template_group_id, deployment_template_group_name=deployment_template_group_name, 
                                deployment_template_group_description=deployment_template_group_description, deployment_template_type_with_version=deployment_template_type_with_version)

        return response(status=1, message="Created Deployment Template")
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception as e:
        raise e

def update_deployment_template(workspace_id, deployment_template_id, deployment_template_name, 
                            deployment_template_description, deployment_template_group_id, 
                            deployment_template_group_name, deployment_template_group_description, headers_user):
    try:
        # template group id 값 존재하는지 확인
        # template group id 없는 경우 (새로 생성) 이름 체크 후 db insert
        deployment_template_group_id = check_and_insert_deployment_template_group(
                                                deployment_template_group_id=deployment_template_group_id, 
                                                deployment_template_group_name=deployment_template_group_name, 
                                                deployment_template_group_description=deployment_template_group_description,
                                                workspace_id=workspace_id, user_id=headers_user)
        # 권한 확인
        check_result = check_inaccessible_deployment_template(user_id=headers_user, 
                                            deployment_template_id=deployment_template_id, allow_max_level=4)
        # 그룹 있는경우 이름 중복 체크
        if deployment_template_group_id != None:
            deployment_template_info = db.get_deployment_template_by_unique_key(
                                                                    deployment_template_name=deployment_template_name, 
                                                                    workspace_id=workspace_id,
                                                                    deployment_template_group_id=deployment_template_group_id,
                                                                    deployment_template_id=deployment_template_id)
            if deployment_template_info != None:
                raise DeploymentTemplateNameExistError
        # DB 업데이트
        update_deployment_template_result, message = db.update_deployment_template(
                                                    deployment_template_id=deployment_template_id,
                                                    deployment_template_name=deployment_template_name,
                                                    deployment_template_description=deployment_template_description,
                                                    deployment_template_group_id=deployment_template_group_id)
        if not update_deployment_template_result:
            print("Deployment Template Error [{}]".format(message))
            raise DeploymentTemplateDBUpdateError
        return response(status=1, message="Update Deployment Template Success")  
    except:
        traceback.print_exc()
        return response(status=0, message="Update Deployment Template Fail")   

def delete_deployment_template(deployment_template_ids, headers_user):
    try:
        # 권한확인
        deployment_template_info_list = db.get_deployment_templates(deployment_template_ids)
        for template_info in deployment_template_info_list:
            check_result = check_inaccessible_deployment_template(user_id=headers_user, 
                                                                deployment_template_id=template_info['id'])

        # db 에서 is_deleted 값을 1로 변경
        deployment_template_ids = [str(info['id']) for info in deployment_template_info_list]
        update_result, message = db.update_deployment_template_delete(deployment_template_ids=deployment_template_ids)
        if not update_result:
            raise DeploymentTemplateDBUpdateError

        # history 기록
        user_info=db.get_user(headers_user)
        # 에초에 이름이 없는 템플릿은 is_deleted=1 이기 때문에 프론트 통해 삭제 불가능
        deployment_template_name_list = [info["name"] for info in deployment_template_info_list if info["name"]!=None]
        # if len(deployment_template_name_list)>0:
        #     db.logging_history(
        #         user=user_info['name'], task='deployment_template',
        #         action='delete', workspace_id=template_info["workspace_id"],
        #         task_name=','.join()
        #     )

        # 템플릿 삭제 시 is_deleted=1 인 템플릿 item에 대해서 참조하는 배포/워커 없으면 delete
        delete_not_used_deployment_template()
        return response(status=1, message="Deployment Template Delete Success")
    except CustomErrorList as ce:
        traceback.print_exc()
        return ce.response()
    except:
        traceback.print_exc()
        return response(status=0, message="Deployment Template Delete Fail")

def delete_not_used_deployment_template():
    """
    템플릿 삭제 시 is_deleted=1 인 템플릿 item에 대해서 참조하는 배포/워커 없으면 delete
    """
    # is_deleted=1 이고 참조하는 배포/워커가 없는 template id 받아오기
    delete_list=db.get_deployment_template_delete_list()
    if len(delete_list)>0:
        delete_id_list = [str(info["id"]) for info in delete_list]
        # deployment_template db 에서 해당 id 들 삭제
        delete_result, message = db.delete_deployment_templates(deployment_template_id_list=delete_id_list)
        if not delete_result:
            print(message)
            raise DeploymentTemplateDBDeleteError
        print("deleted template ids: ", delete_id_list)
 

def get_deployment_and_worker_by_template(deployment_template_id):
    try:
        deployment_list = db.get_deployment_by_template(deployment_template_id=deployment_template_id)
        deployment_worker_list = db.get_deployment_worker_by_template(deployment_template_id=deployment_template_id)
        result={
            "deployment_list":deployment_list,
            "deployment_worker_list":deployment_worker_list
        }
        return response(status=1, result=result, message="OK")
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message=e)

def get_deployment_template_group_list(workspace_id, headers_user):
    try:
        deployment_template_group_info_list = db.get_deployment_template_group_list(workspace_id=workspace_id)
        deployment_template_group_info_result = []
        deployment_template_group_name_list = []
        for info in deployment_template_group_info_list:
            deployment_template_group_name_list.append(info["deployment_template_group_name"])
            deployment_template_group_info_result.append({
                "id": info["id"],
                "name": info["deployment_template_group_name"],
                "description": info["deployment_template_group_description"],
                "user_id": info["user_id"],
                "user_name": info["user_name"],
                "create_datetime": info["create_datetime"],
                "permission_level": check_deployment_template_access_level(user_id=headers_user, deployment_template_group_id=info["id"])
            })
        deployment_template_group_new_name = get_new_name(name_list=deployment_template_group_name_list,
                                                    name_str=DEPLOYMENT_TEMPLATE_GROUP_DEFAULT_NAME)
        result = {
            "deployment_template_group_info_list":deployment_template_group_info_result,
            "deployment_template_group_new_name":deployment_template_group_new_name
        }
        return response(status=1, result=result, message="OK")
    except:
        traceback.print_exc()
        return response(status=0, message="Deployment Template Group Get Fail")  

def create_deployment_template_group(workspace_id, deployment_template_group_name, 
                                    deployment_template_group_description, headers_user):
    try:
        deployment_template_group_id = insert_deployment_template_group(workspace_id=workspace_id, 
                            deployment_template_group_name=deployment_template_group_name, 
                            deployment_template_group_description=deployment_template_group_description, 
                            user_id=headers_user)
        return response(status=1, message="Create Deployment Template Group Success")  
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception as e:
        raise e

def update_deployment_template_group(workspace_id, deployment_template_group_id, 
                                    deployment_template_group_name, deployment_template_group_description, headers_user):
    try:
        check_result = check_inaccessible_deployment_template(user_id=headers_user, 
                                            deployment_template_group_id=deployment_template_group_id, allow_max_level=3)
        # 이름 중복 체크
        deployment_template_group_info = db.get_deployment_template_group_by_unique_key(
                                                                deployment_template_group_name=deployment_template_group_name, 
                                                                workspace_id=workspace_id,
                                                                deployment_template_group_id=deployment_template_group_id)
        if deployment_template_group_info != None:
            raise DeploymentTemplateGroupNameExistError
        # DB 업데이트
        update_deployment_template_group_result = db.update_deployment_template_group(
                                                    deployment_template_group_id=deployment_template_group_id,
                                                    deployment_template_group_name=deployment_template_group_name,
                                                    deployment_template_group_description=deployment_template_group_description)
        if not update_deployment_template_group_result['result']:
            raise DeploymentTemplateGroupDBUpdateError
        return response(status=1, message="Update Deployment Template Group Success")  
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception as e:
        raise e


def delete_deployment_template_group(deployment_template_group_ids, headers_user):
    try:
        deployment_template_group_id_list = [int(i) for i in deployment_template_group_ids]
        for deployment_template_group_id in deployment_template_group_id_list:
            check_result = check_inaccessible_deployment_template(user_id=headers_user, 
                                            deployment_template_group_id=deployment_template_group_id, allow_max_level=3)
        # template group 에 속한 template_id 값들 받아와서 deployment_template 의 is_deleted=1 로 변경
        update_deployment_template_result = db.update_deployment_template_delete_by_template_group_ids(
                                                            deployment_template_group_ids=deployment_template_group_ids)
        if update_deployment_template_result == False:
            raise DeploymentTemplateDBUpdateError

        delete_deployment_template_group_result, message = db.delete_deployment_template_groups(
                                                            deployment_template_group_ids=deployment_template_group_ids)
        if delete_deployment_template_group_result == False:
            raise DeploymentTemplateGroupDBDeleteError

        # 템플릿에서 is_deleted=1 인 템플릿 item에 대해서 참조하는 배포/워커 없으면 delete
        delete_not_used_deployment_template()
        return response(status=1, message="Delete Deployment Template Group Success")  
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception as e:
        raise e 

@ns.route("/admin", methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DeploymentAdmin(CustomResource):
    @ns.expect(deployment_get)
    @token_checker
    @workspace_access_check(deployment_get)
    def get(self):
        """
            Deployment Admin 조회 # 상황에 따라서 일반 목록 조회와 동일하게 사용할 수 있음
            Workspace id 조회 없이 하는 경우엔 admin case
            ---
        """
        args = deployment_get.parse_args()
        workspace_id = args["workspace_id"]
        protocol = args["protocol"]

        res = get_deployment_admin_list(protocol=protocol)
        return self.send(res)



@ns.route("", methods=['GET', 'POST', 'PUT'])
@ns.route('/<id_list>', methods=['DELETE'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class Deployment(CustomResource):
    @ns.expect(deployment_get)
    @token_checker
    @workspace_access_check(deployment_get)
    def get(self):
        """Deployment 조회"""
        args = deployment_get.parse_args()
        workspace_id = args["workspace_id"]
        training_id = args["training_id"]
        sort = args["sort"]
        protocol = args["protocol"]

        # try:
        #     check_inaccessible_workspace(user_id=self.check_user_id(), workspace_id=workspace_id)
        # except CustomErrorList as ce:
        #     traceback.print_exc()
        #     return self.send(response(status=0, **ce.response()))

        res = get_deployment_list(workspace_id=workspace_id, sort=sort, protocol=protocol, training_id=training_id, headers_user=self.check_user())
        return self.send(res)

    @ns.expect(deployment_post)
    @token_checker
    @workspace_access_check(deployment_post)
    def post(self):
        """
            Deployment 생성
            ---
            # inputs
            배포 실행 종류에 따라 필요 정보 달라짐 (custom, user-trained, pretrained)

                workspace_id - workspace id
                deployment_name - deployment name
                description

                deployment_type (str) - custom / built-in
                    * 배포유형 Built-in 모델 사용하기: built-in
                    * 배포유형 학습에서 가져오기:
                        * training_type built_in 선택: built-in
                        * training_type custom 선택: custom
                    * 배포유형 나머지: None
                training_id (int)
                    * 배포유형 학습에서 가져오기: training id 값
                    * 배포유형 나머지: None
                training_type (str)
                    * 배포유형 Built-in 모델 사용하기: None
                    * 배포유형 학습에서 가져오기:
                        * training_type built_in 선택: job / hps
                        * training_type custom 선택: None
                job_id (int)
                    * training_type 이 job 일때만
                hps_id (int)
                    * training_type 이 hps 일때만
                hps_number (int):
                    * training_type 이 hps 일때만
                command (dict)
                    * deployment_type 이 built-in: None
                    * deployment_type 이 custom: 
                        * dict {"binary":"python", "script":"/jf-training-home/src/get_api.py", "arguments":"--a aa --b bb -c"}
                environments (list)
                    * deployment_type 이 built-in: None
                    * deployment_type 이 custom: 
                        * list [{"name":"FLASK_APP":"value":"app"}, {"name":"FLASK_ENV","value":"development"}]
                checkpoint (str)
                    * deployment_type 이 built-in: checkpoint
                        * 00-0.68.json
                    * deployment_type 이 custom: None
                built_in_model_id (int)
                    * deployment_type 이 built-in: built in model id
                    * deployment_type 이 custom: None
                deployment_template(dict)
                    * 배포유형 '설정값 직접 입력하기': json 값
                    * 배포유형 나머지: None
                deployment_template_id (int)
                    * 배포유형 '템플릿 사용하기'
                        * 값이 그대로: deployment_template_id
                        * 값이 변함: None
                    * 배포유형 나머지: None
                deployment_template_name (str) - 배포 템플릿 이름
                deployment_template_description (str) - 배포 템플릿 설명
                deployment_template_group_id (int) - 배포 템플릿 그룹 ID
                    * 그룹 선택하는 경우: 그룹 ID
                    * 그룹 선택 안하는 경우: None
                deployment_template_group_name (str) - 배포 템플릿 그룹 이름
                    * 그룹 생성하는 경우: 그룹 이름
                    * 그룹 생성 안하는 경우: None
                deployment_template_group_description (str) - 배포 템플릿 그룹 설명

                instance_type - gpu/cpu
                gpu_count - GPU 개수
                gpu_model
                    * random 인경우: "null"
                    * GPU 지정한 경우: gpu 모델명
                node_mode - 노드 모드
                node_name - 노드 이름 - 삭제 예정
                node_name_cpu - CPU 노드로 사용할 노드 및 자원 사용량 정보
                    * dict {"jf-node-02": {"cpu_cores_limit_per_pod": 1, "ram_limit_per_pod": 1}
                node_name_gpu - GPU 노드로 사용할 노드 및 자원 사용량 정보
                    * dict {"jf-node-03": {"cpu_cores_limit_per_gpu": 2, "ram_limit_per_gpu": 2}
                access - private/public
                owner_id - 배포 생성자 id
                users_id - 수정, 삭제 권한 부여된 사용자들 id list
                    * public 인 경우 워크스페이스 사용자들 id
                    * private 인경우 생성자가 권한 부여한 사용자 id
                docker_image_id - 도커이미지 id
            ---
            # Input example
                {
                    "workspace_id": 4,
                    "deployment_name": "usertrained-job-1",
                    "owner_id": 3,
                    "instance_type": "gpu",
                    "access": 1,
                    "description": "",
                    "docker_image_id": 1,
                    "gpu_model": null,
                    "node_name_gpu": {},
                    "node_name_cpu": {
                        "jf-node-32": {
                            "cpu_cores_limit_per_pod": 1,
                            "ram_limit_per_pod": 1
                        },
                        "@all": {
                            "is_active": false,
                            "cpu_cores_limit_per_pod": 1,
                            "ram_limit_per_pod": 1
                        }
                    },
                    "gpu_count": 0,
                    "deployment_type": "built-in",
                    "training_id": 138,
                    "training_type": "job",
                    "job_id": 869,
                    "checkpoint": "00-0.99.json",
                    "built_in_model_id": 1017
                }
            ---
            # returns
                dict (
                    status (int) : 0 = 실패, 1 = 성공 
                    result : None 
                    message (str) : status = 0 일 때, 담기는 매세지
                )
        """
        args = deployment_post.parse_args()
        try :
            workspace_id = args["workspace_id"]
            deployment_name = args["deployment_name"]
            description = args["description"]
            deployment_type = args["deployment_type"] #= "custom"
            training_id = args["training_id"]
            training_type = args["training_type"]
            job_id = args["job_id"]
            hps_id = args["hps_id"]
            hps_number = args["hps_number"]
            command = args["command"]
            run_code = args["run_code"] # 삭제 예정
            environments = args["environments"]
            checkpoint = args["checkpoint"]
            built_in_model_id = args["built_in_model_id"]
            instance_type = args["instance_type"]
            gpu_count = args["gpu_count"]
            gpu_model = args["gpu_model"]
            node_mode = args["node_mode"]
            node_name = args["node_name"]
            node_name_cpu = args["node_name_cpu"]
            node_name_gpu = args["node_name_gpu"]

            access = args["access"]
            owner_id = args["owner_id"]
            users_id = args["users_id"]
            if users_id is None:
                users_id = []
            docker_image_id = args["docker_image_id"]
            deployment_template_id = args["deployment_template_id"]
            deployment_template = args["deployment_template"]
            deployment_template_name = args["deployment_template_name"]
            deployment_template_group_id = args["deployment_template_group_id"]
            deployment_template_group_name = args["deployment_template_group_name"]
            deployment_template_description = args["deployment_template_description"]
            deployment_template_group_description = args["deployment_template_group_description"]
            # res = create_deployment(workspace_id=workspace_id, deployment_name=deployment_name, description=description, run_code=run_code,
            #                         deployment_type=deployment_type, training_id=training_id, job_id=job_id, checkpoint=checkpoint, built_in_model_id=built_in_model_id,
            #                         instance_type=instance_type, 
            #                         gpu_count=gpu_count, gpu_model=gpu_model, node_mode=node_mode, node_name=node_name,
            #                         access=access, owner_id=owner_id, users_id=users_id,
            #                         docker_image_id=docker_image_id,
            #                         headers_user=self.check_user())

            res = create_deployment(workspace_id=workspace_id, 
                                    deployment_name=deployment_name, description=description, 
                                    deployment_type=deployment_type, training_id=training_id, built_in_model_id=built_in_model_id,
                                    job_id=job_id, hps_id=hps_id, hps_number=hps_number, training_type=training_type,
                                    command=command, run_code=run_code, checkpoint=checkpoint, environments=environments,
                                    instance_type=instance_type, gpu_count=gpu_count, gpu_model=gpu_model, 
                                    node_name=node_name, node_name_cpu=node_name_cpu, 
                                    node_name_gpu=node_name_gpu,node_mode=node_mode, 
                                    access=access, owner_id=owner_id, users_id=users_id, 
                                    docker_image_id=docker_image_id, 
                                    deployment_template_id=deployment_template_id, deployment_template=deployment_template,
                                    deployment_template_name=deployment_template_name, deployment_template_group_name=deployment_template_group_name,
                                    deployment_template_description=deployment_template_description, 
                                    deployment_template_group_id=deployment_template_group_id,
                                    deployment_template_group_description=deployment_template_group_description,
                                    headers_user=self.check_user())
            return self.send(res)
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Create Deployment Error : {}".format(e)))

    @ns.expect(deployment_put)
    @token_checker
    @deployment_access_check(deployment_put)
    def put(self):
        """
            Deployment 업데이트            
            ---
            # inputs
            배포 실행 종류에 따라 필요 정보 달라짐 (custom, user-trained, pretrained)

                deployment_id
                description
                deployment_type (str) - custom / built-in
                    * 배포유형 Built-in 모델 사용하기: built-in
                    * 배포유형 학습에서 가져오기:
                        * training_type built_in 선택: built-in
                        * training_type custom 선택: custom
                    * 배포유형 나머지: None
                training_id (int)
                    * 배포유형 학습에서 가져오기: training id 값
                    * 배포유형 나머지: None
                training_type (str)
                    * 배포유형 Built-in 모델 사용하기: None
                    * 배포유형 학습에서 가져오기:
                        * training_type built_in 선택: job / hps
                        * training_type custom 선택: None
                job_id (int)
                    * training_type 이 job 일때만
                hps_id (int)
                    * training_type 이 hps 일때만
                hps_number (int)
                    * training_type 이 hps 일때만
                command (dict)
                    * deployment_type 이 built-in: None
                    * deployment_type 이 custom: 
                        * dict {"binary":"python", "script":"/jf-training-home/src/get_api.py", "arguments":"--a aa --b bb -c"}
                environments (list)
                    * deployment_type 이 built-in: None
                    * deployment_type 이 custom: 
                        * list [{"name":"FLASK_APP":"value":"app"}, {"name":"FLASK_ENV","value":"development"}]
                checkpoint (str)
                    * deployment_type 이 built-in: checkpoint
                        * 00-0.68.json
                    * deployment_type 이 custom: None
                built_in_model_id (int)
                    * deployment_type 이 built-in: built in model id
                    * deployment_type 이 custom: None
                deployment_template(dict)
                    * 배포유형 '설정값 직접 입력하기': json 값
                    * 배포유형 나머지: None
                deployment_template_id (int)
                    * 배포유형 '템플릿 사용하기'
                        * 값이 그대로: deployment_template_id
                        * 값이 변함: None
                    * 배포유형 나머지: None
                deployment_template_name (str) - 배포 템플릿 이름
                deployment_template_description (str) - 배포 템플릿 설명
                deployment_template_group_id (int) - 배포 템플릿 그룹 ID
                    * 그룹 선택하는 경우: 그룹 ID
                    * 그룹 선택 안하는 경우: None
                deployment_template_group_name (str) - 배포 템플릿 그룹 이름
                    * 그룹 생성하는 경우: 그룹 이름
                    * 그룹 생성 안하는 경우: None
                deployment_template_group_description (str) - 배포 템플릿 그룹 설명

                instance_type - gpu/cpu
                gpu_count - GPU 개수
                gpu_model
                    * random 인경우: "null"
                    * GPU 지정한 경우: gpu 모델명
                node_mode - 노드 모드
                node_name - 노드 이름 - 삭제 예정
                node_name_cpu - CPU 노드로 사용할 노드 및 자원 사용량 정보
                    * dict {"jf-node-02": {"cpu_cores_limit_per_pod": 1, "ram_limit_per_pod": 1}
                node_name_gpu - GPU 노드로 사용할 노드 및 자원 사용량 정보
                    * dict {"jf-node-03": {"cpu_cores_limit_per_gpu": 2, "ram_limit_per_gpu": 2}
                access - private/public
                owner_id - 배포 생성자 id
                users_id - 수정, 삭제 권한 부여된 사용자들 id list
                    * public 인 경우 워크스페이스 사용자들 id
                    * private 인경우 생성자가 권한 부여한 사용자 id
                docker_image_id - 도커이미지 id
            ---
            # Input example
                {
                    "deployment_id":138,
                    "workspace_id":1,
                    "deployment_name":"test-deployment",
                    "deployment_type":"custom",
                    "owner_id":2,
                    "instance_type":"gpu",
                    "access":1,
                    "description":"dd",
                    "docker_image_id":1,
                    "gpu_model":{
                        "NVIDIA-GeForce-GTX-1080-Ti":["jf-node-02"]
                    },
                    "node_name_cpu":{
                        "jf-node-01": {
                            "cpu_cores_limit_per_pod":1,
                            "ram_limit_per_pod":1
                        }
                    },
                    "node_name_gpu":{
                        "jf-node-02":{
                            "cpu_cores_limit_per_gpu":2,
                            "ram_limit_per_gpu":2
                        }
                    },
                    "training_id":78,
                    "run_code":"/jf-training-home/src/api-test/api-test.py",
                    "gpu_count":1
                }
            ---
            # returns
            dict
                status (int) : 0 = 실패, 1 = 성공 
                result : None 
                message (str) : status = 0 일 때, 담기는 매세지

        """
        args = deployment_put.parse_args()
        try:
            deployment_id = args["deployment_id"]
            description = args["description"]
            deployment_type = args["deployment_type"]
            training_id = args["training_id"]
            job_id = args["job_id"]
            hps_id = args["hps_id"]
            hps_number = args["hps_number"]
            command = args["command"]
            run_code = args["run_code"]
            environments = args["environments"]
            checkpoint = args["checkpoint"]
            built_in_model_id = args["built_in_model_id"]
            instance_type = args["instance_type"]
            gpu_count = args["gpu_count"]
            gpu_model = args["gpu_model"]
            node_mode = args["node_mode"]
            node_name = args["node_name"]
            node_name_cpu = args["node_name_cpu"]
            node_name_gpu = args["node_name_gpu"]
            
            access = args["access"]
            owner_id = args["owner_id"]
            users_id = args["users_id"]
            if users_id is None:
                users_id = []
            docker_image_id = args["docker_image_id"]
            deployment_template = args["deployment_template"]
            deployment_template_id = args["deployment_template_id"]
            training_type = args["training_type"]
            deployment_template_name = args["deployment_template_name"]
            deployment_template_group_id = args["deployment_template_group_id"]
            deployment_template_group_name = args["deployment_template_group_name"]
            deployment_template_description = args["deployment_template_description"]
            deployment_template_group_description = args["deployment_template_group_description"]


            res = update_deployment(deployment_id=deployment_id, description=description, deployment_type=deployment_type,
                                    training_id=training_id, job_id=job_id, hps_id=hps_id, hps_number=hps_number, training_type=training_type,
                                    command=command, environments=environments, checkpoint=checkpoint, run_code=run_code, 
                                    built_in_model_id=built_in_model_id,
                                    instance_type=instance_type,
                                    gpu_count=gpu_count, gpu_model=gpu_model, node_mode=node_mode, 
                                    node_name=node_name, node_name_cpu=node_name_cpu, node_name_gpu=node_name_gpu,
                                    access=access,
                                    owner_id=owner_id, users_id=users_id,
                                    docker_image_id=docker_image_id,
                                    deployment_template_id=deployment_template_id,
                                    deployment_template=deployment_template,
                                    deployment_template_name=deployment_template_name, 
                                    deployment_template_group_name=deployment_template_group_name,
                                    deployment_template_group_id=deployment_template_group_id,
                                    deployment_template_description=deployment_template_description, 
                                    deployment_template_group_description=deployment_template_group_description,
                                    headers_user=self.check_user())

            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send("Deployment Update Error : {}".format(e))


    @ns.param('id_list', 'id list')
    @token_checker
    @deployment_access_check(allow_max_level=3)
    def delete(self, id_list):
        id_list = id_list.split(',')
        try:
            res = delete_deployment(deployment_ids=id_list, headers_user=self.check_user())
            #db.request_logging(self.check_user(), 'deployments/'+str(id_list), 'delete', None, res['status'])
            return self.send(res)

        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

@ns.route("_new", methods=['GET', 'POST', 'PUT'])
@ns.route('/<id_list>', methods=['DELETE'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DeploymentNew(CustomResource):
    @ns.expect(deployment_get)
    @token_checker
    @workspace_access_check(deployment_get)
    def get(self):
        """Deployment 조회"""
        args = deployment_get.parse_args()
        workspace_id = args["workspace_id"]
        sort = args["sort"]
        protocol = args["protocol"]

        # try:
        #     check_inaccessible_workspace(user_id=self.check_user_id(), workspace_id=workspace_id)
        # except CustomErrorList as ce:
        #     traceback.print_exc()
        #     return self.send(response(status=0, **ce.response()))

        res = get_deployment_list(workspace_id=workspace_id, sort=sort, protocol=protocol, headers_user=self.check_user())
        return self.send(res)


@ns.route('/<int:deployment_id>', methods=['GET'], doc={'params': {'deployment_id': 'deployment ID'}})
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DeploymentSimple(CustomResource):

    @token_checker
    def get(self, deployment_id):
        """
            Deployment ID 단순 조회
            ---
            # inputs
            배포 id 입력
                deployment_id (int)
            ---
            # returns
                workspace_id (int)
                workspace_name (str)
                deployment_name (str)
                description (str)
                deployment_template_type (str) - usertrained, pretrained, custom, sandbox
                deployment_template (dict)
                (dict):
                    deployment_type (str): built-in / custom
                    training_id (int): 
                        * deployment_template_type 이 usertrained / custom 일때 내려줌
                    training_name (str): 학습 이름
                        * deployment_template_type 이 usertrained / custom 일때 내려줌
                    command (dict): 실행 명령어
                        * deployment_template_type 이 custom 일때 내려줌
                        binary(str): 
                        script(str):
                        arguments (str)
                    environments (list): 환경변수
                        * deployment_template_type 이 custom 일때 내려줌
                        (dict)
                            name (str)
                            value (str)
                    checkpoint (str)
                        * deployment_template_type 이 usertrained 일때 내려줌
                    built_in_model_id (int)
                        * deployment_template_type 이 usertrained 일때 내려줌
                    built_in_model_name (str)
                        * deployment_template_type 이 usertrained 일때 내려줌
                    training_type (str): job / hps
                    job_id (int):
                        * deployment_template_type 이 usertrained 이고 training_type 이 job 일때 내려줌
                    job_name (str):
                        * deployment_template_type 이 usertrained 이고 training_type 이 job 일때 내려줌
                    job_group_index (int): 값에 +1 한 string 값. 예) job_group_index=1 => "JOB 2"
                        * deployment_template_type 이 usertrained 이고 training_type 이 job 일때 내려줌
                    hps_name (str):
                        * deployment_template_type 이 usertrained 이고 training_type 이 hps 일때 내려줌
                    hps_group_index (int): 값에 +1 한 string 값. 예) hps_group_index=1 => "HPS 2"
                        * deployment_template_type 이 usertrained 이고 training_type 이 hps 일때 내려줌
                    hps_number (int):
                        * deployment_template_type 이 usertrained 이고 training_type 이 hps 일때 내려줌
                access (int)
                docker_image_id (int)
                gpu_count (int)
                gpu_model ()
                node_mode (int)
                node_name (dict)
                node_name_detail (dict)
                    node_name_cpu (dict)
                    node_name_cpu_all (dict)
                        cpu_cores_limit_per_pod (int)
                        is_active (bool)
                        ram_limit_per_pod (int)
                    node_name_gpu (dict)
                    node_name_gpu_all (dict)
                permission_level (int)
                training_id (int)
                user_id (int)
                users (list)
        """
        res = get_deployment(deployment_id=deployment_id, headers_user=self.check_user())
        # db.request_logging(self.check_user(), 'trainings/'+str(training_id), 'get', str(args), res['status']) #TODO args 없음
        return self.send(res)

@ns.route('/detail/<int:deployment_id>', methods=['GET'], doc={'params': {'deployment_id': 'deployment ID'}})
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DeploymentDetail(CustomResource):

    @token_checker
    def get(self, deployment_id):
        """
            Deployment ID 통해 배포 정보 상세 조회. 배포 정보 탭
            ---
            # inputs
            배포 id 입력
                deployment_id (int)
            ---
            # returns
            상세 조회 정보들
                status (int): 0(실패), 1(성공)
                # 성공 시
                result (dict):
                    basic_info (dict) : 기본정보
                        name (str) : 배포 이름
                        description (str) : 배포 설명
                        type (str) : built-in / custom
                        create_datetime (str) : %Y-%m-%d %H:%M:%S
                    access_info (dict)
                        access (int) : private=0 / public=1
                        owner (str) : owner name
                        user_list (list) : [{"id":[user id], "user_name"}, ...]
                        permission_level(int) : permission level
                    usage_status_info (dict)
                        api_address (str) : api 경로
                        worker_count (int) : 워커 개수
                        total_log_size (int) : 로그 용량 크기
                    built_in_model_info (dict) : basic_info.type 이 built-in 인 경우만 내려줌
                        built_in_model_name (str) : 빌트인 모델 이름
                        built_in_model_description (str) : 빌트인 모델 설명
                message (str): API로부터 담기는 메세지
                example :
                {
                    "result": {
                        "basic_info": {
                            "name": "text classification",
                            "description": "",
                            "type": "built-in",
                            "create_datetime": "2022-09-13 04:35:54"
                        },
                        "access_info": {
                        "access": 1,
                        "owner": "lyla",
                        "user_list": [
                            {
                                "id": 3,
                                "user_name": "lyla",
                                "deployment_id": 307
                            },
                            ...
                        ],
                        "permission_level": 2
                        },
                        "usage_status_info": {
                            "api_address": "https://192.168.1.32:30001/deployment/h6b3dec75648ef2de7f374886631073f2/",
                            "worker_count": 1,
                            "total_log_size": 131176
                        },
                        "built_in_model_info": {
                            "built_in_model_name": "DeTR",
                            "built_in_model_description": null
                        }
                    },
                    "message": null,
                    "status": 1
                }
        """
        res = get_deployment_detail_info(deployment_id=deployment_id, headers_user=self.check_user())
        return self.send(res)

@ns.route('/worker-setting/<int:deployment_id>', methods=['GET'], doc={'params': {'deployment_id': 'deployment ID'}})
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DeploymentWorkerSetting(CustomResource):
    @token_checker
    @deployment_access_check()
    def get(self, deployment_id):
        """
            Deployment Worker Setting용 조회 API. 워커 리스트 페이지의 새 워커 설정 정보
            ---
            # inputs
            배포 id 입력
                deployment_id (int)
            ---
            # returns
             워커 리스트 페이지의 새 워커 설정 정보

                status (int): 0(실패), 1(성공)
                message (str): API로 부터 담기는 메세지
                # 성공 시 
                result (dict):
                    type (str): 배포 타입 built-in/custom
                    gpu_count (int): gpu 개수
                    gpu_model (str): random / gpu 모델 명
                    built_in_model_name (str): 빌트인 모델 이름 custom 인 경우 None
                    training_name (str): 학습 이름 built-in pretrained, checkpoint id 통한 배포인 경우 None

        """
        res = get_deployment_worker_setting_info(deployment_id=deployment_id)
        return self.send(res)

@ns.route("/stop", methods=["GET"])
class DeploymentStop(CustomResource):
    @ns.expect(deployment_id_parser)
    @token_checker
    @deployment_access_check(deployment_id_parser)
    def get(self):
        """Deployment Stop"""
        args = deployment_id_parser.parse_args()
        deployment_id = args['deployment_id']


        res = stop_deployment(deployment_id=deployment_id)
        #res = response(status=1, message="deployment stop")

        return self.send(res)

@ns.route("/error_log/<int:deployment_id>", methods=['GET'], doc={'params': {'deployment_id': 'deployment ID'}})
class DeploymentErrorLog(CustomResource):
    @token_checker
    @ns.expect(deployment_id_parser)
    def get(self, deployment_id):
        """Deployment error log 조회"""
        res = get_error_log(deployment_id=deployment_id)
        return self.send(res)

@ns.route("/checkpoint", methods=['POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class CheckpointDeployment(CustomResource):

    @token_checker
    @ns.expect(deployment_checkpoint_post)
    def post(self):
        """checkpoint 통한 Deployment 생성 - UI 연동은 아직 X 작업 필요 (2022-10-13 Yeobie)"""
        args = deployment_checkpoint_post.parse_args()
        workspace_id = args["workspace_id"]
        # built_in_model_id = args["built_in_model_id"]
        checkpoint_id = args["checkpoint_id"]
        owner_id = args["owner_id"]
        gpu_count = args["gpu_count"]

        res = create_deployment_with_ckpt(workspace_id=workspace_id, checkpoint_id=checkpoint_id,
                                            owner_id=owner_id, gpu_count=gpu_count, headers_user=self.check_user())

        return self.send(res)

@ns.route("/create_deployment_api", methods=["POST"])
class CreateDeploymentApi(CustomResource):
    @token_checker
    @ns.expect(create_deployment_api_parser)
    def post(self):
        """Create JF default deployment api"""
        args = create_deployment_api_parser.parse_args()
        # workspace_name = args["workspace_name"]
        # training_name = args["training_name"]
        custom_deployment_json_str = args["custom_deployment_json"]
        # res = create_deployment_api(workspace_name=workspace_name, training_name=training_name, custom_deployment_json_str=custom_deployment_json_str)
        res = create_deployment_api( custom_deployment_json_str=custom_deployment_json_str)

        return self.send(res)

@ns.route("/download_abnormal_record", methods=["GET"])
class DeploymentDownloadAbnormalRecord(CustomResource):
    @ns.expect(total_api_monitor_parser)
    @token_checker
    def get(self):
        """deployment dashboard history graph"""
        args = total_api_monitor_parser.parse_args()
        try:
            deployment_id = args["deployment_id"]
            start_time = args["start_time"]
            end_time = args["end_time"]
            interval = args["interval"]
            absolute_location = args["absolute_location"]
            worker_list = args["worker_list"]
            res = get_deployment_api_monitor_graph(deployment_id=deployment_id, start_time=start_time, 
                                                        end_time=end_time, interval=interval, absolute_location=absolute_location,
                                                        worker_list=worker_list, get_csv=True)
            if type(res)==dict:
                return self.send(res)

            return res
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

@ns.route("/dashboard_history", methods=["GET"])
class DeploymentDashboardTest(CustomResource):
    @ns.expect(total_api_monitor_parser)
    @token_checker
    def get(self):
        """deployment dashboard history graph"""
        # st=time.time()
        args = total_api_monitor_parser.parse_args()
        deployment_id = args["deployment_id"]
        start_time = args["start_time"]
        end_time = args["end_time"]
        interval = args["interval"]
        absolute_location = args["absolute_location"]
        worker_list = args["worker_list"]
        search_type = args["search_type"]
        # processing_time_logic = args["processing_time_logic"]
        # response_time_logic = args["response_time_logic"]
        res = get_deployment_api_monitor_graph(deployment_id=deployment_id, start_time=start_time, 
                                                    end_time=end_time, interval=interval, absolute_location=absolute_location,
                                                    worker_list=worker_list, search_type=search_type)
        # print("time: ", time.time()-st)
        return self.send(res)

@ns.route("/dashboard_status", methods=["GET"])
class DeploymentDashboardStatus(CustomResource):
    @ns.expect(deployment_id_parser)
    @token_checker
    def get(self):
        """
            Deployment dashboard current status information
            ---
            # returns
            Deployment worker dashboard 의 상위 정보들
                
                status (int): 0(실패), 1(성공)
                # 성공 시
                result (dict):
                    total_info (dict): 배포 작동 시간, 전체 콜 수, 응답 성공률, 작동중인 워커
                        total_call_count (int): 워커들의 call count 의 합
                        total_success_rate (float): nginx 200 인 count 의 비율
                        total_log_size (int): 워커 directory의 size의 합 (byte)
                        restart_count (int): 워커 pod의 재시작 횟수
                        running_worker_count (int): 동작중인 워커 개수.
                        error_worker_count (int): 에러 워커 개수.
                        deployment_run_time (float): 배포 실행 시간 (중간에 모든 워커가 중지된 기간은 제외됨)
                    resource_info (dict): 
                        cpu_usage_rate (dict): cpu 사용률(0~1)의 min, max, average, min_worker_id, max_worker_id.
                        ram_usage_rate (dict): ram 사용률(0~1)의 min, max, average, min_worker_id, max_worker_id.
                        gpu_mem_usage_rate (dict): gpu 사용률(0~1)의 min, max, average, min_worker_id, max_worker_id. gpu 사용안할 시 전부 0.
                        gpu_core_usage_rate (dict): gpu 코어 사용률(0~1)의 min, max, average, min_worker_id, max_worker_id. gpu 사용안할 시 전부 0.
                        # min==max 인 경우
                                ex) {"min": 0.125, "max": 0.125, "average": 0.125}
                        # min!=max 인 경우
                            ex) {"min": 0.123, "max": 0.125, "average": 0.125, "min_worker_id": 30, "max_worker_id":32}
                        gpu_use_mem (int): 워커에서 사용한 GPU 메모리
                        gpu_total_mem (int): 워커에서 사용할 수 있는 총 GPU 메모리
                        gpu_mem_unit (str): gpu memory 의 단위. 고정 값 "MiB"
                    worker_start_time (str): 워커 시작 시간 ex) "2022-02-18 03:11:30"
                message (str): API로 부터 담기는 메세지
                    
        """
        """deployment dashboard current status information"""
        args = deployment_id_parser.parse_args()
        deployment_id = args["deployment_id"]

        res = get_deployment_dashboard_status(deployment_id=deployment_id)

        return self.send(res)

@ns.route("/download_api_log", methods=["GET"])
class DeploymentDownloadApiLog(CustomResource):
    @ns.expect(download_log_parser)
    @token_checker
    @deployment_access_check(download_log_parser)
    def get(self):
        """download deployment api, nginx log"""
        args = download_log_parser.parse_args()
        try:
            deployment_id = args["deployment_id"]
            worker_list = args["worker_list"]
            start_time = args.get("start_time")
            end_time = args.get("end_time")
            nginx_log = args.get("nginx_log")
            if nginx_log==None:
                nginx_log=False
            api_log = args.get("api_log")
            if api_log==None:
                api_log=False

            res = get_deployment_log_download(deployment_id=deployment_id, worker_list=worker_list, 
                                                start_time=start_time, end_time=end_time,
                                                nginx_log=nginx_log, api_log=api_log)

            if type(res)==dict:
                return self.send(res)
            else:
                return res
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

@ns.route("/worker_list_by_date", methods=["GET"])
class DeploymentWorkerListByDate(CustomResource):
    @ns.expect(delete_log_parser)
    @token_checker
    def get(self):
        """delete deployment api, nginx log"""
        args = get_worker_list_by_date_parser.parse_args()
        deployment_id = args["deployment_id"]
        end_time = args.get("end_time")
        res = get_deployment_log_delete(deployment_id=deployment_id, end_time=end_time, get_worker_list=True)
        return self.send(res)

@ns.route("/api_log", methods=["DELETE"])
class DeploymentDeleteApiLog(CustomResource):
    @ns.expect(delete_log_parser)
    @token_checker
    @deployment_access_check(delete_log_parser, allow_max_level=3)
    def delete(self):
        """delete deployment api, nginx log"""
        args = delete_log_parser.parse_args()
        deployment_id = args["deployment_id"]
        end_time = args.get("end_time")
        worker_list = args.get("worker_list")
        res = get_deployment_log_delete(deployment_id=deployment_id, end_time=end_time, worker_list=worker_list)
        return self.send(res)

@ns.route('/bookmark', methods=["POST","DELETE"])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DeploymentBookmark(CustomResource):
    @ns.expect(deployment_bookmark_post_parser)
    @token_checker
    @workspace_access_check(deployment_bookmark_post_parser)
    def post(self):
        """Deployment Bookmark 추가"""
        args = deployment_bookmark_post_parser.parse_args()
        try:
            deployment_id = args["deployment_id"]

            res = add_deployment_bookmark(deployment_id=deployment_id, user_id=self.check_user_id())

            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

    @ns.expect(deployment_bookmark_delete_parser)
    @token_checker
    @workspace_access_check(deployment_bookmark_delete_parser)
    def delete(self):
        """Deployment Bookmark 제거"""
        args = deployment_bookmark_delete_parser.parse_args()
        try:
            deployment_id = args["deployment_id"]

            res = delete_deployment_bookmark(deployment_id=deployment_id, user_id=self.check_user_id())

            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

@ns.route('/api_path', methods=["PUT"])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DeploymentAPIPath(CustomResource):
    @ns.expect(deployment_api_path_update_parser)
    @token_checker
    @deployment_access_check(deployment_api_path_update_parser, allow_max_level=3)
    def put(self):
        """
            Deployment API 주소 변경 .
            ---
            # inputs

                deployment_id(int)
                api_path(str) - api 경로

            ---
            # returns

                status (int): 0(실패), 1(성공)
                message (str): API로 부터 담기는 메세지
        """        
        args = deployment_api_path_update_parser.parse_args()
        try:
            deployment_id = args["deployment_id"]
            api_path = args["api_path"]

            res = update_deployment_api_path(deployment_id=deployment_id, api_path=api_path)

            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

@ns.route("/deployment_name", methods=["GET"])
class DeploymentNameFromId(CustomResource):
    @ns.expect(deployment_id_parser)
    @token_checker
    def get(self):
        """Deployment 이름 조회"""
        args = deployment_id_parser.parse_args()
        deployment_id = args["deployment_id"]
        res = get_deployment_name(deployment_id=deployment_id)
        return self.send(res)

@ns.route("/template-list", methods=["GET"])
class DeploymentTemplateList(CustomResource):
    @ns.expect(deployment_template_list_get_parser)
    @token_checker
    @workspace_access_check(deployment_template_list_get_parser)
    def get(self):
        """
            Deployment Template 리스트 조회.
            ---
            # inputs
                workspace_id (int)
                deployment_template_group_id (int): 배포 템플릿 그룹 클릭한 경우 
                is_ungrouped_template (int): ungrouped 인 경우 1
            ---
            # returns
            workspace 내의 template 정보 리스트

                status (int): 0(실패), 1(성공)
                message (str): API로 부터 담기는 메세지
                # 성공 시 
                result (dict):
                    template_list(list)
                        (dict)
                            id (int): template id
                            name (str): 배포 템플릿 이름
                            description (str): 배포 템플릿 설명
                            deployment_template_type (str): usertrained / custom / pretrained / sandbox
                            deployment_template (dict):
                                deployment_type (str): built-in / custom
                                training_id (int): 
                                    * deployment_template_type 이 usertrained / custom 일때 내려줌
                                training_name (str): 학습 이름
                                    * deployment_template_type 이 usertrained / custom 일때 내려줌
                                command (dict): 실행 명령어
                                    * deployment_template_type 이 custom 일때 내려줌
                                    binary(str): 
                                    script(str):
                                    arguments
                                environments (list): 환경변수
                                    * deployment_template_type 이 custom 일때 내려줌
                                    (dict)
                                        name (str)
                                        value (str)
                                checkpoint (str)
                                    * deployment_template_type 이 usertrained 일때 내려줌
                                built_in_model_id (int)
                                    * deployment_template_type 이 usertrained 일때 내려줌
                                built_in_model_name (str)
                                    * deployment_template_type 이 usertrained 일때 내려줌
                                training_type (str): job / hps
                                job_id (int):
                                    * deployment_template_type 이 usertrained 이고 training_type 이 job 일때 내려줌
                                job_name (str):
                                    * deployment_template_type 이 usertrained 이고 training_type 이 job 일때 내려줌
                                job_group_index (int): 값에 +1 한 string 값. 예) job_group_index=1 => "JOB 2"
                                    * deployment_template_type 이 usertrained 이고 training_type 이 job 일때 내려줌
                                hps_name (str):
                                    * deployment_template_type 이 usertrained 이고 training_type 이 hps 일때 내려줌
                                hps_group_index (int): 값에 +1 한 string 값. 예) hps_group_index=1 => "HPS 2"
                                    * deployment_template_type 이 usertrained 이고 training_type 이 hps 일때 내려줌
                                hps_number (int):
                                    * deployment_template_type 이 usertrained 이고 training_type 이 hps 일때 내려줌
                            user_id: 배포 생성자 id
                            user_name: 배포 생성자 이름
                            create_datetime: 배포 템플릿 생성 시간
                            permission_level: 수정 권한 level (4 이하 => 수정 허용, 5 이상 => 수정 비활성화)
        """
        args = deployment_template_list_get_parser.parse_args()
        workspace_id = args["workspace_id"]
        deployment_template_group_id = args["deployment_template_group_id"]
        is_ungrouped_template = args["is_ungrouped_template"]

        res = get_deployment_template_list(workspace_id=workspace_id, 
                                        deployment_template_group_id=deployment_template_group_id,
                                        is_ungrouped_template=is_ungrouped_template,
                                        headers_user=self.check_user_id())

        return self.send(res)

@ns.route('/template', methods=["GET","POST", "PUT"])
@ns.route('/template/<id_list>', methods=['DELETE'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DeploymentTemplate(CustomResource):
    @ns.expect(deployment_template_get_parser)
    @token_checker
    @workspace_access_check(deployment_template_get_parser)
    def get(self):
        """
            Deployment Template 조회. => 현재 미사용
            ---
            # inputs
                workspace_id (int): 워크스페이스 id
                deployment_template_id (int): 배포 템플릿 id
            ---
            # returns
            workspace 내의 template 정보 리스트

                status (int): 0(실패), 1(성공)
                message (str): API로 부터 담기는 메세지
                # 성공 시 
                result (dict):
                    (dict)
                        workspace_id: 워크스페이스 id
                        workspace_name: 워크스페이스 이름
                        id (int): template id
                        name (str): template name
                        description (str): template description
                        user_id: 배포 생성자 id
                        create_datetime: 배포 생성 시간
        """
        args = deployment_template_get_parser.parse_args()
        workspace_id = args["workspace_id"]
        deployment_template_id = args["deployment_template_id"]

        res = get_deployment_template(workspace_id=workspace_id, deployment_template_id=deployment_template_id)#, headers_user=self.check_user_id())

        return self.send(res)

    @ns.expect(deployment_template_post_parser)
    @token_checker
    def post(self):
        """
            Deployment Template 생성
            ---
            # inputs
                workspace_id (int)
                deployment_template_name (str) - 배포 템플릿 이름
                deployment_template_description (str) - 배포 템플릿 설명
                deployment_template_group_id (int) - 배포 템플릿 그룹 ID
                    * 그룹 선택하는 경우: 그룹 ID
                    * 그룹 선택 안하는 경우: None
                deployment_template_group_name (str) - 배포 템플릿 그룹 이름
                    * 그룹 생성하는 경우: 그룹 이름
                    * 그룹 생성 안하는 경우: None
                deployment_template_group_description (str) - 배포 템플릿 그룹 설명
                deployment_template(dict)
                    * 배포유형 '설정값 직접 입력하기': json 값
                    * 배포유형 나머지: None
                deployment_template_id (int)
                    * 배포유형 '템플릿 사용하기'
                        * 값이 그대로: deployment_template_id
                        * 값이 변함: None
                    * 배포유형 나머지: None
                deployment_type (str) - custom / built-in
                    * 배포유형 Built-in 모델 사용하기: built-in
                    * 배포유형 학습에서 가져오기:
                        * training_type built_in 선택: built-in
                        * training_type custom 선택: custom
                    * 배포유형 나머지: None
                training_id (int)
                    * 배포유형 학습에서 가져오기: training id 값
                    * 배포유형 나머지: None
                training_type (str)
                    * 배포유형 Built-in 모델 사용하기: None
                    * 배포유형 학습에서 가져오기:
                        * training_type built_in 선택: job / hps
                        * training_type custom 선택: None
                job_id (int)
                    * training_type 이 job 일때만
                hps_id (int)
                    * training_type 이 hps 일때만
                hps_number (int)
                    * training_type 이 hps 일때만
                command (dict)
                    * deployment_type 이 built-in: None
                    * deployment_type 이 custom: 
                        * dict {"binary":"python", "script":"/jf-training-home/src/get_api.py", "arguments":"--a aa --b bb -c"}
                environments (list)
                    * deployment_type 이 built-in: None
                    * deployment_type 이 custom: 
                        * list [{"name":"FLASK_APP":"value":"app"}, {"name":"FLASK_ENV","value":"development"}]
                checkpoint (str)
                    * deployment_type 이 built-in: checkpoint
                        * 00-0.68.json
                    * deployment_type 이 custom: None
                built_in_model_id (int)
                    * deployment_type 이 built-in: built in model id
                    * deployment_type 이 custom: None
            ---
            # returns

                status (int): 0(실패), 1(성공)
                message (str): API로 부터 담기는 메세지

        """
        args = deployment_template_post_parser.parse_args()
        try:
            workspace_id = args["workspace_id"]
            deployment_template_id = args["deployment_template_id"]
            deployment_template_name = args["deployment_template_name"]
            deployment_template_description = args["deployment_template_description"]
            deployment_template_group_id = args["deployment_template_group_id"]
            deployment_template_group_name = args["deployment_template_group_name"]
            deployment_template_group_description = args["deployment_template_group_description"]
            deployment_template = args["deployment_template"]
            deployment_type = args["deployment_type"]
            training_id = args["training_id"]
            training_type = args["training_type"]
            job_id = args["job_id"]
            hps_id = args["hps_id"]
            hps_number = args["hps_number"]
            command = args["command"]
            environments = args["environments"]
            checkpoint = args["checkpoint"]
            built_in_model_id = args["built_in_model_id"]
            res = create_deployment_template(workspace_id=workspace_id, deployment_template_id=deployment_template_id,
                                        deployment_template_name=deployment_template_name, 
                                        deployment_template_description=deployment_template_description, 
                                        deployment_template_group_id=deployment_template_group_id, 
                                        deployment_template_group_name=deployment_template_group_name, 
                                        deployment_template_group_description=deployment_template_group_description,
                                        deployment_template = deployment_template,
                                        deployment_type=deployment_type, training_id=training_id, training_type=training_type, 
                                        job_id=job_id, hps_id=hps_id, hps_number=hps_number, checkpoint=checkpoint, command=command, 
                                        environments=environments, built_in_model_id=built_in_model_id, 
                                        headers_user=self.check_user_id())

            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

    @ns.expect(deployment_template_put_parser)
    @token_checker
    def put(self):
        """
            Deployment Template 수정
            ---
            # inputs
                workspace_id (int)
                deployment_template_id (int) - 배포 템플릿 ID
                deployment_template_name (str) - 배포 템플릿 이름
                deployment_template_description (str) - 배포 템플릿 설명
                deployment_template_group_id (str) - 배포 템플릿 그룹 ID
                    * 그룹 선택한 안한경우 - None
                deployment_template_group_name (str) - 배포 템플릿 그룹 이름
                    * 그룹 선택한 안한경우 - None
                deployment_template_group_description (str) - 배포 템플릿 그룹 설명
                    * 그룹 선택한 안한경우 - None
            ---
            # returns

                status (int): 0(실패), 1(성공)
                message (str): API로 부터 담기는 메세지

        """
        args = deployment_template_put_parser.parse_args()
        try:
            workspace_id = args["workspace_id"]
            deployment_template_id = args["deployment_template_id"]
            deployment_template_name = args["deployment_template_name"]
            deployment_template_description = args["deployment_template_description"]
            deployment_template_group_id = args["deployment_template_group_id"]
            deployment_template_group_name = args["deployment_template_group_name"]
            deployment_template_group_description = args["deployment_template_group_description"]
            res = update_deployment_template(workspace_id=workspace_id, 
                                        deployment_template_id=deployment_template_id,
                                        deployment_template_name=deployment_template_name, 
                                        deployment_template_description=deployment_template_description, 
                                        deployment_template_group_id=deployment_template_group_id,
                                        deployment_template_group_name=deployment_template_group_name, 
                                        deployment_template_group_description=deployment_template_group_description, 
                                        headers_user=self.check_user_id())

            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

    @token_checker
    @ns.param('id_list', 'id list')
    def delete(self, id_list):
        """
            배포 템플릿 삭제.
            ---
            # inputs
                deployment_template_id (int)
            ---
            # returns

                status (int): 0(실패), 1(성공)
                message (str): API로 부터 담기는 메세지
        """        
        deployment_template_ids = id_list.split(",")
        try:
            res = delete_deployment_template(deployment_template_ids=deployment_template_ids, headers_user=self.check_user_id())

            return self.send(res)

        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())

        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

@ns.route('/template-group', methods=["POST", "PUT"])
@ns.route('/template-group/<id_list>', methods=['DELETE'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DeploymentGroupTemplate(CustomResource):
    @ns.expect(deployment_template_group_post_parser)
    @token_checker
    def post(self):
        """
            Deployment Template Group 생성
            ---
            # inputs
                workspace_id (int)
                deployment_template_group_name (str) - 배포 템플릿 그룹 이름
                deployment_template_group_description (str) - 배포 템플릿 그룹 설명
            ---
            # returns

                status (int): 0(실패), 1(성공)
                message (str): API로 부터 담기는 메세지

        """
        args = deployment_template_group_post_parser.parse_args()
        try:
            workspace_id = args["workspace_id"]
            deployment_template_group_name = args["deployment_template_group_name"]
            deployment_template_group_description = args["deployment_template_group_description"]
            res = create_deployment_template_group(workspace_id=workspace_id, 
                                        deployment_template_group_name=deployment_template_group_name, 
                                        deployment_template_group_description=deployment_template_group_description, 
                                        headers_user=self.check_user_id())

            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

    @ns.expect(deployment_template_group_put_parser)
    @token_checker
    def put(self):
        """
            Deployment Template Group 수정
            ---
            # inputs
                workspace_id (int)
                deployment_template_group_id (int) - 배포 템플릿 그룹 ID
                deployment_template_group_name (str) - 배포 템플릿 그룹 이름
                deployment_template_group_description (str) - 배포 템플릿 그룹 설명
            ---
            # returns

                status (int): 0(실패), 1(성공)
                message (str): API로 부터 담기는 메세지

        """
        args = deployment_template_group_put_parser.parse_args()
        try:
            workspace_id = args["workspace_id"]
            deployment_template_group_id = args["deployment_template_group_id"]
            deployment_template_group_name = args["deployment_template_group_name"]
            deployment_template_group_description = args["deployment_template_group_description"]
            res = update_deployment_template_group(workspace_id=workspace_id, 
                                        deployment_template_group_id=deployment_template_group_id,
                                        deployment_template_group_name=deployment_template_group_name, 
                                        deployment_template_group_description=deployment_template_group_description, 
                                        headers_user=self.check_user_id())

            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

    @token_checker
    @ns.param('id_list', 'id list')
    def delete(self, id_list):
        """
            배포 템플릿 그룹 삭제.
            # inputs
                endpoint 뒤에 id값들 , 로 연결해서 내려주기
            ---
            # returns

                status (int): 0(실패), 1(성공)
                message (str): API로 부터 담기는 메세지
        """        
        deployment_template_group_ids = id_list.split(",")
        try:
            res = delete_deployment_template_group(deployment_template_group_ids=deployment_template_group_ids, 
                                                    headers_user=self.check_user_id())

            return self.send(res)

        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())

        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

@ns.route("/template-group-list", methods=["GET"])
class DeploymentGroupTemplateList(CustomResource):
    @ns.expect(deployment_template_group_get_parser)
    @token_checker
    @workspace_access_check(deployment_template_group_get_parser)
    def get(self):
        """
            Deployment Template Group 리스트 조회.
            ---
            # inputs
                workspace_id (int)
            ---
            # returns
            workspace 내의 template 정보 리스트

                status (int): 0(실패), 1(성공)
                message (str): API로 부터 담기는 메세지
                # 성공 시 
                result (dict):
                    deployment_template_group_info_list(list)
                        (dict)
                            id (int): 배포 템플릿 그룹 id
                            name (str): 배포 템플릿 그룹 이름
                            description (str): 배포 템플릿 그룹 설명
                            user_id: 배포 템플릿 그룹 생성자 id
                            create_datetime: 배포 템플릿 그룹 생성 시간
                            permission_level: 수정 권한 level (3 이하 => 수정 허용, 4 이상 => 수정 비활성화)
        """
        args = deployment_template_group_get_parser.parse_args()
        workspace_id = args["workspace_id"]

        res = get_deployment_template_group_list(workspace_id=workspace_id, headers_user=self.check_user_id())

        return self.send(res)

@ns.route('/template-deployment-worker', methods=["GET"])
class GetDeploymentWorkerByTemplate(CustomResource):
    @ns.expect(deployment_template_id_parser)
    @token_checker
    def get(self):
        """
            배포 템플릿을 사용하고 있는 배포/워커들 리스트 조회
            ---
            # inputs
                workspace_id (int)

        Returns:
            : _description_
        """
        args = deployment_template_id_parser.parse_args()
        template_id = args["template_id"]

        res = get_deployment_and_worker_by_template(template_id=template_id)

        return self.send(res)
    
