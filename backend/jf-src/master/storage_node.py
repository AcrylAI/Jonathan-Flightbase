from utils.resource import CustomResource, token_checker
import requests
import json
import time
import traceback
import subprocess
from nodes import get_node_network_interface
from collections import deque
import re

from restplus import api
from utils import common, kube
from utils.resource import response
from settings import CPU_POD_RUN_ON_ONLY_CPU_NODES, CPU_NODES, NO_USE_NODES, JF_WORKER_PORT, NODE_DB_IP_AUTO_CHAGE_TO_KUBER_INTERNAL_IP, FILESYSTEM_OPTION
from TYPE import *
import utils.storage

JF_WORKER_PORT = common.get_args().jf_worker_port if common.get_args().jf_worker_port is not None else JF_WORKER_PORT

divide_by = float(1<<30)
node_list = []
ns = api.namespace('storage_node', description='스토리지 노드 관련 API')

node_parser_get = api.parser()
node_parser_get.add_argument('node_ip', type=str, required=True, default="err",location='args', help='node ip to add' )

# 향후 제거
node_add_parser = api.parser()
node_add_parser.add_argument('node_ip', type=str, required=True, default="err",location='args', help='node ip to add' )
node_add_parser.add_argument('mountpoint', type=str, required=True, default="/",location='args', help='mountpoint to add' )
#

storage_node_add_parser = api.parser()
storage_node_add_parser.add_argument('node_ip', type=str, required=True, default="err",location='json', help='node ip to add' )
storage_node_add_parser.add_argument('mountpoint', type=str, required=True, default="/",location='json', help='mountpoint to add' )

node_resource_info_get = api.parser()
node_resource_info_get.add_argument('resource_type', type=str, required=True, location='args', help='storage | io' )

nodes = {}
storage_history = deque()

partition_type_info = {}
ip_addr  = subprocess.check_output("hostname -I | awk '{print $1}'",shell=True).decode('ascii').rstrip()

res_nodes = ""

""" 스토리지 사용 정보를 불러와 json 파일에 출력함
"""
def write_storage_io_history_data():
    try:
        res = json.loads(common.launch_on_host("mfs_util get_status")[0])
        storage_history.append({"storage": {"total": round(float(res["total"]) / (1 << 30), 2),
                                            "used": round(float(res["used"]) / (1 << 30), 2),
                                            "free": round((float(res["total"]) - float(res["used"])) / (1 << 30), 2),
                                            "percent": round((float(res["used"]) / float(res["total"])) * 100, 2),
                                            "io_read": round(float(res["read"]) / (1 << 20), 2),
                                            "io_write": round(float(res["write"]) / (1 << 20), 2)},
                                            "timestamp": int(time.time())
                                })
    except:
        storage_usage = get_total_storage_usage(mnt_flg=0)
        try:
            res = json.loads(common.launch_on_host("mfs_util get_iostat")[0].rstrip())
        except:
            res = [0,0]
        storage_history.append({"storage": {"total": storage_usage["total"],
                                            "used": storage_usage["used"],
                                            "free": storage_usage["total"] - storage_usage["used"],
                                            "percent": round((float(storage_usage["used"]) / float(storage_usage["total"])) * 100, 2),
                                            "io_read": round((res[0]/1000),2),
                                            "io_write": round((res[1]/1000),2)},
                                            "timestamp": int(time.time())
                                })
    jsonString = json.dumps(list(storage_history))
    jsonFile = open("storage_history_data.json", "w")
    jsonFile.write(jsonString)
    jsonFile.close()
    if len(storage_history) == 300:
        write_storage_io_history_data()
        storage_history.popleft()

def get_total_storage_usage(option=1, mnt_flg = 1):
    if(option == 1):
        try:
            ws_mnt_stat = json.loads(common.launch_on_host("mfs_util get_workspace_mnt_stat")[0])[0]
            if 'T' in ws_mnt_stat[1]:
                total = float(re.sub('[^\d|\.]', '', ws_mnt_stat[1])) * 1000
            else:
                total = float(re.sub('[^\d|\.]', '', ws_mnt_stat[1]))
            if 'T' in ws_mnt_stat[2]:
                used = float(re.sub('[^\d|\.]', '', ws_mnt_stat[2])) * 1000
            else:
                used = float(re.sub('[^\d|\.]', '', ws_mnt_stat[2]))
            if total != 0 and mnt_flg != 1:
                return {'total': round(total), 'used': round(used)}
        except:
            pass
        try:
            df_result = subprocess.check_output("df | grep ^/dev/", shell=True)
            ret = list(filter(None, df_result.decode('utf-8').split(' ')))
            return {'total':round(int(ret[1])/(1024*1024)),'used':round(int(ret[2])/(1024*1024))}
        except Exception as e:
            traceback.print_exc()
            return {'total':0,'used':0}
    else:
        total = sto.get_total_disk_size()
        used = sto.get_used_disk_size()
        return {'total':dec_round(total,2),'used':dec_round(used,2)}
    return {'total':0,'used':0}

