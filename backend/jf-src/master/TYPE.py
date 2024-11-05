import settings
from TYPE_KUBE_ENV import *
from PATH import *

TRAINING_TYPE_KEY = "training_type"
TRAINING_TYPE = "training" # gpu usage type 중 하나
TRAINING_TYPE_DIR = "trainings"
TRAINING_TYPE_A = "advanced" # training GPU
TRAINING_TYPE_B = "jupyter" # Jupyter notebook #TODO REMOVE
TRAINING_TYPE_C = "built-in" # Built-in Model 
TRAINING_TYPE_D = "basic" # training CPU #TODO REMOVE
TRAINING_TYPE_E = "built-in-ji" # Built-in ji Model #TODO REMOVE

TRAINING_ITEM_A = "job"
TRAINING_ITEM_B = "tool"
TRAINING_ITEM_C = "hps"

TRAINING_CUSTOM_TYPES = [TRAINING_TYPE_A, TRAINING_TYPE_D]
TRAINING_BUILT_IN_TYPES = [TRAINING_TYPE_C, TRAINING_TYPE_E]
TRAINING_TYPES = [TRAINING_TYPE_A, TRAINING_TYPE_B, TRAINING_TYPE_C, TRAINING_TYPE_D]

DEPLOYMENT_TYPE_KEY = "deployment_type" # TEMP
DEPLOYMENT_TYPE = "deployment" # gpu usage type 중 하나
DEPLOYMENT_TYPE_DIR = "deployments"
DEPLOYMENT_TYPE_A = "built-in" # TEMP
DEPLOYMENT_TYPE_B = "custom" # TEMP
DEPLOYMENT_TYPE_C = "example" # TEMP
DEPLOYMENT_TYPE_E = "built-in-ji"

DEPLOYMENT_ITEM_A = "deployment"

DEPLOYMENT_TYPES = [DEPLOYMENT_TYPE_A, DEPLOYMENT_TYPE_B, DEPLOYMENT_TYPE_E]

CREATE_KUBER_TYPE = [TRAINING_ITEM_A, TRAINING_ITEM_B, DEPLOYMENT_ITEM_A, TRAINING_ITEM_C]


KUBE_POD_STATUS_ACTIVE = "active"
KUBE_POD_STATUS_RUNNING = "running" # deployment, training
KUBE_POD_STATUS_INSTALLING = "installing" # deployment
KUBE_POD_STATUS_ERROR = "error" # deployment
KUBE_POD_STATUS_STOP = "stop" # deployment, training
KUBE_POD_STATUS_DONE = "done" # == stop # training
KUBE_POD_STATUS_PENDING = "pending" # training

KUBER_NOT_RUNNING_STATUS = ["stop", "expired", "reserved"]
KUBER_RUNNING_STATUS = ["running", "installing", "error"]
# running, installing, error

GPU_ALL_MODE = "all"
GPU_GENERAL_MODE = "general"
GPU_MIG_MODE = "mig"

# DEFAULT LABEL
KUBE_NODE_NAME_LABEL_KEY = "kubernetes.io/hostname"

# GPU-FEATURE-DISCOVERY LABEL
GFD_GPU_MODEL_LABEL_KEY = "nvidia.com/gpu.product"
GFD_GPU_MEMORY_LABEL_KEY = "jfb/gpu-memory"

# JF LABEL (KUBE LABEL)
CPU_WORKER_NODE_LABEL_KEY = "jfb/cpu-worker-node"
GPU_WORKER_NODE_LABEL_KEY = "jfb/gpu-worker-node"
GPU_MODEL_LABEL_KEY = "jfb/gpu-model"
GPU_MEMORY_LABEL_KEY = "jfb/gpu-memory"
GPU_CUDA_LABEL_KEY = "jfb/gpu-cuda-cores"
GPU_COMPUTER_CAPABILITY_LABEL_KEY = "jfb/gpu-computer-capability"
GPU_ARCHITECTURE_LABEL_KEY = "jfb/architecture"
CPU_MODEL_LABEL_KEY = "jfb/cpu-model"
CPU_MODEL_ENCODED_LABEL_KEY = "jfb/cpu-model-encoded"

NODE_NAME_LABEL_KEY = "kubernetes.io/hostname"

POD_NETWORK_INTERFACE_LABEL_KEY = "network_interface"
DEPLOYMENT_API_MODE_LABEL_KEY = "api_mode"
PARENT_DEPLOYMENT_WORKER_ID_LABEL_KEY = "parent_deployment_worker_id"

DEPLOYMENT_SERVICE_TYPE_LABEL_KEY = "service_type"
DEPLOYMENT_SERVICE_USER_NODE_PORT_VALUE = "user-nodeport"
DEPLOYMENT_SERVICE_USER_CLUSTER_IP_VALUE = "user-clusterip"
DEPLOYMENT_SERVICE_SYSTEM_NODE_PORT_VALUE = "system-nodeport"
DEPLOYMENT_SERVICE_SYSTEM_CLUSTER_IP_VALUE = "user-node-port"

NAD_NETWORK_INTERFACE_TYPE_KEY="network-interface-type"
NAD_NETWORK_GROUP_CATEGORY_KEY = "network-group-category"

