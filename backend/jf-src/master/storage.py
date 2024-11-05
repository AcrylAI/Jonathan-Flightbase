#-*- coding: utf-8 -*-
from utils.resource import CustomResource, token_checker
from flask_restplus import reqparse, Resource
from werkzeug.datastructures import FileStorage
from werkzeug.wrappers import Request, Response
import traceback
import os,fnmatch
from flask import Flask, request
from restplus import api
import utils.db as db
from utils import common
from utils.resource import response
import settings

from datetime import date, datetime
from utils.exceptions import *

import threading
#공유형 워크스페이스 사용량 공유 메모리
from utils.common import STORAGE_USAGE_SHARE_DICT, AllPathInfo
from utils.runnable_object_controller import RunnableObjectController
from PATH import *

os.system('pip3 install psutil')
import psutil
#from psutil._common import bytes2human
import subprocess
"""
=================================================================================================================================
storage arguments settings START
=================================================================================================================================
"""
parser = reqparse.RequestParser()
ns = api.namespace('storage', description='스토리지 관련 API')

update_parser = api.parser()
update_parser.add_argument('name', type=str, location='json', required=False, help='스토리지 이름')
update_parser.add_argument('share', type=int, location='json', required=False, help='스토리지 용량')
update_parser.add_argument('lock', type=int, location='json', required=False, help='스토리지 활성화')
update_parser.add_argument('description', type=str, location='json', required=False, help='설명')


"""
=================================================================================================================================
storage arguments settings END
=================================================================================================================================
"""

WORKSPACE_NAME="workspace_name"
WORKSPACE_SIZE="workspace_size"
WORKSPACE_USED="workspace_used" 
WORKSPACE_AVAIL="workspace_avail"
WORKSPACE_PCENT="workspace_pcent"
ALLOCATION_PCENT="allocation_pcent"
RECENT_SYNC_TIME="recent_sync_time"

MAIN_STORAGE_ID = 1
MAIN_STORAGE = "MAIN_STORAGE"
STORAGE_CONTROLLER = RunnableObjectController()
"""
=================================================================================================================================
storage Fuction START
=================================================================================================================================
"""


#TODO 물리적인 이름과 논리적인 이름 비교
def name_overlap_check(id, name):
    try:
        storage_list = db.get_storage_list()
        for storage in storage_list :
            if name == storage['logical_name'] or name == storage['physical_name'] :
                if storage['id'] == int(id):
                    return name
                name = name_overlap_check(id, name+datetime.now().strftime("%H_%M_%S"))
        return name
    except:
        traceback.print_exc()
        return None

def update_storage(id, logical_name=None, share=None, create_lock=None, description=None):
    try:

        if logical_name is not None:
            logical_name = name_overlap_check(id,logical_name)
            
        res = db.update_storage(id, logical_name=logical_name, share=share, create_lock=create_lock, description=description)
        if res :
            return True
        return Exception
    except:
        traceback.print_exc()
        return False

