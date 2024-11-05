import os
import sys
sys.path.insert(0, os.path.abspath('..'))
from settings import *
from TYPE import *

JUPYTER_LAB_VERSION="3.1.1"
JUPYTER_LAB_GIT_VERSION="0.30.0"


def pod_configuration_update_cmd_(pod_name):
    """
    Description : 
        * postStartCommand에서 실행 시 apt install이 제대로 동작 x. 그냥 command에서는 동작
        ex) 
        E: Could not get lock /var/lib/apt/lists/lock - open (11: Resource temporarily unavailable)
        E: Unable to lock directory /var/lib/apt/lists/
    """
    ## Retry  10
    # configuration_update_cmd = """
    # for i in $(seq 1 10); do
    # curl --location --request POST 'http://@HOST_IP:@FLASK_PORT/api/pod/start' \
    #     --header 'Content-Type: application/json' \
    #     --data-raw '{
    #         "pod_name": "@POD_NAME"
    #     }' | grep '"status": 1' && break
    #     echo $1
    #     sleep 1
    # done
    # """.replace("@POD_NAME", pod_name).replace("@HOST_IP", HOST_IP).replace("@FLASK_PORT", FLASK_SERVER_PORT)

    configuration_update_cmd = """
    @curl_install_command
    i=0
    while [ 1 -eq 1 ]; do
    curl --location --request POST 'http://@HOST_IP:@FLASK_PORT/api/pod/start' \
        --header 'Content-Type: application/json' \
        --data-raw '{
            "pod_name": "@POD_NAME"
        }' | grep '"status": 1' && break
        echo $i
        i=$(($i+1))
        sleep 1
    done
    """.replace("@curl_install_command", get_curl_install_cmd()).replace("@POD_NAME", pod_name).replace("@HOST_IP", HOST_IP).replace("@FLASK_PORT", FLASK_SERVER_PORT)
    return configuration_update_cmd

###########################################################
def ssh_base_setting_cmd():
    ssh_base_setting_cmd = """
        cat /etc/ssh/sshd_config | grep "^Port 22" && echo skip || cat /etc/ssh/sshd_config | grep "^#Port 22" && sed -ri 's/^#?Port\s+.*/Port 22/' /etc/ssh/sshd_config || echo "Port 22" >> /etc/ssh/sshd_config
        sed -ri 's/^#?PermitRootLogin\s+.*/PermitRootLogin yes/' /etc/ssh/sshd_config #TODO ?
        service ssh start
    """
    return ssh_base_setting_cmd

def ssh_host_linux_user_copy_cmd():
    ssh_host_linux_user_copy_cmd = """
        cat /etc_host/passwd >> /etc/passwd
        cat /etc_host/shadow >> /etc/shadow
        cat /etc_host/group >> /etc/group
        cat /etc_host/gshadow >> /etc/gshadow
        sed -ri 's/^UMASK[^:]*$/UMASK\t\t002/' /etc/login.defs #For default file permission
    """
    return ssh_host_linux_user_copy_cmd

def ssh_linux_usermod_setting_cmd():
    # Pod 시작하면서 접근 가능한 유저들에 대해 권한 설정
    # sudo group 지정 등..
    ssh_linux_usermod_setting_cmd = """
        PROJECT_USERS=($(cat /etc_host/passwd | grep home | grep -o ^[^:]*))
        echo ${PROJECT_USERS[@]}
        for (( i=0; i<${#PROJECT_USERS[@]}; i++ ))
        do
            PROJECT_USER=${PROJECT_USERS[$i]}
            echo PROJECT_USER ${PROJECT_USERS[$i]}
            if [[ "$PROJECT_USER" == "@JF_HOST" ]] ; then
                # Owner Setting
                echo "HOST"
                usermod -aG sudo @JF_HOST
                usermod -d @JF_HOME @JF_HOST
            else
                # Other User Setting
                echo "OTHER"
                usermod -g @JF_HOST $PROJECT_USER
                usermod -d @JF_HOME $PROJECT_USER
                usermod -aG sudo $PROJECT_USER
            fi
        done
    """
    ssh_linux_usermod_setting_cmd = ssh_linux_usermod_setting_cmd.replace("@JF_HOST", KUBE_ENV_JF_ITEM_OWNER_KEY_ENV)
    ssh_linux_usermod_setting_cmd = ssh_linux_usermod_setting_cmd.replace("@JF_HOME", KUBE_ENV_JF_HOME_KEY_ENV)
    return ssh_linux_usermod_setting_cmd

def ssh_linux_user_sync_cmd():
    """
    used by only kube_configmap
    """
    import utils.ssh_sync as ssh_sync
    return ssh_sync.ssh_linux_user_sync_cmd()

def ssh_user_bashrc_setting_cmd():
    # SKIP 가능
    # Jupyter, SSH 등 CLI 사용하는 케이스에
    ssh_user_bashrc_setting_cmd = """

        ls ~/.bashrc || cp /root/.bashrc ~/
        export -p >> ~/.bashrc
        sed -i 's\declare -x HOME=.*\declare -x HOME='@JF_HOME'\g' ~/.bashrc
        sed -i '/declare -x PWD=/d' ~/.bashrc
        cp ~/.bashrc /root/.bashrc

        cp /etc/skel/.* @JF_HOME/
        cp ~/.bashrc @JF_HOME/
        sed -i '/declare -x HOSTNAME=/d' @JF_HOME/.bashrc
        sed -i '/declare -x TERM=/d' @JF_HOME/.bashrc
        sed -i '/declare -x LS_COLORS=/d' @JF_HOME/.bashrc
        sed -i '/declare -x PWD=/d' @JF_HOME/.bashrc
        sed -i '/declare -x LANG=/d' @JF_HOME/.bashrc
        sed -i '/declare -x HOME=/d' @JF_HOME/.bashrc
        sed -i '/declare -x SHLVL=/d' @JF_HOME/.bashrc
    """
    ssh_user_bashrc_setting_cmd = ssh_user_bashrc_setting_cmd.replace("@JF_HOME", KUBE_ENV_JF_HOME_KEY_ENV)
    
    return ssh_user_bashrc_setting_cmd

def ssh_home_chmod_setting_cmd():
    ssh_home_chmod_setting_cmd = """
        chown @JF_HOST:@JF_HOST @JF_HOME @JF_HOME/src
        chmod 775 @JF_HOME/ @JF_HOME/src
    """
    ssh_home_chmod_setting_cmd = ssh_home_chmod_setting_cmd.replace("@JF_HOST", KUBE_ENV_JF_ITEM_OWNER_KEY_ENV)
    ssh_home_chmod_setting_cmd = ssh_home_chmod_setting_cmd.replace("@JF_HOME", KUBE_ENV_JF_HOME_KEY_ENV)
    return ssh_home_chmod_setting_cmd

def ssh_setting_cmd():
    ssh_setting_cmd = """
        {ssh_install_cmd}
        {sudo_install_cmd}
        {ssh_base_setting_cmd}
        {ssh_host_linux_user_copy_cmd}
        {ssh_linux_usermod_setting_cmd} # cd /etc_host/; ./permission.sh
        
        rm -f /root/.ssh/* # FOR default image
        {ssh_user_bashrc_setting_cmd}
        {ssh_home_chmod_setting_cmd}

    """.format(
        ssh_install_cmd=get_ssh_install_cmd(),
        sudo_install_cmd=get_sudo_install_cmd(),
        ssh_base_setting_cmd=ssh_base_setting_cmd(),
        ssh_host_linux_user_copy_cmd=ssh_host_linux_user_copy_cmd(),
        ssh_linux_usermod_setting_cmd=ssh_linux_usermod_setting_cmd(),
        ssh_user_bashrc_setting_cmd=ssh_user_bashrc_setting_cmd(),
        ssh_home_chmod_setting_cmd=ssh_home_chmod_setting_cmd()
    )
    return ssh_setting_cmd

#TODO REMOVE
def ssh_setting_cmd_old(owner):
    ssh_setting_cmd = """
        ls ~/.bashrc || cp /root/.bashrc ~/
        export -p >> ~/.bashrc
        sed -i 's\declare -x HOME=.*\declare -x HOME=/home/{owner}\g' ~/.bashrc
        sed -i '/declare -x PWD=/d' ~/.bashrc
        cp ~/.bashrc /root/.bashrc
        cd /bin; ./sshset.sh
        cd /etc_host/; ./permission.sh
        
        cp /etc/skel/.* /home/{owner}/
        cp ~/.bashrc /home/{owner}/
        rm -f /root/.ssh/*
        sed -i '/declare -x HOSTNAME=/d' /home/{owner}/.bashrc
        sed -i '/declare -x TERM=/d' /home/{owner}/.bashrc
        sed -i '/declare -x LS_COLORS=/d' /home/{owner}/.bashrc
        sed -i '/declare -x PWD=/d' /home/{owner}/.bashrc
        sed -i '/declare -x LANG=/d' /home/{owner}/.bashrc
        sed -i '/declare -x HOME=/d' /home/{owner}/.bashrc
        sed -i '/declare -x SHLVL=/d' /home/{owner}/.bashrc

        chown {owner}:{owner} /home/{owner} /home/{owner}/src
        chmod 775 /home/{owner}/ /home/{owner}/src
    """.format(owner=owner)
    return ssh_setting_cmd

###################################################################################################

def create_pod_status_installing_flag_cmd():
    # installing flag 생성
    return "touch {POD_STATUS_INSTALLING_FLAG_IN_POD}".format(POD_STATUS_INSTALLING_FLAG_IN_POD=POD_STATUS_INSTALLING_FLAG_IN_POD)

def remove_pod_status_installing_flag_cmd():
    # installing flag 삭제
    return "rm {POD_STATUS_INSTALLING_FLAG_IN_POD}".format(POD_STATUS_INSTALLING_FLAG_IN_POD=POD_STATUS_INSTALLING_FLAG_IN_POD)

def create_pod_status_error_flag_cmd():
    # error flag 생성
    return "touch {POD_STATUS_ERROR_FLAG_IN_POD}".format(POD_STATUS_ERROR_FLAG_IN_POD=POD_STATUS_ERROR_FLAG_IN_POD)

