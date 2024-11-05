import os
import json
import traceback
import threading
import time

from datetime import datetime, timedelta
from functools import reduce
from collections import deque

from restplus import api
from TYPE import *
import utils.db as db
from utils import common
from utils.resource import response
from utils.exceptions import *
from utils.resource import CustomResource, token_checker
from utils.access_check import admin_access_check
from utils.runnable_object_controller import RunnableObjectController, RunnableObjectAlreadyRunningError

ns = api.namespace('benchmark', description='benchmark 관련 API')

post_node_network_bandwidth_check = api.parser()
post_node_network_bandwidth_check.add_argument('select_cell', type=dict, required=False, location='json', help='select cell' )
post_node_network_bandwidth_check.add_argument('select_all', type=bool, required=False, default = False, location='json', help='select all' )
post_node_network_bandwidth_check.add_argument('select_line', type=int, required=False, default = 0, location='json', help='select line ( select server node id )' )

BENCHMARK_NETWORK_JSON_PATH = "../worker/{}"
NETWORK_SPEED_CHECK_PACKAGE_ETHERNET = "iperf3"
NETWORK_SPEED_CHECK_PACKAGE_INFINIBAND = "perftest"
CELL_STATUS_COMPLETE = False 
CELL_STATUS_SYNCHRONIZATION = True
BENCHMARK_REQUEST_TIME_OUT = 15
BENCHMARK_NETWORK_CLIENT = "c"
BENCHMARK_NETWORK_SERVER = "s"
BENCHMARK_THREAD_NAME = "th-benchmark-network"
DATETIME_FORMAT = '%Y-%m-%d %H:%M:%S'


# 미리 값을 할당하면 thread check가 되지 않음 
# common.BENCHMARK_NETWORK_RUNNING_INFO = {
#     "is_running" : False,
#     "client_node_id" : None,
#     "server_node_id" : None
# }

class BenchmarkNetworkManager:
                
    def is_running(self, cell : tuple) -> bool:
        #대기중인 cell 확인
        client_node_id = cell[0]
        server_node_id = cell[1]
        if client_node_id > server_node_id:
            client_node_id, server_node_id = server_node_id, client_node_id
        try:
            # 현재 진행중인 cell 확인
            if common.BENCHMARK_NETWORK_RUNNING_INFO["client_node_id"] == client_node_id and common.BENCHMARK_NETWORK_RUNNING_INFO["server_node_id"] == server_node_id:
                return True
        except KeyError as e:
            pass
        # 현재 대기중인 cell 확인
        for q in common.BENCHMARK_NETWORK_LIST:
            if q["network_group_info"]["client_node_id"] == client_node_id and q["network_group_info"]["server_node_id"] == server_node_id:
                return True
        return False

    def list_append(self, cell : tuple, headers : dict = {}):
        # list에 정보 담기
        client_node_id = cell[0]
        server_node_id = cell[1]
        if client_node_id > server_node_id:
            client_node_id, server_node_id = server_node_id, client_node_id
        start_datetime = datetime.now().strftime(DATETIME_FORMAT)
        # TODO
        # 서로 다른 10G, 1G 그룹끼리의 network test를 해야 하는가
        network_group_list_by_cell = db.get_network_group_node_interface_intersection_list(client_node_id=client_node_id, server_node_id=server_node_id)

        node_client_info = db.get_node(node_id=client_node_id)
        node_server_info = db.get_node(node_id=server_node_id)
        for network_group_info in network_group_list_by_cell:
            dict_ = {
                "network_group_info" : network_group_info,
                "start_datetime" : start_datetime,
                "node_client_info" : node_client_info,
                "node_server_info" : node_server_info,
                "headers" : headers
            }
            common.BENCHMARK_NETWORK_LIST.append(dict_)
            #list에 값이 추가되면 thread 실행
            self.thread_sensing()

    def thread_sensing(self):
        # 진행중인 Thread 확인
        try:
            if not RunnableObjectController().is_thread_running(name=BENCHMARK_THREAD_NAME):
                th = threading.Thread(target=network_speed_check_thread, name=BENCHMARK_THREAD_NAME)
                RunnableObjectController().run_created_thread(thread=th)
        except RunnableObjectAlreadyRunningError as e:
            pass


bnm = BenchmarkNetworkManager()

#TODO 
# test 결과 파일 위치 변경
def check_ethernet_json_file():
    json_file_list = os.listdir(BENCHMARK_NETWORK_JSON_PATH.format(""))
    if json_file_list:
        json_data = None
        object_data = None
        for file_name in json_file_list:
            if "benchmark_network_test_ethernet" in file_name:
                path = BENCHMARK_NETWORK_JSON_PATH.format(file_name)
                try:
                    if ".json" in file_name:
                        with open(path, "r") as r:
                            json_data = json.load(r)
                    if ".text" in file_name:
                        with open(path, "r") as r:
                            object_data = json.load(r)
                except Exception as e:
                    traceback.print_exc()
                    os.remove(path)
        if json_data != None and object_data != None:
            try:
                if json_data["error"]:
                    error_result_insert_db(error_message=json_data["error"], value_object=BenchmarkNetworkValue(**object_data))
            except KeyError as e:
                object_data["ethernet_json_data"] = json_data
                db.insert_benchmark_node_network(**object_data)
        for file_name in json_file_list:
            if "benchmark_network_test_ethernet" in file_name:
                path = BENCHMARK_NETWORK_JSON_PATH.format(file_name)
                os.remove(path)


