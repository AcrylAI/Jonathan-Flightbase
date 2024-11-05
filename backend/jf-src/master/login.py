# from flask_restful import Resource
from utils.resource import response, token_checker
from flask_restplus import reqparse, Resource
from restplus import api
from flask import request
import json

from utils.linux import linux_login_check
from utils.resource import CustomResource
import utils.db as db
from utils.crypt import session_cipher, front_cipher
import utils.crypt as crypt
from utils.common import log_access

import traceback
from settings import MAX_NUM_OF_LOGINS, LOGIN_METHOD, LOGIN_VALIDATION_CHECK_API, KISTI_OTP_ROOT_USER_ID

import time

parser = reqparse.RequestParser()
# Router Function


ns = api.namespace('login', description='Login API')

login_parser = api.parser()
login_force_parser = api.parser()


if LOGIN_METHOD == "jfb":
    login_parser.add_argument('user_name', type=str, required=True, location='json')
    login_parser.add_argument('password', type=str, required=True, location='json')    
    
    login_force_parser.add_argument('user_name', type=str, required=True, location='json')
    login_force_parser.add_argument('password', type=str, required=True, location='json')
    login_force_parser.add_argument('token', type=str, required=True, location='json')

    def login_valid_check(**kwargs):
        password_check_result, message = password_check(**kwargs)
        if password_check_result == False:
            return False, message
        
        return True, ""

elif LOGIN_METHOD == "jonathan":
    def jonanthan_token_check(**kwargs):
        return False
            
    def login_valid_check(**kwargs):
        return False, ""
elif LOGIN_METHOD == "kisti":
    def otp_check(user_name, otp, **kwargs):
        return False, ""

    def login_valid_check(**kwargs):
        return False, ""

def password_check(user_name, password, **kwargs):
    password = front_cipher.decrypt(password)
    if linux_login_check(user_name, password) == False:
        user_info = db.get_user(user_name=user_name)
        login_warn=""
        if user_info is not None:
            # login counting
            if user_info["login_counting"] >= 2:
                login_warn = "(Retrials : {} times / Remaining retrials : {} times)".format(user_info["login_counting"]+1, MAX_NUM_OF_LOGINS-(user_info["login_counting"]+1))
            if user_info["login_counting"]+1 >= MAX_NUM_OF_LOGINS:
                update_result, message = db.update_user_login_counitng(user_id=user_info["id"])
                return False, response(status=0, message="ID {} locked.".format(user_name), locked=True)

            update_result, message = db.update_user_login_counitng(user_id=user_info["id"])
            login_counting = user_info["login_counting"] + 1
            if not update_result:
                print("Login db error log : ",message)
                #return response(status=0, message="Please retry login with correct ID and password. : {}".format(message), login_counting=login_counting)
        return False, response(status=0, message="Please retry login with correct ID and password.\n{}".format(login_warn))

    return True, ""


def login(**kwargs):
    try:
        valid_check_result, message = login_valid_check(**kwargs)

        if valid_check_result == False:
            return message
        
        jp_user_info = None
        if LOGIN_METHOD == "jonathan" and kwargs["user_name"] is None:
            pass
            
        user_name = kwargs["user_name"]
        user_info = db.login(user_name)
        
        if user_info is not None:
            result = {"user_name": user_name, "token": None, "logined_session": None,
                    "admin": True if user_name == 'root' else False, "logined": False}

            # gen token
            token = crypt.gen_user_token(user_name, 0)
            result["token"] = token
            user_id = user_info["id"]

            if user_info["login_counting"] >= MAX_NUM_OF_LOGINS:
                return response(status=0, message="ID {} locked.".format(user_name), locked=True)
            
            # check user login
            login_result, message = db.get_login_session(user_id=user_id)

            if login_result is not None:
                # already logined
                result["logined"] = True
                ret = response(status=1, result=result, login=True)
                log_access({'username':user_name, 'header':dict(request.headers), 'ret':ret})
                return ret

            print("insert_login_session")
            insert_result, message = db.insert_login_session(user_id=user_id, token=token)
            if not insert_result:
                return response(status=0, message="Login session error")
            result["logined_session"] = db.get_login_session(token=token)[0]["id"]
            db.update_user_login_counitng(user_id=user_id, set_default=True)
            ret = response(status=1, result=result, login=True)
            log_access({'username':user_name, 'header':dict(request.headers), 'ret':ret})
            return ret
        else:
            return response(status=0, message="Please retry login with correct ID and password.")
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Login Error")


