import kubernetes
from kubernetes import client, config
import traceback
import time
import os
import json
from datetime import datetime
from utils.db import get_user_list, get_user_workspace, get_workspace_list
import utils.db as db
import utils.common as common
from utils.common import JfLock, date_str_to_timestamp, KUBE_SHARE_DICT
import utils.mpi as mpi
from utils.kube_setting_cmd import *
from utils.kube_common_volume import *
from utils.kube_pod_status import *
from utils.kube_log_data import *
import sys
sys.path.insert(0, os.path.abspath('..'))
from settings import *
from TYPE import *
import TYPE
import utils.kube_parser as kube_parser
import base64
from lock import jf_plock
### For Pod Queue
# import sys
# sys.path.insert(0, os.path.abspath('..'))



coreV1Api = None
extensV1Api = None
apiextensV1Api = None

def update_kube_config():
    with jf_plock:
        global coreV1Api
        global extensV1Api
        global apiextensV1Api
        try:
            # ** version 이슈 있음 **
            # kubernetes 12.0.1 기준 api instance.
            # config.load_kube_config(config_file=KUBER_CONFIG_PATH, persist_config=False)
            config.load_kube_config(config_file=KUBER_CONFIG_PATH)
            coreV1Api = kubernetes.client.CoreV1Api()
            extensV1Api = kubernetes.client.ExtensionsV1beta1Api()
            apiextensV1Api = kubernetes.client.ApiextensionsV1Api() # For SystemCheck
        except Exception as e:
            print("Config Load Unknown Error" ,e)

update_kube_config()


# 공유 데이터
# class KubeData():
#     def __init__(self, namespace="default"):
#         self.updated = False
#         self.pod_list = coreV1Api.list_namespaced_pod(namespace=namespace)
#         self.node_list = coreV1Api.list_node()
#         self.service_list = coreV1Api.list_namespaced_service(namespace=namespace)
#         self.ingress_service_list = coreV1Api.list_namespaced_service(namespace="ingress-nginx")
#         self.ingress_list = extensV1Api.list_namespaced_ingress(namespace=namespace)
#         self.master_pid = None
#         self.node_update_func = []
#         self.apiserver_addr = self._get_apiserver_addr()
#         self.token = self._get_token()

#     def set_master_pid(self, pid):
#         self.master_pid = pid

#     def is_master(self):
#         return self.master_pid == os.getpid()
    
#     def set_update_node_labels_func(self, update_func):
#         if type(update_func) == type([]):
#             self.node_update_func += update_func
#         else :
#             self.node_update_func.append(update_func)

#     def _run_update_node_labels_func(self):
#         for f in self.node_update_func:
#             f()

#     def _get_apiserver_addr(self):
#         with open(KUBER_CONFIG_PATH, "r") as fr:
#             for line in fr.readlines():
#                 if "server:" in line:
#                     line = line.replace("server:","").replace(" ","").replace("\n","")
#                     return line
    
#     def get_apiserver_addr(self):
#         return self.apiserver_addr

#     def _get_token(self):
#         def get_service_account_default_secrets_name():
#             for service_account in coreV1Api.list_service_account_for_all_namespaces().items:
#                 if service_account.metadata.name == "default":
#                     return service_account.secrets[0].name

#         secret_list = coreV1Api.list_secret_for_all_namespaces()
#         for secret in secret_list.items:
#             if secret.metadata.name == get_service_account_default_secrets_name():
#                 return base64.b64decode(secret.data["token"]).decode()
    
#     def get_token(self):
#         return self.token

#     def update_all_list(self, namespace="default", force=False):
#         try:
#             # print("UPDATE ALL ", os.getpid())
#             self.pod_list = coreV1Api.list_namespaced_pod(namespace=namespace)
#             self.service_list = coreV1Api.list_namespaced_service(namespace=namespace)
#             self.ingress_service_list = coreV1Api.list_namespaced_service(namespace="ingress-nginx")
#             self._update_node_list()
#             self.ingress_list = extensV1Api.list_namespaced_ingress(namespace=namespace)
#         except Exception as e:
#             print("Kubernetes Update all Unknown error", e)
#             update_kube_config()
        
#     def _update_node_list(self):
#         node_list = coreV1Api.list_node()
#         if self.is_master():
#             if len(self.node_list.items) != len(node_list.items):
#                 self.node_list = node_list
#                 self._run_update_node_labels_func()
#         self.node_list = node_list

#     def get_pod_list(self, try_update=False, namespace="default"):
#         if try_update:
#             self.pod_list = coreV1Api.list_namespaced_pod(namespace=namespace)
#             self.updated = True
#         return self.pod_list

#     def get_service_list(self, try_update=False, namespace="default"):
#         if try_update:
#             self.service_list = coreV1Api.list_namespaced_service(namespace=namespace)
#             self.updated = True
#         return self.service_list

#     def get_ingress_service_list(self, try_update=False):
#         if try_update:
#             self.ingress_service_list = coreV1Api.list_namespaced_service(namespace="ingress-nginx")
#             self.updated = True
#         return self.ingress_service_list

#     def get_node_list(self, try_update=False):
#         if try_update:
#             self.node_list = coreV1Api.list_node()
#             self.updated = True
#         return self.node_list

#     def get_ingress_list(self, try_update=False, namespace="default"):
#         if try_update:
#             self.ingress_list = extensV1Api.list_namespaced_ingress(namespace=namespace)
#             self.updated = True
#         return self.ingress_list

POD_LIST_KEY = "pod_list"
NODE_LIST_KEY = "node_list"
SERVICE_LIST_KEY = "service_list"
INGRESS_SERVICE_LIST_KEY = "ingress_service_list"
INGRESS_LIST_KEY = "ingress_list"
class KubeShareFunc():
    def __init__(self):
        # response_type update by _response_type_parser
        self._kuber_api_init()
        self.main_func_dict = {
            POD_LIST_KEY: {
                "func": self.coreV1Api.list_namespaced_pod, 
                "kwargs": {"namespace": "default"},
                "response_type": None
            },
            NODE_LIST_KEY: {
                "func": self.coreV1Api.list_node, 
                "kwargs": {},
                "response_type": None
            },
            SERVICE_LIST_KEY: {
                "func": self.coreV1Api.list_namespaced_service,  
                "kwargs": {"namespace": "default"},
                "response_type": None
            },
            INGRESS_SERVICE_LIST_KEY: {
                "func": self.coreV1Api.list_namespaced_service,
                "kwargs": {"namespace": "ingress-nginx"},
                "response_type": None
            },
            INGRESS_LIST_KEY: {
                "func": self.extensV1Api.list_namespaced_ingress,
                "kwargs": {"namespace": "default"},
                "response_type": None
            }
        }
        
        self._main_func_init()

    def _kuber_api_init(self):
        config.load_kube_config(config_file=KUBER_CONFIG_PATH)
        self.coreV1Api = kubernetes.client.CoreV1Api()
        self.extensV1Api = kubernetes.client.ExtensionsV1beta1Api()
        self.apiextensV1Api = kubernetes.client.ApiextensionsV1Api() # For SystemCheck

    def _main_func_init(self):
        for func_key in self.get_func_key_list():
            self._response_type_parser(func_key=func_key)
            self._serialize_form_and_self_deserialize_test(func_key=func_key)

    def _response_type_parser(self, func_key):
        func_info = self.get_func_info(func_key=func_key)
        func_info["response_type"] = type(func_info["func"](**func_info["kwargs"])).__name__
        
        
    def _serialize_form_and_self_deserialize_test(self, func_key):  
        func_info = self.get_func_info(func_key=func_key)
        # auto deserialize form
        item_list = func_info["func"](**func_info["kwargs"])

        # serialize form
        item_list_se = func_info["func"](**func_info["kwargs"], _preload_content=False).data

        # self deserialize form
        item_list_de = self._deserialize(item_list_se, func_info["response_type"])
        
        assert type(item_list) is type(item_list_de), "{} | {}".format(type(item_list), type(item_list_de))

        item_list_to_dict = item_list.to_dict()
        item_list_de_to_dict = item_list_de.to_dict()

        key_list = item_list_de_to_dict.keys()

        assert item_list_to_dict.keys() == item_list_de_to_dict.keys(), "{} | {}".format(item_list_to_dict.keys(),item_list_de_to_dict.keys())

        # metadadata의 경우 조회 시차 때문에 resource_version이 다르게 나올 수 있음
        # 모든 조회 결과가 다르게 나온다면 확인이 필요
        for key in key_list:
            if item_list_to_dict[key] != item_list_de_to_dict[key]:
                print("[Warn] {} - {} is not Same.".format(func_key ,key))
    
    def _wrap_fake_response(self, serialize_item):
        class FakeResponse:
            def __init__(self, serialize_item):
                self.data = serialize_item
        return FakeResponse(serialize_item)
    
    def _deserialize(self, serialize_item, reponse_type):
        if type(serialize_item).__name__ == "HTTPResponse":
            pass
        if type(serialize_item).__name__ == "bytes":
            serialize_item = self._wrap_fake_response(serialize_item)
            
        return kubernetes.client.ApiClient().deserialize(serialize_item, reponse_type)
    
    def get_func_key_list(self):
        """
        return (list) : key name list.
        """
        return self.main_func_dict.keys()
    
    def get_func_info(self, func_key):
        return self.main_func_dict[func_key]
    
    def convert_serialize_item_to_deserialize_item(self, serialize_item, func_key):
        func_info = self.get_func_info(func_key=func_key)
            
        return self._deserialize(serialize_item, func_info["response_type"])
    
    def get_deserialize_item_list(self, func_key, **kwargs):
        """
        func_key (str) : return of get_func_key_list()
        """
        # Object
        func_info = self.get_func_info(func_key=func_key)
        func_info["kwargs"].update(kwargs)
        return func_info["func"](**func_info["kwargs"])
        
    def get_serialize_item_list(self, func_key, **kwargs):
        """
        func_key (str) : return of get_func_key_list()
        """
        # 공유용
        func_info = self.get_func_info(func_key=func_key)
        func_info["kwargs"].update(kwargs)
        return func_info["func"](**func_info["kwargs"], _preload_content=False)
    
    #################################################################################
    
    # POD LIST
    def get_deserialize_pod_list(self, **kwargs):
        """
        return pod list kubernetes object
        """ 
        return self.get_deserialize_item_list(func_key=POD_LIST_KEY, **kwargs)
    
    def get_serialize_pod_list(self, **kwargs):
        """
        return pod list response (byte)
        """
        return self.get_serialize_item_list(func_key=POD_LIST_KEY, **kwargs)

    # NODE LIST
    def get_deserialize_node_list(self, **kwargs):
        """
        return node list kubernetes object
        """ 
        return self.get_deserialize_item_list(func_key=NODE_LIST_KEY, **kwargs)
    
    def get_serialize_node_list(self, **kwargs):
        """
        return node list response (byte)
        """
        return self.get_serialize_item_list(func_key=NODE_LIST_KEY, **kwargs)
    
    # SERVICE LIST
    def get_deserialize_service_list(self, **kwargs):
        """
        return service list kubernetes object
        """ 
        return self.get_deserialize_item_list(func_key=SERVICE_LIST_KEY, **kwargs)
    
    def get_serialize_service_list(self, **kwargs):
        """
        return service list response (byte)
        """
        return self.get_serialize_item_list(func_key=SERVICE_LIST_KEY, **kwargs)
    
    # INGRESS SERVICE LIST
    def get_deserialize_ingress_service_list(self, **kwargs):
        """
        return ingress service list kubernetes object
        """ 
        return self.get_deserialize_item_list(func_key=INGRESS_SERVICE_LIST_KEY, **kwargs)
    
    def get_serialize_ingress_service_list(self, **kwargs):
        """
        return ingress service list response (byte)
        """
        return self.get_serialize_item_list(func_key=INGRESS_SERVICE_LIST_KEY, **kwargs)
    
    # INGRESS LIST
    def get_deserialize_ingress_list(self, **kwargs):
        """
        return ingress list kubernetes object
        """ 
        return self.get_deserialize_item_list(func_key=INGRESS_LIST_KEY, **kwargs)
    
    def get_serialize_ingress_list(self, **kwargs):
        """
        return ingress list response (byte)
        """
        return self.get_serialize_item_list(func_key=INGRESS_LIST_KEY, **kwargs)  
    

kube_share_func = KubeShareFunc()