def remove_pod_status_error_flag_cmd():
    # error flag 삭제
    return "rm {POD_STATUS_ERROR_FLAG_IN_POD}".format(POD_STATUS_ERROR_FLAG_IN_POD=POD_STATUS_ERROR_FLAG_IN_POD)

def create_pod_status_stop_flag_cmd():
    # stop flag 생성
    return "touch {POD_STATUS_STOP_FLAG_IN_POD}".format(POD_STATUS_STOP_FLAG_IN_POD=POD_STATUS_STOP_FLAG_IN_POD)

def remove_pod_status_stop_flag_cmd():
    # stop flag 삭제
    return "rm {POD_STATUS_STOP_FLAG_IN_POD}".format(POD_STATUS_STOP_FLAG_IN_POD=POD_STATUS_STOP_FLAG_IN_POD)

def create_pod_status_running_flag_cmd():
    # stop flag 생성
    return "touch {POD_STATUS_RUNNING_FLAG_IN_POD}".format(POD_STATUS_RUNNING_FLAG_IN_POD=POD_STATUS_RUNNING_FLAG_IN_POD)

def remove_pod_status_running_flag_cmd():
    # stop flag 생성
    return "rm {POD_STATUS_RUNNING_FLAG_IN_POD}".format(POD_STATUS_RUNNING_FLAG_IN_POD=POD_STATUS_RUNNING_FLAG_IN_POD)

###################################################################################################

def get_deployment_api_wait_cmd(worker_home, installing_flag, config_check_flag):
    config_wait = """
        mkdir -p {worker_home}
        touch {installing_flag}
        touch {config_check_flag}
        for i in $(seq 0 10)
        do
            touch {config_check_flag}
            result=$(echo $?)
            echo $i config_check $result
            if [ $result -gt 0 ]; then
                break
            fi

            sleep 1
        done
    """.format(worker_home=worker_home, installing_flag=installing_flag, config_check_flag=config_check_flag)
    
    return config_wait

def get_api_running_checker_cmd(api_port, action="", init="", no_break_action=""):
    api_checker = """
        # touch .installing
        {init}
        for i in $(seq 0 999)
        do
            echo api_checking $i
            # lsof -i TCP:{api_port} && {action} && break
            # curl localhost:{api_port}/call/running/checker 2> /dev/null && ({action} || echo "action fail") && break  # curl -> netstat 변경
            netstat -nltp | grep :{api_port} 2> /dev/null && ({action} || echo "action fail") && break 
            sleep 1
        done
        {no_break_action}
    """.format(init=init, api_port=api_port, action=action, no_break_action=no_break_action)

    return api_checker

def get_api_stop_checker_cmd(api_port, action="", init=""):
    # 먼저 동작 하고 있는지 확인 후 stop 체크로 넘어가기
    # 동작 체크는 해당 API가 실행 되는지 까지 while 돌다가 실행 되는걸 감지하면 stop check로 넘어가기
    api_checker = """
    CHECK_PORT={api_port}
    {init}
    while [ 1 -eq 1 ];
    do
        netstat -nltp | grep :$CHECK_PORT 2> /dev/null && (echo "RUN" || echo "action fail") && break
        sleep 1
    done

    while [ 1 -eq 1 ];
    do
        netstat -nltp | grep :$CHECK_PORT > /dev/null 2>&1 
        if [ $? -eq 0 ];
        then
            # echo "RUN"
            continue 
        else
            echo "TARGET API STOP"
            {action}
            break
        fi
        sleep 1
    done
    """.format(init=init, api_port=api_port, action=action)

    return api_checker

def get_api_checker_cmd(api_port, running_action="", stop_action="", init=""):
    api_checker = """
    CHECK_PORT={api_port}
    {init}
    while [ 1 -eq 1 ];
    do
        netstat -nltp | grep :$CHECK_PORT 2> /dev/null && (echo "RUN" || echo "action fail") && break
        sleep 1
    done

    while [ 1 -eq 1 ];
    do
        netstat -nltp | grep :$CHECK_PORT > /dev/null 2>&1 
        if [ $? -eq 0 ];
        then
            # echo "RUN"
            {running_action}
            continue 
        else
            echo "TARGET API STOP"
            {stop_action}
        fi
        sleep 1
    done
    """.format(init=init, api_port=api_port, running_action=running_action, stop_action=stop_action)
    return api_checker

def ssh_banner_cmd(banner_string=""):
    def ssh_banner_load():
        default_banner = '''
   mmm                         m    #
     #   mmm   m mm    mmm   mm#mm  # mm    mmm   m mm
     #  #" "#  #"  #  "   #    #    #"  #  "   #  #"  #
     #  #   #  #   #  m"""#    #    #   #  m"""#  #   #
 "mmm"  "#m#"  #   #  "mm"#    "mm  #   #  "mm"#  #   #

 mmmmmm ""#      "           #        m    mmmmm
 #        #    mmm     mmmm  # mm   mm#mm  #    #  mmm    mmm    mmm
 #mmmmm   #      #    #" "#  #"  #    #    #mmmm" "   #  #   "  #"  #
 #        #      #    #   #  #   #    #    #    # m"""#   """m  #""""
 #        "mm  mm#mm  "#m"#  #   #    "mm  #mmmm" "mm"#  "mmm"  "#mm"
                       m  #
                        ""
        '''
        banner = default_banner.split("\n")
        try:
            if SSH_BANNER_FILE_PATH is not None:
                with open(SSH_BANNER_FILE_PATH, "r") as f:
                    banner = f.readlines()
        except FileNotFoundError as fe:
            pass
        except TypeError as te:
            traceback.print_exc()
        except Exception as e:
            traceback.print_exc()

        return banner
    
    banner = ssh_banner_load()
    # after ssh setting
    banner_path = "/etc/ssh/jf-sshd-banner"
    banner_cmd = ""

    for i, b in enumerate(banner):
        banner_cmd += "echo '{}' >> {}".format(b, banner_path)
        if i != len(banner) - 1:
            banner_cmd += " && "
        else :
            banner_cmd += " && "
            banner_cmd += "echo '{}' >> {} && ".format(banner_string, banner_path)
            banner_cmd += "echo ' ' >> {} && ".format(banner_path)
            banner_cmd += "cat sshd_config | grep '^Banner {banner_path}' || echo 'Banner {banner_path}' >> /etc/ssh/sshd_config && ".format(banner_path=banner_path)
            banner_cmd += "service ssh restart"

    return banner_cmd

def ssh_motd_cmd():
    def ssh_motd_load():
        default_motd = "MOTD TEMP \n" \
                        "1. $HOME/src 하위에 파일을 저장해야 합니다. \n" \
                        "   다른곳에 저장 시 재시작 시 데이터가 지워지며 작업 환경이 강제로 종료 될 수 있습니다. \n" \
                        "2. $HOME/datasets_ro, $HOME/datasets_rw 의 데이터 사용 시 데이터 추가, 수정, 삭제에 주의해주십시오. \n" \
                        "   실제 Dataset 목록에 연결되어 있습니다. CP 하여 사용하는 것을 권장합니다. "
        
        motd = default_motd.split("\n")
        try:
            if SSH_MOTD_FILE_PATH is not None:
                with open(SSH_MOTD_FILE_PATH, "r") as f:
                    motd = f.readlines()
        except FileNotFoundError as fe:
            pass
        except TypeError as te:
            traceback.print_exc()
        except Exception as e:
            traceback.print_exc()

        return motd
    
    motd = ssh_motd_load()    
    motd_path = "/etc/motd"
    motd_cmd = "echo '' > {} && ".format(motd_path)
    
    for i, m in enumerate(motd):
        motd_cmd += "echo '{}' >> {}".format(m, motd_path)
        if i != len(motd) - 1:
            motd_cmd += " && "

    return motd_cmd

def get_jf_support_bin_export_cmd():
    # jf_support_bin_export_cmd = "export PATH=$PATH:{JF_SUPPORT_BINARY_POD_PATH}:/test".format(JF_SUPPORT_BINARY_POD_PATH=JF_SUPPORT_BINARY_POD_PATH)
    jf_support_bin_export_cmd="PATH=$PATH:{JF_SUPPORT_BINARY_POD_PATH}".format(JF_SUPPORT_BINARY_POD_PATH=JF_SUPPORT_BINARY_POD_PATH)
    return jf_support_bin_export_cmd

def get_jf_addlib_export_cmd():
    jf_addlib_export_cmd="PYTHONPATH=$PYTHONPATH:{JF_ADDLIB_POD_PATH}".format(JF_ADDLIB_POD_PATH=JF_ADDLIB_POD_PATH)
    return jf_addlib_export_cmd

def get_jf_support_bin_env_export_append_cmd():
    # jf_support_bin_env_export_append_cmd = "echo '{}' >> $HOME/.bashrc; source $HOME/.bashrc".format(
    #     'export PATH=$PATH:{JF_SUPPORT_BINARY_POD_PATH}'.format(JF_SUPPORT_BINARY_POD_PATH=JF_SUPPORT_BINARY_POD_PATH)
    # )
    jf_support_bin_env_export_append_cmd = "echo '{}' >> $HOME/.bashrc".format(
        'export "PATH=$PATH:{JF_SUPPORT_BINARY_POD_PATH}"'.format(JF_SUPPORT_BINARY_POD_PATH=JF_SUPPORT_BINARY_POD_PATH)
    )
    # return "echo SKIP"
    return jf_support_bin_env_export_append_cmd

def get_jf_addlib_env_export_append_cmd():
    # append_system_path_cmd = "echo '{}' >> $HOME/.bashrc && source $HOME/.bashrc".format('export PATH="/addlib:$PATH"')
    jf_addlib_env_export_append_cmd = "echo '{}' >> $HOME/.bashrc".format(
        'export "AAAA=$PYTHONPATH:{JF_ADDLIB_POD_PATH}"'.format(JF_ADDLIB_POD_PATH=JF_ADDLIB_POD_PATH)
    )
    return jf_addlib_env_export_append_cmd

def get_ssh_install_cmd():
    # ssh_install_cmd = "ssh -V || apt install -y ssh  --no-install-recommends || (apt update; apt install -y ssh --no-install-recommends)"
    ssh_install_cmd = "service ssh start  || apt install -y ssh  --no-install-recommends || (apt update; apt install -y ssh --no-install-recommends) || (apt update; apt install -y --force-yes ssh --no-install-recommends)"
    return ssh_install_cmd

