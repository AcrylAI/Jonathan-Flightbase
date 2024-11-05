from utils.resource import CustomResource, token_checker
from flask_restplus import reqparse, Resource
from restplus import api
from utils.resource import response

import utils.db as db
import utils.kube as kube
from TYPE import *
from utils import common
import os
parser = reqparse.RequestParser()
# Router Function
ns = api.namespace('trainings', description='Training 관련 API')

training_checkpoint_get = api.parser()
# training_checkpoint_get.add_argument('training_id', required=True, default=None, type=int, location='args', help='Training ID')

def get_training_checkpoints_new(training_id_list, item_type):
    from training import get_hyper_dataset_parameter
    """
        Descrption: training_id (복수개 가능) + item_type (job | hps) 조합이 가지는 checkpoint file 리스트 제공용 함수
                    이어학습, 배포 생성, 수정 시 Checkpoint 선택이 필요한 부분에서 사용될 기초 함수
                    + Checkpoint 관리 기능 추가시에도 관리 할 checkpoint 선택 관련으로 사용 예정
        
        Args :
            training_id_list (list) : 찾고자 하는 training_id들. 
            item_type(str) : 찾고자 하는 item 타입 (job | hps)
            
        Return :
            (list) - 
            [
                {
                    'workspace_name': 'robert-ws',
                    'training_name': 'custom-d-test',
                    'item_name': 'my-test-2-empty',
                    'item_id': 725,
                    'group_number': 21,
                    'group_index': 0,
                    'item_file_list': ['my-ckpt-e321-lr0.1.pt', 'my-data3/my-data3.pt']},
                {
                    'workspace_name': 'robert-ws',
                    'training_name': 'custom-d-test',
                    'item_name': 'my-test-1',
                    'item_id': 724,
                    'group_number': 20,
                    'group_index': 0,
                    'item_file_list': ['my-ckpt-e999-lr14439.0.pt']
                }
            ]
    """
    def find_file_in_folder(path, base=None):
        """
            Description: 특정 경로 위의 파일 목록 찾기 (작성 중 - 2022-04-20)
            
            Args:
                path (str) : checkpoint 데이터를 찾고자 하는 경로 
                base (str) : default - None. path의 최상위 경로를 시작으로 하위 폴더를 만나는 경우 하위폴더 이름만 남기고 나머지는 제거하기 위한 값
            
            Returns :
                (list) - ['my-test-2-empty/0/my-ckpt-e321-lr0.1.pt', 'my-test-2-empty/0/my-data3/my-data3.pt']
        """
        if base is None:
            base = path
        files = []
        try:
            dirlist = os.listdir(path)
        except OSError as e :
            return files

        for name in dirlist:
            next_ = path+"/"+name
            if os.path.isdir(next_) == True:
                files+=find_file_in_folder(next_, base)
                continue
            else:
                file_ = next_.replace(base,"")

                if file_[0] == "/":
                    file_ = file_[1:]
                files.append(file_)

        return files
    
    def find_checkpoint_file_in_list(file_list):
        checkpoint_file_list=[]
        for item_file in file_list:
            if "ckpt" in item_file and ".index" in item_file:
                item_file = item_file.split(".")[:-1]
                item_file = ".".join(item_file)
                if item_file not in files:
                    checkpoint_file_list.append(item_file)

            elif [ item_file for extension in CHECKPOINT_EXTENSION if extension in item_file ]:
                checkpoint_file_list.append(item_file)
        return checkpoint_file_list
        
    item_list = []
    if item_type == TRAINING_ITEM_A:
        item_list = db.get_job_list(training_id_list=training_id_list, order_by="DESC", sort="id")
    elif item_type == TRAINING_ITEM_C:
        item_list = db.get_hyperparamsearch_list(training_id_list=training_id_list)
    
    files =[]
    for item in item_list:
        if item_type == TRAINING_ITEM_A:
            base_path = JF_TRAINING_JOB_CHECKPOINT_ITEM_PATH.format(workspace_name=item["workspace_name"], training_name=item["training_name"], job_name=item["name"], job_group_index=item["job_group_index"])  # kube.get_item_checkpoints_base_path(workspace_name=item["workspace_name"], training_name=item["training_name"], item_type=item_type)

            # TODO REMOVE - 다른 방법으로 표현
            item_file_base_path = JF_TRAINING_JOB_CHECKPOINT_ITEM_POD_PATH.format(job_name=item["name"], job_group_index=item["job_group_index"]) + "/"
            item_dir_base_path = JF_TRAINING_JOB_CHECKPOINT_ITEM_POD_PATH.format(job_name=item["name"], job_group_index="")
            group_number = item["group_number"]
            group_index = item["job_group_index"]
            parameter_str = item["parameter"]
            search_parameter = None
            # job_name / group_index / data
            
        elif item_type == TRAINING_ITEM_C:
            
            base_path = JF_TRAINING_HPS_CHECKPOINT_ITEM_PATH.format(workspace_name=item["workspace_name"], training_name=item["training_name"], hps_name=item["name"], hps_group_index=item["hps_group_index"])
            
            # TODO REMOVE - 다른 방법으로 표현
            item_file_base_path = JF_TRAINING_HPS_CHECKPOINT_ITEM_POD_PATH.format(hps_name=item["name"], hps_group_index=item["hps_group_index"]) + "/"
            item_dir_base_path = JF_TRAINING_HPS_CHECKPOINT_ITEM_POD_PATH.format(hps_name=item["name"], hps_group_index="")
            group_number = ""
            group_index = item["hps_group_index"]
            parameter_str = item["run_parameter"]
            search_parameter = common.parameter_str_to_dict(item["search_parameter"],"=")
            
            # hps_name / group_index /  n_iter / data
            
        item_files = find_file_in_folder(base_path)
        checkpoint_file_list = []
        for item_file in item_files:
            if "ckpt" in item_file and ".index" in item_file:
                item_file = item_file.split(".")[:-1]
                item_file = ".".join(item_file)
                if item_file not in files:
                    checkpoint_file_list.append(item_file)

            elif [ item_file for extension in CHECKPOINT_EXTENSION if extension in item_file ]:
                checkpoint_file_list.append(item_file)
        
        # get parameter
        parameter, dataset_parameter = get_hyper_dataset_parameter(parameter=parameter_str, built_in_model_id=item["built_in_model_id"])
        
        if len(checkpoint_file_list) > 0:

            item_meta_info = {
                "item_type": item_type,
                "workspace_name": item["workspace_name"],
                "training_name": item["training_name"],
                "item_name": item["name"],
                "item_id": item["id"],
                "group_number": group_number,
                "group_index": group_index,
                "item_file_list": checkpoint_file_list,
                "item_file_path": item_file_base_path,
                "item_dir_path": item_dir_base_path,
                "parameter":parameter,
                "search_parameter":search_parameter,
                "dataset_parameter":dataset_parameter
                # "best_score":best_score
            }
            files.append(item_meta_info)        
    return files

