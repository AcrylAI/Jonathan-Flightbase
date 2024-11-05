from flask import Flask, Blueprint
from flask_restful import Resource, Api
from flask_cors import CORS
import time
import threading
import traceback
import datetime as dt
import json
import os

from collections import deque
from restplus import api
from login import ns as login_namespace
from logout import ns as logout_namespace
from user import ns as user_namespace
from training import ns as training_namespace
from workspace import ns as workspace_namespace
from datasets import ns as dataset_namespace
from builtin import ns as builtin_namespace
from storage import ns as storage
from storage_node import ns as storage_node_namespace
from nodes import ns as node_namespace
from dashboard import ns as dashboard_namespace
from gpu import ns as gpu_namespace
from service import ns as service_namespace
from deployment import ns as deployment_namespace
from deployment_worker import ns as deployment_worker_namespace
from option import ns as option_namespace
from records import ns as option_namespace
from pod import ns as pod_namespace
from user_group import ns as user_group_namespace
from user_limit import ns as user_limit_namespace
from training_checkpoint import ns as training_checkpoint_namespace
from test import ns as test_namespace
from check import ns as token_namespace
from benchmark import ns as benchmark_namespace
from benchmark_network import ns as banchmark_network_namespace
from benchmark_storage import ns as banchmark_storage_namespace

from storage import ns as storage_namespace
from storage_image_control import ns as storage_image_control_namespace
from toast_message import ns as toast_message

from network import ns as network_namespace
from sample import ns as sample


try:
    from binary_version import ns as binary_namespace
except Exception as e:
    traceback.print_exc()

import image
import user
# from training import res_check

from utils.db import init_db_table, init_db_others, backup_db, create_trigger_for_record_unified, init_db_setting, alter_record_unified_if_not_exists, create_trigger_for_dataset_create_user_id
import utils.db as db
import settings
from system_check import sys_check
from utils.common import get_args, launch_on_host, PID_THREADING_DICT, run_func_with_print_line
from utils.scheduler import res_check
from utils.storage import init_storage_type
from utils.kube import kube_data, resource_gpu_used_update, get_gpu_total_count, get_workspace_gpu_count
import utils.kube_configmap as kube_configmap
from storage import storage_sync
from nodes import init_node_all, init_node_gpu_cpu_model_label_setting, init_cpu_gpu_nodes, write_gpu_history_data, \
    write_cpu_ram_history_data
from storage_node import write_storage_io_history_data
from lock import jf_scheduler_lock, main_container, jf_resource_log_lock
from records import record_gpu_usage, update_gpu_usage, update_record_unified_end_datetime_is_null
from deployment import to_template

toggle = True
update_duration = 600  # 600 = 10 minutes 3600 = 1 hour 21600 = 6 hours 43200 = 12 hours 86400 = 1 day
update_minute_set = {0, 10, 20, 30, 40, 50}


def scheduler_work():
    from function_timer import loop_function_controller

    print("scheduler - start")
    r = random.randint(0, 10000)
    kube_data.set_master_pid(os.getpid())
    kube_data.set_update_node_labels_func(init_cpu_gpu_nodes)
    kube_data.set_update_node_labels_func(init_node_gpu_cpu_model_label_setting)
    # gpu_history_list = []
    # cpu_history_list = []
    # ram_history_list = []
    # counter = -1
    # global toggle
    while (1):
        st = time.time()
        rr = random.randint(0, 10000)
        PID_THREADING_DICT[os.getpid()] = [thread.name for thread in threading.enumerate()]
        # print("scheduler MASTER runner  ", os.getpid(), PID_THREADING_DICT)
        # print("main_container : ", main_container)
        # if toggle == True:
        #     try:
        #         counter = counter + 1
        #         if counter == 60:
        #             write_storage_io_history_data()
        #             counter = 0
        #     except:
        #         toggle = False
        time.sleep(1)
        try:
            # q.put(kube_data.get_node_list().to_dict())
            # q.put("kube_data.get_node_list()")
            with jf_scheduler_lock:
                kube_data.update_all_list()
                res_check()
                # write_gpu_history_data(gpu_history_list, pod_list=kube_data.pod_list, node_list=kubedata.node_list)
                #                 # write_cpu_ram_history_data(cpu_history_list=cpu_history_list, ram_history_list=ram_history_list,
                #                 #                             pod_list=kube_data.pod_list, node_list=kube_data.node_list)_
            # resource_gpu_used_update()
            # print("SCHEDULER WORKER ",os.getpid() , id(kube_data), id(kube_data.get_pod_list()))
            # backup_db(time.time())
            # main_container["kube_data"] = kube_data
            # print(kube_data.get_pod_list().to_dict())
            # pod_list_data = kube_data.get_pod_list(try_update=True).to_dict()
            # pod_list_data["items"] = pod_items
            # main_container["get_pod_list"] = pod_list_data
            # print(type(kube_data.get_pod_list()))
            # print(type(kube_data.get_pod_list().items))
            # print(type(kube_data.get_pod_list().items[0]))
            loop_function_controller.do()
        except:
            traceback.print_exc()


