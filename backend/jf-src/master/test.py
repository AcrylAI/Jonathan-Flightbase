from utils.resource import CustomResource, token_checker
from flask_restplus import reqparse, Resource
from restplus import api
from utils.resource import response
import utils.common as common
import traceback
import kubernetes
import time

ns = api.namespace('test', description='KUBER CALL TEST')

kubernetes.config.load_kube_config()
coreV1Api = kubernetes.client.CoreV1Api()
extensV1Api = kubernetes.client.ExtensionsV1beta1Api()

@ns.route('/kuber_data', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class KUBERCALLTEST(CustomResource):
    def get(self):
        """KUBE CALL"""
        st = time.time()
        try:
            namespace = "default"
            pod_list = coreV1Api.list_namespaced_pod(namespace=namespace)
            node_list = coreV1Api.list_node()
            service_list = coreV1Api.list_namespaced_service(namespace=namespace)
            ingress_service_list = coreV1Api.list_namespaced_service(namespace="ingress-nginx")
            ingress_list = extensV1Api.list_namespaced_ingress(namespace=namespace)
        except :
            traceback.print_exc()
            res = response(status=0, result={
                "pod": -1,
                "datetime": common.get_date_time(),
                "ts": time.time() - st
            })


        res = response(status=1, result={
            "pod": pod_list.metadata.resource_version,
            "datetime": common.get_date_time(),
            "ts": time.time() - st
        })

        return self.send(res)

empty_get = api.parser()
empty_get.add_argument('param1', required=True, type=int, location='args', help='Job ID')

@ns.route('/empty', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class EMPTYTEST(CustomResource):
    @token_checker
    @ns.expect(empty_get)
    def get(self):
        """EMPTY CALL"""
        args = empty_get.parse_args()
        st = time.time()
        res = response(status=1, result={
            "datetime": common.get_date_time(),
            "ts": time.time() - st,
            "host": request.headers.get('Host')
        })

        return self.send(res)

# 500 error test
@ns.route('/500error', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class Error500TEST(CustomResource):
    def get(self):
        """Error 500 CALL"""
        b = a+c
        res = response(status=1, result={
            "datetime": common.get_date_time(),
            "ts": time.time() - st
        })

        return self.send(res)

def simple_gen_aval_node_info(node_list, gpu_model=None):
    aval_total = 0
    temp_node_list = []
    for node in node_list:
        if gpu_model is not None and gpu_model == node.get("gpu_model"):
            aval_total += node["aval"]
            temp_node_list.append(node)
        elif gpu_model is None :
            aval_total += node["aval"]
            temp_node_list.append(node)
        
    aval_node_info = {
        'aval_total': aval_total, 
        'node_list': temp_node_list
    }
    return aval_node_info

def simple_aval_node_list_update(selected_nodes, aval_node_info):
    if selected_nodes is None:
        return 

    aval_total = aval_node_info["aval_total"]

    for s_node in selected_nodes:
        if NVIDIA_MIG_GPU_RESOURCE_LABEL_KEY.format(mig_key=NVIDIA_GPU_MIG_BASE_FLAG) in s_node.get("gpu_resource_key") and aval_node_info["gpu_mode"] != GPU_MIG_MODE:
            continue
        elif NVIDIA_GPU_RESOURCE_LABEL_KEY in s_node.get("gpu_resource_key") and aval_node_info["gpu_mode"] != GPU_GENERAL_MODE:
            continue 

        aval_node_info["aval_total"] -= s_node["gpu_usage"]
        for node in aval_node_info["node_list"]:
            if s_node["node"] == node["name"]:
                node["aval"] = node["aval"] - s_node["gpu_usage"]
                node["used"] = node["used"] + s_node["gpu_usage"]
                s_res_key = s_node.get("gpu_resource_key")
                if NVIDIA_MIG_GPU_RESOURCE_LABEL_KEY.format(mig_key=NVIDIA_GPU_MIG_BASE_FLAG) in s_res_key:
                    node["mig_detail"][s_res_key]["used"] += s_node["gpu_usage"]

                break
from TYPE import *

import time
def run_stop_test():
    cnt =0 
    while(1):
        time.sleep(1)
        print(cnt)
        cnt+=1
    return response(status=1, result=None)


@ns.route('/run_stop_test', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class RUNSTOPTEST(CustomResource):
    def get(self):
        """run_stop_test"""
        st = time.time()

        return self.send(run_stop_test())


# scheduler_testing_parser = api.parser()
# scheduler_testing_parser.add_argument('virtual_node_list', required=False, default=None, type=list, location='json', help="")
# @ns.route('/file_up_test', methods=['GET'])
# @ns.response(200, 'Success')
# @ns.response(400, 'Validation Error')
# class FILEUPTEST(CustomResource):
#     def get(self):
#         """file_up_test"""
#         st = time.time()

#         return self.send(run_stop_test())


from utils.exceptions import *
from utils.access_check import *
deco_test_parser = api.parser()
deco_test_parser.add_argument('a', required=False, default=None, type=str, location='json', help="")
deco_test_parser.add_argument('b', required=False, default=None, type=str, location='json', help="")
deco_test_parser.add_argument('c', required=False, default=None, type=str, location='json', help="")
deco_test_parser.add_argument('d', required=False, default=None, type=str, location='json', help="")
@ns.route('/deco_test/<int:workspace_id>')
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DECOTEST(CustomResource):
    # @ns.expect(training_job_get_parser)
    @deco_test(deco_test_parser, test_p=123124, test_p2="QWERTY")
    def get(self, workspace_id):
        """DECOTEST"""
        st = time.time()
        # print("FROM DECO", self.add_param)

        return self.send({"result":1, "message": "test"})

@ns.route('/func_reuse_test/<int:workspace_id>')
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class FUNCREUSETEST(DECOTEST):
    
    def __init__(self, *args, **kwargs):
        super().__init__(api, args, kwargs)

    def get(self, workspace_id):
        """DECOTEST"""
        st = time.time()
        # print("FROM DECO", self.add_param)
        DECOTEST.get(workspace_id=workspace_id)
        

        return self.send({"result":1, "message": "test"})

@ns.route('/kuber_gpu_resource')
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class KUBE_GPU_RESOURCE(CustomResource):
    def get(self):
        """DECOTEST"""
        from gpu import get_kuber_gpu_resource_status
        st = time.time()
        # print("FROM DECO", self.add_param)
        res = get_kuber_gpu_resource_status()
        

        return self.send({"result": res, "message": "test"})


import os
import requests
import utils.kube as kube
import utils.db as db
import json
import base64
import threading
from deployment import create_deployment_with_ckpt, delete_deployment
from utils.exceptions import *
# def deployment_api(model_id, data_path):
    # 추론 모델 등록 단계
    # model_id = ckpt_id | ckpt_id 는  built_in_model_id를 포함
    # WS에 SIR.WS.002를 통해 model_id를 등록

    # 추론 요청 단계 
    # WS에서 model_id와 datapath를 전달해 추론 요청
    # 1. model_id 정보를 기반으로 built_in_model_id + ckpt_id 조합해서 배포 생성, datapath 데이터는 마스터가 nfs 경로에서 바로 이용(master api에서 배포 생성된 api로 날릴거기 때문)
    # 2. 배포가 생성 시도, (생성 시도가 성공 -> 추론 요청에 response 성공, 생성 시도가 실패 (자원이 없거나 하는 이유로) -> 추론 요청에 response 실패) 
    # return에 inference_id 포함 
    # inference_id = deployment_id

    # 추론 상태 조회 단계
    # 3. 배포내 API가 실행 되기를 기다림
    # 4. 배포 상태가 에러 -> 실패 저장, 배포 상태가 실행 중 -> 입력받은 data_path의 파일을 전송
    # 5. response 받은 결과를 파일로 저장 (inference_id 기준으로)
    # 6. 끝나면 배포 종료

    # 추론 결과 조회 단계
    # 7. inference_id로 배포 결과 요청 시 해당 파일 경로 전송

def deployment_create_and_run(built_in_model_id, ckpt_id):
    # lyla 
    pass
    #

# model_id = ifcModelID
# checkpoint 
# 

# id
# built_in_model_id
# checkpoint_path

# JF용
# workerspace - training - job - param
# COPY -> ?

DNA_LEVEL1_WORKSPACE = "dna-level1"
DNA_LEVEL1_USER = "dna-level1"

DNA_LEVEL2_WORKSPACE = "dna-level2"
DNA_LEVEL2_USER = "dna-level2"



def deployment_api(model_id, data_path="/jfbcore/jf-data/nfs-data/deploytest", headers_user=None):
    try:
        user_id = db.get_user_id(user_name=headers_user)["id"]
        if headers_user == DNA_LEVEL1_USER :
            # level1
            workspace_id = db.get_workspace(workspace_name=DNA_LEVEL1_WORKSPACE)["id"]
        elif headers_user == DNA_LEVEL2_USER :
            # level2
            workspace_id = db.get_workspace(workspace_name=DNA_LEVEL2_WORKSPACE)["id"]
        else :
            # level3
            workspace_id = db.get_user_workspace(user_id=user_id)[0]["id"]


        checkpoint_info = db.get_checkpoint(checkpoint_id=model_id)
        create_and_run_result = create_deployment_with_ckpt(workspace_id=workspace_id, checkpoint_id=model_id, owner_id=user_id, gpu_count=0, headers_user=headers_user)
        if create_and_run_result["status"] == 0:
            return create_and_run_result

        else:
            inference_id = create_and_run_result["result"]["inference_id"]
            master_to_deployment_thread = threading.Thread(target=master_to_deployment_api, args=(data_path, inference_id, checkpoint_info["built_in_model_id"]))
            master_to_deployment_thread.start()
            return create_and_run_result

        # inference_id from deployment_run

        
        # do(data_path=data_path, inference_id=inference_id, built_in_model_id=checkpoint_info["built_in_model_id"])
    except CustomErrorList as ce:
        delete_deployment([inference_id], "root")
        return response(status=0, message=ce.message)
    except Exception as e:
        inference_id = create_and_run_result["result"]["inference_id"]
        delete_deployment([inference_id], "root")
        traceback.print_exc()
        return response(status=0, message="Inference Error.")


# using thread
def master_to_deployment_api(data_path, inference_id, built_in_model_id):

    # built_in_model_id, checkpoint_path = get_model_detail_info(model_id)

    # deployment_run_and_start(built_in_model_id, checkpoint_path)

    # test "https://192.168.1.32:30001/deployment/h2e8eb0f593dc8978e3418fa8044d7b0c/" built_in_model_id = 1012

    for i in range(60):
        kube_status = kube.get_deployment_status(deployment_id=inference_id)
        time.sleep(1)
        print("watining")
        if kube_status["status"] == "running":
            break

    model_api_url = kube.get_deployment_api_address(deployment_id=inference_id) # from deployment_id
    if model_api_url is None:
        delete_deployment([inference_id], "root")
        raise ItemNotExistError("Model API not Exist")
    print("URL ", model_api_url)

    api_key = deployment_api_call_info_get(built_in_model_id)["api_key"] # from deployment_api_call_info_get
    

    deployment_api_call_and_write(data_path=data_path, model_api_url=model_api_url, api_key=api_key, inference_id=inference_id)
    delete_deployment([inference_id], "root")

    # stop deployment

def get_model_detail_info(model_id):
    checkpoint_info = db.get_checkpoint(checkpoint_id=model_id)
    if checkpoint_info is None:
        raise ItemNotExistError("Model ID not Exist")
    ## get built_in_model_id, ckpt_id
    built_in_model_id = checkpoint_info["built_in_model_id"]
    checkpoint_path = checkpoint_info["checkpoint_file_path"]
    return built_in_model_id, checkpoint_path

def deployment_api_call_info_get(built_in_model_id):
    deployment_form_info = db.get_built_in_model_data_deployment_form(built_in_model_id)[0]
    # deployment data form 은 무조건 하나만 있다고 가정

    return {
        "api_key": deployment_form_info["api_key"],
        "category": deployment_form_info["category"]
    }

def deployment_api_call_and_write(data_path, model_api_url, api_key, inference_id):
    # api_key - from built_in_model_deployment_form
    print("API CALL TEST", data_path, model_api_url, api_key, inference_id)
    url = model_api_url
    result_path = get_inference_result_path(inference_id)
    status_file_path = get_inference_result_status_file_path(inference_id)
    done_mark = get_inference_done_mark(inference_id)

    os.system("rm -r -f {}".format(result_path))
    os.system("mkdir -p {}".format(result_path))

    list_dir = os.listdir(data_path)
    file_list = []
    for name in list_dir:
        file_name = data_path+"/{}".format(name)
        if os.path.isfile(file_name):
            file_list.append(name)

    os.system("echo '{}/{}' > {}".format(0, len(file_list), status_file_path))
    try:
        for i, name in enumerate(file_list):
            try:
                response = requests.request("POST", url, files=[(api_key, (name,open(data_path+"/{}".format(name),'rb')))], verify=False)
                js = json.loads(response.text)
            except:
                response = requests.request("POST", url, files=[(api_key, (name,open(data_path+"/{}".format(name),'rb')))], verify=False)
                js = json.loads(response.text)
                
            for key, value in js["image"][0].items():
                bs64 = base64.b64decode(value)
                with open("{}/{}".format(result_path, name),"wb") as f:
                    print("writed ", name)
                    f.write(bs64)
                    f.close()

            os.system("echo '{}/{}' > {}".format(i+1, len(file_list), status_file_path))
    except:
        traceback.print_exc()
        res, message = kube.kuber_item_remove(deployment_id=inference_id)

    os.system("rm {}".format(status_file_path))
    os.system("touch {}".format(done_mark))
    res, message = kube.kuber_item_remove(deployment_id=inference_id)

    
def get_inference_result_path(inference_id):
    result_path = "/jf-data/inference_result/{}/".format(inference_id)
    return result_path

def get_inference_done_mark(inference_id):
    base_path = get_inference_result_path(inference_id)
    done_mark ="{}/.done".format(base_path)
    return done_mark

def get_inference_result_status_file_path(inference_id):
    base_path = get_inference_result_path(inference_id)
    status_mark = "{}/.status".format(base_path)
    return status_mark

def inference_get(inference_id):
    result_path = "/jf-data/inference_result/{}/".format(inference_id)
    target_path = "/jf-data/nfs-data/{}/".format(inference_id)
    os.system("mv {} {}".format(result_path, target_path))

    return response(status=1, result={
        "file_path": target_path
    })


def inference_status_get(inference_id):
    # 0 = 완료
    # 1 = 로딩 중 (kube로부터 deployment가 컨테이너 생성 중, 설치 중)
    # 2 = 추론 중 (.status로 부터 파일 남은 개수 현황 정도)
    done_path = get_inference_done_mark(inference_id) #"/jf-data/inference_result/{}/.running".format(inference_id)
    status_path = get_inference_result_status_file_path(inference_id)
    inference_status = None     
    status_detail = None

    ## 완료 = .done 파일이 있거나 하면?
    if os.path.isfile(done_path):
        inference_status = 0
        return response(status=1, result={
            "inference_status": inference_status,
            "status_defailt": None
        })

    ## 로딩 중 관련 스탭
    kube_status = kube.get_deployment_status(deployment_id=inference_id)
    if kube_status["status"] == "running":
        inference_status = 2
    elif kube_status["status"] is not "stop":
        inference_status = 1
    #running 이면 추론 중 스탭으로
    
    ## 추론 중 관련 스탭
    try:
        if os.path.isfile(status_path):
            inference_status = 2
            with open(status_path, "r") as fr:
                status_detail = fr.readline()
    except:
        traceback.print_exc()
    
    return response(status=1, result={
        "inference_status": inference_status,
        "kube_status": kube_status,
        "status_detail": status_detail
    })

deployapi_test_get_parser = api.parser()
deployapi_test_get_parser.add_argument('inference_id', required=True, type=int, location='args', help="")

deployapi_test_parser = api.parser()
deployapi_test_parser.add_argument('model_id', required=True, type=int, location='json', help="")
deployapi_test_parser.add_argument('data_path', required=True, type=str, location='json', help="")


@ns.route('/deployment-api')
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DeploymentApi(CustomResource):
    @ns.expect(deployapi_test_get_parser)
    def get(self):
        args = deployapi_test_get_parser.parse_args()
        inference_id = args["inference_id"]

        return self.send(inference_get(inference_id))

    @ns.expect(deployapi_test_parser)
    def post(self):
        """TEST"""
        args = deployapi_test_parser.parse_args()
        model_id = args["model_id"]
        data_path = args["data_path"]
        res = deployment_api(model_id, data_path, headers_user=self.check_user())
        return self.send(res)
        
@ns.route('/deployment-api/status')
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DeploymentApi(CustomResource):
    @ns.expect(deployapi_test_get_parser)
    def get(self):
        args = deployapi_test_get_parser.parse_args()
        inference_id = args["inference_id"]

        return self.send(inference_status_get(inference_id))



thread_test_post_parser = api.parser()
thread_test_post_parser.add_argument('thread_name', required=True, type=str, location='json', help="")
thread_test_post_parser.add_argument('create_type', required=True, type=int, location='json', help="0 - with create, 1 - thread object")
from utils.runnable_object_controller import RunnableObjectController

import time
import threading

def thread_test(thread_name):
    for i in range(10):
        print("Thread RUN !! {} {}".format(thread_name, os.getpid()))
        time.sleep(1)
        
    return 0

def create_thread(thread_name, create_type):
    try:
        if create_type == 0:
            RunnableObjectController().run_with_thread_create(target=thread_test, name=thread_name, args=(thread_name,))
        elif create_type == 1:
            threading.Thread(target=thread_test, name=thread_name, args=(thread_name,))
            RunnableObjectController().run_created_thread(th=th)
    except Exception as e:
        return response(status=0, message="Error : {}".format(e), pid=os.getpid())
    return response(status=1, message="OK", pid=os.getpid())

@ns.route('/thread')
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class ThreadControllerTest(CustomResource):
    def get(self):

        return self.send(response(status=1, result=RunnableObjectController().get_thread_name_list(), pid=os.getpid()))

    @ns.expect(thread_test_post_parser)
    def post(self):
        args = thread_test_post_parser.parse_args()

        thread_name = args["thread_name"]
        create_type = args["create_type"]

        res = create_thread(thread_name=thread_name, create_type=create_type)
        return self.send(res)

