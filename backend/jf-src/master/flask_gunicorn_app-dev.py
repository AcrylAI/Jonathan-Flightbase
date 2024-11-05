# ref  http://docs.gunicorn.org/en/stable/custom.html

from __future__ import unicode_literals
import multiprocessing
import gunicorn.app.base
from gunicorn.six import iteritems

import json
import argparse
import os
import configparser

BASE_DIR=os.path.dirname(os.path.abspath(__file__))
parser = argparse.ArgumentParser()
# parser.add_argument('--options_path', type=str, required=False, help="options.json path", default="{}/options.json".format(BASE_DIR))
parser.add_argument('--ini', type=str, required=False, help="gunicorn.ini path", default="{}/gunicorn-dev.ini".format(BASE_DIR))
params, _ = parser.parse_known_args()
params = vars(params)

def number_of_workers():
    return (multiprocessing.cpu_count() * 2) + 1

# def load_options(json_path):
#     with open(json_path, "r") as json_file:
#         options = json.load(json_file)
#     print("JSON ", options)
#     return options

def load_ini(ini_path):
    config = configparser.ConfigParser()
    load = config.read(ini_path)
    items = {}
    for section in config.sections():
        for k,v in config[section].items():
            print(k, v)
            if k == "bind":
                items[k] = list(v.split(","))
            elif k == "module":
                # if not os.path.isfile("{BASE_DIR}/JF_FLASK_APP.py".format(BASE_DIR=BASE_DIR, module=v)):
                try:
                    os.system("rm {BASE_DIR}/JF_FLASK_APP.py".format(BASE_DIR=BASE_DIR))
                    os.system("ln {BASE_DIR}/{module}.py {BASE_DIR}/JF_FLASK_APP.py".format(BASE_DIR=BASE_DIR, module=v))
                except:
                    pass
            elif k in ["workers", "threads"]:
                items[k] = int(v)
            else :    
                items[k] = v
        
    return items



def load_module_application(module_name):
    # Pyinstaller 사용 시 import 를 직접 해줘야 제대로 동작
    mod = __import__('%s' %(module_name), fromlist=[module_name])
    return mod.application


class StandaloneApplication(gunicorn.app.base.BaseApplication):

    def __init__(self, app, options=None):
        self.options = options or {}
        self.application = app
        super(StandaloneApplication, self).__init__()

    def load_config(self):
        config = dict([(key, value) for key, value in iteritems(self.options)
                       if key in self.cfg.settings and value is not None])
        for key, value in iteritems(config):
            self.cfg.set(key.lower(), value)

    def load(self):
        return self.application


if __name__ == '__main__':
    # options = {
    #     'bind': ['%s:%s' % ('0.0.0.0', '8080'),],
    #     'workers': 4,
    # }
    # options = load_options(params["options_path"])
    options = load_ini(params["ini"])
    # Pyinstaller 사용 시 import 를 직접 해줘야 제대로 동작
    # exec , __import__ 를 통해 import 하면 ModuleNotFoundError 발생
    import JF_FLASK_APP
    app = JF_FLASK_APP.application
    # exec("import {} as flask_app".format(options["module"]))
    # app = flask_app.application
    # app = load_module_application(options["module"])
    StandaloneApplication(app, options).run()