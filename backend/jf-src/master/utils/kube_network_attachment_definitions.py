import json
import traceback
from TYPE import * 
import requests
import utils.kube as kube 
import utils.kube_parser as kube_parser
import utils.db as db
import os
import sys
sys.path.insert(0, os.path.abspath('..'))
import settings
#https://docs.okd.io/latest/rest_api/network_apis/networkattachmentdefinition-k8s-cni-cncf-io-v1.html#networkattachmentdefinition-k8s-cni-cncf-io-v1


APISERVER=kube.kube_data.get_apiserver_addr()
NAD_ENDPOINT1="/apis/k8s.cni.cncf.io/v1/namespaces/{namespace}/network-attachment-definitions" # GET LIST, POST
NAD_ENDPOINT2="/apis/k8s.cni.cncf.io/v1/namespaces/{namespace}/network-attachment-definitions/{name}" # UPDATE, PATCH


TOKEN=kube.kube_data.get_token()

NAD_LABEL_NETWORK_GROUP_ID_KEY = "network_group_id"
NAD_LABEL_NETWORK_GROUP_NAME_KEY= "network_group_name"
NAD_LABEL_NETWORK_GROUP_CONTAINER_INTERFACE_ID_KEY = "container_interface_id"
NAD_LABEL_CONTAINER_INTERFACE_KEY = "container_interface"
NAD_LABEL_NODE_INTERFACE_KEY = "node_interface"
NAD_LABEL_CONTROLL_VERSION_KEY = "nad_controll_version"

NAD_CONTROLL_VERSION = "0.1" # 일치하지 않으면 삭제 하고 재생성 + 실행에 사용하지 않음

def network_attachment_definitions_response_check(response):
    """
        Description : API Call 시 Response의 status code가 200 이 아닌 경우 경고 표시

        Args :
            response (Response) : Response Object
    """
    try:
        if response.status_code != 200:
            print("Network Attachment Definitions API Call Warining - ", response.json())
    except Exception as e:
        traceback.print_exc()

def get_list_network_attachment_definition(namespace="default"):    
    headers = {"Authorization": "Bearer {TOKEN}".format(TOKEN=TOKEN)}
    END_POINT = NAD_ENDPOINT1.format(namespace=namespace)
    r = requests.get(APISERVER+END_POINT, headers=headers, verify=False)
    try:
        network_attachment_definitions_response_check(response=r)
        return r.json()
    except Exception as e:
        traceback.print_exc()

def create_network_attachment_definition(body, namespace="default"):
    # type(body) = dict()
    headers = {'Content-Type': 'application/json; charset=utf-8', "Authorization": "Bearer {TOKEN}".format(TOKEN=TOKEN)}
    body = json.dumps(body)
    END_POINT = NAD_ENDPOINT1.format(namespace=namespace)

    try:
        r = requests.post(APISERVER+END_POINT, headers=headers, verify=False, data=body)
        network_attachment_definitions_response_check(response=r)
        return r.json()
    except Exception as e:
        traceback.print_exc()

def patch_network_attachment_definition(name, body, namespace="default"):
    headers = {'Content-Type': 'application/json-patch+json; charset=utf-8', "Authorization": "Bearer {TOKEN}".format(TOKEN=TOKEN)}
    END_POINT = NAD_ENDPOINT2.format(name=name, namespace=namespace)
    path_body = [ {"op": "replace", "path":"/{}".format(k), "value": v } for k, v in body.items() if k != "metadata"] # metadata는 update에서만 가능함(?)
    path_body += [ {"op": "replace", "path":"/metadata/{}".format(k), "value": v } for k, v in body["metadata"].items() ] # For label 변경 케이스
    body = json.dumps(path_body)
    try:
        r = requests.patch(APISERVER+END_POINT, headers=headers, verify=False, data=body)
        network_attachment_definitions_response_check(response=r)
        return r.json()
    except Exception as e:
        traceback.print_exc()

def delete_network_attachment_definition(name, namespace="default"):
    headers = {"Authorization": "Bearer {TOKEN}".format(TOKEN=TOKEN)}
    END_POINT = NAD_ENDPOINT2.format(name=name, namespace=namespace)
    try:
        r = requests.delete(APISERVER+END_POINT, headers=headers, verify=False)
        network_attachment_definitions_response_check(response=r)
        return r.json()
    except Exception as e:
        traceback.print_exc()

