from time import time
from utils.resource import CustomResource, token_checker
from router import response
import traceback
import subprocess
import os
import json

from utils.common_network import NetworkInterfaceManager
from restplus import api
from utils.access_check import admin_access_check


ns = api.namespace('', description='Worker API')

BENCHMARK_NETWORK_JSON_PATH = "/jf-src/worker/{}"
BENCHMARK_ETHERNET_NETWORK_FILE_NAME = "{}-{}-{}-benchmark_network_test_ethernet"
PROTOCOL_IPV4 = "ipv4"
PROTOCOL_IPV6 = "ipv6"
BENCHMARK_NETWORK_CLIENT = "c"
BENCHMARK_NETWORK_SERVER = "s"


get_package_check = api.parser()
get_package_check.add_argument('package_name', type=str, required=True, location='args', help='ubuntu package name' )

def ubuntu_package_download(package_name : str):
    result = os.system("apt list --installed | grep {}".format(package_name))
    if result != 0:
        result = os.system("apt install -y {}".format(package_name))
    return result


@ns.route('/ubuntu-package-download', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class PackageCheck(CustomResource):
    @ns.expect(get_package_check)
    def get(self):
        args = get_package_check.parse_args()
        try:
            package_name = args["package_name"]
            res = ubuntu_package_download(package_name=package_name)
            return response(status=1, result=res)
        except Exception as e:
            traceback.print_exc()
            return response(status=0, result=str(e))
        

get_ping_check = api.parser()
get_ping_check.add_argument('node_ip', type=str, required=True, location='args', help='ping check ip' )
get_ping_check.add_argument('interface', type=str, required=True, location='args', help='binding network interface' )


def network_interface_ping_check(interface : str, node_ip : str) -> bool:
    """
    Description: 같은 대역폭인지 확인하기 위한 Ping check(자신의 interface로 상대 ip와 같은 대역폭인지 확인)

    Args:
        interface (str): test할 자신의 network interface name
        node_ip (str): server node ip

    Returns:
        bool: 같은 대역폭이면 True
              다른 대역폭이면 False
    """
    try:
        subprocess.run("ping -I {} -c 1 {}".format(interface, node_ip), shell=True, check=True)
        return True
    except subprocess.CalledProcessError as e:
        traceback.print_exc()
        return False
    except Exception as e:
        traceback.print_exc()
        return False


@ns.route('/node-ping-check', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class PingCheck(CustomResource):
    @ns.expect(get_ping_check)
    @token_checker
    @admin_access_check()
    def get(self):
        args = get_ping_check.parse_args()
        try:
            node_ip = args["node_ip"]
            interface = args["interface"]
            res = network_interface_ping_check(interface=interface, node_ip=node_ip)
            return response(status=1, result=res)
        except Exception as e:
            traceback.print_exc()
            return response(status=0, result=str(e))



get_ip_check = api.parser()
get_ip_check.add_argument('interface', type=str, required=True, location='args', help='interface type' )

def get_worker_ip_check_by_interface(interface_name : str, protocol=PROTOCOL_IPV4) -> str:
    """
    Description: interface name에 해당하는 ip 

    Args:
        interface (str): interface name
        protocol (int, optional): protocol 종류(PROTOCOL_IPV4, PROTOCOL_IPV66). Defaults to PROTOCOL_IPV4.

    Returns:
        str: ip 
    """
    if protocol == PROTOCOL_IPV4:
        cmd = f"ifconfig {interface_name} | grep -w inet | awk -F ' ' '{{print $2}}'"
    elif protocol == PROTOCOL_IPV6:
        cmd = f"ifconfig {interface_name} | grep -w inet6 | awk -F ' ' '{{print $2}}'"
    ip = subprocess.check_output(cmd, shell=True).strip().decode('utf-8')
    return ip


@ns.route('/ip-check', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class IpCheck(CustomResource):
    @ns.expect(get_ip_check)
    @token_checker
    @admin_access_check()
    def get(self):
        """get ipv4 ip by network interface name"""
        args = get_ip_check.parse_args()
        try:
            interface = args["interface"]
            result = NetworkInterfaceManager(interface=interface).get_ip()
            return response(status=1, result=result)
        except Exception as e:
            traceback.print_exc()
            return response(status=0, result=str(e))

post_iperf3_running = api.parser()
post_iperf3_running.add_argument('kind', type=str, required=True, location='json', help='server or client' )
post_iperf3_running.add_argument('interface', type=str, required=True, location='json', help='worker ip interface' )
post_iperf3_running.add_argument('node_server_interface_ip', type=str, required=False, location='json', help='node_server_interface_ip' )
post_iperf3_running.add_argument('benchmark_network_value', type=dict, required=False, location='json', help='benchmark network value' )


def get_iperf_process_pid(interface_ip=None) -> any:
    """
    Description: 현재 서버로 실행중인 iperf3 process pid 출력

    Args:
        interface_ip (str, None): iperf3 server로 실행중인 interface ip, 실행중인 모든 iperf3 server를 확인하려면 None 

    Returns:
        str: interface_ip 가 있으면 str
        list: interface_ip 가 없으면 list 
        None: iperf3 -s 로 실행하는 bash가 없으면 None
    """
    pid = None
    if interface_ip:
        cmd = f"ps ax | grep 'iperf3 -s -B {interface_ip}' | grep -v 'grep' | awk '{{print $1}}'"
        pid  : str = subprocess.check_output(cmd, shell=True).strip().decode('utf-8')
    else:
        cmd = f"ps ax | grep 'iperf3 -s' | grep -v 'grep' | awk '{{print $1}}'"
        pids = subprocess.check_output(cmd, shell=True).strip().decode('utf-8')
        pid : list = pids.splitlines()
    return pid


def server_iperf(interface : str) -> None:
    """
    Description: 해당 interface로 iperf3 server 실행 

    Args:
        interface (str): 실행시킬 interface name
    """
    interface_ip = get_worker_ip_check_by_interface(interface_name=interface)

    os.system("iperf3 -s -B {interface_ip} -1 -D".format(interface_ip=interface_ip))

# 기존
def client_iperf(interface: str , node_server_interface_ip: str):
    """
    Description: client로서 각 server worker에게 iperf3 실행 후 결과 값 반환

    Args:
        server_address (list): server worker 주소들
        refresh (bool): 기존 log 파일을 사용하여 결과값을 반환 할 것인지 아니면 새로 network check를 할 것인지 

    Returns:
        str: file name 
        None : test 실행 중 오류가 날 경우
    """
    worker_ip = NetworkInterfaceManager(interface=interface).get_ip()
    file_name = "{}-{}-{}-network_TCP.json".format(worker_ip, node_server_interface_ip, time())
    path = BENCHMARK_NETWORK_JSON_PATH.format(file_name)
    os.system("iperf3 -c {} -J -V -f b > {}".format(node_server_interface_ip, path))
    if os.path.isfile(path):
        return file_name
    return None


# retry
def client_iperf_asynchronous(interface: str , node_server_interface_ip: str, benchmark_network_value : dict) -> str:
    worker_ip = NetworkInterfaceManager(interface=interface).get_ip()

    file_name = BENCHMARK_ETHERNET_NETWORK_FILE_NAME.format(worker_ip, node_server_interface_ip, time())
    path = BENCHMARK_NETWORK_JSON_PATH.format(file_name)
    with open(path+".text", "w") as w:
        json.dump(benchmark_network_value, w)
    cmd = "iperf3 -c {} -J -V -f b > {}.json".format(node_server_interface_ip, path)
    subprocess.Popen(cmd,shell=True)
    return file_name


# json
def client_iperf_json_parsing(interface: str , node_server_interface_ip: str) -> dict:
    worker_ip = NetworkInterfaceManager(interface=interface).get_ip()
    file_name = "{}-{}-{}-network_TCP.json".format(worker_ip, node_server_interface_ip, time())
    path = BENCHMARK_NETWORK_JSON_PATH.format(file_name)
    os.system("iperf3 -c {} -J -V -f b > {}".format(node_server_interface_ip, path))
    if os.path.isfile(path):
        with open(path, "r") as f:
            json_data = json.load(f)
        return json_data
    return None



@ns.route('/iperf-running', methods=['POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NetworkSpeedCheck(CustomResource):
    
    @ns.expect(post_iperf3_running)
    @token_checker
    @admin_access_check()
    def post(self):
        args = post_iperf3_running.parse_args()
        try:
            
            kind = args['kind']
            interface = args['interface']
            if kind == BENCHMARK_NETWORK_SERVER : 
                server_iperf(interface=interface)
                return response(status=1, result="")
            elif kind == BENCHMARK_NETWORK_CLIENT:
                node_server_interface_ip = args['node_server_interface_ip']
                benchmark_network_value = args["benchmark_network_value"]
                
                #기존방법
                # result = client_iperf(node_server_interface_ip=node_server_interface_ip, interface=interface)
                
                # json 파싱 방법
                # result = client_iperf_json_parsing(node_server_interface_ip=node_server_interface_ip, interface=interface) 

                # 비동기 test
                result = client_iperf_asynchronous(node_server_interface_ip=node_server_interface_ip, interface=interface, benchmark_network_value=benchmark_network_value)

                return response(status=1, result=result)
        except Exception as e:
            traceback.print_exc()
            return response(status=0, result=str(e))

get_iperf3_kill = api.parser()
get_iperf3_kill.add_argument('interface_ip', type=str, required=True, location='args', help='interface ip' )


def iperf_server_kill(interface_ip=None) -> any:
    """
    Description: interface_ip가 있으면 해당 process만 kill 
                 None이면 모든 iperf3 -s process kill 

    Args:
        interface_ip (str): network interface에 해당하는 ip. Defaults to "".

    Returns:
        any: 해당 interface에 해당하는 ip로 iperf3가 동작 중일경우 int(모두 정상적으로 꺼지면 0, 중간에 오류가 발생하면 1이상의 값 출력)
             없을경우 None
    """
    pid = get_iperf_process_pid(interface_ip=interface_ip)
    if pid:
        if type(pid) == str:
            result = os.system("kill -9 {}".format(pid))
        if type(pid) == list:
            result = 0
            for id in pid:
                result += os.system("kill -9 {}".format(id))
        return result
    return None

@ns.route('/iperf-kill', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NetworkSpeedCheckProcessKill(CustomResource):

    @ns.expect(get_iperf3_kill)
    @token_checker
    @admin_access_check()
    def get(self):
        """
        Description: iperf3 process kill

        Returns:
            any: kill success  - int 0
                 kill failed - int 
                 not exist - None
        """
        args = get_iperf3_kill.parse_args()
        try:
            interface_ip = args["interface_ip"]
            res = iperf_server_kill(interface_ip=interface_ip)
            return response(status=1, result=res)
        except Exception as e:
            traceback.print_exc()
            return response(status=0, result=str(e))


post_perftest_running = api.parser()
post_perftest_running.add_argument('kind', type=str, required=True, location='json', help='server or client' )
post_perftest_running.add_argument('interface', type=str, required=True, location='json', help='worker ip interface' )
post_perftest_running.add_argument('node_server_ip', type=str, required=False, location='json', help='server ip' )


def get_infiniband_device_id(interface : str) -> str:
    cmd = f"ls -l /sys/class/net | grep -w {interface} | awk -F '/' '{{print $6}}'"
    result = subprocess.check_output(cmd, shell=True).strip().decode('utf-8')
    #PCI가 0000:17:00.0 나오기 떄문에  17:00.0 만 추출
    result_list = result.split(":")
    result_list.pop(0)
    interface_device_id = (":").join(result_list)
    return interface_device_id

def get_infiniband_mlx_name(interface_device_id : str) -> str:
    cmd = f"ls -l /sys/class/infiniband/ | grep -w {interface_device_id} | awk -F '/' '{{print $8}}'"
    mlx_name = subprocess.check_output(cmd, shell=True).strip().decode('utf-8')
    return mlx_name

def server_perftest(interface : str):

    mlx_name = NetworkInterfaceManager(interface=interface).get_ib_mlx_core_name()
    cmd = "ib_write_bw -d {} -a -F".format(mlx_name)
    # ib_write_bw은 daemon으로 돌릴 수 없기 때문에 Popen으로 실행
    subprocess.Popen(cmd,shell=True)


def client_perftest(interface : str, node_server_ip : str):
    try:
        mlx_name = NetworkInterfaceManager(interface=interface).get_ib_mlx_core_name()
        cmd = "ib_write_bw -d {} {} -D 10 --report_gbits --cpu_util --CPU-freq --output=bandwidth".format(mlx_name, node_server_ip)
        result = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT).strip().decode('utf-8')
        return result
    except subprocess.CalledProcessError as e:
        raise RuntimeError("command '{}' return with error (code {}): {}".format(e.cmd, e.returncode, e.output))

@ns.route('/perftest-running', methods=['POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class NetworkSpeedCheckInfiniband(CustomResource):

    @ns.expect(post_perftest_running)
    @token_checker
    @admin_access_check()
    def post(self):
        args = post_perftest_running.parse_args()
        try:
            kind = args['kind']
            interface = args['interface']
            if kind == BENCHMARK_NETWORK_SERVER : 
                server_perftest(interface=interface)
                return response(status=1, result="")
            elif kind == BENCHMARK_NETWORK_CLIENT:
                node_server_ip = args['node_server_ip']
                result = client_perftest(node_server_ip=node_server_ip, interface=interface)
                return response(status=1, result=result)
        except Exception as e:
            traceback.print_exc()
            return response(status=0, result=str(e))