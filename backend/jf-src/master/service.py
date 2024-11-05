from restplus import api
from flask_restplus import reqparse
from utils.resource import CustomResource, response, token_checker
import utils.kube as kube
from utils.kube import kube_data
import utils.db as db
from TYPE import DEPLOYMENT_TYPE, DEPLOYMENT_TYPE_A, DEPLOYMENT_TYPE_B, DEPLOYMENT_TYPE_C, DEPLOYMENT_TYPES
from TYPE import *
from utils.exceptions import *
from utils.access_check import workspace_access_check
from deployment import get_error_log

import random
import settings
import traceback

DEPLOYMENT_FLAG = kube.DEPLOYMENT_FLAG
INGRESS_PROTOCOL = settings.INGRESS_PROTOCOL
ns = api.namespace('services', description='service 정보 관련 API')

parser = reqparse.RequestParser()

services_get_parser = api.parser()
services_get_parser.add_argument('workspace_id', required=False, default=None, type=int, location='args', help='workspace id')
services_get_parser.add_argument('training_id', required=False, default=None, type=int, location='args', help='training id (트레이닝 페이지 내에서 조회하는 경우)')

service_get_parser = api.parser()
service_get_parser.add_argument('protocol', required=False, default=INGRESS_PROTOCOL, type=str, location='args', help='front protocol =? http or https')

# 템플릿 적용
def get_services(workspace_id, training_id):
    #TODO get service list 할 때 workspace_id를 파라미터로 받고, example은 받아오는 식으로 변경 필요
    service_list = db.get_service_list(workspace_id=workspace_id, training_id=training_id)
    # print(service_list)
    # result = {"example_services": [], "deployment_services": [] }
    service_item_list = []
    #status = ["active","error","stop"]
    pod_list = kube_data.get_pod_list()

    active_service_list = []
    other_service_list = []

    for service in service_list:
        if service["type"] != "example" and workspace_id != service["workspace_id"]:
            continue
        if service["input_type"] is None:
            continue

        service_name = service["name"]
        service_id = service["id"]
        creator = service["built_in_creator"] if service["type"] == DEPLOYMENT_TYPE_C else service["creator"]
        status = kube.get_service_status(service_id=service["id"], pod_list=pod_list,
                                        start_datetime=service["workspace_start_datetime"],
                                        end_datetime=service["workspace_end_datetime"])
        date = service["create_datetime"] # service["start_datetime"]
        description = service["description"]
        built_in_model_name = None

        if service["type"]==DEPLOYMENT_TYPE_A:
            built_in_model_name = service["built_in_model_name"]

        service_info = {
            "name": service_name,
            "id": service_id,
            "creator": creator,
            "status": status,
            "start_datetime": service["start_datetime"],
            "create_datetime": service["create_datetime"],
            "date": date, #TODO REMOVE
            "description": description,
            "built_in_model_name" : built_in_model_name,
            "type" : service["type"],
            "input_type": service["input_type"],
            "service_type" : "root" if service["type"] == DEPLOYMENT_TYPE_C else "user"  # example(created by root), user_create (created by user)
        }
        if status["status"] == KUBE_POD_STATUS_ACTIVE:
            active_service_list.append(service_info)
        else:
            other_service_list.append(service_info)



        # if service["type"] == DEPLOYMENT_TYPE_C:
        #     result["example_services"].append(service_info)
        # else :
        #     result["deployment_services"].append(service_info)
    
    service_item_list = active_service_list + other_service_list

    return response(status=1, result={"list": service_item_list})