def get_network_attachment_definitions_annotations_for_pod_annotations(node_name, kube_resource_limits):
    from network_cni import get_network_cni_config_ip_info, get_available_address

    def is_nad_controll_version(labels):
        if labels.get(NAD_LABEL_CONTROLL_VERSION_KEY) == NAD_CONTROLL_VERSION:
            return True
        return False

    def is_infiniband(labels):
        if labels.get(NAD_NETWORK_GROUP_CATEGORY_KEY) == NETWORK_GROUP_CATEGORY_INFINIBAND:
            return True
        return False

    annotation = {}
    if settings.KUBER_NETWORK_ATTACHMENT_DEFINITION_USE != True:
        return annotation

    nad_list = get_list_network_attachment_definition()
    node_list =  kube.get_list_node()
    nad_item_list = kube.find_kuber_item_name_and_item(item_list=nad_list, node_name=node_name)

    networks = [] # [{"nad_name": macvlan , "interface_name": net10g netib}]
    for item_info in nad_item_list:
        item_name = item_info["name"]
        nad = item_info["item"]
        labels = kube_parser.parsing_item_labels(nad)
        
        network_ib_resource_key = kube_parser.parsing_network_attachment_definition_annotations_resource_name(nad=nad)
        if labels is not None:
            if is_nad_controll_version(labels=labels):
                interface = labels.get(NAD_LABEL_CONTAINER_INTERFACE_KEY)
                if is_infiniband(labels=labels):
                    # Infiniband Case
                    # 1. Node에 정말로 관련된 resource가 있는지 확인
                    # 2. 안쓰고 있는 IP 할당

                    # Resource 확인
                    value = kube_resource_limits.get(network_ib_resource_key)
                    if value is not None and int(value) > 0:
                        pass
                    else:
                        continue

                    # IP 확인 및 직접 할당
                    cni_config = kube_parser.parsing_network_attachment_definition_config(nad=nad)
                    _, ip_start, ip_end, gateway = get_network_cni_config_ip_info(cni_config=cni_config)
                    used_ips = kube.get_pod_list_all_ips()
                    used_ips += [ gateway ] # Infiniband의 경우 gateway 주소를 쓰면 오류 발생
                    ip = get_available_address(start_address=ip_start, end_address=ip_end, used_ips=used_ips)

                    networks.append({
                        "name": item_name,
                        "interface": interface,
                        "ips": [ip]
                    })

                else :
                    # Ethernet Case
                    pass

                    networks.append({
                        "name": item_name,
                        "interface": interface
                    })
    
    if len(networks) > 0 :
        annotation = {
            K8S_ANNOTAION_NAD_NETWORKS_KEY: json.dumps(networks)
        }

    return annotation

## Network Group 기반 NAD
def get_network_attachment_definitions_name(network_group_category, node_id, network_group_id, container_interface_id):
    nad_name = "{network_group_category}-{node_id}-{network_group_id}-{container_interface_id}".format(
        network_group_category=network_group_category, node_id=node_id, network_group_id=network_group_id,
        container_interface_id=container_interface_id
    )
    return nad_name.lower()

def get_network_attachment_definitions_labels(network_group_category, network_group_id, network_group_name, container_interface_id, container_interface, 
                                            node_interface, node_name, node_id):
    return {
        NAD_NETWORK_GROUP_CATEGORY_KEY: str(network_group_category),
        NAD_LABEL_NETWORK_GROUP_ID_KEY: str(network_group_id),
        NAD_LABEL_NETWORK_GROUP_NAME_KEY: network_group_name,
        NAD_LABEL_NETWORK_GROUP_CONTAINER_INTERFACE_ID_KEY: str(container_interface_id),
        NAD_LABEL_CONTAINER_INTERFACE_KEY: container_interface,
        NAD_LABEL_NODE_INTERFACE_KEY: node_interface,
        NAD_LABEL_CONTROLL_VERSION_KEY: NAD_CONTROLL_VERSION,
        "node_name": node_name,
        "node_id": str(node_id)
    }

def get_network_attachment_definitions_body_for_ethernet(nad_name, nad_labels, cni_config, node_interface, **kwargs):
    # FOR 1G ~ nG (no Infiniband) 
    
    # TODO cni_config가 FB 기본 값인지 확인 로직 필요함
    cni_config["master"] = node_interface

    body = {
      "apiVersion": "k8s.cni.cncf.io/v1",
      "kind": "NetworkAttachmentDefinition",
      "metadata": {
        "name": nad_name,
        "labels": nad_labels
      },
      "spec": {
        "config": json.dumps(cni_config)
      }
    }    
    return body