def storage_node_status(type):
    res= json.loads(common.launch_on_host("mfs_util get_status")[0])
    if type == 'io':
        return {"io":{"read":res["read"],"write":res["write"]}}
    elif type == 'storage':
        return {"storage": {"total": round(int(res["total"])/divide_by,2) , "used": round(int(res["used"])/divide_by,2)}}
    else:
        return {"invalid":0}

def get_storage_node_hostname(node_ip):
    try:
        url = "http://" + node_ip + ":6000/worker/device_info"
        r = requests.get(url=url)
        node_name = r.json()["result"]["system_info"]["node_name"]
        return {"result": node_name}
    except:
        return {"result": node_ip}

def get_storage_node_device_info(node_ip):
    try:
        url = "http://" + node_ip + ":6000/worker/device_info"
        r = requests.get(url=url)
        return r.json()
    except:
        return {"result":"err"}

def get_storage_node_integrated_info(ip):
    try:
        if ip in nodes:
            return response(status=1, result=nodes[ip])
        integrated_result = {
            "network_interfaces": [], #get_node_network_interface(ip)["result"],
            "device_info": get_storage_node_device_info(ip)["result"]
        }
        if get_node_network_interface(ip)["result"] is None or get_storage_node_device_info(ip)["result"] is None:
            return response(status=0, result=integrated_result, message="Get node info error : check node ip or worker status or worker version.")
        nodes[ip] = integrated_result
        return response(status=1, result=integrated_result)
    except Exception as e :
        traceback.print_exc()
        return response(status=0, result=integrated_result, message="Get node info error {}".format(str(e)))

def add_storage_node(mountpoint : str, node_ip: str, master_ip : str, headers):
    url = "http://" + node_ip + ":6000/worker/mfs_mount_and_set_master"
    parameters = {'mountpoint': mountpoint, "master": master_ip}
    r = requests.get(url=url, params=parameters, headers= headers)
    data = r.json()
    return data

def add_storage_node_nmt(mountpoint : str, node_ip: str, master_ip : str, headers):
    url = "http://" + node_ip + ":6000/worker/mfs_mount_nmt_and_set_master"
    parameters = {'mountpoint': mountpoint, "master": master_ip}
    r = requests.get(url=url, params=parameters,headers= headers)
    data = r.json()
    return data

