import os
import sys
sys.path.insert(0, os.path.abspath('..'))
from TYPE import *

def get_log_command(item_id, log_base):
    log_command = " > {log_base}/{item_id}.jflog 2>> {log_base}/{item_id}.jflog".format(log_base=log_base, item_id=item_id)
    return log_command

def get_base_mpirun_command(total_gpu, hosts, env_list=None):
    return None

def get_rdma_env(nifs, mpi_port, exnifs):
    return None

def get_p2p_env(nifs, mpi_port, exnifs):
    return None

def get_default_env(nifs, mpi_port, exnifs):
    return None

def command_combine(run_code, parameter, item_id, log_base, mpi_command="", env_add_command="", with_log=True):
    import utils.common as common
    python_command = common.convert_run_code_to_run_command(run_code=run_code, parameter=parameter)
    
    if with_log == True:
        log_command = get_log_command(item_id=item_id, log_base=log_base)
    else :
        log_command = ""

    run_command = """
        {mpi_command} \
        {python_command} \
        {log_command} \
    """.format(mpi_command=mpi_command.replace("\n",""), python_command=python_command, log_command=log_command)

    return run_command

def get_rdma_run_command(total_gpu, hosts, nifs, mpi_port, exnifs, run_code, parameter, item_id=None, log_base=None, with_log=True):
    return None
    
def get_p2p_run_command(total_gpu, hosts, nifs, mpi_port, exnifs, run_code, parameter, item_id=None, log_base=None, with_log=True):
    return None
    
def get_default_run_command(total_gpu, hosts, nifs, mpi_port, exnifs, run_code, parameter, item_id=None, log_base=None, with_log=True):
    if total_gpu == 1:
        mpi_command = ""
    else :
        mpi_command = get_base_mpirun_command(total_gpu=total_gpu, hosts=hosts)
        mpi_command += get_default_env(nifs=nifs, mpi_port=mpi_port, exnifs=exnifs)

    run_command = command_combine(run_code=run_code, parameter=parameter, item_id=item_id, log_base=log_base, with_log=with_log,
                    mpi_command=mpi_command)
    return run_command

def get_cpu_run_command(run_code, parameter, item_id=None, log_base=None, with_log=True, **kwargs):
    run_command = command_combine(run_code=run_code, parameter=parameter, item_id=item_id, log_base=log_base, with_log=with_log)

    return run_command

def get_ssh_check_command(mpi_port, total_gpu, hosts):
    # Multi Node에서 실행 시 이미지가 없는 노드는 이미지 Pull을 받느라 오래 걸릴 수 있음
    # 따라서 아래 코드는 최장 2시간을 기다리도록 되어 있음
    # - mpirun 명령어가 없을 경우 체크를 종료하는 로직 추가 (2022-08-17)
    # TODO 나머지 Worker가 아예 실행하지 못한 경우 [ex) API 재시작] 발생 시 현재 구조로는 대처 방법이 마땅히 없음 (2022-10-11 yeobie)
    ssh_check_command = """
        for i in $(seq 1 3600); do
        /usr/sbin/sshd -p {mpi_port}
        mpirun --allow-run-as-root -np {total_gpu} -H {hosts} -mca plm_rsh_args "-p {mpi_port}" echo check && break
                echo $i 
                sleep 2
        
        # mpirun command check
        which mpirun || break 
        
        done
        echo END
    """.format(mpi_port=mpi_port, total_gpu=total_gpu, hosts=hosts)
    return ssh_check_command

#TODO ENV 변수화
def set_master_addr_and_port_env():
    # For Torch
    set_command = """
    MASTER_ADDR=$(echo $JF_OMPI_HOSTS | sed "s/:.*//" )
    MASTER_PORT_START=50000
    PORT_RANGE=10000

    for (( i = 0 ; i < 10000 ; i++ ))
    do 
    #     SCAN_PORT=$(awk '{print $1+$2}' <<< "$i $MASTER_PORT")
        SCAN_PORT="$(($RANDOM% $PORT_RANGE+$MASTER_PORT_START))"
        echo $SCAN_PORT
        PORT_CHECK=$(netstat -nltp | grep LISTEN | grep :$SCAN_PORT | wc -l)
        if [ $PORT_CHECK -eq 0 ];
        then
            MASTER_PORT=$SCAN_PORT
            break
        fi
    done 

    echo NEXT, $MASTER_PORT
    
    export MASTER_ADDR=$MASTER_ADDR
    export MASTER_PORT=$MASTER_PORT

    """
    return set_command
    

def get_infiniband_dev_set_command(network_group_category):
    return None

def get_master_init_command(total_gpu, hosts, mpi_port, mpi_run, network_group_category):
    return None

def get_worker_init_command(mpi_port, network_group_category):
    return None
    
