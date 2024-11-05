import sys
import os
sys.path.insert(0, os.path.abspath('..'))
from TYPE import *
from settings import *

NAME_POD_RESOURCE_USAGE="pod-resource-usage"

# FOR POD CPU RAM USAGE CHECK
def get_pod_resource_usage_volumes(pod_name):
    return {
        "name": NAME_POD_RESOURCE_USAGE,
        "hostPath": {
            "path": POD_RESOURCE_BASE_PATH_IN_HOST.format(pod_name=pod_name),
            "type": "DirectoryOrCreate"
        }
    }
def get_pod_resource_usage_volume_mounts(pod_name=None):
    return {
        "name": NAME_POD_RESOURCE_USAGE,
        "mountPath": POD_RESOURCE_BASE_PATH_IN_POD
    }


# FOR DEPLOYMENT API MONITOR
def get_pod_api_deco_volume_mounts():
    return {
        "name": "package",
        "mountPath": JF_ADDLIB_POD_PATH,
        "readOnly": True
    }

def get_pod_api_deco_volumes():
    return {
        "name": "package",
        "hostPath": {
            "path":"/jfbcore/jf-bin/deployment_log",
            "type": "DirectoryOrCreate"
    }
}

# FOR EXAMPLE AND BENCHMARK CODE
def get_pod_example_code_volume_mounts():
    return  {
        "name": "examples",
        "mountPath": "/examples"
    }

def get_pod_example_code_volumes():
    return  {
        "name": 'examples',
        "hostPath": {
            "path": "/jfbcore/jf-bin/sample/examples",
            "type": "DirectoryOrCreate"
        }
    }

def get_pod_benchmark_code_volume_mounts():
    return {
        "name": "benchmarks",
        "mountPath": "/benchmarks"
    }

def get_pod_benchmark_code_volumes():
    return {
        "name": 'benchmarks',
        "hostPath": {
            "path": "/jfbcore/jf-bin/sample/benchmarks",
            "type": "DirectoryOrCreate"
        }
    }

# FOR DEPLOYMENT NGINX LOGGER
def get_pod_api_nginx_conf_volume_mounts():
    return {
        "name": "nginx-log",
        "mountPath": "/etc/nginx_ex",
        "readOnly": True
    }

def get_pod_api_nginx_conf_volumes():
    return {
        "name": "nginx-log",
        "hostPath": {
            "path":"/jfbcore/jf-bin/deployment_nginx",
            "type": "DirectoryOrCreate"
    }
}

# BASIC BINARY FOR SUPPORT
# /jfbcore/jf-bin/support 에 있는 bin 파일들 제공용
# datamash, netstat 같은 Pod 내부에서 필수적으로 동작해야하는 바이너리들 제공
def get_pod_support_binary_volume_mounts():
    return {
        "name": "support-binary",
        "mountPath": JF_SUPPORT_BINARY_POD_PATH,
        "readOnly": True
    }

def get_pod_support_binary_volumes():
    return {
        "name": "support-binary",
        "hostPath": {
            "path": JF_SUPPORT_BINARY_HOST_PATH,
            "type": "DirectoryOrCreate"
        }
    }

# Deployment Home - all
# {workspace_name}/deployments/{deployments_name} - 경로 제공
# 추가적으로 무엇이 들어갈진 아직 계획 없음.
# trainings/{training_name}/(src | job-checkpoints .. ) 처럼 기능별 추가 예정
def get_pod_deployment_home_volume_mounts():
    return {
            "name": "deployment-home",
            "mountPath": JF_DEPLOYMENT_POD_PATH
        }


def get_pod_deployment_home_volumes(workspace_name, deployment_name):
    return {
        "name": "deployment-home",
        "hostPath": {
            "path": JF_DEPLOYMENT_HOST_PATH.format(workspace_name=workspace_name, deployment_name=deployment_name)
        }
    }

# Training Home Src
def get_pod_training_home_src_volume_mounts(owner):
    # TODO REMOVE -> get_pod_training_home_src_volume_mounts2
    return {
            "name": "training-src",
            "mountPath": "/home/{}/src".format(owner)
        }
def get_pod_training_home_src_volume_mounts2():
    return {
            "name": "training-src",
            "mountPath": "{}/src".format(KUBE_ENV_JF_HOME_DEFAULT_VALUE)
        }