def get_sudo_install_cmd():
    sudo_install_cmd = "sudo --version || apt install -y sudo --no-install-recommends || (apt update; apt install -y sudo --no-install-recommends) || (apt update; apt install -y --force-yes sudo --no-install-recommends)"
    return sudo_install_cmd

def get_curl_install_cmd():
    curl_install_cmd = "curl --version || apt install -y curl --no-install-recommends || ( apt update; apt install -y curl --no-install-recommends)"
    return curl_install_cmd

def get_git_install_cmd():
    git_install_cmd = "git --version || apt install -y git --no-install-recommends"
    return git_install_cmd

def get_pip3_install_cmd():
    pip3_install_cmd = "pip3 --version || (apt-get install -y python3-distutils; curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py; python3 get-pip.py --force-reinstall; rm get-pip.py)"
    return pip3_install_cmd

def get_pip3_3_6_install_cmd():
    """
    Description : https://bootstrap.pypa.io/get-pip.py 에서 더 이상 지원하지 않는 버전 때문에 자동 설치 시 3.6 (jf_default) 까지는 재시도
    """
    pip3_install_cmd = "pip3 --version || (apt-get install -y python3-distutils; curl https://bootstrap.pypa.io/pip/3.6/get-pip.py -o get-pip.py; python3 get-pip.py --force-reinstall; rm get-pip.py)"
    return pip3_install_cmd

def get_jupyter_package_update_cmd():
    jupyter_package_update_cmd = "pip3 uninstall -y jupyter-core || pip3 install jupyter-core==4.7.1"
    return jupyter_package_update_cmd

def get_jupyterlab_install_cmd():
    jupyterlab_install_cmd = "pip3 list | grep 'jupyterlab ' | grep {JUPYTER_LAB_VERSION}  || pip3 install jupyterlab=={JUPYTER_LAB_VERSION}".format(JUPYTER_LAB_VERSION=JUPYTER_LAB_VERSION)
    return jupyterlab_install_cmd

def get_jupyterlab_git_install_cmd():
    jupyterlab_git_install_cmd = "pip3 list | grep 'jupyterlab-git ' | grep {JUPYTER_LAB_GIT_VERSION} || pip3 install jupyterlab-git=={JUPYTER_LAB_GIT_VERSION}".format(JUPYTER_LAB_GIT_VERSION=JUPYTER_LAB_GIT_VERSION)
    return jupyterlab_git_install_cmd

def get_jupyterlab_extension_cmd():
    # matplot 사용 관련
    jupyterlab_extension_cmd = "pip3 install | grep 'ipympl' | grep {IPYMPL_VERSION} || pip3 install ipympl; jupyter labextension install @jupyter-widgets/jupyterlab-manager jupyter-matplotlib".format(IPYMPL_VERSION="0.7.0")
    return jupyterlab_extension_cmd

def get_nginx_install_cmd():
    # nginx install
    nginx_install_cmd = "apt update; DEBIAN_FRONTEND=noninteractive apt install -y nginx"
    return nginx_install_cmd

def get_nginx_conf_setting(api_running_checker_cmd):
    nginx_conf_setting_cmd = """
        cp -f @DEPLOYMENT_NGINX_CONF_PATH_IN_POD/@DEPLOYMENT_NGINX_DEFAULT_CONF_FILE_NAME /etc/nginx/  
        cp -f @DEPLOYMENT_NGINX_CONF_PATH_IN_POD/@DEPLOYMENT_NGINX_API_CONF_FILE_NAME /etc/nginx/conf.d/ 

        # PORT SETTING
        sed 's/@DEPLOYMENT_NGINX_DEFAULT_PORT/@NGINX_DEFAULT_PORT/' -i /etc/nginx/conf.d/@DEPLOYMENT_NGINX_API_CONF_FILE_NAME
        sed 's/@DEPLOYMENT_API_DEFAULT_PORT/@API_DEFAULT_PORT/' -i /etc/nginx/conf.d/@DEPLOYMENT_NGINX_API_CONF_FILE_NAME

        # LOG FILE PATH
        sed 's/@NGINX_ACCESS_LOG_DEFAULT_PATH/@POD_NGINX_ACEESS_LOG_FILE_PATH_IN_POD/' -i /etc/nginx/conf.d/@DEPLOYMENT_NGINX_API_CONF_FILE_NAME
        sed 's/@NGINX_ERROR_LOG_DEFAULT_PATH/@POD_NGINX_ERROR_LOG_FILE_PATH_IN_POD/' -i /etc/nginx/conf.d/@DEPLOYMENT_NGINX_API_CONF_FILE_NAME

        # Worker Processes Setting
        sed 's/worker_processes.*/worker_processes '$(((${{JF_CPU%.*}} + 2 - 1) / 2))';/' -i /etc/nginx/nginx.conf

        {api_running_checker_cmd}
        service nginx restart
    """.format(api_running_checker_cmd=api_running_checker_cmd)
    nginx_conf_setting_cmd = nginx_conf_setting_cmd.replace("@DEPLOYMENT_NGINX_CONF_PATH_IN_POD", DEPLOYMENT_NGINX_CONF_PATH_IN_POD)
    nginx_conf_setting_cmd = nginx_conf_setting_cmd.replace("@DEPLOYMENT_NGINX_DEFAULT_CONF_FILE_NAME", DEPLOYMENT_NGINX_DEFAULT_CONF_FILE_NAME)
    nginx_conf_setting_cmd = nginx_conf_setting_cmd.replace("@DEPLOYMENT_NGINX_API_CONF_FILE_NAME", DEPLOYMENT_NGINX_API_CONF_FILE_NAME)

    nginx_conf_setting_cmd = nginx_conf_setting_cmd.replace("@POD_NGINX_ACEESS_LOG_FILE_PATH_IN_POD", POD_NGINX_ACEESS_LOG_FILE_PATH_IN_POD.replace("/","\/"))
    nginx_conf_setting_cmd = nginx_conf_setting_cmd.replace("@POD_NGINX_ERROR_LOG_FILE_PATH_IN_POD", POD_NGINX_ERROR_LOG_FILE_PATH_IN_POD.replace("/","\/"))

    nginx_conf_setting_cmd = nginx_conf_setting_cmd.replace("@NGINX_DEFAULT_PORT", str(DEPLOYMENT_NGINX_DEFAULT_PORT))
    nginx_conf_setting_cmd = nginx_conf_setting_cmd.replace("@API_DEFAULT_PORT", str(DEPLOYMENT_API_DEFAULT_PORT))

    return nginx_conf_setting_cmd

def get_resource_env_add_command(env_list):
    # resource_env
    # [{
    #     "name": @@,
    #     "value": @@,
    # }]
    env_path = "/etc/environment"
    env_add_command = ""
    if env_list is not None:
        for env in env_list:
            env_add_command += "echo '{key}={value}' >> {env_path} && ".format(key=env["name"], value=env["value"], env_path=env_path)
            
        env_add_command = env_add_command[:-3]

    return env_add_command

def get_nodejs_setting_cmd():
    nodejs_setting_cmd = """
        curl -sL https://deb.nodesource.com/setup_14.x | bash -
        apt-get update; apt -y install nodejs 
        apt-get install gcc g++ make
        curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | tee /usr/share/keyrings/yarnkey.gpg >/dev/null
        echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | tee /etc/apt/sources.list.d/yarn.list
        apt-get update; apt-get install yarn
    """
    # #=14.17.4-deb-1nodesource1 
    # CBTP 설치 중 14.17.4-deb-1nodesource1
    return nodejs_setting_cmd

def get_jupyter_lab_chmod_setting_cmd():
    jupyter_lab_chmod_settin_cmd = "chmod 777 /usr/local/share/jupyter/lab && chmod 777 /usr/local/share/jupyter/lab/*"
    return jupyter_lab_chmod_settin_cmd

def get_user_base_cmd(auth="root"):
    return "su {auth} -c ".format(auth=auth)

def get_jupyter_lab_run_cmd(base_url, auth="root"):
    user_base_cmd = get_user_base_cmd(auth=auth)
    #TODO su root -c "jupyter" -> command not found error 발생 해결 필요..
    # jupyter_lab_run_cmd = "{user_base_cmd} 'jupyter lab --allow-root --ip 0.0.0.0 --notebook-dir /home/{owner} --NotebookApp.base_url={base_url} --NotebookApp.allow_origin=*'".format(user_base_cmd=user_base_cmd, owner=owner, base_url=base_url)
    jupyter_lab_run_cmd = "cd @JF_HOME && export SHELL=/bin/bash && jupyter lab --allow-root --ip 0.0.0.0 --notebook-dir @JF_HOME --NotebookApp.base_url={base_url} --NotebookApp.allow_origin=* ".format(base_url=base_url)  # 2> /.jupyter-log
    jupyter_lab_run_cmd = jupyter_lab_run_cmd.replace("@JF_HOME", KUBE_ENV_JF_HOME_KEY_ENV)
    # base url 제거 + rewrite target(/$2) + ingress annotaion(/|$(.*)) 옵션 주고 했을 때 302 문제 발생.. 제대로 전달 못함
    return jupyter_lab_run_cmd

def get_jupyter_lab_url_cmd(n, auth="root"):
    # get_jupyter_lab_run_cmd 에 따라서 url 가져오는 방식이 달라 질 수 있음
    user_base_cmd = get_user_base_cmd(auth=auth)
    # jupyter_lab_url_cmd = """{user_base_cmd} "jupyter lab list | grep http" """.format(user_base_cmd=user_base_cmd)
    
    # CMD          D N
    # jupyter list X X
    # jupyter notebook list X O
    # jupyter-notebook list X O
    # jupyter lab list O X
    cmd_list = [
        "jupyter list",
        "jupyter notebook list",
        "jupyter-notebook list",
        "jupyter lab list"
    ]

    jupyter_lab_url_cmd = """{cmd} | grep http """.format(cmd=cmd_list[n % len(cmd_list)])
    return jupyter_lab_url_cmd