def network_speed_check_thread():
    try:
        check_ethernet_json_file()
    except Exception as e:
        traceback.print_exc()
        pass

    # list가 빌 때까지 thread 진행
    while len(common.BENCHMARK_NETWORK_LIST) != 0:
        q = common.BENCHMARK_NETWORK_LIST.pop(0)
        # 현재 진행중인 cell 정보 담기
        common.BENCHMARK_NETWORK_RUNNING_INFO.update({
            "client_node_id" : q["network_group_info"]["client_node_id"],
            "server_node_id" : q["network_group_info"]["server_node_id"],
            "network_group_id" : q["network_group_info"]["network_group_id"],
            "network_group_name" : q["network_group_info"]["network_group_name"]
        })
        network_speed_check(**q)
    # 초기화
    common.BENCHMARK_NETWORK_RUNNING_INFO.update({
            "client_node_id" : None,
            "server_node_id" : None,
            "network_group_id" : None,
            "network_group_name" : None
            # "is_thread_running" : False
        })
    print("benchmark network thread end")

class BenchmarkNetworkValue: # 동적 attribute 객체 
    def __init__(self, start_datetime, client_node_id, server_node_id, client_interface_name, server_interface_name, network_group_id, network_group_name, network_group_category=None):
        self.start_datetime = start_datetime
        self.client_node_id = client_node_id
        self.server_node_id = server_node_id
        self.client_interface_name = client_interface_name
        self.server_interface_name = server_interface_name
        self.network_group_id = network_group_id
        self.network_group_name = network_group_name
        self.network_group_category = network_group_category

def error_result_insert_db(error_message : str , value_object : object):
    value_object.error_message = error_message
    db.insert_benchmark_node_network(**value_object.__dict__)

def retry_get_ethernet_benchmark_result(file_name : str):
    for i in range(20):
        try:
            path = BENCHMARK_NETWORK_JSON_PATH.format(file_name)
            with open(path+".json", "r") as f:
                json_data = json.load(f)
            return json_data, path
        except json.decoder.JSONDecodeError as e:
            print("아직 test 중")
            print("{}번 재시도 중 (파일 이름 : {})".format(i, file_name))
        except FileNotFoundError as e:
            print("아직 파일 생성 안됨")
            print("{}번 재시도 중 (파일 이름 : {})".format(i, file_name))      
        except Exception as e:
            traceback.print_exc()
        finally:
            time.sleep(1)

def network_speed_check(network_group_info : dict, start_datetime : str, node_client_info : dict, node_server_info : dict, headers : dict = {}):

    try:
        bnv = BenchmarkNetworkValue(start_datetime=start_datetime, **network_group_info)

        print("TEST -------", bnv.client_node_id, bnv.server_node_id)
        if bnv.network_group_category == NETWORK_GROUP_CATEGORY_INFINIBAND:
            package_name = NETWORK_SPEED_CHECK_PACKAGE_INFINIBAND
        elif bnv.network_group_category == NETWORK_GROUP_CATEGORY_ETHERNET:
            package_name = NETWORK_SPEED_CHECK_PACKAGE_ETHERNET
        
        # server ping check
        result = common.get_worker_requests(ip=node_client_info["ip"], path="ping")
        if result["get_status"] == False:
            error_result_insert_db(error_message="{} server is dead".format(node_client_info["name"]), value_object=bnv)
            return

        # server ping check
        result = common.get_worker_requests(ip=node_server_info["ip"], path="ping")
        if result["get_status"] == False:
            error_result_insert_db(error_message="{} server is dead".format(node_server_info["name"]), value_object=bnv)
            return
            
        # client ip check
        node_client_interface_ip = common.get_worker_ip_check_by_interface(node_ip=node_client_info["ip"], interface=bnv.client_interface_name, headers=headers)
        if node_client_interface_ip == "":
            error_result_insert_db(error_message="{} interface setting error".format(node_client_info["name"]), value_object=bnv)
            return

        # server ip check 
        node_server_interface_ip = common.get_worker_ip_check_by_interface(node_ip=node_server_info["ip"], interface=bnv.server_interface_name, headers=headers)
        if node_server_interface_ip == "":
            error_result_insert_db(error_message="{} interface setting error".format(node_server_info["name"]), value_object=bnv)
            return
            
        # package check
        client_check= common.get_worker_ubuntu_package_check(node_ip=node_client_info['ip'], package_name=package_name)
        server_check= common.get_worker_ubuntu_package_check(node_ip=node_server_info['ip'], package_name=package_name)

        if not (client_check == 0 and server_check == 0):
            error_result_insert_db(error_message="network speed test package download error", value_object=bnv)
            return

        # cross ping check
        client_success = common.get_worker_ping_check_by_interface(client_ip=node_client_info["ip"], server_interface_ip=node_server_interface_ip, interface=bnv.client_interface_name, headers=headers)
        server_success = common.get_worker_ping_check_by_interface(client_ip=node_server_info["ip"], server_interface_ip=node_client_interface_ip, interface=bnv.server_interface_name, headers=headers)
        if not (client_success and server_success):
            error_result_insert_db(error_message="cross check error", value_object=bnv)
            return
            
        if bnv.network_group_category == NETWORK_GROUP_CATEGORY_INFINIBAND:
            #TODO
            #IB 연결
            server_params = {
                "kind" : BENCHMARK_NETWORK_SERVER,
                "interface" : bnv.server_interface_name
            }
            server_open_result = common.post_worker_requests(ip=node_server_info["ip"], path="perftest-running", headers=headers, params=server_params)
            client_params = {
                "kind" : BENCHMARK_NETWORK_CLIENT,
                "interface" : bnv.client_interface_name,
                "node_server_ip" : node_server_info["ip"]
            }
            client_perftest_active_result = common.post_worker_requests(ip=node_client_info["ip"], path="perftest-running", timeout=BENCHMARK_REQUEST_TIME_OUT, headers=headers, params=client_params)
            if client_perftest_active_result["get_status"]: 
                res_data = json.loads(client_perftest_active_result["result"].text)
                result = res_data["result"]
                # print(result)
                infiniband_data = {
                    "client_node_ip": node_client_interface_ip,
                    "server_node_ip" : node_server_interface_ip
                }
                try:
                    result = float(result)
                    # return with error (code 1): b" Couldn't get context for the device\n"
                    infiniband_data["bandwidth"] = result*1000*1000*1000
                    bnv.infiniband_data = infiniband_data
                except ValueError as e:
                    print(result)
                    bnv.error_message = "worker infiniband setting error"
                db.insert_benchmark_node_network(**bnv.__dict__)
            pass
        elif bnv.network_group_category == NETWORK_GROUP_CATEGORY_ETHERNET:
            # ETHERNET 연결 (1g, 10g)
            # server open
            server_params = {
                "kind" : BENCHMARK_NETWORK_SERVER,
                "interface" : bnv.server_interface_name
            }
            server_open_result = common.post_worker_requests(ip=node_server_info["ip"], path="iperf-running", headers=headers, params=server_params)
            if server_open_result["get_status"] == False:
                error_result_insert_db(error_message="{} node server error".format(node_server_info["name"]), value_object=bnv)
                return
 
            # client action
            client_params = {
                "kind" : BENCHMARK_NETWORK_CLIENT,
                "interface" : bnv.client_interface_name,
                "node_server_interface_ip" : node_server_interface_ip,
                "benchmark_network_value" : bnv.__dict__
            }
            client_iperf_active_result = common.post_worker_requests(ip=node_client_info["ip"], path="iperf-running", timeout=BENCHMARK_REQUEST_TIME_OUT, headers=headers, params=client_params)
            if client_iperf_active_result["get_status"]: 
                res_data = json.loads(client_iperf_active_result["result"].text)
                file_name = res_data["result"]
                if file_name:
                    # JSON파일 DB에 저장
                    try:
                        json_data, path = retry_get_ethernet_benchmark_result(file_name=file_name)
                        if json_data["error"]:
                            error_result_insert_db(error_message=json_data["error"], value_object=bnv)
                    except KeyError as e:
                        # 정상적으로 test 끝낸 JSON데이터
                        bnv.ethernet_json_data = json_data
                        db.insert_benchmark_node_network(**bnv.__dict__)
                    except Exception as e:
                        # None type 으로 파일을 찾지 못해서
                        error_result_insert_db(error_message="client node error", value_object=bnv)
                    finally:
                        os.remove(path+".json")
                        os.remove(path+".text")
                else:
                    error_result_insert_db(error_message="{} test system error".format(node_client_info["name"]), value_object=bnv)
                    common.get_worker_requests(ip=node_server_info["ip"], path="iperf-kill?interface_ip={}".format(node_server_interface_ip), headers=headers)
            else:
                error_result_insert_db(error_message="{} node server error".format(node_client_info["name"]), value_object=bnv)
                common.get_worker_requests(ip=node_server_info["ip"], path="iperf-kill?interface_ip={}".format(node_server_interface_ip), headers=headers)
    except KeyError as e:
        error_result_insert_db(error_message="network speed test package download error", value_object=bnv)
    except Exception as e:
        traceback.print_exc()
        error_result_insert_db(error_message=e, value_object=bnv)
        common.get_worker_requests(ip=node_server_info["ip"], path="iperf-kill?interface_ip={}".format(node_server_interface_ip), headers=headers)