def get_pod_training_home_src_volume_mounts_destination2(destination):
    return {
            "name": "training-src",
            "mountPath": destination
        }


def get_pod_training_home_src_volumes(workspace_name, training_name):
    return {
        "name": "training-src",
        "hostPath": {
            "path": JF_TRAINING_SRC_HOST_PATH.format(workspace_name=workspace_name, training_name=training_name)
        }
    }


# Workspace Dataset RO
def get_pod_workspace_dataset_ro_volume_mounts(owner):
    return  {
        "name": "workspaces-datasets-ro",
        "readOnly": True,
        "mountPath": "/home/{}/datasets_ro".format(owner)
    }
def get_pod_workspace_dataset_ro_volume_mounts2():
    return  {
        "name": "workspaces-datasets-ro",
        "readOnly": True,
        "mountPath": "{}/datasets_ro".format(KUBE_ENV_JF_HOME_DEFAULT_VALUE)
    }

def get_pod_workspace_dataset_ro_volumes(workspace_name):
    return  {
        "name": "workspaces-datasets-ro",
        "hostPath": {
            "path": JF_DATASET_HOST_DIR.format(workspace_name=workspace_name, access=0, dataset_name=""),
            "type": "DirectoryOrCreate"
        }
    }

# Workspace Dataset RW
def get_pod_workspace_dataset_rw_volume_mounts(owner):
    return  {
        "name": "workspaces-datasets-rw",
        "mountPath": "/home/{}/datasets_rw".format(owner)
    }
def get_pod_workspace_dataset_rw_volume_mounts2():
    return  {
        "name": "workspaces-datasets-rw",
        "mountPath": "{}/datasets_rw".format(KUBE_ENV_JF_HOME_DEFAULT_VALUE)
    }

def get_pod_workspace_dataset_rw_volumes(workspace_name):
    return  {
        "name": "workspaces-datasets-rw",
        "hostPath": {
            "path": JF_DATASET_HOST_DIR.format(workspace_name=workspace_name, access=1, dataset_name=""),
            "type": "DirectoryOrCreate"
        }
    }

# Dataset mount for job or hps
def get_pod_workspace_dataset_item_basic_volume_mounts(dataset_access):
    return  {
        "name": "workspaces-datasets",
        "readOnly": True if str(dataset_access) == str(0) else False,
        "mountPath": JF_DATASET_ITEM_BASIC_PATH_IN_POD
    }

def get_pod_workspace_dataset_item_name_volume_mounts(dataset_access, dataset_name):
    return  {
        "name": "workspaces-datasets",
        "readOnly": True if str(dataset_access) == str(0) else False,
        "mountPath": JF_DATASET_ITEM_NAME_PATH_IN_POD.format(dataset_name=dataset_name)
    }

def get_pod_workspace_dataset_item_volumes(dataset_name, workspace_name=None, dataset_access=None):
    return  {
        "name": "workspaces-datasets",
        "hostPath": {
            "path": JF_DATASET_HOST_DIR.format(workspace_name=workspace_name, access=dataset_access, dataset_name=dataset_name),
            "type": "DirectoryOrCreate"
        }
    }

def get_pod_deployment_dataset_item_name_volume_mounts(dataset_access, destination):
    return  {
        "name": "workspaces-datasets",
        "readOnly": True if str(dataset_access) == str(0) else False,
        "mountPath": destination
    }

# Job Checkpoint 조회용 - 저장된 Job-checkpoints를 조회하거나 사용하려고 할 때
def get_pod_training_job_checkpoints_volume_mounts(owner):
    return  {
        "name": "training-job-checkpoints",
        "mountPath": "/home/{}/job-checkpoints".format(owner)
    }

def get_pod_training_job_checkpoints_volume_mounts2():
    return  {
        "name": "training-job-checkpoints",
        "mountPath": "{}/job-checkpoints".format(KUBE_ENV_JF_HOME_DEFAULT_VALUE)
    }

def get_pod_training_job_checkpoints_volumes(workspace_name, training_name):
    return  {
        "name": "training-job-checkpoints",
        "hostPath": {
            "path": JF_TRAINING_JOB_CHECKPOINT_BASE_HOST_PATH.format(workspace_name=workspace_name, training_name=training_name)
        }
    }

