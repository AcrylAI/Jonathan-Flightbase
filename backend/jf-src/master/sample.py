from utils.resource import CustomResource, token_checker
from utils.resource import response
from utils.exceptions import CustomErrorList, CustomError, TrainingAlreadyRunningError
from restplus import api
from flask_restplus import reqparse
from werkzeug.datastructures import FileStorage
import traceback
import json
from utils.access_check import sample_access_check, sample_delete_access_check

ns = api.namespace('SAMPLEROUTE', description='SAMPLE API')

# Request 마다 다른 parser 객체 생성 및 사용
# GET
get_parser = api.parser()
get_parser.add_argument('get_id', required=True, default=None, type=int, location='args', help='Sample_GET_int')

# POST - raw(json)
post_parser = api.parser()
post_parser.add_argument('post_id_int',    required=True, default=0,    type=int,   location='json', help='Sample_POST_int')
post_parser.add_argument('post_id_float',  required=True, default=0,    type=float, location='json', help='Sample_POST_float')
post_parser.add_argument('post_id_str',    required=True, default="",   type=str,   location='json', help='Sample_POST_str')
post_parser.add_argument('post_id_dict',   required=True, default=None, type=dict,  location='json', help='Sample_POST_dict')
post_parser.add_argument('post_id_list',   required=True, default=None, type=list,  location='json', help='Sample_POST_list')
# post_parser.add_argument('post_id_list',   required=True, default=[], type=list, location='json', help='Sample Help')  # x (잘못된 예)

# POST - form
form_parser = api.parser()
form_parser.add_argument('form_id_file', required=True, default=None, type=FileStorage, location='files', help='Sample_POST_form_file')
form_parser.add_argument('form_id_int',  required=True, default=0,    type=int,         location='form',  help='Sample_POST_form_int')
form_parser.add_argument('form_id_float',required=True, default=0,    type=float,       location='form',  help='Sample_POST_form_float')
form_parser.add_argument('form_id_str',  required=True, default="",   type=str,         location='form',  help='Sample_POST_form_str')
form_parser.add_argument('form_id_dict', required=True, default=None, type=json.loads,  location='form',  help='Sample_POST_form_dict')
form_parser.add_argument('form_id_list', required=True, default=None, type=list,        location='form',  help='Sample_POST_form_list')

# PUT
put_parser = api.parser()
put_parser.add_argument('put_id', required=True, default=None, type=int, location='json', help='Sample_PUT_int')

# DELETE
delete_parser = api.parser()
delete_parser.add_argument('delete_id', required=True, default=None, type=int, location='json', help='Sample_DELETE_int')

def sample_do_func(sample_id, method):
    try:
        result = {
            "sample_id": sample_id,
            "method": method,
        }
        return response(status=1, result=result, message="OK")
    except CustomErrorList as ce:
        raise ce
        # return response(status=0, message=f"Unknown error : {ce}")
    except Exception as e:
        traceback.print_exc()
        raise e
        # return response(status=0, message=f"Unknwon error : {e}")

# GET(path param)
@ns.route('/path/<int:sample_id>', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class PATHCLASS(CustomResource):
    # @ns.param('sample_id', 'sample id')
    @token_checker
    def get(self, sample_id):
        """
            GET (path param)(Sample)
            ---
            # Input
                path param (int)
            ---
            # Input example (Postman에서 테스트 시 path에 input 값 입력)
                http://192.168.1.25:56788/api/SAMPLEROUTE/path/0
            ---
            # Returns
                ## 성공 시
                {
                    "result": {
                        "sample_id": (int),
                        "method": (str)
                    },
                    "message": (str),
                    "status": (int)
                }
            ---
            # Returns example
                ## 성공 시
                {
                    "result": {
                        "sample_id": 0,
                        "method": "GET"
                    },
                    "message": "OK",
                    "status": 1
                }
        """
        try:
            res = sample_do_func(sample_id=sample_id, method='GET')
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())        
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e)) 
                    