def log_work():
    gpu_history_list = []
    cpu_history_list = []
    ram_history_list = []
    counter = -1
    global toggle
    while (1):
        time.sleep(1)
        try:
            with jf_resource_log_lock:
                if toggle == True:
                    try:
                        counter = counter + 1
                        if counter == 60:
                            write_storage_io_history_data()
                            counter = 0
                    except:
                        toggle = False

                pod_list = kube_data.get_pod_list()
                node_list = kube_data.get_node_list()
                write_gpu_history_data(gpu_history_list, pod_list=pod_list, node_list=node_list)
                write_cpu_ram_history_data(cpu_history_list=cpu_history_list, ram_history_list=ram_history_list,
                                           pod_list=pod_list, node_list=node_list)
        except:
            traceback.print_exc()

# GPU 기록 업데이트를 위한 함수
def gpu_record_work():
    update_minute_set = {0, 10, 20, 30, 40, 50} # GPU 기록 업데이트 주기 설정 ({0, 10, 20, 30, 40, 50}인 경우 0분, 10분, 20분, 30분, 40분, 50분에 업데이트 됨)
    past_update_gpu_count = 0
    past_minute = -1
    past_time_update_gpu_count = time.time()
    while (1):
        # start_time = time.time()
        current_minute = dt.datetime.now().minute
        time.sleep(1)
        try:
            if current_minute in update_minute_set and current_minute != past_minute: # 현재 시간(분)이 update_minute_set에 있고 현재 시간(분)이 past_minute과 같지 않은 경우
                # if_start = time.time()
                db.insert_record_available_gpu(get_gpu_total_count(kube_data.get_node_list())) # 옛날 GPU 기록 테이블 업데이트
                past_update_gpu_count = record_gpu_usage() # GPU 기록 추가 및 GPU 갯수를 return 받아 past_update_gpu_count를 업데이트 함
                past_minute = current_minute # past_minute를 current_minute로 업데이트 함
                # print("if end: " + str(time.time() - if_start))
            else: # 업데이트 주기 사이에 GPU 사용량이 높아질 경우 기록을 바꿈(추가 X 수정 O)
                if time.time() - past_time_update_gpu_count > 30: # 30초마다
                    gpu_usage_update_start = time.time()
                    past_update_gpu_count = update_gpu_usage(past_update_gpu_count) #  GPU 갯수를 업데이트 하고(현재 GPU 사용 수가 past_update_gpu_count보다 높은 경우) return 받아 past_update_gpu_count를 업데이트 함
                    past_time_update_gpu_count = time.time() # 전 업데이트 시간 업데이트
                    # print("GPU Usage update end: " + str(time.time() - gpu_usage_update_start))
            # print("end: " + str(time.time() - start_time))
        except:
            traceback.print_exc()


import random


def kuber_work():
    r = random.randint(0, 10000)
    while (1):
        try:
            PID_THREADING_DICT[os.getpid()] = [thread.name for thread in threading.enumerate()]
            # print("scheduler WORKER runner  ", os.getpid(), main_container)
            # print("KUBER WORKER ",os.getpid() , kube_data.is_master())
            # print("kuber worker ????", os.getpid(), r , type(main_container["get_pod_list"]))
            # kube_data.set_pod_list_from_dict(main_container["get_pod_list"])
            # print("processing ", time.time() - st)
            # print(main_container["get_pod_list"].keys())
            # print(type(main_container["get_pod_list"]["items"]))

            time.sleep(0.5)
            # kube_data.update_all_list()
            # print(kube_data.is_master())
            if kube_data.is_master():
                print("MASTER Proc")
                break
            # print("Worker POD : " , os.getpid(), "COUNT", kube_data.get_pod_list().metadata.resource_version)
            # print("Worker NODE : " , os.getpid(), "COUNT", kube_data.get_node_list().metadata.resource_version)
            # print("Worker : " , os.getpid(), "Resource version : ",kube_data.get_pod_list().metadata.resource_version)
            # print("WWWW", PID_THREADING_DICT["ddddd"])
            # d_pod_list = kubernetes.client.api_client.ApiClient().deserialize(FakeKubeResponse(PID_THREADING_DICT["ddddd"]), "V1PodList")
            # kube_data.pod_list = d_pod_list
        except:
            traceback.print_exc()
            pass


