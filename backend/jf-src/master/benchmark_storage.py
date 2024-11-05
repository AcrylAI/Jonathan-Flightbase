from utils.resource import CustomResource, token_checker
import requests
import traceback
import json
import time
import subprocess
import re
import threading
import multiprocessing
from lock import jf_benchmark_storage_lock
from settings import JF_WORKER_PORT
from restplus import api
from TYPE import *
import utils.db as db
from utils import common
from utils.resource import response
from utils.resource import CustomResource, token_checker
from utils.access_check import admin_access_check
from utils.runnable_object_controller import RunnableObjectController, RunnableObjectAlreadyRunningError
from utils.exceptions import *

JF_WORKER_PORT = common.get_args().jf_worker_port if common.get_args().jf_worker_port is not None else JF_WORKER_PORT
benchmark_storage_test_list = multiprocessing.Manager().list()

ns = api.namespace('benchmark', description='benchmark 관련 API')

def _item_list():
    return {
        "node_list" : [{"id" : item["id"], "name" : item["name"], "ip" : item["ip"]} for item in db.get_node_list()],
        "storage_list" : [{"id" : item["id"], "name" : item["logical_name"], "path" : item["physical_name"]} for item in db.get_storage_list()]
    }

def restart_thread_for_unprocessed_item():
    """스레드 join 후, 리스트에 추가될 때, 스레드는 종료되고 리스트에는 아이템이 남아있는 상태가 됨
    이 상태를 체크하여, 스레드를 재실행 하는 함수"""
    try:
        if benchmark_storage_test_list and not RunnableObjectController().is_process_running(name="benchmark-storage-thread"):
            th = threading.Thread(target=running_benchmark_storage, args=(), name="benchmark-storage-thread" ,daemon=True)
            RunnableObjectController().run_created_thread(thread=th)
    except Exception as e:
        traceback.print_exc()

# =============================================================================================
def check_test_case_in_list(node_id, storage_id):
    global benchmark_storage_test_list
    try:
        for item in benchmark_storage_test_list:
            if item[0] == node_id and item[1] == storage_id:
                return True
        else:
            return False
    except Exception as e:
        traceback.print_exc()

def running_benchmark_storage():
    global benchmark_storage_test_list 
    while True:
        if benchmark_storage_test_list:
            node_id, storage_id, headers = \
                    benchmark_storage_test_list[0][0], benchmark_storage_test_list[0][1], benchmark_storage_test_list[0][2]

            # info
            node = db.get_node(node_id=node_id)
            storage = db.get_storage(id=storage_id)
            path = "fio-check?path={}".format(storage["physical_name"])

            # request
            r = common.get_worker_requests(ip=node["ip"], path=path, timeout=1200, headers=headers)

            # result
            if r["get_status"] == False:
                db.insert_benchmark_storage_fio_err(node_id, storage_id, "Client Node Connetion error")
            elif r["get_status"]:
                tmp = r["result"].text
                data = json.loads(tmp)["result"]

                if data == 1:
                    db.insert_benchmark_storage_fio_err(node_id, storage_id, "TEST Package Install error")
                elif data == 2:
                    db.insert_benchmark_storage_fio_err(node_id, storage_id, "TEST Execution error")
                else:
                    db.insert_benchmark_storage_fio(node_id, storage_id, data)

            # case 제거
            with jf_benchmark_storage_lock:
                benchmark_storage_test_list.pop(0)
                if not benchmark_storage_test_list:
                    return

def add_benchmark_storage_to_list(headers, test_list):
    global benchmark_storage_test_list
    try:
        # 테스트 케이스 추가
        with jf_benchmark_storage_lock:
            for node_id, storage_id in test_list:
                # 리스트에 없는 경우에 추가
                if not check_test_case_in_list(node_id, storage_id):
                    benchmark_storage_test_list.append((node_id, storage_id, headers))

        th = threading.Thread(target=running_benchmark_storage, args=(), name="benchmark-storage-thread" ,daemon=True)
        RunnableObjectController().run_created_thread(thread=th)
    except RunnableObjectAlreadyRunningError as e:
        pass
    except Exception as e:
        traceback.print_exc()