def get_jupyter_lab_url_from_log_cmd():
    jupyter_lab_url_from_log_cmd = """cat /.jupyter-log | grep token=?"""

def jupyter_lab_setting_cmd(base_url):
    # python 3.6 + jupyterlab >= 3.0
    # jupyterlab < 3 --> jupyter lab build (with nodejs npm --> apt install -y nodejs(v8.10.0) npm(3.5.2)) 
    # git > 2
    # TODO jupyterlab git 기본 장착 시 jupyter lab 체크 후 바로 실행하도록

    if JUPYTER_AUTO_INSTALL==True:
        jupyter_lab_setting_cmd = """
            rm {POD_STATUS_ERROR_FLAG_IN_POD}
            {jupyter_lab_run_cmd}
            {install_node}
            {check_curl}
            {check_git}
            {check_pip3}
            {check_pip3_3_6}
            
            {update_jupyter_package}
            {check_jupyterlab}
            {check_jupyterlab_git}
            
            {jupyterlab_extension}

            {jupyter_lab_run_cmd}
            touch {POD_STATUS_ERROR_FLAG_IN_POD}
        """.format(check_curl=get_curl_install_cmd(),
                    check_git=get_git_install_cmd(),
                    check_pip3=get_pip3_install_cmd(),
                    check_pip3_3_6=get_pip3_3_6_install_cmd(),
                    update_jupyter_package=get_jupyter_package_update_cmd(),
                    jupyterlab_extension=get_jupyterlab_extension_cmd(),
                    jupyter_lab_run_cmd=get_jupyter_lab_run_cmd(base_url=base_url),
                    install_node=get_nodejs_setting_cmd(),
                    check_jupyterlab=get_jupyterlab_install_cmd(),
                    check_jupyterlab_git=get_jupyterlab_git_install_cmd(),
                    POD_STATUS_ERROR_FLAG_IN_POD=POD_STATUS_ERROR_FLAG_IN_POD
            )
    else:
        jupyter_lab_setting_cmd = """
            rm {POD_STATUS_ERROR_FLAG_IN_POD}
            {jupyter_lab_run_cmd}
            touch {POD_STATUS_ERROR_FLAG_IN_POD}
        """.format(
                jupyter_lab_run_cmd=get_jupyter_lab_run_cmd(base_url=base_url),
                POD_STATUS_ERROR_FLAG_IN_POD=POD_STATUS_ERROR_FLAG_IN_POD
            )
    # User 권한 jupyter의 경우 필요
    # {update_jupyter_chmod}
    # update_jupyter_chmod=get_jupyter_lab_chmod_setting_cmd(),

    return jupyter_lab_setting_cmd

def jupyter_lab_setting_cmd_for_editor(base_url):
    jupyter_lab_setting_cmd = """
            rm {POD_STATUS_ERROR_FLAG_IN_POD}
            
            {jupyter_lab_run_cmd}
            touch {POD_STATUS_ERROR_FLAG_IN_POD}
        """.format(
            jupyter_lab_run_cmd=get_jupyter_lab_run_cmd(base_url=base_url),
            POD_STATUS_ERROR_FLAG_IN_POD=POD_STATUS_ERROR_FLAG_IN_POD
        )
    return jupyter_lab_setting_cmd

def tensorboard_setting_cmd(base_url): 
    tensorboard_setting_cmd = """
        # pip install tensorboard==1.12.0
        tensorboard --logdir /job-checkpoints --path_prefix {base_url} --host 0.0.0.0 &
    """.format(base_url=base_url)
    return tensorboard_setting_cmd

def cpu_ram_resource_record_cmd():
    # record_cmd = """
    # nproc=$(nproc)
    # while [ 1 -eq 1 ]; do
    #     mem_usage=$(cat /sys/fs/cgroup/memory/memory.usage_in_bytes)
    #     cpu_usage=$(ps -A -o pcpu | tail -n+2)

    #     total_cpu_usage=0
    #     for i in $cpu_usage; do
    #         total_cpu_usage=$(awk '{print $1+$2}' <<<"$i $total_cpu_usage")
    #     done

    #     total_cpu_usage=$(awk '{print $1/$2}' <<<"$total_cpu_usage $nproc")

    #     #echo CPU $total_cpu_usage
    #     #echo MEM $mem_usage
    #     echo '{ "cpu_usage": '$total_cpu_usage', "mem_usage": '$mem_usage' }' > /@POD_NAME/resource_usage.json
    #     sleep 1
    # done
    # """.replace("@POD_NAME", pod_name)
    # 
    # record_cmd="""
    # nproc=$(nproc)
    # period=$(cat /sys/fs/cgroup/cpu/cpu.cfs_period_us)
    # quota=$(cat /sys/fs/cgroup/cpu/cpu.cfs_quota_us)
    # podnproc=$(awk '{print $1/$2}' <<<"$quota $period")

    # touch @POD_CPU_RAM_RESOURCE_USAGE_RECORD_FILE_PATH_IN_POD
    # chmod 755 @POD_CPU_RAM_RESOURCE_USAGE_RECORD_FILE_PATH_IN_POD

    # while [ 1 -eq 1 ]; do
    #     mem_usage=$(cat /sys/fs/cgroup/memory/memory.usage_in_bytes)
    #     mem_limit=$(cat /sys/fs/cgroup/memory/memory.limit_in_bytes)
    #     cpu_usage=$(ps -A -o pcpu | tail -n+2)
    #     timestamp=$(date +%s)

    #     total_cpu_usage=0
    #     for i in $cpu_usage; do
    #         total_cpu_usage=$(awk '{print $1+$2}' <<<"$i $total_cpu_usage")
    #     done

    #     cpu_usage_on_node=$(awk '{print $1/$2}' <<<"$total_cpu_usage $nproc")
    #     cpu_usage_on_pod=$(awk '{print $1/$2}' <<<"$total_cpu_usage $podnproc")

    #     mem_usage_per=$(awk "BEGIN {print $mem_usage / $mem_limit * 100}")
    #     mem_usage_per=$(printf "%.4f" $mem_usage_per)
    #     echo '{ "@CPU_USAGE_ON_NODE_KEY": '$cpu_usage_on_node', "@CPU_USAGE_ON_POD_KEY": '$cpu_usage_on_pod', "@MEM_USAGE_KEY": '$mem_usage', "@MEM_LIMIT_KEY": '$mem_limit', "@MEM_USAGE_PER_KEY": '$mem_usage_per', "@TIMESTAMP_KEY": '$timestamp', "@CPU_CORES_ON_POD_KEY": '$podnproc' }' > @POD_CPU_RAM_RESOURCE_USAGE_RECORD_FILE_PATH_IN_POD
    #     cat @POD_CPU_RAM_RESOURCE_USAGE_RECORD_FILE_PATH_IN_POD >> @POD_CPU_RAM_RESOURCE_USAGE_HISTORY_FILE_PATH_IN_POD
    #     sleep 1
    #     @CUT_COMMAND
    # done
    # """

    # 2022-08-03 - CPU 사용량 측정 방법 변경 - nproc 소수점 케이스 테스트 완료
    record_cmd ="""
    nproc=$(nproc)
    period=$(cat /sys/fs/cgroup/cpu/cpu.cfs_period_us)
    quota=$(cat /sys/fs/cgroup/cpu/cpu.cfs_quota_us)
    podnproc=$(awk '{print $1/$2}' <<<"$quota $period")

    touch @POD_CPU_RAM_RESOURCE_USAGE_RECORD_FILE_PATH_IN_POD
    chmod 755 @POD_CPU_RAM_RESOURCE_USAGE_RECORD_FILE_PATH_IN_POD

    while [ 1 -eq 1 ]; do
        mem_usage=$(cat /sys/fs/cgroup/memory/memory.usage_in_bytes)
        mem_limit=$(cat /sys/fs/cgroup/memory/memory.limit_in_bytes)

        tstart=$(date +%s%N)
        cstart=$(cat /sys/fs/cgroup/cpu/cpuacct.usage)
        sleep 1
        tstop=$(date +%s%N)
        cstop=$(cat /sys/fs/cgroup/cpu/cpuacct.usage)
        cpu_usage=$(awk '{print ($1-$2)/($3-$4)*100 }' <<<"$cstop $cstart $tstop $tstart")

        timestamp=$(date +%s)

        cpu_usage_on_node=$(awk '{print $1/$2}' <<<"$cpu_usage $nproc")
        cpu_usage_on_pod=$(awk '{print $1/$2}' <<<"$cpu_usage $podnproc")

        mem_usage_per=$(awk "BEGIN {print $mem_usage / $mem_limit * 100}")
        mem_usage_per=$(printf "%.4f" $mem_usage_per)
        echo '{"@CPU_USAGE_ON_NODE_KEY":'$cpu_usage_on_node',"@CPU_USAGE_ON_POD_KEY":'$cpu_usage_on_pod',"@MEM_USAGE_KEY":'$mem_usage',"@MEM_LIMIT_KEY":'$mem_limit',"@MEM_USAGE_PER_KEY":'$mem_usage_per',"@TIMESTAMP_KEY":'$timestamp',"@CPU_CORES_ON_POD_KEY":'$podnproc'}' > @POD_CPU_RAM_RESOURCE_USAGE_RECORD_FILE_PATH_IN_POD
        cat @POD_CPU_RAM_RESOURCE_USAGE_RECORD_FILE_PATH_IN_POD >> @POD_CPU_RAM_RESOURCE_USAGE_HISTORY_FILE_PATH_IN_POD

        @CUT_COMMAND

    done
    """
    record_cmd = record_cmd.replace("@POD_CPU_RAM_RESOURCE_USAGE_RECORD_FILE_PATH_IN_POD", POD_CPU_RAM_RESOURCE_USAGE_RECORD_FILE_PATH_IN_POD)
    record_cmd = record_cmd.replace("@POD_CPU_RAM_RESOURCE_USAGE_HISTORY_FILE_PATH_IN_POD", POD_CPU_RAM_RESOURCE_USAGE_HISTORY_FILE_PATH_IN_POD)
    record_cmd = record_cmd.replace("@CPU_USAGE_ON_NODE_KEY", CPU_USAGE_ON_NODE_KEY)
    record_cmd = record_cmd.replace("@CPU_USAGE_ON_POD_KEY", CPU_USAGE_ON_POD_KEY)
    record_cmd = record_cmd.replace("@MEM_USAGE_KEY", MEM_USAGE_KEY)
    record_cmd = record_cmd.replace("@MEM_LIMIT_KEY", MEM_LIMIT_KEY)
    record_cmd = record_cmd.replace("@MEM_USAGE_PER_KEY", MEM_USAGE_PER_KEY)
    record_cmd = record_cmd.replace("@TIMESTAMP_KEY", TIMESTAMP_KEY)
    record_cmd = record_cmd.replace("@CPU_CORES_ON_POD_KEY", CPU_CORES_ON_POD_KEY)
    record_cmd = record_cmd.replace("@CUT_COMMAND", get_history_log_cut_command(POD_CPU_RAM_RESOURCE_USAGE_HISTORY_FILE_PATH_IN_POD))
    return record_cmd