def get_node_id_list() -> list:
    """
    Description: 연결된 node id만 출력

    Returns:
        list: node id list
    """
    node_list : list = db.get_node_list()

    new_node_list = []
    for node in node_list:
        node_group_list = db.get_network_group_list_by_node_id(node_id=node["id"])
        if node_group_list:
            new_node_list.append(node)

    node_id_list : list = reduce(lambda acc, cur : acc+[cur["id"]], new_node_list, [])

    return node_id_list

 

def network_speed_check_line(select_line : int, headers) -> list:
    """
    Description: line 별로 동기화

    Args:
        select_line (int): server node id
        headers (dict): 

    Returns:
        list: 동기화 실패한/이미 test중인 cell 목록
    """
    failed_list = []

    node_id_list : list = get_node_id_list()

    for id in node_id_list:
        if id != select_line:
            if bnm.is_running(cell=(id, select_line)) == False:
                bnm.list_append(cell=(id, select_line), headers=headers)
            else:
                failed_list.append({
                    "client_node_id": id,
                    "server_node_id": select_line
                })

    
    return failed_list

def network_speed_check_all(headers) -> list:
    """
    Description: 모든 cell 동기화

    Args:
        headers (dict): 

    Returns:
        list: 동기화 실패한/이미 test중인 cell 목록
    """
    failed_list = []

    node_id_list : list = get_node_id_list()

    node_id_case : list[tuple] = custom_permutations(node_id_list)

    for cell in node_id_case:
        if bnm.is_running(cell=cell) == False:
            bnm.list_append(cell=cell, headers=headers)
        else:
            failed_list.append({
                "client_node_id": cell[0],
                "server_node_id": cell[1]
            })
    return failed_list

def network_speed_check_cell(select_cell : dict, headers) -> list:
    """
    Description: cell별로 동기화 할 경우

    Args:
        select_cell (dict): 실행할 cell
        headers (dict): 

    Returns:
        list: 동기화 실패한/이미 test중인 cell 목록
    """

    failed_list = []
    client_node_id = select_cell["client_node_id"]
    server_node_id = select_cell["server_node_id"]
    if bnm.is_running(cell=(client_node_id, server_node_id)) == False:
        bnm.list_append(cell=(client_node_id, server_node_id), headers=headers)
    else:
        failed_list.append({
            "client_node_id": client_node_id,
            "server_node_id": server_node_id
        })
 
    return failed_list