# Kubernetes Node Resource Key (ex - cpu, memory, ephemeral-storage, nvidia.com/gpu)
K8S_RESOURCE_CPU_KEY = "cpu" 
K8S_RESOURCE_MEMORY_KEY = "memory"
K8S_RESOURCE_EPHEMERAL_STORAGE_KEY = "ephemeral-storage"

K8S_RESOURCE_NETWORK_IB_LABEL_PREFIX = "jf.network.ib/"
K8S_RESOURCE_NETWORK_IB_LABEL_KEY = K8S_RESOURCE_NETWORK_IB_LABEL_PREFIX + "{ib_interface}"
K8S_RESOURCE_DEVICE_RDMA_IB_LABEL_PREFIX = "jf.device.rdma.ib/"
K8S_RESOURCE_DEVICE_RDMA_IB_LABEL_KEY = K8S_RESOURCE_DEVICE_RDMA_IB_LABEL_PREFIX + "{ib_interface}"


IB_RESOURCE_LABEL_KEY = "jf/ib"

NVIDIA_GPU_BASE_LABEL_KEY = "nvidia.com/"
NVIDIA_GPU_MIG_BASE_FLAG = "mig"
NVIDIA_GPU_RESOURCE_LABEL_KEY = NVIDIA_GPU_BASE_LABEL_KEY + "gpu"
NVIDIA_MIG_GPU_RESOURCE_LABEL_KEY = NVIDIA_GPU_BASE_LABEL_KEY + "{mig_key}" # nvidia.com/mig-1g.5gb, nvidia.com/mig-2g.10gb ..
                                                                            # NVIDIA_MIG_GPU_RESOURCE_LABEL_KEY.format(mig_key=NVIDIA_GPU_MIG_BASE_FLAG)

JUPYTER_FLAG = "--jupyter"
DEPLOYMENT_FLAG = "--deployment"
TENSORBOARD_FLAG = "--tensorboard"
SSH_FLAG = "--ssh"
USERPORT_NODEPORT_FLAG = "--userport-0"
USERPORT_CLUSTER_IP_PORT_FLAG = "--userport-1"
SYSTEM_NODEPORT_FLAG = "--system-0"
SYSTEM_CLUSTER_IP_PORT_FLAG = "--system-1"
FILEBROWSER_FLAG = "--filebrowser"

# KUBE ANNOTAION
K8S_ANNOTAION_NAD_RESOURCE_NAME_KEY = "k8s.v1.cni.cncf.io/resourceName" # NAD가 어느 resource와 맵핑 되는 것인지 정의해주는 annotation
K8S_ANNOTAION_NAD_NETWORK_STATUS_KEY = "k8s.v1.cni.cncf.io/network-status" # 사용자 정의값 반영 및 시스템적으로 추가한 실제 동작중에 있는 정보를 포함하는 annotation
K8S_ANNOTAION_NAD_NETWORKS_KEY = "k8s.v1.cni.cncf.io/networks" # 사용자 정의값 할당 시 사용하는 annotation

# KUBE OPTION
KUBE_SERVICE_TYPE = ["NodePort", "ClusterIP"] # + LoadBalancer, ExternalName

# TRAINING TOOL
DEFAULT_SSH_PORT_NAME = "ssh"
DEFAULT_SSH_PORT = 22
DEFAULT_SSH_PROTOCOL = "TCP"
DEFAULT_SSH_SERVICE_TYPE = KUBE_SERVICE_TYPE[0]

DEFAULT_JUPYTER_PORT_NAME = "jupyter"
DEFAULT_JUPYTER_PORT = 8888
DEFAULT_JUPYTER_PROTOCOL = "TCP"
DEFAULT_JUPYTER_SERVICE_TYPE = KUBE_SERVICE_TYPE[1]

DEFAULT_RSTUDIO_PORT_NAME = "rstudio"
DEFAULT_RSTUDIO_PORT = 8787
DEFAULT_RSTUDIO_PROTOCOL = "TCP"
DEFAULT_RSTUDIO_SERVICE_TYPE = KUBE_SERVICE_TYPE[0]

DEFAULT_FILEBROWSER_PORT_NAME = "filebrowser"
DEFAULT_FILEBROWSER_PORT = 8080
DEFAULT_FILEBROWSER_PROTOCOL = "TCP"
DEFAULT_FILEBROWSER_SERVICE_TYPE = KUBE_SERVICE_TYPE[0]

TOOL_EDITOR_ID = 0
TOOL_EDITOR_KEY = "editor"
TOOL_JUPYTER_ID = 1
TOOL_JUPYTER_KEY = "jupyter"
TOOL_JOB_ID = 2
TOOL_JOB_KEY = "job"
TOOL_HPS_ID = 3
TOOL_HPS_KEY = "hps"
TOOL_SSH_ID = 4
TOOL_SSH_KEY = "ssh"
TOOL_RSTUDIO_ID = 5
TOOL_RSTUDIO_KEY = "rstudio"
TOOL_FILEBROWSER_ID = 6
TOOL_FILEBROWSER_KEY = "filebrowser"

