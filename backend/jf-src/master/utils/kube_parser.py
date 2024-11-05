import os
import sys
import json
import traceback
import utils.common as common
sys.path.insert(0, os.path.abspath('..'))
from TYPE import *
# ======================================================================================================
# list_@@@ 으로 부터 가져 온 값 중 일부 정보 파싱용
# 여기 함수의 input은 모두 coreV1Api or extensV1Api .list_@@@@@().items 의 item

## common
def parsing_item_labels(item):
    # node_label
    # nvidia.com/cuda.driver.major=450
    # nvidia.com/cuda.driver.minor=80
    # nvidia.com/cuda.driver.rev=02
    # nvidia.com/cuda.runtime.major=11
    # nvidia.com/cuda.runtime.minor=0
    # nvidia.com/gfd.timestamp=1621476452
    # nvidia.com/gpu.compute.major=8
    # nvidia.com/gpu.compute.minor=0
    # nvidia.com/gpu.count=2
    # nvidia.com/gpu.family=ampere
    # nvidia.com/gpu.machine=ESC4000A-E10
    # nvidia.com/gpu.memory=40537
    # nvidia.com/gpu.product=A100-PCIE-40GB
    # nvidia.com/mig-1g.5gb.count=4
    # nvidia.com/mig-1g.5gb.engines.copy=1
    # nvidia.com/mig-1g.5gb.engines.decoder=0
    # nvidia.com/mig-1g.5gb.engines.encoder=0
    # nvidia.com/mig-1g.5gb.engines.jpeg=0
    # nvidia.com/mig-1g.5gb.engines.ofa=0
    # nvidia.com/mig-1g.5gb.memory=4864
    # nvidia.com/mig-1g.5gb.multiprocessors=14
    # nvidia.com/mig-1g.5gb.slices.ci=1
    # nvidia.com/mig-1g.5gb.slices.gi=1
    # nvidia.com/mig-2g.10gb.count=2
    # nvidia.com/mig-2g.10gb.engines.copy=2
    # nvidia.com/mig-2g.10gb.engines.decoder=1
    # nvidia.com/mig-2g.10gb.engines.encoder=0
    # nvidia.com/mig-2g.10gb.engines.jpeg=0
    # nvidia.com/mig-2g.10gb.engines.ofa=0
    # nvidia.com/mig-2g.10gb.memory=9984
    # nvidia.com/mig-2g.10gb.multiprocessors=28
    # nvidia.com/mig-2g.10gb.slices.ci=2
    # nvidia.com/mig-2g.10gb.slices.gi=2
    if type(item) == type(dict()):
        return item["metadata"].get("labels")
    else :
        return item.metadata.labels

def parsing_item_name(item):
    if type(item) == type(dict()):
        return item["metadata"].get("name")
    else:
        return item.metadata.name

## resource_dict - node.status.allocatable, container.resources.limits ..
def get_mig_resource_key(resource_dict):
    return [ key for key in resource_dict.keys() if NVIDIA_MIG_GPU_RESOURCE_LABEL_KEY.format(mig_key=NVIDIA_GPU_MIG_BASE_FLAG) in key ]

def parsing_general_gpu_count(resource_dict):
    if NVIDIA_GPU_RESOURCE_LABEL_KEY in resource_dict:
        return int(resource_dict[NVIDIA_GPU_RESOURCE_LABEL_KEY])
    return 0

def parsing_mig_gpu_count(resource_dict):
    mig_count = 0
    mig_detail = {}

    for mig_key in get_mig_resource_key(resource_dict):
        if resource_dict.get(mig_key) is not None:
            mig_count += int(resource_dict.get(mig_key))
            mig_detail[mig_key] = resource_dict.get(mig_key)

    return mig_count, mig_detail

def parsing_all_gpu_count(resource_dict):
    general_count = parsing_general_gpu_count(resource_dict)
    mig_count, _ = parsing_mig_gpu_count(resource_dict)
    return general_count + mig_count


def parsing_other_resource(resource_dict):
    # cpu (9900m == 9.9)
    # memory
    cpu = parsing_resource_cpu(resource_dict)
    memory = parsing_resource_memory(resource_dict)

    other_resource = {
        "cpu" : cpu,
        "memory": memory
    }
    
    return other_resource

def parsing_resource_cpu(resource_dict):
    cpu = resource_dict.get("cpu")
    common.convert_unit_num(value=cpu, target_unit="", return_num=True)
    # if cpu is not None and cpu[-1] == "m":
    #     cpu = float(int(cpu[:-1]) / 1000)
    return cpu

def parsing_resource_memory(resource_dict):
    memory = resource_dict.get("memory")

    return memory

