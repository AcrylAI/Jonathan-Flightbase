# from flask_restful import Resource
from utils.resource import response
from flask_restplus import reqparse
from flask import send_file
from restplus import api
from utils.common import JfLock, global_lock, generate_alphanum
from utils.resource import CustomResource, token_checker
import utils.db as db
import utils.crypt as cryptUtil
from utils.linux import linux_login_check, linux_user_create, linux_user_uid_update
from utils.exceptions import *
import requests
import os
import spwd
import pwd
import crypt
from datetime import datetime
import traceback
import subprocess

from utils.crypt import front_cipher

import settings
JF_ETC_DIR = settings.JF_ETC_DIR
MAX_NUM_OF_LOGINS = settings.MAX_NUM_OF_LOGINS

parser = reqparse.RequestParser()
# Router Function

ns = api.namespace('users', description='USER API')

# User GET
user_parser_get = api.parser()
user_parser_get.add_argument('search_key', required=False, default=None, type=str, location='args', help='User Search Key "name" or "user_type"... ')
user_parser_get.add_argument('size', required=False, default=None, type=int, location='args', help='User List Item Size')
user_parser_get.add_argument('page', required=False, default=None, type=int, location='args', help='User Page Number')
user_parser_get.add_argument('search_value', required=False, default=None, type=str, location='args', help='User Search value')


# User POST
user_parser_create = api.parser()
user_parser_create.add_argument('workspaces_id', type=list, required=False, default=[], location='json', help="User Workspace list ex) [1,2,3]")
user_parser_create.add_argument('new_user_name', type=str, required=True, location='json', help="Create User Name")
user_parser_create.add_argument('password', type=str, required=True ,location='json', help="Create User Password")
user_parser_create.add_argument('user_type', type=int, required=True ,location='json', help="Create User Type ex) 0, 1, 2, 3 (admin, workspace manager, training manager, user)")
user_parser_create.add_argument('usergroup_id', type=int, required=False, default=None, location='json', help="usergroup_id")

# # User DELETE
# user_parser_delete = api.parser()
# user_parser_delete.add_argument('users_id', type=list, required=True, location='json', help="Delete User id")

# User PUT
user_parser_update = api.parser()
user_parser_update.add_argument('select_user_id', type=int, required=True ,location='json', help="Update User Id")
user_parser_update.add_argument('new_password', type=str, required=False, default="", location='json', help="Update User Password")
user_parser_update.add_argument('workspaces_id', type=list, required=False, default=[], location='json', help="Update User Workspace ex) [] ==> All delete ")
user_parser_update.add_argument('usergroup_id', type=int, required=False, default=None, location='json', help="usergroup_id")



user_workspace_parser_get = api.parser()
user_workspace_parser_get.add_argument('user_id', type=int, required=True ,location='args', help="User ID Workspace List")

user_private_key_get = api.parser()
user_private_key_get.add_argument('user_name', required=False, default=None, type=str, location='args', help='Get a private key')

user_password_update = api.parser()
user_password_update.add_argument('password', required=True, type=str, location='json', help='password (encryt)')
user_password_update.add_argument('new_password', required=True, type=str, location='json', help='new password (encryt)')

# 리눅스 계정 복구
linux_user_recover = api.parser()
linux_user_recover.add_argument('user_ids', required=False, type=list, location='json', help="유저 Id 목록 ex. [1, 2, 3]")
linux_user_recover.add_argument('password', required=False, type=str, location='json', help="복구 시 설정할 패스워드")

def check_user_name(user_name, headers_user):
    try:
        if headers_user is None:
            return response(status=0, message="Jf-user is None in headers")
        user_nmae_list = []
        for p in pwd.getpwall():
            user_nmae_list.append(p[0])
        result = user_name in user_nmae_list
        if result :
            return response(status=0, message="Already Exist User name")        
        else:
            return response(status=1, message="OK")        
    except:
        return response(status=0, message="Check user name Error")


