import configparser
from PATH import *
# ====================== DEFAULT ======================
# Flask Settings
HOST_IP = '@MASTER_IP@'
FLASK_SERVER_NAME = '0.0.0.0:56788'
FLASK_SERVER_IP = FLASK_SERVER_NAME.split(':')[0]
FLASK_SERVER_PORT = int(FLASK_SERVER_NAME.split(':')[-1])
FLASK_DEBUG = False

# Flask-Restplus Settings
RESTPLUS_SWAGGER_UI_DOC_EXPANSION = 'list'
RESTPLUS_VALIDATE = True
RESTPLUS_MASK_SWAGGER = False
RESTPLUS_ERROR_404_HELP = False

# Maria DB Settings
JF_DB_HOST = '@MASTER_IP@'
JF_DB_PORT = 3306
JF_DB_USER = 'root'
JF_DB_PW = '1234'
JF_DB_NAME = 'jfb'
JF_DUMMY_DB_NAME = 'jfb_dummy'
JF_DB_CHARSET = 'utf8'
JF_DB_DOCKER = 'JF-mariadb'
JF_DB_ATTEMP_TO_CREATE = True # Attempt to create (DB TABLE and DUMMPY TABE) at every startup. can be slow.
JF_DB_MAX_CONNECTIONS = 500 # DB max Connection variable setting

# Worker
JF_WORKER_PORT = 6000
JF_WORKER_IP = '0.0.0.0'
JF_WORKER_CONNECT_TIMEOUT = 2 # Request Timeout 
JF_WORKER_FLASK_LOG = False # True -> docker logs JF-worker - 192.168.0.61 - - [07/Apr/2022 06:37:27] "GET /worker/cpu_usage HTTP/1.1" 200 -

# JF-DIR
# 경로 정보 
# PATH = Docker(API) 안에서 바라보는 경로  (API 내부에서 파일 찾거나, 쓰기 위해서)
# HOST_PATH = Docker 밖(host)에서 바라보는 경로 (kubernetes pod이 마운트 하기 위해)
# POD_PATH = POD 안에서 바라보는 경로 (POD내에서 파일 찾거나, 쓰기 위해서)
# JF_WS_DIR = '/jf-data/workspaces'
# JF_WS_HOST_DIR = '/jfbcore/{JF_WS_DIR}'.format(JF_WS_DIR=JF_WS_DIR)
# JF_ETC_DIR = '/jf-data/etc_host'
# JF_ETC_DIR_HOST_PATH = '/jfbcore/{JF_ETC_DIR}'.format(JF_ETC_DIR=JF_ETC_DIR) # /jfbcore/jf-data/etc_host
# JF_ETC_DIR_POD_PATH = '/etc_host'
# JF_UPLOAD_DIR = '/jf-data/tmp'
# JF_LOG_DIR = '/jf-data/log'
# JF_DB_DIR = '/jf-src/master/utils'
# JF_BIN_DIR = '/jf-bin'
# JF_BUILT_IN_MODELS_PATH = "/jf-bin/built_in_models"
# JF_BUILT_IN_DATASETS_PATH = "/jf-bin/built_in_datasets.tar.gz"
# JF_BUILT_IN_MODELS_HOST_PATH = "/jfbcore/jf-bin/built_in_models"
# JF_ROOT_CHECKPOINT_PATH = "/jf-data/ckpt_data" # independent from workspace
# JF_ROOT_CHECKPOINT_HOST_PATH = "/jfbcore/jf-data/ckpt_data" # independent from workspace
# JF_SUPPORT_BINARY_HOST_PATH = "/jfbcore/jf-bin/support" # Basic support binary 
# JF_SUPPORT_BINARY_POD_PATH = "/usr/bin/support"

# JF_ETC_HOST_WORKSPACE_DIR_PATH = JF_ETC_DIR_HOST_PATH + "/{workspace_name}"
# JF_ETC_HOST_TRAINING_DIR_PATH = JF_ETC_DIR_HOST_PATH + "/{workspace_name}/{training_name}"

# JF_TRAINING_PATH = "/jf-data/workspaces/{workspace_name}/trainings/{training_name}"
# JF_TRAINING_HOST_PATH = "/jfbcore/jf-data/workspaces/{workspace_name}/trainings/{training_name}"
# JF_TRAINING_POD_PATH = "/jf-home"

# JF_TRAINING_SRC_PATH = "/jf-data/workspaces/{workspace_name}/trainings/{training_name}/src"
# JF_TRAINING_SRC_HOST_PATH = "/jfbcore/jf-data/workspaces/{workspace_name}/trainings/{training_name}/src"