## NODE
def node_item_ex():
    """
    {'api_version': None,
    'kind': None,
    'metadata': {'annotations': {'kubeadm.alpha.kubernetes.io/cri-socket': '/var/run/dockershim.sock',
                                'node.alpha.kubernetes.io/ttl': '0',
                                'volumes.kubernetes.io/controller-managed-attach-detach': 'true'},
                'cluster_name': None,
                'creation_timestamp': datetime.datetime(2021, 5, 11, 11, 5, 58, tzinfo=tzlocal()),
                'deletion_grace_period_seconds': None,
                'deletion_timestamp': None,
                'finalizers': None,
                'generate_name': None,
                'generation': None,
                'initializers': None,
                'labels': {'beta.kubernetes.io/arch': 'amd64',
                            'beta.kubernetes.io/os': 'linux',
                            'gpu_model': 'A100-PCIE-40GB',
                            'kubernetes.io/arch': 'amd64',
                            'kubernetes.io/hostname': 'jf-server-01',
                            'kubernetes.io/os': 'linux',
                            'node-role.kubernetes.io/master': ''},
                'managed_fields': None,
                'name': 'jf-server-01',
                'namespace': None,
                'owner_references': None,
                'resource_version': '332895',
                'self_link': '/api/v1/nodes/jf-server-01',
                'uid': '31daa197-a79f-4d1c-997b-1fdb5e5fcb2d'},
    'spec': {'config_source': None,
            'external_id': None,
            'pod_cidr': None,
            'provider_id': None,
            'taints': None,
            'unschedulable': None},
    'status': {'addresses': [{'address': '115.71.28.77', 'type': 'InternalIP'},
                            {'address': 'jf-server-01', 'type': 'Hostname'}],
                'allocatable': {'cpu': '48',
                                'ephemeral-storage': '379513913535',
                                'hugepages-1Gi': '0',
                                'hugepages-2Mi': '0',
                                'memory': '131849936Ki',
                                'nvidia.com/gpu': '1',
                                'nvidia.com/mig-1g.5gb': '2',
                                'nvidia.com/mig-2g.10gb': '1',
                                'pods': '110'},
                'capacity': {'cpu': '48',
                            'ephemeral-storage': '411798952Ki',
                            'hugepages-1Gi': '0',
                            'hugepages-2Mi': '0',
                            'memory': '131952336Ki',
                            'nvidia.com/gpu': '1',
                            'nvidia.com/mig-1g.5gb': '2',
                            'nvidia.com/mig-2g.10gb': '1',
                            'pods': '110'},
                'conditions': [{'last_heartbeat_time': datetime.datetime(2021, 5, 11, 11, 7, 24, tzinfo=tzlocal()),
                                'last_transition_time': datetime.datetime(2021, 5, 11, 11, 7, 24, tzinfo=tzlocal()),
                                'message': 'Weave pod has set this',
                                'reason': 'WeaveIsUp',
                                'status': 'False',
                                'type': 'NetworkUnavailable'},
                            {'last_heartbeat_time': datetime.datetime(2021, 5, 13, 1, 53, 48, tzinfo=tzlocal()),
                                'last_transition_time': datetime.datetime(2021, 5, 11, 11, 5, 54, tzinfo=tzlocal()),
                                'message': 'kubelet has sufficient memory '
                                        'available',
                                'reason': 'KubeletHasSufficientMemory',
                                'status': 'False',
                                'type': 'MemoryPressure'},
                            {'last_heartbeat_time': datetime.datetime(2021, 5, 13, 1, 53, 48, tzinfo=tzlocal()),
                                'last_transition_time': datetime.datetime(2021, 5, 11, 11, 5, 54, tzinfo=tzlocal()),
                                'message': 'kubelet has no disk pressure',
                                'reason': 'KubeletHasNoDiskPressure',
                                'status': 'False',
                                'type': 'DiskPressure'},
                            {'last_heartbeat_time': datetime.datetime(2021, 5, 13, 1, 53, 48, tzinfo=tzlocal()),
                                'last_transition_time': datetime.datetime(2021, 5, 11, 11, 5, 54, tzinfo=tzlocal()),
                                'message': 'kubelet has sufficient PID available',
                                'reason': 'KubeletHasSufficientPID',
                                'status': 'False',
                                'type': 'PIDPressure'},
                            {'last_heartbeat_time': datetime.datetime(2021, 5, 13, 1, 53, 48, tzinfo=tzlocal()),
                                'last_transition_time': datetime.datetime(2021, 5, 11, 11, 7, 34, tzinfo=tzlocal()),
                                'message': 'kubelet is posting ready status. '
                                        'AppArmor enabled',
                                'reason': 'KubeletReady',
                                'status': 'True',
                                'type': 'Ready'}],
                'config': None,
                'daemon_endpoints': {'kubelet_endpoint': {'port': 10250}},
                'images': [{'names': ['selftf2:latest'], 'size_bytes': 18436830061},
                        {'names': ['nvcr-custom1:latest'],
                            'size_bytes': 17668753414},
                        {'names': ['ibtest:latest'], 'size_bytes': 15309396321},
                        {'names': ['jf_api_image:latest', 'jf_default:latest'],
                            'size_bytes': 15157643267},
                        {'names': ['<none>@<none>', '<none>:<none>'],
                            'size_bytes': 11355884925},
                        {'names': ['nvcr.io/nvidia/tensorflow@sha256:114835e13205bbd0c20ec86a10c76c1ff2b44b3908ae8c43c1bf1a6632ee8446',
                                    'nvcr.io/nvidia/tensorflow:20.06-tf2-py3'],
                            'size_bytes': 9445699839},
                        {'names': ['nvidia/cuda@sha256:ed1d87f0bb4db92f1304c8939f727e961e480101983e902f230f54cb7bdc536b',
                                    'nvidia/cuda:9.0-devel-ubuntu16.04'],
                            'size_bytes': 1821232064},
                        {'names': ['<none>@<none>', '<none>:<none>'],
                            'size_bytes': 836727955},
                        {'names': ['mariadb@sha256:ab7c906b288cbf1bf5da2302492233e0ca0b93a4a88867849dc0513110ca01c1',
                                    'mariadb:latest'],
                            'size_bytes': 401011539},
                        {'names': ['quay.io/kubernetes-ingress-controller/nginx-ingress-controller@sha256:603a8f4d4c88e83c58d07d20de03a15ed1892bf261d699b3f85ffd892b01bba0',
                                    'quay.io/kubernetes-ingress-controller/nginx-ingress-controller:0.29.0'],
                            'size_bytes': 305608884},
                        {'names': ['golang@sha256:eb55ed65c7b5b3862b2c0156e49a07d48e2089b4ed8f9585fe10391ede4fb659',
                                    'golang:alpine'],
                            'size_bytes': 301382006},
                        {'names': ['k8s.gcr.io/etcd@sha256:4afb99b4690b418ffc2ceb67e1a17376457e441c1f09ab55447f0aaf992fa646',
                                    'k8s.gcr.io/etcd:3.4.3-0'],
                            'size_bytes': 288426917},
                        {'names': ['nvcr.io/nvidia/gpu-feature-discovery@sha256:bfc39d23568458dfd50c0c5323b6d42bdcd038c420fb2a2becd513a3ed3be27f',
                                    'nvcr.io/nvidia/gpu-feature-discovery:v0.4.1'],
                            'size_bytes': 251896911},
                        {'names': ['nvcr.io/nvidia/k8s-device-plugin@sha256:964847cc3fd85ead286be1d74d961f53d638cd4875af51166178b17bba90192f',
                                    'nvcr.io/nvidia/k8s-device-plugin:v0.9.0'],
                            'size_bytes': 190742862},
                        {'names': ['k8s.gcr.io/kube-apiserver@sha256:71344dfb6a804ff6b2c8bf5f72b1f7941ddee1fbff7369836339a79387aa071a',
                                    'k8s.gcr.io/kube-apiserver:v1.17.17'],
                            'size_bytes': 171006333},
                        {'names': ['k8s.gcr.io/kube-controller-manager@sha256:9dbe964b3a0d8a4a70b2e16bddb8caf51d7a96d5bf43981ce988909a5f2bf4df',
                                    'k8s.gcr.io/kube-controller-manager:v1.17.17'],
                            'size_bytes': 160917885},
                        {'names': ['k8s.gcr.io/kube-proxy@sha256:0129daab4e24ce16a1f07bda844a4483dbddb040f38b678361bf1042f2aaf2b8',
                                    'k8s.gcr.io/kube-proxy:v1.17.17'],
                            'size_bytes': 116642093},
                        {'names': ['weaveworks/weave-kube@sha256:e4a3a5b9bf605a7ff5ad5473c7493d7e30cbd1ed14c9c2630a4e409b4dbfab1c',
                                    'weaveworks/weave-kube:2.6.0'],
                            'size_bytes': 114348932},
                        {'names': ['k8s.gcr.io/kube-scheduler@sha256:1662f271dd9a3d22969728eae30f9d182d74c9c717e4d75673dc94c274ebada5',
                                    'k8s.gcr.io/kube-scheduler:v1.17.17'],
                            'size_bytes': 94402941},
                        {'names': ['quay.io/kubernetes_incubator/node-feature-discovery@sha256:a1e72dbc35a16cbdcf0007fc4fb207bce723ff67c61853d2d8d8051558ce6de7',
                                    'quay.io/kubernetes_incubator/node-feature-discovery:v0.6.0'],
                            'size_bytes': 93929279},
                        {'names': ['k8s.gcr.io/coredns@sha256:7ec975f167d815311a7136c32e70735f0d00b73781365df1befd46ed35bd4fe7',
                                    'k8s.gcr.io/coredns:1.6.5'],
                            'size_bytes': 41578211},
                        {'names': ['weaveworks/weave-npc@sha256:985de9ff201677a85ce78703c515466fe45c9c73da6ee21821e89d902c21daf8',
                                    'weaveworks/weave-npc:2.6.0'],
                            'size_bytes': 34949961},
                        {'names': ['smd:latest'], 'size_bytes': 17403501},
                        {'names': ['registry.gitlab.com/arm-research/smarter/smarter-device-manager@sha256:f4ac9fce62134ea3768e4206793561fb98cae2f7b256859a3c2e77371c98d7e7',
                                    'registry.gitlab.com/arm-research/smarter/smarter-device-manager:v1.1.2'],
                            'size_bytes': 16524974},
                        {'names': ['alpine@sha256:69e70a79f2d41ab5d637de98c1e0b055206ba40a8145e7bddb55ccc04e13cf8f',
                                    'alpine:latest'],
                            'size_bytes': 5613158},
                        {'names': ['k8s.gcr.io/pause@sha256:f78411e19d84a252e53bff71a4407a5686c46983a2c2eeed83929b888179acea',
                                    'k8s.gcr.io/pause:3.1'],
                            'size_bytes': 742472}],
                'node_info': {'architecture': 'amd64',
                            'boot_id': '350fec6b-50ae-4ad8-a549-523087d63403',
                            'container_runtime_version': 'docker://19.3.8',
                            'kernel_version': '4.15.0-141-generic',
                            'kube_proxy_version': 'v1.17.4',
                            'kubelet_version': 'v1.17.4',
                            'machine_id': '7e6300736bf14ad198399b19c59b1b7f',
                            'operating_system': 'linux',
                            'os_image': 'Ubuntu 18.04.5 LTS',
                            'system_uuid': '85012609-AA4E-461A-F508-D45D64BD9DC2'},
                'phase': None,
                'volumes_attached': None,
                'volumes_in_use': None}}
    """
    pass