# GET(query param), POST, PUT, DELETE 
@ns.route('/path', methods=["GET", "POST", "PUT", "DELETE"])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class RouterClass(CustomResource):
    @ns.expect(get_parser)
    @token_checker
    def get(self):
        """
            GET (Sample)
            ---
            # Input
                get_id (int)
            ---
            # Input example (Postman에서 테스트 시, Params 선택)
                KEY : get_id / VALUE : 0
            ---
            # Returns
                ## 성공 시
                {
                    "result": {
                        "sample_id": (int),
                        "method": (str)
                    },
                    "message": (str),
                    "status": (int)
                }
            ---
            # Returns example
                ## 성공 시
                {
                    "result": {
                        "sample_id": 0,
                        "method": "GET"
                    },
                    "message": "OK",
                    "status": 1
                }
        """
        args = get_parser.parse_args()
        try:
            self.check_user
            sample_id_int = args["get_id"]
            res = sample_do_func(sample_id=sample_id_int, method="GET")
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

    @ns.expect(post_parser)
    @token_checker
    @sample_access_check(post_parser, allow_max_level=1)
    def post(self):
        """
            POST (Sample)
            ---
            # Input
                post_id_int (int)
                post_id_float (float)
                post_id_str (str)
                post_id_list (list)
                post_id_dict (dict)
            ---
            # Input example (Postman에서 테스트 시, Body > raw [JSON] 선택)
                {
                    "post_id_int": 0,
                    "post_id_float": 0.0,
                    "post_id_str": "",
                    "post_id_list": [0, 0, 0],
                    "post_id_dict": {"key": "value"}
                }
            ---
            # Returns
                # 성공 시
                {
                    "result": {
                        "sample_id": list[int, float, str, list, dict],
                        "method": (str)
                    },
                    "message": (str),
                    "status": (int)
                }
            # Returns example
                # 성공 시
                {
                    "result": {
                        "sample_id": [
                            0,
                            0.0,
                            "",
                            [
                                0,
                                0,
                                0
                            ],
                            {
                                "key": "value"
                            }
                        ],
                        "method": "POST"
                    },
                    "message": "OK",
                    "status": 1
                }
        """
        args = post_parser.parse_args()
        try:
            sample_id_int = args['post_id_int']
            sample_id_float = args['post_id_float']
            sample_id_str = args['post_id_str']
            sample_id_list = args['post_id_list']
            sample_id_dict = args['post_id_dict']
            res = sample_do_func(sample_id=(sample_id_int, sample_id_float, sample_id_str, sample_id_list, sample_id_dict),  method='POST')
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))
    
    @ns.expect(put_parser)
    @token_checker
    def put(self):
        """
            PUT (Sample)
            ---
            # Input
                put_id (int)
            ---
            # Input example (Postman에서 테스트 시, Body > raw [JSON] 선택)
                {
                    "put_id": 0
                }
            ---
            # Returns
                ## 성공 시
                {
                    "result": {
                        "sample_id": (int),
                        "method": (str)
                    },
                    "message": (str),
                    "status": (int)
                }
            ---
            # Returns example
                ## 성공 시
                {
                    "result": {
                        "sample_id": 0,
                        "method": "PUT"
                    },
                    "message": "OK",
                    "status": 1
                }
        """
        args = put_parser.parse_args()
        try:
            sample_id = args['put_id']
            res = sample_do_func(sample_id=sample_id, method='PUT')
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.repsponse())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))
    
    @ns.expect(delete_parser)
    @token_checker
    def delete(self):
        """
            DELETE (Sample)
            ---
            # Input
                delete_id (int)
            ---
            # Input example (Postman에서 테스트 시, Body > raw [JSON] 선택)
                {
                    "delete_id": 0
                }
            ---
            # Returns
                ## 성공 시
                {
                    "result": {
                        "sample_id": (int),
                        "method": (str)
                    },
                    "message": (str),
                    "status": (int)
                }
            ---
            # Returns example
                ## 성공 시
                {
                    "result": {
                        "sample_id": 0,
                        "method": "DELETE"
                    },
                    "message": "OK",
                    "status": 1
                }
        """
        args = delete_parser.parse_args()
        try:
            sample_id = args['delete_id']
            res = sample_do_func(sample_id=sample_id, method='DELETE')
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(stauts=0, message=e))


