from restplus import api
from datetime import datetime
from utils.resource import CustomResource, response, token_checker
import utils.db as db
from utils.resource import response
import traceback
import json
from settings import JF_BUILT_IN_MODELS_PATH, JF_WS_DIR
import os
from werkzeug.datastructures import FileStorage
import base64
from lock import jf_scheduler_lock
from TYPE import *
from utils import common
from PIL import Image
from utils.exceptions import *

BUILT_IN_OPTIONAL_VALUE_LIST = ["model", "description", "train_data", "evaluation_index", "parameters ",
                                "parameters_description", "checkpoint_load_dir_path_parser", "training_num_of_gpu_parser", "deployment_num_of_gpu_parser"]
BUILT_IN_REQUIRED_VALUE_LIST = ["name", "name_kr",
                                "kind", "path", "run_docker_name", "created_by"]
BUILT_IN_LIST_KEY_LIST = [
    "deployment_input_data_form_list", "training_input_data_form_list"]
BUILT_IN_DIC_KEY_LIST = ["parameters", "parameters_description"]

def string_to_int_or_float(paramter_string):
    try:
        paramter_string = float(paramter_string)
        if paramter_string.is_integer():
            return int(paramter_string)
        else:
            return paramter_string
    except:
        return paramter_string


def transform_data_training_form_with_child(data_training_form_list):
    def set_full_path_and_name(data_training_form):
        if len(data_training_form["name"]) == 0:
            data_training_form["name"] = "/" # path 가 "" 인 경우 "/"
        
        data_training_form["full_path"] = data_training_form["name"]

        if data_training_form["full_path"] != "/":
            data_training_form["name"] = data_training_form["full_path"].split("/")[-1]

        if data_training_form["full_path"][0] != "/":
            data_training_form["full_path"] = "/" + data_training_form["full_path"] # 최상위 path 는 "dir1" -> "/dir1" 로 표기 
        
    def get_depth_level(data_training_form):
        
        depth = 0
        if data_training_form["full_path"] == "/":
            depth = 0
        else:
            depth = len(data_training_form["full_path"].split("/")) - 1
        return depth
    
    level_dict = {}
    for data_training_form in data_training_form_list:
        if data_training_form["type"] == "dir":
            data_training_form["children"] = []
        
        set_full_path_and_name(data_training_form)
        depth = get_depth_level(data_training_form)
        data_training_form["depth"] = depth
        
        
        if level_dict.get(depth) is None:
            level_dict[depth] = [ data_training_form ]
        else :
            level_dict[depth].append(data_training_form)
        
    level_list = list(level_dict.keys())
    level_list.reverse()
    
    def insert(child_list, parent_list):
            
        for i in range(len(child_list)):
            child = child_list.pop()
            child_full_path_info = child["full_path"].split("/")
            
            find_parent = False
            for parent in parent_list:
                if parent["type"] == "file":
                    continue
                parent_full_path_info = parent["full_path"].split("/")
                # Find Match child <-> parent
                if child_full_path_info[:-1] == parent_full_path_info:
                    # child["name"] = child_full_path_info[-1]
                    find_parent = True
                    parent["children"].append(child)
                    break
            if find_parent == False:
                child_list.insert(0, child)
                
    
    for i in range(len(level_list)):
        if i + 1 == len(level_list):
            break
        child_level = level_list[i]
        parent_level = level_list[i + 1]
        
        child_list = level_dict[child_level]
        parent_list = level_dict[parent_level]
        insert(child_list=child_list, parent_list=parent_list)

    new_data_training_form = []
    for k, v in level_dict.items():
        new_data_training_form += v
        
    def create_temp_index(new_data_training_form, temp_index):
        if new_data_training_form is None:
            new_data_training_form = []
        if temp_index is None:
            temp_index = []
        
        for i, data_training_form in enumerate(new_data_training_form):
            temp_index.append(i)
            data_training_form["temp_index"] = list(temp_index)
            create_temp_index(new_data_training_form=data_training_form.get("children"), temp_index=temp_index)
            temp_index.pop()
    
    create_temp_index(new_data_training_form=new_data_training_form, temp_index=[])
    
    return new_data_training_form

