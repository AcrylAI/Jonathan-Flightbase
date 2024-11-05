from restplus import api
from flask_restplus import reqparse
from werkzeug.datastructures import FileStorage
from utils.resource import CustomResource, response
import traceback

ns = api.namespace('upload', description='파일 업로드 테스트')

upload_parser = reqparse.RequestParser()
upload_parser.add_argument('file', type=FileStorage, required=True, location='files')
upload_parser.add_argument('name', type=str, required=True, location='form')


def upload(name, file):
    try:
        save_path = "/root/.kube/minio/aaaa/{}".format(name)
        file.save(save_path)
        return response(status=1, message="success")
    except Exception as e:
        traceback.print_exc()
    return response(status=0, message="Upload Error")
    #return response(status=0, message=e)


@ns.route("", methods=['PUT'])
class Upload(CustomResource):
    def put(self):
        args = upload_parser.parse_args()
        name = args['name']
        file = args['file']
        return self.send(upload(name=name, file=file))
