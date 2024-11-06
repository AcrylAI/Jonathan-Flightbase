import os
import sys
import traceback
import subprocess

_installer_loc = "/jfbcore/installer/"


def get_current_os_info():
    os = "unknown"
    try:
        command = "hostnamectl | grep Operating | cut -d':' -f2-"
        os = subprocess.check_output(command, shell=True).strip().decode()
        return os
    except Exception as _:
        traceback.print_exc()
        print("Error: Unsupported OS/Distro")
        sys.exit(0)
        return os


def get_api_src(params):
    # os.system("git clone http://git.iacryl.com/jonathanflightbase/jfbcore.git")
    # if flag == "MASTER":
    #     os.system("mv jfbcore /jfbcore")
    # elif flag == "WORKER":
    #     os.system("mv jfbcore /jfbcore_worker")
    if params["flag"] == "MASTER":
        os.system("mkdir -p {jfb_base}".format(jfb_base=params["jfb_path"]))
        os.system(
            "cp -a jfbcore/. {jfb_base}".format(jfb_base=params["jfb_path"]))
        if params["jfb_path"] != "/jfbcore":
            os.system(
                "ln -s {jfb_base} /jfbcore".format(jfb_base=params["jfb_path"]))

    # elif params["flag"] == "WORKER":
    #     os.system("cp -a jfbcore/. /jfbcore_worker")


def get_front_src():
    # os.system("git clone -b installer --single-branch http://git.iacryl.com/jonathanflightbase/flightbase-front.git && mv flightbase-front /jf-front; sleep 1")
    os.system("cp -a flightbase-front/. /jf-front; sleep 1")

def arg_parameter_init(params):
    if params.get("flag") is not None:
        params["flag"] = params["flag"].upper()
    if params.get("master_ip") is not None:
        params["api_ip"] = params["master_ip"]
        params["front_ip"] = params["master_ip"]

    if params.get("ib_ip") is not None and (params["ib_ip"] == params["master_ip"]):
        print("IB IP and Master IP have to differnet")
        sys.exit(1)
        
def install_api(params, BASE_DIR):
    global _installer_loc
    print("==============API INSTALLING==============")
    if params["launcher_ver"] != "original":
        print("Using the newer rewritten launcher")
    currentOS = get_current_os_info()
    if 'CentOS' in currentOS or 'Oracle' in currentOS or 'Red' in currentOS:
        _installer_loc = "/jfbcore/installer_centos/"
    elif 'Ubuntu' in currentOS:
        pass
    else:
        print("Error: Unsupported OS/Distro")
        sys.exit(0)
    api_installer_command = "./installer.sh {flag} {api_ip} {ib_ip} {docker_path}".format(flag=params["flag"], api_ip=params["api_ip"],
                                                                                          ib_ip=params["ib_ip"], docker_path=params["docker_path"])
    if params["flag"] == "MASTER":
        print("INSTALLING : MASTER ")
        get_api_src(params)
        link_jf_default = "ln -s {BASE_DIR}/jf_cpu_jupyter.tar {BASE_DIR}/jf_api_image.tar {INSTALLER_LOC}/".format(
            BASE_DIR=BASE_DIR, INSTALLER_LOC=_installer_loc)
        chmod = "chmod 755 {INSTALLER_LOC}/*".format(
            INSTALLER_LOC=_installer_loc)
        os.system("cd {INSTALLER_LOC}; {link}; {chmod}; {cmd}".format(
            link=link_jf_default, chmod=chmod, cmd=api_installer_command, INSTALLER_LOC=_installer_loc))
    elif params["flag"] == "WORKER":
        print("INSTALLING : WORKER ")
        get_api_src(params)
        link_jf_default = "ln -s {BASE_DIR}/jf_cpu_jupyter.tar {BASE_DIR}/jf_api_image.tar {BASE_DIR}{INSTALLER_LOC}/".format(
            BASE_DIR=BASE_DIR, INSTALLER_LOC=_installer_loc)
        chmod = "chmod 755 {BASE_DIR}{INSTALLER_LOC}/*".format(
            BASE_DIR=BASE_DIR, INSTALLER_LOC=_installer_loc)
        os.system("cd {BASE_DIR}{INSTALLER_LOC}; {link};  {chmod}; {cmd};".format(
            BASE_DIR=BASE_DIR, link=link_jf_default, chmod=chmod, cmd=api_installer_command, INSTALLER_LOC=_installer_loc))
    else:
        print(
            "Writed --flag {} :: you have to write MASTER | WORKER ".format(params["flag"]))
        sys.exit(2)
    print("==============API END==============")