# Job Checkpoint Job에서 저장용 - Job이 동작하면서 Checkpoints를 저장하려고 할 때
def get_pod_training_job_checkpoints_save_volume_mounts():
    return  {
        "name": "job-checkpoints",
        "mountPath": JF_TRAINING_CHECKPOINT_ITEM_POD_STATIC_PATH
    }

def get_pod_training_job_checkpoints_save_volumes(workspace_name, training_name, job_name, job_group_index):
    return  {
        "name": 'job-checkpoints',
        "hostPath": {
            "path": JF_TRAINING_JOB_CHECKPOINT_ITEM_HOST_PATH.format(
                workspace_name=workspace_name, training_name=training_name, 
                job_name=job_name, job_group_index=job_group_index),
            "type": "DirectoryOrCreate"
        }
    }

# HPS Checkpoint - 조회용 저장된 HPS-checkpoints를 조회하거나 사용하려고 할 때
def get_pod_training_hps_checkpoints_volume_mounts(owner):
    return  {
        "name": "training-hps-checkpoints",
        "mountPath": "/home/{}/hps-checkpoints".format(owner)
    }

def get_pod_training_hps_checkpoints_volume_mounts2():
    return  {
        "name": "training-hps-checkpoints",
        "mountPath": "{}/hps-checkpoints".format(KUBE_ENV_JF_HOME_DEFAULT_VALUE)
    }

def get_pod_training_hps_checkpoints_volumes(workspace_name, training_name):
    return  {
        "name": "training-hps-checkpoints",
        "hostPath": {
            "path": JF_TRAINING_HPS_CHECKPOINT_BASE_HOST_PATH.format(workspace_name=workspace_name, training_name=training_name)
        }
    }

# HPS Checkpoint - 저장용
def get_pod_training_hps_checkpoints_save_volume_mounts():
    return  {
        "name": "hps-checkpoints",
        "mountPath": JF_TRAINING_HPS_CHECKPOINT_ITEM_POD_STATIC_PATH #/checkpoints-base/n_iter -> /checkpoints 로 링크 관리. (hps 코드 내에서)
    }

def get_pod_training_hps_checkpoints_save_volumes(workspace_name, training_name, hps_name, hps_group_index):
    return  {
        "name": 'hps-checkpoints',
        "hostPath": {
            "path": JF_TRAINING_HPS_CHECKPOINT_ITEM_HOST_PATH.format(workspace_name=workspace_name, training_name=training_name, hps_name=hps_name, hps_group_index=hps_group_index),
            "type": "DirectoryOrCreate"
        }
    }
            
# JOB LOG 저장용 경로
def get_pod_training_job_logs_volume_mounts():
    return  {
        "name": "job-logs",
        "mountPath": JF_TRAINING_JOB_LOG_DIR_POD_PATH
    }

def get_pod_training_job_logs_volumes(workspace_name, training_name):
    return  {
        "name": "job-logs",
        "hostPath": {
            "path": JF_TRAINING_JOB_LOG_DIR_HOST_PATH.format(workspace_name=workspace_name, training_name=training_name)
        }
    }

# HPS LOG 저장용 경로
def get_pod_training_hps_logs_volume_mounts():
    return  {
        "name": "hps-logs",
        "mountPath": JF_TRAINING_HPS_LOG_DIR_POD_PATH
    }

def get_pod_training_hps_logs_volumes(workspace_name, training_name):
    return  {
        "name": 'hps-logs',
        "hostPath": {
            "path": JF_TRAINING_HPS_LOG_DIR_HOST_PATH.format(workspace_name=workspace_name, training_name=training_name),
            "type": "DirectoryOrCreate"
        }
    }


# HPS SAVE LOAD 파일 저장 경로
def get_pod_training_hps_save_load_files_volume_mounts():
    return {
        "name": "hps-save-load-files",
        "mountPath": JF_TRAINING_HPS_SAVE_FILE_DIR_POD_STATIC_PATH
    }

def get_pod_training_hps_save_load_files_volumes(workspace_name, training_name, hps_name):
    return {
        "name": 'hps-save-load-files',
        "hostPath": {
            "path": JF_TRAINING_HPS_SAVE_FILE_DIR_HOST_PATH.format(workspace_name=workspace_name, training_name=training_name, hps_name=hps_name),
            "type": "DirectoryOrCreate"
        }
    }

# HPS run file 경로
def get_pod_training_hps_run_file_volume_mounts():
    return  {
        "name": "hps-runfile",
        "mountPath": JF_HPS_RUN_FILE_POD_PATH

    }