def comp_built_in_data_training_form_and_dataset(dataset_list, data_training_form_list):
    # 1. Dataset에서 Training Data Form의 최소 조건들이 만족하는지 확인 (parser 없는 아이템들)
    # 2. 
    #
    import os
    import copy
    def find_no_search_data_training_form(data_training_form_list, dataset_base_path, unsatisfied, selected_depth=None, path_update_only=False):
        """
        
        Args :
            data_training_form_list (list): transformed
            dataset_base_path (str)
            unsatisfied (dict) : {"dir": [], "file": []}
            selected_depth (list) 
            path_update_only (bool)
        """
        if data_training_form_list == None:
            data_training_form_list = []
        if selected_depth == None:
            selected_depth = []
            
        # print(data_training_form_list, path_update_only)

        for data_training_form in data_training_form_list:
            if "selected" not in data_training_form.keys():
                data_training_form["selected"] = None # Parser가 있는 경우 선택한 아이템
            if "data_list" not in data_training_form.keys():
                data_training_form["data_list"] = []
            
            selectable = False if data_training_form["argparse"] is None else True
            
            if data_training_form["name"] == "/":
                data_training_form["generable"] = True
                continue

            if path_update_only == False:

                if selectable == False:
                    selected_full_path = "/".join(selected_depth + [data_training_form["name"]])
                    data_training_form["selected_full_path"] = selected_full_path
                    specific_path = "{}/{}".format(dataset_base_path, selected_full_path)
                    # print("!!",specific_path)
                    if data_training_form["type"] == "file":
                        isfile = os.path.isfile(specific_path)
                        data_training_form["generable"] = isfile
                        if isfile == False:
                            unsatisfied[data_training_form["type"]].append(data_training_form["selected_full_path"])
                        else:
                            data_training_form["data_list"] = [data_training_form["name"]]
                            data_training_form["selected"] = data_training_form["name"]

                    elif data_training_form["type"] == "dir":

                        isdir = os.path.isdir(specific_path)
                        data_training_form["generable"] = isdir
                        if isdir == False:
                            unsatisfied[data_training_form["type"]].append(data_training_form["selected_full_path"])
                        else:
                            data_training_form["data_list"] = [data_training_form["name"]]
                            data_training_form["selected"] = data_training_form["name"]
                            selected_depth.append(data_training_form["selected"])
                            find_no_search_data_training_form(
                            data_training_form_list=data_training_form.get("children"), dataset_base_path=dataset_base_path, selected_depth=selected_depth,
                            unsatisfied=unsatisfied)

                elif selectable == True:
                    selected_full_path = "/".join(selected_depth)
                    specific_path = "{}/{}".format(dataset_base_path, selected_full_path)
                    # print(specific_path, selected_depth, data_training_form["full_path"])
                    # os.listdir(specific_path)
                    try:
                        if data_training_form["type"] == "file":
                            data_training_form["data_list"] = [ f for f in os.listdir(specific_path) if os.path.isfile(os.path.join(specific_path, f)) ]
                            # # 확장자 탐색  - # 현재 논의 내용으로는 안쓰는걸로
                            # if "." in data_training_form["name"]:
                            #     extension = data_training_form["name"].split(".")[-1]
                            #     data_training_form["data_list"] = [ f for f in data_training_form["data_list"] if "." in f and f.split(".")[-1] == extension ]
                        elif data_training_form["type"] == "dir":
                            data_training_form["data_list"] = [ d for d in os.listdir(specific_path) if os.path.isdir(os.path.join(specific_path, d)) ]
                    except FileNotFoundError as fne:
                        # print("!", fne)
                        pass

                    if data_training_form["selected"] not in data_training_form["data_list"]:
                        # 폴더나 파일 선택 X
                        # 하위 폴더의 path만 업데이트

                        # 폴더나 파일 선택은 했으나 존재하지 않음
                        # 1. selected = None 처리
                        # 2. 하위 폴더 선택값 리셋
                        selected_depth.append(data_training_form["name"])
                        data_training_form["selected"] = None
                        data_training_form["selected_full_path"] = "{}/{}".format(selected_full_path, data_training_form["name"])
                        find_no_search_data_training_form(
                            data_training_form_list=data_training_form.get("children"), dataset_base_path=dataset_base_path, 
                            selected_depth=selected_depth,
                            unsatisfied=unsatisfied, path_update_only=True)
                    elif data_training_form["selected"] in data_training_form["data_list"]:
                        # 폴더나 파일 선택 O
                        # 하위 폴더 탐색
                        selected_depth.append(data_training_form["selected"])
                        data_training_form["selected_full_path"] = "{}/{}".format(selected_full_path, data_training_form["selected"])
                        find_no_search_data_training_form(
                            data_training_form_list=data_training_form.get("children"), dataset_base_path=dataset_base_path, 
                            selected_depth=selected_depth,
                            unsatisfied=unsatisfied)

                    if len(data_training_form["data_list"]) == 0:
                        data_training_form["generable"] = False 
                        unsatisfied[data_training_form["type"]].append(data_training_form["selected_full_path"].replace("//","/"))
                    else:
                        data_training_form["generable"] = True

            else:
                # full path 선택한 path 반영하여 동적으로 업데이트 될 수 있도록
                if selectable == False:
                    selected_full_path = "/".join(selected_depth + [data_training_form["name"]])
                    data_training_form["selected_full_path"] = selected_full_path
                    data_training_form["selected"] = data_training_form["name"]

                    if data_training_form["type"] == "dir":
                        selected_depth.append(data_training_form["selected"])

                        find_no_search_data_training_form(
                        data_training_form_list=data_training_form.get("children"), dataset_base_path=dataset_base_path, selected_depth=selected_depth,
                        unsatisfied=unsatisfied, path_update_only=True)

                elif selectable == True:
                    selected_full_path = "/".join(selected_depth)
                    data_training_form["selected_full_path"] = "{}/{}".format(selected_full_path, data_training_form["name"])
                    del data_training_form["data_list"]
                    data_training_form["selected"] = None
                    selected_depth.append(data_training_form["name"])
                    find_no_search_data_training_form(
                        data_training_form_list=data_training_form.get("children"), dataset_base_path=dataset_base_path, 
                        selected_depth=selected_depth,
                        unsatisfied=unsatisfied, path_update_only=True)
                        
                # selected 값이 None이면 child를 검색하진 않고 data_list만 계산해서 내려줌
                #
                # selected 값이 있으면 selected 값을 depth에 추가하고 
                # child가 full_path 입력할 때 
                # ex) a/b/c
                # child 기준 - depth = ["a","b"] - 
                # 변수로 실제 선택한 depth를 넘겨주어 ex) ["my-folder", "coco"] 
                # a -> my-folder, b -> coco 로 변경하여 검색

                # "/".join(selected_depth + [data_training_form["name"]]) # "/".join(["a","b","c"]) -> a/b/c
                # 
                pass 
        
            
            if data_training_form["selected_full_path"][0] != "/":
                data_training_form["selected_full_path"] = "/" + data_training_form["selected_full_path"]
            data_training_form["selected_full_path"] = data_training_form["selected_full_path"].replace("//","/")

        if len(selected_depth) > 0:
            selected_depth.pop()


    for dataset in dataset_list:
        dataset["generable"] = True
        dataset["unsatisfied"] = {
            "dir": [],
            "file" : []
        }
        dataset_base_path = '{}/{}/datasets/{}/{}'.format(JF_WS_DIR, dataset["workspace_name"], dataset['type'], dataset['name'])
        tmp_data_training_form_list = copy.deepcopy(data_training_form_list)
        find_no_search_data_training_form(data_training_form_list=tmp_data_training_form_list, dataset_base_path=dataset_base_path, unsatisfied=dataset["unsatisfied"])
        dataset["data_training_form"] = tmp_data_training_form_list
        if len(dataset["unsatisfied"]["dir"]) > 0 or len(dataset["unsatisfied"]["file"]) > 0:
            dataset["generable"] = False

