from utils.exceptions import *
from flask import request
import functools
import traceback

# @사용 순서 예시 (ns.expect가 맨 아래에 존재할 경우 swagger에서 parameters가 안보임)
# @ns.expect
# @token_checker
# @training_access_check

DEPLOYMENT_ALLOW_MAX_LEVEL = 4
TRAINING_ALLOW_MAX_LEVEL = 4
WORKSPACE_ALLOW_MAX_LEVEL = 4
DATASET_ALLOW_MAX_LEVEL = 3
ADMIN_ALLOW_MAX_LEVEL = 1
IMAGE_ALLOW_MAX_LEVEL = 4

ACCESS_WORKSPACE = 0
ACCESS_ALL = 1


# =====================================================================================================
# ======================================ID GET=========================================================
# TODO 2021-12-13 id 조회 시 None이 나오는 경우는 해당 ITEM이 존재하지 않음. -> raise ItemNotExistError 로 바로 처리할 수 있도록
# get_workspace_id_from_deployment_id 처럼 사용. db_for_access_check 참조
def get_user_id_from_header_user(header_user):
    from utils.db import get_user_id
    try:
        user_id = get_user_id(header_user)["id"]
    except TypeError as te:
        raise ItemNotExistError("User Not Exist. Or Inaccessible. Check Header jf-user or user exist.")
    return user_id


def get_training_id_from_job_id(job_id):
    from utils.db import get_job
    try:
        job_info = get_job(job_id=job_id)
        training_id = job_info["training_id"]
    except TypeError as te:
        return None
    return training_id


def get_training_id_from_training_tool_id(training_tool_id):
    from utils.db import get_training_tool_only
    try:
        tool_info = get_training_tool_only(training_tool_id=training_tool_id)
        training_id = tool_info["training_id"]
    except TypeError as te:
        raise ItemNotExistError
    return training_id

def get_job_id_from_job_group_number(training_id, job_group_number):
    from utils.db import get_job_id_by_job_group_number
    try:
        job_id = get_job_id_by_job_group_number(training_id=training_id, job_group_number=job_group_number)
        if job_id is None:
            raise ItemNotExistError
    except Exception as e:
        raise e
    return job_id

def get_workspace_id_from_deployment_id(deployment_id):
    import utils.db as db
    workspace_id = db.get_workspace_id_from_deployment_id(deployment_id=deployment_id)
    return workspace_id


def get_dataset_info_from_dataset_id(dataset_id):
    import utils.db as db
    try:
        dataset_info = db.get_dataset_dir(dataset_id)
        if dataset_info is None:
            print("Dataset Not exist Error")
            raise ItemNotExistError
    except TypeError as te:
        print("Dataset inaccessible Error")
        raise InaccessibleDatasetError
    return dataset_info


def get_image_access(image_id):
    import utils.db as db
    try:
        access = db.get_image_single(image_id)['access']
    except TypeError as te:
        raise ItemNotExistError
    return access


# =====================================================================================================
def get_training_access_check_info(training_info):
    # training_info : db.get_training(training_id=training_id)
    import utils.db as db
    access_check_info = {
        "training_id": None,
        "workspace_id": None,
        "owner_id": None,  # user_id
        "access": None
    }

    access_check_info["training_id"] = training_info["id"]
    access_check_info["workspace_id"] = training_info["workspace_id"]
    access_check_info["owner_id"] = training_info["user_id"]
    access_check_info["access"] = training_info["access"]

    return access_check_info


####################################################################################
# 0
# is_my
def is_my_job(user_id, job_id):
    from utils.db import get_job
    try:
        if user_id == get_job(job_id=job_id)["creator_id"]:
            return True
    except TypeError as te:
        return False
    return False


# 1
# is_root
def is_root(user_id):
    # TODO admin이 1명이 아닌 케이스가 생기면 수정 필요
    if user_id == 1:
        return True
    return False


# 2
def is_workspace_manager(user_id, workspace_id=None, **kwargs):
    # TODO ws manager가 1명이 아닌 케이스가 생기면 수정 필요
    import utils.db as db
    manager_id = None
    if kwargs.get("manager_id") is not None:
        manager_id = kwargs.get("manager_id")
    else:
        manager_id = db.get_workspace(workspace_id=workspace_id)["manager_id"]

    try:
        if user_id == manager_id:
            return True
    except TypeError as te:
        return False
    return False


