from flask import Flask, Blueprint
from flask_cors import CORS
import argparse
import threading
import traceback
import os

from restplus import api
import settings
from router import ns as worker_namespace
from network import ns
from storage import ns as storage_namespace
from test import ns as test_namespace
import arg_parser
import license
import time
from utils.system_share import share_usage_counter

app = Flask(__name__)
CORS(app)
# 아래 로그 안나오게 하려면
# 192.168.1.16 - - [01/Apr/2022 14:42:48] "GET /worker/mem_usage HTTP/1.1" 200 -
# 192.168.1.16 - - [01/Apr/2022 14:42:48] "GET /worker/mem_usage HTTP/1.1" 200 -
if settings.JF_WORKER_FLASK_LOG == False:
    import logging
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)

def usage_counter():
    while(1):
        try:        
            time.sleep(1)
            share_usage_counter.update_all()
        except:
            traceback.print_exc()


#cnt = 0
#@app.before_request
#def before_request():
#    global cnt
#    cnt += 1
#    if cnt % 100 == 0:
#        check_license()


def configure_app(flask_app):
    #flask_app.config['SERVER_NAME'] = settings.FLASK_SERVER_NAME
    flask_app.config['SWAGGER_UI_DOC_EXPANSION'] = settings.RESTPLUS_SWAGGER_UI_DOC_EXPANSION
    flask_app.config['RESTPLUS_VALIDATE'] = settings.RESTPLUS_VALIDATE
    flask_app.config['RESTPLUS_MASK_SWAGGER'] = settings.RESTPLUS_MASK_SWAGGER
    flask_app.config['ERROR_404_HELP'] = settings.RESTPLUS_ERROR_404_HELP

def initialize_usage_thr():
    usage_thr = threading.Thread(target = usage_counter)
    usage_thr.start()

def initialize_app(flask_app):    
    configure_app(flask_app)
    blueprint = Blueprint('worker api', __name__, url_prefix='/worker')
    api.init_app(blueprint)    
    #api.add_namespace(worker_namespace)
    flask_app.register_blueprint(blueprint)
    initialize_usage_thr()
    if os.system("ls /jf-bin/stat") != 0:
        raise(RuntimeError('/jf-bin/stat not found, is it mounted?'))
    
    if os.system("ls /jf-bin/meminfo") != 0:
        raise(RuntimeError('/jf-bin/meminfo not found, is it mounted?'))

def check_license(jf_ip):
    print('Checking license...')
    lic_key = license.load_lic_key(jf_ip)
    license.check_lic_key(lic_key)
    print('license no problem')

def main():  
    parser = argparse.ArgumentParser()
    jf_ip, jf_port, gpu_list, jf_gpu, system_info, *_ = arg_parser.init_arg(parser)
    #check_license(jf_ip)
    initialize_app(app)
    port = settings.JF_WORKER_PORT if jf_port is None else jf_port
    app.run(debug=settings.FLASK_DEBUG, host=settings.JF_WORKER_IP, port=port)


if __name__ == '__main__':
    main()