# dict에 담긴 Storage 정보를 이용하여 해당 스토리지에 있는 워크스페이스 목록을 STORAGE_USAGE_SHARE_DICT에 넣거나 리스트로 리턴해주는 함수
def workspace_usage_check(storage):
    image_control_list = db.get_storage_image_control_list(storage_id = storage['id']) #스토리지 ID가 일치하는 workspace_image의 리스트
    
    if storage['share'] == 1:

        for image_control in image_control_list:
            workspace_info = db.get_workspace(workspace_id=image_control['workspace_id'])
            #없을 경우 초기화
            if STORAGE_USAGE_SHARE_DICT.get(workspace_info['id']) is None:
                STORAGE_USAGE_SHARE_DICT[workspace_info['id']]= dict()

            #TODO 내일 used 변경할 방법 생각하고 함수 분리하기!!!
            #workspace 각각 스레드로 실행
            try:
                th = STORAGE_CONTROLLER.run_with_thread_create(
                    name ="storage_"+workspace_info['workspace_name'],
                    target=get_share_workspace_usage,
                    args=(JF_WORKSPACE_PATH.format(workspace_name=workspace_info['workspace_name']),
                    workspace_info['id'],
                    workspace_info['workspace_name'],
                    storage['usage']['avail'],
                    storage['usage']['pcent']))
            except:
                pass

    #할당형 워크스페이스
    #할당형 워크스페이스의 경우 IMAGE FILE을 사용하기 때문에 측정이 빠름
    else:
        for image_control in image_control_list:
            workspace_info = db.get_workspace(workspace_id=image_control['workspace_id'])
            worksapce_image_info=AllPathInfo(JF_WORKSPACE_PATH.format(workspace_name=workspace_info['workspace_name'])).get_device_info()
            allocation_pcent = int((int(worksapce_image_info['size'])/storage['size'])*100)
            STORAGE_USAGE_SHARE_DICT[workspace_info['id']] = {
                    WORKSPACE_NAME : workspace_info['workspace_name'],
                    WORKSPACE_SIZE : worksapce_image_info['size'],
                    WORKSPACE_USED : worksapce_image_info['used'],
                    WORKSPACE_AVAIL : worksapce_image_info['avail'],
                    WORKSPACE_PCENT : worksapce_image_info['pcent'],
                    ALLOCATION_PCENT : "{}%".format(1 if allocation_pcent < 1 else allocation_pcent)
                }
    return storage
    
#storage의 사용량을 추가
def get_storage_info(storage_info):
    try:
        if storage_info['physical_name'] == '/jfbcore':
            storage_path = storage_info['physical_name']
        else : #MountPoint로 디스크 사용량 검색
            storage_path = JF_STORAGE_MOUNTPOINT_PATH.format(device_name = storage_info['physical_name'])
        return AllPathInfo(storage_path).get_device_info()
    except:
        traceback.print_exc()
        return response(status = 0, result = None)

#단일 스토리지 수정모달의 정보용
# def get_storage(storage_id):
#     try:
#         storage_info = db.get_storage(id = storage_id)       
#         return storage_info
#     except:
#         traceback.print_exc()
#         return response(status = 0, result = None)


#생각#
# 워크스페이스 생성모달 및 수정모달 전용 스토리지 조회
def get_storage_list():
    try:
        storage_list = db.get_storage_list()
        for storage in storage_list :
            storage['usage'] = get_storage_info(storage)
            if storage['share'] == 0 :
                storage['usage']['allocate_used'] = db.get_storage_allocation_size(storage_id = storage['id'])['allocate_size']
                if storage['usage']['allocate_used'] is None :
                    storage['usage']['allocate_pcent'] = "0%"
                    storage['usage']['allocate_used'] = 0
                else : 
                    allocation_pcent = (storage['usage']['allocate_used']/storage['size'])*100
                    storage['usage']['allocate_pcent'] = "{}%".format(1 if allocation_pcent < 1 else allocation_pcent)

        return storage_list
    except:
        traceback.print_exc()
        return response(status = 0, result = None)

#전체 스토리지 조회 - 관리자 대시보드에서 필요
def get_storage_and_workspace_usage_list():
    try:
        
        total_size = 0
        total_used = 0
        storage_list = get_storage_list()
        for storage in storage_list :
            total_size += storage['size']
            total_used += storage['usage']['used']
            try:
                #스토리지별 워크스페이스 사용량 체크
                th = STORAGE_CONTROLLER.run_with_thread_create(
                    name ="storage_"+str(storage['id']),
                    target=workspace_usage_check,
                    args=(storage,))
                
            except:
                traceback.print_exc()
                pass

        #각각의 thread를 돌리고 나서 추가하도록 수정
        for storage in storage_list :
            storage['workspaces'] = []
            workspace_list = db.get_storage_image_control_list(storage_id = storage['id'])
            for workspace in workspace_list :
                try:
                    workspace_info = STORAGE_USAGE_SHARE_DICT.get(workspace['workspace_id'])
                    storage['workspaces'].append(workspace_info)
                except:
                    traceback.print_exc()
                    pass

        #반복문 종료 후 총 용량, 사용량 및 사용률 표시     
        total = { 
                "total_size" : total_size,
                "total_used" : total_used,
                "total_pcent" : "{}%".format(int((total_used/total_size)*100))
            }
        return {
            "list" : storage_list,
            "total" : total
        }
    except:
        traceback.print_exc()
        return response(status = 0, result = None)