def get_pod_training_hps_run_file_volumes():
    return {
        "name": "hps-runfile",
        "hostPath": {
            "path": JF_HPS_RUN_FILE_HOST_PATH,
            "type": "DirectoryOrCreate"
        }
    }

# Deployment Worker Log dir
# 각종 로그들 저장 하는 경로. monitor.txt, nginx_count.json ...
# {deployment_name}/log/{deployment_worker_id}/ 
def get_pod_deployment_worker_log_dir_volume_mounts():
    return  {
        "name":"deployment-worker-log",
        "mountPath": POD_API_LOG_BASE_PATH_IN_POD
    }

def get_pod_deployment_worker_log_dir_volumes(workspace_name, deployment_name, deployment_worker_id):
    return {
        "name": "deployment-worker-log",
        "hostPath": {
            "path": POD_API_LOG_BASE_PATH_IN_HOST_PATH.format(
                DEPLOYMENT_HOME_IN_HOST=JF_DEPLOYMENT_HOST_PATH.format(workspace_name=workspace_name, deployment_name=deployment_name), 
                DEPLOYMENT_WORKER_ID=deployment_worker_id),
            "type": "DirectoryOrCreate"
        }
    }

# Built-in code 마운트 경로
def get_pod_built_in_model_volume_mounts():
    return  {
        "name": "built-in-model",
        "mountPath": JF_BUILT_IN_MODELS_MODEL_POD_PATH
    }

def get_pod_built_in_model_volumes(built_in_model_path):
    return  {
        "name": "built-in-model",
        "hostPath": {
            "path": JF_BUILT_IN_MODELS_MODEL_HOST_PATH.format(built_in_model_path=built_in_model_path),
            "type": "DirectoryOrCreate"
        }
    }

# Checkpoint (/jf-data/ckpt_data/{dir_name}) 아이템 마운트 경로
# /jf-checkpoint-home 밑으로 여러개를 마운트하게 될 수 있음
def get_pod_checkpoint_data_volume_mounts():
    return  {
        "name": "checkpoint-data-item",
        "mountPath": JF_CHECKPOINT_POD_PATH
    }

def get_pod_checkpoint_data_volumes(workspace_name, dir_name=None):
    return  {
        "name": "checkpoint-data-item",
        "hostPath": {
            "path": JF_CHECKPOINT_HOST_PATH.format(workspace_name=workspace_name),# JF_CHECKPOINT_ITEM_HOST_PATH.format(workspace_name=workspace_name, dir_name=dir_name), 
            "type": "DirectoryOrCreate"
        }
    }


# ETC SYNC  - CONFIGMAP
# workspace, training  user 변동에 따라서 ssh로 접속 가능한 user  sync 맞춰주기 위한 스크립트
def get_pod_etc_sync_script_volume_mounts():
    return  {
        "name": "etc-sync-volume",
        "mountPath": "/bin/etc_sync.sh",
        "readOnly": True,
        "subPath": "etc_sync.sh"
    }
def get_pod_etc_sync_script_volumes():
    return  {  
        "name": "etc-sync-volume",
        "configMap": {
            "defaultMode": 511,  # 476
            "name": "etc-sync"
        }
    }

# USER INFO - (passwd, shadow, group, gshadow)
# ETC SYNC 가 가져올 때 필요한 데이터들 마운트
def get_pod_userinfo_etc_host_volume_mounts():
    return  {
        "name": "userinfo",
        "mountPath": JF_ETC_DIR_POD_PATH
    }
def get_pod_userinfo_etc_host_volumes(workspace_name, training_name):
    return  {  # 유저 계정 접속을 위한
        "name": "userinfo",
        "hostPath": {
            "path": JF_ETC_HOST_TRAINING_DIR_PATH.format(workspace_name=workspace_name, training_name=training_name),
            "type": "DirectoryOrCreate"
        }
    }

# POD STATUS 제공용
# Installing, Error, Running 인지 확인용 경로
def get_pod_status_flag_volume_mounts():
    return  {
        "name": "pod-status",
        "mountPath": POD_STATUS_IN_POD
    }
def get_pod_status_flag_volumes(pod_name):
    return  {  
        "name": "pod-status",
        "hostPath": {
            "path": POD_STATUS_IN_HOST.format(pod_name=pod_name),
            "type": "DirectoryOrCreate"
        }
    }