def parsing_node_condition(node):
    # [{'last_heartbeat_time': datetime.datetime(2021, 5, 24, 10, 3, tzinfo=tzlocal()),
    # 'last_transition_time': datetime.datetime(2021, 5, 24, 10, 3, tzinfo=tzlocal()),
    # 'message': 'Weave pod has set this',
    # 'reason': 'WeaveIsUp',
    # 'status': 'False',
    # 'type': 'NetworkUnavailable'},
    # {'last_heartbeat_time': datetime.datetime(2021, 5, 25, 2, 42, 28, tzinfo=tzlocal()),
    # 'last_transition_time': datetime.datetime(2021, 5, 11, 11, 5, 54, tzinfo=tzlocal()),
    # 'message': 'kubelet has sufficient '
    #             'memory available',
    # 'reason': 'KubeletHasSufficientMemory',
    # 'status': 'False',
    # 'type': 'MemoryPressure'},
    # {'last_heartbeat_time': datetime.datetime(2021, 5, 25, 2, 42, 28, tzinfo=tzlocal()),
    # 'last_transition_time': datetime.datetime(2021, 5, 11, 11, 5, 54, tzinfo=tzlocal()),
    # 'message': 'kubelet has no disk '
    #             'pressure',
    # 'reason': 'KubeletHasNoDiskPressure',
    # 'status': 'False',
    # 'type': 'DiskPressure'},
    # {'last_heartbeat_time': datetime.datetime(2021, 5, 25, 2, 42, 28, tzinfo=tzlocal()),
    # 'last_transition_time': datetime.datetime(2021, 5, 11, 11, 5, 54, tzinfo=tzlocal()),
    # 'message': 'kubelet has sufficient PID '
    #             'available',
    # 'reason': 'KubeletHasSufficientPID',
    # 'status': 'False',
    # 'type': 'PIDPressure'},
    # {'last_heartbeat_time': datetime.datetime(2021, 5, 25, 2, 42, 28, tzinfo=tzlocal()),
    # 'last_transition_time': datetime.datetime(2021, 5, 20, 1, 49, 48, tzinfo=tzlocal()),
    # 'message': 'kubelet is posting ready '
    #             'status. AppArmor enabled',
    # 'reason': 'KubeletReady',
    # 'status': 'True',
    # 'type': 'Ready'}]
    for cond in node.status.conditions:
        if cond.type == 'Ready':
            return cond
    return None

def parsing_node_ip(node):
    node_ip = None
    for address in node.status.addresses:
        if address.type == "InternalIP":
            node_ip = address.address
    return node_ip

def parsing_hostname(node):
    hostname = None
    for address in node.status.addresses:
        if address.type == "Hostname":
            hostname = address.address
    return hostname

def parsing_node_ip_and_hostname(node):
    # from --> 
    # for node in get_list_node().items
    node_ip = parsing_node_ip(node)
    hostname = parsing_hostname(node)

    return node_ip, hostname

