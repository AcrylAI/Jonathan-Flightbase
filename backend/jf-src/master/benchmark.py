import os
import json
import traceback
import threading

from datetime import datetime
from functools import reduce

from restplus import api
from TYPE import *
import utils.db as db
from utils import common
from utils.resource import response
from utils.exceptions import *
from utils.resource import CustomResource, token_checker
from utils.access_check import admin_access_check

ns = api.namespace('benchmark', description='benchmark 관련 API')

def get_node_basic_info() -> dict:
    node_list_info = db.get_node_list()
    def node_id_list_setting(acc : list , cur : dict):
        node_network_group_name_list : list = db.get_network_group_list_by_node_id(node_id=cur["id"])
        network_group_name_list = []
        if node_network_group_name_list:
            network_group_name_list = reduce(lambda acc, cur:
                  acc+[{"id" : cur["id"], "name" : cur["name"], "interface" : cur["interface"]}], node_network_group_name_list, [])
        
        acc.append({
            "id" : cur["id"],
            "ip" : cur["ip"],
            "name" : cur["name"],
            "network_group_name_list" : network_group_name_list
        })
        return acc
        
    get_network_group_list : list = db.get_network_group_list()
    not_empty_network_group_list = []
    for network_group in get_network_group_list:
        node_interface_list = db.get_network_group_node_interface_list(network_group_id=network_group["id"])
        if node_interface_list:
            not_empty_network_group_list.append(network_group)
    result = {
        "node_list" : reduce(node_id_list_setting, node_list_info, []),
        "network_group_list" : reduce(lambda acc, cur: acc+[{"id" : cur["id"], "name" : cur["name"]}], not_empty_network_group_list, []),
        "storage_list" : [{"id" : item["id"], "name" : item["logical_name"], "path" : item["physical_name"]} for item in db.get_storage_list()]
    }
    return result

@ns.route('/basic-node-info', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NodeBasicInfo(CustomResource):

    @token_checker
    @admin_access_check()
    def get(self):
        """
            모든 node의 기본 정보 및 network group list (정상 동작)
            ---
            # returns
                dict(
                        result (list) : "node_info" : (list)
                                                    [                        
                                                        {
                                                            "id": , (int) 해당 node id
                                                            "ip": ,  (str) 해당 node의 기본 ip 
                                                            "name": , (str) 해당 node의 server name
                                                            "network_group_name_list" (list) 해당 node가 속해있는 network group name list
                                                                
                                                        }
                                                    ]
                                        "network_group_list" : (list)
                                                    [
                                                        {
                                                            "id": ,(int) network group id
                                                            "name": ,(str) network group name
                                                            "interface": (str) network interface name
                                                        }
                                                    ]
                        message (str) : status = 0 일 때, 담기는 매세지
                        status (int) : 0 = 실패, 1 = 성공 
                    )
            ---
            # returns example :
                example :
                {
                    "result": {
                        "node_list": [
                            {
                                "id": 1,
                                "ip": "115.71.28.105",
                                "name": "Acryl05",
                                "network_group_name_list": [
                                    {
                                        "id": 1,
                                        "name": "1G-Ethernet",
                                        "interface": "eno1"
                                    },
                                    {
                                        "id": 2,
                                        "name": "10G-Ethernet",
                                        "interface": "bond0"
                                    },
                                    {
                                        "id": 2,
                                        "name": "10G-Ethernet",
                                        "interface": "bond1"
                                    },
                                    {
                                        "id": 2,
                                        "name": "10G-Ethernet",
                                        "interface": "bond2"
                                    }
                                ]
                            },
                            {
                                "id": 2,
                                "ip": "115.71.28.106",
                                "name": "Acryl06",
                                "network_group_name_list": [
                                    {
                                        "id": 1,
                                        "name": "1G-Ethernet",
                                        "interface": "eno1"
                                    },
                                    {
                                        "id": 2,
                                        "name": "10G-Ethernet",
                                        "interface": "bond1"
                                    },
                                    {
                                        "id": 2,
                                        "name": "10G-Ethernet",
                                        "interface": "bond3"
                                    }
                                ]
                            }
                        ],
                        "network_group_list": [
                            {
                                "id": 1,
                                "name": "1G-Ethernet"
                            },
                            {
                                "id": 2,
                                "name": "10G-Ethernet"
                            },
                            {
                                "id": 3,
                                "name": "Infiniband"
                            }
                        ],
                        "storage_list": []
                    },
                    "message": null,
                    "status": 1
                }
        """
        try:
            result = get_node_basic_info()
            res = response(status=1, result=result)
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            res = response(status=0, result=str(e))
            return self.send(res)