TOOL_TYPE = {
    TOOL_EDITOR_ID: TOOL_EDITOR_KEY,
    TOOL_JUPYTER_ID: TOOL_JUPYTER_KEY,
    TOOL_JOB_ID: TOOL_JOB_KEY,
    TOOL_HPS_ID: TOOL_HPS_KEY,
    TOOL_SSH_ID: TOOL_SSH_KEY,
    TOOL_RSTUDIO_ID: TOOL_RSTUDIO_KEY,
    TOOL_FILEBROWSER_ID: TOOL_FILEBROWSER_KEY
}
TOOL_TYPE_ID = {
    TOOL_EDITOR_KEY: TOOL_EDITOR_ID,
    TOOL_JUPYTER_KEY: TOOL_JUPYTER_ID,
    TOOL_JOB_KEY: TOOL_JOB_ID,
    TOOL_HPS_KEY: TOOL_HPS_ID,
    TOOL_SSH_KEY: TOOL_SSH_ID,
    TOOL_RSTUDIO_KEY: TOOL_RSTUDIO_ID,
    TOOL_FILEBROWSER_KEY: TOOL_FILEBROWSER_ID
}
# Tool이 무슨 기능이 베이스인지 정보 제공용
TOOL_BASE_JUPYTER = "jupyter"
TOOL_BASE_UI = "ui"
TOOL_BASE_SSH = "ssh"
TOOL_BASE_RSTUDIO = "rstudio"
TOOL_BASE_FILEBROWSER = "filebrowser"

TOOL_BASE = {
    TOOL_EDITOR_ID: TOOL_BASE_JUPYTER,
    TOOL_JUPYTER_ID: TOOL_BASE_JUPYTER,
    TOOL_JOB_ID: TOOL_BASE_UI,
    TOOL_HPS_ID: TOOL_BASE_UI,
    TOOL_SSH_ID: TOOL_BASE_SSH,
    TOOL_RSTUDIO_ID: TOOL_BASE_RSTUDIO,
    TOOL_FILEBROWSER_ID: TOOL_BASE_FILEBROWSER
}

TOOL_JUPYTER_BASE_LIST = [TOOL_EDITOR_ID, TOOL_JUPYTER_ID]
TOOL_SSH_BASE_LIST = [TOOL_SSH_ID]
TOOL_RSTUDIO_BASE_LIST = [TOOL_RSTUDIO_ID]
TOOL_FILEBROWSER_BASE_LIST = [TOOL_FILEBROWSER_ID]
# TOOL이 가지고 있는 기본 기능-Front와 연동용 (ssh, jupyter 버튼)
# TODO TOOL_BASE 와 TOOL_BUTTON 의 변수 분리 예정 (2022-09-29 Yeobie)
TOOL_BUTTON_LINK = "link"
TOOL_DEFAULT_FUNCTION_LIST = {
    TOOL_EDITOR_KEY : [TOOL_BASE_SSH, TOOL_BASE_JUPYTER, TOOL_BUTTON_LINK], # TODO TOOL_BASE_JUPYTER 는 삭제 예정 (2022-09-29 Yeobie)
    TOOL_JUPYTER_KEY : [TOOL_BASE_SSH, TOOL_BASE_JUPYTER, TOOL_BUTTON_LINK], # TODO TOOL_BASE_JUPYTER 는 삭제 예정 (2022-09-29 Yeobie)
    TOOL_JOB_KEY : [TOOL_BASE_UI],
    TOOL_HPS_KEY : [TOOL_BASE_UI],
    TOOL_SSH_KEY : [TOOL_BASE_SSH],
    TOOL_RSTUDIO_KEY: [TOOL_BUTTON_LINK],
    TOOL_FILEBROWSER_KEY: [TOOL_BUTTON_LINK]
}
# ON/OFF로 동작하는 Tool 여부
TOOL_ON_OFF_POSSIBLE_LIST = [
    TOOL_EDITOR_ID,
    TOOL_JUPYTER_ID,
    TOOL_SSH_ID,
    TOOL_RSTUDIO_ID,
    TOOL_FILEBROWSER_ID
]
TOOL_DEFAULT_PORT = {
    TOOL_EDITOR_KEY : [
        { "name": DEFAULT_SSH_PORT_NAME, "port": DEFAULT_SSH_PORT, "protocol": DEFAULT_SSH_PROTOCOL, "type": DEFAULT_SSH_SERVICE_TYPE }, 
        { "name": DEFAULT_JUPYTER_PORT_NAME, "port": DEFAULT_JUPYTER_PORT, "protocol": DEFAULT_JUPYTER_PROTOCOL, "type": DEFAULT_JUPYTER_SERVICE_TYPE }
    ],
    TOOL_JUPYTER_KEY: [
        { "name": DEFAULT_SSH_PORT_NAME, "port": DEFAULT_SSH_PORT, "protocol": DEFAULT_SSH_PROTOCOL, "type": DEFAULT_SSH_SERVICE_TYPE }, 
        { "name": DEFAULT_JUPYTER_PORT_NAME, "port": DEFAULT_JUPYTER_PORT, "protocol": DEFAULT_JUPYTER_PROTOCOL, "type": DEFAULT_JUPYTER_SERVICE_TYPE }
    ],
    TOOL_JOB_KEY: [],
    TOOL_HPS_KEY: [],
    TOOL_SSH_KEY: [
        { "name": DEFAULT_SSH_PORT_NAME, "port": DEFAULT_SSH_PORT, "protocol": DEFAULT_SSH_PROTOCOL, "type": DEFAULT_SSH_SERVICE_TYPE }, 
    ],
    TOOL_RSTUDIO_KEY: [
        { "name": DEFAULT_RSTUDIO_PORT_NAME, "port": DEFAULT_RSTUDIO_PORT, "protocol": DEFAULT_RSTUDIO_PROTOCOL, "type": DEFAULT_RSTUDIO_SERVICE_TYPE }, 
    ],
    TOOL_FILEBROWSER_KEY: [
        {"name": DEFAULT_FILEBROWSER_PORT_NAME, "port": DEFAULT_FILEBROWSER_PORT, "protocol": DEFAULT_FILEBROWSER_PROTOCOL, "type": DEFAULT_FILEBROWSER_SERVICE_TYPE },
    ]
}