def get_share_workspace_usage(path, workspace_id, workspace_name, avail, pcent):
    workspace_usage = AllPathInfo(path = path).get_disk_usage()
    STORAGE_USAGE_SHARE_DICT[workspace_id]={
        WORKSPACE_NAME : workspace_name,
        WORKSPACE_USED : workspace_usage,
        WORKSPACE_AVAIL : avail,
        WORKSPACE_PCENT : pcent,
        RECENT_SYNC_TIME : datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }


# def disk_mount_check():
#     try:
#         cmd = "sed -n '/#disk/p' /etc/fstab"
#         stdout=subprocess.run(["{}".format(cmd)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').stdout.split('\n')
#         stdout=list(filter(None, stdout))
#         for disk in stdout :
#             mountpoint = disk.split(' ')[1]
#             if not os.path.exists(mountpoint):
#                 os.makedirs(mountpoint, exist_ok=True)
#     except:
#         traceback.print_exc()
#         return response(status = 0, result = None)
def fstab_check():
    try:
        from datasets import copy_ws_data
        if not os.path.exists(JF_STORAGE_MOUNT_FSTAB_CONTAINER_PATH):
            copy_ws_data("/jfbcore/installer/fstab_jfb", JF_STORAGE_MOUNT_FSTAB_CONTAINER_PATH)
        if not os.path.exists(JF_STORAGE_WORKSPACE_FSTAB_CONTAINER_PATH):
            copy_ws_data("/jfbcore/installer/fstab_jfb_ws", JF_STORAGE_WORKSPACE_FSTAB_CONTAINER_PATH)
        return True
    except:
        traceback.print_exc()
        return False

def storage_sync():
    try:
        from storage_image_control import sync_workspace_limit
        if not fstab_check:
            return response(status=0, message="fstab error")
        
        common.launch_on_host("mount-sync --fstab {}".format(JF_STORAGE_MOUNT_FSTAB_HOST_PATH))
        os.system("mount -a --fstab {}".format(JF_STORAGE_MOUNT_FSTAB_CONTAINER_PATH))
        storage_list=[]
        #psutil 패키지는 프로세스 리소스 제한 및 실행 중인 프로세스 관리, 시스템 모니터링에 유용한 package
        # disk_partitions의 all 매개변수는 false는 물리적장치 만 출력하겠다는 의미
        # all 매개변수 True로 한 이유는 nfs의 검색을 위함
        for part  in psutil.disk_partitions(all=True):
            if '/jfbcore' == part.mountpoint or '/jf-storage/' in part.mountpoint:
                usage = psutil.disk_usage(part.mountpoint)
                storage_list.append(
                    {
                        'device' : part.mountpoint, #.replace('/jf-storage/','')
                        'total' : usage.total,
                        'used' : usage.used,
                        'free' : usage.free,
                        'percent' : int(usage.percent),
                        'fstype' : part.fstype
                    }
                )
        
        for storage in storage_list :
            name = storage['device'].replace('/jf-storage/','')
            if db.get_storage(physical_name=name) is None :
                storage_id = None
                share = 0
                physical_name = name
                logical_name = MAIN_STORAGE if name == '/jfbcore' else name
                if logical_name == MAIN_STORAGE :
                    storage_id = MAIN_STORAGE_ID
                    share = 1 
                db.insert_storage(id=storage_id, physical_name=physical_name, logical_name=logical_name, size=storage['total'], fstype=storage['fstype'], share=share, create_lock=0)
        sync_workspace_limit()
        return True
    except:
        traceback.print_exc()
        return response(status = 0, result = None)