# 공유 데이터
class KubeData():
    def __init__(self, kube_share_func, kube_share_dict, namespace="default"):
        """
        kube_share_func (KubeShareFunc)
        kube_share_dict (dict or multiprocessing.managers.DictProxy) 
        """
        self.kube_share_func = kube_share_func
        self.kube_share_dict = kube_share_dict
        self._init_kube_share_dict()
        
        self.master_pid = None
        self.node_update_func = []
        self.apiserver_addr = self._get_apiserver_addr()
        self.token = self._get_token()
        
        self.pod_list = None
        self.node_list = None
        self.service_list = None
        self.ingress_service_list = None
        self.ingress_list = None
        self.update_all_list()
        # print(self.kube_share_dict.keys())
        # print(kube_share_dict.keys())


    def _init_kube_share_dict(self):
        kube_share_func = self.kube_share_func
        kube_share_dict = self.kube_share_dict
        for func_key in kube_share_func.get_func_key_list():
            if kube_share_dict.get(func_key) is None:
                kube_share_dict[func_key] = kube_share_func.get_serialize_pod_list().data

    def set_master_pid(self, pid):
        self.master_pid = pid

    def is_master(self):
        return self.master_pid == os.getpid()
    
    def set_update_node_labels_func(self, update_func):
        if type(update_func) == type([]):
            self.node_update_func += update_func
        else :
            self.node_update_func.append(update_func)

    def _run_update_node_labels_func(self):
        for f in self.node_update_func:
            f()

    def _get_apiserver_addr(self):
        """
        kube config file 읽어서 apiserver_addr parsing
        """
        with open(KUBER_CONFIG_PATH, "r") as fr:
            for line in fr.readlines():
                if "server:" in line:
                    line = line.replace("server:","").replace(" ","").replace("\n","")
                    return line
    
    def get_apiserver_addr(self):
        return self.apiserver_addr

    def _get_token(self):
        """
        python kubernetes api에서 제공해주지 않는 기능에 대해 직접 api call을 요청할 때 필요한 token parsing
        """
        def get_service_account_default_secrets_name():
            for service_account in kube_share_func.coreV1Api.list_service_account_for_all_namespaces().items:
                if service_account.metadata.name == "default":
                    return service_account.secrets[0].name

        secret_list = kube_share_func.coreV1Api.list_secret_for_all_namespaces()
        for secret in secret_list.items:
            if secret.metadata.name == get_service_account_default_secrets_name():
                return base64.b64decode(secret.data["token"]).decode()
    
    def get_token(self):
        return self.token
    
    def _convert_serialize_item_to_deserialize_item(self, func_key):
        """
        serialize item -> deserialize item
        multiprocessing manager로 부터 공유받는 serialize item 을 object로 변경
        """
        return self.kube_share_func.convert_serialize_item_to_deserialize_item(self.kube_share_dict.get(func_key), func_key)
           
    def update_all_list(self, namespace="default", force=False):
        try:
            pod_list_resource_version = self.update_pod_list(namespace=namespace)
            service_list_resource_version = self.update_service_list(namespace=namespace)
            ingress_service_list_resource_version = self.update_ingress_service_list(namespace="ingress-nginx")
            node_list_resource_version = self.update_node_list()
            ingress_list_resource_version = self.update_ingress_list(namespace=namespace)

            self.kube_share_dict["resource_version"] = {
                POD_LIST_KEY: pod_list_resource_version,
                SERVICE_LIST_KEY: service_list_resource_version,
                INGRESS_SERVICE_LIST_KEY: ingress_service_list_resource_version,
                NODE_LIST_KEY: node_list_resource_version,
                INGRESS_LIST_KEY: ingress_list_resource_version
            }
        except Exception as e:
            print("Kubernetes Update all Unknown error", e)
            update_kube_config()
        
    def update_node_list(self):
        old_node_list = self._convert_serialize_item_to_deserialize_item(NODE_LIST_KEY)
        
        self._update_node_list()
        
        new_node_list = self._convert_serialize_item_to_deserialize_item(NODE_LIST_KEY)
        
        if self.is_master():
            if len(old_node_list.items) != len(new_node_list.items):
                self._run_update_node_labels_func()
    
    def _update_node_list(self, **kwargs):
        self.kube_share_dict[NODE_LIST_KEY] = self.kube_share_func.get_serialize_node_list(**kwargs).data
        return self._get_list_resource_version(list_key=NODE_LIST_KEY)

    def update_pod_list(self, **kwargs):
        self.kube_share_dict[POD_LIST_KEY] = self.kube_share_func.get_serialize_pod_list(**kwargs).data
        return self._get_list_resource_version(list_key=POD_LIST_KEY)
    
    def update_service_list(self, **kwargs):
        self.kube_share_dict[SERVICE_LIST_KEY] = self.kube_share_func.get_serialize_service_list(**kwargs).data
        return self._get_list_resource_version(list_key=SERVICE_LIST_KEY)

    def update_ingress_service_list(self, **kwargs):
        self.kube_share_dict[INGRESS_SERVICE_LIST_KEY] = self.kube_share_func.get_serialize_ingress_service_list(**kwargs).data
        return self._get_list_resource_version(list_key=INGRESS_SERVICE_LIST_KEY)

    def update_ingress_list(self, **kwargs):
        self.kube_share_dict[INGRESS_LIST_KEY] = self.kube_share_func.get_serialize_ingress_list(**kwargs).data
        return self._get_list_resource_version(list_key=INGRESS_LIST_KEY)

    def _get_list_resource_version(self, list_key):
        st = time.time()
        item_list = self._convert_serialize_item_to_deserialize_item(list_key)
        resource_version = item_list.metadata.resource_version
        return resource_version

    def _check_list_resource_version(self, item_list, list_key):
        if item_list is None:
            return False
        resource_version = item_list.metadata.resource_version
        return self.kube_share_dict["resource_version"][list_key] == resource_version


    def get_pod_list(self, try_update=False, namespace="default"):
        if try_update:
            self.update_pod_list(namespace=namespace)

        if not self._check_list_resource_version(item_list=self.pod_list, list_key=POD_LIST_KEY):
            # print("POD LIST UPDATE !!")
            pod_list = self._convert_serialize_item_to_deserialize_item(POD_LIST_KEY)
            self.pod_list = pod_list
        else :
            # print("POD LIST MEMORY USE !!")
            pass
            
        # self._get_list_resource_version(item_list=self.pod_list)
        return self.pod_list

    def get_service_list(self, try_update=False, namespace="default"):
        if try_update:
            self.update_service_list(namespace=namespace)
        
        if not self._check_list_resource_version(item_list=self.service_list, list_key=SERVICE_LIST_KEY):
            # print("SERVICE LIST UPDATE !!")
            service_list = self._convert_serialize_item_to_deserialize_item(SERVICE_LIST_KEY)
            self.service_list = service_list
        else:
            # print("SERVICE LIST MEMORY USE !!")
            pass
        
        # service_list = self._convert_serialize_item_to_deserialize_item(SERVICE_LIST_KEY)            
        return self.service_list

    def get_ingress_service_list(self, try_update=False):
        if try_update:
            self.update_ingress_service_list(namespace="ingress-nginx")

        if not self._check_list_resource_version(item_list=self.ingress_service_list, list_key=INGRESS_SERVICE_LIST_KEY):
            # print("INGRESS SERVICE LIST UPDATE !!")
            ingress_service_list = self._convert_serialize_item_to_deserialize_item(INGRESS_SERVICE_LIST_KEY)
            self.ingress_service_list = ingress_service_list
        else:
            # print("INGRESS SERVICE LIST MEMORY USE !!")
            pass

        # ingress_service_list = self._convert_serialize_item_to_deserialize_item(INGRESS_SERVICE_LIST_KEY)    
        return self.ingress_service_list

    def get_node_list(self, try_update=False):
        if try_update:
            self.update_node_list()

        if not self._check_list_resource_version(item_list=self.node_list, list_key=NODE_LIST_KEY):
            # print("NODE LIST UPDATE !!")
            node_list = self._convert_serialize_item_to_deserialize_item(NODE_LIST_KEY)
            self.node_list = node_list
        else:
            # print("NODE LIST MEMORY USE !!")
            pass

        # node_list = self._convert_serialize_item_to_deserialize_item(NODE_LIST_KEY)
        return self.node_list

    def get_ingress_list(self, try_update=False, namespace="default"):
        if try_update:
            self.update_ingress_list(namespace=namespace)

        if not self._check_list_resource_version(item_list=self.ingress_list, list_key=INGRESS_LIST_KEY):
            # print("INGRESS LIST UPDATE !!")
            ingress_list = self._convert_serialize_item_to_deserialize_item(INGRESS_LIST_KEY)
            self.ingress_list = ingress_list
        else:
            # print("INGRESS LIST MEMORY USE !!")
            pass

        # ingress_list = self._convert_serialize_item_to_deserialize_item(INGRESS_LIST_KEY)
        return self.ingress_list

kube_data = KubeData(kube_share_func=kube_share_func, kube_share_dict=KUBE_SHARE_DICT)

## Kuber 실시간 데이터 사용이 필요할 경우.
## ex ) 생성 시 실시간 상태, 삭제 시 등
import os
def get_list_namespaced_pod(try_update=False, namespace="default"):
    print("[POD] KUBER API CALL ", os.getpid())
    # try:
    #     aaeqkqpogjqe
    # except:
    #     raise
    return coreV1Api.list_namespaced_pod(namespace=namespace)
    # return kube_data.get_pod_list(try_update=try_update)

def get_list_node(try_update=False):
    print("[NODE] KUBER API CALL ", os.getpid())
    return coreV1Api.list_node()
    # return kube_data.get_node_list(try_update=try_update)

def get_list_service(try_update=False, namespace="default"):
    print("[SERVICE] KUBER API CALL ", os.getpid())
    return coreV1Api.list_namespaced_service(namespace=namespace)
    # return kube_data.get_service_list(try_update=try_update)

def get_ingress_service_list(self, try_update=False):
    print("[INGRESS_SERVICE] KUBER API CALL ", os.getpid())
    return coreV1Api.list_namespaced_service(namespace="ingress-nginx")

def get_list_ingress(try_update=False, namespace="default"):
    print("[INGRESS] KUBER API CALL ", os.getpid())
    return extensV1Api.list_namespaced_ingress(namespace=namespace)
    # return kube_data.get_ingress_list(try_update=try_update)

def get_list_custom_resource():
    return apiextensV1Api.list_custom_resource_definition()


def get_nginx_port(protocol, ingress_service_list=None): # ingress port (http or https)
    if ingress_service_list is None:
        ingress_service_list = kube_data.get_ingress_service_list()

    for service in ingress_service_list.items:
        if service.metadata.name in  ["ingress-nginx", "ingress-nginx-controller"]:
            for port in service.spec.ports:
                if port.name == protocol:
                    return port.node_port

def is_no_use_node(node_ip=None, node_name=None):
    from nodes import get_no_use_nodes
    if node_ip in get_no_use_nodes() or node_name in get_no_use_nodes():
        return True
    return False

# TODO Replace. 새로운 방식으로 변경 예정 (2022-11-21 Yeobie)
def get_select_node_gpu_info_list(pod_list=None, node_list=None, _init=False, no_use_nodes_case=False, gpu_mode=GPU_GENERAL_MODE, dict_labels=None ,**labels):
    # _init - 초기에 NODE Label 세팅용 (no use node 는 스케쥴이 제외되는데 이 부분 무시하도록)
    # no_use_nodes_case - No use nodes 의 gpu 사용 개수 파악용
    # gpu_mode - "general" | "mig"  (mig, general 따로 파싱하도록)
    # dict_labels - kube node label key와 비교하기 위한 용도
    def combine_mig_used_detail(mig_used_detail_list):
        combine_mig_detail = {
            
        }
        for mig_detail in mig_used_detail_list:
            for k, v in mig_detail.items():
                if combine_mig_detail.get(k) is None:
                    combine_mig_detail[k] = int(v)
                else :
                    combine_mig_detail[k] += int(v)
        return combine_mig_detail
            
    def update_mig_detail(total, used):
        new_mig_detail = {}
        
        for k, v in total.items():
            new_mig_detail[k] = {
                "total": int(v),
                "used": 0
            }
            if used.get(k) is not None:
                new_mig_detail[k]["used"] += int(used.get(k))
        return new_mig_detail

    if pod_list is None:
        pod_list = get_list_namespaced_pod()
    if node_list is None:
        node_list = get_list_node()

    result = [] # {"name", "ip", "total", "used"}

    try:
        if _init == True :
            node_list = kube_parser.parsing_node_list(node_list)
        else :
            node_list = kube_parser.parsing_node_gpu_worker_list(node_list)
        
        for node in node_list:
            node_status = get_node_status(node)
            node_ip, node_name = kube_parser.parsing_node_ip_and_hostname(node)
            if _init == False :
                if no_use_nodes_case == False and is_no_use_node(node_ip=node_ip, node_name=node_name) == True:
                    continue
                elif no_use_nodes_case == True and is_no_use_node(node_ip=node_ip, node_name=node_name) == False:
                    continue

            if dict_labels is not None:
                # jfb/gpu-model=NVIDIA-GeForce-RTX-2080
                select_node = True if len(dict_labels) == 0 else label_compare(label=kube_parser.parsing_item_labels(node), check_key_exist=False, **dict_labels)
            else :
                select_node = True if len(labels) == 0 else label_compare(label=kube_parser.parsing_item_labels(node), check_key_exist=False, **labels)

            if select_node == False:
                continue

            general_total = 0 
            mig_total = 0
            general_used = 0
            mig_used = 0
            mig_used_detail_list = []
            mig_total_detail = {}
            new_mig_total_detail = {}
            for pod in pod_list.items:
                # print("LABEL ", kube_parser.parsing_item_labels(pod))
                # if kube_parser.parsing_item_labels(pod) is None:
                #     continue
                # print("pod node_name ", kube_parser.parsing_pod_node_name(pod))
                # print("node_name ", node_name)
                if kube_parser.parsing_pod_node_name(pod) == node_name:
                    pod_gpu_resource = kube_parser.parsing_pod_gpu_resource(pod)
                    general_used += pod_gpu_resource["general_gpu"]
                    mig_used += pod_gpu_resource["mig_gpu"]
                    mig_used_detail_list.append(pod_gpu_resource["mig_detail"])
            try :
                if node_status['status'] == 'True':
                    node_gpu_resource = kube_parser.parsing_node_gpu_resource(node)
                    general_total = node_gpu_resource["general_gpu"]
                    mig_total = node_gpu_resource["mig_gpu"]
                    mig_total_detail = node_gpu_resource["mig_detail"]
                    new_mig_total_detail = update_mig_detail(mig_total_detail, combine_mig_used_detail(mig_used_detail_list))
                else:
                    total = 0
                
                if gpu_mode == GPU_GENERAL_MODE:
                    total = general_total
                    used = general_used
                elif gpu_mode == GPU_MIG_MODE:
                    total = mig_total
                    used = mig_used
                elif gpu_mode == GPU_ALL_MODE:
                    total = general_total + mig_total
                    used = general_used + mig_used

                gpu_model = kube_parser.parsing_node_gpu_model(node)
                gpu_memory = kube_parser.parsing_node_gpu_memory(node)
                gpu_detail_info = kube_parser.parsing_node_gpu_model_defail_info(node)

                result.append({
                    "name": node_name,
                    "ip": node_ip,
                    "gpu_model": gpu_model,
                    "gpu_memory": gpu_memory,
                    "total": total,
                    "used": used,
                    "mig_detail": new_mig_total_detail,
                    "gpu_detail_info" : gpu_detail_info
                })
            except :
                traceback.print_exc()
    except:
        traceback.print_exc()
    return result


def get_select_node_mig_info_list(select_node_gpu_info_list, mig_model_list):
    mig_node_list = []
    if len(mig_model_list) == 0:
        return select_node_gpu_info_list

    for i, node_gpu_info in enumerate(select_node_gpu_info_list):
        total = 0
        used = 0 
        new_mig_detail = {}
        for mig_model in mig_model_list:
            if mig_model in node_gpu_info["mig_detail"].keys():
                total += node_gpu_info["mig_detail"].get(mig_model)["total"]
                used += node_gpu_info["mig_detail"].get(mig_model)["used"]
                new_mig_detail[mig_model] = node_gpu_info["mig_detail"].get(mig_model)
        
        if total != 0:
            node_gpu_info["total"] = total
            node_gpu_info["used"] = used
            node_gpu_info["mig_detail"] = new_mig_detail
            mig_node_list.append(node_gpu_info)
    
    return mig_node_list