def parsing_node_resource(node):
    # return node.status.capacity
    # capacity로 하면 mig 쓰다가 (kube 종료 없이) mig 안쓰거나, device plugin 정책을 mixed->single로 바꾸면 
    # Capacity는 전 값을 일정기간 유지하는 문제 
    # Capacity:
    #   cpu:                     48
    #   ephemeral-storage:       411798952Ki
    #   hugepages-1Gi:           0
    #   hugepages-2Mi:           0
    #   memory:                  131952420Ki
    #   nvidia.com/gpu:          6
    #   nvidia.com/mig-1g.5gb:   0
    #   nvidia.com/mig-2g.10gb:  6
    #   nvidia.com/mig-3g.20gb:  0
    #   pods:                    110
    # Allocatable:
    #   cpu:                     48
    #   ephemeral-storage:       379513913535
    #   hugepages-1Gi:           0
    #   hugepages-2Mi:           0
    #   memory:                  131850020Ki
    #   nvidia.com/gpu:          6
    #   nvidia.com/mig-1g.5gb:   0
    #   nvidia.com/mig-2g.10gb:  0
    #   nvidia.com/mig-3g.20gb:  0
    #   pods:                    110


    return node.status.allocatable

def parsing_node_gpu_resource(node):
    resource_dict = parsing_node_resource(node)

    general_gpu = parsing_general_gpu_count(resource_dict)
    mig_gpu, mig_detail = parsing_mig_gpu_count(resource_dict)

    return  {
        "general_gpu": general_gpu,
        "mig_gpu": mig_gpu,
        "mig_detail": mig_detail,
    }

def parsing_node_ib_resource(node):
    resource_dict = parsing_node_resource(node)
    if resource_dict.get(IB_RESOURCE_LABEL_KEY) is not None:
        return int(resource_dict.get(IB_RESOURCE_LABEL_KEY))
    else :
        return None

def parsing_node_other_resource(node):
    # CPU, RAM
    resource_dict = parsing_node_resource(node)
    other_resource = parsing_other_resource(resource_dict)
    return other_resource


def parsing_node_list(node_list):
    # node_list.items -> node_list []
    new_node_list = []
    for node in node_list.items:
        new_node_list.append(node)
    
    return new_node_list

def parsing_node_gpu_worker_list(node_list):
    new_node_list = []
    for node in node_list.items:
        if parsing_item_labels(node).get(GPU_WORKER_NODE_LABEL_KEY) != 'True':
            # print("NO GPU WORKER")
            continue
        new_node_list.append(node)

    return new_node_list

def parsing_node_cpu_worker_list(node_list):
    new_node_list = []
    for node in node_list.items:
        if parsing_item_labels(node).get(CPU_WORKER_NODE_LABEL_KEY) != 'True':
            # print("NO CPU WORKER")
            continue
        new_node_list.append(node)

    return new_node_list

def parsing_node_gpu_model(node):
    """
        Description : Node 정보 기준으로 GPU Model 조회. 없으면 모델명을 No-GPU로 내려줌
    """
    gpu_model = None
    labels = parsing_item_labels(node)
    if labels.get(GFD_GPU_MODEL_LABEL_KEY):
        gpu_model = labels.get(GFD_GPU_MODEL_LABEL_KEY)
    else :
        gpu_model = labels.get(GPU_MODEL_LABEL_KEY)
    
    if gpu_model is None:
        gpu_model = "No-GPU"

    return gpu_model

def parsing_node_gpu_memory(node):
    gpu_memory = None
    labels = parsing_item_labels(node)
    if labels.get(GFD_GPU_MEMORY_LABEL_KEY):
        gpu_memory = labels.get(GFD_GPU_MEMORY_LABEL_KEY)
    else :
        gpu_memory = labels.get(GPU_MEMORY_LABEL_KEY)
    return gpu_memory

def parsing_node_gpu_model_defail_info(node):
    labels = parsing_item_labels(node)
    info = {
        "cuda_cores": labels.get(GPU_CUDA_LABEL_KEY),
        "computer_capability": labels.get(GPU_COMPUTER_CAPABILITY_LABEL_KEY),
        "architecture": labels.get(GPU_ARCHITECTURE_LABEL_KEY)
    }
    return info

def parsing_node_is_ready(node):
    #TODO 
    # "status": 'True' | 'Unknwon'
    condition = parsing_node_condition(node)
    if condition.status == 'True':
        return True
    else :
        return False