def getfiles(dirpath):
    listfile = [s for s in os.listdir(dirpath) if os.path.isfile(os.path.join(dirpath, s))]
    listfile.sort(key=lambda s: os.path.getmtime(os.path.join(dirpath, s)))
    listtmp = os.listdir(dirpath)
    listdir = list(set(listtmp)-set(listfile))
    return listfile + listdir

def get_checkpoint_list_in_folder(path, base=None):
        if base is None:
            base = path
        files = []
        try:
            dirlist = getfiles(path)
        except OSError as e :
            return files

        for name in dirlist:
            next_ = path+"/"+name
            if os.path.isdir(next_) == True:
                files+=get_checkpoint_list_in_folder(next_, base)

            file_ = next_.replace(base,"")
            if file_[0] == "/":
                file_ = file_[1:]
            files.append(file_)

        return files

def get_job_checkpoint_info(training_id):
    """get job checkpoint info

    Args:
        training_id (int): training id

    Returns:
        (list): 
            [
                {
                    'job_name': 'robert-job',
                    'job_create_datetime': '2022-11-18 04:04:23',
                    'job_runner_name': 'lyla'
                    'job_group_list': [
                        {
                            'job_id': 55,
                            'job_group_name': 0,
                            'run_parameter':{
                                'data':'/user_dataset/',
                                'batch_size': '32'
                            },
                            'checkpoint_list':[
                                '00-0.61.json',
                                '00-0.61.json'
                            ]
                        },
                        {
                            'job_id': 54,
                            'job_group_name': 1,
                            'run_parameter':{
                                'data':'/user_dataset/',
                                'batch_size': '64'
                            },
                            'checkpoint_list':[
                                '00-0.61.json',
                                '00-0.61.json'
                            ]
                        }
                    ]
                },
                ...
            ]
    """
    item_list = db.get_job_list(training_id=training_id, order_by="DESC", sort="id")
    job_list = []
    current_group_number = None
    for item in item_list:
        checkpoint_base_path = JF_TRAINING_JOB_CHECKPOINT_ITEM_PATH.format(workspace_name=item["workspace_name"], 
                                                                            training_name=item["training_name"], 
                                                                            job_name=item["name"], 
                                                                            job_group_index=item["job_group_index"])
        job_group_info = {
            "job_id": item["id"],
            "job_group_name": item["job_group_index"],
            "run_parameter":common.parameter_dict_to_list(common.parameter_str_to_dict(item["parameter"])),
            "checkpoint_list": get_checkpoint_list_in_folder(checkpoint_base_path),
        }
        job_group_info["checkpoint_count"] = len(job_group_info["checkpoint_list"])
        if item["group_number"]!=current_group_number:
            job_list.append({
                "job_name":item["name"],
                "job_create_datetime":item["create_datetime"],
                "job_runner_name":item["runner_name"],
                "job_group_list":[job_group_info],
                "checkpoint_count":job_group_info["checkpoint_count"]
            })
            current_group_number = item["group_number"]
        else:
            job_list[-1]["job_group_list"].append(job_group_info)
            job_list[-1]["checkpoint_count"]+=job_group_info["checkpoint_count"]
    return job_list