def get_select_node_resource_info_list(pod_list=None, node_list=None, db_node_list=None, all=False, select_cpu_nodes=None):
    
    if pod_list is None:
        pod_list = get_list_namespaced_pod()
    if node_list is None:
        node_list = get_list_node()
    if db_node_list is None:
        db_node_list = common.gen_dict_from_list_by_key(db.get_node_list(), "name", lower=True)
    else :
        db_node_list = common.gen_dict_from_list_by_key(db_node_list, "name", lower=True)

    if select_cpu_nodes is None:
        select_cpu_nodes = []

    # resource 값이 None인 케이스 (pod에서)는 node 자원 제한 없이 쓰겠다는 뜻
    
    result = []
    if all == True :
        # 최초 실행 시 정보 가져오는 용도. (GPU CPU 서버 가리지 않고 가져옴)
        node_list = kube_parser.parsing_node_list(node_list)
    else :
        node_list = kube_parser.parsing_node_cpu_worker_list(node_list)
    
    for node in node_list:
        node_status = get_node_status(node)
        if node_status["status"] != "True" and all != True:
            continue
        node_other_resource = kube_parser.parsing_node_other_resource(node)
        node_cpu_cores = int(node_other_resource["cpu"])
        node_memory = common.convert_unit_num(value=node_other_resource["memory"], target_unit=TYPE.MEMORY_DEFAULT_UNIT, return_num=True) #round(int(node_other_resource["memory"].replace("Ki","")) / (1024 * 1024), 2)
        node_ip, node_name = kube_parser.parsing_node_ip_and_hostname(node)
        if len(select_cpu_nodes) > 0 and node_name not in select_cpu_nodes:
            continue

        node_pod_cpu_limit = 0
        node_pod_memory_limit = 0
        node_cpu_limit_per_pod = node_cpu_cores
        node_cpu_limit_per_gpu = node_cpu_cores
        node_memory_limit_per_pod = node_memory 
        node_memory_limit_per_gpu = node_memory
        cpu_model = None
        interface_ib = None
        interface_10g = None
        is_cpu_server = -1
        is_gpu_server = -1

        node_cpu_lock_per_pod = None
        node_cpu_lock_per_gpu = None
        node_memory_lock_per_pod = None
        node_memory_lock_per_gpu = None
        node_cpu_lock_percent_per_pod = None
        node_cpu_lock_percent_per_gpu = None
        node_memory_lock_percent_per_pod = None
        node_memory_lock_percent_per_gpu  = None

        if db_node_list.get(node_name) is not None:
            db_node_info = db_node_list[node_name][-1]

            node_pod_cpu_limit = float(db_node_info["cpu_cores"])
            node_pod_memory_limit = float(db_node_info["ram"].replace("GB","")) # TODO 특정 함수로 GB -> Byte or Byte -> GB 할 수 있도록
            node_cpu_limit_per_pod = int(db_node_info[NODE_CPU_LIMIT_PER_POD_DB_KEY])
            node_cpu_limit_per_gpu = int(db_node_info[NODE_CPU_LIMIT_PER_GPU_DB_KEY])
            node_memory_limit_per_pod = int(db_node_info[NODE_MEMORY_LIMIT_PER_POD_DB_KEY])
            node_memory_limit_per_gpu = int(db_node_info[NODE_MEMORY_LIMIT_PER_GPU_DB_KEY])
            cpu_model = db_node_info["cpu"]
            interface_ib = None # db_node_info[INTERFACE_IB_KEY] - TODO network group으로 대체
            interface_10g = None # db_node_info[INTERFACE_10G_KEY] - TODO network group으로 대체
            is_cpu_server = db_node_info[NODE_IS_CPU_SERVER_KEY]
            is_gpu_server = db_node_info[NODE_IS_GPU_SERVER_KEY]

            node_cpu_lock_per_pod = db_node_info[NODE_CPU_CORE_LOCK_PER_POD_DB_KEY]
            node_cpu_lock_per_gpu = db_node_info[NODE_CPU_CORE_LOCK_PER_GPU_DB_KEY]
            node_memory_lock_per_pod = db_node_info[NODE_MEMORY_LOCK_PER_POD_DB_KEY]
            node_memory_lock_per_gpu = db_node_info[NODE_MEMORY_LOCK_PER_GPU_DB_KEY]

            node_cpu_lock_percent_per_pod = db_node_info[NODE_CPU_CORE_LOCK_PERCENT_PER_POD_DB_KEY]
            node_cpu_lock_percent_per_gpu = db_node_info[NODE_CPU_CORE_LOCK_PERCENT_PER_GPU_DB_KEY]
            node_memory_lock_percent_per_pod = db_node_info[NODE_MEMORY_LOCK_PERCENT_PER_POD_DB_KEY]
            node_memory_lock_percent_per_gpu = db_node_info[NODE_MEMORY_LOCK_PERCENT_PER_GPU_DB_KEY]

            # 소속된 network group
            allocate_network_group_list = db.get_network_group_list_group_by_node_id(node_id=db_node_info["id"])

        else :
            # K8s에는 존재하나 db에 존재하지 않는 아이템은 표시 X 
            continue

        pod_cpu_limits = 0
        pod_memory_limits = 0
        for pod in pod_list.items:
            if kube_parser.parsing_pod_node_name(pod) == node_name:
                pod_cpu_limit = kube_parser.parsing_pod_resource_cpu(pod)
                pod_memory_limit =  kube_parser.parsing_pod_resource_memory(pod)
                if pod_cpu_limit is None:
                    pod_cpu_limit = node_pod_cpu_limit
                else :
                    pod_cpu_limit = float(pod_cpu_limit)
                
                if pod_memory_limit is None:
                    pod_memory_limit = node_pod_memory_limit
                else :
                    pod_memory_limit = float(pod_memory_limit.replace("Gi", ""))

                pod_cpu_limits += pod_cpu_limit
                pod_memory_limits += pod_memory_limit

        # 혼잡도 - limit percent는 고려하지 않음
        # BLUE 여유 (미정) - 아무것도 실행중이지 않는 경우
        # Green 보통 - 최대치로 2개 이상 만들어도 100%를 넘지 않는 경우
        # Yellow 주의 - 할당 가능한 최대치로 할당 시 1개 이후로는 100% 넘어 가는 경우 (1개 까지는 100% 이하로 만들 수 있음을 보여줌)
        # Red 혼잡 - 물리적 개수 대비 할당 된 자원이 이미 100% 초과 혹은 최대치로 만들 경우 100% 초과 하는 경우

        # 위 
        # 할당 가능 최대치로 1개도 못만드는 경우 
        #          (lock percent가 100% 미만이면 할당량이 100%를 넘지 않았으나(Green 상태) 하나도 제대로 못만드는 경우(Red 상태) 발생) -> Red가 아닌 별도의 표시 ? ex) X 마크 
        



        def get_node_resource_congestion_status(num_of_resource, num_of_alloc_resource, num_of_resource_limit):
            left_resource = num_of_resource - num_of_alloc_resource 
            if left_resource <= 0 or left_resource < num_of_resource_limit:
                # 혼잡 - Red
                return NODE_RESOURCE_CONGESTION_HIGHT_STATUS

            if left_resource < num_of_resource_limit * 2:
                # 주의 - Yellow
                return NODE_RESOURCE_CONGESTION_MEDIUM_STATUS

            elif left_resource >= num_of_resource_limit * 2:
                # 여유 - Green
                return NODE_RESOURCE_CONGESTION_LOW_STATUS
            
        def get_node_resource_generable_status(num_of_resource, num_of_alloc_resource, num_of_resource_limit, is_lock, limit_percent):
            if is_lock == False:
                return True

            if num_of_resource * (limit_percent / 100) - num_of_alloc_resource < num_of_resource_limit:
                return False
            else:
                return True

        # CPU 사용 기준 status
        cpu_congestion_status_per_pod = get_node_resource_congestion_status(num_of_resource=node_cpu_cores, num_of_alloc_resource=round(pod_cpu_limits,2), num_of_resource_limit=node_cpu_limit_per_pod)
        ram_congestion_status_per_pod = get_node_resource_congestion_status(num_of_resource=node_memory, num_of_alloc_resource=round(pod_memory_limits,2), num_of_resource_limit=node_memory_limit_per_pod)
        congestion_status_per_pod = max(cpu_congestion_status_per_pod, ram_congestion_status_per_pod)
        cpu_generable_status_per_pod = get_node_resource_generable_status(num_of_resource=node_cpu_cores, num_of_alloc_resource=round(pod_cpu_limits,2), num_of_resource_limit=node_cpu_limit_per_pod, 
                                                                    is_lock=node_cpu_lock_per_pod, limit_percent=node_cpu_lock_percent_per_pod)
        ram_generable_status_per_pod = get_node_resource_generable_status(num_of_resource=node_memory, num_of_alloc_resource=round(pod_memory_limits,2), num_of_resource_limit=node_memory_limit_per_pod, 
                                                                    is_lock=node_memory_lock_per_pod, limit_percent=node_memory_lock_percent_per_pod)
        generable_status_per_pod = cpu_generable_status_per_pod == ram_generable_status_per_pod == True

        # GPU 사용 기준 status
        cpu_congestion_status_per_gpu = get_node_resource_congestion_status(num_of_resource=node_cpu_cores, num_of_alloc_resource=round(pod_cpu_limits,2), num_of_resource_limit=node_cpu_limit_per_gpu)
        ram_congestion_status_per_gpu = get_node_resource_congestion_status(num_of_resource=node_memory, num_of_alloc_resource=round(pod_memory_limits,2), num_of_resource_limit=node_memory_limit_per_gpu)
        congestion_status_per_gpu = max(cpu_congestion_status_per_gpu, ram_congestion_status_per_gpu)
        cpu_generable_status_per_gpu = get_node_resource_generable_status(num_of_resource=node_cpu_cores, num_of_alloc_resource=round(pod_cpu_limits,2), num_of_resource_limit=node_cpu_limit_per_gpu, 
                                                            is_lock=node_cpu_lock_per_gpu, limit_percent=node_cpu_lock_percent_per_gpu)
        ram_generable_status_per_gpu = get_node_resource_generable_status(num_of_resource=node_memory, num_of_alloc_resource=round(pod_memory_limits,2), num_of_resource_limit=node_memory_limit_per_gpu, 
                                                                    is_lock=node_memory_lock_per_gpu, limit_percent=node_memory_lock_percent_per_gpu)
        generable_status_per_gpu = cpu_generable_status_per_gpu == ram_generable_status_per_gpu == True

        available_num_of_cores_per_pod = node_cpu_cores * (node_cpu_lock_percent_per_pod/100) if node_cpu_lock_per_pod else -1
        available_num_of_cores_per_gpu = node_cpu_cores * (node_cpu_lock_percent_per_gpu/100) if node_cpu_lock_per_gpu else -1
        available_memory_size_per_pod = node_memory * (node_memory_lock_percent_per_pod/100) if node_memory_lock_per_pod else -1
        available_memory_size_per_gpu = node_memory * (node_memory_lock_percent_per_gpu/100) if node_memory_lock_per_gpu else -1


        result.append({
            "name": node_name,
            "ip": node_ip,
            NODE_CPU_MODEL_KEY: cpu_model,
            NODE_NUM_OF_CPU_CORES_KEY: node_cpu_cores,
            NODE_POD_ALLOC_NUM_OF_CPU_CORES_KEY: round(pod_cpu_limits,2), # POD에 할당 된 CPU CORES
            NODE_POD_ALLOC_AVALIABLE_NUM_OF_CPU_CORES_PER_POD_KEY : available_num_of_cores_per_pod,
            NODE_POD_ALLOC_AVALIABLE_NUM_OF_CPU_CORES_PER_GPU_KEY : available_num_of_cores_per_gpu,
            NODE_POD_ALLOC_CPU_CORES_RATIO_KEY: round(float(pod_cpu_limits/node_cpu_cores), 2),
            NODE_POD_ALLOC_REMAINING_NUM_OF_CPU_CORES_KEY: node_cpu_cores - pod_cpu_limits,
            NODE_CPU_LIMIT_PER_POD_DB_KEY: node_cpu_limit_per_pod,
            NODE_CPU_LIMIT_PER_GPU_DB_KEY: node_cpu_limit_per_gpu,
            NODE_MEMORY_SIZE_KEY: node_memory,
            NODE_POD_ALLOC_AVALIABLE_MEMORY_SIZE_PER_POD_KEY : available_memory_size_per_pod,
            NODE_POD_ALLOC_AVALIABLE_MEMORY_SIZE_PER_GPU_KEY : available_memory_size_per_gpu,
            NODE_POD_ALLOC_MEMORY_SIZE_KEY: round(pod_memory_limits,2), # POD에 할당 된 RAM
            NODE_POD_ALLOC_MEMORY_RATIO_KEY: round(float(pod_memory_limits)/node_memory, 2),
            NODE_POD_ALLOC_REMAINING_MEMORY_SIZE_KEY: node_memory - pod_memory_limits,
            NODE_MEMORY_LIMIT_PER_POD_DB_KEY: node_memory_limit_per_pod,
            NODE_MEMORY_LIMIT_PER_GPU_DB_KEY: node_memory_limit_per_gpu,
            NODE_IS_CPU_SERVER_KEY : is_cpu_server,
            NODE_IS_GPU_SERVER_KEY : is_gpu_server,
            INTERFACE_IB_KEY: interface_ib,
            INTERFACE_10G_KEY: interface_10g,
            NODE_NETWORK_GROUPS_ALLOC_KEY : allocate_network_group_list,
            NODE_CPU_CORE_LOCK_PER_POD_DB_KEY : node_cpu_lock_per_pod,
            NODE_CPU_CORE_LOCK_PER_GPU_DB_KEY : node_cpu_lock_per_gpu,
            NODE_MEMORY_LOCK_PER_POD_DB_KEY : node_memory_lock_per_pod,
            NODE_MEMORY_LOCK_PER_GPU_DB_KEY : node_memory_lock_per_gpu,
            NODE_CPU_CORE_LOCK_PERCENT_PER_POD_DB_KEY : node_cpu_lock_percent_per_pod,
            NODE_CPU_CORE_LOCK_PERCENT_PER_GPU_DB_KEY : node_cpu_lock_percent_per_gpu,
            NODE_MEMORY_LOCK_PERCENT_PER_POD_DB_KEY : node_memory_lock_percent_per_pod,
            NODE_MEMORY_LOCK_PERCENT_PER_GPU_DB_KEY : node_memory_lock_percent_per_gpu,
            NODE_RESOURCE_CONGESTION_STATUS_PER_POD_KEY : congestion_status_per_pod,
            NODE_RESOURCE_CONGESTION_STATUS_PER_GPU_KEY : congestion_status_per_gpu,
            NODE_RESOURCE_GENERABLE_STATUS_PER_POD_KEY : generable_status_per_pod,
            NODE_RESOURCE_GENERABLE_STATUS_PER_GPU_KEY : generable_status_per_gpu
        })
    return result