## POD
def pod_item_ex():
    pass
    """
    {'api_version': 'v1',
    'items': [{'api_version': None,
            'kind': None,
            'metadata': {'annotations': None,
                         'cluster_name': None,
                         'creation_timestamp': datetime.datetime(2021, 5, 11, 11, 37, 16, tzinfo=tzlocal()),
                         'deletion_grace_period_seconds': None,
                         'deletion_timestamp': None,
                         'finalizers': None,
                         'generate_name': None,
                         'generation': None,
                         'initializers': None,
                         'labels': {'editor': 'False',
                                    'executor_id': '2',
                                    'executor_name': 'yeobie',
                                    'jupyter_id': '86',
                                    'pod_name': 'h6bdb418eeedbe2798071d76abc14f754',
                                    'training_group': 'h6bdb418eeedbe2798071d76abc14f754',
                                    'training_id': '43',
                                    'training_name': 'j-lab-test',
                                    'training_total_gpu': '1',
                                    'training_type': 'jupyter',
                                    'user': 'yeobie',
                                    'work_func_type': 'jupyter',
                                    'work_type': 'training',
                                    'workspace_id': '1',
                                    'workspace_name': 'robert-ws'},
                         'managed_fields': None,
                         'name': 'h6bdb418eeedbe2798071d76abc14f754',
                         'namespace': 'default',
                         'owner_references': None,
                         'resource_version': '5274',
                         'self_link': '/api/v1/namespaces/default/pods/h6bdb418eeedbe2798071d76abc14f754',
                         'uid': 'bee2838a-738c-4a60-984e-2c238fb7a674'},
            'spec': {'active_deadline_seconds': None,
                     'affinity': None,
                     'automount_service_account_token': None,
                     'containers': [{'args': None,
                                     'command': ['/bin/bash',
                                                 '-c'],
                                     'env': None,
                                     'env_from': None,
                                     'image': 'jf_default:latest',
                                     'image_pull_policy': 'IfNotPresent',
                                     'lifecycle': {'post_start': {'_exec': {'command': ['/bin/sh',
                                                                                        '-c']},
                                                                  'http_get': None,
                                                                  'tcp_socket': None},
                                                   'pre_stop': None},
                                     'liveness_probe': None,
                                     'name': 'h6bdb418eeedbe2798071d76abc14f754',
                                     'ports': None,
                                     'readiness_probe': None,
                                     'resources': {'limits': {'nvidia.com/gpu': '1'},
                                                   'requests': {'nvidia.com/gpu': '1'}},
                                     'security_context': None,
                                     'stdin': None,
                                     'stdin_once': None,
                                     'termination_message_path': '/dev/termination-log',
                                     'termination_message_policy': 'File',
                                     'tty': None,
                                     'volume_devices': None,
                                     'volume_mounts': [{'mount_path': '/home/yeobie/src',
                                                        'mount_propagation': None,
                                                        'name': 'src',
                                                        'read_only': None,
                                                        'sub_path': None,
                                                        'sub_path_expr': None},
                                                       {'mount_path': '/etc_host/',
                                                        'mount_propagation': None,
                                                        'name': 'userinfo',
                                                        'read_only': None,
                                                        'sub_path': None,
                                                        'sub_path_expr': None},
                                                       {'mount_path': '/bin/sshset.sh',
                                                        'mount_propagation': None,
                                                        'name': 'ssh-root-set-volume',
                                                        'read_only': True,
                                                        'sub_path': 'sshset.sh',
                                                        'sub_path_expr': None},
                                                       {'mount_path': '/bin/etc_sync.sh',
                                                        'mount_propagation': None,
                                                        'name': 'etc-sync-volume',
                                                        'read_only': True,
                                                        'sub_path': 'etc_sync.sh',
                                                        'sub_path_expr': None},
                                                       {'mount_path': '/home/yeobie/datasets_ro',
                                                        'mount_propagation': None,
                                                        'name': 'ws-datasets-ro',
                                                        'read_only': True,
                                                        'sub_path': None,
                                                        'sub_path_expr': None},
                                                       {'mount_path': '/home/yeobie/datasets_rw',
                                                        'mount_propagation': None,
                                                        'name': 'ws-datasets-rw',
                                                        'read_only': None,
                                                        'sub_path': None,
                                                        'sub_path_expr': None},
                                                       {'mount_path': '/job-checkpoints',
                                                        'mount_propagation': None,
                                                        'name': 'job-checkpoints',
                                                        'read_only': None,
                                                        'sub_path': None,
                                                        'sub_path_expr': None},
                                                       {'mount_path': '/var/run/secrets/kubernetes.io/serviceaccount',
                                                        'mount_propagation': None,
                                                        'name': 'default-token-v9jmq',
                                                        'read_only': True,
                                                        'sub_path': None,
                                                        'sub_path_expr': None}],
                                     'working_dir': None}],
                     'dns_config': None,
                     'dns_policy': 'ClusterFirst',
                     'enable_service_links': True,
                     'host_aliases': None,
                     'host_ipc': None,
                     'host_network': None,
                     'host_pid': None,
                     'hostname': None,
                     'image_pull_secrets': None,
                     'init_containers': None,
                     'node_name': 'jf-server-01',
                     'node_selector': None,
                     'preemption_policy': None,
                     'priority': 0,
                     'priority_class_name': None,
                     'readiness_gates': None,
                     'restart_policy': 'Always',
                     'runtime_class_name': None,
                     'scheduler_name': 'default-scheduler',
                     'security_context': {'fs_group': None,
                                          'run_as_group': None,
                                          'run_as_non_root': None,
                                          'run_as_user': None,
                                          'se_linux_options': None,
                                          'supplemental_groups': None,
                                          'sysctls': None,
                                          'windows_options': None},
                     'service_account': 'default',
                     'service_account_name': 'default',
                     'share_process_namespace': None,
                     'subdomain': None,
                     'termination_grace_period_seconds': 0,
                     'tolerations': [{'effect': 'NoExecute',
                                      'key': 'node.kubernetes.io/not-ready',
                                      'operator': 'Exists',
                                      'toleration_seconds': 300,
                                      'value': None},
                                     {'effect': 'NoExecute',
                                      'key': 'node.kubernetes.io/unreachable',
                                      'operator': 'Exists',
                                      'toleration_seconds': 300,
                                      'value': None}],
                     'volumes': [{'aws_elastic_block_store': None,
                                  'azure_disk': None,
                                  'azure_file': None,
                                  'cephfs': None,
                                  'cinder': None,
                                  'config_map': None,
                                  'csi': None,
                                  'downward_api': None,
                                  'empty_dir': None,
                                  'fc': None,
                                  'flex_volume': None,
                                  'flocker': None,
                                  'gce_persistent_disk': None,
                                  'git_repo': None,
                                  'glusterfs': None,
                                  'host_path': {'path': '/jfbcore/jf-data/workspaces/robert-ws/trainings/j-lab-test/src',
                                                'type': 'DirectoryOrCreate'},
                                  'iscsi': None,
                                  'name': 'src',
                                  'nfs': None,
                                  'persistent_volume_claim': None,
                                  'photon_persistent_disk': None,
                                  'portworx_volume': None,
                                  'projected': None,
                                  'quobyte': None,
                                  'rbd': None,
                                  'scale_io': None,
                                  'secret': None,
                                  'storageos': None,
                                  'vsphere_volume': None},
                                 {'aws_elastic_block_store': None,
                                  'azure_disk': None,
                                  'azure_file': None,
                                  'cephfs': None,
                                  'cinder': None,
                                  'config_map': None,
                                  'csi': None,
                                  'downward_api': None,
                                  'empty_dir': None,
                                  'fc': None,
                                  'flex_volume': None,
                                  'flocker': None,
                                  'gce_persistent_disk': None,
                                  'git_repo': None,
                                  'glusterfs': None,
                                  'host_path': {'path': '/jfbcore/jf-data/etc_host/robert-ws/j-lab-test',
                                                'type': 'DirectoryOrCreate'},
                                  'iscsi': None,
                                  'name': 'userinfo',
                                  'nfs': None,
                                  'persistent_volume_claim': None,
                                  'photon_persistent_disk': None,
                                  'portworx_volume': None,
                                  'projected': None,
                                  'quobyte': None,
                                  'rbd': None,
                                  'scale_io': None,
                                  'secret': None,
                                  'storageos': None,
                                  'vsphere_volume': None},
                                 {'aws_elastic_block_store': None,
                                  'azure_disk': None,
                                  'azure_file': None,
                                  'cephfs': None,
                                  'cinder': None,
                                  'config_map': {'default_mode': 511,
                                                 'items': None,
                                                 'name': 'ssh-root-set',
                                                 'optional': None},
                                  'csi': None,
                                  'downward_api': None,
                                  'empty_dir': None,
                                  'fc': None,
                                  'flex_volume': None,
                                  'flocker': None,
                                  'gce_persistent_disk': None,
                                  'git_repo': None,
                                  'glusterfs': None,
                                  'host_path': None,
                                  'iscsi': None,
                                  'name': 'ssh-root-set-volume',
                                  'nfs': None,
                                  'persistent_volume_claim': None,
                                  'photon_persistent_disk': None,
                                  'portworx_volume': None,
                                  'projected': None,
                                  'quobyte': None,
                                  'rbd': None,
                                  'scale_io': None,
                                  'secret': None,
                                  'storageos': None,
                                  'vsphere_volume': None},
                                 {'aws_elastic_block_store': None,
                                  'azure_disk': None,
                                  'azure_file': None,
                                  'cephfs': None,
                                  'cinder': None,
                                  'config_map': {'default_mode': 511,
                                                 'items': None,
                                                 'name': 'etc-sync',
                                                 'optional': None},
                                  'csi': None,
                                  'downward_api': None,
                                  'empty_dir': None,
                                  'fc': None,
                                  'flex_volume': None,
                                  'flocker': None,
                                  'gce_persistent_disk': None,
                                  'git_repo': None,
                                  'glusterfs': None,
                                  'host_path': None,
                                  'iscsi': None,
                                  'name': 'etc-sync-volume',
                                  'nfs': None,
                                  'persistent_volume_claim': None,
                                  'photon_persistent_disk': None,
                                  'portworx_volume': None,
                                  'projected': None,
                                  'quobyte': None,
                                  'rbd': None,
                                  'scale_io': None,
                                  'secret': None,
                                  'storageos': None,
                                  'vsphere_volume': None},
                                 {'aws_elastic_block_store': None,
                                  'azure_disk': None,
                                  'azure_file': None,
                                  'cephfs': None,
                                  'cinder': None,
                                  'config_map': None,
                                  'csi': None,
                                  'downward_api': None,
                                  'empty_dir': None,
                                  'fc': None,
                                  'flex_volume': None,
                                  'flocker': None,
                                  'gce_persistent_disk': None,
                                  'git_repo': None,
                                  'glusterfs': None,
                                  'host_path': {'path': '/jfbcore/jf-data/workspaces/robert-ws/datasets/0',
                                                'type': 'DirectoryOrCreate'},
                                  'iscsi': None,
                                  'name': 'ws-datasets-ro',
                                  'nfs': None,
                                  'persistent_volume_claim': None,
                                  'photon_persistent_disk': None,
                                  'portworx_volume': None,
                                  'projected': None,
                                  'quobyte': None,
                                  'rbd': None,
                                  'scale_io': None,
                                  'secret': None,
                                  'storageos': None,
                                  'vsphere_volume': None},
                                 {'aws_elastic_block_store': None,
                                  'azure_disk': None,
                                  'azure_file': None,
                                  'cephfs': None,
                                  'cinder': None,
                                  'config_map': None,
                                  'csi': None,
                                  'downward_api': None,
                                  'empty_dir': None,
                                  'fc': None,
                                  'flex_volume': None,
                                  'flocker': None,
                                  'gce_persistent_disk': None,
                                  'git_repo': None,
                                  'glusterfs': None,
                                  'host_path': {'path': '/jfbcore/jf-data/workspaces/robert-ws/datasets/1',
                                                'type': 'DirectoryOrCreate'},
                                  'iscsi': None,
                                  'name': 'ws-datasets-rw',
                                  'nfs': None,
                                  'persistent_volume_claim': None,
                                  'photon_persistent_disk': None,
                                  'portworx_volume': None,
                                  'projected': None,
                                  'quobyte': None,
                                  'rbd': None,
                                  'scale_io': None,
                                  'secret': None,
                                  'storageos': None,
                                  'vsphere_volume': None},
                                 {'aws_elastic_block_store': None,
                                  'azure_disk': None,
                                  'azure_file': None,
                                  'cephfs': None,
                                  'cinder': None,
                                  'config_map': None,
                                  'csi': None,
                                  'downward_api': None,
                                  'empty_dir': None,
                                  'fc': None,
                                  'flex_volume': None,
                                  'flocker': None,
                                  'gce_persistent_disk': None,
                                  'git_repo': None,
                                  'glusterfs': None,
                                  'host_path': {'path': '/jfbcore/jf-data/workspaces/robert-ws/trainings/j-lab-test/job-checkpoints',
                                                'type': ''},
                                  'iscsi': None,
                                  'name': 'job-checkpoints',
                                  'nfs': None,
                                  'persistent_volume_claim': None,
                                  'photon_persistent_disk': None,
                                  'portworx_volume': None,
                                  'projected': None,
                                  'quobyte': None,
                                  'rbd': None,
                                  'scale_io': None,
                                  'secret': None,
                                  'storageos': None,
                                  'vsphere_volume': None},
                                 {'aws_elastic_block_store': None,
                                  'azure_disk': None,
                                  'azure_file': None,
                                  'cephfs': None,
                                  'cinder': None,
                                  'config_map': None,
                                  'csi': None,
                                  'downward_api': None,
                                  'empty_dir': None,
                                  'fc': None,
                                  'flex_volume': None,
                                  'flocker': None,
                                  'gce_persistent_disk': None,
                                  'git_repo': None,
                                  'glusterfs': None,
                                  'host_path': None,
                                  'iscsi': None,
                                  'name': 'default-token-v9jmq',
                                  'nfs': None,
                                  'persistent_volume_claim': None,
                                  'photon_persistent_disk': None,
                                  'portworx_volume': None,
                                  'projected': None,
                                  'quobyte': None,
                                  'rbd': None,
                                  'scale_io': None,
                                  'secret': {'default_mode': 420,
                                             'items': None,
                                             'optional': None,
                                             'secret_name': 'default-token-v9jmq'},
                                  'storageos': None,
                                  'vsphere_volume': None}]},
            'status': {'conditions': [{'last_probe_time': None,
                                       'last_transition_time': datetime.datetime(2021, 5, 11, 11, 37, 16, tzinfo=tzlocal()),
                                       'message': None,
                                       'reason': None,
                                       'status': 'True',
                                       'type': 'Initialized'},
                                      {'last_probe_time': None,
                                       'last_transition_time': datetime.datetime(2021, 5, 11, 11, 37, 16, tzinfo=tzlocal()),
                                       'message': 'containers with unready '
                                                  'status: '
                                                  '[h6bdb418eeedbe2798071d76abc14f754]',
                                       'reason': 'ContainersNotReady',
                                       'status': 'False',
                                       'type': 'Ready'},
                                      {'last_probe_time': None,
                                       'last_transition_time': datetime.datetime(2021, 5, 11, 11, 37, 16, tzinfo=tzlocal()),
                                       'message': 'containers with unready '
                                                  'status: '
                                                  '[h6bdb418eeedbe2798071d76abc14f754]',
                                       'reason': 'ContainersNotReady',
                                       'status': 'False',
                                       'type': 'ContainersReady'},
                                      {'last_probe_time': None,
                                       'last_transition_time': datetime.datetime(2021, 5, 11, 11, 37, 16, tzinfo=tzlocal()),
                                       'message': None,
                                       'reason': None,
                                       'status': 'True',
                                       'type': 'PodScheduled'}],
                       'container_statuses': [{'container_id': None,
                                               'image': 'jf_default:latest',
                                               'image_id': '',
                                               'last_state': {'running': None,
                                                              'terminated': None,
                                                              'waiting': None},
                                               'name': 'h6bdb418eeedbe2798071d76abc14f754',
                                               'ready': False,
                                               'restart_count': 0,
                                               'state': {'running': None,
                                                         'terminated': None,
                                                         'waiting': {'message': None,
                                                                     'reason': 'ContainerCreating'}}}],
                       'host_ip': '115.71.28.77',
                       'init_container_statuses': None,
                       'message': None,
                       'nominated_node_name': None,
                       'phase': 'Pending',
                       'pod_ip': None,
                       'qos_class': 'BestEffort',
                       'reason': None,
                       'start_time': datetime.datetime(2021, 5, 11, 11, 37, 16, tzinfo=tzlocal())}}],
    'kind': 'PodList',
    'metadata': {'_continue': None,
                'remaining_item_count': None,
                'resource_version': '337952',
                'self_link': '/api/v1/namespaces/default/pods'}}
    """
    pass

