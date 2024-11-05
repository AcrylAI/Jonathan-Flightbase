import tarfile
import settings
import os
# import datasets
from restplus import api
import shutil
import utils.db as db
from flask_restplus import reqparse
from utils.resource import CustomResource, token_checker
from utils.resource import response

ns = api.namespace('datasets', description='데이터셋 관련 API')
import_parser = api.parser()
import_parser.add_argument('workspace_id', type=int, location='form', required=True, help='워크스페이스 아이디' )
import_parser.add_argument('default_dataset', type=str, location='form', required=False, help="데이터셋 탑재- 0 : no, 1 : yes")

def create_built_in_dataset(default_dataset, workspace_id):
    if default_dataset=='1':
        built_in_datasets_dir = settings.JF_BUILT_IN_DATASETS_PATH
        if os.path.isfile(built_in_datasets_dir)==False:
            return response(status=0, message = 'Dataset does not exist')
        else:
            workspace_name = db.get_workspace(workspace_id = workspace_id)['workspace_name']
            dataset_target_dir = '{}/{}/datasets'.format(settings.JF_WS_DIR, workspace_name)
            with tarfile.open(built_in_datasets_dir, mode = 'r:gz') as tar:
                tar.extractall(dataset_target_dir, numeric_owner=True)
            list_built_in_datasets_default = os.listdir('{}/built_in_datasets'.format(dataset_target_dir))
            list_existing_datasets = os.listdir('{}/1'.format(dataset_target_dir))+os.listdir('{}/0'.format(dataset_target_dir))
            list_built_in_datasets = list(set(list_built_in_datasets_default)-set(list_existing_datasets))
            for dataset in list_built_in_datasets:
                shutil.move('{}/built_in_datasets/{}'.format(dataset_target_dir,dataset), '{}/0/{}'.format(dataset_target_dir,dataset))
            shutil.rmtree('{}/built_in_datasets'.format(dataset_target_dir))
            # datasets.scan_workspace([workspace_id])
            if set(list_built_in_datasets_default) != set(list_built_in_datasets):
                return response(status = 1, massage = 'Datasets '+', '.join(list(set(list_built_in_datasets_default)-set(list_built_in_datasets)))+' already exists!')
            else:
                return response(status = 1, message = 'OK')


@ns.route("/import", methods=['POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class ImportBuiltInDataset(CustomResource):
    @token_checker
    @ns.expect(import_parser)
    def post(self):
        """
        데이터셋 가져오기
        """
        args = import_parser.parse_args()
        default_dataset = args['default_dataset']
        workspace_id = args['workspace_id']
        res = create_built_in_dataset(default_dataset = default_dataset, workspace_id=workspace_id)
        # db.request_logging(self.check_user(), 'datasets', 'post', str(args), res['status'])
        return self.send(res)