def comp_built_in_data_training_form_and_dataset_by_built_in_model(built_in_model_list, dataset):

    for built_in_model in built_in_model_list:
        built_in_model["generable"] = True
        built_in_model["unsatisfied"] = {
            "dir": [],
            "file" : []
        }
        dataset_base_path = '{}/{}/datasets/{}/{}'.format(JF_WS_DIR, dataset["workspace_name"], dataset['type'], dataset['name'])

def get_built_in_model(built_in_model_id):
    try:
        model = db.get_built_in_model(model_id=built_in_model_id)
        # parameter 값 보내기
        if db.get_built_in_model_parameter(model["id"]):
            parameter_list = [metric["parameter"]
                                for metric in db.get_built_in_model_parameter(model["id"])]
            parameter_value_list = [string_to_int_or_float(
                metric["default_value"]) for metric in db.get_built_in_model_parameter(model["id"])]
            parameter_description_list = [metric["parameter_description"]
                                            for metric in db.get_built_in_model_parameter(model["id"])]
            model["parameters"] = dict(
                zip(parameter_list, parameter_value_list))
            model["parameters_description"] = dict(
                zip(parameter_list, parameter_description_list))

        # training_input_data_form_list가져오기
        # if model["enable_to_train_with_gpu"] + model["enable_to_train_with_cpu"] > 0:
        built_in_model_training_form = db.get_built_in_model_data_training_form(model["id"])
        #TODO REMOVE - 더 이상 사용 안함
        # try:
        #     model["training_input_data_form_list"] = built_in_model_training_form
        # except:
        #     traceback.print_exc()

        try:
            model["training_input_data_form_list"] = transform_data_training_form_with_child(built_in_model_training_form)
        except:
            traceback.print_exc()

        # deployment_input_data_form_list, deployment_output_types 가져오기
        # if model["enable_to_deploy_with_gpu"] + model["enable_to_deploy_with_cpu"] > 0:
        try:
            model["deployment_input_data_form_list"] = db.get_built_in_model_data_deployment_form(
                model["id"])
        except:
            traceback.print_exc()
        try:
            if model["deployment_output_types"]:
                model["deployment_output_types"] = model["deployment_output_types"].split(
                    ",")
                model["deployment_output_types"] = [i.strip()
                                                    for i in model["deployment_output_types"]]
        except:
            traceback.print_exc()

        # send thumbnail image
        try:
            if model["thumbnail_path"]:
                thumbnail_file_path = os.path.join(
                    JF_BUILT_IN_MODELS_PATH, model["path"], model["thumbnail_path"])
            # else:
            #     thumbnail_file_path = os.path.join(JF_BUILT_IN_MODELS_PATH, "default_thumbnail.jpg")
                with open(thumbnail_file_path, "rb") as image_file:
                    file_extension = model["thumbnail_path"].split('.')[-1]
                    model["thumbnail_image"] = 'data:image/{};base64,'.format(
                        file_extension) + str(base64.b64encode(image_file.read()).decode())
        except:
            traceback.print_exc()

        return response(status=1, result=model)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Built in Simple get error : {}".format(e))

