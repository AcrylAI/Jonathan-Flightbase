import logging
import traceback
import os
import subprocess

from flask_restplus import Api
import settings
from utils.resource import CustomResource

log = logging.getLogger(__name__)

api = Api(version='0.1', title='JFB API',
          description='Jonathan FlightBase API')
api.namespaces = []

version_ns = api.namespace('version', description='For cersion check')
@version_ns.route('/', methods=['GET'])
class Version(CustomResource):
    def get(self):
        cid = None
        log = None
        name = None
        date = None
        try:
            path_cid = os.path.join(os.path.dirname(__file__), '/jfbcore/.git/refs/heads/master')
            with open(path_cid, 'r') as f:
                cid = f.read().split('\n')[0]
            if cid is not None:
                log = subprocess.check_output(["cd /jfbcore; git log --format=%B -n 1 {}".format(cid)], shell=True).decode('utf-8').split('\n')[0]
                name = subprocess.check_output(["cd /jfbcore; git log --format=%cn -n 1 {}".format(cid)], shell=True).decode('utf-8').split('\n')[0]
                date = subprocess.check_output(["cd /jfbcore; git log --format=%cd -n 1 {}".format(cid),], shell=True).decode('utf-8').split('\n')[0]
                #log_sub = subprocess.check_output(["git", "log", "--format=%s", "-n", "1", cid])
        except Exception as e:
            traceback.print_exc()
        return {'git': {'cid': cid, 'log': log, 'name': name, 'date': date}}


@api.errorhandler
def default_error_handler(e):
  message = 'An unhandled exception occurred'
  log.exception(message)

  if not settings.FLASK_DEBUG:
    return { 'success': -1, 'message': message }, 500
