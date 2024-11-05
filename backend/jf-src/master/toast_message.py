from restplus import api
from utils.resource import CustomResource, response, token_checker

ns = api.namespace('toast-message', description="toast-message list 조회용")

@ns.route('/exception', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class ExceptionList(CustomResource):
    def get(self):
        """ 
            예외 처리 리스트 확인
        """       
        try:
            from utils.exceptions import get_exception_list as exception_list
            return exception_list()
        # except CustomErrorList as ce:
        #     return self.send(response(status = 0, result = ce.response()))
        except Exception as e:
            return self.send(response(status = 0, message = 'Undefind Error'))