def built_in_model_list():
    try:
        built_in_model_ji_list = db.get_built_in_model_list()
        for model in built_in_model_ji_list:
            # parameter 값 보내기
            if db.get_built_in_model_parameter(model["id"]):
                parameter_list = [metric["parameter"]
                                  for metric in db.get_built_in_model_parameter(model["id"])]
                parameter_value_list = [string_to_int_or_float(
                    metric["default_value"]) for metric in db.get_built_in_model_parameter(model["id"])]
                parameter_description_list = [metric["parameter_description"]
                                              for metric in db.get_built_in_model_parameter(model["id"])]
                model["parameters"] = dict(
                    zip(parameter_list, parameter_value_list))
                model["parameters_description"] = dict(
                    zip(parameter_list, parameter_description_list))

            # training_input_data_form_list가져오기
            # if model["enable_to_train_with_gpu"] + model["enable_to_train_with_cpu"] > 0:
            try:
                model["training_input_data_form_list"] = db.get_built_in_model_data_training_form(
                    model["id"])
            except:
                traceback.print_exc()

            # deployment_input_data_form_list, deployment_output_types 가져오기
            # if model["enable_to_deploy_with_gpu"] + model["enable_to_deploy_with_cpu"] > 0:
            try:
                model["deployment_input_data_form_list"] = db.get_built_in_model_data_deployment_form(
                    model["id"])
            except:
                traceback.print_exc()
            try:
                if model["deployment_output_types"]:
                    model["deployment_output_types"] = model["deployment_output_types"].split(
                        ",")
                    model["deployment_output_types"] = [i.strip()
                                                        for i in model["deployment_output_types"]]
            except:
                traceback.print_exc()

            # send thumbnail image
            try:
                if model["thumbnail_path"]:
                    thumbnail_file_path = os.path.join(
                        JF_BUILT_IN_MODELS_PATH, model["path"], model["thumbnail_path"])
                # else:
                #     thumbnail_file_path = os.path.join(JF_BUILT_IN_MODELS_PATH, "default_thumbnail.jpg")
                    with open(thumbnail_file_path, "rb") as image_file:
                        file_extension = model["thumbnail_path"].split('.')[-1]
                        model["thumbnail_image"] = 'data:image/{};base64,'.format(
                            file_extension) + str(base64.b64encode(image_file.read()).decode())
            except:
                traceback.print_exc()

    except:
        traceback.print_exc()

    return response(status=1, result={"list": built_in_model_ji_list})