# 3
# is_item_owner or is_item_manager
def is_training_owner(user_id, owner_id=None, **training_access_check_info):
    if user_id == owner_id:
        return True
    return False

def is_deployment_owner(user_id, owner_id=None, **deployment_access_check_info):
    if user_id == owner_id:
        return True
    return False

def is_image_owner(user_id, image_id):
    import utils.db as db
    if db.get_image_single(image_id)["user_id"] == user_id:
        return True
    return False

def is_deployment_template_owner(user_id, deployment_template_owner_id=None, **deployment_template_access_check_info):
    if user_id == deployment_template_owner_id:
        return True
    return False

def is_deployment_template_group_owner(user_id, deployment_template_group_owner_id=None, **deployment_template_group_access_check_info):
    if user_id == deployment_template_group_owner_id:
        return True
    return False


# 4
# is_item_group_user
def is_workspace_user(user_id, workspace_id, **kwargs):
    import utils.db as db
    if workspace_id in [workspace["id"] for workspace in db.get_user_workspace(user_id=user_id)]:
        return True
    return False


def is_training_user(user_id, training_id=None, access=None, workspace_id=None, **training_access_check_info):
    import utils.db as db
    if access == 1:
        # public
        if training_access_check_info.get("workspace_users") is not None:
            user_id_list = training_access_check_info.get("workspace_users")
        else:
            user_id_list = list(map(lambda x: x['id'], db.get_workspace_users(workspace_id=workspace_id)))
    else:
        # private
        if training_access_check_info.get("training_users") is not None:
            user_id_list = training_access_check_info.get("training_users")
        else:
            user_id_list = list(map(lambda x: x['id'], db.get_training_users(training_id=training_id)))

    if user_id in user_id_list:
        return True
    return False


def is_deployment_user(user_id, deployment_id=None, access=None, workspace_id=None, **deployment_access_check_info):
    import utils.db as db
    if access == 1:
        # public
        if deployment_access_check_info.get("workspace_users") is not None:
            user_id_list = deployment_access_check_info.get("workspace_users")
        else:
            user_id_list = list(map(lambda x: x['id'], db.get_workspace_users(workspace_id=workspace_id)))
    else:
        # private
        if deployment_access_check_info.get("deployment_users") is not None:
            user_id_list = deployment_access_check_info.get("deployment_users")
        else:
            user_id_list = list(map(lambda x: x['id'], db.get_deployment_users(deployment_id=deployment_id)))

    if user_id in user_id_list:
        return True
    return False


# etc
def is_workspace_of_image(image_id, workspace_id):
    import utils.db as db
    if workspace_id in list(map(lambda x: x['workspace_id'], db.get_image_single(image_id)["workspace"])):
        return True
    return False


#######################################################################################################################
#######################################################################################################################
####################################################Workspace##########################################################
def check_workspace_access_level(user_id, workspace_id):
    # 1
    if is_root(user_id=user_id):
        return 1
    # 2
    if is_workspace_manager(user_id=user_id, workspace_id=workspace_id):
        return 2

    # 4
    if is_workspace_user(user_id=user_id, workspace_id=workspace_id):
        return 4

    return 6


def check_inaccessible_workspace(user_id, workspace_id, allow_max_level=4):
    import utils.db as db
    level = check_workspace_access_level(user_id=user_id, workspace_id=workspace_id)
    # print("ws access level ", level, allow_max_level)
    if level <= allow_max_level:
        return

    raise InaccessibleWorkspaceError