def gpu_resource_record_cmd(pod_name):
    # MULTI GPU CASE
    # MIG CASE
    # nvidia-smi --format=csv,noheader,nounits --query-gpu=utilization.gpu,utilization.memory,memory.free,memory.used,memory.total
    # [N/A], [N/A], [Insufficient Permissions], [Insufficient Permissions], [Insufficient Permissions]

    # record_cmd="""
    # re='^[ ]*?[0-9]+([.][0-9]+)?$'
    # nvidia-smi >> /dev/null
    # while [ $? -eq 0 ]; do
    #     nvidia_log=$(nvidia-smi --format=csv,noheader,nounits --query-gpu=utilization.gpu,utilization.memory,memory.free,memory.used,memory.total | sed -e "s/Insufficient Permissions/Insufficient_Permissions/g")
    #     nvidia_logs=$(echo $nvidia_log | tr "," " ")
    #     timestamp=$(date +%s)

    #     # echo $nvidia_logs
    #     array=($nvidia_logs)
    #     util_gpu=${array[0]}
    #     util_memory=${array[1]}
    #     memory_free=${array[2]}
    #     memory_used=${array[3]}
    #     memory_total=${array[4]}

    #     if ! [[ $utils_gpu =~ $re ]] ; then
    #        echo "error: utils_gpu Not a number"
    #        util_gpu='"'$util_gpu'"'
    #     fi
    #     if ! [[ $util_memory =~ $re ]] ; then
    #        echo "error: util_memory Not a number"
    #        util_memory='"'$util_memory'"'
    #     fi
    #     if ! [[ $memory_free =~ $re ]] ; then
    #        echo "error: memory_free Not a number"
    #        memory_free='"'$memory_free'"'
    #     fi
    #     if ! [[ $memory_used =~ $re ]] ; then
    #        echo "error: memory_used Not a number"
    #        memory_used='"'$memory_used'"'
    #     fi
    #     if ! [[ $memory_total =~ $re ]] ; then
    #        echo "error: memory_total Not a number"
    #        memory_total='"'$memory_total'"'
    #     fi

    #     echo '{ "@GPU_UTIL_KEY": '$util_gpu', "@GPU_MEM_UTIL_KEY": '$util_memory', "@GPU_MEM_FREE_KEY": '$memory_free', "@GPU_MEM_USED_KEY": '$memory_used', "@GPU_MEM_TOTAL_KEY": '$memory_total', "@TIMESTAMP_KEY": '$timestamp' }' > @POD_GPU_USAGE_RECORD_FILE_PATH_IN_POD
    #     cat @POD_GPU_USAGE_RECORD_FILE_PATH_IN_POD >> @POD_GPU_USAGE_HISTORY_FILE_PATH_IN_POD
    #     sleep 1
    # done
    # """
    record_cmd="""
    nvidia_gpu_count=$(nvidia-smi -L | wc -l)
    echo $nvidia_gpu_count

    nvidia-smi >> /dev/null
    nvidia_smi_result=$?
    echo $nvidia_smi_result

    re='^[ ]*?[0-9]+([.][0-9]+)?$'
    while [ $nvidia_smi_result -eq 0 ] && [ $nvidia_gpu_count -gt 0 ]; do
        nvidia_log=$(nvidia-smi --format=csv,noheader,nounits --query-gpu=utilization.gpu,utilization.memory,memory.free,memory.used,memory.total | sed -e "s/Insufficient Permissions/Insufficient_Permissions/g" | tr "," " ")
        #nvidia_log=$(echo $nvidia_log | tr "," " ")
        timestamp=$(date +%s)

        SAVEIFS=$IFS
        IFS=$'\n'
        nvidia_logs=($nvidia_log)
        IFS=$SAVEIFS

        nvidia_log_jsons=()

        for (( i=0; i<${#nvidia_logs[@]}; i++ ))
        do
            # echo "$i: ${nvidia_logs[$i]}"
            array=(${nvidia_logs[$i]})

            util_gpu=${array[0]}
            util_memory=${array[1]}
            memory_free=${array[2]}
            memory_used=${array[3]}
            memory_total=${array[4]}

            if ! [[ $util_gpu =~ $re ]] ; then
                # echo "error: util_gpu Not a number"
                util_gpu='"'$util_gpu'"'
            fi
            if ! [[ $util_memory =~ $re ]] ; then
                # echo "error: util_memory Not a number"
                util_memory='"'$util_memory'"'
            fi
            if ! [[ $memory_free =~ $re ]] ; then
                # echo "error: memory_free Not a number"
                memory_free='"'$memory_free'"'
            fi
            if ! [[ $memory_used =~ $re ]] ; then
                # echo "error: memory_used Not a number"
                memory_used='"'$memory_used'"'
            fi
            if ! [[ $memory_total =~ $re ]] ; then
                # echo "error: memory_total Not a number"
                memory_total='"'$memory_total'"'
            fi

            if [ $i -eq 0 ]
            then
                nvidia_log_jsons[$i]='{ "'$i'": { "@GPU_UTIL_KEY": '$util_gpu', "@GPU_MEM_UTIL_KEY": '$util_memory', "@GPU_MEM_FREE_KEY": '$memory_free', "@GPU_MEM_USED_KEY": '$memory_used', "@GPU_MEM_TOTAL_KEY": '$memory_total', "@TIMESTAMP_KEY": '$timestamp' }'
            else
                nvidia_log_jsons[$i]=', "'$i'": { "@GPU_UTIL_KEY": '$util_gpu', "@GPU_MEM_UTIL_KEY": '$util_memory', "@GPU_MEM_FREE_KEY": '$memory_free', "@GPU_MEM_USED_KEY": '$memory_used', "@GPU_MEM_TOTAL_KEY": '$memory_total', "@TIMESTAMP_KEY": '$timestamp' }'
            fi
        done
        nvidia_log_jsons[$i]='}'

        echo ${nvidia_log_jsons[@]} > @POD_GPU_USAGE_RECORD_FILE_PATH_IN_POD
        cat @POD_GPU_USAGE_RECORD_FILE_PATH_IN_POD >> @POD_GPU_USAGE_HISTORY_FILE_PATH_IN_POD
        sleep 1
        @CUT_COMMAND
    done
    """
    record_cmd = record_cmd.replace("@POD_GPU_USAGE_RECORD_FILE_PATH_IN_POD", POD_GPU_USAGE_RECORD_FILE_PATH_IN_POD.format(pod_name=pod_name))
    record_cmd = record_cmd.replace("@POD_GPU_USAGE_HISTORY_FILE_PATH_IN_POD", POD_GPU_USAGE_HISTORY_FILE_PATH_IN_POD.format(pod_name=pod_name))
    record_cmd = record_cmd.replace("@GPU_UTIL_KEY", GPU_UTIL_KEY)
    record_cmd = record_cmd.replace("@GPU_MEM_UTIL_KEY", GPU_MEM_UTIL_KEY)
    record_cmd = record_cmd.replace("@GPU_MEM_FREE_KEY", GPU_MEM_FREE_KEY)
    record_cmd = record_cmd.replace("@GPU_MEM_USED_KEY", GPU_MEM_USED_KEY)
    record_cmd = record_cmd.replace("@GPU_MEM_TOTAL_KEY", GPU_MEM_TOTAL_KEY)
    record_cmd = record_cmd.replace("@TIMESTAMP_KEY", TIMESTAMP_KEY)
    record_cmd = record_cmd.replace("@CUT_COMMAND", get_history_log_cut_command(POD_GPU_USAGE_HISTORY_FILE_PATH_IN_POD.format(pod_name=pod_name)))

    return record_cmd

def pod_run_time_record_cmd(pod_name):
    record_cmd="""
        format="+@POD_RUN_TIME_DATE_FORMAT"
        
        #FOR restart Case
        old_start_time=$(cat @POD_RUN_TIME_FILE_PATH_IN_POD | sed 's/,.*//g'  | sed 's/^{ "start_time": //g'  | sed 's/"//g')
        
        if [ "$old_start_time" == "" ]
        then    
            start_time=$(date "$format")
        else 
            start_time=$old_start_time
        fi



        while [ 1 -eq 1 ]; do
            current_time=$(date "$format")

            echo '{ "@POD_RUN_TIME_START_TIME_KEY": "'$start_time'", "@POD_RUN_TIME_END_TIME_KEY": "'$current_time'" }' > @POD_RUN_TIME_FILE_PATH_IN_POD
            sleep 1
        done
    """
    record_cmd = record_cmd.replace("@POD_RUN_TIME_DATE_FORMAT", POD_RUN_TIME_DATE_FORMAT)
    record_cmd = record_cmd.replace("@POD_RUN_TIME_START_TIME_KEY", POD_RUN_TIME_START_TIME_KEY)
    record_cmd = record_cmd.replace("@POD_RUN_TIME_END_TIME_KEY", POD_RUN_TIME_END_TIME_KEY)
    record_cmd = record_cmd.replace("@POD_RUN_TIME_FILE_PATH_IN_POD", POD_RUN_TIME_FILE_PATH_IN_POD)

    return record_cmd
# nvidia-smi --format=csv --query-gpu=utilization.gpu,utilization.memory,memory.free,memory.used,memory.total