DOCKER_IMAGE_INFO_KEY = "docker_image_info"
PORT_INFO_KEY = "port_info"
RESOURCE_INFO_KEY = "resource_info"

TOOL_EDIT_UI_LIST = [
    DOCKER_IMAGE_INFO_KEY,
    PORT_INFO_KEY,
    RESOURCE_INFO_KEY
]

TOOL_EDIT_UI_VISIBLE_LIST_BY_TYPE = {
    TOOL_EDITOR_KEY : [DOCKER_IMAGE_INFO_KEY, PORT_INFO_KEY], # [DOCKER_IMAGE_INFO_KEY, , RESOURCE_INFO_KEY],
    # TOOL_EDITOR_KEY : [DOCKER_IMAGE_INFO_KEY, RESOURCE_INFO_KEY, PORT_INFO_KEY], # [DOCKER_IMAGE_INFO_KEY, , RESOURCE_INFO_KEY],
    TOOL_JUPYTER_KEY : [DOCKER_IMAGE_INFO_KEY, PORT_INFO_KEY, RESOURCE_INFO_KEY],
    TOOL_JOB_KEY : [DOCKER_IMAGE_INFO_KEY, RESOURCE_INFO_KEY],
    TOOL_HPS_KEY : [DOCKER_IMAGE_INFO_KEY, RESOURCE_INFO_KEY],
    TOOL_SSH_KEY : [DOCKER_IMAGE_INFO_KEY, PORT_INFO_KEY, RESOURCE_INFO_KEY],
    TOOL_RSTUDIO_KEY: [DOCKER_IMAGE_INFO_KEY, RESOURCE_INFO_KEY],
    TOOL_FILEBROWSER_KEY: [DOCKER_IMAGE_INFO_KEY, RESOURCE_INFO_KEY]
}
JUPYTER_TOOL = [TOOL_TYPE[0], TOOL_TYPE[1]]

CHECKPOINT_EXTENSION = [".hdf5", ".pth", ".h5", ".pt", ".json", ".ckpt"]

#TODO INTERFACE KEY 관련 PARAMETER화 
INTERFACE_IB_KEY = "interface_ib" # DB node의 column명과 매칭
INTERFACE_IB_OUTPUT = "InfiniBand"
INTERFACE_IB_INTERFACE_NAME = "netib"
INTERFACE_10G_KEY = "interface_10g" # DB node의 column명과 매칭
INTERFACE_10G_OUTPUT = "10G Ethernet"
INTERFACE_10G_INTERFACE_NAME = "net10g" 
INTERFACE_1G_KEY = "interface_1g" # DB node의 column명과 매칭
INTERFACE_1G_OUTPUT = "1G Ethernet"
INTERFACE_UNKNOWN_OUTPUT = "Unknwon"
INTERFACE_INTRA_OUTPUT = "Intra Server"

# NODE GROUP, Network 관련
NETWORK_GROUP_DEFAULT_1G_NAME = "1G-Ethernet"
NETWORK_GROUP_DEFAULT_10G_NAME = "10G-Ethernet"
NETWORK_GROUP_DEFAULT_IB_NAME = "Infiniband"

NETWORK_GROUP_CATEGORY_INFINIBAND = "Infiniband"
NETWORK_GROUP_CATEGORY_ETHERNET = "Ethernet"
NETWORK_GROUP_CATEGORY_LIST = [ NETWORK_GROUP_CATEGORY_INFINIBAND, NETWORK_GROUP_CATEGORY_ETHERNET ]



NODE_NAME_KEY = "node_name"
NODE_NAME_DB_KEY = "name"