def workspace_access_check(parser=None, allow_max_level=WORKSPACE_ALLOW_MAX_LEVEL):
    from utils.resource import send
    import flask_restplus
    from utils.resource import response
    def deco_func(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            workspace_id = None
            try:
                user_id = get_user_id_from_header_user(request.headers.get('Jf-User'))
                if kwargs.get("workspace_id") is not None:
                    workspace_id = kwargs.get("workspace_id")
                # From args, body parser
                elif type(parser) == type(flask_restplus.reqparse.RequestParser()):
                    workspace_id = parser.parse_args().get("workspace_id")
                    if workspace_id is None:
                        if parser.parse_args().get("deployment_id") is not None:
                            workspace_id = get_workspace_id_from_deployment_id(
                                deployment_id=parser.parse_args().get("deployment_id"))

            except CustomErrorList as ce:
                traceback.print_exc()
                return send(response(status=0, **ce.response()))

            try:
                check_inaccessible_workspace(workspace_id=workspace_id, user_id=user_id,
                                             allow_max_level=allow_max_level)
            except CustomErrorList as ce:
                traceback.print_exc()
                return send(response(status=0, **ce.response()))
            return f(*args, **kwargs)

        wrapper._original = f
        return wrapper

    return deco_func


#######################################################################################################################
##################################################Training#############################################################

def check_training_access_level(user_id, training_id, **already_get_data):
    import utils.db as db
    required_variables_key_list = ["manager_id", "owner_id", "access", "workspace_users", "training_users"]
    required_variables = {
        "manager_id": None,
        "owner_id": None,
        "access": None,
        "workspace_users": None,
        "training_users": None,
    }
    required_variables.update(already_get_data)

    for req_var in required_variables_key_list:
        if required_variables.get(req_var) == None:
            training_info = db.get_training(training_id=training_id)
            if training_info is None:
                raise ItemNotExistError
            required_variables.update(get_training_access_check_info(training_info))
            break

    access_check_info = required_variables

    # 1
    if is_root(user_id=user_id):
        return 1

    # 2
    if is_workspace_manager(user_id=user_id, **access_check_info):
        return 2

    # 3
    if is_training_owner(user_id=user_id, **access_check_info):
        return 3

    # 4
    if is_training_user(user_id=user_id, **access_check_info):
        return 4

    return 5


def check_job_access_level(user_id, job_id):
    if is_my_job(user_id=user_id, job_id=job_id):
        return 0
    return 99


def check_inaccessible_training(user_id, training_id, allow_max_level=4, **more_option):
    level = check_training_access_level(user_id=user_id, training_id=training_id)

    if more_option.get("job_id") is not None:
        level = min(level, check_job_access_level(user_id=user_id, job_id=more_option.get("job_id")))
    elif more_option.get("job_group_number") is not None:
        job_id = get_job_id_from_job_group_number(training_id=training_id, job_group_number=more_option.get("job_group_number"))["id"]
        level =  min(level, check_job_access_level(user_id=user_id, job_id=job_id))

    # print("tr access level ", level, allow_max_level)
    if level <= allow_max_level:
        return level

    raise InaccessibleTrainingError


def training_access_check(parser=None, allow_max_level=TRAINING_ALLOW_MAX_LEVEL):
    from utils.resource import send
    from utils.db import get_user_id
    import flask_restplus
    from utils.resource import response
    def deco_func(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            more_option = {}
            training_id = None
            training_id_list = None
            try:
                user_id = get_user_id_from_header_user(request.headers.get('Jf-User'))
            except CustomErrorList as ce:
                traceback.print_exc()
                return send(response(status=0, **ce.response()))

            # From path parser
            if kwargs.get("training_id") is not None:
                training_id = kwargs.get("training_id")

            # From path parser (multiple item)
            elif kwargs.get("id_list") is not None:
                training_id_list = kwargs.get("id_list")
                training_id_list = training_id_list.split(',')

            # # From args, body parser (multiple item)
            elif type(parser) == type(flask_restplus.reqparse.RequestParser()):
                if parser.parse_args().get("training_id") is not None:
                    training_id = parser.parse_args().get("training_id")
                elif parser.parse_args().get("job_id") is not None:
                    job_id = parser.parse_args().get("job_id")
                    training_id = get_training_id_from_job_id(job_id=job_id)
                    more_option["job_id"] = job_id
                elif parser.parse_args().get("training_tool_id") is not None:
                    try:
                        training_tool_id = parser.parse_args().get("training_tool_id")
                        training_id = get_training_id_from_training_tool_id(training_tool_id=training_tool_id)
                    except CustomError as ce:
                        traceback.print_exc()
                        return send(response(status=0, **ce.response()))

                if parser.parse_args().get("job_group_number") is not None:
                    # Job group stop 시 사용하는 부분
                    job_group_number = parser.parse_args().get("job_group_number")
                    more_option["job_group_number"] = job_group_number

            try:
                if type(training_id_list) == type([]):
                    for training_id in training_id_list:
                        args[0].permission_level = check_inaccessible_training(training_id=training_id, user_id=user_id,
                                                                               allow_max_level=allow_max_level,
                                                                               **more_option)
                else:
                    args[0].permission_level = check_inaccessible_training(training_id=training_id, user_id=user_id,
                                                                           allow_max_level=allow_max_level,
                                                                           **more_option)
            except CustomErrorList as ce:
                traceback.print_exc()
                return send(response(status=0, **ce.response()))

            return f(*args, **kwargs)

        wrapper._original = f
        return wrapper

    return deco_func


def deco_test(*d_t_args, **d_t_kwargs):
    def deco_func(f):
        def wrapper(*args, **kwargs):
            print("d_t", d_t_args, d_t_kwargs)
            print("wrap", args, kwargs)
            args[0].add_param = 1234

            return f(*args, **kwargs)

        # For undeco
        wrapper._original = f
        return wrapper

    return deco_func


# def a(t_id):
#     # db.get_training(t_id)

#     def grade_1():
#         pass

#     def grade_2():
#         pass

#     def grade_3():
#         pass

#     def grade_4():
#         pass

#     return def b(flag):
#         if flag == 1:
#             return grade_1

#         elif flag == 2:
#             return grade_2


#######################################################################################################################
##################################################dataset#############################################################

def dataset_access_check(parser=None, allow_max_level=DATASET_ALLOW_MAX_LEVEL):
    from utils.resource import response
    from utils.resource import send
    import flask_restplus
    def deco_func(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            user_id = get_user_id_from_header_user(request.headers.get('jf-User'))
            if kwargs.get("id_list") is not None:
                dataset_id = kwargs.get("id_list")
            elif kwargs.get("dataset_id") is not None:
                dataset_id = kwargs.get("dataset_id")
            elif type(parser) == type(flask_restplus.reqparse.RequestParser()):
                dataset_id = parser.parse_args().get("dataset_id")

            try:
                check_inaccessible_dataset(user_id, [dataset_id], allow_max_level)
            except CustomErrorList as ce:
                traceback.print_exc()
                return send(response(status=0, **ce.response()))
            return f(*args, **kwargs)

        # For undecorator
        wrapper._original = f
        return wrapper

    return deco_func


def check_inaccessible_dataset(user_id, dataset_ids, allow_max_level=DATASET_ALLOW_MAX_LEVEL):
    for dataset_id in dataset_ids:
        dataset_info = get_dataset_info_from_dataset_id(dataset_id)
        # folder create/update or delete
        if allow_max_level == 4:
            if dataset_info['access'] == '0':
                allow_max_level = allow_max_level - 1
                # download or preview
        if allow_max_level == 5:
            allow_max_level = allow_max_level - 1

        level = check_dataset_access_level(user_id, dataset_info)
        print("dataset access level ", level, allow_max_level)
        if level <= allow_max_level:
            continue

        raise InaccessibleDatasetError(" Not Exist Item or Inaccessible")


def check_dataset_access_level(user_id, access_check_info):
    # 1
    if is_root(user_id=user_id):
        return 1

    # 2
    if is_workspace_manager(user_id=user_id, workspace_id=access_check_info["workspace_id"]):
        return 2

    # 3
    if user_id == access_check_info["create_user_id"]:
        return 3

    # 4
    if is_workspace_user(user_id=user_id, workspace_id=access_check_info["workspace_id"]):
        return 4

    return 5


def get_dataset_access_check_info(dataset_info):
    access_check_info = {
        "dataset_id": None,
        "workspace_id": None,
        "create_user_id": None,  # user_id
        "access": None,
        "workspace_manager": None
    }

    access_check_info["dataset_id"] = dataset_info["id"]
    access_check_info["workspace_id"] = dataset_info["workspace_id"]
    access_check_info["create_user_id"] = dataset_info["create_user_id"]
    access_check_info["access"] = dataset_info["access"]
    access_check_info["workspace_manager"] = dataset_info["workspace_manager"]

    return access_check_info


#######################################################################################################################
##################################################NODES#############################################################
def check_admin_access_level(user_id):
    # 1
    if is_root(user_id=user_id):
        return 1

    return 6


def check_inaccessible_admin(user_id, allow_max_level):
    admin_access_level = check_admin_access_level(user_id)

    if admin_access_level <= allow_max_level:
        return admin_access_level

    raise InaccessibleAdminError


def admin_access_check(parser=None, allow_max_level=ADMIN_ALLOW_MAX_LEVEL):
    from utils.resource import send
    from utils.db import get_user_id
    import flask_restplus
    from utils.resource import response
    def deco_func(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            try:
                user_id = get_user_id_from_header_user(request.headers.get('Jf-User'))
                args[0].permission_level = check_inaccessible_admin(user_id=user_id, allow_max_level=allow_max_level)
            except CustomErrorList as ce:
                traceback.print_exc()
                return send(response(status=0, **ce.response()))

            return f(*args, **kwargs)

        wrapper._original = f
        return wrapper

    return deco_func


#######################################################################################################################
##################################################Deployment###########################################################

def get_deployment_access_check_info(deployment_info):
    access_check_info = {
        "deployment_id": None,
        "workspace_id": None,
        "owner_id": None,  # user_id
        "access": None,
    }

    access_check_info["deployment_id"] = deployment_info["id"]
    access_check_info["workspace_id"] = deployment_info["workspace_id"]
    access_check_info["owner_id"] = deployment_info["user_id"]
    access_check_info["access"] = deployment_info["access"]

    return access_check_info

def get_deployment_template_access_check_info(template_info):
    access_check_info = {
        "template_id": None,
        "workspace_id": None,
        "deployment_template_owner_id": None,  # user_id
        "deployment_template_group_owner_id":None
    }

    access_check_info["template_id"] = template_info["id"]
    access_check_info["workspace_id"] = template_info["workspace_id"]
    access_check_info["deployment_template_owner_id"] = template_info.get("deployment_template_owner_id")
    access_check_info["deployment_template_group_owner_id"] = template_info.get("deployment_template_group_owner_id")

    return access_check_info

def check_deployment_access_level(user_id, deployment_id, **already_get_data):
    import utils.db as db
    required_variables_key_list = ["manager_id", "owner_id", "access", "workspace_users", "deployment_users"]
    required_variables = {
        "manager_id": None,
        "owner_id": None,
        "access": None,
        "workspace_users": None,
        "deployment_users": None,
    }
    required_variables.update(already_get_data)

    for req_var in required_variables_key_list:
        if required_variables.get(req_var) == None:
            required_variables.update(get_deployment_access_check_info(db.get_deployment(deployment_id=deployment_id)))
            break

    access_check_info = required_variables

    # 1
    if is_root(user_id=user_id):
        return 1

    # 2
    if is_workspace_manager(user_id=user_id, **access_check_info):
        return 2

    # 3
    if is_deployment_owner(user_id=user_id, **access_check_info):
        return 3

    # 4
    if is_deployment_user(user_id=user_id, **access_check_info):
        return 4

    return 5

def check_deployment_template_access_level(user_id, deployment_template_id=None, deployment_template_group_id=None, **already_get_data):
    import utils.db as db
    required_variables_key_list = ["template_id", "workspace_id", "deployment_template_owner_id", "deployment_template_group_owner_id"]
    required_variables = {
        "template_id": None,
        "workspace_id": None,
        "deployment_template_owner_id": None,  # user_id deployment_template
        "deployment_template_group_owner_id":None # user_id deployment_template_group
    }
    required_variables.update(already_get_data)

    for req_var in required_variables_key_list:
        if required_variables.get(req_var) == None:
            if deployment_template_id !=None:
                deployment_template_info = db.get_deployment_template(deployment_template_id=deployment_template_id)
                if deployment_template_info==None:
                    raise DeploymentTemplateNotExistError
                deployment_template_info["deployment_template_owner_id"] = deployment_template_info["user_id"]
                required_variables.update(get_deployment_template_access_check_info(deployment_template_info))
                break
            elif deployment_template_group_id != None:
                deployment_template_group_info = db.get_deployment_template_group(deployment_template_group_id=deployment_template_group_id)
                if deployment_template_group_info==None:
                    raise DeploymentTemplateGroupNotExistError
                deployment_template_group_info["deployment_template_group_owner_id"] = deployment_template_group_info["user_id"]
                required_variables.update(get_deployment_template_access_check_info(deployment_template_group_info))
                break

    access_check_info = required_variables

    # 1
    if is_root(user_id=user_id):
        return 1

    # 2
    if is_workspace_manager(user_id=user_id, **access_check_info):
        return 2
    
    if is_deployment_template_group_owner(user_id=user_id, **access_check_info):
        return 3
    # 3
    if is_deployment_template_owner(user_id=user_id, **access_check_info):
        return 4

    # 4
    if is_workspace_user(user_id=user_id, **access_check_info):
        return 5

    return 5

# def check_job_access_level(user_id, job_id):
#     if is_my_job(user_id=user_id, job_id=job_id):
#      1   return 0
#     return 99

def check_inaccessible_deployment(user_id, deployment_id, allow_max_level=4, **more_option):
    level = check_deployment_access_level(user_id=user_id, deployment_id=deployment_id)

    # if more_option.get("job_id") is not None:
    #     level = min(level, check_job_access_level(user_id=user_id, job_id=more_option.get("job_id")))

    # print("dep access level ", level, allow_max_level)
    if level <= allow_max_level:
        return level

    raise InaccessibleDeploymentError

def check_inaccessible_deployment_template(user_id, deployment_template_id=None, deployment_template_group_id=None , allow_max_level=4, **more_option):
    try:
        level = check_deployment_template_access_level(user_id=user_id, deployment_template_id=deployment_template_id, 
                                                        deployment_template_group_id=deployment_template_group_id)

        if level <= allow_max_level:
            return level

        raise InaccessibleDeploymentError
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception as e:
        raise e 

def deployment_access_check(parser=None, allow_max_level=DEPLOYMENT_ALLOW_MAX_LEVEL):
    from utils.resource import send
    from utils.db import get_user_id, get_deployment_id_from_worker_id
    import flask_restplus
    from utils.resource import response
    def deco_func(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            more_option = {}
            deployment_id = None
            deployment_id_list = None
            # user_id = get_user_id_from_header_user(request.headers.get('Jf-User'))
            try:
                user_id = get_user_id_from_header_user(request.headers.get('Jf-User'))
            except CustomErrorList as ce:
                traceback.print_exc()
                return send(response(status=0, **ce.response()))

            # From path parser
            if kwargs.get("deployment_id") is not None:
                deployment_id = kwargs.get("deployment_id")

            # From path parser (multiple item)
            elif kwargs.get("id_list") is not None:
                deployment_id_list = kwargs.get("id_list")
                deployment_id_list = deployment_id_list.split(',')

            # From path parser worker
            elif kwargs.get("deployment_worker_id") is not None:
                deployment_worker_info = get_deployment_id_from_worker_id(deployment_worker_id=kwargs.get("deployment_worker_id"))
                deployment_id=deployment_worker_info["deployment_id"]

            # From args, body parser
            elif type(parser) == type(flask_restplus.reqparse.RequestParser()):
                if parser.parse_args().get("deployment_id") is not None:
                    deployment_id = parser.parse_args().get("deployment_id")
                elif parser.parse_args().get("deployment_worker_id") is not None:
                    deployment_worker_info = get_deployment_id_from_worker_id(deployment_worker_id=parser.parse_args().get("deployment_worker_id"))
                    deployment_id=deployment_worker_info["deployment_id"]
                elif parser.parse_args().get("deployment_worker_id_list") is not None:
                    deployment_worker_id_list = parser.parse_args().get("deployment_worker_id_list")
                    deployment_worker_id_list = deployment_worker_id_list.split(',')
                    deployment_worker_info = get_deployment_id_from_worker_id(deployment_worker_id=deployment_worker_id_list[0])
                    deployment_id=deployment_worker_info["deployment_id"]

            try:
                if type(deployment_id_list) == type([]):
                    for deployment_id in deployment_id_list:
                        args[0].permission_level = check_inaccessible_deployment(deployment_id=deployment_id,
                                                                                 user_id=user_id,
                                                                                 allow_max_level=allow_max_level,
                                                                                 **more_option)
                else:
                    args[0].permission_level = check_inaccessible_deployment(deployment_id=deployment_id,
                                                                             user_id=user_id,
                                                                             allow_max_level=allow_max_level,
                                                                             **more_option)
            except CustomErrorList as ce:
                traceback.print_exc()
                return send(response(status=0, **ce.response()))

            return f(*args, **kwargs)

        wrapper._original = f
        return wrapper

    return deco_func


#######################################################################################################################
##################################################Built_in_model#######################################################

def check_built_in_model_access_level(user_id):
    # 1
    if is_root(user_id=user_id):
        return 1

    return 6


def built_in_model_access_check(parser, allow_max_level=DATASET_ALLOW_MAX_LEVEL):
    def deco_func(f):
        def wrapper(*args, **kwargs):
            return f(*args, **kwargs)

        # For undecorator
        wrapper._original = f
        return wrapper

    return deco_func


#######################################################################################################################
##################################################Image################################################################
def check_image_access_level(user_id, image_id, workspace_id, priority):
    # 1
    if is_root(user_id=user_id):
        return 1

    if priority == "MANAGER":
        if is_workspace_of_image(image_id, workspace_id):
            if is_workspace_manager(user_id, workspace_id):
                return 2

        if is_image_owner(user_id, image_id):
            return 3

    if priority == "OWNER":
        if is_image_owner(user_id, image_id):
            return 2

        if is_workspace_of_image(image_id, workspace_id):
            if is_workspace_manager(user_id, workspace_id):
                return 3

    # 4
    if is_workspace_user(user_id=user_id, workspace_id=workspace_id):
        return 4

    return 6


def check_inaccessible_image(user_id, image_id, workspace_id, allow_max_level, method, priority="MANAGER"):
    level = check_image_access_level(user_id=user_id, image_id=image_id, workspace_id=workspace_id, priority=priority)

    # level access
    if priority == "OWNER":
        allow_max_level -= 1  # allow_max_level == 3

        if method == "IMAGE_UPDATE":  # allow_max_level == 2
            allow_max_level -= 1

        elif method == "IMAGE_DELETE":
            image_access = get_image_access(image_id)
            if image_access == ACCESS_ALL:  # allow_max_level == 2
                allow_max_level -= 1

    if level <= allow_max_level:
        return level

    raise InaccessibleImageError


def image_access_check(parser=None, method=None, priority="MANAGER", allow_max_level=IMAGE_ALLOW_MAX_LEVEL):
    from utils.resource import send, response
    import flask_restplus
    import utils.db as db
    def deco_func(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            user_id = get_user_id_from_header_user(request.headers.get('Jf-User'))
            workspace_id_list = None
            delete_list = []

            if type(parser) == type(flask_restplus.reqparse.RequestParser()):
                # 수정
                if parser.parse_args().get("image_id") is not None:
                    image_id = parser.parse_args().get("image_id")                    
                if parser.parse_args().get("workspace_id_list") is not None:
                    workspace_id_list = parser.parse_args().get("workspace_id_list")

                # 삭제
                if parser.parse_args().get("workspace_id") is not None:
                    workspace_id = parser.parse_args().get("workspace_id")
                if parser.parse_args().get("delete_all_list") is not None:
                    delete_all_list = parser.parse_args().get("delete_all_list")
                    delete_list += delete_all_list
                if parser.parse_args().get("delete_ws_list") is not None:
                    delete_ws_list = parser.parse_args().get("delete_ws_list")
                    delete_list += delete_ws_list

            try:
                if method == "IMAGE_UPDATE":
                    for workspace_id in workspace_id_list:
                        level = check_inaccessible_image(user_id=user_id, image_id=image_id, workspace_id=workspace_id,
                                                         priority=priority, method=method, allow_max_level=allow_max_level)
                if method == "IMAGE_DELETE":
                    for image_id in delete_list:
                        # 없는 이미지 체크
                        if not db.get_image_single(image_id):
                            raise ItemNotExistError("Some of Image does not Exist. Reload page and Try again")               
                        
                        level = check_inaccessible_image(user_id=user_id, image_id=image_id, workspace_id=workspace_id,
                                                         priority=priority, method=method, allow_max_level=allow_max_level)

            except CustomErrorList as ce:
                traceback.print_exc()
                return send(response(status=0, **ce.response()))
            return f(*args, **kwargs)
        
        wrapper._original = f
        return wrapper
    
    return deco_func

def get_sample_access_level(user_id, **already_get_data) -> int:
    """access level 반환"""
    import utils.db as db
    required_variables = {
        "manager_id": None,
        "owner_id": None,
        "access": None,
        "workspace_users": None,
        "deployment_users": None,
    }
    required_variables.update(already_get_data)

    if is_root(user_id=user_id):
        return 1
    if is_workspace_manager(user_id=user_id, **required_variables):
        return 2
    if is_deployment_owner(user_id=user_id, **required_variables):
        return 3
    if is_deployment_user(user_id=user_id, **required_variables):
        return 4
    return 5

def check_inaccessible_sample(user_id, allow_max_level):
    access_level = get_sample_access_level(user_id=user_id)
    # 유저의 access level이 낮으면 InaccessibleSampleError 에러 raise
    if access_level <= allow_max_level:
        return access_level
    raise InaccessibleSampleError

def sample_access_check(parser=None, allow_max_level=WORKSPACE_ALLOW_MAX_LEVEL):
    from utils.resource import send, response
    import flask_restplus
    import utils.db as db
    def deco_func(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            # Get Permission level
            try:
                user_id = get_user_id_from_header_user(request.headers.get('Jf-User'))
                permission_level = check_inaccessible_sample(user_id=user_id,
                                                             allow_max_level=allow_max_level)
            except CustomErrorList as ce:
                traceback.print_exc()
                return send(response(status=0, **ce.response()))
            
            # Path parser
            if kwargs:
                if kwargs.get("post_id_int") is not None:
                    post_id_int = kwargs.get("post_id_int")
                if kwargs.get("post_id_float") is not None:
                    post_id_float = kwargs.get("post_id_float")
                if kwargs.get("post_id_str") is not None:
                    post_id_str = kwargs.get("post_id_str")
                if kwargs.get("post_id_list") is not None:
                    post_id_list = kwargs.get("post_id_list")
                if kwargs.get("post_id_dict") is not None:
                    post_id_dict = kwargs.get("post_id_dict")

            # Query parser
            elif isinstance(parser, flask_restplus.reqparse.RequestParser):
                if parser.parse_args().get("post_id_int") is not None:
                    post_id_int = parser.parse_args().get("post_id_int")
                if parser.parse_args().get("post_id_float") is not None:
                    post_id_float = parser.parse_args().get("post_id_float")
                if parser.parse_args().get("post_id_str") is not None:
                    post_id_str = parser.parse_args().get("post_id_str")
                if parser.parse_args().get("post_id_list") is not None:
                    post_id_list = parser.parse_args().get("post_id_list")
                if parser.parse_args().get("post_id_dict") is not None:
                    post_id_dict = parser.parse_args().get("post_id_dict")
  
            return f(*args, **kwargs)
        wrapper._original = f
        return wrapper

    return deco_func

def sample_delete_access_check(parser=None, allow_max_level=WORKSPACE_ALLOW_MAX_LEVEL):
    from utils.resource import send, response
    import utils.db as db
    import flask_restplus
    def deco_func(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            # Get Permission level
            try:
                user_id = get_user_id_from_header_user(request.headers.get('Jf-User'))
                permission_level = check_inaccessible_sample(user_id=user_id, 
                                                                allow_max_level=allow_max_level)
            except CustomErrorList as ce:
                traceback.print_exc()
                return send(response(status=0, **ce.response()))
            
            # Path parser
            if kwargs:
                if kwargs.get("delete_id") is not None:
                    delete_id = kwargs.get("delete_id")
            
            # Query parser
            if isinstance(parser, flask_restplus.reqparse.RequestParser):
                if parser.parse_args().get("delete_id") is not None:
                    delete_id = parser.parse_args().get("delete_id")
            
            return f(*args, **kwargs)
        wrapper._original = f
        return wrapper
    
    return deco_func
                            