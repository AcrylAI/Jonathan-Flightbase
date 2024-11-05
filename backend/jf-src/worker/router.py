from flask_restplus import reqparse, Resource
from utils.resource import CustomResource, token_checker
from flask import Response
import requests
import json
import kubernetes
import traceback
import subprocess
import os
import paramiko
import time
import subprocess

from restplus import api
import settings
import arg_parser
from license import InvalidLicenseError
import license
from utils.common import launch_on_host
from utils.access_check import admin_access_check
from utils.common_network import NetworkInterfaceManager
from TYPE import *

do_quit = False

ns = api.namespace('', description='Worker API')

#TODO REMOVE
add_node_parser = api.parser()
add_node_parser.add_argument('join_command', type=str, required=True, location='args', help='join command' )

node_control_post = api.parser()
node_control_post.add_argument('join_command', type=str, required=True, location='json', help='join command' )


mount_parser = api.parser()
mount_parser.add_argument('mountpoint', type=str, required=True, location='args', help='mountpoint loc' )

mount_master_parser = api.parser()
mount_master_parser.add_argument('mountpoint', type=str, required=True, location='args', help='mountpoint loc' )
mount_master_parser.add_argument('master', type=str, required=True, location='args', help='master loc' )

master_parser = api.parser()
master_parser.add_argument('master', type=str, required=True, location='args', help='master loc' )

touch_user_parser = api.parser()
touch_user_parser.add_argument('name', type=str, required=True, location='args', help='name' )
touch_user_parser.add_argument('uid', type=str, required=True, location='args', help='uid' )

def send(*args, **kwargs):
    ## {result , message } 
    json_encode = json.JSONEncoder().encode
    headers = {}
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Headers'] = '*'
    headers['Access-Control-Allow-Credentials'] = True

    response_body = {'result' : None , 'message' : None}
    
    for arg in args:
        if arg is not None:
            for key in arg.keys():
                response_body[key] = arg[key]

    for param_key in kwargs.keys():
        response_body[param_key] =  kwargs[param_key]
    return Response(json_encode(response_body), headers=headers, mimetype="application/json")

def response(**kwargs):
    params = ['status', 'message', 'result']
    for param in params:
        if param not in kwargs.keys():  
            kwargs[param] = None

    return kwargs

def list_partition():
    try:
        returned = launch_on_host("mfs_util list")
        return response(status=1, result=returned)
    except Exception as e:
        toReturn = {"status":"exception thrown mfs_util","returned":str(e)}
        return response(status=0, result=str(toReturn))

def mount_mfs(mountpoint: str, master:str="a", set_master:bool=False, nmt= False):
    if(nmt):
        if (set_master):
            try:
                returned = launch_on_host("mfs_util mount_nmt_and_set_master " + mountpoint + " " + master)
                return response(status=1, result=returned)
            except Exception as e:
                exc = str(e)
                if "moosefs" in exc:
                    return response(status=1, result=exc)
                return response(status=0, result=exc)
        else:
            try:
                returned = launch_on_host("mfs_util mount_nmt " + mountpoint)
                return response(status=1, result=returned)
            except Exception as e:
                exc = str(e)
                if "moosefs" in exc:
                    return response(status=1, result=exc)
    else:
        if(set_master):
            try:
                returned = launch_on_host("mfs_util mount_and_set_master " + mountpoint + " " + master)
                return response(status=1, result=returned)
            except Exception as e:
                exc = str(e)
                if "moosefs" in exc:
                    return response(status=1, result=exc)
                return response(status=0, result=exc)
        else:
            try:
                returned = launch_on_host("mfs_util mount " + mountpoint)
                return response(status=1, result=returned)
            except Exception as e:
                exc = str(e)
                if "moosefs" in exc:
                    return response(status=1, result=exc)