def get_nodes(): #TODO 재작성/정리
    current_st = utils.storage.workspace_storage_type
    try:
        if current_st == 2: # 로컬 스토리지
            toReturn = []
            toAdd = {}
            temp_partition_info = []
            temp_condition_info = {}
            toAdd["id"] = 0
            output = get_storage_node_integrated_info(ip_addr)["result"]
            toAdd["node_name"] = output["device_info"]["system_info"]["node_name"]
            toAdd["ip"] = ip_addr # /jfbcore 말고 /jfbcore/jf-data 가 다른 mount인 경우에 대한 고려 필요
            toAdd["network"] = ""
            toAdd["system_info"] = output["device_info"]["system_info"]
            if not "GB" in str(toAdd["system_info"]["ram"]):
                ram_value = round(float(toAdd["system_info"]["ram"]) / float(1 << 20), 2)
                toAdd["system_info"]["ram"] = str(ram_value) + "GB"
            storage_usage = get_total_storage_usage()
            temp_partition_info.append(
                {"mountpoint": "/jfbcore", "fstype": "ext4", "total": storage_usage["total"],
                 "used": storage_usage["used"],
                 "free": round(float(storage_usage["total"]) - float(storage_usage["used"]), 2),
                 "percent": round((float(storage_usage["used"]) / float(storage_usage["total"])) * 100, 2)})
            temp_condition_info["status"] = "attached"
            temp_condition_info["reason"] = ""
            temp_condition_info["is_master"] = True
            toAdd["partition_info"] = temp_partition_info
            toAdd["condition"] = temp_condition_info
            toReturn.append(toAdd)
            return toReturn
        try: # MFS
            f = json.load(open('node_data.json', ))
            res = f[1]
            print(f[0])
            if (f[0] + 1 >= 5):
                raise ValueError('reset')
            jsonFile = open("node_data.json", "w")
            jsonFile.write(json.dumps([f[0] + 1, res]))
            jsonFile.close()
        except:
            res_nodes = common.launch_on_host("mfs_util get_partition")[0]
            res = json.loads(res_nodes)
            jsonFile = open("node_data.json", "w")
            jsonFile.write(json.dumps([0, res]))
            jsonFile.close()
        toReturn = []
        count = 0
        for key, value in res.items():
            toAdd = {}
            output = get_storage_node_integrated_info(key)["result"]
            toAdd["id"] = count
            if type(output["device_info"]) is str:
                if not output["device_info"] == "err":
                    output["device_info"] = json.loads(output["device_info"])
                else:
                    output = {"device_info":
                        {"system_info":
                            {
                                "os": "",
                                "cpu": "",
                                "cpu_cores": "",
                                "ram": "0GB",
                                "node_name": "",
                                "driver_version": ""
                            }
                        }
                    }
            toAdd["node_name"] = output["device_info"]["system_info"]["node_name"]
            toAdd["ip"] = key
            toAdd["network"] = ""
            toAdd["system_info"] = output["device_info"]["system_info"]
            if not "GB" in str(toAdd["system_info"]["ram"]):
                ram_value = round(float(toAdd["system_info"]["ram"]) / float(1 << 20), 2)
                toAdd["system_info"]["ram"] = str(ram_value) + "GB"
            toAdd["condition"] = ""
            temp_partition_info = []
            temp_condition_info = {}
            fuse_val = 0
            for partition in value:
                if partition["partition"] not in partition_type_info:
                    try:
                        res = common.launch_on_host(cmd="mfs_util get_partition_type " + partition["partition"],
                                                    host=key)[0].rstrip()
                    except:
                        res = "ext4"
                    partition_type_info[partition["partition"]] = res
                else:
                    res = partition_type_info[partition["partition"]]
                print(res)
                if "no error" in partition["status"] and fuse_val == 0:
                    temp_condition_info["status"] = "attached"
                    temp_condition_info["reason"] = partition["status"]
                    temp_condition_info["is_master"] = False
                if not ("no error" in partition["status"]):
                    fuse_val = 1
                    temp_condition_info["status"] = "error"
                    temp_condition_info["reason"] = partition["status"]
                    temp_condition_info["is_master"] = False
                temp_partition_info.append({"mountpoint": partition["partition"], "fstype": res,
                                            "total": round(float(partition["total"]), 2),
                                            "used": round(float(partition["used"]), 2),
                                            "free": round(float(partition["total"]) - float(partition["used"]), 2),
                                            "percent": round(
                                                (float(partition["used"]) / float(partition["total"])) * 100, 2)})
            toAdd["partition_info"] = temp_partition_info
            toAdd["condition"] = temp_condition_info
            count = count + 1
            toReturn.append(toAdd)
        return toReturn
    except Exception as e:
        traceback.print_exc()
        print(e)
        toReturn = []
        toAdd = {}
        toAdd["id"] = 0
        temp_partition_info = []
        temp_condition_info = {}
        ws_mnt_stat = json.loads(common.launch_on_host("mfs_util get_workspace_mnt_stat")[0])[0]
        if 'T' in ws_mnt_stat[1]:
            total = float(re.sub('[^\d|\.]', '', ws_mnt_stat[1])) * 1000
        else:
            total = float(re.sub('[^\d|\.]', '', ws_mnt_stat[1]))
        if 'T' in ws_mnt_stat[2]:
            used = float(re.sub('[^\d|\.]', '', ws_mnt_stat[2])) * 1000
        else:
            used = float(re.sub('[^\d|\.]', '', ws_mnt_stat[2]))
        node_name = get_storage_node_hostname(ws_mnt_stat[0])['result']
        if node_name == ws_mnt_stat[0]: # Remote NFS
            temp_partition_info.append({
                "mountpoint": "/jfbcore", "fstype": "nfs",
                "total": total,
                "used": used,
                "free": round(total-used),
                "percent": float(re.sub('[^\d|\.]', '', ws_mnt_stat[3]))
            })
            toAdd["node_name"] = "Network Storage"
            toAdd["network"] = ""
            toAdd["ip"] = ws_mnt_stat[0]
            toAdd["system_info"] = {
                "os": "UNIX/UNIX-Like",
                "cpu": "",
                "cpu_cores": "",
                "ram": "",
                "node_name": "",
                "driver_version": ""
            }
            temp_condition_info["status"] = "attached"
            temp_condition_info["reason"] = ""
            temp_condition_info["is_master"] = False
        else: # Local NFS
            output = get_storage_node_integrated_info(ip_addr)["result"]
            toAdd["node_name"] = output["device_info"]["system_info"]["node_name"]
            toAdd["network"] = ""
            toAdd["system_info"] = output["device_info"]["system_info"]
            if not "GB" in str(toAdd["system_info"]["ram"]):
                ram_value = round(float(toAdd["system_info"]["ram"]) / float(1 << 20), 2)
                toAdd["system_info"]["ram"] = str(ram_value) + "GB"
            storage_usage = get_total_storage_usage()
            temp_partition_info.append(
                {"mountpoint": "/jfbcore", "fstype": "nfs", "total": storage_usage["total"],
                 "used": storage_usage["used"],
                 "free": round(float(storage_usage["total"]) - float(storage_usage["used"]), 2),
                 "percent": round((float(storage_usage["used"]) / float(storage_usage["total"])) * 100, 2)})
            temp_condition_info["status"] = "attached"
            temp_condition_info["reason"] = ""
            temp_condition_info["is_master"] = True
        toAdd["partition_info"] = temp_partition_info
        toAdd["condition"] = temp_condition_info
        toReturn.append(toAdd)
        return toReturn

