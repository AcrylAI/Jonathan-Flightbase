# from flask_restful import Resource
from utils.resource import CustomResource, response, token_checker
from flask_restplus import reqparse, Resource
from restplus import api
from flask import request

from utils.linux import linux_login_check
from utils.resource import CustomResource
import utils.db as db
from utils.crypt import session_cipher, front_cipher
import utils.crypt as crypt
from utils.common import log_access

import traceback
import time
parser = reqparse.RequestParser()
# Router Function

ns = api.namespace('logout', description='Logout API')

login_parser = api.parser()
login_parser.add_argument('user_name', type=str, required=True, location='json')
login_parser.add_argument('password', type=str, required=True, location='json')    

def logout(user_id, token):
    # delete login_session
    db.delete_login_session(user_id=user_id)
    return response(status=1, message="success", logout=True)

@ns.route("", methods=['POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class Logout(CustomResource):
    @token_checker
    def post(self):
        ret = logout(user_id=self.check_user_id(), token=self.check_token())

        log_access({'username':request.headers.get('Jf-User'), 'header':dict(request.headers), 'ret':ret})

        return self.send(ret)