#def execute_command_ssh(address, usr, pwd, cmd):
#    """ Throws IOError when host down or something.
#    """
#    client = paramiko.SSHClient()
#    client.load_system_host_keys()
#    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
#
#    client.connect(address, username=usr, password=pwd)
#    _, ss_stdout, ss_stderr = client.exec_command(cmd)
#    r_out, r_err = ss_stdout.read(), ss_stderr.read()
#    client.close()
#
#    return r_out, r_err
#
#def launch_on_host(cmd, ignore_stderr=False, host=None):
#    """Launch a command on host using launcher system.
#
#    Launcher system runs the command with a root privillage.
#    But it could excute only a few limited programs which
#    are in LAUNCHER_BINS_DIR. Also launcher is not a sudoer.
#    So it is safe from attacks atempting to run other
#    dangerous commands.
#
#    The ip of the host should be given by command line argument --jf-ip
#    or passed by param host.
#    """
#    if host is None:
#        host = arg_parser.jf_ip
#        if host is None:
#            raise KeyError('CLI argument --jf-ip not given.')
#    r_out, r_err = execute_command_ssh(host, 'launcher', 'qwerty', cmd)
#    if r_out is None:
#        return None
#    if not ignore_stderr and r_err is not None and len(r_err) > 0:
#        raise RuntimeError(r_err.decode('utf-8'))
#    return r_out.decode('utf-8')

# ROUTER

