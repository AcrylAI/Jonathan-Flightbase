# python jf_installer_front.py --master_ip 192.168.1.13 --api_port 56789 --flag MASTER
import os
import argparse
import sys
from subprocess import PIPE, run


def get_front_src():
    print("Copying front source to /jp-front")
    os.system("cp -a  ../../../jonathan-platform-front/. /jp-front; sleep 1")

def str2bool(v):
    if isinstance(v, bool):
       return v
    if v.lower() in ('yes', 'true', 't', 'y', '1'):
        return True
    elif v.lower() in ('no', 'false', 'f', 'n', '0'):
        return False
    else:
        raise argparse.ArgumentTypeError('Boolean value expected.')

def arg_parameter_init(params):
    if params.get("flag") is not None:
        params["flag"] = params["flag"].upper()
    if params.get("master_ip") is not None:
        if not params.get("api_ip"):
            params["api_ip"] = params["master_ip"]
        params["front_ip"] = params["master_ip"]
    if not params.get("marker_url"):
        params["marker_url"] = f'{params["front_ip"]}:9000'

    if params.get("ib_ip") is not None and (params["ib_ip"] == params["master_ip"]):
        print(f"IB IP and Master IP cannot share the same IP address of {params['ib_ip']}.")
        sys.exit(1)

def install_front(params):
    if params["flag"] == "MASTER":
        print("==============FRONT INSTALLING==============")
        get_front_src()
        front_installer_command = "./install/flight-base/installer.sh -h {api_ip} -p {api_port} -l {front_ip} -s {front_port} -r {protocol_config} -c {front_build_config} -u {ui_guide} -a {stand_alone} -m {marker_url} -e {enc_key} -i {iv}".format(
            api_ip=params["api_ip"], api_port=params["api_port"], front_ip=params["front_ip"], front_port=params["front_port"], \
             protocol_config=params["protocol_config"], front_build_config=params["front_build_config"], \
             ui_guide=params["ui_guide"], stand_alone=params["stand_alone"], marker_url=params["marker_url"], enc_key=params["enc_key"], iv=params["iv"]
            )
        os.system("cd /jp-front; {cmd}".format(cmd=front_installer_command))
        print("==============FRONT END==============")


parser = argparse.ArgumentParser()
parser.add_argument('--master_ip', type=str, required=True, help="Write master IP EX) 192.168.x.x")
parser.add_argument('--api_ip', type=str, required=False, default="", help="Write API server IP. (default: master IP)")
# backend port
parser.add_argument('--api_port', type=str, default="56789")
# container port
parser.add_argument('--front_port', type=str, default="80")
parser.add_argument('--flag', type=str, required=False, default="MASTER")
parser.add_argument('--protocol_config', type=str, required=False, default="http")
parser.add_argument('--front_build_config', type=str, required=False, default="default")
parser.add_argument('--ui_guide', type=str, required=False, default="false")
parser.add_argument('--stand_alone', type=str2bool, required=False, default=True, help="단독 설치 여부를 설정해주세요.")
parser.add_argument('--marker_url', type=str, required=False, default="", help="marker api url")
parser.add_argument('--enc_key', type=str, required=True, help="Encryption key")
parser.add_argument('--iv', type=str, required=True, help="Initialization vector")
params, _ = parser.parse_known_args()
params = vars(params)
arg_parameter_init(params)
install_front(params)