def login_force(user_name, password, user_token):
    try:
        # if password_check(user_name, password) == False:
        #     # exist user check
        #     user_info = db.get_user(user_name=user_name)
        #     if user_info is not None:
        #         # login counting
        #         update_result, message = db.update_user_login_counitng(user_id=user_info["id"])
        #         login_counting = user_info["login_counting"] + 1
        #         if not update_result:
        #             return response(status=0, message="Please retry login with correct ID and password.", login_counting=login_counting)
        #             #return response(status=0, message="Please retry login with correct ID and password. : {}".format(message), login_counting=login_counting)
        
        token_user, start_timestamp, gen_count = crypt.decrypt_user_token(user_token)
        cur_timestamp = time.time()
        if not (token_user == user_name and gen_count == 0):  
            return response(status=0, message="Login error : invalid token for {}".format(user_name))
        if not (cur_timestamp - start_timestamp) < 60:
            return response(status=0, message="Login error : expired token")

        user_token = crypt.gen_user_token(user_name, 0)

        result = {"user_name": user_name, "token": user_token, "logined_session": None,
                "admin": True if user_name == 'root' else False, "logined": False}
        
        # if LOGIN_METHOD == "jonathan":
        #     jp_user_info = get_user_info_with_jp_token(request)
        #     if jp_user_info is not None:
        #         if jp_user_info["photo_url"] is not None:
        #             result['photo_url'] = jp_user_info["photo_url"]
        #         if jp_user_info["name"] is not None:
        #             result['jp_user_name'] = jp_user_info["name"]

        user_id = db.get_user(user_name=user_name)["id"]
        db.delete_login_session(user_id=user_id)
        insert_result, message = db.insert_login_session(user_id=user_id, token=user_token)
        result["logined_session"] = db.get_login_session(token=user_token)[0]["id"]
        if not insert_result:
            return response(status=0, message="Login session error", login_counting=login_counting)
            #return response(status=0, message="Login session error : {}".format(message), login_counting=login_counting)
        db.update_user_login_counitng(user_id=user_id, set_default=True)
        return response(status=1, result=result, login=True)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Login Force Error")
        #return response(status=0, message="Login Force Error: {}".format(str(e)))

def session_copy(user_name):
    try:

        user_token = crypt.gen_user_token(user_name, 0)
        user_id = db.get_user(user_name=user_name)["id"]
        insert_result, message = db.insert_login_session(user_id=user_id, token=user_token)
        print("!@#!@#",insert_result, message)

        result = {"user_name": user_name, "token": user_token, "logined_session": None,
                "admin": True if user_name == 'root' else False}
        result["logined_session"] = db.get_login_session(token=user_token)[0]["id"]
        return response(status=1, result=result, login=True)
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message="Session copy error : {}".format(e))

@ns.route("", methods=['POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class Login(CustomResource):
    @ns.expect(login_parser)
    def post(self):
        # if LOGIN_METHOD == "jonathan":
        #     from login_jonathan import login

        args = login_parser.parse_args()

        ret = login(**args)

        return self.send(ret)


@ns.route("/force", methods=['POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class LoginForce(CustomResource):
    @ns.expect(login_force_parser)
    def post(self):
        args = login_force_parser.parse_args()

        user_name = args["user_name"]
        password = args.get("password") or "" 
        token = args['token']
        
        res = login_force(user_name=user_name, password=password, user_token=token)

        return self.send(res)

@ns.route("/session_copy")
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class LoginSessionCopy(CustomResource):
    @token_checker
    def post(self):
        res = session_copy(user_name=self.check_user())

        return self.send(res)