def built_in_model_list_for_dataset():
    """
        Description: Dataset 생성 눌렀을 때 빌트인 목록 및 목록 조회 시 나올 포맷 정보
        
        Args :
        
        Returns :
        ex)
        [
            {
                'id': 1002,
                'name': 'Simple Image Classification',
                'data_training_form': [
                {
                    'built_in_model_id': 1002,
                    'type': 'dir',
                    'name': '/',
                    'category': 'image',
                    'category_description': '하위에 train, val(선택) 폴더를 만들고 각 폴더 하위에 분류할 이미지 폴더가 들어가야 합니다. train 만 있을경우 train-validation-split이 랜덤으로 진행되며 validation data 를 따로 넣고싶은 경우 val 폴더에 넣어주세요',
                    'argparse': 'data',
                    'children': [],
                    'full_path': '/',
                    'depth': 0,
                    'temp_index': [0]
                },
                {
                    'built_in_model_id': 1002,
                    'type': 'dir',
                    'name': 'train',
                    'category': 'image',
                    'category_description': '해당 폴더(train) 하위에 분류할 이미지들이 폴더별로 나누어 들어가야 합니다.',
                    'argparse': None,
                    'children': [],
                    'full_path': '/train',
                    'depth': 1,
                    'temp_index': [1]
                }
            }
            ...
        ]
    """
    result = []
    try:
        built_in_model_list = db.get_built_in_model_list()

        for built_in_model in built_in_model_list:
            data_training_form_transform = transform_data_training_form_with_child(db.get_built_in_model_data_training_form(model_id=built_in_model["id"]))
            
            result.append({
                "id": built_in_model["id"],
                "name": built_in_model["name"],
                "data_training_form": data_training_form_transform
            })
        return result
    except Exception:
        traceback.print_exc()

    return result

def built_in_model_list_compatibility_check(dataset_id):
    """
        Description : Dataset ID 중심으로 Built in model들 최소 조건을 만족하는지 확인

        Args:
            dataset_id (int) : 비교하고자 하는 dataset_id

        Returns:
            list : 
            [
                {
                    "id": 1, 
                    "name": "built_in_name", 
                    "generable": True | False, 
                    "unsatisfied": {
                        "dir": [# 만족 못하는 폴더 full path], 
                        "file": [# 만족 못하는 파일 full path],
                    },
                    "data_training_form": {
                        ... (with children)
                    }
                }
            ]
        ex)
        [{
            'id': 1002,
            'name': 'Simple Image Classification',
            'generable': False,
            'unsatisfied': {'dir': ['train'], 'file': []},
            'data_training_form': [
                {'built_in_model_id': 1002,
                'type': 'dir',
                'name': '/',
                'category': 'image',
                'category_description': '하위에 train, val(선택) 폴더를 만들고 각 폴더 하위에 분류할 이미지 폴더가 들어가야 합니다. train 만 있을경우 train-validation-split이 랜덤으로 진행되며 validation data 를 따로 넣고싶은 경우 val 폴더에 넣어주세요',
                'argparse': 'data',
                'children': [],
                'full_path': '/',
                'depth': 0,
                'temp_index': [0]},
                {'built_in_model_id': 1002,
                    'type': 'dir',
                    'name': 'train',
                    'category': 'image',
                    'category_description': '해당 폴더(train) 하위에 분류할 이미지들이 폴더별로 나누어 들어가야 합니다.',
                    'argparse': None,
                    'children': [],
                    'full_path': '/train',
                    'depth': 1,
                    'temp_index': [1]}
            ]
        }]
    """
    dataset_info = db.get_dataset(dataset_id=dataset_id)
    dataset_list = [
        {
            "id": dataset_info["id"], 
            "name": dataset_info["name"], 
            "type": dataset_info["access"], 
            "workspace_name": dataset_info["workspace_name"] 
        }
    ]
    result = []
    try:
        built_in_model_list = db.get_built_in_model_list()

        for built_in_model in built_in_model_list:
            data_training_form_transform = transform_data_training_form_with_child(db.get_built_in_model_data_training_form(model_id=built_in_model["id"]))
            comp_built_in_data_training_form_and_dataset(dataset_list=dataset_list, data_training_form_list=data_training_form_transform)
            result.append({
                "id": built_in_model["id"],
                "name": built_in_model["name"],
                "generable": dataset_list[0]["generable"],
                "unsatisfied": dataset_list[0]["unsatisfied"],
                "data_training_form": dataset_list[0]["data_training_form"]
            })
        return result
    except Exception:
        traceback.print_exc()

    return result