# 전체 GPU 중 특정 기간에 할당되어 있는 GPU 자원, 사용 가능 자원 계산을 위한 용도
def get_allocated_gpu_count(start_datetime=None, end_datetime=None, update_workspace_id=None, workspace_list=None, 
                            node_list=None, pod_list=None, guaranteed_gpu_only=True):

    def within_cur_time_check(cur_ts, base_start_datetime_ts, base_end_datetime_ts):
        within = True if cur_ts > base_start_datetime_ts and cur_ts < base_end_datetime_ts else False
        return within

    def within_rage_check(base_start_datetime_ts, base_end_datetime_ts, target_start_datetime_ts, target_end_datetime_ts):
        if ((base_start_datetime_ts <= target_start_datetime_ts and target_start_datetime_ts < base_end_datetime_ts)
            or (base_start_datetime_ts < target_end_datetime_ts and target_end_datetime_ts <= base_end_datetime_ts)
            or (base_start_datetime_ts <= target_start_datetime_ts and target_end_datetime_ts <= base_end_datetime_ts)
            or (base_start_datetime_ts >= target_start_datetime_ts and target_end_datetime_ts >= base_end_datetime_ts)):
            return True
        return False

    result = {'resource_total': 0, 'alloc_total': 0, 'alloc_used': 0, 'workspace': {}}
    try:
        nodes_total = get_gpu_total_count(node_list=node_list)
        result['resource_total'] = nodes_total
        workspace_list = db.get_workspace_list() if workspace_list is None else workspace_list

        if guaranteed_gpu_only:
            workspace_list = [workspace for workspace in workspace_list if workspace["guaranteed_gpu"] == 1 ]

        if workspace_list is not None:
            gpu_used = get_workspace_gpu_count(pod_list=pod_list)
            # {'training_used': 0, 'training_total': 0, 'deployment_used': 0, 'deployment_total': 1}
            for workspace in workspace_list:
                total = int(workspace['gpu_deployment_total'])+int(workspace['gpu_training_total'])
                used = int(gpu_used[workspace["id"]]["deployment_used"] if gpu_used.get(workspace["id"]) is not None else 0)\
                    + int(gpu_used[workspace["id"]]["training_used"] if gpu_used.get(workspace["id"]) is not None else 0)
                result['workspace'][workspace['workspace_name']] = {'total': total, 'used': used }

                base_start_datetime_ts = date_str_to_timestamp(workspace["start_datetime"])
                base_end_datetime_ts = date_str_to_timestamp(workspace["end_datetime"])

                result['alloc_total'] += total if within_cur_time_check(time.time(), base_start_datetime_ts, base_end_datetime_ts) else 0
                result['alloc_used'] += used

        if start_datetime is None and end_datetime is None:
            return result

        result['alloc_total'] = 0
        select_start_datetime_ts = date_str_to_timestamp(start_datetime)
        select_end_datetime_ts = date_str_to_timestamp(end_datetime)
        interval_ws_list = []
        for base_workspace in workspace_list:
            if base_workspace["id"] == update_workspace_id:
                continue

            base_start_datetime_ts = date_str_to_timestamp(base_workspace["start_datetime"])
            base_end_datetime_ts = date_str_to_timestamp(base_workspace["end_datetime"])

            if within_rage_check(base_start_datetime_ts, base_end_datetime_ts, select_start_datetime_ts, select_end_datetime_ts):
                interval_ws_list.append(base_workspace)

        # print("WSLIST" , interval_ws_list)
        for base_workspace in interval_ws_list:
            total = 0
            cur_total_s = int(base_workspace['gpu_deployment_total'])+int(base_workspace['gpu_training_total'])
            cur_total_e = int(base_workspace['gpu_deployment_total'])+int(base_workspace['gpu_training_total'])
            for comp_workspace in interval_ws_list:
                if base_workspace["id"] == comp_workspace["id"]:
                    continue

                comp_start_datetime_ts = date_str_to_timestamp(comp_workspace["start_datetime"])
                comp_end_datetime_ts = date_str_to_timestamp(comp_workspace["end_datetime"])

                base_start_datetime_ts = max(select_start_datetime_ts, date_str_to_timestamp(base_workspace["start_datetime"]))
                base_end_datetime_ts = min(date_str_to_timestamp(base_workspace["end_datetime"]), select_end_datetime_ts)

                if (comp_start_datetime_ts <= base_start_datetime_ts and base_start_datetime_ts < comp_end_datetime_ts):
                    cur_total_s += int(comp_workspace['gpu_deployment_total'])+int(comp_workspace['gpu_training_total'])
                if (comp_start_datetime_ts < base_end_datetime_ts and base_end_datetime_ts <= comp_end_datetime_ts):
                    cur_total_e += int(comp_workspace['gpu_deployment_total'])+int(comp_workspace['gpu_training_total'])

            total = max(total, max(cur_total_s, cur_total_e))
            result['alloc_total'] = max(result['alloc_total'], total)

    except:
        traceback.print_exc()
    return result

def get_pod_gpu_usage_by_item_type(pod_list=None):
    if pod_list is None:
        pod_list = kube_data.get_pod_list()
    
    result = {
        TRAINING_TYPE: 0,
        DEPLOYMENT_TYPE: 0 
    }
    for pod in pod_list.items:
        pod_labels = kube_parser.parsing_item_labels(pod)
        if pod_labels is None:
            continue
        if pod_labels.get('workspace_name') is None:
            continue
        type_ = kube_parser.parsing_pod_item_type(pod)

        result[type_] += kube_parser.parsing_pod_gpu_usage_count(pod)
    
    return result

def get_gpu_total_count(node_list=None):
    if node_list is None:
        node_list = get_list_node()
    gpu_count = 0
    try:
        node_list = kube_parser.parsing_node_gpu_worker_list(node_list)
        for node in node_list:
            is_ready = kube_parser.parsing_node_is_ready(node) # TODO 변경된 방법으로 테스트 필요
            if is_ready:
                resource_dict = kube_parser.parsing_node_resource(node)
                gpu_count += kube_parser.parsing_all_gpu_count(resource_dict)

    except:
        traceback.print_exc()
    return gpu_count

def get_gpu_used_count(pod_list=None, node_list=None):
    if pod_list is None:
        pod_list = kube_data.get_pod_list()

    if node_list is None:
        node_list = kube_data.get_node_list()
    
    gpu_count = 0
    try:
        node_list = kube_parser.parsing_node_gpu_worker_list(node_list)
        for node in node_list:
            is_ready = kube_parser.parsing_node_is_ready(node) # TODO 변경된 방법으로 테스트 필요
            if is_ready:
                node_ip, node_name = kube_parser.parsing_node_ip_and_hostname(node)
                for pod in pod_list.items:
                    if kube_parser.parsing_pod_node_name(pod) == node_name:
                        gpu_count += kube_parser.parsing_pod_gpu_usage_count(pod)
    except:
        traceback.print_exc()
    return gpu_count



def get_node_ip_and_hostname_list(node_list=None):
    """
    Description : Kubernetes에 연결된 node의 ip와 hostname list 제공용

    Args :
        node_list (object) : ex) kube_data.get_node_list()

    Returns :
        (list) : [ {"node_ip": "XXXX", "hostname": "QQQQ"}, .. ]
    """
    if node_list is None:
        node_list = kube_data.get_node_list()
    
    result_list = []
    for node in node_list.items:
        node_ip, hostname = kube_parser.parsing_node_ip_and_hostname(node)
        result_list.append({"node_ip": node_ip, "hostname": hostname})
        
    return result_list

def get_nodes_avaliable_resource_dict(node_list=None, pod_list=None):
    if node_list is None:
        node_list = get_list_node()
    if pod_list is None:
        pod_list = get_list_namespaced_pod()
    

    node_avaliable_resource_info = {}
    for node in node_list.items:
        node_name = kube_parser.parsing_item_name(node)
        resource_dict = kube_parser.parsing_node_resource(node).copy()
        for key, value in resource_dict.items():
            resource_dict[key] = common.convert_unit_num(value=value, target_unit="", return_num=True)
        node_avaliable_resource_info[node_name] = resource_dict
        
    for pod in pod_list.items:
        resource_dict = kube_parser.parsing_pod_container_resource_requests(kube_parser.parsing_pod_containers(pod)[0])
        pod_node_name = kube_parser.parsing_pod_node_name(pod)

        # node_avaliable_resource_info[pod_node_name]
        for resource_key in node_avaliable_resource_info[pod_node_name].keys():
            if resource_dict and resource_dict.get(resource_key):
                node_avaliable_resource_info[pod_node_name][resource_key] -= common.convert_unit_num(value=resource_dict.get(resource_key), target_unit="", return_num=True) #int(resource_dict.get(resource_key))
                node_avaliable_resource_info[pod_node_name]["pods"] -= 1

    return node_avaliable_resource_info





def get_node_gpu_usage_status(pod_list=None, node_list=None, guaranteed_gpu=True):
    node_usage_status = {
        "total": 0,
        "free": 0,
        "used": 0,
    }
    try:
        node_gpu_list = get_select_node_gpu_info_list(pod_list=pod_list, node_list=node_list)
        for node in node_gpu_list:
            if is_no_use_node(node_ip=node["ip"], node_name=node["name"]):
                continue

            node_usage_status["total"] += node["total"] 
            node_usage_status["used"] += node["used"]
            node_usage_status["free"] += node["total"] - node["used"]

        if guaranteed_gpu == False or guaranteed_gpu == 0:
            guaranteed_gpu_usage = get_allocated_gpu_count(pod_list=pod_list, node_list=node_list)
            node_usage_status["free"] -= guaranteed_gpu_usage['alloc_total'] - guaranteed_gpu_usage['alloc_used']
            node_usage_status["used"] += guaranteed_gpu_usage['alloc_total'] - guaranteed_gpu_usage['alloc_used']
        


    except Exception as e:
        node_usage_status = {
            "total": 0,
            "free": 0,
            "used": 0,
        }   
        traceback.print_exc()
    return node_usage_status
    
def get_gpu_model_usage_status(pod_list=None, node_list=None):
    def sort_by_gpu(temp_dict, gpu_model, gpu_memory, gpu_info, total, used, name, gpu_type):
        if temp_dict.get(gpu_model) is None:
            temp_dict[gpu_model] = {
                "total": total,
                "used": used,
                "aval": total - used,
                "type": gpu_type,
                "gpu_info" : gpu_info,
                "node_list": [
                    {
                        "name": name,
                        "model": gpu_model,
                        "memory": gpu_memory,
                        "total": total,
                        "used": used,
                        "aval": total - used,
                    }
                ]
            }
        else :
            temp_dict[gpu_model]["total"] += total
            temp_dict[gpu_model]["used"] += used
            temp_dict[gpu_model]["aval"] += total - used
            temp_dict[gpu_model]["node_list"].append(
                {
                    "name": name,
                    "model": gpu_model,
                    "memory": gpu_memory,
                    "total": total,
                    "used": used,
                    "aval": total - used,
                }
            )

    general_gpu_node_list = get_select_node_gpu_info_list(pod_list=pod_list, node_list=node_list, gpu_mode=GPU_GENERAL_MODE)
    mig_gpu_node_list = get_select_node_gpu_info_list(pod_list=pod_list, node_list=node_list, gpu_mode=GPU_MIG_MODE)

    # gpu_model_status = [
    #     {"model": "GTX 1080", "total": 8, "aval": 3},
    #     {"model": "GTX 960", "total": 5, "aval": 3},
    #     {"model": "GTX 2080", "total": 2, "aval": 3},
    # ]

    [
        {
        'name': 'jf-server-01', 
        'ip': '115.71.28.77', 
        'gpu_model': 'A100-PCIE-40GB', 
        'total': 1, 
        'used': 0, 
        'mig_detail': {
            'nvidia.com/mig-1g.5gb': {'total': 1, 'used': 0}, 
            'nvidia.com/mig-2g.10gb': {'total': 1, 'used': 2}, 
            'nvidia.com/mig-3g.20gb': {'total': 1, 'used': 0}
            }
        }
    ]  

    temp_general_dict = {}
    for node in general_gpu_node_list:
        gpu_model = node["gpu_model"]
        gpu_memory = node["gpu_memory"]
        gpu_info = node["gpu_detail_info"]
        total = node["total"]
        used = node["used"]
        name = node["name"]
        sort_by_gpu(temp_dict=temp_general_dict, gpu_model=gpu_model, gpu_memory=gpu_memory, gpu_info=gpu_info,
                    total=total, used=used, name=name, gpu_type=GPU_GENERAL_MODE)
        
            
    temp_mig_dict = {}
    for node in mig_gpu_node_list:
        gpu_model = node["gpu_model"]
        name = node["name"]
        for k, v in node.get("mig_detail").items():
            if v["total"] == 0:
                continue

            mig_device = gpu_model+ "|" + k.replace(NVIDIA_GPU_BASE_LABEL_KEY,"")
            mig_memory = k.split(".")[-1]
            total = v["total"]
            used = v["used"]
            

            sort_by_gpu(temp_dict=temp_mig_dict, gpu_model=mig_device, gpu_memory=mig_memory, gpu_info={},
                        total=total, used=used, name=name, gpu_type=GPU_MIG_MODE)


    gpu_model_status = [

    ]
    for k, v in temp_general_dict.items():
        v["model"] = k 
        gpu_model_status.append(
            v
        )
    
    for k, v in temp_mig_dict.items():
        v["model"] = k
        gpu_model_status.append(
            v
        )
    
    return gpu_model_status