# JF_TRAINING_JOB_CHECKPOINT_BASE_PATH = "{JF_TRAINING_PATH}/job-checkpoints".format(JF_TRAINING_PATH=JF_TRAINING_PATH)
# JF_TRAINING_JOB_CHECKPOINT_BASE_HOST_PATH = "{JF_TRAINING_HOST_PATH}/job-checkpoints".format(JF_TRAINING_HOST_PATH=JF_TRAINING_HOST_PATH)
# JF_TRAINING_JOB_LOG_DIR_POD_PATH="/job_logs"

# JF_TRAINING_HPS_CHECKPOINT_BASE_PATH = "{JF_TRAINING_PATH}/hps-checkpoints".format(JF_TRAINING_PATH=JF_TRAINING_PATH)
# JF_TRAINING_HPS_CHECKPOINT_BASE_HOST_PATH = "{JF_TRAINING_HOST_PATH}/hps-checkpoints".format(JF_TRAINING_HOST_PATH=JF_TRAINING_HOST_PATH)

# JF_CHECKPOINT_PATH = "/jf-data/workspaces/{workspace_name}/ckpt_data"
# JF_CHECKPOINT_HOST_PATH = "/jfbcore/jf-data/workspaces/{workspace_name}/ckpt_data" # /jfbcore/jf-data/ckpt_data/[CHECKPOINT_ID]/DATA
# JF_DEPLOYMENT_PATH = "/jf-data/workspaces/{workspace_name}/deployments/{deployment_name}"
# JF_DEPLOYMENT_HOST_PATH = "/jfbcore/jf-data/workspaces/{workspace_name}/deployments/{deployment_name}"
# JF_DEPLOYMENT_LOG_DIR_PATH = JF_DEPLOYMENT_PATH + "/log/"
# JF_DEPLOYMENT_LOG_DIR_HOST_PATH = JF_DEPLOYMENT_HOST_PATH + "/log/"
# JF_DEPLOYMENT_WORKER_LOG_DIR_PATH = JF_DEPLOYMENT_PATH + "/log/{deployment_worker_id}"
# JF_DEPLOYMENT_WORKER_LOG_DIR_HOST_PATH = JF_DEPLOYMENT_HOST_PATH + "/log/{deployment_worker_id}"

# JF_DATASET_PATH = JF_WS_DIR+"/{workspace_name}/datasets/{access}/{dataset_name}"
# JF_DATASET_HOST_DIR = JF_WS_HOST_DIR + "/{workspace_name}/datasets/{access}/{dataset_name}"

# Docker image (*.tar/Dockerfile) upload base path
BASE_IMAGE_PATH = '/jf-data/images' # in docker
BASE_DOCKERFILE_PATH = '/jf-data/images' # in docker
HOST_BASE_IMAGE_PATH = '/jfbcore/jf-data/images' # in host
HOST_BASE_DOCKERFILE_PATH = '/jfbcore/jf-data/images' # in host
JF_DEFAULT_IMAGE = 'jf_default:latest'
JF_CPU_DEFAULT_IMAGE = 'jf_ml_cpu_image:latest'
JF_GPU_TF2_IMAGE = 'jf_ml_gpu_tf2_image:latest'
JF_GPU_TORCH_IMAGE = 'jf_ml_gpu_torch_image:latest'

JF_DEFAULT_IMAGE_NAME="jf-default"
JF_CPU_DEFAULT_IMAGE_NAME="[jf]cpu"
JF_GPU_TF2_IMAGE_NAME="[jf]gpu_tf2"
JF_GPU_TORCH_IMAGE_NAME="[jf]gpu_torch"


# Docker Registry URL
#DOCKER_REGISTRY_URL = '192.168.1.13:5000/' # Should be an empty string or finished with slash(`/')
DOCKER_REGISTRY_URL = '@MASTER_IP@:5000/' # Should be an empty string or finished with slash(`/')
DOCKER_REGISTRY_PROTOCOL = "https://" # "http://" | "https://"

# [Docker build Server]
DOCKER_BUILD_SERVER_IP = None

#[Others]
ENABLE_LOG_FUNCTION_CALL = True
NO_INIT_SCHEDULER = False # For debuging (TEST API in A server, DB and Kuber in B server)
RUNNING_API_WITHOUT_SYSTEM_CHECK = False # True = Force running
NODE_DB_IP_AUTO_CHAGE_TO_KUBER_INTERNAL_IP = False # True = If DB IP and KUBER INTERNAL IP are different, change to KUBER INTERNAL IP
NODE_DB_NAME_AUTO_CHAGE_TO_KUBER_NODE_NAME = False # True = If DB NAME and KUBER NODE NAME are different, change to KUBER NODE NAME
IMAGE_LIBRARY_INIT = True # image.py

#[Dataset] FB에서 다운로드 지원여부
DATASET_DOWNLOAD_ALLOW= True

#[Ingress option (jupyter, service)]
EXTERNAL_HOST = None
EXTERNAL_HOST_REDIRECT = False
INGRESS_PROTOCOL = 'http'