# =============================================================================================
# =============================================================================================
def storage_fio_check_all(headers):
    try:
        node_id_list = [item["id"] for item in db.get_node_list()]
        storage_id_list = [item["id"] for item in db.get_storage_list()]
        test_list = [(node, storage) for node in node_id_list for storage in storage_id_list]
        res = add_benchmark_storage_to_list(headers=headers, test_list=test_list)
        return res
    except Exception as e:
        traceback.print_exc()

def storage_fio_check_node(headers, select_node):
    try:
        storage_id_list = [item["id"] for item in db.get_storage_list()]
        test_list = [(select_node, storage) for storage in storage_id_list]
        res = add_benchmark_storage_to_list(headers=headers, test_list=test_list)
        return res
    except Exception as e:
        traceback.print_exc()

def storage_fio_check_storage(headers, select_storage):
    try:
        node_id_list = [item["id"] for item in db.get_node_list()]
        test_list = [(node, select_storage) for node in node_id_list]
        res = add_benchmark_storage_to_list(headers=headers, test_list=test_list)
        return res
    except Exception as e:
        traceback.print_exc()

def storage_fio_check_cell(headers, select_cell):
    try:
        res = add_benchmark_storage_to_list(headers=headers, test_list=[(select_cell["node_id"], select_cell["storage_id"])])
        return res
    except Exception as e:
        traceback.print_exc()

post_storage_fio_check = api.parser()
post_storage_fio_check.add_argument('select_cell', type=dict, required=False, location='json', help='select cell')
post_storage_fio_check.add_argument('select_all', type=bool, required=False, default = False, location='json', help='select cells')
post_storage_fio_check.add_argument('select_node', type=int, required=False, default = 0, location='json', help='select line ( select server node id )')
post_storage_fio_check.add_argument('select_storage', type=int, required=False, default = 0, location='json', help='select line ( select server storage id )')

@ns.route("/storage-fio-check", methods=["POST"])
@ns.response(200, "Success")
@ns.response(400, "Validation Error")
class StorageFioCheck(CustomResource):
    @ns.expect(post_storage_fio_check)
    @token_checker
    @admin_access_check()
    def post(self):
        """
        Benchmark Storage Test 실행 
        # input
            select_cell    (dict) : 사용자 선택 cell
                - node_id
                - storage_id
            select_all     (bool) : 모든 경우
            select_node    (int)  : 해당 node
            select_storage (int)  : 해당 storage
        # return
            result : null
            message : null
            status (int) : 1 = 성공, 0 = 실패
        """
        try:
            args = post_storage_fio_check.parse_args()
            select_cell = args["select_cell"]
            select_all = args["select_all"]
            select_node = args["select_node"]
            select_storage = args["select_storage"]

            headers = self.get_jf_headers()

            if select_all:
                result = storage_fio_check_all(headers=headers)
            elif select_node:
                result = storage_fio_check_node(headers=headers, select_node=select_node)
            elif select_storage:
                result = storage_fio_check_storage(headers=headers, select_storage=select_storage)
            else:
                result = storage_fio_check_cell(headers=headers, select_cell=select_cell)

            if result:
                raise AlreadyThreadRunningError
            return self.send(response(status=1, result=None))
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response(result=result))
        except Exception as e:
            traceback.print_exc()
            res = response(status=0, result=str(e))
            return self.send(res)

# =============================================================================================
# =============================================================================================
def get_benchmark_storage_all_data():
    try:
        storage_latest_data = []
        item_list = _item_list()
        for node in item_list["node_list"]:
            for storage in item_list["storage_list"]:
                _dict = {
                    "node_id" : node["id"],
                    "storage_id" : storage["id"],
                    "is_running" : False
                }

                if check_test_case_in_list(node["id"], storage["id"]):
                    _dict["is_running"] = True

                _dict["data"] = db.get_benchmark_storage_fio_latest(node["id"], storage["id"])
                storage_latest_data.append(_dict)
        return storage_latest_data
    except Exception as e:
        traceback.print_exc()

def get_benchmark_storage_cell_data(node_id, storage_id):
    try:
        data = db.get_benchmark_storage_fio_cell_history(node_id, storage_id)
        if data is False:
            return False

        res = [
            {
                "test_datetime" : item["test_datetime"],
                "data" : {k: v for k, v in item.items() if k not in {"test_datetime", }}
            } for item in data
        ]
            
        return res
    except Exception as e:
        traceback.print_exc()