def start_api(params, BASE_DIR):
    # get_api_src(params)
    api_start_command = "./starter.sh {flag} {master_ip} {ib_ip}".format(
        flag=params["flag"], master_ip=params["master_ip"], ib_ip=params["ib_ip"])
    print("==============API STARTING==============")
    if params["flag"] == "MASTER":
        print("STARTING : MASTER")
        link_jf_default = "ln -s {BASE_DIR}/jf_cpu_jupyter.tar {BASE_DIR}/jf_api_image.tar {INSTALLER_LOC}/".format(
            BASE_DIR=BASE_DIR, INSTALLER_LOC=_installer_loc)
        chmod = "chmod 755 {INSTALLER_LOC}/*".format(
            INSTALLER_LOC=_installer_loc)
        os.system("cd {INSTALLER_LOC}; {link}; {chmod}; {cmd}".format(
            link=link_jf_default, chmod=chmod, cmd=api_start_command, INSTALLER_LOC=_installer_loc))
        os.system("docker stop JF-front")
        os.system("docker start JF-front")
    elif params["flag"] == "WORKER":
        print("STARTING : WORKER")
        link_jf_default = "ln -s {BASE_DIR}/jf_cpu_jupyter.tar {BASE_DIR}/jf_api_image.tar {BASE_DIR}{INSTALLER_LOC}/".format(
            BASE_DIR=BASE_DIR, INSTALLER_LOC=_installer_loc)
        chmod = "chmod 755 {BASE_DIR}{INSTALLER_LOC}/*".format(
            BASE_DIR=BASE_DIR, INSTALLER_LOC=_installer_loc)
        os.system("cd {BASE_DIR}{INSTALLER_LOC}; {link};  {chmod}; {cmd};".format(
            BASE_DIR=BASE_DIR, link=link_jf_default, chmod=chmod, cmd=api_start_command, INSTALLER_LOC=_installer_loc))
    else:
        print(
            "Writed --flag {} :: you have to write MASTER | WORKER ".format(params["flag"]))

    print("==============API END==============")


def install_front(params):
    if params["flag"] == "MASTER":
        print("==============FRONT INSTALLING==============")
        get_front_src()
        front_installer_command = "./installer.sh -h {api_ip} -p {api_port} -l {front_ip} -s {front_port} -b {branch} -r {protocolConfig} -c {front_build_config}".format(
            api_ip=params["api_ip"], api_port=params["api_port"], front_ip=params["front_ip"], front_port=params["front_port"], branch=params["branch"], protocolConfig=params["protocol_config"], front_build_config=params["front_build_config"])
        os.system("cd /jf-front; {cmd}".format(cmd=front_installer_command))
        print("==============FRONT END==============")


def get_front_src2():
    os.system("cp -a  jonathan-platform-front/. /jp-front; sleep 1")

def install_front2(params):
    if params["flag"] == "MASTER":
        print("==============FRONT INSTALLING==============")
        get_front_src2()
        front_installer_command = "./install/installer.sh -h {api_ip} -p {api_port} -l {front_ip} -s {front_port} -b {branch} -r {protocolConfig} -c {front_build_config} -u {ui_guide}".format(
            api_ip=params["api_ip"], api_port=params["api_port"], front_ip=params["front_ip"], front_port=params["front_port"], branch=params["branch"], protocolConfig=params["protocol_config"], front_build_config=params["front_build_config"], ui_guide=params["ui_guide"])
        os.system("cd /jp-front; {cmd}".format(cmd=front_installer_command))
        print("==============FRONT END==============")

def uninstall_api(params, BASE_DIR):
    if params["flag"] == "MASTER":
        print("UNINSTALL : MASTER")
        link_dir = "/jfbcore"
        os.system("docker rm -f JF-master JF-worker JF-mariadb JFB-Docker-REGISTRY")
        os.system(
            "docker rmi -f jf_api_image:latest jf_default:latest jf_cpu_jupyter:latest")
        os.system(
            "cd {BASE_DIR}/uninstaller; chmod 755 *; ./uninstaller.sh".format(BASE_DIR=BASE_DIR))
        try:
            link_dir = os.readlink("/jfbcore")
        except:
            pass
        os.system("rm -r {jfb_dir} /jfbcore".format(jfb_dir=link_dir))
    elif params["flag"] == "WORKER":
        print("UNINSTALL : WORKER")
        os.system("docker rm -f JF-master JF-worker JF-mariadb JFB-Docker-REGISTRY")
        os.system(
            "docker rmi -f jf_api_image:latest jf_default:latest jf_cpu_jupyter:latest")
        os.system(
            "cd {BASE_DIR}/uninstaller; chmod 755 *; ./uninstaller.sh".format(BASE_DIR=BASE_DIR))
        os.system("rm -r /jfbcore_worker")
    else:
        print(
            "Writed --flag {} :: you have to write MASTER | WORKER ".format(params["flag"]))


def uninstall_front():
    os.system("docker rm -f JF-front")
    os.system("rm -r /jf-front")