def get_users(search_key, size, page, search_value):    
    user_list = db.get_user_list(search_key=search_key, size=size, page=page, search_value=search_value)
    for user_n, user in enumerate(user_list):
        locked = False if user["login_counting"] < MAX_NUM_OF_LOGINS else True
        item = {
            "id": user["id"],
            "name": user["name"],
            "locked": locked,
            "user_type": user["user_type"],
            "real_user_type": user["real_user_type"],
            "create_datetime": user["create_datetime"],
            "update_datetime": user["update_datetime"],
            "workspaces": user["workspaces"],
            "trainings": user["trainings"],
            "deployments": user["deployments"],
            "images": user["images"],
            "datasets": user["datasets"],
            "usergroup": user["group_name"],
            "not_in_linux": check_user_in_linux(user_name=user["name"], uid=user["uid"])
            #"deployments":
        }
        user_list[user_n] = item

    if user_list is None:
        return response(status=0, message="User list get Error ")

    return response(status=1, message="OK", result={"list": user_list, "total": len(user_list)} )


def get_user(user_id):
    result = []
    try:
        # if users_id is not None:
        #     # Select Some User(s)
        #     for user_id in users_id:
        #         user_data = db.get_user(user_id=user_id)
        #         if user_data == None:
        #             return response(status=1, message="User ID [{}] Not Found ".format(user_id))
        #         user_data["training"] = db.get_user_training(user_id)
        #         user_data["workspace"] = db.get_user_workspace(user_id)
        #         result.append(user_data)
        # else:
        #     # Select All User
        #     result = db.get_user_list()
        #     for user_data in result:
        #         user_data["training"] = db.get_user_training(user_data['id'])
        #         user_data["workspace"] = db.get_user_workspace(user_data['id'])

        user_data = db.get_user(user_id=user_id)
        result = {
            "user_name": user_data["name"],
            "group_id": user_data["group_id"]
        }

    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Get User Error", result=result)
        #return response(status=0, message="Get User Error [{}]".format(e), result=result)
    return response(status=1, result=result)
    

def check_exist_user_from_linux(new_user_name):
    flag = False
    for p in pwd.getpwall():
        if new_user_name == p[0]:
            return True
    return flag

def add_superset_users(create_user_list, password_raw_list):
    url = "http://{}:8088/jf-user/add/".format(settings.HOST_IP)
    for i, user_info in enumerate(create_user_list):

        data = {
            'username': user_info["new_user_name"],
            'password': password_raw_list[i]
        }
        response = requests.post(url, data=data)
        print("SUPERSET ADD USER STATUS",response.status_code)  # HTTP 상태 코드 출력
        print("SUPERSET ADD USER RESPONSE",response.text)         # 응답 본문 출력

def delete_superset_users(delete_user_list):
    url = "http://{}:8088/jf-user/delete/".format(settings.HOST_IP)
    for i, user_name in enumerate(delete_user_list):

        data = {
            'username': user_name
        }
        response = requests.post(url, data=data)
        print("SUPERSET DELETE USER STATUS",response.status_code)  # HTTP 상태 코드 출력
        print("SUPERSET DELETE USER RESPONSE",response.text)   

def update_superset_user(username, new_password):
    url = "http://{}:8088/jf-user/update-password/".format(settings.HOST_IP)
    new_password = front_cipher.decrypt(new_password)
    data = {
        'username': username,
        'new_password': new_password
    }
    response = requests.post(url, data=data)
    print("SUPERSET UPDATE USER STATUS",response.status_code)  # HTTP 상태 코드 출력
    print("SUPERSET UPDATE USER RESPONSE",response.text)         # 응답 본문 출력