def get_hps_checkpoint_info(training_id, sort_key, order_by, is_param):
    """get hps checkpoint info

    Args:
        training_id (int): training id

    Returns:
        (list): 
            [
                {
                    'hps_name': 'robert-hps',
                    'hps_create_datetime': '2022-11-18 04:04:23',
                    'hps_runner_name': 'lyla'
                    'hps_group_list': [
                        {
                            'hps_id': 55,
                            'hps_group_name': 0,
                            'best_score':92,33,
                            'best_hps_number':45
                            'run_parameter':{
                                'data':'/user_dataset/',
                                'batch_size': '32'
                            }, 
                            'search_parameter': {
                                'dropout_rate': '(0.1,0.6)',
                                'learning_rate': '(0.0005,0.003)'
                            },
                            'hps_number_info': {
                                'log_table': [
                                    {
                                        'target': 66.56,
                                        'params': {
                                            'dropout_rate': 0.30851100235128703,
                                            'learning_rate': 0.0023008112336053953
                                        },
                                        'datetime': {
                                            'datetime': '2022-04-12 09:03:28',
                                            'elapsed': 0.0,
                                            'delta': 0.0
                                        },
                                        'hps_id': 40,
                                        'id': 1,
                                        'checkpoint_list': [
                                            '01-0.67.json',
                                            '01-0.67.json',
                                            '00-0.66.json',
                                            '00-0.66.json'
                                        ]
                                    },
                                    ...
                                ],
                                'parameter_settings': {},
                                'status': {},
                                'max_index': 47,
                                'max_item': {
                                    'target': 68.5,
                                    'params': {
                                        'dropout_rate': 0.30786751396801826,
                                        'learning_rate': 0.0028685824670648266
                                    },
                                    'datetime': {
                                        'datetime': '2022-11-15 02:15:18',
                                        'elapsed': 2167.977708,
                                        'delta': 50.848016
                                    },
                                    'hps_id': 45,
                                    'id': 48,
                                    'checkpoint_list': [
                                        '00-0.68.json',
                                        '00-0.68.json'
                                    ]
                                }
                            }
                        },
                        ...
                    ]
                },
                ...
            ]
    """
    from training_hyperparam import get_hps_log_table_detail, get_hyperparam_log_file_path, sort_log_table
    def get_hps_number_info(hps_id, hps_id_group_index_dic, hps_name, workspace_name, training_name,
                            sort_key, order_by, is_param):
        log_json_data = get_hyperparam_log_file_path(hps_id=hps_id, workspace_name=workspace_name, training_name=training_name, log_type="json")
        if os.path.isfile(log_json_data)==False:
            return None
        hps_number_info = get_hps_log_table_detail(log_json_data)
        hps_number_info["log_table"] = sort_log_table(log_table=hps_number_info["log_table"], sort_key=sort_key, order_by=order_by, is_param=is_param)
        for hps_number_log in hps_number_info["log_table"]:
            # hps_id 를 기준으로 
            hps_number_log["hps_id"] = int(hps_number_log["hps_id"])
            hps_group_index = hps_id_group_index_dic[hps_number_log["hps_id"]]
            checkpoint_base_path = JF_TRAINING_HPS_CHECKPOINT_ITEM_DIR_PATH.format(workspace_name=workspace_name, training_name=training_name, 
                                                                    hps_name=hps_name, hps_group_index=hps_group_index, hps_number=hps_number_log["id"])
            hps_number_log["checkpoint_list"] = get_checkpoint_list_in_folder(checkpoint_base_path)
            hps_number_log["checkpoint_count"] = len(hps_number_log["checkpoint_list"])
        return hps_number_info

    item_list = db.get_hyperparamsearch_list(training_id=training_id)

    # hps group number 를 기준으로 체크포인트 경로를 받기 위해 hps id : hps group index dictionary 생성 
    hps_id_group_index_dic={}
    for item in item_list:
        hps_id_group_index_dic[item["id"]] = item["hps_group_index"]

    # return 구조로 hps list 에 item append
    hps_list = []
    current_group_number = None
    for item in item_list:
        hps_number_info = get_hps_number_info(hps_id=item["id"], hps_id_group_index_dic=hps_id_group_index_dic,  hps_name=item["name"],  
                                            workspace_name=item["workspace_name"], training_name=item["training_name"],
                                            sort_key=sort_key, order_by=order_by, is_param=is_param)
        if hps_number_info!=None:
            best_score = None
            max_idx = None
            if hps_number_info.get("max_item")!= None:
                if hps_number_info["max_item"].get("target")!=None:
                    best_score = hps_number_info["max_item"]["target"]
                    max_idx = hps_number_info["max_index"]
            hps_group_info = {
                "hps_id": item["id"],
                "hps_group_name": item["hps_group_index"],
                "best_score": best_score,
                "best_hps_number": max_idx,
                "run_parameter": common.parameter_dict_to_list(common.parameter_str_to_dict(item["run_parameter"])),
                "search_parameter": common.parameter_dict_to_list(common.parameter_str_to_dict(item["search_parameter"],"=")),
                "hps_number_info": hps_number_info,
                "checkpoint_count": sum([hps_number_log["checkpoint_count"] for hps_number_log in hps_number_info["log_table"]])
            }
            
            # hps_group_id 가 이전 값과 다른 경우 새로운 hps 정보 생성하여 hps list 에 append
            if item["hps_group_id"]!=current_group_number:
                hps_list.append({
                    "hps_name":item["name"],
                    "hps_create_datetime":item["create_datetime"],
                    "hps_runner_name":item["creator"],
                    "hps_group_list":[hps_group_info],
                    "checkpoint_count":hps_group_info["checkpoint_count"]
                })
                current_group_number = item["hps_group_id"]
            # hps_group_id 가 이전 값과 같은 경우 이전 hps 정보의 hps group list 에 group 정보 append
            else:
                hps_list[-1]["hps_group_list"].append(hps_group_info)
                hps_list[-1]["checkpoint_count"]+=hps_group_info["checkpoint_count"]
    return hps_list