def get_history_log_cut_command(history_file_path):
    # HISTORY 데이터 일정 길이 넘어가면 자르는 스크립트
    MAX_LEN = 300 #3600 * 24 # 1 day 
    ALLOW_LEN = 600 # 600개가 쌓일 때 까진 지우진 않음
    cut_command = """
        HISTORY_DATA_LEN=$(cat {history_file_path} | wc -l)
        MAX_LEN={MAX_LEN}
        # echo $HISTORY_DATA_LEN

        if [ $HISTORY_DATA_LEN -gt {ALLOW_LEN} ]
        then
            #    echo OVER
           DEL_LEN=$(expr $HISTORY_DATA_LEN - $MAX_LEN)
            #    echo $DEL_LEN
           sed -i '1,'$DEL_LEN'd' {history_file_path}
        fi
    """.format(history_file_path=history_file_path, MAX_LEN=MAX_LEN, ALLOW_LEN=ALLOW_LEN)
    return cut_command

def pod_per_hour_call_count_logger_command():
    # 시간당 Call Count + Response Time 측정을 위한 스크립트
    # Worker마다 실행하며 매 시간마다 특정 파일에 {"time":"2021-12-11T08","count":111,"median":333} 와 같은 값이 쌓임
    # Deployment에서는 워커마다 있는 해당 파일을 읽은 후 "time"을 순차정렬하며 (중간에 빈 값은 0으로 ? ) 
    # 읽은 파일 전체에서 가장 높은 time 기준으로 24개의 아이탬을 내려주기?

    #TODO TEST중
    logger_command = """
    #!/bin/bash

    DATE_FORMAT="+@DEPLOYMENT_NGINX_NUM_OF_LOG_PER_HOUR_DATE_FORMAT"         # "+%Y-%m-%dT%H:%M"
    DATE_FORMAT2="+@DEPLOYMENT_API_NUM_OF_LOG_PER_HOUR_DATE_FORMAT" # "+%Y-%m-%d %H:%M"
    NGINX_LOG_FILE=@NGINX_ACCESS_LOG_FILE_PATH
    API_MONITOR_LOG_FILE=@API_MONITOR_LOG_FILE_PATH
    NUM_OF_LOG_PER_HOUR_FILE=@NUM_OF_LOG_PER_HOUR_FILE_PATH
    LAST_POINT=$(date $DATE_FORMAT)
    LAST_POINT2=$(date "$DATE_FORMAT2")

    while [ 1 -eq 1 ]
    do
        POINT=$(date $DATE_FORMAT)
        POINT2=$(date "$DATE_FORMAT2")
        
        if [ "$LAST_POINT" != "$POINT" ]
        then
            # POINT CHANGE -> LAST UPDATE
            NUM_OF_LOG=$(cat $NGINX_LOG_FILE 2> /dev/null | grep $LAST_POINT | wc -l)
            
            # RESPONSE TIME
            RESPONSE_TIME_LIST=$(cat $NGINX_LOG_FILE 2> /dev/null | grep $LAST_POINT | sed "s/.*request_time.://" | sed "s/,.*//" | sed "s/['\\" ]//g")
            # echo $RESPONSE_TIME_LIST
            if [ "$RESPONSE_TIME_LIST" == "" ]
            then
                # SKIP
                MEAN=0
                MEDIAN=0
            else 
                RESULT=($(printf '%s\n' $RESPONSE_TIME_LIST | datamash mean 1 median 1))
                MEAN=${RESULT[0]}
                MEDIAN=${RESULT[1]}
                if [ "$MEDIAN" == "" ]
                then
                    MEDIAN=0
                fi
            fi
            
            NUM_OF_NGINX_ABNORMAL_LOG=$(cat $NGINX_LOG_FILE 2> /dev/null | grep $LAST_POINT | grep [\\"]status[\\"' ':]*[01456789][0-9]*\\" | wc -l) 
            # echo "NUM_OF_ABBORMAL", $NUM_OF_NGINX_ABNORMAL_LOG
            NUM_OF_API_MONITOR_ABNORMAL_LOG=$(cat $API_MONITOR_LOG_FILE 2> /dev/null | grep "$LAST_POINT2"  | grep \"error_code\"  | wc -l)
            # echo "NUM_OF_ABNORMAL2", $NUM_OF_API_MONITOR_ABNORMAL_LOG
            
            # echo "LAST UPDATE"
            POINT_FORM='"@DEPLOYMENT_NGINX_PER_TIME_KEY":"'"$LAST_POINT"'"'
            NUM_OF_CALL_LOG_FORM='"@DEPLOYMENT_NGINX_PER_TIME_NUM_OF_CALL_LOG_KEY":'$NUM_OF_LOG
            MEDIAN_LOG_FORM='"@DEPLOYMENT_NGINX_PER_TIME_RESPONSE_TIME_MEDIAN_KEY":'$MEDIAN
            NUM_OF_NGINX_ABNORMAL_LOG_FORM='"@DEPLOYMENT_NGINX_PER_TIME_NUM_OF_ABNORMAL_LOG_COUNT_KEY":'$NUM_OF_NGINX_ABNORMAL_LOG
            NUM_OF_API_MONITOR_ABNORMAL_LOG_FORM='"@DEPLOYMENT_API_MONITOR_PER_TIME_NUM_OF_ABNORMAL_LOG_COUNT_KEY":'$NUM_OF_API_MONITOR_ABNORMAL_LOG
            
            sed -i 's/{'"$POINT_FORM"'.*/{'"$POINT_FORM"','"$NUM_OF_CALL_LOG_FORM"','"$MEDIAN_LOG_FORM"','"$NUM_OF_NGINX_ABNORMAL_LOG_FORM"','"$NUM_OF_API_MONITOR_ABNORMAL_LOG_FORM"'}/' $NUM_OF_LOG_PER_HOUR_FILE
            
            
            LAST_POINT=$POINT
            LAST_POINT2=$POINT2
        fi
        
        # echo RUN $POINT
        NUM_OF_LOG=$(cat $NGINX_LOG_FILE 2> /dev/null | grep $POINT | wc -l)
        
        # RESPONSE TIME
        RESPONSE_TIME_LIST=$(cat $NGINX_LOG_FILE 2> /dev/null | grep $POINT | sed "s/.*request_time.://" | sed "s/,.*//" | sed "s/['\\" ]//g")

        if [ "$RESPONSE_TIME_LIST" == "" ]
        then
            # SKIP
            echo "@@@@@@@@@#! SKIP"
            MEAN=0
            MEDIAN=0
        else 
            RESULT=($(printf '%s\n' $RESPONSE_TIME_LIST | datamash mean 1 median 1))
            MEAN=${RESULT[0]}
            MEDIAN=${RESULT[1]}
            echo "?????" $MEDIAN 
            echo "?????" $RESPONSE_TIME_LIST 
            if [ "$MEDIAN" == "" ]
            then
                MEDIAN=0
            fi
        fi

        
        # Abnormal COUNT
        NUM_OF_NGINX_ABNORMAL_LOG=$(cat $NGINX_LOG_FILE 2> /dev/null | grep $POINT | grep [\\"]status[\\"' ':]*[01456789][0-9]*\\" | wc -l) 
        # echo "NUM_OF_ABBORMAL", $NUM_OF_NGINX_ABNORMAL_LOG
        NUM_OF_API_MONITOR_ABNORMAL_LOG=$(cat $API_MONITOR_LOG_FILE 2> /dev/null | grep "$POINT2" | grep \"error_code\"  | wc -l)
        # echo "NUM_OF_ABNORMAL2", $NUM_OF_API_MONITOR_ABNORMAL_LOG, $POINT2
        
        
        POINT_FORM='"@DEPLOYMENT_NGINX_PER_TIME_KEY":"'"$POINT"'"'
        NUM_OF_CALL_LOG_FORM='"@DEPLOYMENT_NGINX_PER_TIME_NUM_OF_CALL_LOG_KEY":'$NUM_OF_LOG
        MEDIAN_LOG_FORM='"@DEPLOYMENT_NGINX_PER_TIME_RESPONSE_TIME_MEDIAN_KEY":'$MEDIAN
        NUM_OF_NGINX_ABNORMAL_LOG_FORM='"@DEPLOYMENT_NGINX_PER_TIME_NUM_OF_ABNORMAL_LOG_COUNT_KEY":'$NUM_OF_NGINX_ABNORMAL_LOG
        NUM_OF_API_MONITOR_ABNORMAL_LOG_FORM='"@DEPLOYMENT_API_MONITOR_PER_TIME_NUM_OF_ABNORMAL_LOG_COUNT_KEY":'$NUM_OF_API_MONITOR_ABNORMAL_LOG
        
        # echo $LOG_FORM
        cat $NUM_OF_LOG_PER_HOUR_FILE | grep $POINT > /dev/null
        if [ $? -gt 0 ]
        then
            # echo CREATE ITEM
            echo '{'$POINT_FORM,$NUM_OF_CALL_LOG_FORM,$MEDIAN_LOG_FORM,$NUM_OF_NGINX_ABNORMAL_LOG_FORM,$NUM_OF_API_MONITOR_ABNORMAL_LOG_FORM'}' >> $NUM_OF_LOG_PER_HOUR_FILE
        else
            # echo UPDATE ITEM
            sed -i 's/{'"$POINT_FORM"'.*/{'"$POINT_FORM"','"$NUM_OF_CALL_LOG_FORM"','"$MEDIAN_LOG_FORM"','"$NUM_OF_NGINX_ABNORMAL_LOG_FORM"','"$NUM_OF_API_MONITOR_ABNORMAL_LOG_FORM"'}/' $NUM_OF_LOG_PER_HOUR_FILE
        fi
        
        sleep 1
    done

    """ 
    logger_command = logger_command.replace("@DEPLOYMENT_NGINX_NUM_OF_LOG_PER_HOUR_DATE_FORMAT", DEPLOYMENT_NGINX_NUM_OF_LOG_PER_HOUR_DATE_FORMAT)
    logger_command = logger_command.replace("@DEPLOYMENT_API_NUM_OF_LOG_PER_HOUR_DATE_FORMAT", DEPLOYMENT_API_NUM_OF_LOG_PER_HOUR_DATE_FORMAT)
    logger_command = logger_command.replace("@NGINX_ACCESS_LOG_FILE_PATH", POD_NGINX_ACEESS_LOG_FILE_PATH_IN_POD)
    logger_command = logger_command.replace("@API_MONITOR_LOG_FILE_PATH", POD_API_LOG_FILE_PATH_IN_POD)
    logger_command = logger_command.replace("@NUM_OF_LOG_PER_HOUR_FILE_PATH", POD_NGINX_ACCESS_LOG_PER_HOUR_FILE_PATH_IN_POD)
    logger_command = logger_command.replace("@DEPLOYMENT_NGINX_PER_TIME_KEY", DEPLOYMENT_NGINX_PER_TIME_KEY)
    logger_command = logger_command.replace("@DEPLOYMENT_NGINX_PER_TIME_NUM_OF_CALL_LOG_KEY", DEPLOYMENT_NGINX_PER_TIME_NUM_OF_CALL_LOG_KEY)
    logger_command = logger_command.replace("@DEPLOYMENT_NGINX_PER_TIME_RESPONSE_TIME_MEDIAN_KEY", DEPLOYMENT_NGINX_PER_TIME_RESPONSE_TIME_MEDIAN_KEY)
    logger_command = logger_command.replace("@DEPLOYMENT_NGINX_PER_TIME_NUM_OF_ABNORMAL_LOG_COUNT_KEY", DEPLOYMENT_NGINX_PER_TIME_NUM_OF_ABNORMAL_LOG_COUNT_KEY)
    logger_command = logger_command.replace("@DEPLOYMENT_API_MONITOR_PER_TIME_NUM_OF_ABNORMAL_LOG_COUNT_KEY", DEPLOYMENT_API_MONITOR_PER_TIME_NUM_OF_ABNORMAL_LOG_COUNT_KEY)

    return logger_command