def get_common_resource_info(resource_info):
    # return {
    #     NODE_CPU_MODEL_KEY: resource_info[NODE_CPU_MODEL_KEY],
    #     NODE_NUM_OF_CPU_CORES_KEY: resource_info[NODE_NUM_OF_CPU_CORES_KEY],
    #     NODE_POD_ALLOC_NUM_OF_CPU_CORES_KEY: resource_info[NODE_POD_ALLOC_NUM_OF_CPU_CORES_KEY],
    #     NODE_POD_ALLOC_CPU_CORES_RATIO_KEY: resource_info[NODE_POD_ALLOC_CPU_CORES_RATIO_KEY],
    #     NODE_POD_ALLOC_REMAINING_NUM_OF_CPU_CORES_KEY: resource_info[NODE_POD_ALLOC_REMAINING_NUM_OF_CPU_CORES_KEY],
    #     NODE_CPU_LIMIT_PER_POD_DB_KEY: resource_info[NODE_CPU_LIMIT_PER_POD_DB_KEY],
    #     NODE_CPU_LIMIT_PER_GPU_DB_KEY: resource_info[NODE_CPU_LIMIT_PER_GPU_DB_KEY],
    #     NODE_MEMORY_SIZE_KEY: resource_info[NODE_MEMORY_SIZE_KEY],
    #     NODE_POD_ALLOC_MEMORY_SIZE_KEY: resource_info[NODE_POD_ALLOC_MEMORY_SIZE_KEY],
    #     NODE_POD_ALLOC_MEMORY_RATIO_KEY: resource_info[NODE_POD_ALLOC_MEMORY_RATIO_KEY],
    #     NODE_POD_ALLOC_REMAINING_MEMORY_SIZE_KEY: resource_info[NODE_POD_ALLOC_REMAINING_MEMORY_SIZE_KEY],
    #     NODE_MEMORY_LIMIT_PER_POD_DB_KEY: resource_info[NODE_MEMORY_LIMIT_PER_POD_DB_KEY],
    #     NODE_MEMORY_LIMIT_PER_GPU_DB_KEY: resource_info[NODE_MEMORY_LIMIT_PER_GPU_DB_KEY],
    #     NODE_IS_CPU_SERVER_KEY: resource_info[NODE_IS_CPU_SERVER_KEY],
    #     NODE_IS_GPU_SERVER_KEY: resource_info[NODE_IS_GPU_SERVER_KEY],
    #     POD_NETWORK_INTERFACE_LABEL_KEY: {
    #         INTERFACE_IB_KEY: resource_info[INTERFACE_IB_KEY],
    #         INTERFACE_10G_KEY: resource_info[INTERFACE_10G_KEY]
    #     },
    #     NODE_CPU_CORE_LOCK_PER_POD_DB_KEY : resource_info[NODE_CPU_CORE_LOCK_PER_POD_DB_KEY],
    #     NODE_CPU_CORE_LOCK_PER_GPU_DB_KEY : resource_info[NODE_CPU_CORE_LOCK_PER_GPU_DB_KEY],
    #     NODE_MEMORY_LOCK_PER_POD_DB_KEY : resource_info[NODE_MEMORY_LOCK_PER_POD_DB_KEY],
    #     NODE_MEMORY_LOCK_PER_GPU_DB_KEY : resource_info[NODE_MEMORY_LOCK_PER_GPU_DB_KEY],
    #     NODE_CPU_CORE_LOCK_PERCENT_PER_POD_DB_KEY : resource_info[NODE_CPU_CORE_LOCK_PERCENT_PER_POD_DB_KEY],
    #     NODE_CPU_CORE_LOCK_PERCENT_PER_GPU_DB_KEY : resource_info[NODE_CPU_CORE_LOCK_PERCENT_PER_GPU_DB_KEY],
    #     NODE_MEMORY_LOCK_PERCENT_PER_POD_DB_KEY : resource_info[NODE_MEMORY_LOCK_PERCENT_PER_POD_DB_KEY],
    #     NODE_MEMORY_LOCK_PERCENT_PER_GPU_DB_KEY : resource_info[NODE_MEMORY_LOCK_PERCENT_PER_GPU_DB_KEY]
    # }
    common_resource_info = {
        POD_NETWORK_INTERFACE_LABEL_KEY: {
            INTERFACE_IB_KEY: resource_info[INTERFACE_IB_KEY],
            INTERFACE_10G_KEY: resource_info[INTERFACE_10G_KEY]
        }
    }
    common_resource_info.update(resource_info)
    return common_resource_info

def get_gpu_model_usage_status_with_other_resource_info(pod_list=None, node_list=None):
    from utils.scheduler import get_pod_queue

    def get_queue_status():
        none_queue_count = 0
        gpu_model_queue = {} #
        # {
        #     "GPU_MODEL": 0
        # }
        gpu_model_node_queue = {}
        # {
        #     "GPU_MODEL-NODE_NAME": 0
        # }
        def update_queue(queue, key):
            if queue.get(key) is None:
                queue[key] = 1
            else:
                queue[key] += 1
                
        for pod_info in get_pod_queue():
            gpu_model_dict = pod_info["gpu_model"]
            gpu_count = pod_info["gpu_count"]
            if gpu_count > 0 :
                if gpu_model_dict is None:
                    none_queue_count += 1
                else :
                    for gpu_model, node_list in gpu_model_dict.items():
                        update_queue(gpu_model_queue, gpu_model)
                        
                        for node in node_list:
                            update_queue(gpu_model_node_queue, "{}-{}".format(gpu_model,node))
        return none_queue_count, gpu_model_queue, gpu_model_node_queue

    def update_queue_count(info, gpu_model, none_queue_count, gpu_model_queue={}, gpu_model_node_queue={}):
        gpu_model_queue_count = 0
        gpu_model_node_queue_count = 0
        if gpu_model_queue.get(gpu_model) is None:
            gpu_model_queue_count = 0
        else :
            gpu_model_queue_count = gpu_model_queue.get(gpu_model)
        
        if gpu_model_node_queue.get(gpu_model) is None:
            gpu_model_node_queue_count = 0
        else :
            gpu_model_node_queue_count = gpu_model_node_queue.get(gpu_model)
        
        info["queue"] = none_queue_count + gpu_model_queue_count + gpu_model_node_queue_count

    gpu_model_usage_status = get_gpu_model_usage_status(pod_list=pod_list, node_list=node_list)
    db_node_list = db.get_node_list()
    node_resource_info_list = get_select_node_resource_info_list(pod_list=pod_list, node_list=node_list, db_node_list=db_node_list, all=True)
    node_resource_info_dict = common.gen_dict_from_list_by_key(node_resource_info_list, "name")
    none_queue_count, gpu_model_queue, gpu_model_node_queue = get_queue_status()

    for gpu_model_info in gpu_model_usage_status:
        # gpu_model + None Case
        update_queue_count(info=gpu_model_info, none_queue_count=none_queue_count, gpu_model=gpu_model_info["model"], gpu_model_queue=gpu_model_queue)

        for i, node in enumerate(gpu_model_info["node_list"]):
            # gpu_model-node + None Case
            # gpu_model_info["node_list"][i]["queue"] = 
            update_queue_count(info=gpu_model_info["node_list"][i], none_queue_count=none_queue_count, gpu_model="{}-{}".format(gpu_model_info["model"], node["name"]), 
                                gpu_model_node_queue=gpu_model_node_queue) 

            resource_info = node_resource_info_dict.get(node["name"])[0]
            gpu_model_info["node_list"][i]["resource_info"] = get_common_resource_info(resource_info=resource_info)

    return gpu_model_usage_status

def get_cpu_model_usage_status_with_other_resource_info(pod_list=None, node_list=None, db_node_list=None):
    def sort_by_cpu(temp_dict, resource_info):
        cpu_model = cpu_node[NODE_CPU_MODEL_KEY]
        cpu_cores = cpu_node[NODE_NUM_OF_CPU_CORES_KEY]

        node_name = cpu_node["name"] #TODO KEY 통일 필요
        if temp_dict.get(cpu_model) is None:
            temp_dict[cpu_model] = {
                NODE_NUM_OF_CPU_CORES_KEY: cpu_cores,
                "node_list": [
                    {
                        NODE_NAME_KEY : node_name,
                        "resource_info": get_common_resource_info(resource_info=resource_info)
                    }
                ]
            }
        else :
            temp_dict[cpu_model]["node_list"].append({
                NODE_NAME_KEY : node_name,
                "resource_info": get_common_resource_info(resource_info=resource_info)
            })
            
    
    cpu_node_list = get_select_node_resource_info_list(pod_list=pod_list, node_list=node_list, db_node_list=db_node_list)
    temp_dict = {}
    for cpu_node in cpu_node_list:
        sort_by_cpu(temp_dict=temp_dict, resource_info=cpu_node)

    cpu_model_status = [

    ]
    for k, v in temp_dict.items():
        v[NODE_CPU_MODEL_KEY] = k 
        cpu_model_status.append(
            v
        )
    
    return cpu_model_status 

def get_workspace_gpu_count(workspace_id=None, pod_list=None, workspace_list=None):
    # all workspaces
    workspaces = {}
    # {
    #     "workspaces": {
    #         "workspace_id" : {
    #             "training_used" : ,
    #             "training_total": ,
    #             "deployment_used" : ,
    #             "deployment_total" : , 
    #         }
    #     }
    # }
    # or workspace_id is not None
    # {
    #     "training_used" : ,
    #     "training_total": ,
    #     "deployment_used" : ,
    #     "deployment_total" : ,  
    # }
    try:
        if workspace_list is None:
            workspace_list = db.get_workspace_list() if workspace_id is None else [ db.get_workspace(workspace_id=workspace_id) ]
        #TODO 
        # elif workspace_list is not None and workspace_id is None:
        #     workspace_list = [ workspace if workspace["id"] == workspace_id for workspace in workspace_list]
        if pod_list is None:
            # pod_list = coreV1Api.list_namespaced_pod(namespace="default")
            pod_list = kube_data.get_pod_list()

        for workspace in workspace_list:
            workspaces[workspace["id"]] = {
                "{}_used".format(TRAINING_TYPE) : 0,
                "{}_total".format(TRAINING_TYPE): workspace["gpu_{}_total".format(TRAINING_TYPE)],
                "{}_used".format(DEPLOYMENT_TYPE) : 0,
                "{}_total".format(DEPLOYMENT_TYPE): workspace["gpu_{}_total".format(DEPLOYMENT_TYPE)]
            }

            find_kuber_item_name_and_item_list = find_kuber_item_name_and_item(workspace_id=workspace["id"], item_list=pod_list)

            for kuber_item in find_kuber_item_name_and_item_list:
                pod = kuber_item["item"]
                pod_labels = kube_parser.parsing_item_labels(pod)
                type_ = kube_parser.parsing_pod_item_type(pod) + "_used"
                num_gpu = kube_parser.parsing_pod_gpu_usage_count(pod)
                pod_workspace_id = int(pod_labels['workspace_id'])
                if workspaces[pod_workspace_id].get(type_) is None:
                    workspaces[pod_workspace_id][type_] = num_gpu
                else:
                    workspaces[pod_workspace_id][type_]  += num_gpu

                # for containers in pod.spec.containers:
                #     if containers.resources.limits is not None and "nvidia.com/gpu" in containers.resources.limits:
                #         num_gpu = int(containers.resources.limits["nvidia.com/gpu"])
                #         type_ = pod.metadata.labels.get("work_type") + "_used"
                #         pod_workspace_id = int(pod.metadata.labels['workspace_id'])
                #         if workspaces[pod_workspace_id].get(type_) is None:
                #             workspaces[pod_workspace_id][type_] = num_gpu
                #         else:
                #             workspaces[pod_workspace_id][type_]  += num_gpu

    except:
        traceback.print_exc()
    return workspaces if workspace_id is None else workspaces.get(workspace_id)


def get_deployment_ingress_path(deployment_id, ingress_list=None, without_reg=True):
    if ingress_list is None:
        ingress_list = get_list_ingress()
    
    api_path = None

    item_list = find_kuber_item_name_and_item(ingress_list, deployment_id=deployment_id)
    for item in item_list:
        api_path = item["item"].spec.rules[0].http.paths[0].path
        if without_reg == True:
            api_path = api_path.replace(INGRESS_PATH_ANNOTAION, "/")
        break

    return api_path

def get_deployment_full_api_address(deployment_id, protocol=INGRESS_PROTOCOL, 
                                    pod_list=None, node_list=None, ingress_service_list=None, ingress_list=None, service_list=None, 
                                    path=None):
    
    if pod_list is None:
        pod_list = kube_data.get_pod_list()
    if node_list is None:
        node_list = kube_data.get_node_list()
    if ingress_service_list is None:
        ingress_service_list = kube_data.get_ingress_service_list()
    if ingress_list is None:
        ingress_list = kube_data.get_ingress_list()
    if service_list is None:
        service_list = kube_data.get_service_list()

    item_list = find_kuber_item_name_and_item(item_list=pod_list, deployment_id=deployment_id)
    if len(item_list) == 0:
        if path is not None:
            #TODO 실행중이지 않는 경우 배포 목록 조회 시 API 어떻게 할 것 인지?
            # 예상 api address (실행중이지 않을 때 )
            server_api_address = "server_api_address:server_port"
            server_api_address = "{protocol}://{server_api_address}/{path}/".format(protocol=protocol, server_api_address=server_api_address, path=path)
            return server_api_address
        else :
            return None
        
    pod = item_list[0]["item"]
    pod_labels = kube_parser.parsing_item_labels(pod)
    node_name = kube_parser.parsing_pod_node_name(pod)

    # node_name = get_pod_node_name(deployment_id=deployment_id, pod_list=pod_list)
    if node_name is None:
        return None
    node_ip = get_node_ip(node_name, external=True, node_list=node_list)
    API_MODE = pod_labels.get(DEPLOYMENT_API_MODE_LABEL_KEY)
    server_api_address = None
    if  API_MODE == DEPLOYMENT_PREFIX_MODE or API_MODE == None:
        nginx_port = get_nginx_port(protocol=protocol, ingress_service_list=ingress_service_list)
        path = get_deployment_ingress_path(deployment_id=deployment_id, ingress_list=ingress_list)
        if EXTERNAL_HOST is None and node_ip is not None:
            server_api_address = "{}:{}".format(node_ip, nginx_port)
        elif EXTERNAL_HOST is not None and EXTERNAL_HOST_REDIRECT != True:
            server_api_address = "{}:{}".format(EXTERNAL_HOST, nginx_port)
        elif EXTERNAL_HOST is not None and EXTERNAL_HOST_REDIRECT == True:
            server_api_address = "{}".format(EXTERNAL_HOST)
        else:
            server_api_address = "{}:{}".format(node_ip, nginx_port)
        

        server_api_address = "{protocol}://{server_api_address}{path}".format(protocol=protocol, server_api_address=server_api_address, path=path)
        if server_api_address[-1] != "/":
            server_api_address = server_api_address + "/"

    elif API_MODE == DEPLOYMENT_PORT_MODE:
        port_info = get_service_port(deployment_id=deployment_id, service_list=service_list)
        deployment_api_port = port_info.get(DEPLOYMENT_API_PORT_NAME)
        if deployment_api_port is None:
            return None
            
        node_port = deployment_api_port.get("node_port")
        path = ""
        if node_port is None:
            return None

        if EXTERNAL_HOST is None and node_ip is not None:
            server_api_address = "{}:{}".format(node_ip, node_port)
        elif EXTERNAL_HOST is not None and EXTERNAL_HOST_REDIRECT != True:
            server_api_address = "{}:{}".format(EXTERNAL_HOST, node_port)
        elif EXTERNAL_HOST is not None and EXTERNAL_HOST_REDIRECT == True:
            server_api_address = "{}:{}".format(EXTERNAL_HOST, node_port)
        else:
            server_api_address = "{}:{}".format(node_ip, node_port)
        

        server_api_address = "{protocol}://{server_api_address}{path}".format(protocol=protocol, server_api_address=server_api_address, path=path)
        if server_api_address[-1] != "/":
            server_api_address = server_api_address + "/"

    return server_api_address


