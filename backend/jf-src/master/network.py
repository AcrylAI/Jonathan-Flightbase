from utils.resource import CustomResource, token_checker
from utils.resource import response
from restplus import api
from utils.exceptions import *
from TYPE import *
from utils.access_check import admin_access_check
from utils import kube_network_attachment_definitions as kube_nad

import utils.db as db
import utils.common as common
import network_cni
import traceback
import requests


INTERFACE_STATUS_STABLE = 0
INTERFACE_STATUS_UNSTABLE = 1  
INTERFACE_STATUS_DANGER = 2  



# front와 주고받기위한 category dict
NETWORK_GROUP_CATEGORY_DICT = {
    NETWORK_GROUP_CATEGORY_ETHERNET : 0,
    NETWORK_GROUP_CATEGORY_INFINIBAND : 1
}

## DB PART
# def get_network_group_list():
#     pass

# def get_network_group(network_group_id):
#     pass
    

# def update_network_group(network_group_id, name, description, speed, category):
#     pass

# def delete_network_group(network_group_id):
#     pass


# def get_network_group_node_interface_by_node_id(node_id):
#     pass

# def get_network_group_node_interface_by_network_group_id(network_group_id):
#     pass


# def update_network_group_node_interface(network_group_node_interface_id, network_group_id, node_id, interface):
#     pass

# def delete_network_group_node_interface(network_group_node_interface_id):
#     pass




ns = api.namespace('networks', description='network API')

create_network_group_parser = api.parser()
create_network_group_parser.add_argument("name", required=True, type=str, location="json", help="Network Group Name")
create_network_group_parser.add_argument("description", required=False, default="", type=str, location="json", help="Network Group Description")
create_network_group_parser.add_argument("speed", required=True, type=float, location="json", help="Network Group Speed - X (Gbps)")
create_network_group_parser.add_argument("category", required=True, type=int, location="json", help="Network Group Category - Ethernet=0/Infiniband=1 ... (표준 카테고리 결정 필요)")

update_network_group_parser = api.parser()
update_network_group_parser.add_argument("network_group_id", required=True, type=int, location="json", help="Network Group id")
update_network_group_parser.add_argument("name", required=True, type=str, location="json", help="Network Group Name")
update_network_group_parser.add_argument("description", required=False, default="", type=str, location="json", help="Network Group Description")
update_network_group_parser.add_argument("speed", required=True, type=float, location="json", help="Network Group Speed - X (Gbps)")
# update_network_group_parser.add_argument("category", required=True, type=str, location="json", help="Network Group Category - Ethernet/Infiniband (표준 카테고리 결정 필요)")

delete_network_group_parser = api.parser()
delete_network_group_parser.add_argument("network_group_id_list", required=True, type=list, location="json", help="Network Group id list")

# Network Group 정의에 필요한 기본 정보
# - 

def get_network_group_max_prot_index(network_group_interface_list : list = [])-> int:
    """
    Description: network group node interface에서 사용되는 최대 port index 출력

    Args:
        network_group_interface_list (list, optional): network group node interface list. Defaults to [].

    Returns:
        int: max port index 
    """
    max_interface_port_index = 0
    for network_group_interface in network_group_interface_list:
        if max_interface_port_index < network_group_interface["port_index"]:
            max_interface_port_index = network_group_interface["port_index"]
    return max_interface_port_index

def network_group_port_index_check(network_group_id : int) -> list:
    """
    Description: network group에서 node interface port 와 container interface의 port 매칭을 통해 매칭이 되지 않는 port index를 알려준다

    Args:
        network_group_id (int): network group id 

    Returns:
        list: 매칭되지 않는 port index list / 없으면 []
    """
    # node interface list 
    node_interface_list = db.get_network_group_node_interface_list(network_group_id=network_group_id)
    # container interface list 
    container_interface_list = db.get_network_group_container_interface_list(network_group_id=network_group_id)
    # max node interface port index
    max_port_index : int = get_network_group_max_prot_index(network_group_interface_list=node_interface_list)
    list_ = [True]*(max_port_index+1)
    # print(list_)
    if len(list_) == 1:
        return []
    for container_interface in container_interface_list:
        try:
            port_index : int = container_interface["port_index"]
            list_[port_index] = False
        except IndexError as e:
            continue
    # print(list_)
    no_match_port_index = [i+1 for i, x in enumerate(list_[1:]) if x == True]
    return no_match_port_index

def create_network_group(description, name : str, speed : float, category : int):
    try:

        category = network_group_category_switch_front_to_back(category=category)

        db.insert_network_group(name=name, description=description, speed=speed, category=category)
        return response(status=1, message="OK")
    except CustomErrorList as ce:
        raise ce
    except Exception as e:
        raise e

def node_interface_list_setting(node_interface_list : list) -> list:
    """
    [
        {
            "node_name" : "Acryl05",
            "interfaces" : [
                "bond1",
                "bond2"
            ]
        },
        ...
    ]
    """
    dict_ = {}
    for node_interface in node_interface_list:
        if node_interface["node_name"] in dict_.keys():
            dict_[node_interface["node_name"]]["interfaces"].append(node_interface["interface"])
        else:
            dict_[node_interface["node_name"]] = {
                "node_name" : node_interface["node_name"],
                "interfaces" : [node_interface["interface"]]
            }
    return list(dict_.values())

def network_group_category_switch_back_to_front(network_group : dict) -> None:
    network_group["category"] = NETWORK_GROUP_CATEGORY_DICT[network_group["category"]]

# @common.check_func_running_time
def node_interface_status_check_and_switch(node_interface : dict, network_group_info : dict, node_info : dict = {}, headers : dict = {}) -> None:
    node_interface["category"] = NETWORK_GROUP_CATEGORY_DICT[node_interface["category"]]
    category = network_group_info["category"]
    network_group_id = network_group_info["id"]
    if category == None:
        return
    if category == NETWORK_GROUP_CATEGORY_INFINIBAND:
        if node_interface["category"] == NETWORK_GROUP_CATEGORY_DICT[NETWORK_GROUP_CATEGORY_INFINIBAND]:
            if not node_interface["is_virtual"]:
                if node_interface["vf_count"]:
                    node_interface["interface_status"] = INTERFACE_STATUS_STABLE # pf이면서 vf가 있을 경우
                else:
                    node_interface["interface_status"] = INTERFACE_STATUS_UNSTABLE # pf이면서 vf가 없을 경우
            else:
                node_interface["interface_status"] = INTERFACE_STATUS_DANGER # vf일 경우
        elif node_interface["category"] == NETWORK_GROUP_CATEGORY_DICT[NETWORK_GROUP_CATEGORY_ETHERNET]:
            node_interface["interface_status"] = INTERFACE_STATUS_DANGER # ethernet일 경우
    # TODO
    # 연결 확인 추가해야함
    elif category == NETWORK_GROUP_CATEGORY_ETHERNET:
        if node_interface["category"] == NETWORK_GROUP_CATEGORY_DICT[NETWORK_GROUP_CATEGORY_ETHERNET]:
            if node_interface["interface_ip"]:
                ##ping_check_by_node_id
                # if network_group_id != None and node_info["id"] != None:

                #     result =  ping_check_by_node_id(network_group_id=network_group_id, client_node_info=node_info,\
                #          client_interface = node_interface, headers=headers)
                #     if result["status"] != INTERFACE_STATUS_STABLE:
                #        node_interface["interface_status"] = result["status"]
                #        return
                #     else:
                #         node_interface["interface_status"] = INTERFACE_STATUS_STABLE
                #         return

                if node_interface["is_virtual"]:
                    node_interface["interface_status"] = INTERFACE_STATUS_UNSTABLE # vf 이면서 interface ip가 있을 경우
                else:
                    node_interface["interface_status"] = INTERFACE_STATUS_STABLE # pf이면서 interface ip가 있을 경우 
            else:
                node_interface["interface_status"] = INTERFACE_STATUS_DANGER # interface ip가 없을 경우
        elif node_interface["category"] == NETWORK_GROUP_CATEGORY_DICT[NETWORK_GROUP_CATEGORY_INFINIBAND]:
            node_interface["interface_status"] = INTERFACE_STATUS_DANGER # ethernet이 아닐 경우 

def network_group_category_switch_front_to_back(category : int) -> str:
    for k, v in NETWORK_GROUP_CATEGORY_DICT.items():
        if v == category:
            return k
    raise NetworkGroupCategoryInvalidError