def pod_network_num_of_bytes_per_second_record_command():
    # Pod 안에서의 네트워크 사용량 측정용
    network_num_of_bytes_record_command = """
    DEFAULT_ETH=eth0
    while [ 1 -eq 1 ]; 
    do
        R1=`cat /sys/class/net/$DEFAULT_ETH/statistics/rx_bytes`
        T1=`cat /sys/class/net/$DEFAULT_ETH/statistics/tx_bytes`
        
        sleep 1
        
        R2=`cat /sys/class/net/$DEFAULT_ETH/statistics/rx_bytes`
        T2=`cat /sys/class/net/$DEFAULT_ETH/statistics/tx_bytes`
        TXBytes=`expr $T2 - $T1`
        RXBytes=`expr $R2 - $R1`
        
        timestamp=$(date +%s)
        echo '{"@NETWORK_TRANSMITTER_KEY":'$TXBytes',"@NETWORK_RECEIVER_KEY":'$RXBytes',"@TIMESTAMP_KEY":'$timestamp'}' > @POD_NETWORK_USAGE_RECORD_FILE_PATH #/log/network_usage.json
        cat @POD_NETWORK_USAGE_RECORD_FILE_PATH >>  @POD_NETWORK_USAGE_HISTORY_FILE_PATH #/log/network_usage_history.log
        
        @CUT_COMMAND

    done
    """
    network_num_of_bytes_record_command = network_num_of_bytes_record_command.replace("@POD_NETWORK_USAGE_RECORD_FILE_PATH", POD_NETWORK_USAGE_RECORD_FILE_PATH_IN_POD)
    network_num_of_bytes_record_command = network_num_of_bytes_record_command.replace("@POD_NETWORK_USAGE_HISTORY_FILE_PATH",POD_NETWORK_USAGE_HISTORY_FILE_PATH_IN_POD)
    network_num_of_bytes_record_command = network_num_of_bytes_record_command.replace("@CUT_COMMAND", get_history_log_cut_command(POD_NETWORK_USAGE_HISTORY_FILE_PATH_IN_POD))
    network_num_of_bytes_record_command = network_num_of_bytes_record_command.replace("@NETWORK_TRANSMITTER_KEY", NETWORK_TRANSMITTER_KEY)
    network_num_of_bytes_record_command = network_num_of_bytes_record_command.replace("@NETWORK_RECEIVER_KEY", NETWORK_RECEIVER_KEY)

    return network_num_of_bytes_record_command

def pod_nginx_log_count_command():
    #TODO echo 하는 부분 개선(값이 변하지 않으면 업데이트 하지 않도록 추가) 예정 2022-08-03 
    nginx_log_count_command="""
    while [ 1 -eq 1 ];
    do
        total=`cat @POD_NGINX_ACEESS_LOG_FILE_PATH_IN_POD 2> /dev/null | wc -l`
        success=`grep '"status": "2[0-9][0-9]"' @POD_NGINX_ACEESS_LOG_FILE_PATH_IN_POD 2> /dev/null | wc -l`
        echo '{"total_count":'$total',"success_count":'$success'}' > @POD_NGINX_LOG_COUNT_FILE_PATH_IN_POD
        sleep 1
    done
    """
    #TODO POD_NGINX_LOG_COUNT_FILE_PATH_IN_POD
    #TODO POD_NGINX_ACEESS_LOG_FILE_PATH_IN_POD
    nginx_log_count_command = nginx_log_count_command.replace("@POD_NGINX_ACEESS_LOG_FILE_PATH_IN_POD", POD_NGINX_ACEESS_LOG_FILE_PATH_IN_POD)
    nginx_log_count_command = nginx_log_count_command.replace("@POD_NGINX_LOG_COUNT_FILE_PATH_IN_POD", POD_NGINX_LOG_COUNT_FILE_PATH_IN_POD)
    return nginx_log_count_command

def deployment_pod_check_required_bin_command():
    check_required_bin_command = """
    (
        echo datamash ? $(which datamash) $(datamash --version)
        echo curl ?  $(which curl) $(curl --version)
        echo netstat ? $(which netstat) $(netstat --version)
    ) > /required_bin_check;
    """

    return check_required_bin_command

def pod_device_info_get_command():
    """
    Description : Device Info (CPU 모델 | GPU 모델 정보 가져오기)
    """
    
    device_info_get_command = """
    #!/bin/bash


    echo $JF_GPU
    if [ "$JF_GPU" != "" ] && [ "$JF_GPU" -gt "0" ]
    then
        echo "GPU MODE"
        deviceQuery | grep ^Device | sed "s/^Device.*://g" | sed "s/\"//g" | sed "s/^ //g" > @POD_DEVICE_INFO_FLAG_IN_POD
        
    else
        echo "CPU MODE"
        CPU_MODEL=$(cat /proc/cpuinfo  | grep "model name" | head -1 | sed "s/^model name.*://" | sed "s/^ //") 
        echo $CPU_MODEL > @POD_DEVICE_INFO_FLAG_IN_POD
    fi
    """

    device_info_get_command = device_info_get_command.replace("@POD_DEVICE_INFO_FLAG_IN_POD", POD_DEVICE_INFO_FLAG_IN_POD)

    return device_info_get_command

## SET

def pod_resource_record_cmd_set(pod_name=None):
    # CPU | RAM | GPU | NETWORK IO Record
    record_cmd = "({pod_resource_record})& "\
                "({gpu_resource_record})& "\
                "({pod_network_record})& ".format(
                    pod_resource_record=cpu_ram_resource_record_cmd(),
                    gpu_resource_record=gpu_resource_record_cmd(pod_name),
                    pod_network_record=pod_network_num_of_bytes_per_second_record_command()
                )
    return record_cmd

def pod_env_PATH_setting_cmd_set():
    """
    Description : Pod 에 JF에서 제공하는 Bin이나 특정 PATH 제공용  Setting command
        ["/bin/bash", "-c", "echo 'export AA=QWERTY' >> $HOME/.bashrc; echo ?$AA; source $HOME/.bashrc && echo ??$AA; echo ???$AA; (echo ????$AA); env " ]
        jf_default
        ?
        ??
        ???
        ????
        python:3.6.5
        ?
        ??QWERTY
        ???QWERTY
        ????QWERTY
        이미지 환경에 따라서 export 가 먹히거나 안먹힘.. addlib 추가 관련은 문제가 있을 수 있음. PATH는 왜 넘어가는지 모르겠음.
    """

        
    setting_cmd = "{jf_support_bin_env_export_append_cmd};" \
                   "{jf_support_bin_export_cmd};" \
                   "{jf_addlib_env_export_append_cmd};" \
                   "{jf_addlib_export_cmd}; " \
                   "source $HOME/.bashrc; ".format(
                       jf_support_bin_env_export_append_cmd=get_jf_support_bin_env_export_append_cmd(),
                       jf_support_bin_export_cmd=get_jf_support_bin_export_cmd(),
                       jf_addlib_env_export_append_cmd=get_jf_addlib_env_export_append_cmd(),
                       jf_addlib_export_cmd=get_jf_addlib_export_cmd()
                    ) # postStart에서 ({jf_support_bin_export_cmd}) subshell () 사용 시 export 한 값이 다음으로 안넘어감

    # setting_cmd = "({jf_support_bin_env_export_append_cmd});".format(
    #                 jf_support_bin_env_export_append_cmd=get_jf_support_bin_env_export_append_cmd()
    #             ) # ({jf_support_bin_export_cmd}) subshell () 사용 시 export 한 값이 다음으로 안넘어감


    return setting_cmd

def deployment_pod_others_record_cmd_set(pod_name=None):
    record_cmd = "({pod_run_time_record})& "\
                "({pod_per_hour_call_count_record})> /per_hour_log 2> /per_hour_log & "\
                "({nginx_call_count_record})& ".format(
                    pod_run_time_record=pod_run_time_record_cmd(pod_name),
                    pod_per_hour_call_count_record=pod_per_hour_call_count_logger_command(),
                    nginx_call_count_record=pod_nginx_log_count_command()
                )
    return record_cmd
    
def pod_deployment_graph_log_command(deployment_worker_id, search_type="range"):
    update_time=10
    interval=600
    if search_type=='live':
        update_time=1
        interval=1
    return "python /addlib/history.py --deployment_worker_id {} --interval {} --search_type {} --update_time {}".format(
                                                            deployment_worker_id, interval, search_type, update_time)


################################ R studio ###########################################