def read_pod(pod_name, namespace="default"):
    try:
        return coreV1Api.read_namespaced_pod(name=pod_name,namespace=namespace)
    except:
        traceback.print_exc()

    return None

def resource_gpu_used_update(pod_list=None, service_list=None, ingress_list=None):
    # 비정상 Pod | 학습 완료 Pod 삭제
    if pod_list is None:
        pod_list = get_list_namespaced_pod()
    if service_list is None:
        service_list = get_list_service()
    if ingress_list is None:
        ingress_list = get_list_ingress()
    # Expired Pod Delete
    kuber_item_remove_expired_pod(pod_list=pod_list, service_list=service_list, ingress_list=ingress_list)
    for pod in pod_list.items:
        if pod.metadata.labels is None:
            continue
        if (("workspace_name" in pod.metadata.labels.keys() and "training_name" in pod.metadata.labels.keys())
            and (pod.metadata.labels.get("training_tool_type") not in JUPYTER_TOOL )) :
            # Jupyter를 제외한
            workspace_name = pod.metadata.labels["workspace_name"]
            training_id = pod.metadata.labels["training_id"]
            training_type = pod.metadata.labels["training_type"]
            training_name = pod.metadata.labels["training_name"]

            if pod.status.phase in ["Succeeded","Failed"]:
                # Training End
                # Succeeded
                # Running
                # Failed = #TODO Evicted (System Error의 경우 Job에 따로 저장해줄 필요 있어보임)
                # remove_result = kuber_item_remove(workspace_name, training_id, training_type, training_name)
                if "job_id" in pod.metadata.labels:
                    job_id = pod.metadata.labels["job_id"]
                    job_remove_result, message = kuber_item_remove(job_id=job_id, work_func_type=CREATE_KUBER_TYPE[0], pod_list=pod_list)
                elif "hps_id" in pod.metadata.labels:
                    hps_id = pod.metadata.labels["hps_id"]
                    hps_remove_result, message = kuber_item_remove(hps_id=hps_id, work_func_type=CREATE_KUBER_TYPE[3])

                continue

            ## Not valid Pod Remove Process
            # try:
            #     user_list = get_user_list()
            #     if user_list is None:
            #         remove_result = kuber_item_remove(workspace_name, training_id, training_type, training_name)
            #         continue

            #     user_name = pod.metadata.labels["user"]
            #     if user_name not in [user['name'] for user in user_list]:
            #         remove_result = kuber_item_remove(workspace_name, training_id, training_type, training_name)
            #         continue

            #     user_id = [user['id'] for user in user_list if user['name'] == user_name][0]
            #     workspaces = get_user_workspace(user_id=user_id)
            #     if workspaces is None or workspace_name not in [workspace['workspace_name'] for workspace in workspaces]:
            #         remove_result = kuber_item_remove(workspace_name, training_id, training_type, training_name)
            # except:
            #     traceback.print_exc()
            #     # kuber_item_remove(workspace_name, training_name)
            #     pass

def get_pod_node_name(pod_list=None, **kwargs):
    if pod_list is None:
        pod_list = get_list_namespaced_pod()

    node_name = None
    try:
        for pod in pod_list.items:
            if pod.metadata.labels is None:
                continue
            if not common.dict_comp(base_dict=kwargs, target_dict=pod.metadata.labels):
                continue
            node_name = kube_parser.parsing_pod_node_name(pod) # pod.spec.node_name
    except:
        pass
        #traceback.print_exc()
    return node_name

def get_service_port(service_list=None, **kwargs):
    """
    서비스 포트 단일 조회용 key value 형태
    return {'ssh': {'node_port': 32532, 'target_port': 22},
            'eee41-e': {'node_port': 32479, 'target_port': 31}}
    """
    if service_list is None:
        service_list = get_list_service()
    service_ports = {}
    try:
        for service in service_list.items:
            if not common.dict_comp(base_dict=kwargs, target_dict=service.metadata.labels):
                continue
            for port in service.spec.ports:
                if port.node_port is None:
                    continue
                service_ports[port.name] = { 'node_port': port.node_port , 'target_port': port.target_port }
    except Exception as e:
        traceback.print_exc()
        pass

    return service_ports

def get_service_port_info_list(service_list=None, **find_options):
    """
    service_list (kube object) : kube.get_list_service() or kube.kube_data.get_service_list()
    **find_options () : 찾고자 하는 아이템 조건. ex) get_service_port_list(training_tool_id=3) or get_service_port_list(training_id=1, tool_type=3)

    서비스 포트 단일 + 전체 조회용 list안에 key value 형태

    # 각 서비스마다 가지고 있는 서비스를 리스트화해서 내려줌
    # 조건에 맞는 결과를 내려주며 어느 아이템으로부터 온 것인진 알려주지 않음
    # 각 서비스마다 name을 가질 수 있기에 return 결과에는 겹치는 name이 존재 가능
    return [
        {'name': 'ssh', 'node_port': 32532, 'port': 22, 'protocol': 'TCP', 'target_port': 22},
        {'name': 'jupyter', 'node_port': None, 'port': 8888, 'protocol': 'TCP', 'target_port': 8888},
        {'name': 'eee41-e', 'node_port': 32479, 'port': 31, 'protocol': 'TCP', 'target_port': 31},
        {'name': 'ssh', 'node_port': 32313, 'port': 22, 'protocol': 'TCP', 'target_port': 22},
    ]
    """
    try:
        if service_list is None:
            service_list = get_list_service()
        
        service_port_list = []
        for service_info in find_kuber_item_name_and_item(item_list=service_list,  **find_options):
            service_port_list += kube_parser.parsing_service_port_list(service_info["item"])
    except Exception as e:
        traceback.print_exc()
    
    return service_port_list

def get_service_node_port_list(service_list=None, **find_options):
    """
    
    Description : 서비스에서 사용중인 node port 단일 + 전체 조회용 list안에 node port 값만 담겨있음

    Args:
        service_list (list(kube_object)) : from kube.get_list_service or kube.kube_data.get_service_list
        **find_options () : 찾고자 하는 아이템 조건. ex) get_service_port_list(training_tool_id=3) or get_service_port_list(training_id=1, tool_type=3)

    Returns: 
        list :  [
            32532,
            32479,
            ..
        ] # 사용중인 포트 리스트
    """
    if service_list is None:
        service_list = get_list_service()

    service_node_port_list = []
    for service_info in find_kuber_item_name_and_item(item_list=service_list,  **find_options):
        for port_info in kube_parser.parsing_service_port_list(service_info["item"]):
            if port_info.get("node_port") is not None:
                service_node_port_list.append(port_info.get("node_port"))
    
    return service_node_port_list

def get_node_ip(node_name, node_list=None, external=False):
    if node_list is None:
        node_list = get_list_node()

    node_ip = None
    try:
        for item in node_list.items:
            match = False
            for address in item.status.addresses:
                if address.type == "InternalIP":
                    node_ip = address.address
                if address.type == "Hostname":
                    if address.address == node_name:
                        match = True
            if match == True:
                break
            else :
                node_ip = None
    except:
        traceback.print_exc()

    if external == True and EXTERNAL_HOST is not None:
        return EXTERNAL_HOST

    return node_ip

def get_node_host_name(ip=None, node_list=None):
    if node_list is None:
        node_list = get_list_node()
    hostname = None
    try:
        for item in node_list.items:
            match = False
            for address in item.status.addresses:
                if address.type == "Hostname":
                    hostname = address.address
                if address.type == "InternalIP":
                    if address.address == ip:
                        match = True
            if match == True:
                break
            else :
                hostname = None
    except:
        traceback.print_exc()
    return hostname

#TODO 2022-01-07 node status 관련 구체화 및 node_status 가 running 인지 아닌지 구분하는 함수 추가 필요
def get_node_status(node_item):
    status = {"status": None, "reason": None, "message": None}
    try:
        for cond in node_item.status.conditions:
            if cond.type == 'Ready':
                status = {"status": cond.status, "reason": cond.reason, "message": cond.message}
    except:
        traceback.print_exc()
        return status
    return status

def get_node_status_list(node_list=None):
    if node_list is None:
        node_list = get_list_node()

    status = {}
    try:
        for node in node_list.items:
            for address in node.status.addresses:
                if address.type == "InternalIP":
                    node_ip = address.address
            for cond in node.status.conditions:
                if cond.type == 'Ready':
                    status[node_ip] = {"status": cond.status, "reason": cond.reason, "message": cond.message}
                    if 'node-role.kubernetes.io/master' in node.metadata.labels:
                        status[node_ip]['is_master'] = True
                    else:
                        status[node_ip]['is_master'] = False
    except:
        traceback.print_exc()
    return status

def get_pod_resource_info(pod_list, **find_options):
    item_list = find_kuber_item_name_and_item(item_list=pod_list, **find_options)
    result = {}
    if len(item_list) < 1:
        return None

    pod_resource = kube_parser.parsing_pod_other_resource(item_list[0]["item"])
    result.update(pod_resource)
    pod_network_interface = kube_parser.parsing_pod_network_interface(item_list[0]["item"])
    result.update(pod_network_interface)
    # {
    #     "cpu":
    #     "memory":
    #     POD_NETWORK_INTERFACE_LABEL_KEY:
    # }    
    return result

def get_pod_cpu_ram_usage_info(pod_list, **find_options):
    item_list = find_kuber_item_name(item_list=pod_list, **find_options)
    if len(item_list) < 1:
        return None

    data = get_pod_cpu_ram_usage_file(item_list[0])

    return data

def get_pod_cpu_ram_usage_history_info(pod_list, **find_options):
    item_list = find_kuber_item_name(item_list=pod_list, **find_options)
    if len(item_list) < 1:
        return None

    data = get_pod_cpu_ram_usage_history_file(item_list[0])

    return data

def get_pod_gpu_usage_info(pod_list, **find_options):
    item_list = find_kuber_item_name(item_list=pod_list, **find_options)
    if len(item_list) < 1:
        return None

    data = get_pod_gpu_usage_file(item_list[0])

    return data    

def get_pod_gpu_usage_history_info(pod_list, **find_options):
    item_list = find_kuber_item_name(item_list=pod_list, **find_options)
    if len(item_list) < 1:
        return None

    data = get_pod_gpu_usage_history_file(item_list[0])

    return data    

def get_pod_network_usage_info(pod_list, **find_options):
    item_list = find_kuber_item_name(item_list=pod_list, **find_options)
    if len(item_list) < 1:
        return None

    data = get_pod_network_usage_file(item_list[0])

    return data

def get_pod_network_usage_history_info(pod_list, **find_options):
    item_list = find_kuber_item_name(item_list=pod_list, **find_options)
    if len(item_list) < 1:
        return None

    data = get_pod_network_usage_history_file(item_list[0])

    return data

class PodAllResourceUsageInfo:
    def __init__(self, **find_options):
        """
            **find_options : pod을 특정하기 위한 옵션.
        """
        if len(find_options) == 0:
            raise Exception("must enter at least one condition.")
        self.pod_name = self.get_pod_name(**find_options)
    
    def get_pod_name(self, **find_options):
        pod_list = kube_data.get_pod_list()
        item_list = find_kuber_item_name(item_list=pod_list, **find_options)
        if len(item_list) < 1:
            raise Exception("Pod Not Found")
        if len(item_list) > 1:
            raise Exception("Multiple Pods exist with the entered option({}).".format(find_options))
        
        return item_list[0]
        
    def get_cpu_ram_usage_info(self):
        return get_pod_cpu_ram_usage_file(pod_name=self.pod_name)
    
    def get_cpu_ram_usage_history_info(self, second=None):
        return self._get_specific_history_by_time(history=get_pod_cpu_ram_usage_history_file(pod_name=self.pod_name), second=second)
    
    def get_gpu_usage_info(self):
        return get_pod_gpu_usage_file(pod_name=self.pod_name)
    
    def get_gpu_usage_history_info(self, second=None):
        return self._get_specific_history_by_time(history=get_pod_gpu_usage_history_file(pod_name=self.pod_name), second=second)
    
    def get_network_usage_info(self):
        return get_pod_network_usage_file(pod_name=self.pod_name)
        
    def get_network_usage_history_info(self, second=None):
        return self._get_specific_history_by_time(history=get_pod_network_usage_history_file(pod_name=self.pod_name), second=second)

    def _get_specific_history_by_time(self, history, second):
        """
            Description : file로 부터 가져온 History 데이터 중 특정 시점 이후의 데이터 정보만 가져오는 함수
                          ex) 10초 전 부터 쌓인 history 데이터들 조회

            Args:
                second (int) : n 초전 부터의 데이터를 가져오기 위한 n 을 값
                              입력받은 second 이후의 데이터들을 내려줌
                              Log Data가 옛날 버전 포맷이라면 history가 찍힌 시점의 정보를 알려주는 timestamp가 없을 수 있는데
                              이 경우에는 인덱스 1개가 1초로 생각하고 [-n:] 만큼의 배열 내려줌
            
            Return:
                (list) - 
        """

        if history is None:
            return None

        if second is None:
            second = 300 # history가 기록하는 최대 길이는 300 (임시 데이터 포함하면 500)

        specific_history = []
        timestamp = time.time() - second
        for data in history:
            if data.get(TIMESTAMP_KEY) is not None:
                if data[TIMESTAMP_KEY] >= timestamp:
                    specific_history.append(data)
            else:
                # log에 timestamp 정보가 없는 경우
                specific_history = history[-second:]

        return specific_history

## POD RESOURCE LOG DATA Func
def get_pod_cpu_ram_usage_file(pod_name):
    try:
        # { "cpu_usage": 4.725 (Per), "mem_usage": 340127744 (Byte) }
        # {'cpu_usage_on_node': 0.773808, 'cpu_usage_on_pod': 0.773808, 'mem_usage': 2401140736, 'mem_limit': 10737418240, 'mem_usage_per': 22.3624, 'timestamp': 1666070127, 'cpu_cores_on_pod': 12}
        resource_data_path = POD_CPU_RAM_RESOURCE_USAGE_RECORD_FILE_PATH_IN_JF_API.format(pod_name=pod_name)
        data=common.load_json_file(file_path=resource_data_path)
        if data !=None:
            data[CPU_USAGE_ON_NODE_KEY] = min(data[CPU_USAGE_ON_NODE_KEY], 100)
            data[CPU_USAGE_ON_POD_KEY] = min(data[CPU_USAGE_ON_POD_KEY], 100)
            return data
        else:
            return POD_RESOURCE_DEFAULT
    except FileNotFoundError:
        return POD_RESOURCE_DEFAULT
    except KeyError:
        return POD_RESOURCE_DEFAULT
    except Exception as e:
        traceback.print_exc()
        return POD_RESOURCE_DEFAULT
    