def parsing_pod_annotations(pod):
    return pod.metadata.annotations

def parsing_pod_list(pod_list):
    # node_list.items -> node_list []
    new_pod_list = []
    for pod in pod_list.items:
        new_pod_list.append(pod)
    
    return new_pod_list

def parsing_pod_name(pod):
    return pod.metadata.name

def parsing_pod_node_name(pod):
    return pod.spec.node_name

def parsing_pod_node_ip(pod):
    return pod.status.host_ip

def parsing_pod_container_resource_limits(container):
    return container.resources.limits

def parsing_pod_container_resource_requests(container):
    return container.resources.requests

def parsing_pod_containers(pod):
    return pod.spec.containers

def parsing_pod_gpu_resource(pod):
    # 개수와 general인지 MIG 인지
    # limits 
    # 'allocatable': {'cpu': '48',
    #             'ephemeral-storage': '379513913535',
    #             'hugepages-1Gi': '0',
    #             'hugepages-2Mi': '0',
    #             'memory': '131850020Ki',
    #             'nvidia.com/gpu': '0',
    #             'nvidia.com/mig-1g.5gb': '2',
    #             'nvidia.com/mig-2g.10gb': '1',
    #             'nvidia.com/mig-3g.20gb': '1',
    #             'nvidia.com/mig-4g.20gb': '1',
    #             'pods': '110'}
    # TEST
    # containers.resources.limits = {'nvidia.com/gpu': '1', 'nvidia.com/mig-1g.5gb': '1'}
    
    general_gpu = 0
    mig_gpu = 0
    mig_detail = {
        # 'nvidia.com/mig-2g.10gb': '1',
    }
    for container in pod.spec.containers:
        resource_limits = parsing_pod_container_resource_limits(container)
        if resource_limits is not None:
            general_gpu += parsing_general_gpu_count(resource_limits)
            mig_gpu, mig_detail = parsing_mig_gpu_count(resource_limits)

    return {
        "general_gpu": general_gpu,
        "mig_gpu": mig_gpu,
        "mig_detail": mig_detail,
    }