import random
def get_service(service_id, protocol):

    pod_list = kube_data.get_pod_list()

    service_info = db.get_service(deployment_id=service_id)

    ports = kube.get_service_port(service_id=service_id)

    # node_name = kube.get_pod_node_name(deployment_id=service_id)
    # print("Get Service node name" , node_name)

    # ip = 외부랑 연결 될 수 있는 ip 를 parameter 처럼 받을 필요가 있음
    # api_address = None
    # node_ip = kube.get_node_ip(node_name, external=True)
    # nginx_port = kube.get_nginx_port(protocol=protocol)
    # nginx_https_port = kube.get_nginx_https_port()
    # if settings.EXTERNAL_HOST is None and node_ip is not None:
    # if settings.EXTERNAL_HOST_REDIRECT:
    #     api_address = node_ip
    # else :
    #     api_address = "{}:{}".format(node_ip, nginx_port)
        # api_address_https = "{}:{}".format(api_address, nginx_https_port)

    # api_address = "{protocol}://{api_address}{path}".format(protocol=protocol, api_address=api_address, path=path)
    # if api_address[-1] != "/":
    #     api_address = api_address + "/"
    # api_address_https = "https://{api_address}{path}/".format(api_address=api_address_https, path=path)

    api_address = kube.get_deployment_full_api_address(deployment_id=service_id, protocol=protocol)

    if service_info is not None:
        #status = ["active","error","stop"]
        data_input_form_list = db.get_deployment_data_form(deployment_id=service_info["id"])

        # service_info["input_type_description"] = ",".join([i["category_description"] for i in data_input_form_list])
        if service_id == str(32):
            temp = []
            for data_input_form in data_input_form_list:
                if "canvas" in data_input_form["category"]:
                    temp.append(data_input_form)
                else :
                    if random.randint(0,1) == 1:
                        temp.append(data_input_form)
            data_input_form_list = temp

        api_method = ",".join(set([ data_input_form["method"] for data_input_form in data_input_form_list ]))

        service_name = service_info["name"]
        service_id = service_info["id"]
        creator = service_info["built_in_creator"] if service_info["type"] == DEPLOYMENT_TYPE_C else service_info["creator"]
        status = kube.get_deployment_worker_status(deployment_id=service_info["id"],pod_list=pod_list)
        date = service_info["start_datetime"]
        description = service_info["description"]
        input_type = service_info["input_type"]
        type_ = service_info["type"]
        result = {
            "name": service_name,
            "id": service_id,
            "creator": creator,
            "status": status,
            "api_address": api_address, #api_address, # From Node
            #"ports" : ports,
            "date": date,
            "description": description,
            "type": type_,
            "api_method" : api_method,
            "data_input_form_list" : data_input_form_list,
            "built_in_model_name" : service_info["built_in_model_name"],
            "input_type": input_type,
            "service_type" : "root" if service_info["type"] == DEPLOYMENT_TYPE_C else "user"  # example(created by root), user_create (created by user)
            # "input_type_description": service_info["input_type_description"]
        }
        return response(status=1, result=result)
    else :
        return response(status=0, message="Not Exist Service")

@ns.route("", methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class Service(CustomResource):
    @token_checker
    @workspace_access_check(services_get_parser)
    @ns.expect(services_get_parser)
    def get(self):
        """service 조회"""
        args = services_get_parser.parse_args()
        workspace_id = args['workspace_id']
        training_id = args['training_id']

        # try:
        #     check_inaccessible_workspace(user_id=self.check_user_id(), workspace_id=workspace_id)
        # except CustomErrorList as ce:
        #     traceback.print_exc()
        #     return self.send(response(status=0, **ce.response()))

        res = get_services(workspace_id=workspace_id, training_id=training_id)
        return self.send(res)

@ns.route('/<service_id>')
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class ServiceDetail(CustomResource):
    @token_checker
    @ns.expect(service_get_parser)
    def get(self, service_id):
    # response = get_dataset_dir(service_id)
        args = service_get_parser.parse_args()
        protocol = args['protocol']

        res = get_service(service_id, protocol)
        return self.send(res)

@ns.route('/error_log/<service_id>', methods=['GET'], doc={'params': {'service_id': 'Deployment ID'}})
class ServiceDetail(CustomResource):
    # @token_checker
    @ns.expect(service_get_parser)
    def get(self, service_id):
        """Service error log 조회"""
        res = get_error_log(deployment_id=service_id)
        return self.send(res)