NODE_CPU_MODEL_KEY = "cpu_model"
NODE_NUM_OF_CPU_CORES_KEY = "cpu_cores" # TODO node_cpu_core, cpu_cores 정리 필요
NODE_POD_ALLOC_NUM_OF_CPU_CORES_KEY = "pod_alloc_cpu_cores" # cpu_limits
NODE_POD_ALLOC_AVALIABLE_NUM_OF_CPU_CORES_PER_POD_KEY = "pod_alloc_avaliable_cpu_cores_per_pod"
NODE_POD_ALLOC_AVALIABLE_NUM_OF_CPU_CORES_PER_GPU_KEY = "pod_alloc_avaliable_cpu_cores_per_gpu"
NODE_POD_ALLOC_CPU_CORES_RATIO_KEY = "cpu_cores_limits/total"
NODE_POD_ALLOC_REMAINING_NUM_OF_CPU_CORES_KEY = "cpu_cores_total-limits"
NODE_CPU_LIMIT_PER_POD_DB_KEY = "cpu_cores_limit_per_pod"
NODE_CPU_LIMIT_PER_GPU_DB_KEY = "cpu_cores_limit_per_gpu"
NODE_MEMORY_SIZE_KEY = "ram"
NODE_POD_ALLOC_MEMORY_SIZE_KEY = "pod_alloc_ram" # memory_limits
NODE_POD_ALLOC_AVALIABLE_MEMORY_SIZE_PER_POD_KEY = "pod_alloc_avaliable_ram_per_pod"
NODE_POD_ALLOC_AVALIABLE_MEMORY_SIZE_PER_GPU_KEY = "pod_alloc_avaliable_ram_per_gpu"
NODE_POD_ALLOC_MEMORY_RATIO_KEY = "ram_limits/total"
NODE_POD_ALLOC_REMAINING_MEMORY_SIZE_KEY = "ram_total-limits"
NODE_MEMORY_LIMIT_PER_POD_DB_KEY = "ram_limit_per_pod"
NODE_MEMORY_LIMIT_PER_GPU_DB_KEY = "ram_limit_per_gpu"
NODE_IS_CPU_SERVER_KEY = "is_cpu_server"
NODE_IS_GPU_SERVER_KEY = "is_gpu_server"
NODE_IS_NO_USE_SERVER_KEY = "no_use_server" # DB, API KEY 에서도 사용
NODE_EPHEMERAL_STORAGE_LIMIT_KEY =  "ephemeral_storage_limit"

NODE_CPU_CORE_LOCK_PER_POD_DB_KEY = "cpu_cores_lock_per_pod" # CPU Core를 Pod 마다 생성하는데 있어서 제한 하는지 여부 key (0,1) - DB KEY와 연결
NODE_CPU_CORE_LOCK_PERCENT_PER_POD_DB_KEY = "cpu_cores_lock_percent_per_pod"
NODE_CPU_CORE_LOCK_PER_GPU_DB_KEY = "cpu_cores_lock_per_gpu" # CPU Core를 GPU 마다 생성하는데 있어서 제한 하는지 여부 key (0,1) - DB KEY와 연결 # 현재 사용은 안함
NODE_CPU_CORE_LOCK_PERCENT_PER_GPU_DB_KEY = "cpu_cores_lock_percent_per_gpu"
NODE_MEMORY_LOCK_PER_POD_DB_KEY = "ram_lock_per_pod" 
NODE_MEMORY_LOCK_PERCENT_PER_POD_DB_KEY = "ram_lock_percent_per_pod"
NODE_MEMORY_LOCK_PER_GPU_DB_KEY = "ram_lock_per_gpu"
NODE_MEMORY_LOCK_PERCENT_PER_GPU_DB_KEY = "ram_lock_percent_per_gpu"

NODE_RESOURCE_CONGESTION_STATUS_PER_POD_KEY = "resource_congestion_status_per_pod" # NODE CPU/RAM 상태를 조합하여 Per Pod 당 혼잡도 상태 값 
NODE_RESOURCE_CONGESTION_STATUS_PER_GPU_KEY = "resource_congestion_status_per_gpu" # NODE CPU/RAM 상태를 조합하여 Per GPU 당 혼잡도 상태 값 
NODE_RESOURCE_CONGESTION_LOW_STATUS = 0 # 자원이 여유로운 상태 2개 이상 만들 수 있는 상태
NODE_RESOURCE_CONGESTION_MEDIUM_STATUS = 1 # 자원이 1 ~ 2개 정도 더 만들면 100% 넘길 수 있는 상태
NODE_RESOURCE_CONGESTION_HIGHT_STATUS = 2 # 생성 시 혹은 이미 100%를 넘긴 상태

NODE_RESOURCE_GENERABLE_STATUS_PER_POD_KEY = "resource_generable_status_per_pod"
NODE_RESOURCE_GENERABLE_STATUS_PER_GPU_KEY = "resource_generable_status_per_gpu"

NODE_NETWORK_GROUPS_ALLOC_KEY = "allocate_network_groups"

# KUBE-DEFAULT-SVC
DEPLOYMENT_API_PORT_NAME="deployment-api"

# DEPLOYMENT
DEPLOYMENT_PREFIX_MODE="prefix"
DEPLOYMENT_PORT_MODE="port"
DEPLOYMENT_API_DEFAULT_PORT=8555 # jf-bin/deployment_nginx DEPLOYMENT_NGINX_API_CONF_FILE_NAME와 연동 # API RUN
DEPLOYMENT_NGINX_DEFAULT_PORT=18555 # jf-bin/deployment_nginx DEPLOYMENT_NGINX_DEFAULT_CONF_FILE_NAME 연동 # LOG AND PROXY

DEPLOYMENT_NGINX_CONF_PATH_IN_POD="/etc/nginx_ex"
DEPLOYMENT_NGINX_API_CONF_FILE_NAME="api.conf"
DEPLOYMENT_NGINX_DEFAULT_CONF_FILE_NAME="nginx.conf"


