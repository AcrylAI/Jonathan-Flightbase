from flask_restplus import reqparse, Resource
from utils.resource import CustomResource, token_checker
from utils.resource import response
from restplus import api
ns = api.namespace('', description='Worker API')

@ns.route('/test', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class TEST(CustomResource):
    @token_checker
    def get(self):
        """TEST """
        # db.get_login_session(session_id=header_session)
        print("!@#!@$@!TKR#KT")
        return response(status=1, message="TEST 중")

        