def other_work():
    import utils.kube_certs as kube_certs
    while (1):
        try:
            db.delete_expired_login_sessions()
            # kube_certs.auto_update_jf_kube_cert() # 9 year certs 생성 시 불필요
            time.sleep(10)
        except Exception as e:
            traceback.print_exc()


app = Flask(__name__)
CORS(app, resources={r'/*': {"origins": '*'}})  # TODO fix later


@app.before_first_request
def initialize_thr():
    kuber_thr = threading.Thread(target=kuber_work)
    kuber_thr.start()


def initialize_scheduler():
    scheduler_thr = threading.Thread(target=scheduler_work)
    scheduler_thr.start()


def initialize_log_thr():
    log_thr = threading.Thread(target=log_work)
    log_thr.start()


def initialize_other_work_thr():
    other_work_thr = threading.Thread(target=other_work)
    other_work_thr.start()


def initialize_gpu_log_thr():
    gpu_log_thr = threading.Thread(target=gpu_record_work) # GPU 기록 업데이트를 위한 새 thread 추가
    gpu_log_thr.start()


def configure_app(flask_app):
    # flask_app.config['SERVER_NAME'] = settings.FLASK_SERVER_NAME
    flask_app.config['SWAGGER_UI_DOC_EXPANSION'] = settings.RESTPLUS_SWAGGER_UI_DOC_EXPANSION
    flask_app.config['RESTPLUS_VALIDATE'] = settings.RESTPLUS_VALIDATE
    flask_app.config['RESTPLUS_MASK_SWAGGER'] = settings.RESTPLUS_MASK_SWAGGER
    flask_app.config['ERROR_404_HELP'] = settings.RESTPLUS_ERROR_404_HELP
    flask_app.config['JF_UPLOAD_DIR'] = settings.JF_UPLOAD_DIR
    flask_app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024 * 1024  # 100GB limit.


def initialize_app(flask_app):
    configure_app(flask_app)
    blueprint = Blueprint('api', __name__, url_prefix='/api')
    api.init_app(blueprint)
    flask_app.register_blueprint(blueprint)


def main():
    def init_record():
        create_trigger_for_record_unified()
        alter_record_unified_if_not_exists() # record_unified에 가상 column을 추가하고 index를 추가함
        update_record_unified_end_datetime_is_null() # record_unified 데이터 중 end_datetime이 null (비정상 종료) 인 경우 end_datetime 현재 시간으로 update
    create_trigger_for_dataset_create_user_id()
    storage_sync() #jfb 시작시 storage를 자동으로 scan하여 db 동기화
    init_db_setting()
    init_db_table()
    if not settings.RUNNING_API_WITHOUT_SYSTEM_CHECK:
        sys_check()

    initialize_app(app)
    try:
        no_init_sched = settings.NO_INIT_SCHEDULER  # raises AttributeError
        if not no_init_sched:  # Explicit enabled by NO_INIT_SCHEDULER=False.
            raise AttributeError('proceed init_scheduler')
    except AttributeError:  # Implicit enabled by default.
        initialize_scheduler()
        initialize_thr()
        initialize_log_thr()
        initialize_other_work_thr()
        initialize_gpu_log_thr() # GPU 기록 업데이트를 위한 새 thread 추가

    try:
        init_node_all()
        init_db_others()
        init_node_all()

        image.start_refresh_loop()
        user.init_users()
        kube_configmap.create_configmap_all()
        init_storage_type()
        
        init_record()
        
        if settings.DEPLOYMENT_TEMPLATE_DB_UPDATE:
            run_func_with_print_line(func=to_template, line_message="UPDATE DEPLOYMENT TO TEMPLATE")

        db.set_mariadb_setting()
    except Exception as e:
        traceback.print_exc()
        raise RuntimeError("SYSTEM INIT ERROR")


if __name__ == "__main__":
    main()
    port = get_args().jf_master_port if get_args().jf_master_port is not None else settings.FLASK_SERVER_PORT
    app.run(debug=settings.FLASK_DEBUG, host=settings.FLASK_SERVER_IP, port=port, threaded=True)

main()
application = app

