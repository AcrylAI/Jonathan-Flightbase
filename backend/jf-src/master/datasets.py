#-*- coding: utf-8 -*-
from utils.resource import CustomResource, token_checker
from flask_restplus import reqparse, Resource
from werkzeug.datastructures import FileStorage
from werkzeug.wrappers import Request, Response
import traceback
import os,fnmatch
from flask import Flask, request, send_from_directory, send_file, make_response
from restplus import api
import utils.db as db
from utils import common
from utils.resource import response
import settings
import PATH
import json
import random
# import numpy as np  #사용 안하고있음.
from PIL import Image
# import pandas as pd #사용 안하고있음.
import io
import base64
import subprocess
from utils.exceptions import *
from utils.access_check import workspace_access_check
from utils.access_check import dataset_access_check, check_inaccessible_dataset
from utils.access_check import check_dataset_access_level
import requests
import urllib
import threading
import sys
from lock import jf_dataset_lock
from datetime import datetime
#from utils.exceptions import *
import tarfile

os.system('pip install zipfile38')
import zipfile38 as zipfile


"""
=================================================================================================================================
datasets arguments settings START
=================================================================================================================================
"""
# Router Function
parser = reqparse.RequestParser()
ns = api.namespace('datasets', description='데이터셋 관련 API')
# dataset_id_parser = api.parser()
# dataset_id_parser.add_argument('dataset_id', required=True, type=str, location='args', help='dataset_id')

user_workspace_parser = api.parser()
user_workspace_parser.add_argument('workspace_id', required=False, type=int, location='args', help='워크스페이스 아이디')
user_workspace_parser.add_argument('page', required=False, type=str, location='args', help='조회할 페이지 시작 인덱스')
user_workspace_parser.add_argument('size', required=False, type=str, location='args', help='한번에 가져올 데이터 수')
user_workspace_parser.add_argument('search_key', required=False, type=str, location='args', help='검색 키')
user_workspace_parser.add_argument('search_value', required=False, type=str, location='args', help='검색 값')

create_parser = api.parser()
create_parser.add_argument('upload_method', type=int, location='form', required=True, help='업로드 방법' )
create_parser.add_argument('dataset_name', type=str, location='form', required=True, help='데이터셋 이름' )
create_parser.add_argument('workspace_id', type=int, location='form', required=True, help='워크스페이스 아이디' )
create_parser.add_argument('access', type=str, location='form', required=True, help='접근 권한 1 : Read & Write, 0 : Read Only' )
create_parser.add_argument('doc', type=FileStorage, location='files', required=False, action='append', help='업로드 파일')
create_parser.add_argument('path', type=str, location='form', required=False, help='업로드할 위치' )
create_parser.add_argument('filepath', type=str, location='form', required=False, help='NAS 업로드할 파일or 폴더 위치' )
create_parser.add_argument('description', type=str, location='form', default="", required=False, help='데이터셋 설명')
create_parser.add_argument('google_info', type=str, location='form', required=False, help='google upload info(access_token, {id, name, type})' )
create_parser.add_argument('built_in_model_id', type=int, location='form', required=False, help='built_in_model_id value')


update_parser = api.parser()
update_parser.add_argument('dataset_id', type=str, location='form', required=True, help='데이터셋 아이디')
update_parser.add_argument('dataset_name', type=str, location='form', required=False, help='데이터셋 이름')
update_parser.add_argument('original_name', type=str, location='form', required=False, help='원래의 파일or폴더 이름')
update_parser.add_argument('new_name', type=str, location='form', required=False, help='새 파일or폴더 이름')
update_parser.add_argument('workspace_id', type=int, location='form', required=False, help='워크스페이스 아이디')
update_parser.add_argument('access', type=str, location='form', required=False, help='접근 권한 1 : Read & Write, 0 : Read Only' )
update_parser.add_argument('doc', type=FileStorage, location='files', required=False, action='append', help='업로드 파일')
update_parser.add_argument('type', type=str, location='form', required=False, help='필터 file = 0 or dir = 1 ')
update_parser.add_argument('path', type=str, location='form', required=False, help='업로드할 위치' )
update_parser.add_argument('filepath', type=str, location='form', required=False,  action='append', help='NAS 업로드할 파일or 폴더 위치' )
update_parser.add_argument('remove_files', type=str, location='form', required=False,  action='append', help='삭제할 파일')
update_parser.add_argument('description', type=str, location='form', default="", required=False, help='데이터셋 설명')
update_parser.add_argument('upload_list', type=str, location='form', required=False, action='append', help='폴더이름 리스트')

update_info_parser = api.parser()
update_info_parser.add_argument('dataset_id', type=str, location='form', required=False, help='데이터셋 아이디')
update_info_parser.add_argument('dataset_name', type=str, location='form', required=False, help='데이터셋 이름')
update_info_parser.add_argument('workspace_id', type=int, location='form', required=False, help='워크스페이스 아이디')
update_info_parser.add_argument('access', type=str, location='form', required=False, help='접근 권한 1 : Read & Write, 0 : Read Only' )
update_info_parser.add_argument('description', type=str, location='form', default="", required=False, help='데이터셋 설명')

preview_parser = api.parser()
preview_parser.add_argument('dataset_id', type=str, location='args', required=True, help='데이터셋 아이디')
preview_parser.add_argument('file_name', type=str, location='args', required=True,  help='파일이름')
preview_parser.add_argument('path', type=str, location='args', required=True, help='경로' )

download_parser = api.parser()
download_parser.add_argument('dataset_id', type=str, location='args', required=True, help='데이터셋 아이디')
download_parser.add_argument('download_files', type=str, location='args', required=False,  action='append', help='다운로드할 파일')
download_parser.add_argument('path', type=str, location='args', required=False, default="/", help='다운로드할 경로' )

decompression_parser = api.parser()
decompression_parser.add_argument('dataset_id', type=str, location='args', required=True, help='데이터셋 아이디')
decompression_parser.add_argument('files', type=str, location='args', required=True, help='파일')
decompression_parser.add_argument('path', type=str, location='args', required=False, help='경로' )

dataset_files_parser = api.parser()
dataset_files_parser.add_argument('search_path', type=str, location='args', required=False, default='/', help='업로드할 위치')
dataset_files_parser.add_argument('search_page', type=str, location='args', required=False, default=0, help='조회할 페이지 시작 인덱스')
dataset_files_parser.add_argument('search_size', type=str, location='args', required=False, default=0, help='한번에 가져올 데이터 수')
dataset_files_parser.add_argument('search_type', type=str, location='args', required=False, help='필터 file or dir')
dataset_files_parser.add_argument('search_key', type=str, location='args', required=False, help='검색 키')
dataset_files_parser.add_argument('search_value', type=str, location='args', required=False, help='검색 값')

dataset_files_info_parser = api.parser()
dataset_files_info_parser.add_argument('search_path', type=str, location='args', required=False, default='/', help='조회할 경로')

marker_get_datasets = api.parser()
# marker_get_datasets.add_argument('dataset_id', type=int, location='args', required=True, help='데이터셋 아이디')
marker_get_datasets.add_argument('search_path', type=str, location='args', required=False, default=None, help='검색 지정 위치')

github_clone_parser = api.parser()
github_clone_parser.add_argument('url', type=str, location='json', required=True, help='url')
github_clone_parser.add_argument('username', type=str, location='json', required=False, default="", help='사용자이름')
github_clone_parser.add_argument('accesstoken', type=str, location='json', required=False, default="", help='accesstoken')
github_clone_parser.add_argument('dataset_id', type=int, location='json', required=True, help='dataset_id' )
github_clone_parser.add_argument('dir', type=str, location='json', required=False, help='폴더 이름')
github_clone_parser.add_argument('current_path', type=str, location='json', required=False, help='현재 위치')

google_drive_parser = api.parser()
google_drive_parser.add_argument('google_info', type=str, location='form', required=False, help='google upload info(access_token, {id, name, type})' )
google_drive_parser.add_argument('dataset_id', type=int, location='form', required=False, help='dataset_id')
google_drive_parser.add_argument('path', type=str, location='form', required=False, help='현재 위치')

copy_or_carry_parser = api.parser()
copy_or_carry_parser.add_argument('dataset_id', type=int, location='json', required=True, help='dataset_id' )
copy_or_carry_parser.add_argument('target_path', type=str, location='json', required=True,  help='target_path')
copy_or_carry_parser.add_argument('destination_path', type=str, location='json', required=True,  help='destination_path')
copy_or_carry_parser.add_argument('name', type=str, location='json', required=True,  help='file or folder name')
copy_or_carry_parser.add_argument('is_copy', type=int, location='json', required=True, default=0, help='is_copy')

dvc_parser = api.parser()
dvc_parser.add_argument('name',type = str, location = 'form', required=False,help='file or directory name' )
dvc_parser.add_argument('path',type = str, location = 'form', required=False,help='test path' )
dvc_parser.add_argument('hash',type = str, location = 'form', required=False,help='commit hash value' )
dvc_parser.add_argument('commit_msg',type = str, location = 'form', required=False,help='commit message' )
#os.system('apt-get install tree -y')
tree_cmd = "/jfbcore/jf-bin/support/tree"
"""
=================================================================================================================================
datasets arguments settings END
=================================================================================================================================
"""