# 노드 추가시 사용 가능한 파티션 정보 불러옴
@ns.route('/get_avail_partitions', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class get_partitions(CustomResource):
    @ns.expect(node_parser_get)
    def get(self):
        #print(common.launch_on_host("mfs_util get_ip")[0].rstrip())
        args = node_parser_get.parse_args()
        url = "http://" + args["node_ip"] + ":6000/worker/list_partitions"
        parameters = {'token':"yVefwSX0Ca"}
        r = requests.get(url = url, params = parameters)
        data = json.loads(r.json()["result"][0])
        toReturn = []
        for partition in data:
            if "kubelet" in partition["mountpoint"]:
                continue
            toReturn.append(
                {
                    "name": partition["name"],
                    "mountpoint": partition["mountpoint"],
                    "fstype": partition["fstype"],
                    "total": round((float(partition["total"])/divide_by),2),
                    "used": round((float(partition["used"])/divide_by),2),
                    "free": round((float(partition["free"])/divide_by),2),
                    "percent": partition["percent"],
                }
            )
        res = response(status=1, result=toReturn, message="노트 파티션 정보")
        return self.send(res)

# 노드 추가
@ns.route('/add_storage_node', methods=['POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class add_storage_node(CustomResource):
    @token_checker
    @ns.expect(storage_node_add_parser)
    def post(self):
        flag, res = self.is_root()
        if not flag:
            return res
        args = storage_node_add_parser.parse_args()
        #master_ip = common.launch_on_host("mfs_util get_ip")[0].rstrip() # TODO 임시 조치 향후 개선 필요
        master_ip = ip_addr
        mountpoint = args["mountpoint"]
        url = "http://" + args["node_ip"] + ":6000/worker/list_partitions"
        parameters = {'token': "yVefwSX0Ca"}
        r = requests.get(url=url, params=parameters)
        data = json.loads(r.json()["result"][0])
        partition_info = []
        for partition in data: # TODO 임시 조치 향후 개선 필요
            if "kubelet" in partition["mountpoint"]:
                continue
            partition_info.append(
                {
                    "name": partition["name"],
                    "mountpoint": partition["mountpoint"],
                    "fstype": partition["fstype"],
                    "total": round((float(partition["total"]) / divide_by), 2),
                    "used": round((float(partition["used"]) / divide_by), 2),
                    "free": round((float(partition["free"]) / divide_by), 2),
                    "percent": partition["percent"],
                }
            )
        for partiton in partition_info:
            if(mountpoint == partiton["mountpoint"]):
                if(int(partiton["percent"][:-1]) < 5):
                    data = add_storage_node(mountpoint=mountpoint,node_ip=args["node_ip"],master_ip=master_ip, headers=self.get_jf_headers())
                else:
                    data = add_storage_node_nmt(mountpoint=mountpoint, node_ip=args["node_ip"], master_ip=master_ip, headers= self.get_jf_headers())
                res = response(status=1, result=data)
                return self.send(res)
        res = response(status=0, result="err")
        return self.send(res)

@ns.route('/storage_usage_status_by_node', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class getStoragePerNode(CustomResource):
    # @token_checker
    def get(self):
        try:
            res= json.loads(common.launch_on_host("mfs_util list_chunk")[0])
            result = {}
            for key, value in res.items():
                if(key == "total"):
                    continue
                try:
                    result[key] = {
                        "total": round((value[1] / divide_by), 2),
                        "used": round((value[0]/divide_by),2),
                        "usage_rate": round((value[0]/value[1])*100,2),
                        "error": round(value[2],2)
                    }
                except:
                    result[key] = {
                        "total": 0,
                        "used": 0,
                        "usage_rate": 0,
                        "error": 0
                    }
        except:
            result = {}
            storage_stat = get_total_storage_usage()
            try:
                ws_mnt_stat = json.loads(common.launch_on_host("mfs_util get_workspace_mnt_stat")[0])[0]
                if 'T' in ws_mnt_stat[1]:
                    total = float(re.sub('[^\d|\.]', '', ws_mnt_stat[1])) * 1000
                else:
                    total = float(re.sub('[^\d|\.]', '', ws_mnt_stat[1]))
                if 'T' in ws_mnt_stat[2]:
                    used = float(re.sub('[^\d|\.]', '', ws_mnt_stat[2])) * 1000
                else:
                    used = float(re.sub('[^\d|\.]', '', ws_mnt_stat[2]))
                node_name = "*" + ws_mnt_stat[0] # NFS인 경우 표시
                result[node_name] = {
                    "total": total,
                    "used": used,
                    "usage_rate": float(re.sub('[^\d|\.]','', ws_mnt_stat[3])),
                    "error": 0
                }
            except:
                pass
            result[ip_addr] = {
                "total": storage_stat["total"],
                "used": storage_stat["used"],
                "usage_rate": round((storage_stat["used"] / storage_stat["total"]) * 100, 2),
                "error": 0
            }
        toReturn = dict()
        for key,value in result.items():
            if key.startswith("*"): # Remote NFS 마운트 된 경우 NFS 마운트만 표시
                toReturn.clear() # return할 dictionary 초기화
                key = key[1:] # * 제거
                node_name = get_storage_node_hostname(key)['result'] # JF-Worker가 없는 경우 이 함수는 key를 result로 return함
                if node_name == key:
                    toReturn["Network Storage("+key+")"] = value # JF-Worker가 없는 NFS 스토리지
                else:
                    toReturn[node_name] = value # JF-Worker가 있는 NFS 스토리지
                break
            node_name = get_storage_node_hostname(key)['result']
            toReturn[node_name] = value
        toSend = response(status=1, result=toReturn, message="노드당 스토리지 정보")
        return self.send(toSend)

# 연결된 노드 정보 불러옴
@ns.route('/nodes', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class getNodes(CustomResource):
# @token_checker
    def get(self):
        toReturn = get_nodes()
        toSend = response(status=1, result={"list":toReturn}, message="노드 정보")
        return self.send(toSend)

@ns.route('/storage_usage_status_overview', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class getTotalStorage(CustomResource):
    # @token_checker
    def get(self):
        try:
            res= json.loads(common.launch_on_host("mfs_util list_chunk")[0])
            result = {}
            for key, value in res.items():
                result["all"] = {
                    "total": round((value[1] / divide_by), 2),
                    "used": round((value[0]/divide_by),2),
                }
                if(key == "total"):
                    break
            toSend = response(status=1, result=result, message="총 스토리지 정보")
            return self.send(toSend)
        except:
            storage_stat = get_total_storage_usage(mnt_flg=0)
            result = {}
            result["all"] = {
                "total": float(storage_stat["total"]),
                "used": float(storage_stat["used"])
                }
            toSend = response(status=1, result=result, message="총 스토리지 정보")
            return self.send(toSend)

@ns.route('/resource_usage_status_overview', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class StorageNodesResourceUsageStatusOverView(CustomResource):
    # @token_checker
    @ns.expect(node_resource_info_get)
    def get(self):
        args = node_resource_info_get.parse_args()
        resource_type = args['resource_type']
        res = response(status=1, result=storage_node_status(resource_type))
        return self.send(res)

@ns.route('/storage_history', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class StorageHistoryHandler(CustomResource):
    # @token_checker
    def get(self):
        list_to_return = deque()
        f = open('storage_history_data.json', )
        storage_history_reloaded = json.load(f)
        currentTime = -1
        count = len(storage_history_reloaded) - 1
        counter = 0
        while count >= 0:
            if counter == 300:
                break
            storage_history_reloaded[count]["time"] = currentTime
            list_to_return.appendleft(storage_history_reloaded[count])
            count = count - 1
            counter = counter + 1
            currentTime = currentTime - 1
        res = response(status=1, result={"history_list":list(list_to_return)})
        return self.send(res)

"""
=================================================================================================================================
Storage Node Router END
=================================================================================================================================
"""