def get_pod_cpu_ram_usage_history_file(pod_name):
    try:
        # {'cpu_usage_on_node': 0.773808, 'cpu_usage_on_pod': 0.773808, 'mem_usage': 2401140736, 'mem_limit': 10737418240, 'mem_usage_per': 22.3624, 'timestamp': 1666070127, 'cpu_cores_on_pod': 12}
        resource_history_data_path = POD_CPU_RAM_RESOURCE_USAGE_HISTORY_FILE_PATH_IN_JF_API.format(pod_name=pod_name)
        # with open(resource_history_data_path, "r") as f:
        #     resource_history_data = f.readlines()
            # history_data_list = []
            # for data in resource_history_data:
            #     history_data_list.append(json.loads(data))
        resource_history_data = common.load_json_file_to_list(file_path=resource_history_data_path)
        return resource_history_data
    except FileNotFoundError:
        return []
    except json.decoder.JSONDecodeError:
        return []
    except Exception as e:
        traceback.print_exc()
        return []

def get_pod_gpu_usage_file(pod_name):
    def check_recordable(data):
        # MIG 같은 경우에는 사용량 측정을 제대로 할 수 없음
        for gpu_value in data.values():
            try:
                if type(gpu_value) == type(str()):
                    return False
            except Exception as e :
                traceback.print_exc()
                return False
        return True

    # { "0": { "util_gpu": 0, "util_memory": 0, "memory_free": 8643, "memory_used": 2535, "memory_total": 11178, "timestamp": 1664266328 } }
    resource_data_path = POD_GPU_USAGE_RECORD_FILE_PATH_IN_JF_API.format(pod_name=pod_name)
    try:
        data = common.load_json_file(file_path=resource_data_path)
        if data != None:
            for value in data.values():
                if check_recordable(value)==False:
                    value["recordable"]=False
        return data
    except FileNotFoundError:
        return None

def get_pod_gpu_usage_history_file(pod_name):
    try:
        # { "0": { "util_gpu": 0, "util_memory": 0, "memory_free": 8643, "memory_used": 2535, "memory_total": 11178, "timestamp": 1664266328 } }
        resource_data_path = POD_GPU_USAGE_HISTORY_FILE_PATH_IN_JF_API.format(pod_name=pod_name)
        # with open(resource_data_path, "r") as f:
        #     resource_data = f.readlines()
        resource_data = common.load_json_file_to_list(file_path=resource_data_path)
        return resource_data
    except FileNotFoundError:
        # GPU가 없는 경우도 있음.. 그러면 안찍음
        return None

def get_pod_network_usage_file(pod_name):
    # {"tx_bytes":0,"rx_bytes":0}
    resource_data_path = POD_NETWORK_USAGE_RECORD_FILE_PATH_IN_JF_API.format(pod_name=pod_name)
    try:
        data = common.load_json_file(file_path=resource_data_path)
        return data
    except FileNotFoundError:
        return None

def get_pod_network_usage_history_file(pod_name):
    try:
        # {"tx_bytes":0,"rx_bytes":0}
        resource_data_path = POD_NETWORK_USAGE_HISTORY_FILE_PATH_IN_JF_API.format(pod_name=pod_name)
        resource_data = common.load_json_file_to_list(file_path=resource_data_path)
        return resource_data
    except FileNotFoundError:
        return None

def get_pod_count(pod_list, **find_options):
    item_list = find_kuber_item_name(item_list=pod_list, **find_options)
    return len(item_list)


def get_pod_cpu_ram_usage_per_node(pod_list=None):
    """
        Description : Pod 내에서 사용중에 있는 CPU/RAM 사용량 정보를 내려주는 함수
                      CPU - 노드 수준에서의 사용량(%), RAM - 사용량(GB)
    """
    import utils.system as system
    if pod_list is None:
        pod_list = get_list_namespaced_pod()
    pod_usage_per_node = {}
    for pod in pod_list.items:
        try:
            node_name = kube_parser.parsing_pod_node_name(pod)
            pod_name = kube_parser.parsing_pod_name(pod)
            data = get_pod_cpu_ram_usage_file(pod_name)
            cpu_usage = data[CPU_USAGE_ON_NODE_KEY]
            mem_usage = round(data[MEM_USAGE_KEY]/(1000*1000*1000), 2) # MEM_USAGE_KEY
            # cpu_usage = float(system.get_cpu_usage_info_for_pod(pod_name))
            # mem_usage = round(float(system.get_memory_usage_info_for_pod(pod_name))/(1024*1024*1024), 2)
            if pod_usage_per_node.get(node_name) is None:
                pod_usage_per_node[node_name] = {
                    CPU_USAGE_ON_NODE_KEY: cpu_usage, # XX %
                    MEM_USAGE_KEY: mem_usage # XX GB
                }
            else :
                pod_usage_per_node[node_name][CPU_USAGE_ON_NODE_KEY] += cpu_usage
                pod_usage_per_node[node_name][CPU_USAGE_ON_NODE_KEY] = min(pod_usage_per_node[node_name][CPU_USAGE_ON_NODE_KEY], 100)
                pod_usage_per_node[node_name][MEM_USAGE_KEY] += mem_usage
        except KeyError:
            pass
            
        except :
            traceback.print_exc()
            pass

    # print("POD RESOURCE GET TIME ", time.time() - st)
    return pod_usage_per_node

def get_pod_container_commit_info(pod_list=None, **find_options):
    """
    Description :
        Pod Commit용 필요 정보 제공 함수 - container_id, node_ip

    Args :
        pod_list (object) : ex ) from kube.get_pod_list 
        find_options (**{}) : ex ) training_tool_id = 1

    Returns :
        None, None | (str) docker://ced819a7149f194f4173c60a966c2c3ded135eb0bfb9351f41f64dce5ce46019, (str) 192.168.1.12
    """
    if pod_list == None:
        pod_list = get_list_namespaced_pod()

    try:
        pod_item = find_kuber_item_name_and_item(item_list=pod_list, **find_options)
        if len(pod_item) > 0:
            # do
            pod = pod_item[0]["item"]
            container_id = kube_parser.parsing_pod_container_id(pod=pod)
            node_ip = kube_parser.parsing_pod_node_ip(pod=pod)

            return container_id, node_ip
        else :
            return None, None
    except:
        return None, None

def get_pod_gpu_uuid_list_and_node_name(pod_list=None, **find_options):
    import re
    """
        Description : 동작 중 Pod의 GPU UUID 정보 제공

        Args :
            pod_list (object) : ex ) from kube.get_pod_list 
            find_options (**{}) : ex ) deployment_worker_id = 1

        Returns :
            ['GPU-cf812009-a0e0-46fc-ca1d-197390d4aa04',
            'GPU-836d2133-e503-2a3e-20ac-8c041a65509e',
            'MIG-GPU-836d2133-e503-2a3e-20ac-8c041a65509e/1/0',
            'MIG-GPU-836d2133-e503-2a3e-20ac-8c041a65509e/5/0',
            'MIG-GPU-836d2133-e503-2a3e-20ac-8c041a65509e/13/0']
    """
    
    def get_nvidia_smi_output(pod_name):
        # kubectl로 호출해올것인지, pod이 실행할 때 파일로 저장하게 할 것 인지?
        nvidia_smi_output, err = common.launch_on_host(cmd="kubectl exec {pod_name} -- nvidia-smi -L".format(pod_name=pod_name))
        return nvidia_smi_output

    def nvidia_smi_output_uuid_parser(nvidia_smi_output_line: str):
        m = re.search("\(.*\)", nvidia_smi_output_line)
        if m is not None:
            uuid = m.group(0).replace("(","").replace(")","").split(" ")[-1]
        else :
            return None
        return uuid

    def get_nvidia_gpu_uuid_list(nvidia_smi_output):
        gpu_uuid_list = []
        for nvidia_smi_output_line in nvidia_smi_output.split("\n"):
            uuid = nvidia_smi_output_uuid_parser(nvidia_smi_output_line)
            if uuid != "" and uuid != " " and uuid != None:
                gpu_uuid_list.append(uuid)
                
        return gpu_uuid_list


    if pod_list == None:
        pod_list = get_list_namespaced_pod()

    try:
        pod_item = find_kuber_item_name_and_item(item_list=pod_list, **find_options)
        if len(pod_item) > 0:
            # do
            pod = pod_item[0]["item"]
            pod_name = pod_item[0]["name"]

            nvidia_smi_output = get_nvidia_smi_output(pod_name=pod_name)

            gpu_uuid_list = get_nvidia_gpu_uuid_list(nvidia_smi_output=nvidia_smi_output)
            node_name = kube_parser.parsing_pod_node_name(pod=pod)
            
            return gpu_uuid_list, node_name
        else :
            return [], None
    except:
        traceback.print_exc()
        return [], None

def get_pod_logs(pod_list=None, **find_options):
    """
    Description :
        kubectl logs {POD_NAME} 결과 전달

    Args :
        pod_list (object) : ex ) from kube.get_pod_list
        find_options (**{}) : ex ) training_tool_id = 1

    Returns :
        str : kubectl logs {POD_NAME} 출력물
    """
    if pod_list is None:
        pod_list = kube_data.get_pod_list()
    
    match_item_name_list = find_kuber_item_name(item_list=pod_list, **find_options)
    system_log=""
    if len(match_item_name_list)>0:
        cmd = 'kubectl logs {}'.format(match_item_name_list[0])
        system_log, *_ = common.launch_on_host(cmd, ignore_stderr=True)
    else :
        system_log = "Not Found Pod"

    return system_log

def get_pod_list_all_ips(pod_list=None):
    """
        Description : 전체 Pod list (namespace=default) 에서 사용중인 IP들을 가져오는 함수

        Args:
            pod_list (list(Object)) : Pod list에 대한 object kube.kube_data.get_pod_list() 정보

        Return :
            (list) - ["192.168.0.1", "192.168.0.2" ... ]
    """
    if pod_list is None:
        pod_list = kube_data.get_pod_list()

    ips = []
    for pod in pod_list.items:
        ips += kube_parser.parsing_pod_network_ips(pod=pod)
    
    return ips

def get_running_job_group_and_terminating_workspace_list(pod_list=None):
    current_group_numbers = {}
    terminating_workspace_list = []
    if pod_list is None:
        pod_list = get_list_namespaced_pod()
    try:
        for pod in pod_list.items:
            if pod.metadata.labels is not None and ("training_id" in pod.metadata.labels) and ("job_group_number" in pod.metadata.labels):
                if pod.status is None:
                    continue
                if pod.status.container_statuses is None:
                    continue
                for c_state in pod.status.container_statuses:
                    if c_state.state.terminated is None:
                        group_number = "{}-{}".format(pod.metadata.labels.get("training_id"), pod.metadata.labels.get("job_group_number"))
                        if current_group_numbers.get(group_number) is None:
                            current_group_numbers[group_number] = [int(pod.metadata.labels.get("training_index"))]
                        else:
                            current_group_numbers[group_number].append(int(pod.metadata.labels.get("training_index")))
                    else :
                        terminating_workspace_list.append(pod.metadata.labels.get("workspace_name"))
    except:
        traceback.print_exc()
    return current_group_numbers, terminating_workspace_list

#TODO REMOVE
# def create_item_name(pod_name, FLAG=None):
#     item_name = "{}-{}".format(pod_name, FLAG) if FLAG is not None else pod_name
#     return item_name

#TODO REMOVE
# def create_ingress(ingress_name, ingress_path, rewrite_target_path, service_name, service_port_number, labels={}):
#     try:
#         body = {
#             "apiVersion": "extensions/v1beta1",
#             "kind": "Ingress",
#             "metadata": {
#                 "name": ingress_name,
#                 "annotations":{
#                     "kubernetes.io/ingress.class": "nginx",
#                     "nginx.ingress.kubernetes.io/proxy-body-size": "50m", # 없으면 1Mb 이상은 안올라감
#                     "nginx.ingress.kubernetes.io/rewrite-target": rewrite_target_path,
#                     "nginx.ingress.kubernetes.io/ssl-passthrough": "true",
#                     "nginx.ingress.kubernetes.io/backend-protocol": "HTTP",
#                     "nginx.ingress.kubernetes.io/secure-backends": "true"
#                     # "nginx.ingress.kubernetes.io/proxy-max-temp-file-size": "1024m" # Not Working
#                     # "nginx.ingress.kubernetes.io/enable-cors": "true",
#                     # "nginx.ingress.kubernetes.io/cors-allow-methods": "PUT, GET, POST, OPTIONS",
#                     # "nginx.ingress.kubernetes.io/cors-allow-origin": "*",
#                     # "nginx.ingress.kubernetes.io/cors-allow-credentials": "true"
#                 },
#                 "labels": labels
#             },
#             "spec": {
#                 "tls": [{
#                     "secretName": "https-ingress"
#                 }],
#                 "rules": [{
#                     "http": {
#                         "paths": [{
#                             "path": ingress_path,
#                             "backend":{
#                                 "serviceName": service_name,
#                                 "servicePort": service_port_number
#                             }
#                         }
#                         ]
#                     }
#                 }]
#             }
#         }
#         extensV1Api.create_namespaced_ingress(body=body, namespace="default")
#     except:
#         try:
#             delete_ingress(ingress_name)
#             extensV1Api.create_namespaced_ingress(body=body, namespace="default")
#         except:
#             traceback.print_exc()
#             return False
#     return True

def create_flag_service(pod_name, service_name, service_port_type=None, service_port_number=None, labels={}, ports=[], service_type="ClusterIP"):
    # type= "NodePort" (for ssh) , "ClusterIP" (for ingress)
    # JUPYTERFLAG, DEPLOYMENTFLAG, TENSORBOARDFLAG
    if len(ports) == 0 and (service_port_type is None or service_port_number is None):
        return True

    port_list = []
    if len(ports) == 0:
        ports = [{
            "name": service_port_type,
            "port": service_port_number,
            "targetPort": service_port_number
        }]



    labels["pod_name"] = pod_name
    try:
        body = {
            "apiVersion": "v1",
            "kind": "Service",
            "metadata": {
                "name": service_name,
                "labels": labels
            },
            "spec": {
                "selector": {
                    "pod_name": pod_name
                },
                "type": service_type,
                "ports": ports
            }
        }
        coreV1Api.create_namespaced_service(body=body, namespace="default")
    except:
        try:
            delete_service(service_name)
            coreV1Api.create_namespaced_service(body=body, namespace="default")
        except:
            traceback.print_exc()
            return False
    return True

