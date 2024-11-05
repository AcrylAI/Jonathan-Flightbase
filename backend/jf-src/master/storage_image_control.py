# from utils.common import AllPathInfo
from glob import glob
from utils.resource import CustomResource, token_checker
from flask_restplus import reqparse, Resource
from werkzeug.wrappers import Request, Response
from flask import Flask, request, make_response
from restplus import api

import utils.db as db
import utils.common as common
from utils.resource import response
from utils.exceptions import *
from utils.common import STORAGE_USAGE_SHARE_DICT
# from utils.exceptions import *

from PATH import *
import traceback
import settings
import os
import time
import datetime
import subprocess
import shutil
import io
import datetime 
import base64
#storage image control

"""
=================================================================================================================================
datasets arguments settings START
=================================================================================================================================
"""
# Router Function
parser = reqparse.RequestParser()
ns = api.namespace('storage-image-control', description='워크스페이스 제한 관련 API')

create_parser = api.parser()
create_parser.add_argument('workspace_name',type = str, location = 'json', required=True,help='ws_name' )
create_parser.add_argument('capacity',type = str, location = 'json', required=True,help='capacity' )
create_parser.add_argument('device',type = str, location = 'json', required=True,help='device path' )

update_parser = api.parser()
update_parser.add_argument('workspace_id',type = str, location = 'json', required=True,help='ws_name' )
update_parser.add_argument('capacity',type = str, location = 'json', required=True,help='capacity' )

remove_parser = api.parser()
remove_parser.add_argument('workspace_id',type = str, location = 'json', required=True,help='ws_name' )

"""
=================================================================================================================================
datasets arguments settings END
=================================================================================================================================
"""


from storage import MAIN_STORAGE_ID,MAIN_STORAGE
"""
==============================================================
datasets function START
==============================================================
"""



# def stdout_to_json(disk_usage_list):
#     return_dict = []
#     total = 0
#     for list_ in disk_usage_list:
#         size,item = list_.split('\t/jfbcore/jf-data/workspaces/')
#         total += int(size)
#         return_dict.append(
#             {
#                 'item' : item.split('/')[-2],
#                 'size' : size
#             }
            
#         )

#     return return_dict, total


# def total_storage_usage_check(ws_list):
#     #todo multi thread or multi process
#     print(type(ws_list))
#     path = '/jfbcore/jf-data/storage_usage'
#     if not os.path.exists(path):
#         os.system('mkdir -p {}'.format(path))
#     #workspaces = db.get_workspace_list()
#     workspaces = ws_list
#     for ws in workspaces :
#         result = storage_usage_check(ws['workspace_name'])
#         with open('/jf-data/storage_usage/{}.log'.format(ws['id']),'a+') as fp:
#             fp.write(str(result)+"\n")

#     # STORAGE_USAGE_SHARE_DICT.clear()
        

# def storage_usage_check(ws):
#     path = '/jfbcore/jf-data/storage_usage'
    
#     workspace_disk_usage_history = {}
#     ws_total=0
#     ws_disk_usage = {}    

#     #datasets
#     dataset_cmd = 'du -k -s /jfbcore/jf-data/workspaces/{}/datasets/*/*/'.format(ws)
#     stdout=subprocess.run(["{}".format(dataset_cmd)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').stdout
#     datasets,datasets_size=stdout_to_json(stdout.splitlines())
#     ws_total += datasets_size
#     ws_disk_usage['datasets_list'] = datasets
    

#     # deployment
#     deployment_cmd = 'du -k -s /jfbcore/jf-data/workspaces/{}/deployments/*/'.format(ws)
#     stdout=subprocess.run(["{}".format(deployment_cmd)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').stdout
#     deployment,deployment_size=stdout_to_json(stdout.splitlines())
#     ws_total += deployment_size
#     ws_disk_usage['deployment_list'] = deployment
    