def get_training_checkpoints_for_deployment(model_list, item_type):
    """
        Description: get_training_checkpoints 에서 나온 정보를 기반으로 배포 생성, 수정 시 checkpoint 선택용 정보로 가공해서 제공
        
        Args:
            model_list (list) : [{"id", "name":  ... }] # 해당 함수에서는 "id", "name" 필수. 나머지는 필요에 따라 프론트에서 가공에 사용
            item_type (str) : 찾고자 하는 item 타입 (job | hps) - 현재(2022-04-20) job만 제공

        Return: 
            (None) - 현재(2022-04-20) 구조상 input으로 받은 model_list에 item_list를 추가시키며 함수 종료
    """
    def get_model(model_list, name):
        for model in model_list:
            if model["name"] == name:
                if model.get("checkpoint_count") is None:
                    model["checkpoint_count"] = 0
                if model.get("item_list") is None:
                    model["item_list"] = []
                return model
    
    def append_item(model, item_name, item_id, group_index, item_file_list):
        def get_group_list(item_list, item_name):
            try:
                item_name_list = [ item["name"] for item in item_list ]
                index = item_name_list.index(item_name)
            except ValueError as ve:
                index = -1
                
            if index == -1:
                item_list.append({"name": item_name, "id": item_id, "group_list": []}) 
                return item_list[-1]["group_list"]
            else :
                return item_list[index]["group_list"]
        
        def get_checkpoint_list(group_list, group_index):
            try:
                group_name_list = [ group["name"] for group in group_list ]
                index = group_name_list.index(group_index)
            except ValueError as ve:
                index = -1
            
            if index == -1:
                group_list.append({"name": group_index, "id": item_id, "checkpoint_list": []})
                return group_list[-1]["checkpoint_list"]
            else:
                group_list[index]["checkpoint_list"]
        
        def append_checkpoint_files(checkpoint_list, item_file_list):
            for item_file in item_file_list:
                checkpoint_list.append({"name": item_file, "id": item_id})
                
                
        item_list = model["item_list"]
        group_list = get_group_list(item_list=item_list, item_name=item_name)
        checkpoint_list = get_checkpoint_list(group_list=group_list, group_index=group_index)
        append_checkpoint_files(checkpoint_list=checkpoint_list, item_file_list=item_file_list)
    #         checkpoint_list += item_file_list
        
    item_file_list = get_training_checkpoints_new(training_id_list=[ model["id"] for model in model_list], item_type=item_type)

    for item_file in item_file_list:
        model = get_model(model_list=model_list, name=item_file["training_name"])
        append_item(model=model, item_name=item_file["item_name"], item_id=item_file["item_id"], group_index=item_file["group_index"], item_file_list=item_file["item_file_list"])

