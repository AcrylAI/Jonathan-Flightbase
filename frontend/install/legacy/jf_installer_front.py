# python jf_installer_front.py --master_ip 192.168.1.13 --api_port 56789 --flag MASTER
import os
import argparse
import sys


def get_front_src():
    os.system("cp -a  ../../../jonathan-platform-front/. /jp-front; sleep 1")

def arg_parameter_init(params):
    if params.get("flag") is not None:
        params["flag"] = params["flag"].upper()
    if params.get("master_ip") is not None:
        params["api_ip"] = params["master_ip"]
        params["front_ip"] = params["master_ip"]

    if params.get("ib_ip") is not None and (params["ib_ip"] == params["master_ip"]):
        print("IB IP and Master IP have to differnet")
        sys.exit(1)

def install_front(params):
    if params["flag"] == "MASTER":
        print("==============FRONT INSTALLING==============")
        get_front_src()
        front_installer_command = "./install/legacy/installer.sh -h {api_ip} -p {api_port} -l {front_ip} -s {front_port} -b {branch} -r {protocol_config} -c {front_build_config} -u {ui_guide}".format(
            api_ip=params["api_ip"], api_port=params["api_port"], front_ip=params["front_ip"], front_port=params["front_port"], branch=params["branch"], protocol_config=params["protocol_config"], front_build_config=params["front_build_config"], ui_guide=params["ui_guide"])
        os.system("cd /jp-front; {cmd}".format(cmd=front_installer_command))
        print("==============FRONT END==============")

parser = argparse.ArgumentParser()
parser.add_argument('--master_ip', type=str, required=True, help="Write master IP EX) 192.168.x.x")
parser.add_argument('--api_port', type=str, default="56789")
parser.add_argument('--front_port', type=str, default="443")
parser.add_argument('--flag', type=str, required=False, default="MASTER")
parser.add_argument('--branch', type=str, required=False, default="master")
parser.add_argument('--protocol_config', type=str, required=False, default="https")
parser.add_argument('--front_build_config', type=str, required=False, default="default")
parser.add_argument('--ui_guide', type=str, required=False, default="false")
params, _ = parser.parse_known_args()
params = vars(params)
arg_parameter_init(params)
install_front(params)