def get_network_attachment_definitions_body_for_infiniband(nad_name, nad_labels, cni_config, node_interface, network_group_index, **kwargs):
    def update_cni_config_ipam(cni_config, network_group_index):
        def update_range(ipam_config, key, network_group_index):
            range_temp = ipam_config[key].split(".")
            range_temp[2] = str(network_group_index)
            ipam_config[key] = ".".join(range_temp)

        update_range(ipam_config=cni_config["ipam"], key="rangeStart", network_group_index=network_group_index)
        update_range(ipam_config=cni_config["ipam"], key="rangeEnd", network_group_index=network_group_index)


    # update_cni_config_ipam(cni_config=cni_config, network_group_index=network_group_index)

    # FOR 1G ~ nG (no Infiniband)
    body = {
      "apiVersion": "k8s.cni.cncf.io/v1",
      "kind": "NetworkAttachmentDefinition",
      "metadata": {
        "name": nad_name,
        "annotations": {
            K8S_ANNOTAION_NAD_RESOURCE_NAME_KEY: K8S_RESOURCE_NETWORK_IB_LABEL_KEY.format(ib_interface=node_interface) # "jf/{node_interface}".format(node_interface=node_interface)
        },
        "labels": nad_labels
      },
      "spec": {
        "config": json.dumps(cni_config)
      }
    }    
    return body