DEPLOYMENT_NGINX_NUM_OF_LOG_PER_HOUR_DATE_FORMAT="%Y-%m-%dT%H" #"%Y-%m-%dT%H:%M"
DEPLOYMENT_API_NUM_OF_LOG_PER_HOUR_DATE_FORMAT="%Y-%m-%d %H" # "%Y-%m-%d %H:%M"
DEPLOYMENT_NGINX_PER_TIME_KEY="time"
DEPLOYMENT_NGINX_PER_TIME_NUM_OF_CALL_LOG_KEY="count"
DEPLOYMENT_NGINX_PER_TIME_RESPONSE_TIME_MEDIAN_KEY="median"
DEPLOYMENT_NGINX_PER_TIME_NUM_OF_ABNORMAL_LOG_COUNT_KEY="nginx_abnormal_count"
DEPLOYMENT_API_MONITOR_PER_TIME_NUM_OF_ABNORMAL_LOG_COUNT_KEY="api_monitor_abnormal_count"

DEFAULT_CUSTOM_DEPLOYMENT_JSON={
    "api_file_name": None,
    "checkpoint_load_dir_path_parser": None,
    "checkpoint_load_file_path_parser": None,
    "deployment_num_of_gpu_parser":None,
    "deployment_input_data_form_list": None,
    "deployment_output_types": None
}

# 템플릿 적용
DEPLOYMENT_RUN_CUSTOM="custom"
DEPLOYMENT_RUN_USERTRAINED="usertrained"
DEPLOYMENT_RUN_PRETRAINED="pretrained"
DEPLOYMENT_RUN_CHEKCPOINT="checkpoint"
DEPLOYMENT_RUN_SANDBOX="sandbox"

DEPLOYMENT_TEMPLATE_VERSION_1_TAIL = "v1"

DEPLOYMENT_TEMPLATE_TYPES = [f'{DEPLOYMENT_RUN_CUSTOM}_v1', f'{DEPLOYMENT_RUN_USERTRAINED}_v1', f'{DEPLOYMENT_RUN_PRETRAINED}_v1', f'{DEPLOYMENT_RUN_CHEKCPOINT}_v1']
DEPLOYMENT_RUN_CUSTOM_V1 = f'{DEPLOYMENT_RUN_CUSTOM}_v1'
DEPLOYMENT_RUN_USERTRAINED_V1 = f'{DEPLOYMENT_RUN_USERTRAINED}_v1'
DEPLOYMENT_RUN_PRETRAINED_V1 = f'{DEPLOYMENT_RUN_PRETRAINED}_v1'
DEPLOYMENT_RUN_CHEKCPOINT_V1 = f'{DEPLOYMENT_RUN_CHEKCPOINT}_v1'
DEPLOYMENT_RUN_SANDBOX_V1 = f'{DEPLOYMENT_RUN_SANDBOX}_v1'

DEPLOYMENT_DOCKER_IMAGE_NAME_KEY = "docker_image_name"

DEPLOYMENT_TEMPLATE_KIND_INFO_KEY = "kind"
DEPLOYMENT_TEMPLATE_TYPE_KEY = "deployment_template_type"
DEPLOYMENT_TEMPLATE_DEPLOYMENT_TYPE_KEY = "deployment_type"
DEPLOYMENT_TEMPLATE_TYPE_VERSION_KEY = "deployment_template_type_version"

DEPLOYMENT_TEMPLATE_CHECKPOINT_FILE_KEY = "checkpoint_file_path" # TODO template 수정사항 - checkpoint_file_path 로 변경?
DEPLOYMENT_TEMPLATE_CHECKPOINT_DIR_KEY = "checkpoint_dir_path"
DEPLOYMENT_TEMPLATE_RUNCODE_KEY = "run_code"
DEPLOYMENT_TEMPLATE_BUILT_IN_ID_KEY = "built_in_model_id"
DEPLOYMENT_TEMPLATE_BUILT_IN_NAME_KEY = "built_in_model_name"
DEPLOYMENT_TEMPLATE_TRAINING_ID_KEY = "training_id"
DEPLOYMENT_TEMPLATE_TRAINING_TYPE_KEY = "training_type"
DEPLOYMENT_TEMPLATE_TRAINING_NAME_KEY = "training_name"
DEPLOYMENT_TEMPLATE_JOB_ID_KEY = "job_id"
DEPLOYMENT_TEMPLATE_JOB_NAME_KEY = "job_name"
DEPLOYMENT_TEMPLATE_JOB_GROUP_INDEX_KEY = "job_group_index"
DEPLOYMENT_TEMPLATE_HPS_ID_KEY = "hps_id"
DEPLOYMENT_TEMPLATE_HPS_NAME_KEY = "hps_name"
DEPLOYMENT_TEMPLATE_HPS_GROUP_INDEX_KEY = "hps_group_index"
DEPLOYMENT_TEMPLATE_HPS_NUMBER_KEY = "hps_number"

DEPLOYMENT_TEMPLATE_RUN_COMMAND_KEY = "command"
DEPLOYMENT_TEMPLATE_RUN_BINARY_KEY = "binary"
DEPLOYMENT_TEMPLATE_RUN_SCRIPT_KEY = "script"
DEPLOYMENT_TEMPLATE_RUN_ARGUMENTS_KEY = "arguments"


DEPLOYMENT_TEMPLATE_ENVIRONMENTS_KEY = "environments"
DEPLOYMENT_TEMPLATE_MOUNT_KEY = "mount"
DEPLOYMENT_TEMPLATE_WORKING_DIRECTORY_KEY = "workdir"