def workspace_info_sync(workspace_id):
    try:
        # 사용량, 워크스페이스, manager dict 전부 실행됨
        
        # workspace_contol_info = db.get_storage_image_control(workspace_id = workspace_id)
        workspace_info = db.get_workspace(workspace_id=workspace_id)
        if workspace_info is None:
            raise NotExistImageLimitError
        workspace_limit_info = db.get_storage_image_control(workspace_id=workspace_id)
        storage_info = db.get_storage(id=workspace_limit_info['storage_id'])

        #Storage의 사용량을 측정할 필요가 없음
        #할당형이던 공유형이던 해당 워크스페이스에 loop device 은 storage의 사용량을 리턴해주면 해당 워크스페이의 사용량이 출력됨
        workspace_dir = JF_WORKSPACE_PATH.format(workspace_name=workspace_info['workspace_name'])    
        workspace_usage_info = AllPathInfo(path = workspace_dir).get_device_info()
        if storage_info['share'] == 0 :
            #할당형 워크스페이스
            allocation_pcent = int(workspace_usage_info['size']/storage_info['size']*100)
            STORAGE_USAGE_SHARE_DICT[workspace_id] = {
                    WORKSPACE_NAME : workspace_info['workspace_name'],
                    WORKSPACE_SIZE : workspace_usage_info['size'],
                    WORKSPACE_USED : workspace_usage_info['used'],
                    WORKSPACE_AVAIL : workspace_usage_info['avail'],
                    WORKSPACE_PCENT : workspace_usage_info['pcent'],
                    ALLOCATION_PCENT : "{}%".format(1 if allocation_pcent < 1 else allocation_pcent)
                }
        else :
            # 공유형 워크스페이스
            # used 는 스토리지의 사용량
            # workspace의 사용량은 'workspace' 의 value값에 포함되어있음 
            storage_info['used'] = workspace_usage_info['used']
            get_share_workspace_usage(workspace_dir, workspace_id, workspace_info['workspace_name'], workspace_usage_info['avail'], workspace_usage_info['pcent'])
        storage_info['workspace'] = STORAGE_USAGE_SHARE_DICT[workspace_id]
        return storage_info
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception :
        traceback.print_exc()
        return Exception

#동기화 진행여부 확인 Multiproccessing manager dict가 비어있을때까지 pending
def sync_check():
    while True:
        if STORAGE_CONTROLLER.get_thread_name_list() == []:
            break
    return response(status = 1, message = "sync finish")

"""
=================================================================================================================================
storage Fuction END
=================================================================================================================================
"""

"""
=================================================================================================================================
storage Router START
=================================================================================================================================
"""

@ns.route('', methods=['GET'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class storage(CustomResource):
    @token_checker
    def get(self):
        """ 
            storage list 정보 조회(워크스페이스 사용량 포함)
            ---
        """        
        res = get_storage_and_workspace_usage_list()
        return self.send(response(status = 1, result = res))

   

@ns.route('/<id>', methods=['PUT'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class storage(CustomResource):

    @ns.expect(update_parser)
    @token_checker
    def put(self,id):
        """ 
            storage 수정
            ---
        """        
        args = update_parser.parse_args()
        res = update_storage(id=id,
                             share=args['share'],
                             create_lock=args['lock'],
                             logical_name=args['name'],
                             description=args['description'],
                            )
        return self.send(response(status = 1, result = res))


@ns.route('/sync', methods=['GET','POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class storageSync(CustomResource):
    @token_checker
    def post(self):
        """ 
            storage 동기화
            
        """        
        
        res = storage_sync()
        return self.send(response(status = 1, result = res))

    @token_checker
    def get(self):
        """ 
            storage 전체 동기화 체크
            
        """        
        
        res = sync_check()
        return self.send(res)

@ns.route('/<id>/workspace', methods=['PUT'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class workspaceSync(CustomResource):
    # @ns.expect(sync_parser)
    @token_checker
    def put(self,id):
        """ 
            workspace 사용량 동기화 동기화
            
        """        
        # args = sync_parser.parse_args()
        try:
            res = workspace_info_sync(workspace_id=id)
            return self.send(response(status =1 , result = res))
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception :
            traceback.print_exc()
            return self.send(response(status =0 , message = "Undefined Error"))
            
        
"""
=================================================================================================================================
storage Router END
=================================================================================================================================
"""