def get_network_groups():
    """
    Description: network group list 정보
    """
    network_group_list : list = db.get_network_group_list()
    for network_group in network_group_list:
        # category 치환?
        network_group_category_switch_back_to_front(network_group=network_group)

        network_group["is_available"] = True
        network_group["cni_info"] : dict = {}
        # container 설정이 안되어 있을 경우
        no_match_port_index : list = network_group_port_index_check(network_group_id=network_group["id"])
        if no_match_port_index:
            network_group["is_available"] = False
        # node interface list
        # network_group_container_interfaces = get_network_group_container_interfaces(network_group_id=network_group["id"])
        node_interface_list : list = db.get_network_group_node_interface_list(network_group_id=network_group["id"])
        if not node_interface_list:
            network_group["is_available"] = False
            network_group["node_interface_list"] = []
        else:
            network_group["node_interface_list"] = node_interface_list_setting(node_interface_list=node_interface_list)
        # interface, cni 설정이 안되어 있을 경우 
        cni_info : dict = get_network_group_cni(network_group_id=network_group["id"])
        if cni_info == {} :
            network_group["is_available"] = False
            continue
        
        network_group["cni_info"].update(cni_info)

    
    return response(status=1, result=network_group_list)

def delete_network_group(network_group_id_list):
    try:
        db.delete_network_group_by_group_id(network_group_id_list=network_group_id_list, many=True)
        return response(status=1, message="OK")
    except CustomErrorList as ce:
        raise ce
    except Exception as e:
        raise e

def update_network_group(network_group_id : int, name : str, description : str, speed : float):
    try:
        db.update_network_group(network_group_id=network_group_id, name=name, description=description, speed=speed)
        return response(status=1, message="OK")
    except CustomErrorList as ce:
        raise ce
    except Exception as e:
        raise e


# Main page
@ns.route('/network-group', methods=["POST","DELETE","GET", "PUT"])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NetworkGroup(CustomResource):

    @token_checker
    @admin_access_check()
    def get(self):
        """
            network group list 출력
            ---
            # Return
                dict(
                        status (int) : 0 = 실패, 1 = 성공 
                        result (list) : [
                            {
                                "id" : (int) network group id,
                                "name" : (str) network group name,
                                "description": (str) network group description,
                                "speed" : (int) network group speed,
                                "category" : (int) Ethernet=0, Infiniband=1
                                "is_available" : (bool),  해당 네트워크 그룹 사용가능 여부 True -> 사용 가능, False 사용 불가능
                                "cni_info" : (dict)
                                    {
                                        "ip_range" : (str), ex) 100.100.0.0/16
                                        "ip_range_start" : ip_range_start(str), ex) 100.100.0.1
                                        "ip_range_end" : ip_range_end(str), ex) 100.100.255.254
                                        "gateway" : gateway(str) ex) 100.100.0.1
                                    },
                                "node_interface_list" : (list)
                                    [
                                        {
                                            "node_name" : (str),
                                            "interfaces" : (list[str])
                                        },
                                    ]
                            },
                        ]     
                        message (str) : status = 0 일 때, 담기는 매세지
                    )
            ---
            # Return example
                example :
                
        """
        try:
            res = get_network_groups()
            return self.send(res)
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Create Network Group Error : {}".format(e)))


    @ns.expect(create_network_group_parser)
    @token_checker
    @admin_access_check()
    def post(self):
        """
            network group create
            ---
            # Input
                    name (str)
                    description (str)
                    category (int)
                    speed (float)
            ---
            # Input example (Postman에서 테스트 시, Body > raw [JSON] 선택)
                    {
                        "name" : "20g-Ethernet-group",
                        "description" : "20g 그룹",
                        "category" : 0,
                        "speed" : 20.0
                    }
            ---
            # Returns example
                    # 성공 시
                    {
                        "message": "OK",
                        "status": 1
                    }
        """
        args = create_network_group_parser.parse_args()
        try:
            name = args["name"]
            description = args["description"]
            speed = args["speed"]
            category = args["category"]

            res = create_network_group(**args)
            
            kube_nad.update_network_attachment_definitions()

            return self.send(res)
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Create Network Group Error : {}".format(e)))
    
    @ns.expect(update_network_group_parser)
    @token_checker
    @admin_access_check()
    def put(self):
        """
            network group update (모달 API)
            # category는 변경할 수 없는 값이기 떄문에 input에 없습니다!
            ---
            # Input
                network_group_id (int)
                name (str)
                description (str)
                speed (float)
            ---
            # Input example (Postman에서 테스트 시, Body > raw [JSON] 선택)
                {
                    "network_group_id" : 2,
                    "name" : "20g-Ethernet-group",
                    "description" : "20g 그룹",
                    "speed" : 20.0
                }
            ---
            # Returns example
                # 성공 시
                {
                    "message": "OK",
                    "status": 1
                }
        """
        args = update_network_group_parser.parse_args()
        try:
            res = update_network_group(**args)

            kube_nad.update_network_attachment_definitions()

            return self.send(res)
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Create Network Group Error : {}".format(e))) 

    @ns.expect(delete_network_group_parser)
    @token_checker
    @admin_access_check()
    def delete(self):
        """
            network group delete
            ---
            # Input
                network_group_id_list (list[int]) # network group id를 담은 list
            ---
            # Input example (Postman에서 테스트 시, Body > raw [JSON] 선택)
                [
                    1, 3, 4
                ]
            ---
            # Returns example
                # 성공 시
                {
                    "message": "OK",`
                    "status": 1
                }
        """
        args = delete_network_group_parser.parse_args()
        try:
            res = delete_network_group(**args)

            kube_nad.update_network_attachment_definitions()

            return self.send(res)
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Create Network Group Error : {}".format(e)))


get_network_group_modal_parser = api.parser()
get_network_group_modal_parser.add_argument("network_group_id", required=True, type=int, location="args", help="Network Group id")

post_network_group_modal_parser = api.parser()
post_network_group_modal_parser.add_argument('network_group_id', type=int, required=True, location='json', help='network group id')
post_network_group_modal_parser.add_argument('node_interface', type=dict, required=True, location='json', help='delete, insert node interface data')
post_network_group_modal_parser.add_argument('cni_config', type=dict, required=True, location='json', help='update or insert cni config')
post_network_group_modal_parser.add_argument('container_interface', type=dict, required=True, location='json', help='delete, update, create container interface data')


# TODO
# 연결 상태(마운트)도 확인해야 하는가?
def get_node_list() -> list:
    node_list = db.get_node_list()
    result = []
    for node in node_list:
        ip = node["ip"]
        try:
            res = common.get_worker_requests(ip=ip, path="ping")
            if res["get_status"]:
                
                result.append({
                    "id" : node["id"],
                    "ip" : node["ip"],
                    "node_name" : node["name"]
                })
        except Exception as e:
            continue
    if result:
        result.sort(key=lambda d: d['id'])
    return result

def get_network_group_node_interfaces(network_group_id : int) -> list:
    network_group_node_interfaces : list = db.get_network_group_node_interface_list(network_group_id=network_group_id)
    if network_group_node_interfaces:
        network_group_node_interfaces.sort(key=lambda d: d['node_id'])
    return network_group_node_interfaces

def get_network_group_container_interfaces(network_group_id : int) -> dict:
    """
    Description: network group에서 설정한 container interface list 정보

    Args:
        network_group_id (int): 

    Returns:
        dict: # network_group_container_interfaces  
              # miss_match_port_index_list : node interface port index와 매칭 되지 않는 port index와 해당 port index에 속해있는 node interface list 

    """
    network_group_container_interface_list : list = db.get_network_group_container_interface_list(network_group_id=network_group_id)
    network_group_node_interface_list : list = db.get_network_group_node_interface_list(network_group_id=network_group_id)

    if network_group_container_interface_list:
        network_group_container_interface_list.sort(key=lambda d: d["port_index"])

    for network_group_container_interface in network_group_container_interface_list:
        network_group_container_interface["node_interface_list"] : list = []
        network_group_container_interface["is_deletable"] : bool = True
        # 해당 port index에 속해있는 node interface list
        for network_group_node_interface in network_group_node_interface_list:
            if network_group_container_interface["port_index"] == network_group_node_interface["port_index"]:
                network_group_container_interface["node_interface_list"].append(network_group_node_interface)
        # port index에 해당하는 node interface가 없다면 container interface 삭제 가능
        if network_group_container_interface["node_interface_list"]:
            network_group_container_interface["is_deletable"] = False

    miss_match_list : list = network_group_port_index_check(network_group_id=network_group_id)
    miss_match_port_index_list : list = []

    # 해당 port index에 속해있는 node interface list
    for port_index in miss_match_list:
        port : dict = {
            "port_index" : port_index,
            "node_interface_list" : []
        }
        for node_interface in network_group_node_interface_list:
            if port_index == node_interface["port_index"]:
                port["node_interface_list"].append(node_interface)
        miss_match_port_index_list.append(port)

    dict_ = {
        "network_group_container_interfaces" : network_group_container_interface_list,
        "miss_match_port_index_list" : miss_match_port_index_list
    }
    return dict_

def get_network_group_cni(network_group_id : int) -> dict:
    network_group_cni : dict = db.get_network_group_cni_by_network_group_id(network_group_id=network_group_id)
    dict_= {}
    if network_group_cni:
        ip_range, ip_range_start, ip_range_end, _ = network_cni.get_network_cni_config_ip_info(network_group_cni["cni_config"])
        ip_range_split = ip_range.split("/")
        dict_ = {
            "ip" : ip_range_split[0],
            "subnet_mask" : int(ip_range_split[1]),
            "ip_range_start" : ip_range_start,
            "ip_range_end" : ip_range_end
        }
    return dict_