DEPLOYMENT_TEMPLATE_DELETED_KEY = "is_deleted"


DEPLOYMENT_USERTRAINED_CHECKPOINT_POD_PATH_DIC = {
    TRAINING_ITEM_A:JF_TRAINING_JOB_CHECKPOINT_ITEM_POD_PATH,
    TRAINING_ITEM_C:JF_TRAINING_HPS_CHECKPOINT_ITEM_POD_DIR_PATH
}


# DEPLOYMENT_TEMPLATE_KIND_INFO = {
#     DEPLOYMENT_TEMPLATE_DEPLOYMENT_TYPE_KEY:None,
#     DEPLOYMENT_TEMPLATE_TYPE_KEY:None,
#     DEPLOYMENT_TEMPLATE_TYPE_VERSION_KEY:"v1"
# }

DEPLOYMENT_TEMPLATE_ENVIRONMENTS_INFO = {
    "name":None,
    "value":None
}
DEPLOYMENT_TEMPLATE_RUN_COMMAND_INFO = {
    DEPLOYMENT_TEMPLATE_RUN_BINARY_KEY: None,
    DEPLOYMENT_TEMPLATE_RUN_SCRIPT_KEY:None,
    DEPLOYMENT_TEMPLATE_RUN_ARGUMENTS_KEY:None
}

DEPLOYMENT_JSON_TEMPLATE = {
    DEPLOYMENT_RUN_CUSTOM_V1: {
        DEPLOYMENT_TEMPLATE_KIND_INFO_KEY: {
            DEPLOYMENT_TEMPLATE_DEPLOYMENT_TYPE_KEY: DEPLOYMENT_TYPE_B,
            DEPLOYMENT_TEMPLATE_TYPE_KEY: DEPLOYMENT_RUN_CUSTOM,
            DEPLOYMENT_TEMPLATE_TYPE_VERSION_KEY:DEPLOYMENT_TEMPLATE_VERSION_1_TAIL
        },
        DEPLOYMENT_TEMPLATE_RUN_COMMAND_KEY: DEPLOYMENT_TEMPLATE_RUN_COMMAND_INFO,
        DEPLOYMENT_TEMPLATE_TRAINING_NAME_KEY: None,
        DEPLOYMENT_TEMPLATE_ENVIRONMENTS_KEY: None,
        # DEPLOYMENT_TEMPLATE_RUNCODE_KEY: None,
        DEPLOYMENT_TEMPLATE_TRAINING_ID_KEY : None
    },
    DEPLOYMENT_RUN_USERTRAINED_V1: {
        DEPLOYMENT_TEMPLATE_KIND_INFO_KEY: {
            DEPLOYMENT_TEMPLATE_DEPLOYMENT_TYPE_KEY: DEPLOYMENT_TYPE_A,
            DEPLOYMENT_TEMPLATE_TYPE_KEY: DEPLOYMENT_RUN_USERTRAINED,
            DEPLOYMENT_TEMPLATE_TYPE_VERSION_KEY: DEPLOYMENT_TEMPLATE_VERSION_1_TAIL
        },
        DEPLOYMENT_TEMPLATE_CHECKPOINT_FILE_KEY : None,
        DEPLOYMENT_TEMPLATE_CHECKPOINT_DIR_KEY : None,
        DEPLOYMENT_TEMPLATE_BUILT_IN_ID_KEY :None,
        DEPLOYMENT_TEMPLATE_BUILT_IN_NAME_KEY : None,
        DEPLOYMENT_TEMPLATE_TRAINING_NAME_KEY : None,
        DEPLOYMENT_TEMPLATE_TRAINING_TYPE_KEY : None,
        DEPLOYMENT_TEMPLATE_TRAINING_ID_KEY : None,
        DEPLOYMENT_TEMPLATE_JOB_ID_KEY : None,
        DEPLOYMENT_TEMPLATE_JOB_NAME_KEY : None,
        DEPLOYMENT_TEMPLATE_JOB_GROUP_INDEX_KEY : None,
        DEPLOYMENT_TEMPLATE_HPS_ID_KEY : None,
        DEPLOYMENT_TEMPLATE_HPS_GROUP_INDEX_KEY : None,
        DEPLOYMENT_TEMPLATE_HPS_NUMBER_KEY : None,
        DEPLOYMENT_TEMPLATE_HPS_NAME_KEY : None
    },
    DEPLOYMENT_RUN_PRETRAINED_V1: {
        DEPLOYMENT_TEMPLATE_KIND_INFO_KEY: {
            DEPLOYMENT_TEMPLATE_DEPLOYMENT_TYPE_KEY: DEPLOYMENT_TYPE_A,
            DEPLOYMENT_TEMPLATE_TYPE_KEY: DEPLOYMENT_RUN_PRETRAINED,
            DEPLOYMENT_TEMPLATE_TYPE_VERSION_KEY:DEPLOYMENT_TEMPLATE_VERSION_1_TAIL
        },
        DEPLOYMENT_TEMPLATE_BUILT_IN_NAME_KEY : None,
        DEPLOYMENT_TEMPLATE_BUILT_IN_ID_KEY :None
    },
    DEPLOYMENT_RUN_CHEKCPOINT_V1:{
        DEPLOYMENT_TEMPLATE_KIND_INFO_KEY: {
            DEPLOYMENT_TEMPLATE_DEPLOYMENT_TYPE_KEY: DEPLOYMENT_TYPE_A,
            DEPLOYMENT_TEMPLATE_TYPE_KEY: DEPLOYMENT_RUN_CHEKCPOINT,
            DEPLOYMENT_TEMPLATE_TYPE_VERSION_KEY:DEPLOYMENT_TEMPLATE_VERSION_1_TAIL
        },
        DEPLOYMENT_TEMPLATE_CHECKPOINT_FILE_KEY : None,
        DEPLOYMENT_TEMPLATE_CHECKPOINT_DIR_KEY : None,
        DEPLOYMENT_TEMPLATE_BUILT_IN_ID_KEY :None
    },
    DEPLOYMENT_RUN_SANDBOX_V1:{
        DEPLOYMENT_TEMPLATE_KIND_INFO_KEY: {
            DEPLOYMENT_TEMPLATE_DEPLOYMENT_TYPE_KEY:DEPLOYMENT_TYPE_B,
            DEPLOYMENT_TEMPLATE_TYPE_KEY:DEPLOYMENT_RUN_SANDBOX,
            DEPLOYMENT_TEMPLATE_TYPE_VERSION_KEY:DEPLOYMENT_TEMPLATE_VERSION_1_TAIL
        }
    }
}