def create_built_in_model_id(model_name, model_created_by):
    built_in_model_list = db.get_built_in_model_list()
    built_in_model_id_list = [model["id"] for model in built_in_model_list]
    model_id = max(built_in_model_id_list)+1

    return model_id


def make_null_value_in_json(info_json):
    for key in info_json.keys():
        if key == "training_input_data_form_list":
            for dic in info_json[key]:
                try:
                    for subkey in dic.keys():
                        if dic[subkey]=="" and subkey=="argparse":
                            dic[subkey] = None
                except:
                    pass
        # if key in BUILT_IN_LIST_KEY_LIST:
        #     for dic in info_json[key]:
        #         try:
        #             for subkey in dic.keys():
        #                 if dic[subkey] == "":
        #                     dic[subkey] = None
        #         except:
        #             pass
        # elif key in BUILT_IN_DIC_KEY_LIST:
        #     try:
        #         for subkey in info_json[key]:
        #             if info_json[key][subkey] == "":
        #                 info_json[key][subkey] = None
        #     except:
        #         pass
        # elif info_json[key] == "":
        #     info_json[key] = None
    return info_json

def replace_symbol(filename):
    for symbol in ['*', '?', '%', '&', '$', '(', ')', '#', '^', '@', '!', '~', '-', '+', '=', " ", ","]:
        if symbol in filename:
            filename = filename.replace(symbol, '_')
    filename = filename.replace(u'\xa0', u'_')
    return filename

def get_image_filename(image_filename):
    image_filename=replace_symbol(image_filename)
    extension_list = ['jpg', 'jpeg', 'png']
    if image_filename.split('.')[-1].lower() in extension_list:
        if image_filename.split('.')[-1].lower() == 'png':
            image_filename = '.'.join(image_filename.split('.')[:-1]+['png'])
        else:
            image_filename = '.'.join(image_filename.split('.')[:-1]+['jpeg'])
        return image_filename
    else:
        raise

def resize_thumbnail_image(filename):
    image = Image.open(filename)
    image.thumbnail((400,400))
    image.save(filename)


def built_in_model_list_for_annotation():
    try:
        built_in_model_ji_list = db.get_built_in_model_list(created_by="JI")
        result = {}
        for model in built_in_model_ji_list:
            if result.get(model["kind"]) is None:
                result[model["kind"]] = []

            # list에는 있지만 사용 불가
            # if int(model["id"]) >= 3000:
            #     model["id"] = -1

            if int(model["auto_labeling"])+int(model["marker_labeling"]) == 0:
                model["id"] = -1
                continue

            model["data_training_form"] = db.get_built_in_model_data_training_form(
                model["id"])

            result[model["kind"]].append(model)

    except:
        traceback.print_exc()

    return response(status=1, result={"list": result})


def get_built_in_paramters_info(built_in_model_id):
    built_in_model_parameter_info = db.get_built_in_model_parameter(
        model_id=built_in_model_id)
    parameters_info = {}
    for parameter in built_in_model_parameter_info:
        parameters_info[parameter["parameter"]] = {
            "default_value": parameter["default_value"],
            "description": parameter["parameter_description"]
        }
    return parameters_info