# TODO
def network_group_info_by_network_group_id(network_group_id : int):
    node_interface_list : list = get_network_group_node_interfaces(network_group_id=network_group_id)
    network_group_node_interface : dict = {
                "node_interfaces" : node_interface_list,
                "node_list" : get_node_list()
    }
    network_group_container_interface_info : dict = get_network_group_container_interfaces(network_group_id=network_group_id)
    ip_range_dict : dict = get_network_group_cni(network_group_id=network_group_id)

    result ={
        "network_group_node_interface" : network_group_node_interface,
        "network_group_container_interface" : network_group_container_interface_info,
        "ip_range" : ip_range_dict
    }
    return  response(status=1, result=result)


# 수정 모달 정보
@ns.route('/network-group-modal', methods=['GET', 'POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NetworkGroupModal(CustomResource):

    @ns.expect(get_network_group_modal_parser)
    @token_checker
    @admin_access_check()
    def get(self):
        """
            network group modal 모든 페이지 정보 (모달 API)
            ---
            # Return
                dict(
                        status (int) : 0 = 실패, 1 = 성공 
                        result (dict) : {
                            "network_group_node_interface" (dict): {
                                "node_interfaces" : [
                                    {
                                        "id" : (int) network group node interface id,
                                        "network_group_id" : (int) 
                                        "node_id" : (int),
                                        "port_index" : (int),
                                        "interface" : (str),
                                        "node_ip" : (str),
                                        "node_name" : (str)
                                    }
                                ],
                                "node_list" : [
                                    {
                                        "id" : (int) node id,
                                        "ip" : (str),
                                        "node_name" : (str)
                                    },
                                ]
                            },
                            "network_group_container_interface" : {
                                "network_group_container_interfaces" : [
                                    {
                                        "id": (int), network_group_container_index
                                        "network_group_id": (int),
                                        "port_index": (int),
                                        "interface": (str),
                                        "node_interface_list": [
                                            {
                                                "id": (int), node interface id
                                                "network_group_id": (int),
                                                "node_id": (int),
                                                "port_index": (int),
                                                "interface": (str),
                                                "node_ip": (str),
                                                "node_name": (str)
                                            },
                                        ],
                                        "is_deletable" : (bool)
                                    },
                                ],
                                "miss_match_port_index_list" : (list[dict]) 매칭되지 않는 port index list
                                [
                                    {
                                        "port_index" : (int),
                                        "node_interface_list": [
                                                {
                                                    "id": (int), node interface id
                                                    "network_group_id": (int),
                                                    "node_id": (int),
                                                    "port_index": (int),
                                                    "interface": (str),
                                                    "node_ip": (str),
                                                    "node_name": (str)
                                                },
                                        ]
                                    }
                                ]
                            },
                            "ip_range" : (dict) {
                                "ip" : (str) "192.146.0.0",
                                "subnet_mask" : (int) 24,
                                "ip_range_start" : (str) "192.146.0.1",
                                "ip_range_end" : (str) "192.146.0.254"
                            }
                        }   
                        "message" (str) : status = 0 일 때, 담기는 매세지
                    )
            ---
            # Return example
                {
                    "result": {
                        "network_group_node_interface": {
                            "node_interfaces": [
                                {
                                    "id": 23,
                                    "network_group_id": 2,
                                    "node_id": 1,
                                    "port_index": 1,
                                    "interface": "bond1",
                                    "node_ip": "115.71.28.105",
                                    "node_name": "Acryl05"
                                },
                                {
                                    "id": 32,
                                    "network_group_id": 2,
                                    "node_id": 9,
                                    "port_index": 1,
                                    "interface": "bond0",
                                    "node_ip": "115.71.28.98",
                                    "node_name": "Acryl08"
                                }
                            ],
                            "node_list": [
                                {
                                    "id": 1,
                                    "ip": "115.71.28.105",
                                    "node_name": "Acryl05"
                                },
                                {
                                    "id": 9,
                                    "ip": "115.71.28.98",
                                    "node_name": "Acryl08"
                                }
                            ]
                        },
                        "network_group_container_interface": {
                            "network_group_container_interfaces": [
                                {
                                    "id": 1,
                                    "network_group_id": 2,
                                    "port_index": 1,
                                    "interface": "pod-eth10g",
                                    "node_interface_list": [
                                        {
                                            "id": 23,
                                            "network_group_id": 2,
                                            "node_id": 1,
                                            "port_index": 1,
                                            "interface": "bond1",
                                            "node_ip": "115.71.28.105",
                                            "node_name": "Acryl05"
                                        },
                                        {
                                            "id": 32,
                                            "network_group_id": 2,
                                            "node_id": 9,
                                            "port_index": 1,
                                            "interface": "bond0",
                                            "node_ip": "115.71.28.98",
                                            "node_name": "Acryl08"
                                        }
                                    ],
                                    "is_deletable": false
                                }
                            ],
                            "miss_match_port_index_list": []
                        },
                        "ip_range": {
                            "ip": "100.100.0.0",
                            "subnet_mask": 16
                        }
                    },
                    "message": null,
                    "status": 1
                    }
        """
        args = get_network_group_modal_parser.parse_args()
        try:
            network_group_id = args["network_group_id"]
            res = network_group_info_by_network_group_id(network_group_id=network_group_id)
            return self.send(res)
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Create Network Group Error : {}".format(e)))


# def create_network_group_node_interface(network_group_id, node_id, interface):
#     # Port Index가 자동으로 입력 ?
#     db.insert_network_group_node_interface(network_group_id=network_group_id, node_id=node_id, interface=interface)

# def update_network_group_node_interface(network_group_node_interface_id, interface):
#     pass

# def delete_network_group_node_interface(network_group_node_interface_id):
#     # 삭제 시 port index 재설정 ?
#     pass

get_network_group_node_interfaces_parser = api.parser()
get_network_group_node_interfaces_parser.add_argument("network_group_id", required=True, type=int, location="args", help="Network Group uid")

post_network_group_node_interfaces_parser = api.parser()
post_network_group_node_interfaces_parser.add_argument("network_group_id", required=True, type=int, location="json", help="Network Group id")
post_network_group_node_interfaces_parser.add_argument("node_interfaces", required=True, default=[], type=list, location="json", help="insert node interface list")
# post_network_group_node_interfaces_parser.add_argument("delete_node_interfaces", required=True, default=[], type=list, location="json", help="delete node interface list")


def create_network_group_node_interface(network_group_id : int, node_id : int, interface : str):
    try:
        db.insert_network_group_node_interface(network_group_id=network_group_id, node_id=node_id, interface=interface)
    except Exception as e:
        # duplicate error 
        raise e

def delete_network_group_node_interface(network_group_id : int, network_group_node_interface_id :int , node_id : int) -> bool:
    # delete 시 port index 재 정렬
    try:
        # 1. 삭제
        db.delete_network_group_node_interface(network_group_node_interface_id=network_group_node_interface_id)
        # db.delete_network_group_node_interface(network_group_id=network_group_id, node_id=node_id, interface=interface)
        # 2. port index 정렬
        node_interface_list = db.get_network_group_node_interface_list_for_dual_port(network_group_id=network_group_id, node_id=node_id)
        # 2-1. 해당 node로 등록된 interface가 없을 경우 생각
        if node_interface_list == []:
            return True
        index = 1
        for node_interface in node_interface_list:
            db.update_network_group_node_interface_port_index(port_index=index, network_group_node_interface_id=node_interface["id"])
            index += 1
        return True
    except Exception as e:
        traceback.print_exc()
        # raise e
        return False

def save_network_group_node_interfaces(network_group_id : int, node_interfaces : list):
    try:

        before_node_interfaces = get_network_group_node_interfaces(network_group_id=network_group_id)
        
        current_id_list = [n["id"] for n in node_interfaces]

        for node_interface in before_node_interfaces:
            id = node_interface["id"]
            if id not in current_id_list:
                delete_network_group_node_interface(network_group_id=network_group_id, network_group_node_interface_id=node_interface["id"], node_id=node_interface["node_id"])

        for node_interface in node_interfaces:
            if node_interface["id"] == -1:
                create_network_group_node_interface(network_group_id=network_group_id, node_id=node_interface["node_id"], interface=node_interface["interface"])

        return response(status = 1 , message="OK", result=True)
    except Exception as e:
        traceback.print_exc()
        raise e


@ns.route('/network-group-node-interfaces', methods=['GET', 'POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NetworkGroupNodeInterfaces(CustomResource):
    
    @ns.expect(get_network_group_node_interfaces_parser)
    @token_checker
    @admin_access_check()
    def get(self):
        """
            network group node interface 페이지 정보 (모달 API)
            ---
            # Return
                dict(
                        status (int) : 0 = 실패, 1 = 성공 
                        result (list) : [
                            {
                                "id" : (int) network group node interface id,
                                "network_group_id" : (int) 
                                "node_id" : (int),
                                "port_index" : (int),
                                "interface" : (str),
                                "node_ip" : (str),
                                "node_name" : (str)
                            }
                        ],
                        status: (int)
                        message (str) : status = 0 일 때, 담기는 매세지
                    )
            ---
            # Return example
                example :
                {
                    "result": [
                        {
                            "id": 23,
                            "network_group_id": 2,
                            "node_id": 1,
                            "port_index": 1,
                            "interface": "bond1",
                            "node_ip": "115.71.28.105",
                            "node_name": "Acryl05"
                        },
                        {
                            "id": 32,
                            "network_group_id": 2,
                            "node_id": 9,
                            "port_index": 1,
                            "interface": "bond0",
                            "node_ip": "115.71.28.98",
                            "node_name": "Acryl08"
                        }
                    ],
                    "message": null,
                    "status": 1
                }
        """
        args = get_network_group_node_interfaces_parser.parse_args()
        try:
            network_group_id = args["network_group_id"]
            network_group_node_interfaces = get_network_group_node_interfaces(network_group_id=network_group_id)
            res = {
                "node_interfaces" : network_group_node_interfaces,
                "node_list" : get_node_list()
            }
            return self.send(response(status=1, result=res))
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Get Network group node interface Error : {}".format(e)))

    @ns.expect(post_network_group_node_interfaces_parser)
    @token_checker
    @admin_access_check()
    def post(self):
        """
            network group node interface 변경 정보 저장 (모달 API)
            ---
            # Input
                network_group_id (int)
                node_interfaces (list)
            ---
            # Input example (Postman에서 테스트 시, Body > raw [JSON] 선택)
                {
                    "network_group_id" : 2,
                    "node_interfaces" : [
                        {   
                            "id" : 1
                            "node_id" : 9,
                            "interface" : "bond3"
                        },
                    ]
                }
            ---
            # Return Example
                ## 성공 시
                {
                    "result": True,
                    "message": "OK",
                    "status": 1
                }
        
        """
        args = post_network_group_node_interfaces_parser.parse_args()
        try:
            network_group_id = args["network_group_id"]
            node_interfaces = args["node_interfaces"]
            res = save_network_group_node_interfaces(**args)
            kube_nad.update_network_attachment_definitions()
            return self.send(res)
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Network group node interface update Error : {}".format(e)))


get_network_group_container_interfaces_parser = api.parser()
get_network_group_container_interfaces_parser.add_argument("network_group_id", required=True, type=int, location="args", help="Network Group id")

post_network_group_container_interfaces_parser = api.parser()
post_network_group_container_interfaces_parser.add_argument("network_group_id", required=True, type=int, location="json", help="Network Group id")
post_network_group_container_interfaces_parser.add_argument("node_interfaces", required=True, type=list, location="json", help="")

put_network_group_container_interface_parser = api.parser()
put_network_group_container_interface_parser.add_argument("id", required=True, type=int, location="json", help="Network Group Container interface id")
put_network_group_container_interface_parser.add_argument("interface", required=True, type=str, location="json", help="Change Network Group Container interface name")

delete_network_group_container_interface_parser = api.parser()
delete_network_group_container_interface_parser.add_argument("id", required=True, type=int, location="json", help="Network Group Container interface id")


def save_network_group_container_interface(network_group_id : int, node_interfaces : list =[]) -> dict:
    
    fail_dict = {
        "delete" : [],
        "update" : [],
        "insert" : []
    }
    
    before_container_interface = db.get_network_group_container_interface_list(network_group_id=network_group_id)
    # interface 중복 check를 위한 로직
    current_container_id_list = [n["id"] for n in node_interfaces]
    current_container_interface_list = [n["interface"] for n in node_interfaces]
    current_container_interface_dict = {}
    for interface in current_container_interface_list:
        if current_container_interface_dict.get(interface):
            current_container_interface_dict[interface] += 1
        else:
            current_container_interface_dict[interface] = 1

    # delete 
    """
    [
        "id" : (int) network group container interface id
    ]
    """
    for container_interface in before_container_interface:
        try:
            if container_interface["id"] not in current_container_id_list:
                network_cni.delete_network_group_container_interface(network_group_container_interface_id=container_interface["id"])
        except Exception as e:
            fail_dict["delete"].append(container_interface["id"])
        pass
    
    # update
    for container_interface in node_interfaces:
        for b_container_interface in before_container_interface:
            if container_interface["id"] == b_container_interface["id"] and container_interface["interface"] != b_container_interface["interface"]:
                try:
                    # 다른 그룹과 중복 check
                    if not network_group_container_interface_duplicate_check(interface=container_interface["interface"], network_group_id=network_group_id):
                        raise NetworkGroupContainerInterfaceDuplicateError
                    if container_interface["interface"]:
                        network_cni.update_network_group_container_interface_new(network_group_container_interface_id=container_interface["id"], \
                            interface=container_interface["interface"])
                    else:
                        raise NetworkGroupContainerInterfaceEmptyError
                except CustomErrorList as ce:
                    fail_dict["update"].append({
                        "container_interface_id" : container_interface["id"],
                        "container_interface" : container_interface["interface"],
                        "error_message" : ce.response()
                    })

    # insert
    for container_interface in node_interfaces:
        if container_interface["id"] == -1:
            try:
                is_port_index_duplicate = db.get_network_group_container_interface_port_for_check(network_group_id=network_group_id, port_index=container_interface["port_index"])
                if is_port_index_duplicate:
                    raise NetworkGroupContainerInterfacePortDuplicateError
                if not network_group_container_interface_duplicate_check(interface=container_interface["interface"], network_group_id=network_group_id):
                    raise NetworkGroupContainerInterfaceDuplicateError
                if container_interface["interface"]:
                    network_cni.create_network_group_container_interface(network_group_id=network_group_id, port_index=container_interface["port_index"], \
                        interface=container_interface["interface"])
                else:
                    raise NetworkGroupContainerInterfaceEmptyError
            except CustomErrorList as ce:
                fail_dict["insert"].append({
                    "port_index" : container_interface["port_index"],
                    "interface" : container_interface["interface"],
                    "error_message" : ce.response()
                })
    return fail_dict


@ns.route('/network-group-container-interfaces', methods=['GET', 'POST', 'DELETE', 'PUT'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NetworkGroupContainerInterfaces(CustomResource):

    @ns.expect(get_network_group_container_interfaces_parser)
    @token_checker
    @admin_access_check()
    def get(self):
        """
            network group container 페이지 정보 (모달 API)
            ---
            # Return
                dict(
                        status (int) : 0 = 실패, 1 = 성공 
                        result (dict) : {
                            "network_group_container_interfaces" : [
                                {
                                    "id": (int), network_group_container_index
                                    "network_group_id": (int),
                                    "port_index": (int),
                                    "interface": (str),
                                    "node_interface_list": [
                                        {
                                            "id": (int), node interface id
                                            "network_group_id": (int),
                                            "node_id": (int),
                                            "port_index": (int),
                                            "interface": (str),
                                            "node_ip": (str),
                                            "node_name": (str)
                                        },
                                    ],
                                    "is_deletable" : (bool)
                                }
                            ],
                            "miss_match_port_index_list" : (list[dict]) 매칭되지 않는 port index list
                            [
                                {
                                    "port_index" : (int),
                                    "node_interface_list": [
                                        {
                                            "id": (int), node interface id
                                            "network_group_id": (int),
                                            "node_id": (int),
                                            "port_index": (int),
                                            "interface": (str),
                                            "node_ip": (str),
                                            "node_name": (str)
                                        },
                                    ]
                                }
                            ]
                        }   
                        message (str) : status = 0 일 때, 담기는 매세지
                    )
            ---
            # Return example
        """
        args = get_network_group_container_interfaces_parser.parse_args()
        try:
            network_group_id = args["network_group_id"]
            res = get_network_group_container_interfaces(network_group_id=network_group_id)
            return self.send(response(status=1, result=res))
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Get network group container interface Error : {}".format(e)))

    @ns.expect(post_network_group_container_interfaces_parser)
    @token_checker
    @admin_access_check()
    def post(self):
        """
            network group container 페이지 변경 사항 저장 (모달 API)
            ---
            # Input
                network_group_id (int)
                node_interfaces (list)
            ---
            # Input example (Postman에서 테스트 시, Body > raw [JSON] 선택)
                {
                    "network_group_id" : 2,
                    "node_interfaces" : [
                        {
                            "id": 4, # network_group_container_interface_id / insert일 경우 -1
                            "interface" : "pod-infiniband200g" # 변경할 interface 명
                            "network_group_id" : 1 # insert 일 경우 -1
                            "port_index" : 1,
                        },
                    ]
                }
            ---
            # Returns
                ## 성공 시
                {
                    "result": (str),
                    "message": (str),
                    "status": (int)
                }
                ## 실패 시
                {
                    "result": { # update 실패한 목록 
                        "delete" : [421, 21], (list[int]) 
                        "update" : [{  (list[dict])
                            "container_interface_id" : (int),
                            "container_interface" : (str),
                            "error_message" : (dict)
                        }], 
                        "insert" : [{  (list[dict])
                            "port_index" : (int),
                            "interface" : (str),
                            "error_message" : (dict)
                        }] 
                    },
                    "message": (str),
                    "status": (int)
                }
            ---
            # Returns example
                ## 성공 시
                {
                    "result": "success",
                    "message": "OK",
                    "status": 1
                }
        """
        args = post_network_group_container_interfaces_parser.parse_args()
        try:
            network_group_id = args["network_group_id"]
            node_interfaces = args["node_interfaces"]
            res = save_network_group_container_interface(**args)
            if res["delete"] == [] and res["update"] == [] and res["insert"] == []:
                res = "success"
            else:
                raise Exception
            kube_nad.update_network_attachment_definitions()
            return self.send(response(status=1, result=res))
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Update Network Group container interface Error : {}".format(e), result=res))

    @ns.expect(put_network_group_container_interface_parser)
    @token_checker
    @admin_access_check()
    def put(self):
        """임시 :  network group container interface name update"""
        args = put_network_group_container_interface_parser.parse_args()
        try:
            id = args["id"]
            interface = args["interface"]
            network_cni.update_network_group_container_interface_new(network_group_container_interface_id=id, \
                interface=interface)
            kube_nad.update_network_attachment_definitions()
            return self.send(response(status=1, message="success"))
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Update Network Group container interface Error : {}".format(e)))

    @ns.expect(delete_network_group_container_interface_parser)
    @token_checker
    @admin_access_check()
    def delete(self):
        """임시 : network group container interface name delete"""
        args = delete_network_group_container_interface_parser.parse_args()
        try:
            id = args["id"]
            network_cni.delete_network_group_container_interface(network_group_container_interface_id=id)
            kube_nad.update_network_attachment_definitions()
            return self.send(response(status=1, message="success"))
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Delete Network Group container interface Error : {}".format(e)))

    

get_network_group_cni_parser = api.parser()
get_network_group_cni_parser.add_argument("network_group_id", required=True, type=int, location="args", help="Network Group id")

post_network_group_cni_parser = api.parser()
post_network_group_cni_parser.add_argument("network_group_id", required=True, type=int, location="json", help="Network Group id")
post_network_group_cni_parser.add_argument("ip_range", required=True, type=str, location="json", help="ip range")
post_network_group_cni_parser.add_argument("subnet_mask", required=True, type=int, location="json", help="subnet mask")
post_network_group_cni_parser.add_argument("ip_range_start", required=True, type=str, location="json", help="ip start 값")
post_network_group_cni_parser.add_argument("ip_range_end", required=True, type=str, location="json", help="ip end 값")


def post_network_group_cni(network_group_id : int, ip_range : str, subnet_mask : int, ip_range_start : str, ip_range_end : str) -> bool:
    # update create 확인
    cni_info : dict = db.get_network_group_cni_by_network_group_id(network_group_id=network_group_id)
    ipam_range = "/".join([ip_range, str(subnet_mask)])
    if cni_info:
        # update
        network_cni.update_network_cni(network_group_id=network_group_id, ipam_range=ipam_range, ipam_range_start=ip_range_start, ipam_range_end=ip_range_end)
    else:
        # create
        network_cni.create_network_cni(network_group_id=network_group_id, ipam_range=ipam_range, ipam_range_start=ip_range_start, ipam_range_end=ip_range_end)
    return True

@ns.route('/network-group-cni', methods=['GET', 'POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NetworkGroupCNI(CustomResource):

    @ns.expect(get_network_group_cni_parser)
    @token_checker
    @admin_access_check()
    def get(self):
        """
            network group ip 페이지 정보 (모달 API)
            ---
            # Return 
                dict(
                    status (int) : 0 = 실패, 1 = 성공 
                    result (dict) : {
                                        "ip" : (str) "192.146.0.0",
                                        "subnet_mask" : (int) 24,
                                        "ip_range_start" : (str)
                                        "ip_range_end" : (str)      
                                    },
                    message (str) : status = 0 일 때, 담기는 매세지
                )
            ---
            # Return example
                example:
                {
                    "result": {
                        "ip": "100.100.0.0",
                        "subnet_mask": 16,
                        "ip_range_start" : "100.100.0.1",
                        "ip_range_end" : "100.100.255.254"
                    },
                    "message": null,
                    "status": 1
                }
        """
        args = get_network_group_cni_parser.parse_args()
        try:
            network_group_id = args["network_group_id"]
            res = get_network_group_cni(network_group_id=network_group_id)
            return self.send(response(status=1, result=res))
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Get Network Group CNI Error : {}".format(e)))

    @ns.expect(post_network_group_cni_parser)
    @token_checker
    @admin_access_check()
    def post(self):
        """
            network group ip 생성 및 변경 (모달 API)
            ---
            # Input
                network_group_id (int)
                ip_range (str)
                subnet_mask (int)
                ip_range_start (str)
                ip_range_end (str)
            ---
            # Input example (Postman에서 테스트 시, Body > raw [JSON] 선택)
                {
                    "network_group_id" : 2
                    "ip_range" : "100.100.0.0"
                    "subnet_mask" : 16
                    "ip_range_start" : "100.100.0.1"
                    "ip_range_end" : "100.100.255.254"
                }
            ---
            # Return example
                {
                    "result": True,
                    "message": null,
                    "status": 1
                }

        """
        args = post_network_group_cni_parser.parse_args()
        try:
            res = post_network_group_cni(**args)
            kube_nad.update_network_attachment_definitions()
            return self.send(response(status=1, result=res))
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Update Network Group CNI Error : {}".format(e)))


def get_network_group_node_relationship() -> dict : 

    node_list : list = db.get_node_list()
    node_list = [{"node_id" : n["id"], "node_name": n["name"]} for n in node_list]

    network_group_list : list = db.get_network_group_list()
    # 1. network group category 분리 
    ethernet_network_group_list : list = []
    infiniband_network_group_list : list = []
    ethernet_unallocated_nodes : list = node_list.copy()
    ethernet_allocated_nodes_dict : dict = {}
    infiniband_unallocated_nodes : list = node_list.copy()
    infiniband_allocated_nodes_dict : dict = {}

    for network_group in network_group_list:
        
        belonging_nodes_dict = {}
        node_interface_list : list = db.get_network_group_node_interface_list(network_group_id=network_group["id"]) 
        if network_group["category"] == NETWORK_GROUP_CATEGORY_ETHERNET:
            # 1-1 network group에 속한 node interface 조회
            # 1-2 전체 node와 해당 그룹에 소속된 node 비교 후 소속된 node allocated에 추가
            for node_interface in node_interface_list:
                if belonging_nodes_dict.get(node_interface["node_name"]):
                    belonging_nodes_dict[node_interface["node_name"]]["is_multi_port"] = True
                else:
                    belonging_nodes_dict[node_interface["node_name"]] = {
                        "node_id" : node_interface["node_id"],
                        "node_name" : node_interface["node_name"],
                        "is_multi_port" : False
                    }
                if ethernet_allocated_nodes_dict.get(node_interface["node_name"]):
                    pass
                else:
                    ethernet_allocated_nodes_dict[node_interface["node_name"]] = {
                        "node_id":node_interface["node_id"], 
                        "node_name": node_interface["node_name"] 
                    }
                try:
                    ethernet_unallocated_nodes.remove({"node_id":node_interface["node_id"], "node_name": node_interface["node_name"]})
                except ValueError as e:
                    pass
            ethernet_network_group_list.append({
                "id" : network_group["id"],
                "network_group_name" : network_group["name"],
                "belonging_nodes" : list(belonging_nodes_dict.values())
            })
        elif network_group["category"] == NETWORK_GROUP_CATEGORY_INFINIBAND:
            for node_interface in node_interface_list:
                if belonging_nodes_dict.get(node_interface["node_name"]):
                    belonging_nodes_dict[node_interface["node_name"]]["is_multi_port"] = True
                else:
                    belonging_nodes_dict[node_interface["node_name"]] = {
                        "node_id" : node_interface["node_id"],
                        "node_name" : node_interface["node_name"],
                        "is_multi_port" : False
                    }
                if infiniband_allocated_nodes_dict.get(node_interface["node_name"]):
                    pass
                else:
                    infiniband_allocated_nodes_dict[node_interface["node_name"]] = {
                        "node_id":node_interface["node_id"], 
                        "node_name": node_interface["node_name"] 
                    }
                try:
                    infiniband_unallocated_nodes.remove({"node_id":node_interface["node_id"], "node_name": node_interface["node_name"]})
                except ValueError as e:
                    pass
            infiniband_network_group_list.append({
                "id" : network_group["id"],
                "network_group_name" : network_group["name"],
                "belonging_nodes" : list(belonging_nodes_dict.values())
            })
    return {
        "ethernet_network_group_view" : {
            "unallocated_nodes" : ethernet_unallocated_nodes,
            "allocated_nodes" : list(ethernet_allocated_nodes_dict.values()),
            "network_group_list" : ethernet_network_group_list
        },
        "infiniband_network_group_view" : {
            "unallocated_nodes" : infiniband_unallocated_nodes,
            "allocated_nodes" : list(infiniband_allocated_nodes_dict.values()),
            "network_group_list" : infiniband_network_group_list
        }
    }
    
    

@ns.route('/network-group-view', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NetworkGroupView(CustomResource):

    @token_checker
    @admin_access_check()
    def get(self):
        """
            network group view 정보
            ---
            # Return 
                dict(
                    status (int) : 0 = 실패, 1 = 성공 
                    result (dict) : {
                                        "ethernet_network_group_view" : (dict) {
                                            "unallocated_nodes" : (list[dict]) [
                                                {
                                                    "node_id" : (int),
                                                    "node_name" : (str)
                                                },
                                            ],
                                            "allocated_nodes" : (list[dict]) [
                                                {
                                                    "node_id" : (int),
                                                    "node_name" : (str),
                                                },
                                            ],
                                            "network_group_list" (list[dict]) [
                                                {
                                                    "id" : (int) network group id
                                                    "network_group_name" : (str),
                                                    "belonging_nodes" : (list[dict]) [
                                                        {
                                                            "node_id" : (int) node id
                                                            "node_name" : (str),
                                                            "is_multi_port" : (bool) # 멀티포트 확인 default : False
                                                        },
                                                    ]
                                                }
                                            ]
                                        },
                                        "infiniband_network_group_view" : (dict)
                                        
                                    },
                    message (str) : status = 0 일 때, 담기는 매세지
                )
            ---
            # Return example
                example:
                
        """
        try:
            res = get_network_group_node_relationship()
            return self.send(response(status=1, result=res))
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Get Network Group View Error : {}".format(e)))

##################################################################
# 추가 기능 


get_node_interfaces = api.parser()
get_node_interfaces.add_argument('node_id', type=int, required=True, location='args', help='node id')
get_node_interfaces.add_argument('network_group_id', type=int, required=False, default=0, location='args', help='network group id')

#TODO
#TBD
# ping_check_by_node_id를 통해 interface 상태값도 같이 표시
def get_node_interface_filter(node_id : int, headers : dict = {}, network_group_id : int = None) -> list:
    """
    Description: _description_

    Args:
        node_id (int): _description_
        headers (dict, optional): _description_. Defaults to {}.

    Returns:
        list: _description_
    """
    category = None
    if network_group_id:
        network_group_info = db.get_network_group(network_group_id=network_group_id)
    node_info = db.get_node(node_id=node_id)
    get_status, node_interface_list = common.new_get_worker_network_interfaces(ip=node_info['ip'])
    for node_interface in node_interface_list:
        node_interface_status_check_and_switch(node_interface=node_interface, network_group_info=network_group_info, node_info=node_info, headers=headers)
    return node_interface_list

@ns.route('/node-interfaces', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class WorkerInterfaceCheck(CustomResource):
    
    @ns.expect(get_node_interfaces)
    @token_checker
    @admin_access_check()
    def get(self):
        """
            선택한 node의 network interface 리스트 (모달 API)
            # 추후 추가 개발 가능 -> 해당 network group에 속할 수 있는지 test하고 결과 반영해서 return
            ---
            # returns
                dict (
                        status (int) : 0 = 실패, 1 = 성공 
                        result (list) : 
                                        [
                                            {
                                                "interface_name": , (str) interface name
                                                "interface_ip": , (str) interface ip
                                                "category" : , (int) ethernet = 0 or infiniband = 1
                                                "is_virtual" : (bool) 해당 interface가 가상으로 만들어졌는지 확인 True : 가상 인터페이스 / False : 가상 인터페이스 아님
                                                "mlx_core_name" : (str) infiniband일 경우 mlx core name 컬럼이 추가된다
                                                "interface_status" : (int) interface 상태 값 (0-사용 가능, 1-사용 가능 할 수도 있고 불가능 할 수도 있음, 2-사용 불가능)
                                            },
                                        ],
                        message (str) : status = 0 일 때, 담기는 매세지
                    )
            ---
            # Return example
                {
                    "result": [
                        {
                            "interface": "bond0",
                            "interface_ip": "192.168.10.98",
                            "category": 0,
                            "is_virtual": true,
                            "interface_status": 2
                        },
                        {
                            "interface": "docker0",
                            "interface_ip": "172.17.0.1",
                            "category": 0,
                            "is_virtual": true,
                            "interface_status": 2
                        },
                        {
                            "interface": "ibs9",
                            "interface_ip": "192.168.100.98",
                            "category": 1,
                            "is_virtual": false,
                            "mlx_core_name": "mlx5_0",
                            "vf_count": 20,
                            "interface_status": 0
                        },
                        {
                            "interface": "ibs9v0",
                            "interface_ip": "",
                            "category": 1,
                            "is_virtual": true,
                            "mlx_core_name": "mlx5_1",
                            "vf_count": -1,
                            "interface_status": 2
                        },
                        {
                            "interface": "weave",
                            "interface_ip": "10.44.0.0",
                            "category": 0,
                            "is_virtual": true,
                            "interface_status": 2
                        }
                    ],
                    "message": null,
                    "status": 1
                }
        """
        args = get_node_interfaces.parse_args()
        try:
            headers = self.get_jf_headers()
            node_id = args["node_id"]
            network_group_id = args["network_group_id"]
            res = get_node_interface_filter(node_id=node_id, headers=headers, network_group_id=network_group_id )
            return self.send(response(status=1, result=res))
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Get Node interface list : {}".format(e)))


post_ip_range = api.parser()
post_ip_range.add_argument("network_group_id", required=True, type=int, location="json", help="Network ip")
post_ip_range.add_argument("ip", required=True, type=str, location="json", help="Network ip")
post_ip_range.add_argument("subnet_mask", required=True, type=int, location="json", help="Network subnet mask")

# TODO
# ip를 변경하거나 새롭게 입력하는 경우
# 기존에 있는 ip 범위와 겹치는지 확인하는 로직 추가
def ip_range_duplicate_check(network_group_id : int, ip : str , subnet_mask  : int) -> bool:
    result = {
        "ip_range_start" : "",
        "ip_range_end" : "",
        "is_duplicate" : False
    }
    cni_by_ng = db.get_network_group_cni_by_network_group_id(network_group_id=network_group_id)
    if cni_by_ng:
        # 기존에 cni 설정을 한 network group일 경우
        ip_range, ip_range_start, ip_range_end, _ = network_cni.get_network_cni_config_ip_info(cni_config=cni_by_ng["cni_config"])
        ip_range_join = "/".join([ip, str(subnet_mask)])
        if ip_range == ip_range_join:
            # 기존 ip와 같은 경우
            result["ip_range_start"] = ip_range_start
            result["ip_range_end"] = ip_range_end
            return result

    # 기존 ip와 다르거나 새로 생성하는 경우
    range_start, range_end = network_cni.get_ip_address_range(ip_address=ip, prefix=subnet_mask)

    cni_list = db.get_network_group_cni_list()
    for cni in cni_list:
        if cni["network_group_id"] == network_group_id:
            continue
        _, ip_range_start, ip_range_end , _ = network_cni.get_network_cni_config_ip_info(cni_config=cni["cni_config"])
        print("ip : {}, subnet_mask : {}, ip_range_start : {}, ip_range_end : {}".format(ip, subnet_mask, ip_range_start, ip_range_end))
        if network_cni.is_within_ip_address(ip_address=ip, prefix=subnet_mask, start_address=ip_range_start, end_address=ip_range_end):
            result["is_duplicate"] = True
            return result
    result["ip_range_start"] = range_start
    result["ip_range_end"] = range_end
    return result
        
# 
@ns.route('/ip-range', methods=['POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NodeList(CustomResource):

    @ns.expect(post_ip_range)
    @token_checker
    @admin_access_check()
    def post(self):
        """
            사용자가 설정한 ip range 조회 (모달 API)
            ---
            # Input
                network_group_id (int)
                ip (str)
                subnet_mask (int)
            ---
            # Input example
                {
                    "network_group_id" : 2,
                    "ip" : "192.168.1.0",
                    "subnet_mask" : 24
                }
            ---
            # Return 
                dict (
                            status (int) : 0 = 실패, 1 = 성공 
                            result (dict) : {
                                                "range_start" : (str),
                                                "range_end" : (str),
                                                "is_duplicate" : (bool) # True일 경우 다른 network group ip 범위와 겹침 
                                            }
                            message (str) : status = 0 일 때, 담기는 매세지
                        )
            ---
            # Return example
                # 겹치지 않을 경우
                {
                    "status": 1,
                    "result": {
                        "range_start" : "192.168.1.1",
                        "range_end" : "192.168.1.254"
                        "is_duplicate" : False
                    },
                    "message": null
                }
                # 겹칠 경우
                {
                    "status": 1,
                    "result": {
                        "range_start" : "",
                        "range_end" : ""
                        "is_duplicate" : True
                    },
                    "message": null
                }
        """
        args = post_ip_range.parse_args()
        try:
            network_group_id = args["network_group_id"]
            ip = args["ip"]
            subnet_mask = args["subnet_mask"]
            result = ip_range_duplicate_check(network_group_id=network_group_id, ip=ip, subnet_mask=subnet_mask)
            return self.send(response(status=1, result=result))
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Check IP Range Error : {}".format(e)))
        
get_network_group_name_check = api.parser()
get_network_group_name_check.add_argument("name", required=True, type=str, location="args", help="Network Group Name")

def network_group_name_duplicate_check(name : str) -> bool:
    result = db.get_network_group_by_name(name=name)
    if result:
        return False
    return True

@ns.route('/network-group-name-duplicate', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NetworkGroupNameCheck(CustomResource):

    @ns.expect(get_network_group_name_check)
    @token_checker
    @admin_access_check()
    def get(self):
        """
            network group name 중복 확인 api (모달 API)
            ---
            # Return
                dict (
                        status (int) : 0 = 실패, 1 = 성공 
                        result (bool) :  True = 사용 가능 , False = 중복
                        message (str) : status = 0 일 때, 담기는 매세지
                    )
            ---
            # Return example
                example :
                    {
                        "status": 1,
                        "result": true,
                        "message": null
                    }

        """
        args = get_network_group_name_check.parse_args()
        try:
            name = args["name"]
            result = network_group_name_duplicate_check(name=name)
            return self.send(response(status=1, result=result))
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Check Network Group Name Duplicate Error : {}".format(e)))

get_network_group_container_interface_check = api.parser()
get_network_group_container_interface_check.add_argument("interface", required=True, type=str, location="args", help="Network Group container interface")
get_network_group_container_interface_check.add_argument("network_group_id", required=True, type=str, location="args", help="Network Group id")

def network_group_container_interface_duplicate_check(interface : str, network_group_id : int) -> bool:
    """
    Description: 다른 network group의 container interface 중복 check

    Args:
        interface (str): interface
        network_group_id (int): 자신이 속한 network group

    Returns:
        bool: Fasle -> 중복 X
              True -> 중복 O

    """
    result = db.get_network_group_container_duplicate_check(interface=interface, network_group_id=network_group_id)
    if result:
        return False
    return True

@ns.route('/network-container-interface-duplicate', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NetworkContainerInterfaceCheck(CustomResource):
    
    @ns.expect(get_network_group_container_interface_check)
    @token_checker
    @admin_access_check()
    def get(self):
        """
            container interface name 중복 확인 api (모달 API)
            ---
            # Return
                dict (
                        status (int) : 0 = 실패, 1 = 성공 
                        result (bool) :  True = 사용 가능 , False = 중복
                        message (str) : status = 0 일 때, 담기는 매세지
                    )
            ---
            # Return example
                example :
                    {
                        "status": 1,
                        "result": true,
                        "message": null
                    }
        """
        args = get_network_group_container_interface_check.parse_args()
        try:
            interface = args["interface"]
            network_group_id = args["network_group_id"]
            result = network_group_container_interface_duplicate_check(interface=interface, network_group_id=network_group_id)
            return self.send(response(status=1, result=result))
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Check Container Interface Duplicate Error : {}".format(e)))


####################################
# TBD
# network ping test
node_interface_check = api.parser()
node_interface_check.add_argument('network_group_id', type=int, required=True, location='args', help='network group id')
node_interface_check.add_argument('node_id', type=int, required=True, location='args', help='node id')
node_interface_check.add_argument('interface_ip', type=str, required=True, location='args', help='interface')


# 네트워크 그룹 아이디 + 추가할 노드 id 인터페이스 정보로 Ping check
# 듀얼포트인지 확인 
def ping_check_by_node_id(network_group_id : int, client_node_info : dict, client_interface : dict, headers : dict={}) -> dict:
    """
    Description: 해당 network group에 추가할 노드의 interface가 이미 속해있는 interface들과 ping check가 가능한지 확인

    Args:
        network_group_id (int): network group id
        node_id(int): node id
        interface_ip(str): node interface ip
        headers(dict): headers
    Returns:
        dict : 실패한 노드 interface list, 연결 상태값 
    """
    node_list_in_network_group = db.get_network_group_node_interface_list(network_group_id=network_group_id)
    status = INTERFACE_STATUS_STABLE
    is_dual_port = False
    # network group에 속한 node가 없을 경우
    if len(node_list_in_network_group) == 0:
        return {
        "failed_list" : [],
        "status" : status,
        "is_dual_prot" : False
    }
    failed_list = []
    ping_count = 0
    server_interface_ip_dict = {}
    for server_node_info in node_list_in_network_group:
        #듀얼포트일 경우 제외
        if client_node_info["id"] == server_node_info["node_id"]:
            is_dual_port = True
            continue
        ping_count +=1
        # print("server node interface : ",server_node_info["interface"])
        if server_interface_ip_dict.get(server_node_info["interface"]):
            server_interface_ip=server_interface_ip_dict[server_node_info["interface"]]
        else:
            server_interface_ip = common.get_worker_ip_check_by_interface(node_ip =server_node_info["node_ip"] , interface=server_node_info["interface"] ,headers=headers)
            server_interface_ip_dict[server_node_info["interface"]] = server_interface_ip
        client_ping = common.get_worker_ping_check_by_interface(client_ip=client_node_info["ip"], interface=client_interface["interface"], \
            server_interface_ip=server_interface_ip, headers=headers)
        server_ping = common.get_worker_ping_check_by_interface(client_ip=server_node_info["node_ip"], interface=server_node_info["interface"], \
            server_interface_ip=client_interface["interface_ip"], headers=headers)
        if client_ping == False or server_ping == False:
            # print("client {}-{}: ".format(server_interface_ip, client_interface["interface"]), client_ping)
            # print("server {}-{}: ".format(client_interface["interface_ip"], server_node_info["interface"]), server_ping)
            failed_list.append({
                "node_id" : server_node_info["node_id"],
                "node_interface" : server_node_info["interface"]
            })
    if failed_list:
        status = INTERFACE_STATUS_UNSTABLE
    #모든 노드의 인터페이스와 ping check가 실패할 경우
    if ping_count == len(failed_list):
        status = INTERFACE_STATUS_DANGER
    # 듀얼포트 확인 
    # dual_port_check = db.get_network_group_node_interface_list_for_dual_port(network_group_id=network_group_id, node_id=client_node_id)
    # if dual_port_check:
    #     is_dual_port = True    
    return {
        "failed_list" : failed_list,
        "status" : status,
        "is_dual_prot" : is_dual_port
    }

@ns.route('/node-interface-check', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class InterfaceBandwidthCheck(CustomResource):
    
    @ns.expect(node_interface_check)
    @token_checker
    @admin_access_check()
    def get(self):
        """
            network group에 해당 노드의 인터페이스가 속할 수 있는지 확인
            ---
            # returns
                dict (
                        status (int) : 0 = 실패, 1 = 성공 
                        result (dict) : 
                            failed_list : [
                                "node_id" : (int)
                                "node_interface" : (str)
                            ]
                            status : (int) 0 -> 연결가능
                                        1 -> 실패한 인터페이스가 있지만 추가는 가능
                                        2 -> 모든 인터페이스와 실패하여 위험 
                                        ,
                            is_dual_port : (bool) True -> 듀얼 포트
                                                False 
                        message (str) : status = 0 일 때, 담기는 매세지
                    )
            ---
            # Return example
                # ping check에 실패할 경우
                {
                    "status": 1,
                    "result": {
                        "failed_list": [
                            {
                                "node_id": 1,
                                "node_interface": "bond0"
                            },
                            {
                                "node_id": 1,
                                "node_interface": "bond1"
                            }
                        ],
                        "status": 2
                    },
                    "message": null
                }
        """
        args = node_interface_check.parse_args()
        try:
            network_group_id = args["network_group_id"]
            node_id = args["node_id"]
            interface_ip = args["interface_ip"]
            result = ping_check_by_node_id(**args)
            return response(status=1, result=result)
        except Exception as e:
            traceback.print_exc()
            return response(status=0, result=str(e))


get_network_group_test = api.parser()
get_network_group_test.add_argument('network_group_id', type=int, required=True, location='args', help='network group id')
#TODO

#네트워크 그룹 아이디로 ping check
def cross_ping_check_by_network_group_id(network_group_id : int, headers : dict={}) -> list:
    """
    Description: network group id에 속한 모든 node interface간 ping check

    Args:
        network_group_id (int): network group id
        headers (dict, optional): header. Defaults to {}.

    Returns:
        list: ping check에 실패한 경우 실패한 node의 정보가 담긴 list / ping check에 모두 성공할 경우 []
            [
                (
                    {
                        "node_id" : (int)
                        "node_ip" : (str)
                        "interface" : (str)
                    },
                    {
                        "node_id" : (int)
                        "node_ip" : (str)
                        "interface" : (str)
                    }
                ), ... 
            ]
    """
    # 그룹에 속해 있는 node list 불러오기
    node_list_in_network_group = db.get_network_group_node_interface_list(network_group_id=network_group_id)
    # 2개 이상일 경우에만 적용
    if len(node_list_in_network_group) <= 1:
        raise NetworkGroupCheckError
    failed_list = []
    
    for client_index, client_node_info in enumerate(node_list_in_network_group):
        for server_node_info in node_list_in_network_group[client_index:]:
            # 듀얼포트일 경우 제외
            if client_node_info["node_id"] == server_node_info["node_id"]:
                continue
            server_node_interface_ip = common.get_worker_ip_check_by_interface(node_ip=server_node_info["node_ip"], \
                interface=server_node_info["interface"], headers=headers)
            client_node_interface_ip = common.get_worker_ip_check_by_interface(node_ip=client_node_info["node_ip"], \
                interface=client_node_info["interface"], headers=headers)
            client_success = common.get_worker_ping_check_by_interface(client_ip=client_node_info["node_ip"], \
                server_interface_ip=server_node_interface_ip, interface=client_node_info["interface"], headers=headers)
            server_success = common.get_worker_ping_check_by_interface(client_ip=server_node_info["node_ip"], \
                server_interface_ip=client_node_interface_ip, interface=server_node_info["interface"], headers=headers)
            if not (client_success and server_success):
                tuple_ = ({
                "node_id" : client_node_info['node_id'],
                "node_name" : client_node_info["node_name"],
                "node_ip" : client_node_info['node_ip'],
                "interface" : client_node_info['interface']
                },{
                "node_id" : server_node_info['node_id'],
                "node_name" : server_node_info["node_name"],
                "node_ip" : server_node_info['node_ip'],
                "interface" : server_node_info['interface']  
                })
                failed_list.append(tuple(tuple_))

    return failed_list

@ns.route('/network-group-check', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NetworkGroupTest(CustomResource):

    @ns.expect(get_network_group_test)
    @token_checker
    @admin_access_check()
    def get(self):
        """
            해당 network group에 속해있는(DB에 저장되어 있는) 노드 인터페이스 간 network ping test
            ---
            # Return
                dict (
                        status (int) : 0 = 실패, 1 = 성공 
                        result (list) :[  # ping test에 실패한 경우들 없으면 []
                                (
                                    {
                                        "node_id" : (int),
                                        "node_ip" : (str),
                                        "node_name" : (str),
                                        "interface" : (str)
                                    },{
                                        "node_id" : (int),
                                        "node_ip" : (str),
                                        "node_name" : (str),
                                        "interface" : (str)
                                    }
                                )
                            ]
                            status : (int) 0 -> 연결가능
                                        1 -> 실패한 인터페이스가 있지만 추가는 가능
                                        2 -> 모든 인터페이스와 실패하여 위험 
                                        ,
                        message (str) : status = 0 일 때, 담기는 매세지
                    )
            ---
            # Return example
        
            
        """
        args = get_network_group_test.parse_args()
        try:
            network_group_id = args["network_group_id"]
            headers = self.get_jf_headers()
            result = cross_ping_check_by_network_group_id(network_group_id=network_group_id, headers=headers)
            return response(status=1, result=result)
        except CustomErrorList as ce:
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message="Network group test Error: {}".format(e)))

####################################
# network group interface 저장

# post_network_group_node_interface = api.parser()
# post_network_group_node_interface.add_argument('network_group_id', type=int, required=True, location='json', help='network group id')
# post_network_group_node_interface.add_argument('delete_node_interface_list', type=list, required=False, location='json', help='delete interface list')
# post_network_group_node_interface.add_argument('insert_node_interface_list', type=list, required=False, location='json', help='insert interface list')
# post_network_group_node_interface.add_argument('cni_config', type=dict, required=True, location='json', help='cni config')
# post_network_group_node_interface.add_argument('container_interface', type=list, required=True, location='json', help='container interface')
# put_network_group_node_interface.add_argument('insert_container_interface', type=dict, required=False, location='json', help='insert container interface')

# get_network_group_node_interface = api.parser()
# get_network_group_node_interface.add_argument('network_group_id', type=int, required=True, location='args', help='network group id')

# update_network_group_node_interface = api.parser()
# update_network_group_node_interface.add_argument('network_group_id', type=int, required=True, location='json', help='network group id')
# update_network_group_node_interface.add_argument('node_id', type=int, required=True, location='json', help='node id')
# update_network_group_node_interface.add_argument('interface', type=int, required=True, location='json', help='interface')

# delete_network_group_node_interface_parser = api.parser()
# delete_network_group_node_interface_parser.add_argument('network_group_id', type=int, required=True, location='json', help='network group id')
# delete_network_group_node_interface_parser.add_argument('node_id', type=int, required=True, location='json', help='node id')
# delete_network_group_node_interface_parser.add_argument('interface', type=str, required=True, location='json', help='node interface')




# @ns.route('/network-group-node-interface', methods=['PUT'])
# @ns.response(200, 'Success')
# @ns.response(400, 'Validation Error')
# class NetworkGroupNodeInterface(CustomResource):
    
#     @ns.expect(post_network_group_node_interface)
#     def put(self):
#         """
#             노드 인터페이스 모달 페이지 저장 api
#             ---
#             # input
#                 "network_group_id" : (int) 
#                 "node_interface" : (dict) insert, delete 할 node interface 목록
#                 "cni_config" : (dict) 사용자가 설정한 그룹 ip | 변경 사항이 없으면 기존 ip와 subnet mask
#                 "container_interface" : (list) create, delete, update 할 container interface
#             ---
#             # Input example
#                 # 특정 cell만 동기화
#                 {
#                     "network_group_id" : 2 ,
#                     "node_interface" : {
#                         "delete" : [ 
#                             { 
#                                 "node_id" : 1, 
#                                 "interface" : "bond1"
#                             },
#                             {
#                                 "node_id" : 1,
#                                 "interface" : "bond3"
#                             }
#                         ],
#                         "insert" :[
#                             {
#                                 "node_id" : 2,
#                                 "interface" : "bond1" 
#                             }
#                         ]
#                     },
#                     "cni_config" : {
#                         "ip" : "192.168.0.0", 
#                         "subnet_mask" : 24
#                     },
#                     "container_interface" : {
#                         "update" : [
#                             {   
#                                 "network_group_container_interface_id" : 1,
#                                 "port_index" : 1,
#                                 "interface" : "pod-eth10g",
#                             }
#                         ],
#                         "create" : [
#                             {
#                                 "port_index" : 2,
#                                 "interface" : "pod-eth10g2",
#                             }
#                         ],
#                         "delete" : [
#                             {   
#                                 "network_group_container_interface_id" : 6,
#                                 "port_index" : 3,
#                                 "interface" : "pod-eth10g14",
#                             }
#                         ]
#                     }
#                 }
#             ---

#         """
#         try:
#             # TODO
#             # 추가해야 할 목록
#             # 1. network group container interface 저장 
#             # 2. subnet 저장 
#             # 3. node interface 삭제 
#             args = post_network_group_node_interface.parse_args()
#             result = save_network_group_node_interface(**args)
#             return response(status=1, result=result)
#         except Exception as e:
#             traceback.print_exc()
#             return response(status=0, result=str(e))
    
    # @ns.expect(get_network_group_node_interface)
    # def get(self):
    #     try:
    #         args = get_network_group_node_interface.parse_args()
    #         result = db.get_network_group_node_interface_list(**args)
    #         return response(status=1, result=result)
    #     except Exception as e:
    #         traceback.print_exc()
    #         return response(status=0, result=str(e))

    # @ns.expect(update_network_group_node_interface)
    # def update(self):
    #     try:
    #         args = update_network_group_node_interface.parse_args()
    #         result = db.update_network_group_node_interface(**args)
    #         return response(status=1, result=result)
    #     except Exception as e:
    #         traceback.print_exc()
    #         return response(status=0, result=str(e))

    # @ns.expect(delete_network_group_node_interface_parser)
    # def delete(self):
    #     try:
    #         args = delete_network_group_node_interface_parser.parse_args()
    #         result = delete_network_group_node_interface_fnc(**args)
    #         return response(status=1, result=result)
    #     except Exception as e:
    #         traceback.print_exc()
    #         return response(status=0, result=str(e))