DEPLOYMENT_TEMPLATE_DEFAULT_NAME = "new-template"
DEPLOYMENT_TEMPLATE_GROUP_DEFAULT_NAME = "new-template-group"

TRAINING_ITEM_DELETED_INFO = {
    1: "training",
    2: TRAINING_ITEM_A,
    3: TRAINING_ITEM_C
}

# BUILT_IN_MODEL
INFO_JSON_EXTENSION='builtinjson'

# INGRESS
INGRESS_PATH_ANNOTAION="(/|$)(.*)"
INGRESS_REWRITE_DEFAULT="/$2"

# PORT FORWARDING 
# https://kubernetes.io/docs/concepts/services-networking/service/#protocol-support
# HTTP = LoadBalancer Only
# SCTP = > 1.20v  
PORT_PROTOCOL_LIST = ["TCP", "UDP"] # 

# POD RESOURCE KEY # TODO 하드코딩 되어 있는 부분 아래 변수로 통일 필요 (2022-09-20)
# CPU / RAM - deployment_api_deco, history.py 에도 쓰임
CPU_USAGE_ON_NODE_KEY = "cpu_usage_on_node" # POD 내에서 NODE의 몇%인지 
CPU_USAGE_ON_POD_KEY = "cpu_usage_on_pod" # POD 내에서 몇 %인지
CPU_CORES_ON_POD_KEY = "cpu_cores_on_pod" # POD 내에서 코어 몇개 할당인지 
MEM_USAGE_KEY = "mem_usage"  # 사용량 절대값
MEM_LIMIT_KEY = "mem_limit"  # 사용 가능 크기
MEM_USAGE_PER_KEY = "mem_usage_per" # 사용량 비율

MEM_USAGE_PER_ON_NODE_KEY = "mem_usage_per_on_node" # TODO Pod 내에서 Node 기준에서의 사용량 percent를 기록할지 말지 ? (2022-10-19 Yeobie)

# GPU
GPU_UTIL_KEY = "util_gpu"
GPU_MEM_UTIL_KEY = "util_memory"
GPU_MEM_FREE_KEY = "memory_free"
GPU_MEM_USED_KEY = "memory_used"
GPU_MEM_TOTAL_KEY = "memory_total"

# TIME
TIMESTAMP_KEY= "timestamp"
POD_RUN_TIME_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"
LOG_DELETE_DOWNLOAD_DATE_FORMAT = "%Y-%m-%d"
POD_RUN_TIME_START_TIME_KEY = "start_time"
POD_RUN_TIME_END_TIME_KEY = "end_time"
POD_RESOURCE_DEFAULT = { 
    CPU_USAGE_ON_NODE_KEY: 0, 
    CPU_USAGE_ON_POD_KEY: 0, 
    MEM_USAGE_KEY: 0, 
    MEM_LIMIT_KEY: 0, 
    MEM_USAGE_PER_KEY: 0,
    TIMESTAMP_KEY: 0
}

# NETWORK
NETWORK_TRANSMITTER_KEY="tx_bytes" # 송신량
NETWORK_RECEIVER_KEY="rx_bytes" # 수신량


# NGINX LOG KEY
NGINX_LOG_TIME_LOCAL_KEY = "time_local"
NGINX_LOG_STATUS_KEY = "status"
NGINX_LOG_REQUEST_TIME_KEY = "request_time"


# Unit
MEMORY_DEFAULT_UNIT = "Gi" # TODO G 단위를 유지할것인지 바이트 단위로 갈것인지 ?  (DB는 현재 GB 단위로 기록, kube 사용량 정보는 상황에 따라 다양한 값이 나옴)
CPU_CORES_DEFAULT_UNIT = "" # CPU 값을 정말 작게 주면 100m 과 같은 경우가 발생 가능
STORAGE_DEFAULT_UNIT = "Gi"


# Filebrowser Ingress 사용여부
FILEBROWSER_INGRESS_USE = False

# Filebrowser image 
FILEBROWSER_IMAGE = "jf_training_tool_filebrowser:latest"