def get_benchmark_storage_all_data_to_csv():
    """
    [
        ['node_id', 'storage_id', 'read_withbuffer_iops', 'read_withbuffer_speed', 'read_withoutbuffer_iops', 'read_withoutbuffer_speed', 'write_withbuffer_iops', 'write_withbuffer_speed', 'write_withoutbuffer_iops', 'write_withoutbuffer_speed'],
        [1, 1, 8043.0, 31.42, 25136.1, 98.19, 6728.73, 26.28, 21306.8, 83.23],
        [1, 2, 8043.0, 31.42, 25136.1, 98.19, 6728.73, 26.28, 21247.3, 83.0]
    ]
    """
    try:
        csv_data = []
        header = []
        data = get_benchmark_storage_all_data()
        for k, _ in data[0].items():
            if k == "data":
                for data_key, _ in data[0]["data"].items():
                    header.append(data_key)
            elif k == "is_running":
                continue

            else:
                header.append(k)
        csv_data.append(header)
        
        for tmp in data:
            tmp_data = list(tmp["data"].values())
            all_tmp_data = [tmp["node_id"], tmp["storage_id"]] + tmp_data
            csv_data.append(all_tmp_data)

        return common.csv_response_generator(data_list=csv_data, filename="all_data")
    except Exception as e:
        traceback.print_exc()

def get_benchmark_storage_cell_data_to_csv(node_id, storage_id):
    try:
        data = db.get_benchmark_storage_fio_cell_history(node_id, storage_id)
        if data is False:
            return DataDoesNotExistError
        
        csv_data = [list(data[0].keys())]
        for item in data:
            csv_data.append(list(i.replace(" ", "_") if type(i) == str else i for i in item.values()))
        return common.csv_response_generator(data_list=csv_data, filename="{}-{}".format(node_id, storage_id))
    except Exception as e:
        traceback.print_exc()

get_detail_data = api.parser()
get_detail_data.add_argument('node_id', type=int, required=True, location='args', help='node id')
get_detail_data.add_argument('storage_id', type=int, required=True, location='args', help='storage id')

@ns.route("/storage-all-info", methods=["GET"])
@ns.response(200, "Success")
@ns.response(400, "Validation Error")
class StorageFioAllInfo(CustomResource):
    @token_checker
    @admin_access_check()
    def get(self):
        """
        모든 노드 benchmark 결과
        ---
        # return
            status
            message
            result : list
                [
                    {
                        node_id : int,
                        storage_id : int,
                        is_running : bool,
                        data : dict = {
                            "read_withbuffer_iops": float,
                            "read_withbuffer_speed": float,
                            "read_withoutbuffer_iops": float,
                            "read_withoutbuffer_speed": float,
                            "write_withbuffer_iops": float,
                            "write_withbuffer_speed": float,
                            "write_withoutbuffer_iops": float,
                            "write_withoutbuffer_speed": float            
                        }
                    },
                    {...},
                ]
        # example
            {
                "result": [
                    {
                        "node_id": 1,
                        "storage_id": 1,
                        "is_running": false,
                        "data": {
                            "read_withbuffer_iops": 7085.29,
                            "read_withbuffer_speed": 28341.0,
                            "read_withoutbuffer_iops": 34638.5,
                            "read_withoutbuffer_speed": 138553.0,
                            "write_withbuffer_iops": 4959.9,
                            "write_withbuffer_speed": 19839.0,
                            "write_withoutbuffer_iops": 33040.6,
                            "write_withoutbuffer_speed": 132162.0
                        }
                    },
                    {
                        "node_id": 1,
                        "storage_id": 2,
                        "is_running": false,
                        "data": {
                            ...
                        }
                    }
                ],
                "message": null,
                "status": 1
            }
        """
        try:
            res = get_benchmark_storage_all_data()
            return self.send(response(status=1, result=res))
        except Exception as e:
            traceback.print_exc()
            res = response(status=0, result=str(e))
            return self.send(res)