def activate_built_in_model(built_in_model_id, training_status, deployment_status):
    try:
        with jf_scheduler_lock:
            # 필수값 없는 경우
            if -1 in [training_status, deployment_status]:
                return response(status=0, message="Please fill in the required fields")
            # training status 받는 경우
            elif training_status is not None:
                status_type = 'training'
                status = training_status
            # deployment status 받는 경우
            elif deployment_status is not None:
                status_type = 'deployment'
                status = deployment_status

            # info json 의 status 값 변경
            built_in_info = db.get_built_in_model(model_id=built_in_model_id)
            built_in_model_path = os.path.join(
                JF_BUILT_IN_MODELS_PATH, built_in_info["path"])
            with open(os.path.join(built_in_model_path, built_in_info["infojson_path"]), mode="r") as json_file:
                info_json = json.load(json_file)
            info_json["{}_status".format(status_type)] = status
            # info_json["update_datetime"] = datetime.today().strftime("%Y-%m-%d %H:%M:%S")
            with open(os.path.join(built_in_model_path, built_in_info["infojson_path"]), mode="w") as f:
                json.dump(info_json, f, indent=4, ensure_ascii=False)

            # db update
            db.update_built_in_model_status(
                built_in_model_id, status_type, status, datetime.today().strftime("%Y-%m-%d %H:%M:%S"))

            # message 용 action list
            action_list = ["Deactivated", "Activated"]
            return response(status=1, message="Successfully [{}] Built In Model [{}]".format(action_list[status], status_type.capitalize()))
    except:
        traceback.print_exc()
        return response(status=-0, message="Activating/Deactivation Built In Model Error")

def update_detail_basic_info(update_info, base_info):
    if base_info.get("built_in_model_id") is not None:
        built_in_model_info = db.get_built_in_model(model_id=base_info["built_in_model_id"])
        if built_in_model_info is not None:
            update_info["built_in_model_info"]={}
            update_info["built_in_model_info"]["built_in_model_name"] = built_in_model_info["name"]
            update_info["built_in_model_info"]["built_in_model_description"] = built_in_model_info["description"]

def find_infojson(file_name_list):
    result=[]
    for s in file_name_list:
        s_list=s.split('.')
        try:
            if s_list[-1]==INFO_JSON_EXTENSION:
                result.append(s)
            elif s=='info.json':
                result.append(s)
        except:
            pass
    return result

def check_duplicated_info(info_list, unique_keys, identify_keys):
    def get_identify_info(info, identify_keys):
        identify_info = {}
        for identify_key in identify_keys:
            identify_info[identify_key] = info.get(identify_key)
        return identify_info

    # 중복 정보 받기
    duplicate_info = {}
    duplicate_exist = False
    for key in unique_keys:
        model_info_dict = {}
        duplicated_list = []
        duplicated_list_key_idx_dict = {}
        for info in info_list:
            if info.get(key) != None:
                identify_info = get_identify_info(info, identify_keys)
                if model_info_dict.get(info[key])!=None:
                    if info[key] in duplicated_list_key_idx_dict:
                        duplicated_list[duplicated_list_key_idx_dict[info[key]]]["list"].append(identify_info)
                    else:
                        duplicated_list_key_idx_dict[info[key]]=len(duplicated_list)
                        duplicated_list.append(
                            {
                                key : info[key],
                                "list" : [model_info_dict[info[key]],identify_info]
                            }
                        )
                else:
                    model_info_dict[info[key]] = identify_info
        duplicate_info[key] = duplicated_list
        if len(duplicated_list)>0:
            duplicate_exist = True
    result = {
        "duplicate_exist":duplicate_exist,
        "duplicate_info":duplicate_info
    }
    return result

def get_duplicated_built_in_model_info(unique_keys, identify_keys):
    try:
        models_path = settings.JF_BUILT_IN_MODELS_PATH
        models = os.listdir(models_path)
        model_info_list = []
        for model in models:
            model_dir_path = "{}/{}".format(models_path, model)
            if os.path.isdir(model_dir_path):
                model_dir_file_list = os.listdir(model_dir_path)
                file_name_list = find_infojson(model_dir_file_list)
                for file in file_name_list:
                    model_info_file_path = "{}/{}/{}".format(models_path, model, file)
                    if os.path.isfile(model_info_file_path):
                        json_data = common.load_json_file(model_info_file_path)
                        json_data["path"]=model
                        json_data["infojson_path"]=file
                        model_info_list.append(json_data)
        result = check_duplicated_info(info_list=model_info_list, unique_keys=unique_keys, identify_keys=identify_keys)
        return response(status=1, result=result)
    except:
        traceback.print_exc()
        return response(status=-0, message="Get Duplicated Info Error")