@ns.route('/docker_ps', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class Docker_check(CustomResource):
    #@token_checker
    def get(self):
        try:
            returned = launch_on_host("docker ps")
            return response(status=1, result=returned)
        except Exception as e:
            return response(status=0, result=str(e))

@ns.route('/list_partitions', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class Mfs_list_partitions(CustomResource):
    #@token_checker   
    def get(self):
        return list_partition()

@ns.route('/mfs_mount', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class Mfs_mount(CustomResource):
    @token_checker
    @ns.expect(mount_parser)
    def get(self):
        args = mount_parser.parse_args()
        return mount_mfs(mountpoint=args["mountpoint"])

@ns.route('/mfs_mount_and_set_master', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class Mfs_mount_and_set_master(CustomResource):
    @token_checker
    @ns.expect(mount_master_parser)
    def get(self):
        args = mount_parser.parse_args()
        return mount_mfs(mountpoint=args["mountpoint"],master=args["master"],set_master=True)

@ns.route('/mfs_mount_nmt', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class Mfs_mount_nmt(CustomResource):
    @token_checker
    @ns.expect(mount_parser)
    def get(self):
        args = mount_parser.parse_args()
        return mount_mfs(mountpoint=args["mountpoint"],master=args["master"],set_master=False,nmt=True)

@ns.route('/mfs_mount_nmt_and_set_master', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class Mfs_mount_nmt_and_set_master(CustomResource):
    @token_checker
    @ns.expect(mount_master_parser)
    def get(self):
        args = mount_parser.parse_args()
        return mount_mfs(mountpoint=args["mountpoint"],master=args["master"],set_master=True,nmt=True)

@ns.route('/add_node', methods=['GET']) 
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class AddNode(CustomResource):
    @token_checker
    @admin_access_check()
    @ns.expect(add_node_parser)
    def get(self):            
        args = add_node_parser.parse_args()  
        join_command = args['join_command']
        try:
            # lic_key = license.load_lic_key()
            # license.check_lic_key(lic_key)
            add_result = {
                "kube_reset": {
                    "out": "",
                    "err": ""
                },
                "rm_cni": {
                    "out": "",
                    "err": ""
                },
                "kube_join": {
                    "out": "",
                    "err": ""
                }
            }
            reset_log_out, reset_log_err = launch_on_host("kubeadm reset -f", ignore_stderr=True)
            add_result["kube_reset"]["out"] = reset_log_out
            add_result["kube_reset"]["err"] = reset_log_err
            rm_cni_log_out, rm_cni_log_err = launch_on_host("rm_cni", ignore_stderr=True)
            add_result["rm_cni"]["out"] = rm_cni_log_out
            add_result["rm_cni"]["err"] = rm_cni_log_err
            join_log_out, join_log_err = launch_on_host(join_command, ignore_stderr=True)
            add_result["kube_join"]["out"] = join_log_out
            add_result["kube_join"]["out"] = join_log_err

            res = response(status=1, result=add_result, message="Tried add_node ")
        except InvalidLicenseError as e:
            traceback.print_exc()
            res = response(status = 0,  result=add_result, message = "InvalidLicenseError: {}".format(str(e)))
        except Exception as e:
            traceback.print_exc()
            res = response(status = 0, result=add_result, message = "CLI Run Error {}".format(str(e)))

        return self.send(res)        


@ns.route('/remove_node', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class RemoveNode(CustomResource):
    @token_checker
    @admin_access_check()
    def get(self):            
        try:
            flag, res = self.is_root()
            if flag == False:
                return res

            log = ""
            log += launch_on_host("kubeadm reset -f", ignore_stderr=True)[0]
            log += launch_on_host("rm_cni", ignore_stderr=True)[0]
            res = response(status=1, message="Tried remove_node : {}".format(log))
        except Exception as e:
            traceback.print_exc()
            res = response(status = 0, message = "CLI Run Error : {}".format(str(e)))

        return self.send(res)

@ns.route('/node', methods=['POST','DELETE'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NodeControl(CustomResource):
    @token_checker
    @admin_access_check()
    @ns.expect(node_control_post)
    def post(self):
        args = node_control_post.parse_args()  
        join_command = args['join_command']
        try:
            print("ATTACH NODE")
            # lic_key = license.load_lic_key()
            # license.check_lic_key(lic_key)
            add_result = {
                "kube_reset": {
                    "out": "",
                    "err": ""
                },
                "rm_cni": {
                    "out": "",
                    "err": ""
                },
                "kube_join": {
                    "out": "",
                    "err": ""
                }
            }
            reset_log_out, reset_log_err = launch_on_host("kubeadm reset -f", ignore_stderr=True)
            add_result["kube_reset"]["out"] = reset_log_out
            add_result["kube_reset"]["err"] = reset_log_err
            rm_cni_log_out, rm_cni_log_err = launch_on_host("rm_cni", ignore_stderr=True)
            add_result["rm_cni"]["out"] = rm_cni_log_out
            add_result["rm_cni"]["err"] = rm_cni_log_err
            join_log_out, join_log_err = launch_on_host(join_command, ignore_stderr=True)
            add_result["kube_join"]["out"] = join_log_out
            add_result["kube_join"]["out"] = join_log_err

            res = response(status=1, result=add_result, message="Tried add_node ")
        except InvalidLicenseError as e:
            traceback.print_exc()
            res = response(status = 0,  result=add_result, message = "InvalidLicenseError: {}".format(str(e)))
        except Exception as e:
            traceback.print_exc()
            res = response(status = 0, result=add_result, message = "CLI Run Error {}".format(str(e)))

        return self.send(res) 

    @token_checker
    @admin_access_check()
    def delete(self):
        try:
            print("DELETE KUBE NODE ")
            log = ""
            log += launch_on_host("kubeadm reset -f", ignore_stderr=True)[0]
            log += launch_on_host("rm_cni", ignore_stderr=True)[0]
            res = response(status=1, message="Tried remove_node : {}".format(log))
        except Exception as e:
            traceback.print_exc()
            res = response(status = 0, message = "CLI Run Error : {}".format(str(e)))

        return self.send(res)

@ns.route('/device_info', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class gpu_list(Resource):    
    def get(self):          
        try:
            # lic_key = license.load_lic_key()
            # license.check_lic_key(lic_key)
            gpu_info = arg_parser.gpu_info
            system_info = arg_parser.system_info
            res = response(status=gpu_info["status"], result={"gpu_info" : gpu_info, "system_info": system_info}, message=gpu_info["message"])
        except InvalidLicenseError as e:
            traceback.print_exc()
            res = response(status = 0, message = "InvalidLicenseError: {}".format(str(e)))
        except Exception as e:
            traceback.print_exc()
            res = response(status = 0, message = "system err : {}".format(str(e)))
        return send(res)



def get_network_interface_list() -> list:
    cmd = "ls /sys/class/net"
    interfaces = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT).strip().decode('utf-8')
    interface_list : list = interfaces.splitlines()
    return interface_list


def get_network_interfaces() -> list:
    # 1. interface 목록 불러오기
    # 2. interface ip 확인하기 ipv4 -> 없으면 interface에 추가 X
    # 3-1. interface가 Ethernet인지 infiniband 인지 확인하기
    # 3-2. infiniband이면 mlx5_core_name 확인하기
    result = []
    # 1
    interface_list : list = get_network_interface_list()
    for interface in interface_list:
        dict_ = {
            "interface" : interface,
            "interface_ip" : None,
            "category" : None,
            "is_virtual" : False
        }
        nim = NetworkInterfaceManager(interface=interface)
        ip = nim.get_ip()
        # 2
        dict_["interface_ip"] = ip
        # 3
        bandwidth : str = nim.interface_bandwidth_check()
        if bandwidth == NETWORK_GROUP_CATEGORY_ETHERNET:
            dict_["is_virtual"] = nim.is_virtual_en()
            dict_["category"] = NETWORK_GROUP_CATEGORY_ETHERNET
            result.append(dict_)
            # print(nim.__dict__)
            continue
        # 3-2 해당 INFINIBAND interface가 VIRTUAL인지 확인
        dict_["is_virtual"] = nim.is_virtual_ib()
        dict_["category"] = NETWORK_GROUP_CATEGORY_INFINIBAND
        dict_["mlx_core_name"] = nim.get_ib_mlx_core_name()
        dict_["vf_count"] = nim.get_ib_vf_count()
        result.append(dict_)
        # print(nim.__dict__)

    return result



#TODO
# form 개선
# ip, status 정보 추가
# infiniband interface 와 mlx core 매칭 함수 추가
@ns.route('/network-interfaces-new', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class gpu_list(Resource):
    """
    {
        "interface": "bond0",
        "interface_ip": "192.168.10.96",
        "category": "Ethernet",
        "is_virtual": true
    },
    {
        "interface": "bond1",
        "interface_ip": "192.168.20.96",
        "category": "Ethernet",
        "is_virtual": true
    },
    {
        "interface": "bond2",
        "interface_ip": "192.168.30.96",
        "category": "Ethernet",
        "is_virtual": true
    },
    {
        "interface": "bond3",
        "interface_ip": "192.168.40.96",
        "category": "Ethernet",
        "is_virtual": true
    },
    {
        "interface": "docker0",
        "interface_ip": "172.17.0.1",
        "category": "Ethernet",
        "is_virtual": true
    },
    {
        "interface": "eno1",
        "interface_ip": "115.71.28.106",
        "category": "Ethernet",
        "is_virtual": false
    },
    {
        "interface": "enxb03af2b6059f",
        "interface_ip": "169.254.3.1",
        "category": "Ethernet",
        "is_virtual": false
    },
    {
        "interface": "ibs9",
        "interface_ip": "192.168.100.106",
        "category": "Infiniband",
        "is_virtual": false,
        "mlx_core_name": "mlx5_0"
    },
    {
        "interface": "lo",
        "interface_ip": "127.0.0.1",
        "category": "Ethernet",
        "is_virtual": true
    },
    {
        "interface": "weave",
        "interface_ip": "10.44.0.0",
        "category": "Ethernet",
        "is_virtual": true
    }
    """
    def get(self):          
        try:
            result = get_network_interfaces()
            res = response(status = 1, result=result)
        except Exception as e:
            traceback.print_exc()
            res = response(status = 0, message = "system err {} ".format(str(e)))

        return send(res)


@ns.route('/network_interfaces', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class gpu_list(Resource):    
    def get(self):          
        try:
            # lic_key = license.load_lic_key()
            # license.check_lic_key(lic_key)
            result, *_ = launch_on_host("network_interfaces", ignore_stderr=True)
            interfaces = result.split("\n")[:-1]
            res = response(status = 1, result=interfaces)
        except InvalidLicenseError as e:
            traceback.print_exc()
            res = response(status = 0, message = "InvalidLicenseError: {}".format(str(e)))
        except Exception as e:
            traceback.print_exc()
            res = response(status = 0, message = "system err {} ".format(str(e)))

        return send(res)

@ns.route('/check_license', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class chk_lic(Resource):
    def get(self):
        try:
            lic_key = license.load_lic_key(jf_ip)
            license.check_lic_key(lic_key)
            response_dict = response(status=1, message="OK")
        except InvalidLicenseError as error:
            traceback.print_exc()
            response_dict = response(status=0, message="InvalidLicenseError: {}".format(str(error)))
        except Exception as error:
            traceback.print_exc()
            response_dict = response(status=0, message="system err {} ".format(str(error)))

        return send(response_dict)

@ns.route('/ping', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class chk_lic(Resource):
    def get(self):
        res = response(status=1, message="OK")
        return send(res)
        
@ns.route('/cpu_usage', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class get_cpu_usage(Resource):
    def get(self):
        from multiprocessing import cpu_count
        from utils.system_share import share_usage_counter
        """CPU 1초간 평균 사용량 조회"""
        # cmd = """grep 'cpu' /jf-bin/stat | head -1"""
        # try:
        #     first = subprocess.check_output(cmd, shell=True).strip().decode()
        #     if(first == ""):
        #         return '/jf-bin/stat not found, is it mounted?'
        #     first = first.split()[1:]
        #     time.sleep(1)
        #     second = subprocess.check_output(cmd, shell=True).strip().decode().split()[1:]
        #     delta_idle = float(second[3]) - float(first[3])
        #     delta_user = float(second[0]) - float(first[0])
        #     delta_system = float(second[2]) - float(second[2])
        #     result = str(round((((delta_system + delta_user) / (delta_system + delta_user + delta_idle)) * 100),2)*cpu_count()) + "%"
        #     return response(status=1, result=result)
        # except subprocess.CalledProcessError as e:
        #     return response(status=1, result=None, message=e.output.decode())
        try:
            gpu_usage = share_usage_counter.get_cpu_usage()
            return response(status=1, result=gpu_usage)
        except Exception as e:
            return response(status=0, result=None, message=str(e))


@ns.route('/mem_usage', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class get_mem_usage(Resource):
    def get(self):
        from utils.system_share import share_usage_counter
        """메모리 총용량/사용량/여유분 조회"""
        # cmd = """cat /jf-bin/meminfo | grep 'Mem'"""
        # try:
        #     returned_result = subprocess.check_output(cmd, shell=True).strip().decode()
        #     returned_result = returned_result.splitlines()
        #     dict_to_return = dict()
        #     for line in returned_result:
        #         tempList = line.split(':')
        #         dict_to_return[tempList[0]] = tempList[1].replace(" ","")
        #     return response(status=1, result=dict_to_return)
        # except subprocess.CalledProcessError as e:
        #     toReturn = e.output.decode()
        #     if(toReturn == ""):
        #         return('/jf-bin/meminfo not found, is it mounted?')
        #     return response(status=1, result=None, message=e.output.decode())
        try:
            mem_usage = share_usage_counter.get_mem_usage()
            return response(status=1, result=mem_usage)
        except Exception as e:
            return response(status=0, result=None, message=str(e))
