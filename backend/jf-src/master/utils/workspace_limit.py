import os
import time
import datetime
import subprocess
import shutil
import io
import datetime 

import utils.db as db
from utils.common import STORAGE_USAGE_SHARE_DICT


def stdout_to_json(disk_usage_list):
    return_dict = []
    total = 0
    for list_ in disk_usage_list:
        size,item = list_.split('\t/jfbcore/jf-data/workspaces/')
        total += int(size)
        return_dict.append(
            {
                'item' : item.split('/')[-2],
                'size' : size
            }
            
        )

    return return_dict, total


def total_storage_usage_check(ws_list):
    #todo multi thread or multi process
    print(type(ws_list))
    path = '/jfbcore/jf-data/storage_usage'
    if not os.path.exists(path):
        os.system('mkdir -p {}'.format(path))
    #workspaces = db.get_workspace_list()
    workspaces = ws_list
    for ws in workspaces :
        result = storage_usage_check(ws['workspace_name'])
        print(ws['id'])
        with open('/jf-data/storage_usage/{}.log'.format(ws['id']),'a+') as fp:
            fp.write(str(result)+"\n")

    STORAGE_USAGE_SHARE_DICT.clear()
        

def storage_usage_check(ws):
    path = '/jfbcore/jf-data/storage_usage'
    
    workspace_disk_usage_history = {}
    ws_total=0
    ws_disk_usage = {}    

    #datasets
    dataset_cmd = 'du -k -s /jfbcore/jf-data/workspaces/{}/datasets/*/*/'.format(ws)
    stdout=subprocess.run(["{}".format(dataset_cmd)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').stdout
    datasets,datasets_size=stdout_to_json(stdout.splitlines())
    ws_total += datasets_size
    ws_disk_usage['datasets_list'] = datasets
    

    # deployment
    deployment_cmd = 'du -k -s /jfbcore/jf-data/workspaces/{}/deployments/*/'.format(ws)
    stdout=subprocess.run(["{}".format(deployment_cmd)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').stdout
    deployment,deployment_size=stdout_to_json(stdout.splitlines())
    ws_total += deployment_size
    ws_disk_usage['deployment_list'] = deployment
    

    #trainings
    trainings_cmd = 'du -k -s /jfbcore/jf-data/workspaces/{}/trainings/*/'.format(ws)
    stdout=subprocess.run(["{}".format(trainings_cmd)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').stdout
    trainings,trainings_size=stdout_to_json(stdout.splitlines())
    ws_total += trainings_size
    ws_disk_usage['trainings_list'] = trainings
    ws_disk_usage['datasets_size'] = datasets_size
    ws_disk_usage['deployment_size'] = deployment_size
    ws_disk_usage['trainings_size'] = trainings_size
    ws_disk_usage['ws_total'] = ws_total
    ws_disk_usage['datetime'] = datetime.datetime.now()
    workspace_disk_usage_history[ws]=ws_disk_usage

    
    return workspace_disk_usage_history
    # if not os.path.exists(os.path.join(path,ws)):
    

def get_current_stroage_usage(ws_name):
    #todo 실시간 메모리와 history 비교하는 로직필요
    # if ws_name in STORAGE_USAGE_SHARE_DICT:
    #     result = STORAGE_USAGE_SHARE_DICT.get(ws_name)
    # else :
    result = storage_usage_check(ws_name)
    print(ws_name)
    STORAGE_USAGE_SHARE_DICT[ws_name] = result
    return result

    
def get_storage_usage_history(ws_id):
    with open('/jfbcore/jf-data/storage_usage/{}.log'.format(ws_id),'r') as fp:
            last_history = fp.readlines()[-1]

    return last_history

def workspace_storage_usage_check():
    workspaces = db.get_workspaces_limit()
    for ws in workspaces:
        history = get_storage_usage_history(ws['id'])
        #compare between db and history
        #update db status or count