def create_user(create_user_list: [{}], headers_user):
    # new_user_name
    # password
    # workspaces_id
    def rollback():
        for new_user in create_user_list:
            new_user_name = new_user["new_user_name"]
            os.system('userdel {}'.format(new_user_name)) # rollback
            # os.system('cp /etc/group /etc/gshadow /etc/passwd /etc/shadow /{etc_host}/'.format(etc_host=JF_ETC_DIR)) #etc backup
            etc_backup()

    if headers_user is None:
        return response(status=0, message="Jf-user is None in headers")

    # Check Uesr name exist in db or filesystem
    exist_user_name_db = []
    exist_user_name_filesystem = []
    for new_user in create_user_list:
        if "workspaces_id" not in new_user.keys():
            new_user["workspaces_id"] = []
        if check_exist_user_from_linux(new_user["new_user_name"]):
            exist_user_name_filesystem.append(new_user["new_user_name"])
        if db.get_user(user_name=new_user["new_user_name"]) is not None:
            exist_user_name_db.append(new_user["new_user_name"])

    if len(exist_user_name_filesystem) > 0 or len(exist_user_name_db) > 0:
        return response(status=0, message="Already Exist User(s) name in FileSystem : [{}] and in DB : [{}] ".format(",".join(exist_user_name_filesystem),",".join(exist_user_name_db)))

    # /bin/bash useradd
    # 2s ~ 4s (users 5 ) 
    useradd_error = False    
    password_superset_list = []
    for new_user in create_user_list:
        new_user_name = new_user["new_user_name"]
        password_raw = new_user["password"]
        try:
            password = front_cipher.decrypt(password_raw)
            # enc_pw = crypt.crypt(password, "$6$") # pw encrypt
            # os.system("useradd -s /bin/bash -p '{}' {}".format(enc_pw, new_user_name)) # create user, pw 
            linux_user_create(user_name=new_user_name, password=password)
            uid = pwd.getpwnam(new_user_name).pw_uid # get new pid
            new_user["uid"] = uid
            password_superset_list.append(password)
            # cryptUtil.createAKeyForSSH(new_user_name)
        except Exception as e:
            # create error rollback
            traceback.print_exc()
            rollback()
            useradd_error = e
            break
    # os.system('cp /etc/group /etc/gshadow /etc/passwd /etc/shadow /etc_host/') #etc backup
    etc_backup()
    if useradd_error:
        return response(status=0, message="Create Error")
        #return response(status=0, message="Create Error: {}".format(useradd_error))

    # db write
    try:
        # insert user
        insert_result = db.insert_user_s(create_user_list=create_user_list,create_datetime=datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        if insert_result is not None:
            # Add Superset Users
            if settings.SUPERSET_ADD_USER:
                try:
                    add_superset_users(create_user_list=create_user_list, password_raw_list=password_superset_list)
                except:
                    traceback.print_exc()
            users_id = db.get_users_id([new_user["new_user_name"] for new_user in create_user_list])            
            for i, new_user in enumerate(create_user_list):
                new_user["user_id"] = users_id[i]["id"]                
                new_user["workspaces_name"] = [ workspace['workspace_name'] for workspace in db.get_workspace_list(workspaces_id=new_user["workspaces_id"])]
        
                usergroup_id = new_user["usergroup_id"]
                if usergroup_id is None:
                    continue
                db.insert_user_usergroup_list(usergroup_id_list=[usergroup_id], user_id_list=[users_id[i]["id"]])

            #user add in workspace
            workspaces_id = [new_user["workspaces_id"] for new_user in create_user_list]
            # print('create_user_list')
            # print(create_user_list)
            users_id = [new_user["user_id"] for new_user in create_user_list]
            if db.insert_user_workspace_s(workspaces_id=workspaces_id, users_id=users_id):
                message = ""
                logging_user_name = []
                for new_user in create_user_list:
                    logging_user_name.append(new_user['new_user_name'])
                    message+= "Create User [{}] in Workspace [{}]\n".format(new_user["new_user_name"],new_user["workspaces_name"])                    
                        
                return response(status=1, message=message)
            else :
                rollback()
                return response(status=0, message="DB insert user_workspace Error, Workspace not Exist")
        else:
            rollback()
            return response(status=0, message="DB insert user Error")
    except:
        traceback.print_exc()
        rollback()
        return response(status=0, message="Error Create User [{}]".format(new_user_name))

def check_user_have_training(user_id):
    #TODO User training Status Check + (running / stop)
    flag = True
    try:
        user_training = db.get_user_training(user_id=user_id, only_owner=True)
        if user_training is not None:
            if len(user_training) == 0:
                flag = False
                return flag, ""
            else:
                user_training = [training["name"] for training in user_training]
                return flag, response(status=0, message="User has training(s) [{}]".format(",".join(user_training)))
        else:
            return flag, response(status=0, message="User training Check Error ")
    except Exception as e:
        traceback.print_exc()
        return flag, response(status=0, message="Check user have training Error")
        #return flag, response(status=0, message="[{}]".format(e))
    

def check_user_have_deployment(user_id):
    flag = True
    try:
        user_deployment = db.get_user_deployment(user_id=user_id, only_owner=True)
        if user_deployment is not None:
            if len(user_deployment) == 0:
                flag = False
                return flag, ""
            else:
                user_deployment = [deployment["name"] for deployment in user_deployment]
                return flag, response(status=0, message="User has deployment(s) [{}]".format(",".join(user_deployment)))
        else:
            return flag, response(status=0, message="User deployment Check Error ")
    except Exception as e:
        traceback.print_exc()
        return flag, response(status=0, message="Check user has deployment Error")


def check_if_workspace_manager(user_id):
    flag = True
    try:
        manager_workspace = db.get_manager_workspace(user_id=user_id)
        if manager_workspace is not None:
            if len(manager_workspace) == 0:
                flag = False
                return flag, ""
            else:
                workspaces = [workspace["name"] for workspace in manager_workspace]
                return flag, response(status=0, message="User is a manager of workspace(s) [{}]".format(",".join(workspaces)))
        else:
            return flag, response(status=0, message="If user is a workspace manager Check Error ")
    except Exception as e:
        traceback.print_exc()
        return flag, response(status=0, message="Check if user is a workspace manager Error")


def delete_users(id_list, headers_user):
    #User Exist Check
    if headers_user is None:
        return response(status=0, message="Jf-user is None in headers")

    user_name_and_id_list = db.get_user_name_and_id_list(id_list)
    if user_name_and_id_list is None or len(user_name_and_id_list) != len(id_list):
        return response(status=0, message="User Not Exist ")

    message = ""
    for user_info in user_name_and_id_list:
        #Check User have training
        flag_training, check_response_training = check_user_have_training(user_id=user_info["id"])
        if flag_training:
            message += "[{}] ".format(user_info["name"])+check_response_training["message"] +"\n"
        
        #Check User have deployment
        flag_deployment, check_response_deployment = check_user_have_deployment(user_id=user_info["id"])
        if flag_deployment:
            message += "[{}] ".format(user_info["name"])+check_response_deployment["message"] +"\n"

        flag_workspace, check_response_workspace = check_if_workspace_manager(user_id=user_info["id"])
        if flag_workspace:
            message += "[{}] ".format(user_info["name"])+check_response_workspace["message"] +"\n"

    if message:
        return response(status=0,message=message)

    #Delete User in DB and Linux
    if db.delete_users(id_list):
        for user_info in user_name_and_id_list:
            os.system('userdel {}'.format(user_info["name"]))
        # os.system('cp /etc/group /etc/gshadow /etc/passwd /etc/shadow /etc_host/') #etc backup
        etc_backup()
        if settings.SUPERSET_ADD_USER:
            try:
                delete_superset_users(delete_user_list=[user_info["name"] for user_info in user_name_and_id_list])
            except:
                traceback.print_exc()
        return response(status=1, message="Delete User [{}]".format(",".join([user_info["name"] for user_info in user_name_and_id_list])))
    else:
        return response(status=0, message="DB delete user Error")

def user_passwd_change(user_name, new_password, decrypted=False):
    from utils.ssh_sync import update_user_etc
    flag = False
    # if root is None:
    # 	chk = linux_login_check(user_name,old_password)
    # 	if chk == False:
    # 		return {"r": -2, "msg": "User Password Wrong" }
    
    d_new_password = front_cipher.decrypt(new_password) if decrypted == False else new_password
    p = subprocess.Popen([ "/usr/sbin/chpasswd" ], universal_newlines=True, shell=False, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    (stdout, stderr) = p.communicate(user_name + ":" + d_new_password + "\n")
    flag = True
    assert p.wait() == 0
    if stdout or stderr:
        flag = False
        # raise Exception("Error encountered changing the password!")
    
    etc_backup()
    update_user_etc(user_id=db.get_user_id(user_name=user_name)["id"])

    return flag

def update_user(select_user_id, new_password, workspaces_id, usergroup_id, headers_user):
    # { select_user_id, new_password, user_type, workspaces_id }
    #TODO change User(not root) password case
    if headers_user is None:
        return response(status=0, message="Jf-user is None in headers")
    try:
        # User ID Exist Check
        user_info = db.get_user(user_id=select_user_id)
        if user_info is None:
            return response(status=0,message="No match user")
        
        '''
        workspace id 사용하는 시절이 되면 살릴 부분 
        # User Workspace Update
        user_workspace_update_message = ""
        delete_workspaces_id_list = []
        select_workspaces_id_list = workspaces_id
        user_workspaces = db.get_user_workspace(select_user_id)
        if user_workspaces is not None:
            for user_workspace in user_workspaces:
                if user_workspace["id"] not in workspaces_id:
                    #Delete Current User Workspace Id
                    #IF THERE ARE NO training
                    user_workspace_trainings = db.get_user_workspace_training(user_id=select_user_id, workspace_id=user_workspace["id"])
                    if  user_workspace_trainings is None or len(user_workspace_trainings) == 0:
                        delete_workspaces_id_list.append(user_workspace["id"])
                    else:
                        user_training_names = [training["name"] for training in user_workspace_trainings]
                        user_workspace_update_message += "Cannot Remove Workspace [{1}] User Have training [{0}] in Workspace [{1}] \n".format(",".join(user_training_names),user_workspace["workspace_name"])
        
        delete_result = db.delete_user_workspace_s(workspaces_id=[delete_workspaces_id_list], users_id=[select_user_id])
        insert_result = db.insert_user_workspace_s(workspaces_id=[select_workspaces_id_list], users_id=[select_user_id])
        if delete_result and insert_result:
            user_workspace_update_message += "User Workspace Update \n"
        '''

        #User Password Update
        password_change_message = ""
        if new_password != "":
            user_name = user_info["name"]
            try:                    
                change_result = user_passwd_change(user_name=user_name, new_password=new_password)
                if change_result:
                    if settings.SUPERSET_ADD_USER:
                        update_superset_user(username=user_name, new_password=new_password)
                    # os.system('cp /etc/group /etc/gshadow /etc/passwd /etc/shadow /etc_host/') #etc backup
                    password_change_message += "Updated user [{}] Password change OK \n".format(user_name)
                    update_result , *_ = db.update_user_login_counitng(user_id=select_user_id, set_default=True)
                    if not update_result:
                        password_change_message += "change lock error \n" 
                else:
                    password_change_message += "Updated user [{}] Fail \n".format(user_name)
            except Exception as e:
                traceback.print_exc()
                return response(status=0, message="Change Password Error")
                #return response(status=0, message="Change Password Error {}".format(e))
        
        if usergroup_id is not None:
            db.delete_user_usergroup(user_id=select_user_id)
            db.insert_user_usergroup_list(usergroup_id_list=[usergroup_id], user_id_list=[select_user_id])
        else :
            db.delete_user_usergroup(user_id=select_user_id)
        
        
        return response(status=1, message="Updated User \n {}".format(password_change_message))
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Upadet user error : {}".format(e))

def update_user_password(password, new_password, headers_user):
    try:
        # from utils.ssh_sync import update_workspace_users_etc
        if linux_login_check(headers_user, front_cipher.decrypt(password)) == False:
        # if linux_login_check(headers_user, password) == False:
            return response(status=0, message="User password not matched")
        else :
            result = user_passwd_change(user_name=headers_user, new_password=new_password)
            if result == True:

                # for workspace in db.get_user_workspace(user_id=db.get_user_id(user_name=headers_user)["id"]):
                #     update_workspace_users_etc(workspace_id=workspace["id"])
                return response(status=1, message="User password updated")
            else :
                return response(status=1, message="User password update fail")

    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Update user password error : {}".format(e))


def init_users():
    if os.system("ls /etc_host/passwd") == 0:
        os.system("cp {etc_host}/group {etc_host}/gshadow {etc_host}/passwd {etc_host}/shadow /etc/".format(etc_host=JF_ETC_DIR)) # BACKUP DATA TO DOCKER
    else :
        os.system('cp /etc/group /etc/gshadow /etc/passwd /etc/shadow {etc_host}/'.format(etc_host=JF_ETC_DIR))

def etc_backup():
    os.system('cp /etc/group /etc/gshadow /etc/passwd /etc/shadow {etc_host}/'.format(etc_host=JF_ETC_DIR)) #etc backup

ALREADY_EXIST = 0
NOT_FOUND = 1
ALREADY_EXIST_BUT_UID_DISMATCH = 2

def check_user_in_linux(user_name: str = None, uid: int = None, user_id: int = None) -> int:
    """
    Description: 리눅스 계정 존재 및 정상 여부(name과 uid가 db값과 일치) 체크

    Args:
        user_id (int): 유저 Id
        user_name (str): 유저 name
        uid (int): 유저 uid

    Returns:
        int: 리눅스 계정 유무 존재, 정상 여부 체크 (0, 1, 2)

    Examples:
        check_user_in_linux(3, 'test_id', 192)  # 0 (존재 O) | 1 (존재 X) | 2 (존재 O. but uid 불일치)
    """
    try:
        if user_name is None or uid is None:
            user_id, user_name, uid, *_ = db.get_user(user_id=user_id)
        
        for p in pwd.getpwall():
            PW_NAME = p[0]
            PW_UID = p[2]
            if user_name == PW_NAME:
                if uid == PW_UID:
                    return ALREADY_EXIST
                return ALREADY_EXIST_BUT_UID_DISMATCH
        return NOT_FOUND
        
    except Exception as e:                                      
        traceback.print_exc()

# def recovery_linux_user():
#     """
#         Description : 유저 정보는 
#                         - DB(ID, UID)
#                         - Linux 계정 관리(Password)
#                       나뉘어서 관리 되고 있음
#                       DB 데이터는 DB에 문제가 된 경우 
#                       Linux 계정은 경우에 파일이 지워지는 경우 날아갈 수 있음

#     """
#     try:
#         pass

#     except Exception as e:
#         traceback.print_exc()
#         raise e

def recover_linux_user(user_ids=None, password=None):  
    """
    Description: 리눅스 계정 존재 및 정상 여부(name과 uid가 db값과 일치)파악 및 계정 생성 or 수정(uid) 함수

    Args:
        user_ids (list): 복구 or 수정하고자 하는 유저 Id 목록. Defaults to None.
        password (str): 복구 패스워드. 입력 값 없을 시 random string. Defaults to None.

    Returns:
        bool: True | None 

    Examples:
        recovery_linux_user(user_ids=[1, 2, 3], password="root")  # Id 가 1, 2, 3인 유저 리눅스 계정 복구
    """    
    try:
        password: str = password if password else generate_alphanum(10)
        users = filter(lambda x: x['id'] in user_ids, db.get_user_list()) if user_ids else db.get_user_list()
        
        for user in users:
            result: int = check_user_in_linux(user_id=user['id'], user_name=user['name'], uid=user['uid'])
            
            if result == NOT_FOUND:  # 존재 X
                linux_user_create(user_name=user['name'], password=password, uid=user['uid'])
                db.update_user_login_counting_set(user_id=user['id'], value=MAX_NUM_OF_LOGINS)
                # print("useradd success")
            elif result == ALREADY_EXIST:  # 존재
                continue
            elif result == ALREADY_EXIST_BUT_UID_DISMATCH:  # 존재하지만 uid가 다른 경우
                linux_user_uid_update(user_name=user['name'], uid=user['uid'])
                # print("usermod success")
       
        etc_backup()
    except Exception as e:
        traceback.print_exc()
    else:
        return True

# def update_users(update_user_list: [{}]):
#     # { select_user_id, new_password, user_type, workspaces_id }
#     #TODO change User(not root) password case

#     # User Type Update
#     update_result = db.update_user(update_user_list=update_user_list)

#     # user workspace update
#     if update_result:
#         users_id = [ update_user_dic["select_user_id"] for update_user_dic in update_user_list]

#         delete_workspaces_id_list = []
#         delete_workspaces_user_id_list = []
#         select_workspaces_id_list = []
#         select_workspaces_user_id_list = []
#         for i, user_id in enumerate(users_id):
#             if "workspaces_id" in update_user_list[i].keys():
#                 user_workspaces = db.get_user_workspace(user_id)
#                 if user_workspaces is not None:
#                     select_workspaces_id = update_user_list[i]["workspaces_id"]
#                     user_workspaces_id = [ user_workspace["id"] for user_workspace in user_workspaces]

#                     delete_workspaces_id = []
#                     for user_workspace_id in user_workspaces_id:
#                         if user_workspace_id not in select_workspaces_id:
#                             delete_workspaces_id.append(user_workspace_id)

#                     delete_workspaces_id_list.append(delete_workspaces_id)
#                     delete_workspaces_user_id_list.append(user_id)
#                     select_workspaces_id_list.append(select_workspaces_id)
#                     select_workspaces_user_id_list.append(user_id)

#         delete_result = db.delete_user_workspace_s(workspaces_id=delete_workspaces_id_list, users_id=delete_workspaces_user_id_list)
#         insert_result = db.insert_user_workspace_s(workspaces_id=select_workspaces_id_list, users_id=select_workspaces_user_id_list)

#         message = ""
#         for i, update_user in enumerate(update_user_list):
#             users_name = db.get_users_name([update_user["select_user_id"]])
#             if len(users_name) == 0:
#                 return response(status=0,message="No match user")
#             user_name = users_name[0]["name"]
#             if "new_password" in update_user.keys() and update_user["new_password"] != "":
#                 try:                    
#                     new_password = update_user["new_password"]
#                     change_result = user_passwd_change(user_name=user_name, new_password=new_password)
#                     if change_result:
#                         os.system('cp /etc/group /etc/gshadow /etc/passwd /etc/shadow /etc_host/') #etc backup
#                         message += "Updated user [{}] Password change OK \n".format(user_name)
#                     else:
#                         message += "Updated user [{}] Fail \n".format(user_name)
#                 except:
#                     traceback.print_exc()
#                     return response(status=0, message="Change Password Error "+message)
#             else:
#                 message += "Updated user [{}] OK \n".format(user_name)
#         return response(status=1, message=message)
            
#     else:
#         return response(status=0, message="User update Fail")


@ns.route("", methods=['GET', 'POST', 'PUT'])
@ns.route('/<id_list>', methods=['DELETE'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class User(CustomResource):
    @token_checker
    @ns.expect(user_parser_get)
    def get(self):
        """USER GET"""
        # user?user_id=1&user_id=2
        # user #ALL
        args = user_parser_get.parse_args()

        search_key = args["search_key"]
        size = args["size"]
        page = args["page"]
        
        search_value = args["search_value"]
        res = get_users(search_key=search_key, size=size, page=page, search_value=search_value)
        db.request_logging(self.check_user(), 'users', 'get', str(args), res['status'])

        return self.send(res)
    @token_checker
    @ns.expect(user_parser_create)
    def post(self):
        """USER CREATE"""
        # {
        #     "new_user_name": "typeadd1",
        #     "password": "1234",
        #     "workspace_ids": [],
        #     "user_type" : 0
        # }

        args = user_parser_create.parse_args()
        password = args['password']
        new_user_name = args['new_user_name']
        workspaces_id = args['workspaces_id']
        user_type = args['user_type']
        usergroup_id = args['usergroup_id']

        create_user_list = [{"new_user_name": new_user_name, "password": password, "workspaces_id": workspaces_id, "user_type": user_type, "usergroup_id": usergroup_id}]
        print("@@@@",create_user_list)

        flag, check_response = self.is_root()
        if flag == False:
            return self.send({"status": 0, "message":"Permission Error"})

        res = create_user(create_user_list=create_user_list, headers_user=self.check_user())        

        db.request_logging(self.check_user(), 'users', 'post', str(args), res['status'])

        return self.send(res)

    @token_checker
    @ns.param('id_list', 'id list')
    def delete(self, id_list):
        """USER DELETE"""        
        #     id_list = '1,2,3'        
        id_list = id_list.split(',')

        flag, check_response = self.is_root()
        if flag == False:
            return self.send({"status": 0, "message":"Permission Error"})

        res = delete_users(id_list=id_list, headers_user=self.check_user())
        db.request_logging(self.check_user(), 'users/'+str(id_list), 'delete', None, res['status'])


        return self.send(res)

    @token_checker
    @ns.expect(user_parser_update)
    def put(self):
        """USER UPDATE"""
        # {
        #     "select_user_id": 3,
        #     "new_password": "4321",
        #     "workspaces_id": [1,2,3],  #[] = All Remove
        #     "user_type": 2
	    # }
        args = user_parser_update.parse_args()
        select_user_id = args['select_user_id']
        new_password = args['new_password']
        #user_type = args['user_type'] #TODO user_type 처리 어떻게? root 비밀번호 변경하면 프론트에서 3 쏴줘서 user로 변함
        workspaces_id = args['workspaces_id']
        usergroup_id = args['usergroup_id']

        res = update_user(select_user_id=select_user_id, new_password=new_password, 
                                workspaces_id=workspaces_id, usergroup_id=usergroup_id, headers_user=self.check_user())

        db.request_logging(self.check_user(), 'users', 'put', str(args), res['status'])

        # update_user_list = [{"select_user_id": select_user_id, "new_password": new_password, "user_type": user_type, "workspaces_id": workspaces_id}]
        # response = update_user(update_user_list)


        return self.send(res)

   
    
@ns.route('/<int:user_id>', methods=['GET'], doc={'params': {'user_id': 'User ID'}})
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class UserSimple(CustomResource):
    @token_checker
    def get(self, user_id):
        """유저 ID 단순 조회"""
        user_id = user_id

        res = get_user(user_id=user_id)

        db.request_logging(self.check_user(), 'users/'+str(user_id), 'get', None, res['status'])

        return self.send(res)

@ns.route('/check/<user_name>', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class UserCheck(CustomResource):    
    @token_checker
    def get(self, user_name):
        """유저 name check"""        
        res = check_user_name(user_name=user_name, headers_user=self.check_user())

        db.request_logging(self.check_user(), 'users/check/'+str(user_name), 'get', None, res['status'])

        return self.send(res)

@ns.route('/getpk/<user_name>', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class getPrivateKey(CustomResource):    
    @token_checker
    def get(self,user_name):
        return send_file('/home/' + user_name +'/.ssh/' + user_name)

def get_user_workspaces(user_id):
    try:
        workspace_list = db.get_user_workspace(user_id=user_id)
    except Exception as e:
        return response(status=0,message="Get user workspaces Error")
        #return response(status=0,message=e)
    
    return response(status=1,result=workspace_list)


@ns.route('/workspaces', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class UserWorkspaces(CustomResource):    
    @token_checker
    def get(self):
        """유저 Workspace List"""        

        args = user_workspace_parser_get.parse_args()
        user_id = args["user_id"]
        res = get_user_workspaces(user_id=user_id)
        db.request_logging(self.check_user(), 'users/workspaces', 'get', str(args), res['status'])

        return self.send(res)

@ns.route('/password', methods=['PUT'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class UserPassword(CustomResource):    
    @token_checker
    @ns.expect(user_password_update)
    def put(self):
        """유저 Password Update"""        

        args = user_password_update.parse_args()
        password = args["password"]
        new_password = args["new_password"]
        res = update_user_password(password=password, new_password=new_password, headers_user=self.check_user())
        # db.request_logging(self.check_user(), 'users/workspaces', 'get', str(args), res['status'])

        return self.send(res)

@ns.route("/recover-linux-user", methods=["POST"])
@ns.response(200, "Success")
@ns.response(400, "Validation Error")
class RecoverLinuxUser(CustomResource):
    @token_checker
    @ns.expect(linux_user_recover)
    def post(self):
        """
            리눅스 계정 존재 및 정상 여부(name과 uid가 db값과 일치)파악 및 계정 생성 or 수정(uid)
            ---
            # Input
                "user_ids" (list[int]) : 유저의 Id 목록
                "password" (str) : 복구 패스워드
            # Input example
                # Id가 1, 2, 3인 유저 리눅스 계정 복구
                {
                    "user_ids": [1, 2, 3],
                    "password": "root"
                }
            # Return
                "result" true | null,
                "message": "Success"
                "status" : 1
            # Return example
                {
                    "result": true,
                    "message": "Success",
                    "status": 1
                }

        """
        args = linux_user_recover.parse_args()
        try:
            user_ids = args["user_ids"]
            password = args["password"] 
        
            result = recover_linux_user(user_ids, password)
            
            return self.send(response(status=1, message="Success", result=result))
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=f"Recover Linux User error : {e}"))