@ns.route("/storage-cell-info", methods=["GET"])
@ns.response(200, "Success")
@ns.response(400, "Validation Error")
class StorageFioCellInfo(CustomResource):
    @ns.expect(get_detail_data)
    @token_checker
    @admin_access_check()
    def get(self):
        """
        특정 노드 benchmark 결과
        ---
        # return
            status
            message
            result : list(dict)
                [
                    
                    {
                        'test_datetime': str,
                        'data' : {
                            'read_withbuffer_iops': float,
                            'read_withbuffer_speed': float,
                            'read_withoutbuffer_iops': float,
                            'read_withoutbuffer_speed': float,
                            'write_withbuffer_iops': float,
                            'write_withbuffer_speed': float,
                            'write_withoutbuffer_iops': float,
                            'write_withoutbuffer_speed': float
                        }
                    }, 
                    {...}, {...}
                ]
        # example
            {
                "result": [
                    {
                        "test_datetime": '2022-12-01 01:52:49',
                        "data" : {
                            "read_withbuffer_iops": 7085.29,
                            "read_withbuffer_speed": 28341.0,
                            "read_withoutbuffer_iops": 34638.5,
                            "read_withoutbuffer_speed": 138553.0,
                            "write_withbuffer_iops": 4959.9,
                            "write_withbuffer_speed": 19839.0,
                            "write_withoutbuffer_iops": 33040.6,
                            "write_withoutbuffer_speed": 132162.0
                        }
                    },
                    {...}, {...}
                ],
                "message": null,
                "status": 1
            }
        """
        try:
            args = get_detail_data.parse_args()
            node_id = args["node_id"]
            storage_id = args["storage_id"]
            res = get_benchmark_storage_cell_data(node_id, storage_id)
            return self.send(response(status=1, result=res))
        except Exception as e:
            traceback.print_exc()
            res = response(status=0, result=str(e))
            return self.send(res)

@ns.route("/storage-all-info/csv-download", methods=["GET"])
@ns.response(200, "Success")
@ns.response(400, "Validation Error")
class StorageFioAllCsv(CustomResource):
    @token_checker
    @admin_access_check()
    def get(self):
        """
        모든 노드 benchmark 결과 csv 다운로드
        ---
        # result
            (csv)
            Header
            data
        # example
            node_id,storage_id,read_withbuffer_iops,read_withbuffer_speed,read_withoutbuffer_iops,read_withoutbuffer_speed,write_withbuffer_iops,write_withbuffer_speed,write_withoutbuffer_iops,write_withoutbuffer_speed
            1,1,7085.29,28341.0,34638.5,138553.0,4959.9,19839.0,33040.6,132162.0
            1,2,5058.09,20232.0,20672.2,82688.0,4777.82,19111.0,18503.2,74012.0
        """
        try:
            res = get_benchmark_storage_all_data_to_csv()
            if type(res)==dict:
                return self.send(res)
            return res
        except Exception as e:
            traceback.print_exc()
            res = response(status=0, result=str(e))
            return self.send(res)

@ns.route("/storage-cell-info/csv-download", methods=["GET"])
@ns.response(200, "Success")
@ns.response(400, "Validation Error")
class StorageFioCellCsv(CustomResource):
    @ns.expect(get_detail_data)
    @token_checker
    @admin_access_check()
    def get(self):
        """
        특정 노드 benchmark 결과 csv 다운로드
        ---
        # result
            (csv)
            Header
            data
        # example
            test_datetime,read_withbuffer_iops,read_withbuffer_speed,read_withoutbuffer_iops,read_withoutbuffer_speed,write_withbuffer_iops,write_withbuffer_speed,write_withoutbuffer_iops,write_withoutbuffer_speed
            2022-12-01_01:52:56,5051.09,20204.0,19129.0,76516.0,2998.3,11993.0,25744.5,102977.0
            2022-12-01_01:54:03,4971.4,19885.0,34538.1,138152.0,4875.11,19500.0,17896.8,71587.0
            ...
        """
        try:
            args = get_detail_data.parse_args()
            node_id = args["node_id"]
            storage_id = args["storage_id"]
            res = get_benchmark_storage_cell_data_to_csv(node_id, storage_id)
            if type(res)==dict:
                return self.send(res)
            return res
        except Exception as e:
            traceback.print_exc()
            res = response(status=0, result=str(e))
            return self.send(res)