#     #trainings
#     trainings_cmd = 'du -k -s /jfbcore/jf-data/workspaces/{}/trainings/*/'.format(ws)
#     stdout=subprocess.run(["{}".format(trainings_cmd)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').stdout
#     trainings,trainings_size=stdout_to_json(stdout.splitlines())
#     ws_total += trainings_size
#     ws_disk_usage['trainings_list'] = trainings
#     ws_disk_usage['datasets_size'] = datasets_size
#     ws_disk_usage['deployment_size'] = deployment_size
#     ws_disk_usage['trainings_size'] = trainings_size
#     ws_disk_usage['ws_total'] = ws_total
#     ws_disk_usage['datetime'] = datetime.datetime.now()
#     workspace_disk_usage_history[ws]=ws_disk_usage

    
#     return workspace_disk_usage_history
#     # if not os.path.exists(os.path.join(path,ws)):
    

# def get_current_stroage_usage(ws_name):
#     #todo 실시간 메모리와 history 비교하는 로직필요
#     # if ws_name in STORAGE_USAGE_SHARE_DICT:
#     #     result = STORAGE_USAGE_SHARE_DICT.get(ws_name)
#     # else :
#     result = storage_usage_check(ws_name)
#     # STORAGE_USAGE_SHARE_DICT[ws_name] = result
#     return result

    
# def get_storage_usage_history(ws_id):
#     with open('/jfbcore/jf-data/stoforage_usage/{}.log'.format(ws_id),'r') as fp:
#             last_history = fp.readlines()[-1]

#     return last_history

# def workspace_storage_usage_check():
#     workspaces = db.get_storage_image_control()
#     total_history = []
#     for ws in workspaces:
#         history = get_storage_usage_history(ws['id'])
#         total_history.extend(history)

#     return total_history
#         #compare between db and history
#         #update db status or count

#단일 스토리지와 워크스페이스 사용량 조회 - 사용자 대시보드에서 필요
# def get_storage_with_workspace_usage(workspace_id):
#     try:
#         storage_info = db.get_storage(db.get_storage_image_control(workspace_id = workspace_id)['storage_id'])
#         workspace_info = db.get_workspace(workspace_id = workspace_id)
#         storage_info['usage'] = common.AllPathInfo(path = JF_WORKSPACE_PATH.format(workspace_name = workspace_info["workspace_name"]))
#         # storage_info = workspace_usage_check(storage_info)
#         return storage_info
#     except:
#         traceback.print_exc()
#         return response(status = 0, result = None)

#disk 및 loop device의 사용량 및 정보를 출력
# def get_disk_info(path):
#     cmd = "df -T --block-size=1 {}".format(path)
#     disk_info = subprocess.run([cmd],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').stdout.split('\n')[1].split(' ')
#     disk_info = list(filter(None, disk_info))
#     res = {
#         "device" : disk_info[0],
#         "fstype" : disk_info[1],
#         "size" : disk_info[2],
#         "used" : disk_info[3],
#         "avail" : disk_info[4],
#         "pcent" : disk_info[5]
#     }
#     return res