@ns.route('/network-bandwidth-check', methods=['POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NetworkBandwidthCheck(CustomResource):

    @ns.expect(post_node_network_bandwidth_check)
    @token_checker
    @admin_access_check()
    def post(self):
        """
            benchmark Network Test 
            ---
            # input
            "select_cell" (dict) : 사용자가 선택한 cell
            "select_all" : (bool) 모든 cell을 선택 할 경우 default = False
            "select_line" : (int) 해당 server node의 모든 cell 동기화
            ---
            # Input example
                # 특정 cell만 동기화
                {
                    "select_cell" :
                                    {
                                        "client_node_id" : 1,
                                        "server_node_id" : 3,
                                    }
                }
                # 특정 line만 동기화
                {
                    "select_line" : 1
                }
                # 모두 동기화
                {
                    "select_all" : True
                }
            ---
            # returns
                dict (
                        status (int) : 0 = 실패, 1 = 성공 
                        # 성공 시
                        result : None 
                        # 실패 시(중복 실행 시) 
                        result (list) : 중복 실행 시 해당 cells 반환
                                        [
                                            {
                                                "client_node_id": , int
                                                "server_node_id": , int 
                                            },
                                        ],
                        message (str) : status = 0 일 때, 담기는 매세지
                        error (dict) : 중복 실행 시 추가
                                        {
                                            "code": "001",
                                            "location": "benchmark",
                                            "message": "These cells are already testing"
                                        }
                    )
            ---
            # return example
                # 성공 시
                {
                    "result": null,
                    "message": null,
                    "status": 1
                }
                # 이미 실행 중인 cell이 있을 경우(실패)
                {
                    "result": [
                        {
                            "client_node_id": 3,
                            "server_node_id": 1
                        }
                    ],
                    "message": "These cells are already testing",
                    "status": 0,
                    "error": {
                        "code": "001",
                        "location": "benchmark",
                        "message": "These cells are already testing"
                    }
                }
        """
        args = post_node_network_bandwidth_check.parse_args()
        try:
            select_cell = args["select_cell"]
            select_all = args["select_all"]
            select_line = args["select_line"]
            headers = self.get_jf_headers()
            if select_all:
                result = network_speed_check_all(headers=headers)
            else:
                if select_line:
                    result = network_speed_check_line(select_line=select_line, headers=headers)
                else:
                    result = network_speed_check_cell(select_cell=select_cell, headers=headers)
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

def custom_permutations(node_id_list : list) -> list:
    """
    Description: node id list에 해당하는 cell리스트 출력

    Args:
        node_id_list (list): node id list

    Returns:
        list: cell 목록 
    """
    result = []
    for i in node_id_list:
        for j in node_id_list:
            if j <= i :
                continue
            result.append((i,j))
    return result

# @common.check_fnc_running_time
def get_benchmark_network_latest_result_data() -> list:
    """
    Description: 각 cell들의 최신 데이터 return

    Returns:
        list: cells info
    """
    node_id_list : list = get_node_id_list()
    # TODO
    # 아무 network group에도 속하지 않은 노드 제외

    node_id_case : list[tuple] = custom_permutations(node_id_list=node_id_list)

    node_latest_network_data = []

    def setting(client_group_list : list, server_group_list : list, default_data : list, case : tuple, reversed : bool, latest_start_datetime : str) -> None:
        for cgl in client_group_list:
            for sgl in server_group_list:
                dict_ = {
                    "client_node_interface" : cgl["interface"],
                    "server_node_interface" : sgl["interface"],
                    "server_network_group_name" : sgl["name"],
                    "server_network_group_id" : sgl["id"], 
                    "client_network_group_name" : cgl["name"],
                    "client_network_group_id" : cgl["id"],
                    "bandwidth" : None,
                    "error_message" : None
                }
                if cgl["id"] != sgl["id"]:
                    default_data.append(dict_)
                    continue
                if reversed:
                    test_result = db.get_benchmark_network_by_list_client_id_and_server_id(client_node_id=case[0], server_node_id=case[1], \
                        network_group_id=sgl["id"], client_node_interface=sgl["interface"], server_node_interface=cgl["interface"], \
                            start_datetime=latest_start_datetime, all=False)
                else:
                    test_result = db.get_benchmark_network_by_list_client_id_and_server_id(client_node_id=case[0], server_node_id=case[1], \
                        network_group_id=sgl["id"], client_node_interface=cgl["interface"], server_node_interface=sgl["interface"], \
                            start_datetime=latest_start_datetime, all=False)
                if test_result:
                    # test_result = test_result[0]
                    if test_result["error_message"]:
                        dict_["error_message"] = test_result["error_message"]
                        default_data.append(dict_)
                        continue
                    if reversed:
                        dict_["bandwidth"] = test_result["receiver_bandwidth"]
                    else:
                        dict_["bandwidth"] = test_result["sender_bandwidth"]
                default_data.append(dict_)
            

    for case in node_id_case:
        dict_ = {
            "client_node_id" : case[0], 
            "server_node_id" : case[1], 
            "is_running" : CELL_STATUS_COMPLETE
        }
        reversed_dict_ = dict_.copy()
        reversed_dict_["client_node_id"], reversed_dict_["server_node_id"] = reversed_dict_["server_node_id"], reversed_dict_["client_node_id"]
        # 현재 진행중인 cell인지 확인 
        if bnm.is_running(cell=case):
            dict_["is_running"] = CELL_STATUS_SYNCHRONIZATION
            reversed_dict_["is_running"] = CELL_STATUS_SYNCHRONIZATION
        else:
            #TODO
            # 진행중과 대기중인 cell은 넘길 것인지 고민 
            # node_latest_network_data.append(dict_)
            # node_latest_network_data.append(reversed_dict_)
            # continue
            pass
        latest_start_time = db.get_benchmark_network_latest_start_time(client_node_id=case[0], server_node_id=case[1])["start_datetime"]
        dict_["start_datetime"] = latest_start_time
        reversed_dict_["start_datetime"] = latest_start_time

        server_group_list = db.get_network_group_list_by_node_id(node_id=case[1])
        client_group_list = db.get_network_group_list_by_node_id(node_id=case[0])
        dict_["network_group"] = []
        reversed_dict_["network_group"] = []
        setting(client_group_list=client_group_list, server_group_list=server_group_list, default_data=dict_["network_group"], case=case, reversed=False, latest_start_datetime=latest_start_time)
        setting(client_group_list=server_group_list, server_group_list=client_group_list, default_data=reversed_dict_["network_group"], case=case, reversed=True, latest_start_datetime=latest_start_time)
        node_latest_network_data.append(dict_)
        node_latest_network_data.append(reversed_dict_)

    return node_latest_network_data


@ns.route('/node-network-all-latest-info', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NetworkSpeedDataInfo(CustomResource):

    @token_checker
    @admin_access_check()
    def get(self):
        """
            모든 cell의 최신 network test결과 정보 
            ---
            # returns
                dict(
                        status (int) : 0 = 실패, 1 = 성공 
                        result (dict) : 
                                        [
                                            {
                                                "client_node_id" : , (int) network test를 실행하는 client node id
                                                "server_node_id" : , (int) client node로부터 ping을 받는 node id
                                                "is_running" : , (bool) 동기화 중 True , 완료 False 
                                                "start_datetime" : ,(str)
                                                "network_group"  : ,(list)[
                                                    {
                                                        "client_node_interface": , (str)
                                                        "server_node_interface": , (str)
                                                        "server_network_group_name" : , (str)
                                                        "server_network_group_id" : ,  (int)
                                                        "client_network_group_name" : , (str)
                                                        "client_network_group_id" : , (int)
                                                        "bandwidth": , (float, null)
                                                        "error_message": (str, null)
                                                    }
                                                ]
                                            },
                                        ]
                                        
                        message (str) : status = 0 일 때, 담기는 매세지
                    )
            ---
            # return example
                example :
                # 해당 Cell이 test 중이 아닐 경우  is_running = False 
                # 해당 Cell이 test 중일 경우 is_running =  True
                {
                    "result": [
                        {
                            "client_node_id": 1,
                            "server_node_id": 9,
                            "is_running": false,
                            "start_datetime": "2023-02-10 08:07:41",
                            "network_group": [
                                {
                                    "client_node_interface": "eno1",
                                    "server_node_interface": "eno1",
                                    "server_network_group_name": "1G-Ethernet",
                                    "server_network_group_id": 1,
                                    "client_network_group_name": "1G-Ethernet",
                                    "client_network_group_id": 1,
                                    "bandwidth": 942747000.0,
                                    "error_message": null
                                },
                                {
                                    "client_node_interface": "eno1",
                                    "server_node_interface": "bond0",
                                    "server_network_group_name": "10G-Ethernet",
                                    "server_network_group_id": 2,
                                    "client_network_group_name": "1G-Ethernet",
                                    "client_network_group_id": 1,
                                    "bandwidth": null,
                                    "error_message": null
                                },
                                {
                                    "client_node_interface": "eno1",
                                    "server_node_interface": "ibs9",
                                    "server_network_group_name": "Infiniband",
                                    "server_network_group_id": 3,
                                    "client_network_group_name": "1G-Ethernet",
                                    "client_network_group_id": 1,
                                    "bandwidth": null,
                                    "error_message": null
                                },
                                {
                                    "client_node_interface": "eno1",
                                    "server_node_interface": "bond0",
                                    "server_network_group_name": "test-10g",
                                    "server_network_group_id": 1674,
                                    "client_network_group_name": "1G-Ethernet",
                                    "client_network_group_id": 1,
                                    "bandwidth": null,
                                    "error_message": null
                                },
                                ...
                            ]
                        },
                        {
                            "client_node_id": 9,
                            "server_node_id": 1,
                            "is_running": false,
                            "start_datetime": "2023-02-10 08:07:41",
                            "network_group": [
                                {
                                    "client_node_interface": "eno1",
                                    "server_node_interface": "eno1",
                                    "server_network_group_name": "1G-Ethernet",
                                    "server_network_group_id": 1,
                                    "client_network_group_name": "1G-Ethernet",
                                    "client_network_group_id": 1,
                                    "bandwidth": 940678000.0,
                                    "error_message": null
                                },
                                {
                                    "client_node_interface": "eno1",
                                    "server_node_interface": "bond1",
                                    "server_network_group_name": "10G-Ethernet",
                                    "server_network_group_id": 2,
                                    "client_network_group_name": "1G-Ethernet",
                                    "client_network_group_id": 1,
                                    "bandwidth": null,
                                    "error_message": null
                                },
                                {
                                    "client_node_interface": "eno1",
                                    "server_node_interface": "ibs9",
                                    "server_network_group_name": "Infiniband",
                                    "server_network_group_id": 3,
                                    "client_network_group_name": "1G-Ethernet",
                                    "client_network_group_id": 1,
                                    "bandwidth": null,
                                    "error_message": null
                                },
                                {
                                    "client_node_interface": "eno1",
                                    "server_node_interface": "bond0",
                                    "server_network_group_name": "test-10g",
                                    "server_network_group_id": 1674,
                                    "client_network_group_name": "1G-Ethernet",
                                    "client_network_group_id": 1,
                                    "bandwidth": null,
                                    "error_message": null
                                },
                                {
                                    "client_node_interface": "eno1",
                                    "server_node_interface": "bond1",
                                    "server_network_group_name": "test-10g",
                                    "server_network_group_id": 1674,
                                    "client_network_group_name": "1G-Ethernet",
                                    "client_network_group_id": 1,
                                    "bandwidth": null,
                                    "error_message": null
                                },
                                ...
                            ]
                        }
                    ],
                    "message": null,
                    "status": 1
                }
        """
        try:
            result = get_benchmark_network_latest_result_data()
            res = response(status=1, result=result)
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            res = response(status=0, result=str(e))
            return self.send(res)


get_node_network_data_detail = api.parser()
get_node_network_data_detail.add_argument('client_node_id', type=int, required=True, location='args', help='client node id' )
get_node_network_data_detail.add_argument('server_node_id', type=int, required=True, location='args', help='server node id' )

class BandwidthOverview:

    def __init__(self):
        self.maximum_start_datetime = None
        self.minimum_start_datetime = None
        self.network_group_index = None
        self.count = 0
        self.avg_bandwidth : float = 0.0
        self.sum_bandwidth : float = 0.0
        self.maximum_bandwidth : float = 0.0
        self.minimum_bandwidth : float = sys.float_info.max
    
    def max(self, bandwidth : float, start_datetime : str):
        if self.maximum_bandwidth < bandwidth:
            self.maximum_bandwidth = bandwidth
            self.maximum_start_datetime = start_datetime

    def min(self, bandwidth : float, start_datetime : str):
        if self.minimum_bandwidth > bandwidth:
            self.minimum_bandwidth = bandwidth
            self.minimum_start_datetime = start_datetime

    def sum(self,  bandwidth : float):
        self.count += 1
        self.sum_bandwidth += bandwidth
    
    def avg(self):
        if self.count == 0 :
            self.avg_bandwidth = None
            pass
        else:
            self.avg_bandwidth = self.sum_bandwidth / self.count



def get_node_cell_detail_info(client_node_id : int, server_node_id : int) -> dict:
    """
    Description: 해당 cell에 대한 network test 기록
    """
    # 반전 여부 check
    reverse = False
    if client_node_id > server_node_id:
        client_node_id, server_node_id = server_node_id, client_node_id
        reverse = True
    # network group 목록 얻기
    network_group_list : list = db.get_cell_network_group_record_list(client_node_id=client_node_id, server_node_id=server_node_id)
    if reverse:
        for network_group in network_group_list:
            network_group["client_node_interface"], network_group["server_node_interface"] = network_group["server_node_interface"], network_group["client_node_interface"]
    
    # list 정렬 및 index 추가
    # network group id 로 정렬
    if network_group_list:
        network_group_list.sort(key=lambda d: d['id'])
    network_group_id = None
    network_group_index = 1
    for i, network_group in enumerate(network_group_list):
        if network_group_id != network_group["id"]:
            network_group_id = network_group["id"]
            if network_group_index == 2:
                network_group_list[i-1]["network_group_index"] = None
                pass
            if i == (len(network_group_list) - 1):
                network_group_index = None
            else:
                network_group_index = 1

        network_group["bandwidth_overview"] = BandwidthOverview()
        network_group["network_group_index"] = network_group_index
        if network_group_index != None:
            network_group_index += 1
    # overview를 위한 함수
    def setting(client_node_interface, server_node_interface, network_group_name, start_datetime, bandwidth) -> None:
        for network_group in network_group_list:
            if network_group["client_node_interface"] == client_node_interface and network_group["server_node_interface"] == server_node_interface and network_group["name"] == network_group_name:
                network_group["bandwidth_overview"].max(bandwidth=bandwidth, start_datetime=start_datetime)
                network_group["bandwidth_overview"].min(bandwidth=bandwidth, start_datetime=start_datetime)
                network_group["bandwidth_overview"].sum(bandwidth=bandwidth)

    def setting_index(client_node_interface, server_node_interface, network_group_name) -> int:
        for network_group in network_group_list:
            if network_group["client_node_interface"] == client_node_interface and network_group["server_node_interface"] == server_node_interface and network_group["name"] == network_group_name:
                return network_group["network_group_index"]

    test_history : list = db.get_benchmark_network_by_list_client_id_and_server_id(client_node_id=client_node_id, server_node_id=server_node_id, reversed=reverse, order_by_reversed=True)
    start_datetime : str = None
    result_dict_ = {}
    # network_group_index = 1
    # network_group_id = None
    # 반복 횟수 test_history X network_group_list
    for i, test_data in enumerate(test_history):
        network_group_index = setting_index(client_node_interface=test_data["client_node_interface"], server_node_interface=test_data["server_node_interface"], network_group_name=test_data["network_group_name"])
        if start_datetime != test_data["start_datetime"]:
            start_datetime = test_data["start_datetime"]
            result_dict_[start_datetime] = []
        dict_ = {
            "network_group_id" : test_data["network_group_id"],
            "start_datetime" : test_data["start_datetime"],
            "client_node_interface" : test_data["client_node_interface"],
            "server_node_interface" : test_data["server_node_interface"],
            "network_group_name" : test_data["network_group_name"],
            "network_group_index" : network_group_index,
            "bandwidth" : None if test_data["error_message"] else test_data["sender_bandwidth"] if reverse else test_data["receiver_bandwidth"],
            "error_message" : test_data["error_message"] if test_data["error_message"] else None
        }
        # 오류는 평균속도에서 제외
        if not test_data["error_message"]:
            setting(client_node_interface=dict_["client_node_interface"], server_node_interface=dict_["server_node_interface"], network_group_name=dict_["network_group_name"], start_datetime=start_datetime, bandwidth=dict_["bandwidth"])

        result_dict_[start_datetime].append(dict_)
    
    # bandwidth_overview object -> dict
    for i, network_group in enumerate(network_group_list):
        network_group["bandwidth_overview"].avg()
        del network_group["bandwidth_overview"].network_group_index
        del network_group["bandwidth_overview"].sum_bandwidth
        del network_group["bandwidth_overview"].count
        if network_group["bandwidth_overview"].maximum_bandwidth == 0.0:
            network_group["bandwidth_overview"].maximum_bandwidth = None
        if network_group["bandwidth_overview"].minimum_bandwidth == sys.float_info.max:
            network_group["bandwidth_overview"].minimum_bandwidth = None
        network_group["bandwidth_overview"] = network_group["bandwidth_overview"].__dict__

    return {
        "test_history" : list(result_dict_.values()),
        "network_group_list" : network_group_list
    } 


@ns.route('/node-network-cell-detail-info', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NetworkSpeedDataDetailInfo(CustomResource):

    @token_checker
    @admin_access_check()
    @ns.expect(get_node_network_data_detail)
    def get(self):
        """
            해당 cell에서 test한 기록 
            ---
            # returns
                dict(
                        status (int) : 0 = 실패, 1 = 성공 
                        result (dict) : 
                                        "test_history" : (list)
                                                    [ 
                                                        [
                                                            {
                                                                "start_datetime" : ,(str)
                                                                "client_node_interface": ,(str)
                                                                "server_node_interface": ,((str)
                                                                "network_group_name": , (str)
                                                                "bandwidth": , (float),
                                                                "error_message": (str),
                                                                "network_group_index" : (int)
                                                            },
                                                        ],
                                                    ],
                                        "network_group_list" : (list) 해당 cell이 test한 network group list [
                                            {
                                                "id": ,(int) network group id
                                                "name": ,(str) network group name,
                                                "network_group_index" : (int) network group index \ index가 하나일경우 Null,
                                                "client_node_interface": "eno1",(str)
                                                "server_node_interface": "eno1",(str)
                                                "bandwidth_overview": (dict) 최고, 최저, 평균 속도  { 
                                                    "maximum_start_datetime": "2022-12-05 06:17:12", 
                                                    "minimum_start_datetime": "2022-12-05 06:26:42",
                                                    "avg_bandwidth": 943676000.0,
                                                    "maximum_bandwidth": 943928000.0,
                                                    "minimum_bandwidth": 943424000.0
                                                }
                                            }
                                        ]

                                        
                        message (str) : status = 0 일 때, 담기는 매세지
                    )
            ---
            # return example
                example :
                {
                    "result": {
                        "test_history": [
                            [
                                {
                                    "start_datetime": "2022-12-26 00:36:17",
                                    "client_node_interface": "eno1",
                                    "server_node_interface": "eno1",
                                    "network_group_name": "1G-Ethernet",
                                    "network_group_index": null,
                                    "bandwidth": 940986000.0,
                                    "error_message": null
                                },
                                {
                                    "start_datetime": "2022-12-26 00:36:17",
                                    "client_node_interface": "bond0",
                                    "server_node_interface": "bond0",
                                    "network_group_name": "10G-Ethernet",
                                    "network_group_index": 1,
                                    "bandwidth": 9395030000.0,
                                    "error_message": null
                                },
                                {
                                    "start_datetime": "2022-12-26 00:36:17",
                                    "client_node_interface": "bond1",
                                    "server_node_interface": "bond0",
                                    "network_group_name": "10G-Ethernet",
                                    "network_group_index": 2,
                                    "bandwidth": 9374750000.0,
                                    "error_message": null
                                },
                                {
                                    "start_datetime": "2022-12-26 00:36:17",
                                    "client_node_interface": "bond3",
                                    "server_node_interface": "bond0",
                                    "network_group_name": "10G-Ethernet",
                                    "network_group_index": 3,
                                    "bandwidth": 9385770000.0,
                                    "error_message": null
                                },
                                {
                                    "start_datetime": "2022-12-26 00:36:17",
                                    "client_node_interface": "ibs9",
                                    "server_node_interface": "ibs9",
                                    "network_group_name": "Infiniband",
                                    "network_group_index": null,
                                    "bandwidth": 96556800000.0,
                                    "error_message": null
                                }
                            ],
                            [
                                {
                                    "start_datetime": "2022-12-22 00:56:34",
                                    "client_node_interface": "eno1",
                                    "server_node_interface": "eno1",
                                    "network_group_name": "1G-Ethernet",
                                    "network_group_index": null,
                                    "bandwidth": 941345000.0,
                                    "error_message": null
                                },
                                {
                                    "start_datetime": "2022-12-22 00:56:34",
                                    "client_node_interface": "bond0",
                                    "server_node_interface": "bond0",
                                    "network_group_name": "10G-Ethernet",
                                    "network_group_index": 1,
                                    "bandwidth": 9387850000.0,
                                    "error_message": null
                                },
                                {
                                    "start_datetime": "2022-12-22 00:56:34",
                                    "client_node_interface": "bond1",
                                    "server_node_interface": "bond0",
                                    "network_group_name": "10G-Ethernet",
                                    "network_group_index": 2,
                                    "bandwidth": 9403030000.0,
                                    "error_message": null
                                },
                                {
                                    "start_datetime": "2022-12-22 00:56:34",
                                    "client_node_interface": "bond3",
                                    "server_node_interface": "bond0",
                                    "network_group_name": "10G-Ethernet",
                                    "network_group_index": 3,
                                    "bandwidth": 9395410000.0,
                                    "error_message": null
                                },
                                {
                                    "start_datetime": "2022-12-22 00:56:34",
                                    "client_node_interface": "ibs9",
                                    "server_node_interface": "ibs9",
                                    "network_group_name": "Infiniband",
                                    "network_group_index": null,
                                    "bandwidth": 96566000000.0,
                                    "error_message": null
                                }
                            ]
                        ],
                        "network_group_list": [
                            {
                                "id": 1,
                                "name": "1G-Ethernet",
                                "client_node_interface": "eno1",
                                "server_node_interface": "eno1",
                                "bandwidth_overview": {
                                    "maximum_start_datetime": "2022-12-22 06:52:40",
                                    "minimum_start_datetime": "2022-12-22 03:32:26",
                                    "avg_bandwidth": 941211428.5714285,
                                    "maximum_bandwidth": 941434000.0,
                                    "minimum_bandwidth": 939965000.0
                                },
                                "network_group_index": null
                            },
                            {
                                "id": 2,
                                "name": "10G-Ethernet",
                                "client_node_interface": "bond0",
                                "server_node_interface": "bond0",
                                "bandwidth_overview": {
                                    "maximum_start_datetime": "2022-12-22 07:58:29",
                                    "minimum_start_datetime": "2022-12-22 06:52:40",
                                    "avg_bandwidth": 9360692857.142857,
                                    "maximum_bandwidth": 9406250000.0,
                                    "minimum_bandwidth": 9162820000.0
                                },
                                "network_group_index": 1
                            },
                            {
                                "id": 2,
                                "name": "10G-Ethernet",
                                "client_node_interface": "bond1",
                                "server_node_interface": "bond0",
                                "bandwidth_overview": {
                                    "maximum_start_datetime": "2022-12-22 07:58:29",
                                    "minimum_start_datetime": "2022-12-22 03:32:26",
                                    "avg_bandwidth": 9380007857.142857,
                                    "maximum_bandwidth": 9407770000.0,
                                    "minimum_bandwidth": 9168810000.0
                                },
                                "network_group_index": 2
                            },
                            {
                                "id": 2,
                                "name": "10G-Ethernet",
                                "client_node_interface": "bond3",
                                "server_node_interface": "bond0",
                                "bandwidth_overview": {
                                    "maximum_start_datetime": "2022-12-22 07:56:59",
                                    "minimum_start_datetime": "2022-12-22 07:08:59",
                                    "avg_bandwidth": 9372039285.714285,
                                    "maximum_bandwidth": 9404940000.0,
                                    "minimum_bandwidth": 9195470000.0
                                },
                                "network_group_index": 3
                            },
                            {
                                "id": 3,
                                "name": "Infiniband",
                                "client_node_interface": "ibs9",
                                "server_node_interface": "ibs9",
                                "bandwidth_overview": {
                                    "maximum_start_datetime": "2022-12-22 00:56:34",
                                    "minimum_start_datetime": "2022-12-22 07:08:59",
                                    "avg_bandwidth": 96559642857.14285,
                                    "maximum_bandwidth": 96566000000.0,
                                    "minimum_bandwidth": 96539100000.0
                                },
                                "network_group_index": null
                            }
                        ]
                    },
                    "message": null,
                    "status": 1
                }
        """
        args = get_node_network_data_detail.parse_args()
        try:
            client_node_id = args["client_node_id"]
            server_node_id = args["server_node_id"]

            result = get_node_cell_detail_info(client_node_id=client_node_id, server_node_id=server_node_id)
            if result["test_history"] == []:
                raise DataDoesNotExistError
            res = response(status=1, result=result)
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            res = response(status=0, result=str(e))
            return self.send(res)

get_detail_download_csv = api.parser()
get_detail_download_csv.add_argument('client_node_id', type=int, required=True, location='args', help='client node id' )
get_detail_download_csv.add_argument('server_node_id', type=int, required=True, location='args', help='server node id' )


# TODO
# 타임존 변경해서 CSV 내려줄 것
def change_timezone_utc_to_kst(date_string : str) -> str:
    utc_datetime = datetime.strptime(date_string, DATETIME_FORMAT)
    kst_datetime =  utc_datetime + timedelta(hours=9)
    return str(kst_datetime)


def get_cell_csv_data(client_node_id : int, server_node_id : int):

    csv_result : list = []
    node_1, node_2 = client_node_id, server_node_id
    reversed = False
    if client_node_id > server_node_id:
        client_node_id, server_node_id = server_node_id, client_node_id
        reversed = True

    test_history : list = db.get_benchmark_network_csv_list_by_client_id_and_server_id(client_node_id=client_node_id, server_node_id=server_node_id, reversed=reversed, order_by_reversed=True)
    csv_result.append(list(test_history[0].keys()))
    for cell_data in test_history:
        cell_data["start_datetime"] = change_timezone_utc_to_kst(date_string=cell_data["start_datetime"])
        csv_result.append(list(cell_data.values()))

    return common.csv_response_generator(data_list=csv_result, filename="{}-{}".format(node_1, node_2))
    
@ns.route('/node-network-cell-detail-info/csv-download', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NetworkSpeedDataCSVDownloadDetail(CustomResource):

    @ns.expect(get_detail_download_csv)
    @token_checker
    @admin_access_check()
    def get(self):
        """
            해당 cell의 network test 기록을 csv파일로 받는 api
        """
        args = get_detail_download_csv.parse_args()
        try:
            client_node_id = args["client_node_id"]
            server_node_id = args["server_node_id"]
            res = get_cell_csv_data(client_node_id=client_node_id, server_node_id=server_node_id)
            if type(res)==dict:
                return self.send(res)
            return res
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            res = response(status=0, result=str(e))
            return self.send(res)


def get_benchmark_network_latest_result_data_csv():

    node_id_list : list = get_node_id_list()

    node_id_case : list[tuple] = custom_permutations(node_id_list=node_id_list)
    
    csv_result : list = []

    for case in node_id_case:
        latest_datetime = db.get_benchmark_network_latest_start_time(client_node_id=case[0], server_node_id=case[1])
        if not latest_datetime:
            continue
        test_result = db.get_benchmark_network_csv_list_by_client_id_and_server_id(client_node_id=case[0], server_node_id=case[1], start_datetime=latest_datetime["start_datetime"])
        reverse_result = db.get_benchmark_network_csv_list_by_client_id_and_server_id(client_node_id=case[0], server_node_id=case[1], start_datetime=latest_datetime["start_datetime"], reversed=True)
        if not csv_result:
            csv_result.append(list(test_result[0].keys()))

        for result in test_result:
            result["start_datetime"] = change_timezone_utc_to_kst(date_string=result["start_datetime"])
            csv_result.append(list(result.values()))

        for result in reverse_result:
            result["start_datetime"] = change_timezone_utc_to_kst(date_string=result["start_datetime"])
            csv_result.append(list(result.values()))


    return common.csv_response_generator(data_list=csv_result, filename="all_cells")



@ns.route('/node-network-all-latest-info/csv-download', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NetworkSpeedDataCSVDownload(CustomResource):

    @token_checker
    @admin_access_check()
    def get(self):
        """
            모든 cell들의 network test 정보를 csv파일로 다운받는 api
        """
        try:
            res = get_benchmark_network_latest_result_data_csv()
            if type(res)==dict:
                return self.send(res)
            return res
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            res = response(status=0, result=str(e))
            return self.send(res)