def get_training_checkpoints(training_id):
    def getfiles(dirpath):
        listfile = [s for s in os.listdir(dirpath) if os.path.isfile(os.path.join(dirpath, s))]
        listfile.sort(key=lambda s: os.path.getmtime(os.path.join(dirpath, s)))
        listtmp = os.listdir(dirpath)
        listdir = list(set(listtmp)-set(listfile))
        return listfile + listdir
    def find_file_in_folder(path, base=None):
        if base is None:
            base = path
        files = []
        try:
            # dirlist = os.listdir(path)
            # print("====\n1:",dirlist)
            dirlist = getfiles(path)
            # print("====\n2:",dirlist2)
        except OSError as e :
            return files

        for name in dirlist:
            next_ = path+"/"+name
            if os.path.isdir(next_) == True:
                files+=find_file_in_folder(next_, base)

            file_ = next_.replace(base,"")
            if file_[0] == "/":
                file_ = file_[1:]
            files.append(file_)

        return files

    jobs_lists = db.get_job_list(training_id=training_id, order_by="DESC", sort="id")
    checkpoints_list = {} # training_name : []
    if jobs_lists is None:
        return model_list
    for job in jobs_lists:
        if checkpoints_list.get(job["training_name"]) is None:
            checkpoints_list[job["training_name"]] = []

        base_path = kube.get_item_checkpoints_base_path(workspace_name=job["workspace_name"], training_name=job["training_name"], item_type=TRAINING_ITEM_A)
        job_checkpoints_base_path = "{}/{}".format(base_path, job["name"])
        # job_checkpoint_path = "{}/{}/{}/".format(job_checkpoints_base_path, job["job_group_index"], 'check')
        job_checkpoint_path = "{}/{}/".format(job_checkpoints_base_path, job["job_group_index"])
        job_files = find_file_in_folder(job_checkpoint_path)
        files = []
        try:
            for item in job_files:
                # ckpt 형태로 checkpoint가 저장되는 경우
                if "ckpt" in item and ".index" in item:
                    item = item.split(".")[:-1]
                    item = ".".join(item)
                    item = "{}/{}/{}".format(job["name"], job["job_group_index"], item)
                    if item not in files:
                        files.append(item)

                elif ".hdf5" in item or ".pth" in item or ".h5" in item or ".pt" in item:
                    # item = item.split(".")[:-1]
                    # item = ".".join(item)
                    item = "{}/{}/{}".format(job["name"], job["job_group_index"], item)
                    files.append(item)
     
        except Exception as e:
            pass
        checkpoints_list[job["training_name"]] += files
    return checkpoints_list



@ns.route('/checkpoint/<int:training_id>', methods=['GET'], doc={'params': {'training_id': 'training ID'}})
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class trainingCheckpoint(CustomResource):
    # @token_checker
    @ns.expect(training_checkpoint_get)
    def get(self, training_id):
        """Training Checkpoint 조회"""
        args = training_checkpoint_get.parse_args()

        res = response(status=1, result=get_training_checkpoints(training_id=training_id))

        return self.send(res)