def create_image_file(workspace_name, device):
    try:
        shell_script = JF_STORAGE_SHELL_SCRIPT_PATH.format(shell_script_name="workspace_image_create.sh")
        result = subprocess.run(['{} -n {} -d {}'.format(shell_script, workspace_name, device)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').returncode
        return result
    except:
        storage_response_dict[result](workspace_name=workspace_name, device=device)
        raise CreateWorkspaceError

def mount_image(workspace_name, device):
    try:
        shell_script = JF_STORAGE_SHELL_SCRIPT_PATH.format(shell_script_name="workspace_image_mount.sh")
        result = subprocess.run(['{} -n {} -d {}'.format(shell_script, workspace_name, device)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').returncode
        return result
    except:
        storage_response_dict[result](workspace_name=workspace_name)
        raise MountImageError

def umount_image(workspace_name):
    try:
        shell_script = JF_STORAGE_SHELL_SCRIPT_PATH.format(shell_script_name="workspace_image_umount.sh")
        result = subprocess.run(['{} -n {}'.format(shell_script, workspace_name)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').returncode
        return result
        #os.system('{} -n {}'.format(shell_script, workspace_name))
    except:
        raise Exception

def resize_image_file (workspace_name, capacity, device, loop_device):
    try:
        shell_script = JF_STORAGE_SHELL_SCRIPT_PATH.format(shell_script_name="workspace_resize.sh")
        result = subprocess.run(['{} -n {} -c {} -d {} -l {}'.format(shell_script, workspace_name, capacity, device, loop_device)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').returncode
        return result
    except:
        return storage_response_dict[result]
        raise Exception

def remove_image_file(workspace_name, device):
    try:
        image_path = JF_STORAGE_IMAGE_PATH.format(device_name=device, workspace_name=workspace_name)
        if os.path.exists(image_path):
            os.remove(image_path)
    except:
        raise Exception

def remove_mountpoint(workspace_name):
    # os.rmdir는 비어있는 directory를 삭제하는 os 함수
    # 해당 함수를 사용하는 이유는 umount하면 해당 마운트 포인트는 비어있어야 정상
    # 오류가 생긴다면 umount에 실패한것으로 생각하여 예외처리
    # shutil의 rmtree를 사용하면 파일이 있는 directory도 삭제가능
    mount_point = JF_WORKSPACE_PATH.format(workspace_name=workspace_name)
    if os.path.exists(mount_point):
        common.rm_rf(mount_point)


def fstab_extract(workspace_name):
    try:
        shell_script = JF_STORAGE_SHELL_SCRIPT_PATH.format(shell_script_name="workspace_fstab_extract.sh")
        result = subprocess.run(['{} -n {}'.format(shell_script, workspace_name)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').returncode
        return result
    except:
        return storage_response_dict[result]
        # raise Exception

storage_response_dict = {
    131 : remove_image_file,
    132 : remove_image_file,
    133 : fstab_extract,
    134 : "Fstab extract error",
    135 : umount_image,
    136 : "umount error",
    137 : "resize error",
    138 : "loop device init error",
    149 : "loop device resize error"
}

#TODO db에 기록시 byte로 저장 1GB -> 2^30 -> n(2 ** 30) GB
def create_workspace_image(workspace_name, device, capacity ):
    try:
        from storage import fstab_check
        fstab_refresh()
        # 이미지 중복 확인
        if os.path.exists(JF_STORAGE_IMAGE_PATH.format(device_name = device, workspace_name = workspace_name)):
            raise Exception
        # 이미지 생성 및 ext4 포멧
        result = create_image_file(workspace_name=workspace_name, device=device)
        # if callable(storage_response_dict[result]):
        #     storage_response_dict[result]
        #     raise CreateWorkspaceError
        # 마운트 포인트 확인
        if os.path.exists(JF_WORKSPACE_PATH.format(workspace_name = workspace_name)):
            raise Exception
        # 마운트 포인트 생성
        workspace_dir = JF_WORKSPACE_PATH.format(workspace_name = workspace_name)
        os.makedirs(workspace_dir)
        
        result = mount_image(workspace_name, device)
        
        if not fstab_check:
            return response(status=0, message="fstab error")
        common.launch_on_host("mount-sync --fstab {}".format(JF_STORAGE_WORKSPACE_FSTAB_HOST_PATH))
        os.system("mount -a --fstab {}".format(JF_STORAGE_WORKSPACE_FSTAB_CONTAINER_PATH))
        # if callable(storage_response_dict[result]):
        #     storage_response_dict[result]
        #     raise MountImageError
        
        #local host mount
        # common.launch_on_host("mount-sync {}".format('--fstab /etc/jfb/fstab_jfb_ws'))
        
        #loop device search
        disk_info = common.AllPathInfo(path = os.path.join(JF_WS_DIR, workspace_name)).get_device_info()
        result = resize_image_file(workspace_name, capacity, device, disk_info['device'])
        # if callable(storage_response_dict[result]):
        #     storage_response_dict[result]
        #     raise ResizeImageError

        #disk_info = get_disk_info(os.path.join(PATH.JF_WS_DIR, workspace_name))
        # if not disk_info['size'] == args['capacity']+'G':
        #     raise Exception
        return workspace_dir
    except:
        fstab_extract(workspace_name = workspace_name)
        umount_image(workspace_name = workspace_name)
        remove_image_file(workspace_name = workspace_name, device=device)
        remove_mountpoint(workspace_name = workspace_name)
        traceback.print_exc()
        return Exception

#ONLY RESIZE
def update_workspace_limit(workspace_id, capacity):
    try:
        workspace_info = db.get_workspace(workspace_id=workspace_id)
        storage_image_info = db.get_storage_image_control(workspace_id)
        storage_info = db.get_storage(id=storage_image_info['storage_id'])
        disk_info = common.AllPathInfo(path = os.path.join(JF_WS_DIR,workspace_info['workspace_name'])).get_device_info()
        # disk_info를 통해서 loop device name 파싱
        #로컬호스트의 메인스토리지의 경우 overlay로 표시됨 메인스토리지의 경우 default로 비할당 스토리지로 사용
        if storage_info['share'] == 1 :
            raise ResizeImageError
        resize_image_file (workspace_info['workspace_name'], capacity, storage_info['physical_name'], disk_info['device'])
        return True
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception :
        traceback.print_exc()
        return Exception

def delete_workspace_image(workspace_id=None, workspace_name=None, storage_id=None):
    try:
        if workspace_id == None :
            workspace_name = workspace_name
            storage_id = storage_id
        else :
            workspace_info = db.get_workspace(workspace_id=workspace_id)
            storage_image_info = db.get_storage_image_control(workspace_id)
            workspace_name = workspace_info['workspace_name']
            storage_id=storage_image_info['storage_id']

        storage_info = db.get_storage(id=storage_id)
        
        fstab_extract(workspace_name = workspace_name)
        umount_image(workspace_name = workspace_name)

        # mountpoint = "/jfbcore"+JF_WORKSPACE_PATH.format(workspace_name = workspace_name)
        # common.launch_on_host("umount -f {}".format(mountpoint))

        remove_image_file(workspace_name = workspace_name, device=storage_info['physical_name'])
        remove_mountpoint(workspace_name = workspace_name)
        return response(status = 1, result = "workspace delete complete")
    except:
        traceback.print_exc()
        raise RemoveImageError

def sync_workspace_limit():
    try:            
        from storage import fstab_check
        if not fstab_check:
            return response(status=0, message="fstab error")
        fstab_refresh()
        common.launch_on_host("mount-sync --fstab {}".format(JF_STORAGE_WORKSPACE_FSTAB_HOST_PATH))
        os.system("mount -a --fstab {}".format(JF_STORAGE_WORKSPACE_FSTAB_CONTAINER_PATH))
        storage_list = db.get_storage_list()
        image_list=[]
        #할당형 스토리지에 존재하는 Image file 목록 리스트화
        for storage in storage_list:
            if storage['id'] == MAIN_STORAGE_ID:
                # workspace_list = db.get_workspace_list()
                for workspace in db.get_workspace_list():
                    if db.get_storage_image_control(workspace_id=workspace['id']) is None:
                        db.insert_storage_image_control(workspace_id=workspace['id'], storage_id=MAIN_STORAGE_ID, status=1)
                continue
            if storage['share'] == 0: # 할당형 워크스페이스
                image_list = glob(JF_STORAGE_IMAGE_PATH.format(device_name=storage['physical_name'],workspace_name='*')) 
                for image_path in image_list:
                    workspace_name = image_path.split('/')[-1].split('.')[0]
                    workspace_info=db.get_workspace(workspace_name=workspace_name)
                    if workspace_info is None:
                        #워크스페이스 정보도 없으면 삭제or업로드시 에러발생으로 남은 파일이라고 간주
                        print("**************************************************")
                        print("unknown image file : {}".format(image_path))
                        print("**************************************************")
                        continue
                    workspace_path=JF_WORKSPACE_PATH.format(workspace_name =workspace_name)
                    if not os.path.exists(workspace_path):
                        #워크스페이스정보는 있으나 mountpoint가 존재하지 않으면 확인필요
                        print("**************************************************")
                        print("not exists workspace mount point : {}".format(workspace_path))
                        print("**************************************************")
                        #워크스페이스의 이미지 컨트롤의 상태값을 0으로 수정
                        db.update_storage_image_control(workspace_id=workspace_info['id'], storage_id=storage_info['id'], status=0)
                        continue
                    disk_info = common.AllPathInfo(path = workspace_path).get_device_info()
                    storage_info = db.get_storage(physical_name=storage['physical_name'])
                    if db.get_storage_image_control(workspace_info['id']) is None:
                        db.insert_storage_image_control(workspace_id=workspace_info['id'], storage_id=storage_info['id'], size=disk_info['size'], status=1)
                    else:
                        db.update_storage_image_control(workspace_id=workspace_info['id'], storage_id=storage_info['id'], size=disk_info['size'], status=1)
        return True
    except:
        traceback.print_exc()
        raise Exception

def fstab_refresh():
    try:
        storage_list = db.get_storage_list()
        image_list=[]
        #할당형 스토리지에 존재하는 Image file 목록 리스트화
        for storage in storage_list:
            if storage['share']==0:
                image_list.extend(glob(JF_STORAGE_IMAGE_PATH.format(device_name=storage['physical_name'],workspace_name='*')))

        #fstab_jfb_ws에서 마운트 리스트
        with open(JF_STORAGE_WORKSPACE_FSTAB_CONTAINER_PATH,"r",encoding="utf-8") as f:
            mount_list = f.readlines()

        for image in image_list:
            delete_index=[]
            for mount in mount_list:
                fstab_value = mount
                #공백제거
                if mount =='\n':
                    delete_index.append(mount_list.index(mount))
                    pass

                mount_image_path = mount.split(' ')[0]
                #server의 이미지 경로와 fstab에 담긴 이미지 경로를 비교
                if image == mount_image_path:
                    delete_index.append(mount_list.index(mount))
                    break
            
            #리스트가 비어있지 않다면 해당 인덱스를 삭제하여 bigO 감소

            if delete_index:
                # delete_index.sort(reverse=True)
                for index in sorted(delete_index, reverse=True):
                    del mount_list[index]

        if mount_list:
            for mount in mount_list:
                fstab_extract(mount)
                

    except:
        traceback.print_exc()
        raise Exception

def make_workspace_base(workspace_name, storage_id, workspace_size=None):
    try:
        workspace_size_byte = None
        storage_info = db.get_storage(id = storage_id)
        if storage_info['logical_name'] == MAIN_STORAGE:
            workspace_dir = JF_WORKSPACE_PATH.format(workspace_name=workspace_name)
            return workspace_dir, workspace_size_byte
        else:
            if storage_info['share'] == 0:
                #할당형 워크스페이스 생성
                #워크스페이스 -> image file 기반 ext4로 format
                #image file을 loop device 를 사용하여 workspace 위치에 마운트하여 사용하는 방식
                workspace_dir = create_workspace_image(workspace_name, storage_info['physical_name'], workspace_size)
                workspace_size_byte = common.AllPathInfo(path=JF_WORKSPACE_PATH.format(workspace_name=workspace_name)).get_device_info()['size']
            else:
                #공유형 워크스페이스 연결된 스토리지(disk, nfs)
                #마운트된 디바이스에 워크스페이스를 생성하여 심볼릭링크 파일을 워크스페이스 위치에 생성
                workspace_dir = JF_STORAGE_MOUNTPOINT_PATH.format(device_name=storage_info['physical_name'])+workspace_name
        return workspace_dir, workspace_size_byte
    except:
        if storage_info['logical_name'] != MAIN_STORAGE :   
            if storage_info['share'] == 0:
                delete_workspace_image(workspace_name=workspace_name, storage_id=storage_id)
            else :
                workspace_dir = JF_STORAGE_MOUNTPOINT_PATH.format(device_name=storage_info['physical_name'])+workspace_name
                if os.path.exists(workspace_dir):
                    common.rm_rf(workspace_dir) # 원본삭제
                common.rm_rf(JF_WORKSPACE_PATH.format(workspace_name=workspace_name)) #링크파일 삭제
        traceback.print_exc()
        raise CreateWorkspaceError

def remove_workspace(workspace_id):
    try:
        workspace_info = db.get_workspace(workspace_id=workspace_id)
        workspace_limit_info = db.get_storage_image_control(workspace_id)
        storage_info = db.get_storage(id = workspace_limit_info['storage_id'])
        if storage_info['logical_name'] == MAIN_STORAGE:
            # MAIN STORAGE일 경우 False를 리턴하여 기존 삭제 Function 수행
            return False
        else : 
            if storage_info['share'] == 0:
                delete_workspace_image(workspace_id=workspace_id)
            else:
                workspace_dir = JF_STORAGE_MOUNTPOINT_PATH.format(device_name=storage_info['physical_name'])+workspace_info['workspace_name']

                if os.path.exists(workspace_dir):
                    common.rm_rf(workspace_dir)
                os.remove(JF_WORKSPACE_PATH.format(workspace_name=workspace_info['workspace_name']))
                # common.rm_rf(JF_WORKSPACE_PATH.format(workspace_name=workspace_info['workspace_name']))
        return True
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception :
        traceback.print_exc()
        return Exception

def update_workspace_image(workspace_id, capacity):
    try:
        workspace_info = db.get_workspace(workspace_id=workspace_id)
        workspace_limit_info = db.get_storage_image_control(workspace_id)
        update_workspace_limit(workspace_id, capacity)
        workspace_size_byte = common.AllPathInfo(JF_WORKSPACE_PATH.format(workspace_name=workspace_info['workspace_name'])).get_device_info()['size']
        db.update_storage_image_control(workspace_id = workspace_id, storage_id=workspace_limit_info['storage_id'], size=workspace_size_byte)
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception :
        traceback.print_exc()
        return Exception
"""
==============================================================
datasets function END
==============================================================
"""

# """
# =================================================================================================================================
# Datasets Router START
# =================================================================================================================================
# """

@ns.route('/sync', methods=['POST'])
@ns.response(200, 'Success')
@ns.response(400, 'Validation Error')
class workspace_limit_sync(CustomResource):
    @token_checker
    def post(self):
        """
        Workspace_limit sync
        """
        
        res = sync_workspace_limit()

        return self.send(res)



# @ns.route('', methods=['POST','PUT'])
# @ns.route('/<id_list>', methods=['DELETE'])
# @ns.response(200, 'Success')
# @ns.response(400, 'Validation Error')
# class workspace_limit(CustomResource):
#     @ns.expect(create_parser)
#     @token_checker
#     def post(self):
#         """
#         Workspace create image
#         """

#         args = create_parser.parse_args()
        
#         res = create_workspace_limit(args['workspace_name'], args['device'], args['capacity'])

#         return self.send(res)

#     @ns.expect(update_parser)
#     @token_checker
#     def put(self):
#         """
#         Workspace update image
#         """

#         args = update_parser.parse_args()
#         res = update_workspace_limit(args['workspace_id'], args['capacity'])

#         return self.send(res)

#     @token_checker
#     @ns.param('id_list', 'id_list')
#     def delete(self, id_list):
#         """
#         workspace 삭제
#         """
#         print("workspace delete")
#         delete_workspace(id_list)
#         # db.request_logging(self.check_user(), 'datasets/'+str(id_list), 'delete', None, res['status'])
#         return self.send(response(status = 1, result = "workspace delete"))
# # """
# =================================================================================================================================
# Datasets Router END
# =================================================================================================================================
# """