def update_network_attachment_definitions():
    def nad_update(node_id, node_ip, node_name, container_interface_id, container_interface, node_interface, network_group_id, 
                    network_group_name, network_group_category, cni_config, nad_list, network_group_index):

        item_list = kube.find_kuber_item_name_and_item(item_list=nad_list, network_group_id=network_group_id, node_id=node_id, container_interface_id=container_interface_id)

        if network_group_category == NETWORK_GROUP_CATEGORY_INFINIBAND:
            # Infiniband 설정
            get_network_attachment_definitions_body = get_network_attachment_definitions_body_for_infiniband

        elif network_group_category == NETWORK_GROUP_CATEGORY_ETHERNET:
            get_network_attachment_definitions_body = get_network_attachment_definitions_body_for_ethernet

        nad_name = get_network_attachment_definitions_name(network_group_category=network_group_category, node_id=node_id, network_group_id=network_group_id, container_interface_id=container_interface_id)
        nad_labels = get_network_attachment_definitions_labels(network_group_category=network_group_category, network_group_id=network_group_id, network_group_name=network_group_name, 
                                                            container_interface_id=container_interface_id, container_interface=container_interface, node_interface=node_interface, node_name=node_name, node_id=node_id)


        nad_body = get_network_attachment_definitions_body(nad_name=nad_name, nad_labels=nad_labels, cni_config=cni_config, node_interface=node_interface, network_group_index=network_group_index)        

        if len(item_list) == 0:
            # 생성
            print(create_network_attachment_definition(body=nad_body))
        elif len(item_list) > 1:
            # 특정 네트워크 그룹에 같은 노드의 인터페이스가 2개 이상 존재하는 경우가 발생 ?
            pass
        else :
            # 수정

            # 수정 가능 사항
            # Ethernet 
            #   - range
            #   - range_start
            #   - range_end
            #   - interface
            # Infiniband
            #   - range
            #   - range_start
            #   - range_end
            #   - gateway ? (gateway를 사용하지 않아도 괜찮은지 테스트 필요함)
            nad_name = item_list[0]["name"]
            patch_network_attachment_definition(name=nad_name, body=nad_body)

    def nad_delete(nad_name, nad_labels, network_cni_list):
        db_exist = False

        nad_node_id = nad_labels.get("node_id")
        nad_network_group_id = nad_labels.get("network_group_id")
        nad_container_interface_id = nad_labels.get("container_interface_id")
        
        # namespace를 default를 쓰면서 JF가 아닌 다른곳에 의해서 쓰여진 NAD를 삭제 방지하기 위해서 labels에서 필요로 하는 ID가 있는 경우에만 진행
        # 고도화 필요할 수 있음
        if nad_node_id is not None and nad_network_group_id is not None and nad_container_interface_id is not None:
            for cni_info in network_cni_list:
                node_id = cni_info["node_id"]
                network_group_id = cni_info["network_group_id"]
                container_interface_id = cni_info["container_interface_id"]
                if int(nad_node_id) == node_id and int(nad_network_group_id) == network_group_id and int(nad_container_interface_id) == container_interface_id:
                    db_exist = True
                    break
            
            if db_exist == False:
                delete_network_attachment_definition(name=nad_name)

    if settings.KUBER_NETWORK_ATTACHMENT_DEFINITION_USE != True:
        print("Not active. KUBER_NETWORK_ATTACHMENT_DEFINITION_USE = {}".format(settings.KUBER_NETWORK_ATTACHMENT_DEFINITION_USE))
        return 0

    try:
        network_cni_list = db.get_network_group_cni_list_for_nad()
        nad_list = get_list_network_attachment_definition()

        # TODO IP 직접 할당하는 기능 테스트가 완료 시 해당 부분 제거 (2022-12-20 Yeobie)
        network_group_index_dict = {} # 네트워크 그룹에서 몇번째 데이터인지 - infiniband 대응을 위함
                                      # TODO - 그룹에서 Node가 삭제 될 경우 번호가 하나씩 밀릴 수 있음 0 ~ 255 사이에 고유한 값을 가질 수 있도록 기능 고도화 필요
                                      # ex) 최초 등록 시 0 ~ 255 중 하나의 값을 가져가서 label에 등록 및 실제 자기 대역으로 사용
                                      #     그 추가 등록 시 0 ~ 255 중 안쓰고 있는 값을 가져가 label에 등록 및 자기 대역으로 사용
                                      #     수정 시 자기가 쓰고 있던 대역 유지
                                      #     삭제 시 0 ~ 255 검색 중 자동으로 사용할 수 있는 대역으로 표시될 수 있음 

        for cni_info in network_cni_list:
            node_id = cni_info["node_id"]
            node_name = cni_info["node_name"].lower()
            node_ip = cni_info["node_ip"]
            network_group_id = cni_info["network_group_id"]
            network_group_name = cni_info["network_group_name"]
            network_group_category = cni_info["network_group_category"]
            cni_config = cni_info["cni_config"]
            node_interface = cni_info["node_interface"]
            container_interface_id = cni_info["container_interface_id"]
            container_interface = cni_info["container_interface"]

            if network_group_index_dict.get(network_group_id) is None:
                network_group_index_dict[network_group_id] = 0

            network_group_index_dict[network_group_id] += 1
            nad_update(node_id=node_id, node_ip=node_ip, node_name=node_name, container_interface_id=container_interface_id, container_interface=container_interface, 
                        node_interface=node_interface, network_group_id=network_group_id, network_group_name=network_group_name, network_group_category=network_group_category, cni_config=cni_config, nad_list=nad_list, network_group_index=network_group_index_dict[network_group_id])
                
            
            # nad에 존재하고 db에 없는 인터페이스 확인하는 로직 필요함

        for nad in nad_list["items"]:
            nad_name = kube_parser.parsing_item_name(item=nad)
            nad_labels = kube_parser.parsing_item_labels(item=nad)
            nad_delete(nad_name=nad_name, nad_labels=nad_labels, network_cni_list=network_cni_list)


    except Exception as e:
        traceback.print_exc()

# VF 한정적인 문제
# 1. 선택 자동화.. CPU (GPU=0) 사용 시 VF 못가져가게
# 2. 옵션 (사용하냐 안하냐 - GPU CASE = Default (사용) CPU CASE = Default (미사용) )
# 3. 선착순 

# ## SRIOV SETTING


# def get_sriovdp_configMap_config_json(resourcePrefix=None, resourceName=None, selectors=None):
#     if resourcePrefix is None:
#         resourcePrefix = IB_RESOURCE_LABEL_KEY.split("/")[0]
#     if resourceName is None:
#         resourceName = IB_RESOURCE_LABEL_KEY.split("/")[1]
#     # selectors = {
#     #         "vendors": ["15b3"],
#     #         "devices": ["101a"]
#     #     }
#     config_json = {
#         "resourceList": [
#             {
#                 "resourceName": resourceName,
#                 "resourcePrefix": resourcePrefix,
#                 "selectors": selectors
#             }
#         ]
#     }
#     return config_json

# def get_sriovdp_configMap_body(selectors):
#     body = {
#         "apiVersion": "v1",
#         "kind": "ConfigMap",
#         "metadata": {
#             "name": "sriovdp-config",
#             "namespace": "kube-system"
#         },
#         "data": {
#             "config.json":  json.dumps(get_sriovdp_configMap_config_json(selectors=selectors))
#         }
#     }
#     return body