########## trainings/ 폴더 구조
# TYPE : Job
# job-checkpoints/{job_name=job_group}/{job_index}/DATA
# job_logs/{job_id}.jflog
#
# TYPE : HPS
# hps-checkpoints/{hps_name=hps_group}/{hps_index}/DATA
# hps_save_load_files/{hps_name=hps_group}/{data_name}-{hps_index}.json #for save load json
# hps_logs/{} #for log json

# basic / advanced




def gen_built_in_run_code(built_in_model_info):
    run_code = built_in_model_info["training_py_command"]
    if built_in_model_info["checkpoint_save_path_parser"] is not None and built_in_model_info["checkpoint_save_path_parser"] != "":
        run_code += " --{} {} ".format(built_in_model_info["checkpoint_save_path_parser"], JF_TRAINING_CHECKPOINT_ITEM_POD_STATIC_PATH)

    if built_in_model_info["training_num_of_gpu_parser"] is not None and built_in_model_info["training_num_of_gpu_parser"] != "":
        run_code += " --{} {} ".format(built_in_model_info["training_num_of_gpu_parser"], total_gpu)

    return run_code

def get_graph_log_path(log_base, item_id):
    env = [
        {
            "name": "JF_GRAPH_LOG_FILE_PATH",
            "value": "{log_base}/{item_id}.jflog_graph".format(log_base=log_base, item_id=item_id)
        },
        {
            "name": "JF_GRAPH_LOG_BASE_PATH",
            "value": "{log_base}".format(log_base=log_base)
        }
    ]
    return env

#TODO list 사용하는 것은 미리 내려주는
def kuber_item_remove(pod_list=None, service_list=None, ingress_list=None, 
                    no_delete_pod=False, no_delete_service=False, no_delete_ingress=False,
                    **find_options):
    try:
        delete_pod_all_resource(pod_list=pod_list, service_list=service_list, ingress_list=ingress_list,
                                no_delete_pod=no_delete_pod, no_delete_service=no_delete_service, no_delete_ingress=no_delete_ingress,
                                **find_options)

    except Exception as e:
        traceback.print_exc()
        return False, e
    return True, ""

def kuber_item_remove_expired_pod(pod_list=None, service_list=None, ingress_list=None):
    workspaces = db.get_workspace_list()
    for workspace in workspaces:
        start_datetime_ts = date_str_to_timestamp(workspace["start_datetime"])
        end_datetime_ts = date_str_to_timestamp(workspace["end_datetime"])
        cur_ts = time.time()
        if cur_ts < start_datetime_ts or cur_ts > end_datetime_ts:
            #Reserve or Expired
            # delete_pod_all_resource(workspace_id=workspace["id"])
            kuber_item_remove(workspace_id=workspace["id"], pod_list=pod_list, service_list=service_list, ingress_list=ingress_list)

def delete_pod(pod_name, namespace="default"):
    try:
        coreV1Api.delete_namespaced_pod(name=pod_name, namespace="default")
    except:
        traceback.print_exc()
        pass

def delete_service(service_name, namespace="default"):
    try:
        coreV1Api.delete_namespaced_service(name=service_name, namespace='default')
    except:
        traceback.print_exc()

def delete_ingress(ingress_name, namespace="default"):
    try:
        extensV1Api.delete_namespaced_ingress(name=ingress_name, namespace=namespace)
    except:
        traceback.print_exc()
        pass

def delete_node(node_name):
    node_name = node_name.lower()
    try:
        coreV1Api.delete_node(name=node_name)
    except Exception as e:
        traceback.print_exc()
        raise e

def delete_pod_all_resource(pod_list=None, service_list=None, ingress_list=None, 
                            no_delete_pod=False, no_delete_service=False, no_delete_ingress=False,
                            **find_options):
    if LOGIN_METHOD == "jonathan":
        from jonathan_platform import pod_end
    else :
        from pod import pod_end
        
    if pod_list is None:
        pod_list = get_list_namespaced_pod()
    if service_list is None:
        service_list = get_list_service()
    if ingress_list is None:
        ingress_list = get_list_ingress()

    try:
        if no_delete_pod == False:
            for item in find_kuber_item_name_and_item(pod_list, **find_options):
                delete_pod(pod_name=item["name"])
                pod_end(item["item"])
    except:
        traceback.print_exc()
        pass
    try:
        if no_delete_service == False:
            for item in find_kuber_item_name_and_item(service_list, **find_options):
                delete_service(service_name=item["name"])
    except:
        traceback.print_exc()
        pass
    try:
        if no_delete_ingress == False:
            for item in find_kuber_item_name_and_item(ingress_list, **find_options):
                delete_ingress(ingress_name=item["name"])
    except:
        traceback.print_exc()
        pass

def delete_service_training_tool(training_tool_id, namespace="default"):
    service_name_list = get_training_tool_item_service_list(training_tool_id=training_tool_id)
    for service_name in service_name_list:
        delete_service(service_name=service_name)

def label_compare(label, check_key_exist=False, **find_options):
    match = True
    for k, v in find_options.items():
        # print(label)
        # print("COMP " , k, label.get(k), str(v))
        if type(v) == type([]):
            # param1=["A","B","C"]
            # label.param1 = A or B or C
            if label.get(k) in v:
                continue
                
        if v == None and check_key_exist == False:
            if label.get(k) == v:
                continue

        if label.get(k) != str(v):
            if label.get(k) is None and v == False:
                continue
            match = False
            break
    return match

def find_kuber_item_name(item_list, **find_options):
    def k8s_type(item_list, **find_options):
        match_item_name_list = []
        for item in item_list.items:
            if item.metadata.labels is not None:
                item_labels = item.metadata.labels
                if label_compare(label=item_labels, **find_options):
                    match_item_name_list.append(item.metadata.name)
        return match_item_name_list

    def json_type(item_list, **find_options):
        match_item_name_list = []
        for item in item_list["items"]:
            if item["metadata"].get("labels") is not None:
                item_labels = item["metadata"]["labels"]
                if label_compare(label=item_labels, **find_options):
                    match_item_name_list.append(item["metadata"]["name"])
        return match_item_name_list
    
    if type(item_list) == type(dict()):
        return json_type(item_list=item_list, **find_options)
    else :
        return k8s_type(item_list=item_list, **find_options)

def find_kuber_item_name_and_item(item_list, **find_options):
    """
    Description: item list 에 있는 item 들의 labels와 일치하는 item name + item (object)를 내려주는 함수

    Args :
        item_list (object): pod_list, service_list, ingress_list ...
        find_options (): ex)   find_kuber_item_name_and_item(item_id=3, tool_type="jupyter" ...)

    Returns :
        (list (dict)) : [{"name": ... , "item": (kube object) }]
    """
    def k8s_type(item_list, **find_options):
        match_item_name_list = []
        for item in item_list.items:
            if item.metadata.labels is not None:
                item_labels = item.metadata.labels
                if label_compare(label=item_labels, **find_options):
                    match_item_name_list.append({"name": item.metadata.name, "item": item})
        return match_item_name_list

    def json_type(item_list, **find_options):
        match_item_name_list = []
        for item in item_list["items"]:
            if item["metadata"].get("labels") is not None:
                item_labels = item["metadata"]["labels"]
                if label_compare(label=item_labels, **find_options):
                    match_item_name_list.append({"name": item["metadata"]["name"], "item": item})
        return match_item_name_list
    
    if type(item_list) == type(dict()):
        return json_type(item_list=item_list, **find_options)
    else :
        return k8s_type(item_list=item_list, **find_options)


def get_training_mpi_port(pod_list=None):
    if pod_list is None:
        pod_list = get_list_namespaced_pod()
    port = 29000
    port_list = []
    try:

        for pod in pod_list.items:
            if  pod.metadata.labels is None:
                continue
            if "training_mpi_port" in pod.metadata.labels:
                port_list.append(int(pod.metadata.labels['training_mpi_port']))

        port_list.sort()
        for pod_port in port_list:
            if port == pod_port:
                port += 1
            else:
                break
    except:
        traceback.print_exc()
    return port

def get_item_port_list(service_item_list):
    service_port_list = []
    for service_item in service_item_list:
        service_item_info = service_item["item"]
        service_port_list += kube_parser.parsing_service_port_list(service_item_info)
    return service_port_list
    
def get_training_tool_item_port_list(training_tool_id, service_list=None):
    if service_list is None:
        service_list = get_list_service()
    
    service_item_list = find_kuber_item_name_and_item(item_list=service_list, training_tool_id=training_tool_id)
    service_port_list = get_item_port_list(service_item_list)

    return service_port_list


def get_training_tool_item_service_list(training_tool_id, service_list=None):
    if service_list is None:
        service_list = get_list_service()
    
    service_name_list = find_kuber_item_name(item_list=service_list, training_tool_id=training_tool_id)
    return service_name_list

def get_pod_item_labels(pod_list=None, get_mode="one", **kwargs):
    """
    get_mode = "one" | "all"
    if get_mode = "one" --> return { first item ...}  (only one item)
    if get_mode = "all" --> return [{ first item ...}, { second item ...} ] 
    """
    if pod_list is None:
        pod_list = get_list_namespaced_pod()

    pod_item_list = find_kuber_item_name_and_item(item_list=pod_list, **kwargs)
    if get_mode == "one":
        if len(pod_item_list) == 0:
            return {}
        else:
            return kube_parser.parsing_item_labels(pod_item_list[0]["item"])
    elif get_mode == "all":
        if len(pod_item_list) == 0:
            return [{}]
        else:
            labels_list =[]
            for i in range(len(pod_item_list)):
                labels_list.append(kube_parser.parsing_item_labels(pod_item_list[i]["item"]))
            return labels_list

def get_training_tool_item_labels(training_tool_id, pod_list=None):
    if pod_list is None:
        pod_list = get_list_namespaced_pod()
        
    pod_item_list = find_kuber_item_name_and_item(item_list=pod_list, training_tool_id=training_tool_id)
    
    if len(pod_item_list) == 0:
        return {}
    
    else:
        return kube_parser.parsing_item_labels(pod_item_list[0]["item"])

def get_deployment_item_labels(deployment_id, get_mode="one", pod_list=None):
    get_deployment_item_labels.__doc__ = get_pod_item_labels.__doc__
    return get_pod_item_labels(pod_list=pod_list, get_mode=get_mode, deployment_id=deployment_id)


def get_item_log_base_path(workspace_name, training_name, item_type):
    default_log_path = ""
    if item_type == TRAINING_ITEM_A:
        default_log_path = JF_TRAINING_JOB_LOG_DIR_NAME
    elif item_type == TRAINING_ITEM_C:
        default_log_path = JF_TRAINING_HPS_LOG_DIR_NAME

    
    return "{}/{}/{}/{}/{}".format(JF_WS_DIR, workspace_name, TRAINING_TYPE_DIR, training_name, default_log_path)


def get_item_checkpoints_base_path(workspace_name, training_name, host=False, item_type=TRAINING_ITEM_A):
    # NEW CHECKPOINT BASE
    default_checkpoint_path_volume = JF_TRAINING_JOB_CHECKPOINT_BASE_DIR_NAME
    if item_type == TRAINING_ITEM_A:
        default_checkpoint_path_volume = JF_TRAINING_JOB_CHECKPOINT_BASE_DIR_NAME
    elif item_type == TRAINING_ITEM_C:
        default_checkpoint_path_volume = JF_TRAINING_HPS_CHECKPOINT_BASE_DIR_NAME

    if host == True:
        return "/jfbcore/{}/{}/{}/{}/{}".format(JF_WS_DIR, workspace_name, TRAINING_TYPE_DIR, training_name, default_checkpoint_path_volume)
    else :
        return "{}/{}/{}/{}/{}".format(JF_WS_DIR, workspace_name, TRAINING_TYPE_DIR, training_name, default_checkpoint_path_volume)

def get_hps_save_load_file_base_path(workspace_name, training_name, host=False):
    if host == True:
        return "/jfbcore/{}/{}/{}/{}/{}".format(JF_WS_DIR, workspace_name, TRAINING_TYPE_DIR, training_name, JF_TRAINING_HPS_SAVE_LOAD_FILE_DIR_NAME)
    else :
        return "{}/{}/{}/{}/{}".format(JF_WS_DIR, workspace_name, TRAINING_TYPE_DIR, training_name, JF_TRAINING_HPS_SAVE_LOAD_FILE_DIR_NAME)

def get_pod_configuration(pod_name):
    gpu_config = None
    cpu_config = None
    try:
        # Get GPU
        gpu_config = common.get_pod_gpu_list(pod_name)

        # Get CPU
        cpu_config = common.get_pod_cpu_model_name(pod_name)
    except:
        traceback.print_exc()
        pass
    return gpu_config, cpu_config


    
def get_node_labels(node_name=None, node_ip=None, node_list=None):
    if node_list is None:
        node_list = get_list_node()
    
    for node in node_list.items:
        for address in node.status.addresses:
            if address.address in [node_name, node_ip]:
                labels = {}
                if node.metadata.labels is None:
                    return {}
                for k, v in node.metadata.labels.items():
                    if "kubernetes.io" not in k:
                        labels[k] = v
                return labels


def set_node_labels(node_name, labels={}, reset=False):
    for k, v in labels.items():
        if v is not None:
            labels[k] = common.str_simple_converter(str(v))
    
    node_name = node_name.lower()

    if reset == True:
        node_labels = get_node_labels(node_name=node_name)
        for k, v in node_labels.items():
            node_labels[k] = None
        
        node_labels.update(labels)
        labels = node_labels

    body = {
        "metadata": {
            "labels": labels
        }  
    }
    try:
        coreV1Api.patch_node(name=node_name, body=body)
    except:
        traceback.print_exc()
        print("Set Node Label {} SKIP !".format(node_name))


# def get_pod_lables()


# def set_pod_labels(pod_name, lables={}, namespace="default"):
#     for k, v in labels.items():
#         if v is not None:
#             labels[k] = common.str_simple_converter(str(v))
#     body = {
#         "metadata": {
#             "labels": labels
#         }  
#     }
#     coreV1Api.patch_namespaced_pod(name=node_name, namespace=namespace, body=body)


# labels = {
#     'a':"31rog"
# }
# set_node_labels(node_name="jf-node-06", labels=labels, reset=True)