def parsing_pod_gpu_usage_count(pod):
    gpu_resource = parsing_pod_gpu_resource(pod)
    return gpu_resource["general_gpu"] + gpu_resource["mig_gpu"]

def parsing_pod_other_resource(pod):
    # CPU MEMORY INFO
    cpu = None
    memory = None
    for container in pod.spec.containers:
        # 어차피 POD 안에 1개의 컨테이너만 존재하게 할 것
        resource_limits = parsing_pod_container_resource_limits(container)
        if resource_limits is not None:
            other_resource = parsing_other_resource(resource_limits)
            cpu = other_resource["cpu"] # None은 최대치
            memory = other_resource["memory"] # None은 최대치

    return {
        "cpu": cpu,
        "memory": memory
    }

def parsing_pod_resource_cpu(pod):
    cpu = None
    for container in parsing_pod_containers(pod):
        resource_dict = parsing_pod_container_resource_limits(container)
        if resource_dict is not None:
            cpu = parsing_resource_cpu(resource_dict)

    return cpu

def parsing_pod_resource_memory(pod):
    memory = None
    for container in parsing_pod_containers(pod):
        resource_dict = parsing_pod_container_resource_limits(container)
        if resource_dict is not None:
            memory = parsing_resource_memory(resource_dict)

    return memory

def parsing_pod_network_interface(pod):
    return {
        POD_NETWORK_INTERFACE_LABEL_KEY: parsing_item_labels(pod).get(POD_NETWORK_INTERFACE_LABEL_KEY)
    } 

def parsing_pod_item_type(pod):
    # TRAINING_TYPE | DEPLOYMENT_TYPE
    return parsing_item_labels(pod).get("work_type")

def parsing_pod_restart_count(pod):
    try:
        for container_statuses in pod.status.container_statuses:
            return container_statuses.restart_count
    except:
        return "unknown"