#[Login option]
NO_TOKEN_VALIDATION_CHECK = False # Allow Multiple Login, Ignore Token expired etc..
TOKEN_EXPIRED_TIME = 3600 * 8 # 마지막 API 요청 이후로 부터 선언한 시간이 지나도록 사용이 없으면 TOKEN 자동 만료 (초)
TOKEN_UPDATE_TIME = 600 # 새 TOKEN 으로 업데이트 하는 주기 (초)
MAX_NUM_OF_LOGINS = 5

#[Login method]
LOGIN_METHOD =  "jfb" # jfb(default), jonathan, kisti
LOGIN_VALIDATION_CHECK_API = "" # jonathan("http://api.acryl.ai/accounts/profile"), kisti("http://10.211.55.52:8080/auth")

#[User resource limit]
USER_DOCKER_IMAGE_LIMIT = None
USER_DATASET_LIMIT = None
USER_TRAINING_LIMIT = None
USER_DEPLOYMENT_LIMIT = None

#[Kuber Settings]
KUBER_CONFIG_PATH = "/jf-bin/launcher_bins/.kube/config"
KUBER_NETWORK_ATTACHMENT_DEFINITION_USE = True # Multiple network interface use on Pod

#[Kuber Resource Limit]
NO_USE_NODES = None # Node name or Node ip ex) "192.168.1.16,192.168.1.15"
CPU_POD_RUN_ON_ONLY_CPU_NODES = False # True | False
CPU_NODES = None # Node name or Node ip  ex)  "jf-node-06,jf-node-05"

#[SSH BANNER and MOTD]
SSH_BANNER_FILE_PATH = None # BANNER FILE PATH (None = Default Banner)
SSH_MOTD_FILE_PATH = None # MOTD FILE PATH (None = Default MOTD) 

#[Launcher Settings] # API and Launcher must be on the same server (Cannot be changed). ini file shared by all connected servers.
LAUNCHER_ID = "launcher"
LAUNCHER_PW = "qwerty"
LAUNCHER_PRIVATE_KEY = "/jfbcore/jf-bin/launcher_bins/.ssh/jf_launcher_id_rsa" # TODO
LAUNCHER_DEFAULT_ADDR = "127.0.0.1" 
LAUNCHER_SSH_PORT = 22 
LAUNCHER_KEY_LOGIN = False # 

#[Deployment]
DEPLOYMENT_RESPONSE_TIMEOUT = 1000 # "n"
DEPLOYMENT_API_MODE = "prefix" # "prefix" | "port" (TYPE.py - DEPLOYMENT_PREFIX_MODE, DEPLOYMENT_PORT_MODE)
DEPLOYMENT_TEMPLATE_DB_UPDATE = False # 기존에 만들어진 Deployment 내용을 template화 (업데이트 시 최초 1회 사용으로 충분)

# [HPS]
HYPERPARAM_SEARCH_RUN_FILE = "python3 /hps_runfile/search_ver3-inter/search.py" # "/hps_runfile/hps_u" # /hps_runfile = /jfbcore/jf-bin/hps

# [TEMP-DNA]
DNA_WS_ADDR = "http://129.254.70.148:8085" # ETRI 
INFERENCE_GPU_DEFAULT = 0
KISTI_OTP_ROOT_USER_ID = "r865a06" # Root 로 로그인 시 어느 아이디의 OTP를 사용할것인지 

# [LOG-DATA]
CRITIAL_ERROR_LOG="/jf-data/log/critial_error.json"
GPU_HISTORY_DATA="/jf-data/log/gpu_history_data.json"
CPU_HISTORY_DATA="/jf-data/log/cpu_history_data.json"
RAM_HISTORY_DATA="/jf-data/log/ram_history_data.json"

# [TRAINING-TOOL]
JUPYTER_AUTO_INSTALL=True

# [TIMEZONE-SETTING]
UTC_OFFSET=9

# [FS-SETTING]
FILESYSTEM_OPTION = "Unknown" # Unknown, MFS, Mounted
MAIN_STORAGE_PATH = "/jfbcore" # TODO 임시. MAIN STORAGE 영역 이외에 SUB STORAGE 개념 추가 시 조정 필요

# ====================== DEFAULT ======================

def load_ini():
    config = configparser.ConfigParser()
    load = config.read('settings.ini')
    items = []
    for section in config.sections():
        items += [item for item in config[section].items()]

    return items

def get_settings_ini_b():
    with open("settings.ini","rb") as fr:
        settings_ini_b = fr.read()
    return settings_ini_b

def is_settings_ini_changed():
    if settings_ini_b == get_settings_ini_b():
        return False
    else :
        return True

settings_ini_b = get_settings_ini_b()

items = load_ini()
for k, v in items:
    print("SETTING INI INFO : ", k.upper() , v)
    exec("{} = {}".format(k.upper(), v))