RDTUDIO_DOWNLOAD_ADDRESS = "https://download2.rstudio.org/server/bionic/amd64/{}"
RSTUDIO_DOWNLOAD_FILE = "rstudio-server-2022.07.1-554-amd64.deb"
R_BASE_DIRECTORY = "r_temp"

def cd_jf_training_home():
    return "cd /jf-training-home"

def noninteractive_timezone():
    return "DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends tzdata"

def apt_update():
    return "apt-get update"

def install_r_base():
    return "R --version || apt-get install -y r-base"

def wget_rstudio_file():
    rstudio_downdload_address = RDTUDIO_DOWNLOAD_ADDRESS.format(RSTUDIO_DOWNLOAD_FILE)
    return "{} || wget {} && {} && {}".format(rstudio_server_restart(), rstudio_downdload_address, insatll_rstudio(), rstudio_server_restart())
    # return "rstudio-server restart || wget https://download2.rstudio.org/server/bionic/amd64/rstudio-server-2022.07.1-554-amd64.deb && apt install -y ./rstudio-server-2022.07.1-554-amd64.deb && rm -rf ./rstudio-server-2022.07.1-554-amd64.deb && rstudio-server restart"

def insatll_rstudio():
    return "apt install -y ./{} && rm -rf ./{}".format(RSTUDIO_DOWNLOAD_FILE, RSTUDIO_DOWNLOAD_FILE)
    # return "apt install -y ./rstudio-server-2022.07.1-554-amd64.deb && rm -rf ./rstudio-server-2022.07.1-554-amd64.deb"

def r_version_check():
    return "R --version"

def rstudio_server_restart():
    return "rstudio-server restart"


def r_studio_cmd():
    r_studio_cmd = """
                {cd_jf_training_home}
                {noninteractive_timezone}
                {apt_update}
                {install_r_base}
                {wget_rstudio_file}
                """.format(
                        cd_jf_training_home=cd_jf_training_home(),
                        noninteractive_timezone=noninteractive_timezone(),
                        apt_update=apt_update(),
                        install_r_base=install_r_base(),
                        wget_rstudio_file=wget_rstudio_file()
                        )
    return r_studio_cmd

def user_home_directory_check_and_change():
    """
    /r_temp/~/jf-training-home/src, datasets_ro, datasets_rw
    """
    # user_home_directory_check_and_change="""
    # #!/bin/bash
    # cd /
    # mkdir {R_BASE_DIRECTORY}

    # while [ 1 -eq 1 ]
    # do
    # result=$(grep /bin/bash /etc/passwd | cut -f1 -d:)
    # for user in $result
    # do
    #     cd /{R_BASE_DIRECTORY}  
    #     # echo $user
    #     home_directory=$(sudo cat /etc/passwd | grep $user | cut -f6 -d:)
    #     # echo $home_directory
    #     if [ "$home_directory" = "$JF_HOME" ]
    #     then
    #         # home directory 변경
    #         mkdir $user
    #         cd $user
    #         mkdir ${JF_HOME:1}
    #         cd .$JF_HOME

    #         #링크 연결
    #         dir_list=$(ls -d $JF_HOME/*)
    #         for dir in $dir_list
    #         do
    #             ln -s $dir ./
    #         done

    #         sudo usermod -d /{R_BASE_DIRECTORY}/$user$JF_HOME $user
    #         cd ..
    #         chown $user:$user .$JF_HOME
    #     fi

    # done

    # done
    # """
    """
    /jf-training-home/r_temp/~/src, datasets_ro, datasets_rw
    """
    user_home_directory_check_and_change="""
    #!/bin/bash
    cd $JF_HOME
    mkdir {R_BASE_DIRECTORY}

    while [ 1 -eq 1 ]
    do
    result=$(grep /bin/bash /etc/passwd | cut -f1 -d:)
    for user in $result
    do
        cd $JF_HOME/{R_BASE_DIRECTORY}  
        home_directory=$(sudo cat /etc/passwd | grep ^$user | cut -f6 -d:)
        if [ "$home_directory" = "$JF_HOME" ]
        then
            mkdir $user
            cd $user

            #링크 연결
            dir_list=$(ls -d $JF_HOME/*)
            for dir in $dir_list
            do
                if [ "$dir" = "$JF_HOME/{R_BASE_DIRECTORY}" ]
                then
                    continue
                fi

                ln -s $dir ./
            done

            # home directory 변경
            sudo usermod -d $JF_HOME/{R_BASE_DIRECTORY}/$user $user
            cd ..
            # 권한 부여
            chown $user:$user $user
        fi

    done
    sleep 1
    done
    """.format(R_BASE_DIRECTORY=R_BASE_DIRECTORY)
    return user_home_directory_check_and_change


    ################################ File Browser ###########################################


def file_browser_install():
    # return "curl -fsSL https://raw.githubusercontent.com/filebrowser/get/master/get.sh | bash"
    return "wget -q https://raw.githubusercontent.com/filebrowser/get/master/get.sh && chmod 777 get.sh && ./get.sh"


FILEBROWSER_ADMIN_ID = "admin"

def file_browser_password_change_checker():
    cmd = """
    #!/bin/bash
    cd {FILEBROWSER_PASSWORD_CHANGE_SCRIPT_PATH}
    while [ 1 -eq 1 ];
    do
        file="{FILEBROWSER_PASSWORD_CHANGE_LOG_FILE_NAME}"
        if [ -f "$file" ]; then
            echo "$file found."
            {remove_pod_status_running_flag_cmd}
            export new_password=$(cut -d '/' -f 1 "$file")
            export user_id=$(cut -d '/' -f 2 "$file")
            ./{FIELBROWSER_PASSWORD_CHANGE_SCRIPT_FILE_NAME} > ./pw_change.log
            rm -f $file
            unset new_password
            unset user_id
            {remove_pod_status_stop_flag_cmd}
        else 
            #echo "$file not found."
            continue
        fi
        sleep 1
    done
    """.format(
        FIELBROWSER_PASSWORD_CHANGE_SCRIPT_FILE_NAME=FIELBROWSER_PASSWORD_CHANGE_SCRIPT_FILE_NAME,
        FILEBROWSER_PASSWORD_CHANGE_LOG_FILE_NAME=FILEBROWSER_PASSWORD_CHANGE_LOG_FILE_NAME,
        FILEBROWSER_PASSWORD_CHANGE_SCRIPT_PATH=FILEBROWSER_PASSWORD_CHANGE_SCRIPT_PATH,
        remove_pod_status_running_flag_cmd=remove_pod_status_running_flag_cmd(),
        remove_pod_status_stop_flag_cmd=remove_pod_status_stop_flag_cmd(),
    )
    return cmd

def file_browser_cmd(admin_pw : str, base_url : str="/"):
    # 가정 : support 안에 filebrowser 파일이 없을 경우 or filebrowser 바이너리 파일이 있지만 동작하지 않을 경우
    file_browser_cmd =  """
    #!/bin/bash
    
    RESULT=$(filebrowser version)
    if [ $RESULT -eq '']; then
        echo support failed
        echo filebrowser install
        {file_browser_install}
        rm get.sh
        BINARYPATH=filebrowser
    else
        echo support success
        BINARYPATH=filebrowser
    fi
    echo ==================
    echo "filebrowser : $BINARYPATH"
    echo ==================
    FILE={filebrowser_db_path}filebrowser.db
    echo ==================
    echo $FILE
    echo ==================
    FILEBROWSER_RUNNING_CMD="$BINARYPATH -r $JF_HOME -a 0.0.0.0 -b {base_url} -d {filebrowser_db_path}filebrowser.db"
    echo 'export FILEBROWSER_RUNNING_CMD="$BINARYPATH -r $JF_HOME -a 0.0.0.0 -b {base_url} -d {filebrowser_db_path}filebrowser.db"' >> $HOME/.bashrc
    source $HOME/.bashrc
    if [ -f $FILE ]; then
        echo DB exist
        $FILEBROWSER_RUNNING_CMD &
    else
        echo DB dose not exist
        mkdir -p {filebrowser_db_path}
        cd {filebrowser_db_path}
        $BINARYPATH config init
        echo config setting success
        $BINARYPATH users add {admin_id} {admin_pw} --perm.admin
        echo admin setting success
        $FILEBROWSER_RUNNING_CMD &
    fi
    """.format(
        file_browser_install = file_browser_install(),
        # file_browser_start=file_browser_start(base_url=base_url),
        # file_browser_config_init=file_browser_config_init(),
        # file_browser_admin_user_setting=file_browser_admin_user_setting(admin_pw),
        filebrowser_db_path=FILEBROWSER_DB_PATH,
        admin_id=FILEBROWSER_ADMIN_ID,
        admin_pw=admin_pw,
        base_url=base_url
    )
    return file_browser_cmd

def file_browser_config_init():
    return "filebrowser config init"

# filebrowser를 처음 실행하기 전에 admin user가 없기 때문에 add를 해줘야 한다
def file_browser_admin_user_setting(admin_pw):
    return "filebrowser users add {} {} --perm.admin".format(FILEBROWSER_ADMIN_ID, admin_pw)

def file_browser_start(base_url):
    return "filebrowser -r $JF_HOME -a 0.0.0.0 -b {base_url} -d {filebrowser_db_path}filebrowser.db".format(base_url=base_url, filebrowser_db_path=FILEBROWSER_DB_PATH)


# TODO support bin 접근 방법 고도화 - 기본적인 테스트만 했으며 반영은 추후 (2022-10-19 Yeobie)
def get_support_bin_local_set_cmd():
    """
        Description : Pod에서 여러 command들이 sub shell로 동작되는데 Global env 설정은 이미지에 따라서 동작하지 않는 경우가 있음
                      support 안에 있는 Binary가 필요한 경우에 대응하기 위해서 sub shell 마다 env PATH에 support bin 경로를 추가하여 진행하도록 함
    """
    support_bin_local_set_cmd = """
        #/bin/bash
        PATH=$PATH:@support_bin_path     # /usr/bin/support 

        # ex) 
        # tree-support-bin /dev
    """
    support_bin_local_set_cmd.replace("@support_bin_path","") # Support bin 설정
    return support_bin_local_set_cmd