def parsing_pod_container_id(pod, container_index=0):
    """
    Description : 
        Pod Container parsing

    Args :
        Pod (object) : pod object
        container_index (int) : default = 0 (JF 시스템 상 1 Pod = 1 Conatiner). 

    Return :
        None | str (ex) docker://57403f76759badd141d92a2e894af07528b9f7aa5fe940a9f4ea3cf5fef15491
    """
    try:
        return pod.status.container_statuses[container_index].container_id
    except:
        return None

def parsing_pod_annotation_network_status(pod):
    # Multus Plugin 기반 정보 - networks 정보에서 정의된 내용을 실행시키고 있는 상태에 대한 정보 (실행이 완전 진행 된 이후 저장되는 정보) 
    annotations = parsing_pod_annotations(pod)
    if annotations is None:
        return None
    else:
        return annotations.get(K8S_ANNOTAION_NAD_NETWORK_STATUS_KEY)

def parsing_pod_annotation_networks(pod):
    # Multus Plugin 기반 정보 - 정의에 대한 값 (실행 즉시 저장되는 정보)
    annotations = parsing_pod_annotations(pod)
    if annotations is None:
        return None
    else:
        return annotations.get(K8S_ANNOTAION_NAD_NETWORKS_KEY)

def parsing_pod_network_ips(pod):
    def to_json(data):
        if data is None:
            return []
        try:
            data = json.loads(data)
        except Exception as e:
            # 만약 json.loads에서 문제가 발생한다면 원인 분석 및 해결이 필요하므로 에러 발생시킴
            raise e 
        return data

    def append(ips, data):
        for item in data:
            item_ips = item.get("ips")
            if item_ips is not None:
                ips += item_ips

    ips = []

    network_status = parsing_pod_annotation_network_status(pod=pod)
    networks = parsing_pod_annotation_networks(pod=pod)
    if network_status == None and networks == None:
        return ips 
    
    network_status = to_json(data=network_status)
    networks = to_json(data=networks)

    append(ips=ips, data=network_status)
    append(ips=ips, data=networks)

    return ips

## Service
def service_item_ex():
    # {'api_version': None,
    # 'kind': None,
    # 'metadata': {'annotations': None,
    #             'cluster_name': None,
    #             'creation_timestamp': datetime.datetime(2021, 11, 22, 7, 48, 19, tzinfo=tzlocal()),
    #             'deletion_grace_period_seconds': None,
    #             'deletion_timestamp': None,
    #             'finalizers': None,
    #             'generate_name': None,
    #             'generation': None,
    #             'labels': {'executor_id': '2',
    #                         'executor_name': 'yeobie',
    #                         'pod_name': 'hff8e9d6b873d917ea54011330601dcf2',
    #                         'service_type': 'user-nodeport',
    #                         'training_group': 'hff8e9d6b873d917ea54011330601dcf2',
    #                         'training_id': '12',
    #                         'training_name': 'custom-d-test',
    #                         'training_tool_id': '1040',
    #                         'training_tool_type': 'jupyter',
    #                         'training_total_gpu': '1',
    #                         'training_type': 'advanced',
    #                         'user': 'yeobie',
    #                         'work_func_type': 'tool',
    #                         'work_type': 'training',
    #                         'workspace_id': '1',
    #                         'workspace_name': 'robert-ws'},
    #             'managed_fields': None,
    #             'name': 'hff8e9d6b873d917ea54011330601dcf2---userport-0',
    #             'namespace': 'default',
    #             'owner_references': None,
    #             'resource_version': '8546351',
    #             'self_link': '/api/v1/namespaces/default/services/hff8e9d6b873d917ea54011330601dcf2---userport-0',
    #             'uid': '4d266a08-f29c-4bf6-9cef-db4f7dbb037c'},
    # 'spec': {'cluster_ip': '10.97.118.109',
    #         'external_i_ps': None,
    #         'external_name': None,
    #         'external_traffic_policy': 'Cluster',
    #         'health_check_node_port': None,
    #         'ip_family': None,
    #         'load_balancer_ip': None,
    #         'load_balancer_source_ranges': None,
    #         'ports': [{'name': 'tensorboard',
    #                     'node_port': 32282,
    #                     'port': 6006,
    #                     'protocol': 'TCP',
    #                     'target_port': 6006}],
    #         'publish_not_ready_addresses': None,
    #         'selector': {'pod_name': 'hff8e9d6b873d917ea54011330601dcf2'},
    #         'session_affinity': 'None',
    #         'session_affinity_config': None,
    #         'type': 'NodePort'},
    # 'status': {'load_balancer': {'ingress': None}}}
    pass 

def service_Exception_ex():
    # Reason: Conflict
    # HTTP response headers: HTTPHeaderDict({'Cache-Control': 'no-cache, private', 'Content-Type': 'application/json', 'Date': 'Thu, 14 Oct 2021 10:59:32 GMT', 'Content-Length': '264'})
    # HTTP response body: {"kind":"Status","apiVersion":"v1","metadata":{},"status":"Failure","message":"services \"heda67549c751ee5663beab4873afe403---ssh\" already exists","reason":"AlreadyExists","details":{"name":"heda67549c751ee5663beab4873afe403---ssh","kind":"services"},"code":409}
    # except Exception as e:
        # print("[",e,"]")
        # print(e.status)
        # print(e.reason)
        # e_body = json.loads(e.body)
        # print("reason",e_body["reason"])
        # print("message",e_body["message"])
        # print("details", e_body["details"]["causes"][0]["message"])
    pass

def parsing_service_port_list(service):
    port_list = []
    ports = service.spec.ports
    if ports is None:
        return port_list

    for port in service.spec.ports:
        port_list.append(port.to_dict())
        
    return port_list



## network-attachment-definitions (Only dict type)
def parsing_network_attachment_definition_config(nad):
    return json.loads(nad["spec"]["config"])

def parsing_network_attachment_definition_metadata(nad):
    return nad.get("metadata")

def parsing_network_attachment_definition_annotations(nad):
    metadata = parsing_network_attachment_definition_metadata(nad)
    if metadata is None:
        return metadata
    return metadata.get("annotations")

def parsing_network_attachment_definition_annotations_resource_name(nad):
    annotations = parsing_network_attachment_definition_annotations(nad)
    if annotations is None:
        return annotations
    return annotations.get(K8S_ANNOTAION_NAD_RESOURCE_NAME_KEY)

# ======================================================================================================



