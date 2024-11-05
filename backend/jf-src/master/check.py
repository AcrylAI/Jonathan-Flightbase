from restplus import api
from utils.resource import CustomResource, response, token_checker

ns = api.namespace('token', description="token 관련용")

@ns.route('/update', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class SessionUpdate(CustomResource):
    @token_checker
    def get(self):
        """GET"""
        res = response(status=1, message="For token update")
        return self.send(res)