"""
==============================================================
os.system funtion START
==============================================================
"""
def get_dir_size(search_path='.'):
    total_size = 0
    total_size = int(subprocess.run(['du -cb {} | grep total'.format(search_path)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').stdout.split('total')[0])
    return total_size 

def get_dir_count(search_path='.'):
    dir_count = 0
    file_count = 0
    count = subprocess.run(['{} -a {} | tail -1'.format(tree_cmd,search_path)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').stdout.split(', ')
    dir_count = int(count[0].split(' ')[0])
    file_count = int(count[1].split(' ')[0])

    return file_count , dir_count

def stat_file(dataset_dir):
    return os.stat(dataset_dir)

def make_dir(path, headers_user):
    if not os.path.exists(path):
        os.system("mkdir -p {}".format(path))
        #change_own(path,headers_user)
        return path
    return None


def change_own(path,headers_user):
    file_list = []
    dir_list = []
    os.system('chown {}:{} "{}"'.format(headers_user, headers_user, path))
    if os.path.isfile(path):
        return
        
    tmp_file_list = os.listdir(path)
    
    for file_ in tmp_file_list:
        if not file_[0]=='.':
            if os.path.isfile(os.path.join(path,file_)) :
                file_list.append(file_)
            if os.path.isdir(os.path.join(path,file_)):
                dir_list.append(file_)
    for file_ in file_list:
        os.system('chown {}:{} "{}"'.format(headers_user, headers_user, os.path.join(path,file_)))
    for folder_ in dir_list:
        #os.system('chown {}:{} "{}"'.format(headers_user, headers_user, os.path.join(path,folder_)))
        change_own(os.path.join(path,folder_),headers_user)


def move_data(path, destination_path):
    os.system('mv {} {}'.format(path, destination_path))


def copy_ws_data(filepath, destination_path):
    os.system('cp -r {} {}'.format(filepath,destination_path))


def remove_dir(path):
    if os.path.exists(path):
        if 0 == os.system("rm -rf {}".format(path)):
            return True
        else:
            return False
    else:
        return False

"""
==============================================================
os.system funtion END
==============================================================
"""


"""
=================================================================================================================================
datasets function START
=================================================================================================================================
"""

def check_file(search_path='/', search_page=1, search_size=10, search_type=None, search_key=None, search_value=None, path='/', only_file_list=False):
    print("check file")
    dataset_file_list = []
    try:
        file_list = []
        dir_list=[]
        new_list=[]
        support_extension = ['.txt','.jpg','.jpeg','.png','.csv','.json','.md']

        #check file type
        if search_type == 'all':
            tmp_file_list = os.listdir(path)
        elif search_type == 'dir':
            tmp_file_list = subprocess.run(["find {} -maxdepth 1 -type d".format(path)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').stdout.replace(path,'').replace('/',"").split('\n')
            tmp_file_list=list(filter(None, tmp_file_list))
        else:
            tmp_file_list = subprocess.run(["find {} -maxdepth 1 -type f".format(path)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').stdout.replace(path,'').replace('/',"").split('\n')
            tmp_file_list=list(filter(None, tmp_file_list))

        if search_value is not None:
            tmp_file_list=list(filter(lambda x: search_value in x, tmp_file_list))

        file_count = len(tmp_file_list)
        tmp_file_list.sort(reverse=True)

        # search_size = -1
        if search_size == -1 :
            start_num = 0
            end_num = file_count
        else :
            start_num = (search_page-1)*search_size
            end_num = search_page * search_size
        
        #check search key, value

        for file_ in tmp_file_list[start_num:end_num]:
            is_preview = False
            search_path = path+'/'+file_

            try:
                owner = getpwuid(os.stat(search_path).st_uid).pw_name
            except KeyError:
                owner = "root"

            #owner = getpwuid(os.stat(search_path).st_uid).pw_name
            if os.path.isdir(path+'/'+file_):
                type = 'dir'
            else:
                type = 'file'
            #preview를 지원하는 확장자인지 구분
            if type =='file':
                _, file_ext = os.path.splitext(file_)
                file_ext = file_ext.lower()
                if file_ext in support_extension :
                    is_preview = True
            modified_timestamp = os.stat(search_path).st_ctime
            if os.path.isfile(search_path):
                search_path_size = os.path.getsize(search_path)
            else:
                search_path_size = 0
            modified = datetime.fromtimestamp(modified_timestamp).strftime('%Y-%m-%d %H:%M:%S')
            dataset_file_list.append({'type':type, 'name':file_, 'size': search_path_size,
                                    'modifier': owner, 'modified':modified, 'is_preview':is_preview})
        #dataset_file_list = sorted(dataset_file_list, key=lambda l: l['modified'],reverse = True)
    except:
        dataset_file_list = []
        file_count = 0
        traceback.print_exc()
    
    return dataset_file_list,  file_count

def scan_workspace(workspace_ids, check = True):
    """ 
        데이터셋 목록을 DB와 File system을 비교하는 함수 
        ---
        # Arguments
            body : 
            {
                workspace_ids(list): 비교할 workspace들의 ID값
                check(bool): 파일갯수를 count 여부를 결정하는 Flag
            }
        # Returns:
            None
    """
    print("scan workspace")
    try:
        for workspace_id in workspace_ids:
            # get dataset_info in db
            res_db_datasets = db.get_dataset_list(workspace_id=workspace_id)
            db_datasets = {}
            for res_db_dataset in res_db_datasets:
                db_datasets[res_db_dataset['inode_number']] = res_db_dataset
            workspace_name = (db.get_workspace(workspace_id = workspace_id))['workspace_name']
            for access in ['0', '1']:
                path = '{}/{}/datasets/{}'.format(settings.JF_WS_DIR, workspace_name, access)
                if not os.path.exists(path):
                    continue
                for name in os.listdir(path):
                    if '.ipynb_checkpoints' in name:
                        continue
                    full_path = os.path.join(path, name)
                    if os.path.isdir(full_path):
                        _stat = stat_file(full_path)
                        inode_number = str(_stat.st_ino)
                        user_info = db.get_user_by_uid(_stat.st_uid)
                        user_info_id = "1" if user_info is None else user_info["id"]
                        user_info_name = "unknown" if user_info is None else user_info["name"]
                        if inode_number in db_datasets.keys() :
                            if not check :
                                # result = db.update_dataset(id = db_datasets[inode_number]['id'], name = name, 
                                #         workspace_id = workspace_id,
                                #         create_user_id = user_info_id,
                                #         access = access, 
                                #         file_count = None,
                                #         description = None,
                                #         auto_labeling=None)
                                db_datasets.pop(inode_number,None)
                                    #db.logging_history(user=dataset_value['user_name'], task='dataset', action='update', workspace_id=dataset_value['workspace_id'], update_details='1')
                            else :
                                total_size = get_dir_size(full_path)
                                file_count , dir_count = get_dir_count(full_path)
                                result = db.update_dataset(id = db_datasets[inode_number]['id'], name = name, 
                                        workspace_id = workspace_id,
                                        create_user_id = user_info_id,
                                        access = access, 
                                        file_count = file_count,
                                        dir_count = dir_count,
                                        size = total_size, 
                                        description = None,
                                        modify_datetime = datetime.fromtimestamp(_stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S'),
                                        auto_labeling=None)
                                db_datasets.pop(inode_number,None)
                                continue
                        else :
                            print('db insert scan_workspace')
                            result = db.insert_dataset(name = name, workspace_id = workspace_id, 
                                create_user_id = user_info_id,
                                access = access,
                                file_count = 0,
                                dir_count=0,
                                size =0,
                                description = "",
                                inode_number =inode_number,
                                auto_labeling=0,
                                create_datetime=datetime.fromtimestamp(_stat.st_ctime).strftime('%Y-%m-%d %H:%M:%S'))

            #delete_db
            if not check :
                if len(db_datasets) > 0 :
                    print("delete dataset info in db")
                    delete_ids=[]
                    for db_key, db_value in db_datasets.items():
                        delete_ids.append(str(db_value['id']))
                    if len(delete_ids) != 0:
                        db.delete_dataset(', '.join(delete_ids))
    except:
        traceback.print_exc()

def get_dataset_name_list(workspace_id):
    dataset_lists = db.get_dataset_list(workspace_id=workspace_id)
    dataset_name_list=[]
    for dataset in dataset_lists:
        dataset_name_list.append(dataset.get('dataset_name'))
    return dataset_name_list

def make_empty_dir(body, headers_user):
    try:
        print("make directory")
        user_info = db.get_user_id(headers_user)
        user_id = user_info['id']

        if common.is_good_data_name(body['new_name']) is None :
            return response(status = 0, message = 'Invalid dataset name "{}"'.format(body['new_name']))

        workspace_info = db.get_workspace(workspace_id=body['workspace_id'])
        if workspace_info is None:
            return response( status = 0, message = 'not exists workspace')

        dataset_dir = PATH.JF_DATASET_PATH.format(workspace_name=workspace_info['workspace_name'], access = body['access'], dataset_name = body['dataset_name'])
        dataset_dir = "{}{}{}".format(dataset_dir,body['path'],body['new_name'])
        result=make_dir(dataset_dir,headers_user)
        change_own(dataset_dir,headers_user)
        if result is None:
            return response(status = 0, message = "Create folder Error")
        else:
            return response(status = 1, message = "Create folder Succeed")
    except:
        try:
            os.system('rm -rf {}'.format(dataset_dir))
        except:
            traceback.print_exc()
        traceback.print_exc()
        return response(status = 0, message = "Create folder Error")

def data_upload(headers_user,files,dataset_dir):
    try:
        for file_ in files:
            filename = name_filter(file_.filename)
            path = os.path.join(dataset_dir,filename)
            dir_name = os.path.dirname(path)
            if not os.path.exists(dir_name):
                make_dir(dir_name,headers_user)
            with open(path, 'ab') as f:
                    f.write(file_.read())

    except:
        traceback.print_exc()
        return response(status=0, message = 'File Upload Error')

def update_data_upload(body, headers_user, dataset_dir):
    try:
        # file인지 folder인지 구분
        #type file = 0, folder = 1
        upload_path = os.path.join(dataset_dir,'.jf_tmp/{}'.format(headers_user))

        if not os.path.exists(upload_path):
            make_dir(upload_path,headers_user)
        path = body['path']
        data_upload(headers_user, body['doc'], upload_path)

        # for body['doc'] in 
        #Content-Range 값 같으면 리턴되게 수정해야함
        content_range = request.headers.get('Content-Range')
        content_range = content_range.split('-')[1].split('/')
        
        if content_range[0] == content_range[1] :
            if body['type'] == '1' :
                folders_name = body['upload_list']#.split(',')
                for folder_name in folders_name:
                    folder_name=name_filter(folder_name)
                    destination_path = duplicate_check(upload_path, '{}{}'.format(dataset_dir, body['path']), folder_name)
                    move_data(os.path.join(upload_path,folder_name),destination_path)
                    change_own(destination_path, headers_user)

            if body['type']== '0' :
                for filename in body['upload_list']:
                    filename=name_filter(filename)
                    destination_path = duplicate_check(upload_path, '{}{}'.format(dataset_dir, body['path']), filename)
                    move_data(os.path.join(upload_path,filename),destination_path)
                    os.system('chown {}:{} "{}"'.format(headers_user, headers_user, destination_path))
        return response(status=1, message = 'File Upload Success')
    except CustomErrorList as ce:
        traceback.print_exc()
        return response(status=0, message = 'File Upload Error',result = ce.response())
    except Exception as e:
        traceback.print_exc()
        return response(status=0, message = 'Undefine File Upload Error')

def decompression_check(body,headers_user):
    try:
        dataset_info = db.get_dataset_dir(body['dataset_id'])
        path = PATH.JF_DATASET_PATH.format(workspace_name = dataset_info['workspace_name'], access = dataset_info['access'], dataset_name = dataset_info['name'])
        path = '{}/.jf_tmp/{}/.{}.log'.format(path, headers_user, body['files'])
        #filename = body['files']
        percent = 0
        if not os.path.exists("{}".format(path)):
            return response(status=1, result=percent)
        percent = int(subprocess.run(['cat {} | tail -1'.format(path)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').stdout.replace('\n',''))
        # with open("{}/.{}.log".format(dataset_dir,filename),"r") as f:
        #     percent = f.readline()
        if percent >= 100:
            os.system("rm {}".format(path))
        return response(status=1, result=percent)
    except:
        traceback.print_exc()
        print('decompression check error')
        return response(status=0, message = 'decompression check error')

def decompression(body,headers_user):
    try:
        dataset_info = db.get_dataset_dir(body['dataset_id'])
        dataset_dir = PATH.JF_DATASET_PATH.format(workspace_name = dataset_info['workspace_name'], access = dataset_info['access'], dataset_name = dataset_info['name']) + body['path']

        #dataset_dir = '/jf-data/workspaces/{}/datasets/{}/{}{}'.format(dataset_info['workspace_name'], dataset_info['access'], dataset_info['name'],body['path'])
        support_extension = ['.tar', '.zip', '.gz']
        filename = body['files'] # list to string and split 

        file_name,file_Extension = os.path.splitext(filename)
        
        if file_Extension not in support_extension:
            return response(status=0, message = 'Not support Decompression Extension')

        if file_Extension == '.gz':
            file_name,file_Extension = os.path.splitext(file_name)

        destination_path = duplicate_check(dataset_dir, dataset_dir, file_name)
        log_file_path = PATH.JF_DATASET_PATH.format(workspace_name = dataset_info['workspace_name'], access = dataset_info['access'], dataset_name = dataset_info['name'])
        log_file_path = '{}/.jf_tmp/{}/.{}.log'.format(log_file_path, headers_user, filename)

        th_name = "{}_{}".format(dataset_info['name'],file_name)
        if thread_check(th_name):
            if file_Extension == '.tar':
                compress_obj = tarfile.open(name=os.path.join(dataset_dir,filename))
                compress_list = compress_obj.getmembers()
            elif file_Extension == '.zip':
                # with zipfile.ZipFile('{}{}'.format(dataset_dir,filename)) as zip_:
                compress_obj = zipfile.ZipFile('{}{}'.format(dataset_dir,filename))
                compress_list = compress_obj.infolist()

            th = threading.Thread(target=decompress_fuc, name=th_name, args=(compress_obj, compress_list, destination_path, log_file_path, headers_user,))
            th.start()
            while True:
                if not thread_check(th_name):
                    break
        else:
            return response(status=0, message = 'This file is already being decompressed')

        return response(status=1, message = "Decompression Success")
    except:
        traceback.print_exc()
        raise DecompressError
def decompress_fuc(compress_obj, compress_list, destination_path, log_file_path, headers_user):
    try:
        os.system('mkdir -p {}'.format(destination_path))
        os.system('chown {}:{} "{}"'.format(headers_user, headers_user, destination_path))
        if not os.path.exists(log_file_path):
            os.system('mkdir -p {}'.format(os.path.dirname(log_file_path)))
        
        total=len(compress_list)
        curr=0
        for member in compress_list:
            # Extract member
            curr+=1
            percent = (curr/total) * 100
            with open(log_file_path,"a") as f:
                f.write(str("{}\n".format(int(percent))))
            compress_obj.extract(member=member,path=destination_path)
            try :
                os.system('chown {}:{} "{}"'.format(headers_user, headers_user, os.path.join(destination_path,member.filename)))
            except :
                os.system('chown {}:{} "{}"'.format(headers_user, headers_user, os.path.join(destination_path,member.name)))
        compress_obj.close()
    #change_own(destination_path,headers_user)

        # --zip--
        # total=len()
        # curr=0
        # for member in zip_.infolist():
        #     curr+=1
        #     percent = (curr/total) * 100
        #     with open(log_file_path,"a") as f:
        #         f.write(str("{}\n".format(int(percent))))
        #     zip_.extract(member,destination_path)
        #     os.system('chown {}:{} "{}"'.format(headers_user, headers_user, os.path.join(destination_path,member.filename)))

    #change_own(destination_path,headers_user)
    except:
        traceback.print_exc()
        raise DecompressError



#######################

def copy_or_carry(body,headers_user):
    try:
        dataset_info = db.get_dataset_dir(body['dataset_id'])
        dataset_dir = PATH.JF_DATASET_PATH.format(workspace_name = dataset_info['workspace_name'], access = dataset_info['access'], dataset_name = dataset_info['name'])
        target_path = "{}{}".format(dataset_dir,body['target_path'])
        items = body['name'].split(" ")
        for item in items:
            path = os.path.join(target_path,item)
            if not os.path.exists(path):
                return response(status = 0, message = "FileNotFoundError : {}".format(item))

            destination_path = duplicate_check("{}{}".format(dataset_dir,body['target_path']),"{}{}".format(dataset_dir,body['destination_path']),item)
            if not os.path.exists(os.path.dirname(destination_path)):
                os.system("mkdir -p {} ".format(os.path.dirname(destination_path)))
                os.system('chown {}:{} "{}"'.format(headers_user, headers_user, os.path.dirname(destination_path)))

            if body['is_copy']:
                copy_ws_data(path, destination_path)
                os.system('chown {}:{} "{}"'.format(headers_user, headers_user, destination_path))
            else : 
                move_data(path, destination_path)
                os.system('chown {}:{} "{}"'.format(headers_user, headers_user, destination_path))

        if body['is_copy']:
            return response(status = 1, message = "data to copy Success")
        else : 
            return response(status = 1, message = "data to move Success")
    except:
        traceback.print_exc()
        return response(status = 0, message = "copy or move Error")

def search_file_list(path):
    tmp_file_list = os.listdir(path)
    file_list = []
    dir_list = []
    for file_ in tmp_file_list:
        if not file_[0]=='.':
            if os.path.isfile(os.path.join(path,file_)) :
                file_list.append(os.path.join(path,file_))
            elif os.path.isdir(os.path.join(path,file_)):
                file_list.extend(search_file_list(os.path.join(path,file_)))
    return file_list


def upload_ws_dataset(body,headers_user,dataset_dir=None):
    print('upload_ws_dataset')
    download_filepath=[]
    start_length=0
    if dataset_dir is None:
        dataset_info = db.get_dataset_dir(body['dataset_id'])
        dataset_dir = PATH.JF_DATASET_PATH.format(workspace_name = dataset_info['workspace_name'], access = dataset_info['access'], dataset_name = dataset_info['name']) + body['path']
        start_length = len(os.listdir(dataset_dir))

    filepath_lists = body['filepath']#.split(',')
    for filepath in filepath_lists:
        if os.path.exists(filepath):
            if os.path.isfile(filepath):
                download_filepath.append(filepath)
            elif os.path.isdir(filepath):
                download_filepath.extend(search_file_list(filepath))

    
    length=range(len(download_filepath))
    for filepath,i in zip(download_filepath,length):
        Extension = os.path.splitext(filepath)[1]
        final_path =  os.path.join(dataset_dir,str(start_length+i+1)+Extension)
        copy_ws_data(filepath,final_path)
        change_own(final_path,headers_user)
    return response(status = 1, message = 'OK')

#######################

def duplicate_check(upload_path, dataset_dir, name):
    # file
    if os.path.isfile(os.path.join(upload_path, name)):
        destination_path = os.path.join(dataset_dir, name)            
        if os.path.exists(destination_path):
            file_name,file_Extension = os.path.splitext(name)
            num_file = len(fnmatch.filter(os.listdir(os.path.dirname(dataset_dir)),file_name+'*'+file_Extension))
            destination_path = os.path.join(dataset_dir,file_name+'_'+str(num_file)+file_Extension)
            while True:
                if not os.path.exists(destination_path):
                    break
                num_file += 1
                destination_path = os.path.join(dataset_dir,file_name+'_'+str(num_file)+file_Extension)
            
        return destination_path
    #folder
    else:
        destination_path = os.path.join(dataset_dir,name)
        if os.path.exists(destination_path):
            num_folder = len(fnmatch.filter(os.listdir(dataset_dir),name+'*'))
            destination_path= os.path.join(dataset_dir,name+'_'+str(num_folder))
            while True:
                if not os.path.exists(destination_path):
                    break
                num_folder += 1
                destination_path= os.path.join(dataset_dir,name+'_'+str(num_folder))
        return destination_path

def flightbase_create_dataset(body,headers_user):
    """ 
        Dataset 생성시 flightbase를 이용하여 생성하는 경우 
        ---
        # Arguments
            headers_user : User name
            body : 
            {
                dataset_name(str): 데이터셋 이름
                workspace_id(int): Workspace ID값
                access(int): 읽기쓰기 or 읽기
                description(str): 설명 
                upload_method(int): 업로드 방식 (0 → fb)
                doc(binary): 업로드하는 데이터(fb만 존재) 
            }
        # Returns:
            업로드 완료시 dataset_dir
            분할업로드 중 None
    """
    try:
        dataset_lists = get_dataset_name_list(workspace_id=body['workspace_id'])
        content_range = request.headers.get('Content-Range')
        if content_range is not None:
            content_range = content_range.split('-')#[1].split('/')
        if body['dataset_name'] in dataset_lists:
            if content_range is None :
                return response(status = 0, message = "Exists dataset")
            if content_range[0] == 'bytes 0':
                return response(status = 0, message = "Exists dataset")
        
        workspace_info = db.get_workspace(workspace_id=body['workspace_id'])
        dataset_dir = PATH.JF_DATASET_PATH.format(workspace_name=workspace_info['workspace_name'], access = body['access'],dataset_name = body['dataset_name'])
        
        if not os.path.exists(dataset_dir):
            result = make_dir(dataset_dir,headers_user)
        
        if body['doc'] is not None :
            content_range = content_range[1].split('/')
            data_upload(headers_user,body['doc'],dataset_dir)
            if content_range[0] == content_range[1] :
                change_own(dataset_dir,headers_user)
                return dataset_dir
            else :
                return None
        else :
            change_own(dataset_dir,headers_user)
            return dataset_dir
    except :
        raise CreateDatasetError

def buint_in_model_create_dummy(body,headers_user):
    try:
        content_range = request.headers.get('Content-Range')
        
        if content_range is not None :
            content_range = content_range.split('-')
            if not content_range[0] == 'bytes 0':
                return None

        dataset_lists = get_dataset_name_list(workspace_id=body['workspace_id'])
        workspace_info = db.get_workspace(workspace_id=body['workspace_id'])
        
        
        if body['dataset_name'] in dataset_lists:
            if content_range is None :
                return response(status = 0, message = "Exists dataset")
            if content_range[0] == 'bytes 0':
                return response(status = 0, message = "Exists dataset")

        data_training_form = db.get_built_in_model_data_training_form(body['built_in_model_id'])
        dataset_dir = PATH.JF_DATASET_PATH.format(workspace_name=workspace_info['workspace_name'], access = body['access'],dataset_name = body['dataset_name'])
        if not os.path.exists(dataset_dir):
            result = make_dir(dataset_dir,headers_user)
        
        for dummy in data_training_form:
            dummy = dict(dummy)
            if dummy['name'][0] == '/':
                empty_path ="{}{}".format(dataset_dir,dummy['name'])
            else :
                empty_path = os.path.join(dataset_dir,dummy['name'])

            if dummy['type'] == 'dir':
                if not os.path.exists(empty_path):
                    make_dir(empty_path,headers_user)
            else:
                dir_name = empty_path.rpartition('/')[0]
                if not os.path.exists(dir_name) :
                    make_dir(dir_name,headers_user)
                with open(empty_path, 'w') as f:
                    f.write('This is dummy')

        remove_list_str = request.headers.get('Remove-List')
        if remove_list_str is not None:
            remove_list = remove_list_str.split(',')
            for remove_ in remove_list:
                remove_dir(os.path.join(dataset_dir,remove_))
        return dataset_dir
    except:
        traceback.print_exc()
        return response(status = 0, message = "Create dummy Error")

def built_in_model_create_datasts(body,headers_user):
    try:
        content_range = request.headers.get('Content-Range')
        if content_range is not None:
            content_range = content_range.split('-')#[1].split('/')

        
        workspace_info = db.get_workspace(workspace_id=body['workspace_id'])
        dataset_dir = PATH.JF_DATASET_PATH.format(workspace_name=workspace_info['workspace_name'], access = body['access'],dataset_name = body['dataset_name'])
        
        if content_range is None:
            change_own(dataset_dir,headers_user)
            return dataset_dir

        content_range = content_range[1].split('/')

        if body['doc'] is not None :
            data_upload(headers_user,body['doc'],dataset_dir)
            if content_range[0] == content_range[1]:
                change_own(dataset_dir,headers_user)
                return dataset_dir
            else:
                return None
    except:
        traceback.print_exc()
        return response(status = 0, message = "built in model create dataset error")

#TODO dataset upload method 별로 분리 및 flightbase 업로드 로직 구현(중복 및 분할업로드 고려되어야 함)
def create_dataset(body, headers_user):
    """ 
        Dataset 생성 요청을 upload_method에 따라 알맞는 fuction 호출하고
        경로를 리턴 받았을 경우 DB에 insert해주는 함수
        ---
        # Arguments
            headers_user : User name
            body : 
            {
                dataset_name(str): 데이터셋 이름
                workspace_id(int): Workspace ID값
                access(int): 읽기쓰기 or 읽기
                description(str): 설명 
                upload_method(int): 업로드 방식 (0 → fb, 1 → Google Drive, 2 → AIP플랫폼에서 업로드 )
                doc(binary): 업로드하는 데이터(fb만 존재) 
            }
        # Returns:
            status = 1(True) or 0(False)
            message = API에서 보내는 메세지
    """
    try:
        user_id = db.get_user_id(headers_user)
        user_id = user_id['id']
        
        # local upload
        if body['upload_method'] == 0 :
            if body['google_info'] is not None :
                try:
                    print(body['google_info'])
                    dataset_dir = google_drive_upload(body,headers_user)
                except:
                    traceback.print_exc()
                    return response(status=0, message = "google authentication error")
            else :
                res = flightbase_create_dataset(body,headers_user)
                if type(res) ==  type({}):
                    return res
                else:
                    dataset_dir = res
        # built in model upload
        elif body['upload_method'] == 1:
            print("built in model upload")
            res = buint_in_model_create_dummy(body,headers_user)
            if type(res) == type({}):
                return res
            if body['google_info'] is not None :
                try:
                    dataset_dir = google_drive_upload(body,headers_user)
                except:
                    traceback.print_exc()
                    return response(status=0, message = "google authentication error")
            else:
                dataset_dir = built_in_model_create_datasts(body,headers_user)
        # ws upload
        else :
            if body['filepath'] is not None:
                #TODO 코드수정 필요
                upload_ws_dataset(body,headers_user,dataset_dir)
            

        if dataset_dir is None:
            return response(status = 1, message = 'data uploading')
        else :
            if os.path.exists(dataset_dir):
                dataset_lists = get_dataset_name_list(workspace_id=body['workspace_id'])
                if not body['dataset_name'] in dataset_lists:
                    stat_datasets = stat_file(dataset_dir)
                    inode_number = stat_datasets.st_ino
                    if body['doc'] is None and body['google_info'] is None and body['built_in_model_id'] is None:
                        result = db.insert_dataset(name = body['dataset_name'],
                            workspace_id = body['workspace_id'],
                            create_user_id = user_id, 
                            access = body['access'],
                            file_count = 0,
                            dir_count = 0,
                            size = 0,
                            description=body["description"],
                            inode_number = inode_number,
                            auto_labeling=0,
                            create_datetime=datetime.fromtimestamp(stat_datasets.st_ctime).strftime('%Y-%m-%d %H:%M:%S'))
                    else :
                        size = get_dir_size(dataset_dir)
                        file_count,dir_count = get_dir_count(dataset_dir)
                        result = db.insert_dataset(name = body['dataset_name'],
                            workspace_id = body['workspace_id'],
                            create_user_id = user_id, 
                            access = body['access'],
                            file_count = file_count,
                            dir_count = dir_count,
                            size = size,
                            description=body["description"],
                            inode_number = inode_number,
                            auto_labeling=0,
                            create_datetime=datetime.fromtimestamp(stat_datasets.st_ctime).strftime('%Y-%m-%d %H:%M:%S'))
            
                    db.logging_history(user=headers_user, task="dataset", action="create", workspace_id=body['workspace_id'], task_name=body['dataset_name'], update_details='create dataset')

        return response(status = 1, message = 'OK')
    except CustomErrorList as ce:
        try:
            os.system('rm -rf {}'.format(dataset_dir))
        except:
            traceback.print_exc()
        traceback.print_exc()
        raise ce
    except Exception as e:
        try:
            os.system('rm -rf {}'.format(dataset_dir))
        except:
            traceback.print_exc()
        raise e
        #print(e.response())
        # return response(status = 0, result =e.response())


def dataset_info_update(body,headers_user):
    try:
        """ 
            Dataset 정보 변경
            body로 들어온 argument들을 기존 db에 있는 정보들과 비교해서
            변경된 값을을 db에 업데이트 하고 workspace level의 history에 기록
            ---
            # Arguments
                headers_user : User name
                body : 
                {
                    dataset_name : 변경하거나 변경되지 않은 데이터셋 이름
                    workspace_id : 변경하거나 변경되지 않은 workspace id 값
                    access : 변경하거나 변경되지 않은 access 값
                    description : 변경하거나 변경되지 않은 데이터셋에 관한 설명
                    dataset_id : 변경되지 않는 데이터셋 ID값(Unique key)
                }
                

            # Returns:
                status(int) : 0(실패), 1(성공)
                message : API에서 보내는 메세지
                    
                example :
                {
                    "message": "OK"
                    "result": null
                    "status": 1
                }
        """        
        #데이터셋 변경시 id값은 변하지 않음
        import copy
        print("dataset_info_update")
        org_dataset_info = db.get_dataset_dir(body['dataset_id'])
        change_dataset_info = copy.deepcopy(org_dataset_info)
        log_desc_arr = []
        #print(org_dataset_info)
        if body['dataset_name']!= org_dataset_info['name'] :
            change_dataset_info['name'] = body['dataset_name']
            if not common.is_good_data_name(body['dataset_name']):
                return response(status = 0, message = 'Invalid dataset name {}'.format(body['dataset_name']))
            log_desc_arr.append('Dataset Name change to "{}"'.format(body['dataset_name']))

        if body['workspace_id']!= org_dataset_info['workspace_id'] :
            change_dataset_info['workspace_id'] = body['workspace_id']
            change_dataset_info['workspace_name'] = db.get_workspace(workspace_id=body['workspace_id'])['workspace_name']
            log_desc_arr.append('Workspace change to "{}"'.format(change_dataset_info['workspace_name']))

        if body['access']!= org_dataset_info['access']:
            change_dataset_info['access'] = body['access']
            log_desc_arr.append('Access Type change')
        
        if body['description'] != org_dataset_info['description']:
            log_desc_arr.append('description change')

        org_path = PATH.JF_DATASET_PATH.format(workspace_name=org_dataset_info['workspace_name'], access = org_dataset_info['access'],dataset_name = org_dataset_info['name'])
            #org_path ='{}/{}/datasets/{}/{}'.format(settings.JF_WS_DIR, org_dataset_info['workspace_name'], org_dataset_info['access'], org_dataset_info['name'])
        cur_path = PATH.JF_DATASET_PATH.format(workspace_name=change_dataset_info['workspace_name'], access = body['access'],dataset_name = body['dataset_name'])
            #cur_path ='{}/{}/datasets/{}/{}'.format(settings.JF_WS_DIR, db.get_workspace(workspace_id=body['workspace_id'])['workspace_name'],body['access'], body['dataset_name'])
        os.system('mv {} {}'.format(org_path, cur_path))
    
        
        result = db.update_dataset(id=body['dataset_id'],
                                    name=body['dataset_name'],
                                    workspace_id=body['workspace_id'],
                                    create_user_id = None,
                                    access=body['access'],
                                    file_count=None,
                                    dir_count=None,
                                    size=None,
                                    description=body["description"],
                                    modify_datetime =None,
                                    auto_labeling=None)
        
        if result :
            db.logging_history(
                user=headers_user, task='dataset',
                action='update', workspace_id=org_dataset_info['workspace_id'],
                task_name=org_dataset_info['name'], update_details='/'.join(log_desc_arr)
                )
        return response(status = 1, message = 'OK')
    except:
        traceback.print_exc()
        return response(status = 0, message = "dataset info Update Error")

def update_file_or_folder(body, headers_user):
    try:
        print("update_file_or_folder")
        org_dataset_info = db.get_dataset_dir(body['dataset_id'])
        dataset_dir = PATH.JF_DATASET_PATH.format(workspace_name=org_dataset_info['workspace_name'], access = org_dataset_info['access'],dataset_name = org_dataset_info['name'])
        if body['original_name'] is not None :
            dataset_dir = dataset_dir + body['path']
           
            dataset_org = os.path.join(dataset_dir,body['original_name'])
            if body['new_name'] == '.jf_tmp':
                return response(status = 0, message = 'Invalid name ".jf_tmp".')
            new_file_name = os.path.splitext(body['new_name'])[0]
            # #기존 and 새로운 이름을 확장자 기준으로 분리후 이름검사
            # if os.path.splitext(body['original_name'])[1] != new_file_name_extension :
            #     return response(status = 0, message = 'You can not change the Extension')

            if common.is_good_data_name(new_file_name) is None :
                return response(status = 0, message = 'Invalid dataset name "{}"'.format(body['new_name']))
            
            dataset_cur = os.path.join(dataset_dir,body['new_name'])
        
            move_data(dataset_org, dataset_cur)
            # if body['type'] == 1 :
            #     return response(status = 1, message = 'Folder name change success')
            # else :
            #     return response(status = 1, message = 'File name change success')
        #remove files
        if body['remove_files'] is not None:
            print("remove file")
            remove_file_history = body['remove_files']
            if len(remove_file_history)-1 > 0 : 
                remove_file_history= remove_file_history[0]+'\n and '+str(len(remove_file_history)-1)+' others'
            else : 
                remove_file_history= remove_file_history
            for remove_file in body['remove_files']:
                try:
                    if ' ' in remove_file:      ## remove_file안에 공백이 있는지 check
                        remove_file = remove_file
                        (' ','\ ')
                    os.system('rm -rf {}/{}'.format(dataset_dir,remove_file))
                except Exception as e:
                    pass

        #upload files
        if body['doc'] is not None:
            print("Update upload file")
            # try :
            result = update_data_upload(body, headers_user, dataset_dir)
            # if result == 0 :
            #     return response(status =  0, message = 'Please check the name you are changing. (without *, ?, #, %, and space)')
            return result
                # content_range = request.headers.get('Content-Range')
                # content_range = content_range.split('-')[1].split('/')
                # #if content_range[0] == content_range[1] :
                #     # db.logging_history(
                #     #         user=headers_user, task='dataset',
                #     #         action='update', workspace_id= body['workspace_id'],
                #     #         task_name= body['dataset_name'], update_details='upload files')
                    #file_count_check = True
            # except Exception :
            #     traceback.print_exc()
            #     response(status = 0, message = 'Update Error')

        return response(status = 1, message = 'Update success')

    except:
        traceback.print_exc()
        return response(status = 0, message = "Update Error")

## front화면에서 datasets를 누르면 나오는 화면에 dataset들을 출력해주는 함수
def get_datasets(workspace_id=None, page=None, size=None, search_key=None, search_value=None, headers_user=None):
    print("get datasets funtion")
    try :
        if headers_user is None:
            return response(status=0, message="Jf-user is None in headers")
        user_info = db.get_user_id(headers_user)

        # if user_info is not None:
        user_id = 1 if user_info['id'] is None else user_info['id']
        #root
        if workspace_id is None:
            workspace_ids = db.get_workspace_id_list()
            scan_workspace([ws['id'] for ws in workspace_ids], False)
        else:
            scan_workspace([workspace_id], False)
        dataset_lists = db.get_dataset_list(workspace_id=workspace_id, user_id=user_id, search_key=search_key,search_value=search_value, user_type=user_info['user_type'] )
        dataset_count = len(dataset_lists)
        for dataset in dataset_lists:
                
            dataset['permission_level'] = check_dataset_access_level(user_id, db.get_dataset_dir(dataset['id']))

        current_time = datetime.now()
        if dataset_lists is None:
            reval = {'list' : [], 'total' : 0 }
        else:
            if page is not None and size is not None:
                start_num = (page-1)*size
                end_num = page * size
                dataset_lists = dataset_lists[start_num:end_num]

            for dataset in dataset_lists:
                try:
                    dataset['modify_time'] = int((current_time - datetime.strptime(dataset['modify_datetime'],'%Y-%m-%d %H:%M:%S')).total_seconds()*0.016)
                    dataset['update_time'] = int((current_time - datetime.strptime(dataset['update_datetime'],'%Y-%m-%d %H:%M:%S')).total_seconds()*0.016)
                except:
                    dataset['modify_time'] = None
                    dataset['update_time'] = None
            reval = {'list' : dataset_lists, 'total' : dataset_count }
        return response(status = 1, result = reval)
    except:
        traceback.print_exc()
        return response(status = 0, message = "Get datasets Error")



def remove_dataset(id_list, headers_user, headers_user_id):
    print("remove dataset funtion")
    try:
        message = ''
        d_id_list = id_list.split(',')

        for id_str in d_id_list :
            dataset_info_list = db.get_dataset_workspace_name(id_str)
            if db.delete_dataset(id_str):
                rm_chk = True
                dataset_name_list = []
                for dataset_info in dataset_info_list:
                    dataset_dir = PATH.JF_DATASET_PATH.format(workspace_name=dataset_info['workspace_name'], access = dataset_info['access'], dataset_name = dataset_info['dataset_name'])
                    if remove_dir(dataset_dir):
                        dataset_name_list.append(dataset_info['dataset_name'])
                        continue
                    else :
                        message += 'Failed to delete dataset directory:{}\n'.format(dataset_info['dataset_name'])
                        rm_chk = False
                if rm_chk:
                    for dataset_item in dataset_name_list:
                        db.logging_history(
                            user=headers_user, task="dataset", 
                            action="delete", workspace_id=dataset_info['workspace_id'], 
                            task_name=dataset_item
                        )
            else:
                return response(status = 0, message = 'Failed to delete dataset in DB')
        return response(status = 1, message = 'Remove dataset')
    except:
        traceback.print_exc()
        return response(status = 0, message = "Remove dataset Error")

from pwd import getpwuid
#dataset의 설정 수정
# prev get dataset info (include file list)
def get_dataset_dir(dataset_id, search_path='/', search_page=1, search_size=10, search_type=None, search_key=None, search_value=None, user_id=None):
    print("get dataset dir funtion")
    try:
        dataset_dir_info = db.get_dataset_dir(dataset_id)
        path = PATH.JF_DATASET_PATH.format(workspace_name = dataset_dir_info['workspace_name'], access = dataset_dir_info['access'], dataset_name = dataset_dir_info['name']) + search_path
       
        dataset_file_list, file_count = check_file(search_path, search_page, search_size, search_type, search_key, search_value, path)
        
        dataset_dir_info['file_list'] = dataset_file_list
        dataset_dir_info['permission_level'] = check_dataset_access_level(user_id, dataset_dir_info)
        return response(status = 1, result = dataset_dir_info)
    except:
        traceback.print_exc()
        return response(status = 0, message = "Get dataset directory Error")

#dataset의 파일목록 확인
def get_dataset_files(dataset_id, search_path='/', search_page=1, search_size=10, search_type=None, search_key=None, search_value=None, headers_user=None):
    print("get dataset files funtion")
    try:
        dataset_dir_info = db.get_dataset_dir(dataset_id)
        path = PATH.JF_DATASET_PATH.format(workspace_name = dataset_dir_info['workspace_name'], access = dataset_dir_info['access'], dataset_name = dataset_dir_info['name']) + search_path
        
        result = {}
        dataset_file_list, file_count = check_file(search_path, search_page, search_size, search_type, search_key, search_value, path)
        result['list'] = dataset_file_list
        result['file_count'] = file_count
        return response(status = 1, result = result)
    except:
        traceback.print_exc()
        return response(status = 0, message = "Get dataset files Error")

def thread_check(th_name):
    try:
        thread_list = threading.enumerate()
        for th in thread_list:
            if th_name == th.name:
                return False
        # not exist thread
        return True
        
    except:
        traceback.print_exc()
        return response(status = 0, message = "thread_check Error")

def ws_datasets_synchronization(event, workspace_id=None):
    try:
        event.wait()
        scan_workspace([workspace_id])
        event.clear()
    except:
        traceback.print_exc()
        return response(status = 0, message = "ws_datasets_synchronization Error")

def cyclical_ws_datasets_synchronization(timer=1):
    try:
        import time
        while True:
            workspace_ids = db.get_workspace_id_list()
            for ws in workspace_ids:
                event = threading.Event()
                th_name = "workspace{}".format(ws['id'])
                #th_flag=thread_check(th_name)
                if thread_check(th_name):
                    print("cyclical_ws_datasets_synchronization")
                    with jf_dataset_lock:
                        th = threading.Thread(target=ws_datasets_synchronization, name=th_name, args=(event, ws['id'],))
                        th.start()
                        while True:
                            if not thread_check(th_name):
                                event.set()
                                break
            time.sleep(3600*timer)
    except:
        traceback.print_exc()
        return response(status = 0, message = "cyclical_ws_datasets_synchronization Error")
    
def dataset_sync(dataset_dir_info,event):
    try:
        event.wait()
        path = PATH.JF_DATASET_PATH.format(workspace_name=dataset_dir_info['workspace_name'], access = dataset_dir_info['access'],dataset_name = dataset_dir_info['name'])
        
        try:
            total_size = get_dir_size(path)
            file_count , dir_count = get_dir_count(path)
        except:
            total_size = 0
            file_count = 0
            dir_count = 0
            traceback.print_exc()

        # if dataset_dir_info['file_count'] != file_count:
        _stat = stat_file(path)
        user_info = db.get_user_by_uid(_stat.st_uid)
        user_info_id = "1" if user_info is None else user_info["id"]
        db.update_dataset(id = dataset_dir_info['id'], name = dataset_dir_info['name'], 
                        workspace_id = dataset_dir_info['workspace_id'],
                        create_user_id= user_info_id,
                        access = dataset_dir_info['access'],
                        file_count = file_count,
                        dir_count = dir_count,
                        size = total_size,
                        description = None,
                        modify_datetime=datetime.fromtimestamp(_stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S'),
                        auto_labeling=None)

        
    except:
        traceback.print_exc()
        return response(status = 0, message = "Get dataset info s Error")

# get dataset info
def get_dataset_info(dataset_id, user_id=None):
    try:
        # event=threading.Event()
        dataset_dir_info = db.get_dataset_dir(dataset_id)
        # th_name = "{}_{}".format(dataset_dir_info['workspace_id'],dataset_dir_info['id'])
        # if thread_check(th_name):
        #     with jf_dataset_lock:
        #         print("dataset_synchronization")
        #         th = threading.Thread(target=dataset_sync, name=th_name, args=(dataset_dir_info,event,))
        #         th.start()
        #         while True:
        #             if not thread_check(th_name):
        #                 event.set()
        #                 print('check complete')
        #                 break
        #     event.clear()

        dataset_dir_info['permission_level'] = check_dataset_access_level(user_id, dataset_dir_info)
        return response(status = 1, result = dataset_dir_info)
    except:
        traceback.print_exc()
        return response(status = 0, message = "Get dataset info Error")

def dataset_info_sync(dataset_id):
    try:
        event=threading.Event()
        dataset_dir_info = db.get_dataset_dir(dataset_id)
        th_name = "{}_{}".format(dataset_dir_info['workspace_id'],dataset_dir_info['id'])
        if thread_check(th_name):
            with jf_dataset_lock:
                print("dataset_synchronization")
                th = threading.Thread(target=dataset_sync, name=th_name, args=(dataset_dir_info,event,))
                th.start()
                while True:
                    if not thread_check(th_name):
                        event.set()
                        print('check complete')
                        break
            event.clear()
        else : 
            return response(status = 1, message = "Already working")
        return response(status = 1, message = "dataset info sync request completed")
    except Exception as e:
        traceback.print_exc()
        return response(status = 0, result = e.response())
        
def get_dataset_marker_files(dataset_id, search_path=None, headers_user=None):
    def find_all_files_with_subfolder(path):
        datas = []
        try:
            file_list = os.listdir(path)
        except OSError as e:
            print("os.listdir error : " , e)
            datas.append(path)
            return datas
            
        for name in file_list:
            if os.path.isdir(os.path.join(path,name)) == True:
                datas+=find_all_files_with_subfolder(os.path.join(path,name))
            if ".jpeg" in name or "jpg" in name or ".png" in name:
                datas.append(os.path.join(path,name))
        return datas
    
    def find_files_in_folder(path):
        datas = []
        file_list = os.listdir(path)
        for name in file_list:
            if os.path.isfile(os.path.join(path,name)) :
                if ".jpeg" in name or "jpg" in name or ".png" in name:
                    datas.append(name)
        return datas
    try:
        dataset_dir_info = db.get_dataset_dir(dataset_id)
        path = PATH.JF_DATASET_PATH.format(workspace_name = dataset_dir_info['workspace_name'], access = dataset_dir_info['access'], dataset_name = dataset_dir_info['name'])
        if search_path is not None:
            path = path + search_path
        file_list = []
        if search_path is None:
            file_list = find_all_files_with_subfolder(path)
        else :
            file_list = find_files_in_folder(path)
        return response(status=1, result=file_list)
    except FileNotFoundError as fe:
        # traceback.print_exc()
        return response(status=0, result=[], message="Search Path : [{}]  is not exist.".format(search_path))
    except Exception as e:
        traceback.print_exc()
        return response(status=0, result=[], message="Get dataset for marker error ")


def download(body, headers_user = None):
    try :
        print('download funtion')
        download_count=0

        dataset_info = db.get_workspace_dataset_name(body['dataset_id'])
        dataset_dir = PATH.JF_DATASET_PATH.format(workspace_name=dataset_info['workspace_name'], access = dataset_info['access'],dataset_name = dataset_info['dataset_name'])
        download_path = os.path.join(dataset_dir,".jf_tmp/{}".format(headers_user))
        # body['donwload_files'] = body['donwload_files'].decode("ascii")
        # body['path'] = body['path'].decode("ascii")

        #raise Exception

        if body['download_files'] is None:
            dataset_dir = dataset_dir.split(dataset_info['dataset_name'])[0]
            download_list = dataset_info['dataset_name']
        else:
            download_list =  str(body['download_files']).replace('[','').replace(']','').replace("'",'')

        if body['path'] is not None:
            dataset_dir = "{}{}".format(dataset_dir,body['path'])

        download_count = len(download_list.split(' '))
        timestamp = datetime.now().strftime('%s')
        
        if not os.path.isdir(download_path) :
            os.system('mkdir -p {}'.format(download_path))
        #tar.gz으로 압축 이름이 겹치지 않게 하기위해서 랜덤함수와 timestamp를 사용 
        
        if download_count == 1 :
            if not os.path.isdir(os.path.join(dataset_dir,download_list)):
                filename_bytes = download_list.encode('utf-8')
                filename_base64 = base64.b64encode(filename_bytes)
                attachment_filename = filename_base64.decode('ascii')

                result = send_from_directory(directory = dataset_dir, filename = download_list, as_attachment= True, conditional =True, attachment_filename  = attachment_filename) #,  conditional =True
                result.headers["Access-Control-Expose-Headers"] = 'Content-Disposition'
                return response(status = 1, message = "download Success", self_response = result)

        zip_name = headers_user+'_'+timestamp+str(int(random.random()*1000))+'.tar'
        os.chdir(dataset_dir)
        os.system('tar -cf {} {}'.format(zip_name, download_list))
        os.system('mv {} {} && cd / '.format(os.path.join(dataset_dir,zip_name), download_path))


        download_list = download_list.split(' ')
        # body path로 파일인지 데이터셋인지 구분 및 다운로드 갯수 count후 log message 입력
        if body['path'] is not None :
            if len(download_list)-1 > 0 : 
                update_details= download_list[0]+' and '+str(len(download_list)-1)+' others'
            else : 
                update_details= download_list
        else : 
            update_details = None
        # db.logging_history(
        #             user=headers_user, task='dataset',
        #             action='download', workspace_id=dataset_info['workspace_id'],
        #             task_name=dataset_info['dataset_name'], update_details=update_details)

        
        #return send_file(download_path, as_attachment= True,cache_timeout=1)

        if download_count == 1 :
            attachment_filename = download_list[0]+'.tar'
            filename_bytes = attachment_filename.encode('utf-8')
            filename_base64 = base64.b64encode(filename_bytes)
            attachment_filename = filename_base64.decode('ascii')

            #decode test
            filename_base64 = base64.b64decode(filename_base64)

            result = send_from_directory(directory = download_path, filename = zip_name, as_attachment= True, conditional =True, attachment_filename = attachment_filename)# as_attachment= True,
        else :
            result = send_from_directory(directory = download_path, filename = zip_name )
        result.headers["Access-Control-Expose-Headers"] = 'Content-Disposition'

        os.system("rm {}/{}".format(download_path, zip_name))
        return response(status = 1, message = "download Success", self_response = result)
    except:
        traceback.print_exc()
        raise DownloadError
                    




def preview(body, headers_user = None):
    try:
        print('preview funtion')
        if headers_user is None:
            return response(status = 0, message = "Jf-user is None in headers")
        user_id = db.get_user_id(headers_user)
        user_id = user_id['id']
        exel_ext = ['.csv']
        img_ext = ['.jpg','.jpeg','.png']
        dataset_info = db.get_workspace_dataset_name(body['dataset_id'])
        path = PATH.JF_DATASET_PATH.format(workspace_name=dataset_info['workspace_name'], access = dataset_info['access'],dataset_name = dataset_info['dataset_name']) + body['path']

        file_name, file_ext = os.path.splitext(body['file_name'])
        file_ext = file_ext.lower()
        if file_ext == '.txt' :
            print('this is text file')
            try:
                with open(os.path.join(path,body['file_name']), "r", encoding ='utf-8') as file_ : 
                    text = file_.read()
            except:
                with open(os.path.join(path,body['file_name']), "r", encoding ='euc_kr') as file_ :
                    text = file_.read()
            output = { 'data' : text, 'type' : 'text'}
            file_.close()
            return response(status = 1, result = output)
        elif file_ext =='.md' :
            try:
                with open(os.path.join(path,body['file_name']), "r", encoding ='utf-8') as file_ : 
                    text = file_.read()
            except:
                with open(os.path.join(path,body['file_name']), "r", encoding ='euc_kr') as file_ :
                    text = file_.read()
            output = { 'data' : text, 'type' : 'markdown'}
            return response(status = 1, result = output)
        elif file_ext in img_ext :
            print('this is image file')
            with Image.open(os.path.join(path,body['file_name']), mode='r') as img:
                #if img.mode in ("RGBA", "P", "LA"): img = img.convert("RGB")
                img_byte_arr = io.BytesIO()
                if img.format == "PNG" :
                    img.save(img_byte_arr, format='png')
                else:
                    img.save(img_byte_arr, format='jpeg')
                img = base64.encodebytes(img_byte_arr.getvalue()).decode()
            output = { 'data' : img, 'type' : 'image'}
            return response(status = 1, result = output)
        # elif file_ext == '.mp4' :
        #     print('this is video file')
        #     os.system('pip install --upgrade pip')
        #     os.system('pip install opencv-python')
            
        #     import cv2
        #     vidcap = cv2.VideoCapture(os.path.join(path,body['file_name']))
        #     img_list=[]
        #     count = 0
        #     preview_path = '/jf-data/preview'
        #     if not os.path.isdir(preview_path) :
        #         os.system('mkdir -p {}'.format(preview_path))
        #     while(vidcap.isOpened()):
        #         ret, img = vidcap.read()
        #         #if(int(vidcap.get(1)) % 20 == 0):
        #         if img is None:
        #             break
        #         cv2.imwrite("/jf-data/preview/frame%d.jpg" % count, img)
        #         #print('Saved frame%d.jpg' % count)
                
        #         img = Image.open(os.path.join(preview_path,"frame%d.jpg" % count), mode='r')
        #         img_byte_arr = io.BytesIO()
        #         img.save(img_byte_arr, format='jpeg')
        #         img = base64.encodebytes(img_byte_arr.getvalue()).decode()
        #         img_list.append(img)
        #         os.system('rm {}'.format(os.path.join(preview_path,"frame%d.jpg" % count)))
        #         count += 1
        #     vidcap.release()
        #     print('read video complete')
        #     output = { 'data' : img_list, 'type' : 'video'}
        #     return response(status = 1, result = output)
        # elif file_ext == '.mp4' :
        #     with open(os.path.join(path,body['file_name']), "rb") as videoFile:
        #         video_content = videoFile.read()
        #         video_content = base64.b64encode(video_content)
                
        #         #result = json.load(video_content)
        #         #result = DatatypeConverter.printBase64Binary
        #         print(video_content)
        #     output = { 'data' : video_content, 'type' : 'video'}
        #     return response(status = 1, result = output)
    
        elif file_ext in exel_ext : 
            print('this is csv file')
            try:
                with open(os.path.join(path,body['file_name']), "r", encoding ='utf-8') as file_ : 
                    text = file_.read()
            except:
                with open(os.path.join(path,body['file_name']), "r", encoding ='euc_kr') as file_ :
                    text = file_.read()
            #text = file_.read()
            output = { 'data' : text, 'type' : 'text'}
            return response(status = 1, result = output)
        
        elif file_ext in '.json' :
            print('this is json file')
            json_data = []
            
            #json_data = [json.loads(line) for line in open(os.path.join(path,body['file_name']), 'r')]
            
            try:
                with open(os.path.join(path,body['file_name']), "r") as file_ :
                    json_data = json.load(file_)
                    output = { 'data' : json_data, 'type' : 'json'}
            except:
                with open(os.path.join(path,body['file_name']), "r") as file_ : 
                    json_data = file_.read()
                    output = { 'data' : json_data, 'type' : 'text'}
            
            return response(status = 1, result = output)

        else:
            return response(status = 0, message = "This extension is not supported.")

    except Exception as e:
        traceback.print_exc()
        return response(status = 0, message = "dataset preview Error")

def git_clone(args,headers_user=None):
    os.system('pip install GitPython')
    import git 
    try:
        dataset_info = db.get_dataset_dir(args['dataset_id'])
        ##create path##
        path = PATH.JF_DATASET_PATH.format(workspace_name = dataset_info['workspace_name'], access = dataset_info['access'], dataset_name = dataset_info['name'])
        if args['current_path'] is None:
            path = path + args['dir']
        else :
            path = path + args['current_path'] + args['dir']

        if os.path.exists(path):
            print("exist folder")
            return response(status = 0, message = "exist folder")
        ##create url##
        url = args['url'].split('//')
        url = 'http://'+args['username']+':'+args['accesstoken']+'@'+url[1]
        
        #url = 'http://github.com/teauk/jupyterlab-git.git'
        git.Repo.clone_from(url,path)

        #Clone시 생성되는 폴더 소유자 변경
        os.system('chown {}:{} "{}"'.format(headers_user, headers_user, path))
        #폴더 내 하위 파일,폴더 소유자 변경
        change_own(path,headers_user)
        return response(status = 1, result = {'is_private' : False}, message = 'git clone success')
    except Exception as e:
        traceback.print_exc()
        return response(status = 0, result = {'is_private' : True}, message = "git clone failed")
        



#TODO 사용가능한 core개수에 따라서 스레드개수 수정되어야함
def google_drive_upload(body,headers_user):
    try:
        #dataset create upload
        if 'dataset_id' not in body :
            dataset_lists = get_dataset_name_list(workspace_id=body['workspace_id'])
            if body['dataset_name'] in dataset_lists:
                return response(status = 0 , message = "Already exist dataset")
            workspace_info = db.get_workspace(workspace_id=body['workspace_id'])
            dataset_dir = PATH.JF_DATASET_PATH.format(workspace_name=workspace_info['workspace_name'], access = body['access'], dataset_name = body['dataset_name'])
        # data update upload   
        else : 
            dataset_info = db.get_dataset_dir(body['dataset_id'])
            dataset_dir = PATH.JF_DATASET_PATH.format(workspace_name=dataset_info['workspace_name'], access = dataset_info['access'], dataset_name = dataset_info['name'])
            dataset_dir = '{}{}'.format(dataset_dir,body['path'])

        dataset_dir = name_filter(dataset_dir)
        if not os.path.exists(dataset_dir):
            dataset_dir = make_dir(dataset_dir,headers_user)

        google_info = json.loads(body['google_info'])
        next_page_token = ""
        headers = {'Authorization':'Bearer {}'.format(google_info['access_token']),'Content_Type':'application/json'}
        #google_drive_get_list(items, next_page_token, headers, headers_user, dataset_dir )
        for item in google_info['list']:
            if item['mimetype'] != 'application/vnd.google-apps.folder' :
                url ="https://www.googleapis.com/drive/v3/files/{}".format(item['id'])
                res = requests.get(url, headers=headers)
                #print(res.json())
                google_drive_download(headers,[res.json()], headers_user, dataset_dir)
            else :
                destination_path = duplicate_check(dataset_dir, dataset_dir, item['name'])
                destination_path = name_filter(destination_path)
                google_drive_get_list(item['id'], next_page_token, headers, headers_user, destination_path )
        return dataset_dir
    except Exception as e:
        os.system('rm -r {}'.format(destination_path))
        traceback.print_exc()
        return response(status = 0, message = "google drive download failed")
        
def google_drive_get_list(folder_id, next_page_token, headers, headers_user, path ):

    drive_list = []
    files_list = []
    url ="https://www.googleapis.com/drive/v3/files"

    path = name_filter(path)
    if not os.path.exists(path):
        path = make_dir(path,headers_user)
        #change_own(path,headers_user)
        #os.system('chown {}:{} "{}"'.format(headers_user, headers_user, path))
    while True:
        params = {"q":"'{}' in parents".format(folder_id),"pageToken":next_page_token,"pageSize":1000} #,"key":"{}".format(args['api_key'])
        params = urllib.parse.urlencode(params, quote_via=urllib.parse.quote)
        
        res = requests.get(url, headers=headers, params = params)
        if res.status_code != 200:
            return response(status = 0, message = "google drive credentials failed")
        res = res.json()
        next_page_token = res.get('nextPageToken')
        lists =res.get('files')
        drive_list.extend(lists)
        if not next_page_token:
            print('not exist nextPageToken')
            break

    for files in drive_list:
        if files["mimeType"] == 'application/vnd.google-apps.folder' :
            t = threading.Thread(target=google_drive_get_list,args=(files['id'], "", headers, headers_user, os.path.join(path,name_filter(files['name']))))
            t.start()
        else :
            files_list.append(files)
    google_drive_download(headers, files_list, headers_user, path)


# def list_chunk(lst, n):
#     return [lst[i:i+n] for i in range(0, len(lst), n)]

def name_filter(name):
    return name.replace('&','_').replace('(','_').replace(')','_').replace(' ','_').replace('#','_').replace('$','_').replace('%','_').replace('[','').replace(']','')
    

def google_drive_download(headers, items, headers_user, path):
    for item in items:
        if item['name'] == "desktop.ini":
            continue
        url ="https://www.googleapis.com/drive/v3/files/{}?alt=media".format(item['id'])

        res = requests.get(url, headers=headers)
        f_path = os.path.join(path, name_filter(item['name']))
        with open(f_path,'wb') as f:
            f.write(res.content)

    
def get_tree(dataset_id, headers_user):
    result={}
    dataset_dir_info = db.get_dataset_dir(dataset_id)
    path = PATH.JF_DATASET_PATH.format(workspace_name=dataset_dir_info['workspace_name'], access = dataset_dir_info['access'], dataset_name = dataset_dir_info['name'])
    dir_list=subprocess.run(["{} {} -d -fi -N".format(tree_cmd,path)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').stdout.replace(path,'').split('\n')
    dir_list=list(filter(None, dir_list))
    result['tree'] = dir_list
    #dataset_dir_info['permission_level'] = check_dataset_access_level(headers_user, dataset_dir_info)
    return  response(status = 1, result = result)
        


"""
=================================================================================================================================
Datasets Function END
=================================================================================================================================
"""
"""
=================================================================================================================================
Datasets Router START
=================================================================================================================================
"""

@ns.route('/synchronization', methods=['PUT','POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class ws_synchronization(CustomResource):
    @ns.expect(update_info_parser)
    @token_checker
    def put(self):
        """ 
        동기화 thread check
        # Inputs:
            worskpace_id(int)   : workspace_id 값 (Root계정에서 전체동기화 진행시 None)
            dataset_id(int)     : 특정 데이터셋의 동기화버튼 클릭시 dataset_id값 존재
        ---
        # Returns:
            status(int)     : 해당 작업에 대한 스레드가 종료 되었을 때 1 리턴 아닐경우 0 리턴
            message(str)    : API에서 보내는 리턴 메세지
        """
        try:
            headers_user=self.check_user()
            args = update_info_parser.parse_args()
            thread_name=[]
            if args['workspace_id'] is None:
                workspace_ids = db.get_workspace_id_list()
                for ws in workspace_ids:
                    name = "workspace{}".format(ws['id'])
                    thread_name.append(name)

                while thread_name:
                    for th_name in thread_name:
                        if thread_check(th_name):
                            thread_name.remove(th_name)
                if not thread_name:
                    return response(status = 1, message = "sync finish ")
                else:
                    return response(status = 0, message = "check error {}".format(thread_name))

            elif args['dataset_id'] is None:
                name = "workspace{}".format(args['workspace_id'])
            else :
                name = "{}_{}".format(args['workspace_id'],args['dataset_id'])

            while True:
                if thread_check(name):
                    return response(status = 1, message = "sync finish")
                        #return True
                #if sync_finish_check(thread_name):
                    #return response(status = 1, message = "finish {}".format(thread_name))
            
        except:
            traceback.print_exc()
            return response(status = 0, message = "sync thread does not finish")


    @ns.expect(update_info_parser)
    @token_checker
    def post(self):
        """ 
            Dataset 동기화
            ---
            # Returns:
                status(int) : 0(실패), 1(성공)
                message : API에서 보내는 메세지
                    
                example :
                {
                    "message": "ws_synchronization success"
                    "result": null
                    "status": 1
                }
        """        
        try:
            headers_user=self.check_user()
            args = update_info_parser.parse_args()
            if args['workspace_id'] is None:
                workspace_ids = db.get_workspace_id_list()
                for ws in workspace_ids:
                    event = threading.Event()
                    th_name = "workspace{}".format(ws['id'])
                    if thread_check(th_name):
                        with jf_dataset_lock:
                            th = threading.Thread(target=ws_datasets_synchronization, name=th_name, args=(event, ws['id'],))
                            th.start()
                            while True:
                                if not thread_check(th_name):
                                    event.set()
                                    break
                    else:
                        return response(status = 1, message = "already running ws_synchronization")
            else:
                event = threading.Event()
                th_name = "workspace{}".format(args['workspace_id'])
                #th_flag = thread_check(th_name)
                if thread_check(th_name):
                    with jf_dataset_lock:
                        th = threading.Thread(target=ws_datasets_synchronization, name=th_name, args=(event, args['workspace_id'],))
                        th.start()
                        while True:
                            if not thread_check(th_name):
                                event.set()
                                break
                else:
                    return response(status = 1, message = "already running ws_synchronization")
            return response(status = 1, message = "ws_synchronization success")
        except:
            traceback.print_exc()
            return response(status = 0, message = "ws_synchronization fail")
        
@ns.route('/<dataset_id>/tree', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class tree(CustomResource):
    @token_checker
    def get(self,dataset_id):
        """ 
            Tree 구조 조회
            ---
            # Returns:
                status(int) : 0(실패), 1(성공)

                #성공
                result(dict) :
                    tree(list): 데이터셋의 트리구조 및 DIR 갯수 반환 
                    
                example :
                {
                    "status" : 1
                    "result" : ['not_sure', '1 directories']
                }

                 
        """        
        res = get_tree(dataset_id, headers_user=self.check_user())
        return self.send(res)

@ns.route('/decompression_check', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class Datasets_decompression_check(CustomResource):
    @ns.expect(decompression_parser)
    @token_checker
    def get(self):
        """ 
            dataset 압축해제 progress bar
            ---
            # Description:
                arg

            # Returns:
                status(int) : 0(실패), 1(성공)

                #성공
                result(int) :
                    percent(int): 압축해제 진행률 
                    
                example :
                {
                    "status" : 1
                    "result" : 3
                }
        """      
        try:
            args = decompression_parser.parse_args()
            return self.send(decompression_check(args,headers_user=self.check_user()))
        except CustomErrorList as ce:
            return self.send(response(status = 0, result = ce.response()))
        except Exception as e:
            return self.send(response(status = 0, message = 'Undefind Error'))
        

@ns.route('/decompression', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class Datasets_decompression(CustomResource):
    @ns.expect(decompression_parser)
    @token_checker
    def get(self):
        """ 
            dataset 압축해제 요청
            ---
            # Returns:
                status(int) : 0(실패), 1(성공)
                message: API에서 보내는 메세지

                example :
                {
                    "message": "Decompression Success"
                    "result": null
                    "status": 1
                }
        """       
        try:
            args = decompression_parser.parse_args()
            res = decompression(args,headers_user=self.check_user())
            return self.send(res)
        except CustomErrorList as ce:
            return self.send(response(status = 0, result = ce.response()))
        except Exception as e:
            return self.send(response(status = 0, message = 'Undefind Decompress Error'))

@ns.route('/preview', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class Datasets_preview(CustomResource):
    @ns.expect(preview_parser)
    @token_checker
    @dataset_access_check(preview_parser,5)
    def get(self):
        """ 
            데이터 미리보기
            ---
            # Returns:
                status(int) : 0(실패), 1(성공)
                result(dict) : "data"(str) : "text or image" , "type"(str) : "data type"
                
                example :
                {
                    "status": "1"
                    "result" :
                    { 
                        "data": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcG.."
                        "type": "image"
                    }
                    
                }
        """        
        args = preview_parser.parse_args()
        return preview(args,headers_user=self.check_user())


@ns.route('/download', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class Datasets_download(CustomResource):
    @ns.expect(download_parser)
    @token_checker
    @dataset_access_check(download_parser,5)
    def get(self):
        """ 
            데이터 다운로드
            settings.DATASET_DOWNLOAD_ALLOW : FB에서 download 기능 지원 여부
            ---
            # Returns:
                status(int) : 0(실패), 1(성공)
                result(flask.wrappers.Response Object) : send_from_directory Object , headers
                message(str) : API에서 보내는 메세지
                
                example :
                {
                    
                    "status": "1"
                    "message" : "download Success"
                    "result" :
                    { 
                        "self_response" = flask.wrappers.Response Object
                    }
                }
        """
        if not settings.DATASET_DOWNLOAD_ALLOW :
            res = response(status = 0 , message = "Download is not supported.")
        else:
            args = download_parser.parse_args()
            res = download(args,headers_user=self.check_user())

        return self.send(res)

# Datasets CRUD
@ns.route('', methods=['GET', 'POST', 'PUT'])
@ns.route('/<id_list>', methods=['DELETE'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class Datasets(CustomResource):
    @ns.expect(user_workspace_parser)
    @token_checker
    @workspace_access_check(user_workspace_parser)
    def get(self):
        """
        Dataset 목록 조회
        ---
        # 설명
            workspace_id가 없으면 모든 워크스페이스의 데이터셋 목록 조회
            page or size가 없는 경우 조건에 맞는 전체 목록 조회
        """
        args = user_workspace_parser.parse_args()
        workspace_id = args['workspace_id']
        page = args['page']
        size = args['size']
        search_value = args['search_value']
        search_key = args['search_key']


        if page is not None:
            page = int(page)
        if size is not None:
            size = int(size)

        res = get_datasets(search_key=search_key, search_value=search_value,
                            workspace_id=workspace_id, page=page, size=size, headers_user=self.check_user())
        db.request_logging(self.check_user(), 'datasets', 'get', str(args), res['status'])
        return self.send(res)
    @ns.expect(create_parser)
    @token_checker
    @workspace_access_check(create_parser)
    def post(self):
        """
        Dataset 생성
        """
        try:
            args = create_parser.parse_args()
            res = create_dataset(args, self.check_user())
            return self.send(res)
        except CustomErrorList as ce:
            return self.send(response(status = 0, result = ce.response()))
        except Exception as e:
            return self.send(response(status = 0, result = 'undefined error'))
    @token_checker
    @ns.param('id_list', 'id list')
    @dataset_access_check()
    def delete(self, id_list):
        """
        Dataset 삭제
        """
        print("Datasets/delete")
        id_list = id_list#.split(',')
        res = remove_dataset(id_list = id_list, headers_user = self.check_user(), headers_user_id=self.check_user_id())
        # db.request_logging(self.check_user(), 'datasets/'+str(id_list), 'delete', None, res['status'])
        return self.send(res)
    @ns.expect(update_info_parser)
    @token_checker
    @dataset_access_check(update_info_parser)
    def put(self):
        """ 
            Dataset 정보 변경
            ---
            # Arguments:
                dataset_name : 변경하거나 변경되지 않은 데이터셋 이름
                workspace_id : 변경하거나 변경되지 않은 workspace id 값
                access : 변경하거나 변경되지 않은 access 값
                description : 변경하거나 변경되지 않은 데이터셋에 관한 설명
                dataset_id : 변경되지 않는 데이터셋 ID값(Unique key)

            # Returns:
                status(int) : 0(실패), 1(성공)
                message : API에서 보내는 메세지
                    
                example :
                {
                    "message": "OK"
                    "result": null
                    "status": 1
                }
        """        
        print("Datasets/put")
        args = update_info_parser.parse_args()
        res = dataset_info_update(args, self.check_user())
        # db.request_logging(self.check_user(), 'datasets', 'put', str(args), res['status'])
        return self.send(res)

@ns.route('/new_model_template')
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class Datasets_new_model_template(CustomResource):
    @token_checker
    @ns.expect()
    def get(self):
        """ 
            built in model template 조회
            ---
            # Returns:
                res(dict) : build in model infomation
            ---
        """
        from built_in_model import built_in_model_list_for_dataset
        res = built_in_model_list_for_dataset()
        return response(status = 1, message = "get model template success", result = res )

## 어디서 사용되는지 모르겠음.
# Dataset R
@ns.route('/<dataset_id>')
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class Dataset(CustomResource):
    @token_checker
    def get(self, dataset_id):
        """
        Dataset 단일 조회
        """
        print("Dataset/get")
        response = get_dataset_dir(dataset_id, user_id=self.check_user_id())
        return self.send(response)

# Dataset Files R
@ns.route('/<dataset_id>/files', methods=['GET', 'POST', 'PUT'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DatasetFiles(CustomResource):
    @ns.expect(dataset_files_parser)
    @token_checker
    @dataset_access_check(dataset_files_parser,5)
    def get(self, dataset_id):
        """
        Dataset 파일 목록 조회
        """
        print("DatasetFiles/get")
        #
        args = dataset_files_parser.parse_args()
        #dataset_id = args['dataset_id']
        search_path = args['search_path']
        search_page = int(args['search_page'])
        search_size = int(args['search_size'])
        search_type = args['search_type']
        search_key = args['search_key']
        search_value = args['search_value']
        if search_page < 1 :
            search_page = 1
        if search_size < 1 :
            search_size = 10
        # if len(fnmatch.filter(os.listdir('/jf-data/dataset_download/'),self.check_user()+'*')) > 0 :
        #     os.system('rm -r /jf-data/dataset_download/{}*'.format(self.check_user()))
        res = get_dataset_files(dataset_id=dataset_id, search_path=search_path, search_page=search_page, search_size=search_size,
                                search_type=search_type, search_key=search_key, search_value=search_value, headers_user=self.check_user())
        db.request_logging(self.check_user(), 'datasets/'+str(dataset_id)+'/files', 'get', None, res['status'])
        return self.send(res)

    @ns.expect(update_parser)
    @token_checker
    @dataset_access_check(update_parser,4)
    def put(self,dataset_id):
        """ 
            Dataset 파일or폴더 추가 및 수정(이름변경, 삭제) 
            ---
            # Returns:
                status(int) : 0(실패), 1(성공)
                message : API에서 보내는 메세지

                example :
                {
                    "status" : 1
                    "result" : 'Update success'
                }

        """        
        #print("DatasetFiles/put")
        args = update_parser.parse_args()
        res = update_file_or_folder(args, self.check_user())
        # db.request_logging(self.check_user(), 'datasets', 'put', str(args), res['status'])
        return self.send(res)

    @ns.expect(update_parser)
    @token_checker
    @dataset_access_check(update_parser,4)
    def post(self,dataset_id):
        """      
        Dataset 폴더 생성
        """
        args = update_parser.parse_args()
        res = make_empty_dir(args, self.check_user())
        return self.send(res)
# Dataset Files Info R
@ns.route('/<dataset_id>/files/info', methods=['GET','POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DatasetInfo(CustomResource):
    @ns.expect()
    @token_checker
    @dataset_access_check(None,5)
    def get(self, dataset_id):
        """
            데이터셋 상세정보 조회
            ---
            # inputs
                dataset_id - 데이터셋 상세정보를 DB에서 얻어오기 위한 key값
            ---
            # returns
                DB에 저장된 해당 데이터셋의 상세정보
        """
        print("DatasetInfo/get")
        res = get_dataset_info(dataset_id=dataset_id, user_id=self.check_user_id())
        db.request_logging(self.check_user(), 'datasets/'+str(dataset_id)+'/files/info', 'get', None, res['status'])
        return self.send(res)

    def post(self, dataset_id):
        """
            데이터셋 상세정보 동기화
            ---
            # inputs
                dataset_id - 데이터셋 상세정보를 DB에서 얻어오기 위한 key값
            ---
        """
        print("DatasetInfo/get")
        res = dataset_info_sync(dataset_id=dataset_id)
        #db.request_logging(self.check_user(), 'datasets/'+str(dataset_id)+'/files/info_sync', 'post', None, res['status'])
        return self.send(res)
        
# Dataset Files Info R
@ns.route('/<dataset_id>/marker_files', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class DatasetMarkerFiles(CustomResource):
    @ns.expect(dataset_files_info_parser)
    @token_checker
    def get(self, dataset_id):
        """
        Dataset Marker 용 파일 조회
        """
        print("DatasetMarkerFiles/get")
        args = marker_get_datasets.parse_args()
        search_path = args['search_path']
        res = get_dataset_marker_files(dataset_id=dataset_id, search_path=search_path, headers_user=self.check_user())
        db.request_logging(self.check_user(), 'datasets/'+str(dataset_id)+'/marker_files', 'get', None, res['status'])
        return self.send(res)

@ns.route('/google_drive', methods=['POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class google_drive(CustomResource):
    @ns.expect(google_drive_parser)
    @token_checker
    def post(self):
        """
        Google drive upload
        """
        args = google_drive_parser.parse_args()
        result = google_drive_upload(args, headers_user=self.check_user())
        
        if result is not None:
            res = response(status=1, message='Google Drive upload complete')

        return self.send(res)


@ns.route('/github_clone', methods=['POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class github_clone(CustomResource):
    @ns.expect(github_clone_parser)
    @token_checker
    def post(self):
        """
        Git Clone
        """
        args = github_clone_parser.parse_args()
        res = git_clone(args,headers_user=self.check_user())
        return self.send(res)

@ns.route('/ws_upload', methods=['POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class ws_upload(CustomResource):
    @ns.expect(update_parser)
    @token_checker
    def post(self):
        """
        ws_upload
        """
        args = update_parser.parse_args()
        res = upload_ws_dataset(args,headers_user=self.check_user())
        return self.send(res)

@ns.route('/copy_or_carry', methods=['POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class data_copy_or_carry(CustomResource):
    @ns.expect(copy_or_carry_parser)
    @token_checker
    def post(self):
        """
        copy_or_carry
        """
        args = copy_or_carry_parser.parse_args()
        res = copy_or_carry(args,headers_user=self.check_user())
        return self.send(res)

# @ns.route('/ws-drone', methods=['GET'])
# @ns.response(200, 'Success')
# @ns.response(400, 'Validation Error')
# class ws_drone(CustomResource):
#     @ns.expect(user_workspace_parser)
#     @token_checker
#     #@dataset_access_check(user_workspace_parser,5)
#     def get(self):
#         """
#         #drone 목록
#         """
#         args = user_workspace_parser.parse_args()
#         #return preview(args,headers_user=self.check_user())


# @ns.route('/built_in_model_list', methods=['GET'])
# @ns.response(200, 'Success')
# @ns.response(400, 'Validation Error')
# class built_in_model_list(CustomResource):
#     @ns.expect(create_parser)
#     @token_checker
#     def get(self):
#         """
#         built_in_model_test
#         """
#         args = create_parser.parse_args()
#         data_training_form = db.get_built_in_model_data_training_form(args['built_in_model_id'])
#         #res = copy_or_carry(args,headers_user=self.check_user())
#         return self.send(response(status=1, result= data_training_form))

@ns.route('/<dataset_id>/built_in_model_compatibility', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class built_in_model_compatibility(CustomResource):
    @token_checker
    def get(self,dataset_id):
        from built_in_model import built_in_model_list_compatibility_check
        res = built_in_model_list_compatibility_check(dataset_id)
        return self.send(response(status=1, result= res))


@ns.route('/test', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class test(CustomResource):
    @ns.expect(dvc_parser)
    @token_checker
    def get(self):
        """
        Workspace limit TEST
        """
        import utils.workspace_limit as ws_limit
        from utils.common import STORAGE_USAGE_SHARE_DICT
        ws_limit.total_storage_usage_check([{'id':1, 'workspace_name':'test-ws'},{'id':5, 'workspace_name':'test-f'}])
        # db.insert_workspaces_limit(1,0,0)
        # db.insert_workspaces_limit(5,0,0)
        ws_limit.get_current_stroage_usage('test-ws')
        print(list(STORAGE_USAGE_SHARE_DICT))
        print(STORAGE_USAGE_SHARE_DICT['test-ws'])
        ws_limit.get_current_stroage_usage('test-ws')
        print(STORAGE_USAGE_SHARE_DICT['test-ws'])
        ws_limit.get_current_stroage_usage('test-f')
        print(STORAGE_USAGE_SHARE_DICT['test-f'])
        print(list(STORAGE_USAGE_SHARE_DICT))
        STORAGE_USAGE_SHARE_DICT.clear()
        print(list(STORAGE_USAGE_SHARE_DICT))
        # import dvc
        # #try:
        # args = dvc_parser.parse_args()
        # # dvc.git_init(args['path'])
        # # dvc.dvc_init(args['path'])
        # # dvc.git_make_checkpoint(args['path'], args['name'], args['commit_msg'])
        # # dvc.dvc_make_checkpoint(args['path'], args['name'])
        # res = dvc.version_change(args['path'], args['hash'])

        # return self.send(response(status=1, result=res))

            #return self.send(response(status=0, result= Error_handler(self,e).get_code()))


def test2():
    try:
        
        print('test2')
        raise Exception
    except Exception as e:
        print(sys._getframe(2).f_code.co_name)
        print(sys._getframe(3).f_code.co_name)
        print(sys._getframe(5).f_code.co_name)
        a = Error_handler(sys._getframe().f_code.co_name,e)
        a.get_code()
        print(a)
        return a.response()
"""
=================================================================================================================================
Datasets Router END
=================================================================================================================================
"""