def upload(sample_file, result):
    try:
        path = "/jf-data/tmp/test.jpg"
        sample_file.save(path)
        return response(status=1, message="success", result=result)
    except CustomErrorList as ce:
        traceback.print_exc()
        return response(status=0, message=f"Upload Error: {ce}")
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message=f"Upload Error: {e}")
    
@ns.route("/path/form", methods=['POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class FormClass(CustomResource):
    def post(self):
        """
            POST (Sample)
            ---
            # Input
                post_id_file (file)
                post_id_int (int)
                post_id_float (float)
                post_id_str (str)
                post_id_list (list)
                post_id_dict (dict)
            ---
            # Input example (Postman에서 테스트 시, Body > form-data 선택)
                {
                    "post_id_file": 파일 선택,
                    "post_id_int": 1,
                    "post_id_float": 1.1,
                    "post_id_str": test,
                    "post_id_list": [1, 2, 3],
                    "post_id_dict": {"key": "value"}
                }
            ---
            # Returns
                # 성공 시
                {
                    "result": {
                        "sample_id": list[int, float, str, list, dict],
                        "method": (str)
                    },
                    "message": (str),
                    "status": (int)
                }
            # Returns example
                # 성공 시
                {
                    "result": {
                        "sample_id_int": 1,
                        "sample_id_float": 1.1,
                        "sample_id_str": "test",
                        "sample_id_list": [
                            "1",
                            "2",
                            "3"
                        ],
                        "sample_id_dict": {
                            "key": "value"
                        }
                    },
                    "message": "success",
                    "status": 1
                }
        """
        args = form_parser.parse_args()
        sample_id_file = args['form_id_file']
        sample_id_int = args['form_id_int']
        sample_id_float = args['form_id_float']
        sample_id_str = args['form_id_str']
        sample_id_list = args['form_id_list']
        sample_id_dict = args['form_id_dict']
        result = {"sample_id_int": sample_id_int, 
                  "sample_id_float": sample_id_float, 
                  "sample_id_str": sample_id_str,
                  "sample_id_list": sample_id_list,
                  "sample_id_dict": sample_id_dict
                  }
        return self.send(upload(sample_id_file, result))

# DELETE (path param, 여러 요소 delete)
@ns.route('/path/<id_list>', methods=['DELETE'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DeleteClass(CustomResource):
    # TODO: ns.param 내용 수정?
    @ns.param('id_list', 'id list')
    @token_checker
    @sample_delete_access_check(delete_parser, allow_max_level=1)
    def delete(self, id_list):
        """
            DELETE (path param)(Sample)
            ---
            # Input
                Any
            ---
            # Input example (Postman에서 테스트 시 path에 input 값 입력)
                http://192.168.1.25:56788/api/SAMPLEROUTE/path/1,2,3,4
            ---
            # Returns
                ## 성공 시
                {
                    "result": {
                        "sample_id": list[Any],
                        "method": (str)
                    },
                    "message": (str),
                    "status": (int)
                }
            ---
            # Returns example
                ## 성공 시
                {
                    "result": {
                        "sample_id": [
                            "1",
                            "2",
                            "3",
                            "4"
                        ],
                        "method": "DELETE"
                    },
                    "message": "OK",
                    "status": 1
                }
        """
        try:
            id_list = id_list.split(',')
            res = sample_do_func(id_list, method='DELETE')
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(stauts=0, message=e))