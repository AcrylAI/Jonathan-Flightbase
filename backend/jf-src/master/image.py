import re
import json
import time
import settings
import workspace
import traceback
import queue
import threading
import subprocess
from restplus import api

import utils.kube as kube
import utils.db as db
import utils.registry as registry

import utils.common as common
from utils.common import launch_on_host as common_launch_on_host
from utils.common import generate_alphanum, ensure_path, writable_path

from utils.access_check import admin_access_check, workspace_access_check, image_access_check, check_image_access_level
from utils.resource import CustomResource, token_checker, response
from utils.exceptions import *

# 파일 관련 임포트
import os
import shutil
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

ROOT_USRE = 1
ACCESS_WORKSPACE = 0
ACCESS_ALL = 1

IMAGE_STATUS_PENDING = 0
IMAGE_STATUS_INSTALLING = 1
IMAGE_STATUS_READY = 2
IMAGE_STATUS_FAILED = 3
IMAGE_STATUS_DELETING = 4

IMAGE_UPLOAD_TYPE_BUILT_IN = 0
IMAGE_UPLOAD_TYPE_PULL = 1
IMAGE_UPLOAD_TYPE_TAR = 2
IMAGE_UPLOAD_TYPE_BUILD = 3
IMAGE_UPLOAD_TYPE_TAG = 4
IMAGE_UPLOAD_TYPE_NGC = 5
IMAGE_UPLOAD_TYPE_COMMIT = 6
IMAGE_UPLOAD_TYPE_COPY = 7

# PATH 변수
DOCKER_REGISTRY_URL = settings.DOCKER_REGISTRY_URL  # 192.168.X.XX:5000/

BASE_DOCKERFILE_PATH = settings.BASE_DOCKERFILE_PATH  # in docker
HOST_BASE_DOCKERFILE_PATH = settings.HOST_BASE_DOCKERFILE_PATH  # in host
DOCKERFILE_PATH_SKEL = 'dockerfile/{random_str}/Dockerfile' # relative path for db store
DOCKERFILE_FULL_PATH_SKEL = BASE_DOCKERFILE_PATH + '/' + DOCKERFILE_PATH_SKEL

BASE_IMAGE_PATH = settings.BASE_IMAGE_PATH  # in docker
HOST_BASE_IMAGE_PATH = settings.HOST_BASE_IMAGE_PATH  # in host
IMAGE_PATH_SKEL = 'tar/{random_str}.tar'  # relative path for db store
IMAGE_FULL_PATH_SKEL = BASE_IMAGE_PATH + '/' + IMAGE_PATH_SKEL

# 스레드 관련 변수
installation_thread_init = 0
image_library_init = settings.IMAGE_LIBRARY_INIT
is_installation_thread_alive = False
images_to_install = queue.Queue()
image_sync_lock = threading.Lock()
cached_size_dict = None

ns = api.namespace('images', description='도커 이미지 관련 API')

def launch_on_host(cmd, host=settings.DOCKER_BUILD_SERVER_IP, cluster=False, **kwargs):
    """
    cluster : True이면 쿠버네티스 연결된 노드 조회
    ignore_stderr=True : 에러 발생해도 정상적으로 처리, (stdout, stderr)로 리턴
    
    [result]
    ---
    cluster == True 일때,
    result = {
        node_ip : value,
        ...
    }

    [error case]
    error : the input device is not a TTY 인경우,
    command : "docker -it" -> "docker -i" - launcher command 에서 t 옵션 사용 X
    """
    if not cluster: # 노드 모두 런처를 실행하지 않고, 호스트에서만 실행
        return common_launch_on_host(cmd=cmd, host=host, **kwargs)
    else: # 모든 노드 런처 실행
        # 노드 리스트
        node_ip_list = [item['node_ip'] for item in kube.get_node_ip_and_hostname_list()]
        if not node_ip_list:
            node_ip_list = [host] #[settings.HOST_IP]

        res = dict()
        for node_ip in node_ip_list:
            try:
                result, *_ = common_launch_on_host(cmd=cmd, host=node_ip, **kwargs)
                res[node_ip] = result # {노드ip : 결과값}
            except:
                continue
        return res

def logging_history(user, task, action, task_name, workspace_id=None, update_details=None):
    """로그(history): user(UserName), task(image), action(CRUD)"""
    try:
        if type(workspace_id) != list: # 워크스페이스 아이디 없는 경우
            db.logging_history(workspace_id=None, user=user, task=task, action=action, task_name=task_name,
                               update_details=update_details)
        else:
            for wid in workspace_id: # 워크스페이스 아이디 있는 경우
                db.logging_history(workspace_id=wid, user=user, task=task, action=action, task_name=task_name,
                                   update_details=update_details)
    except Exception as error:
        traceback.print_exc()
        return error

# ###############################################################################################
# ####################################### POST ##################################################
# ###############################################################################################
'''
[이미지 설치]
1. 이미지 POST
post_image_by_... -> create_image_by_... (DB 생성 - db.insert_create_image, 생성시 status = 0)

2. 쓰레드
_refresh_loop -> sync_images
sync_images
    (1) 큐 : add_images_to_queue() -> 생성된 DB에서 status == 0 이면, images_to_install 큐에 담음
    (2) 설치 : install_docker_images() -> install_image_by_....함수 실제 설치
'''
def post_image_by_type(image_name, description, access, workspace_id_list, user_id, type_=None, item=None):
    """
    [item]
        pull : url
        build : file_
        ngc : selected_image_url
        tag : selected_image_name, node_ip
        tar : file_, chunk_file_name, end_of_file
    """
    try:
        # 사전 체크 -------------------------------------------------------------------------------------------------------------
        check_previous_create_image(image_name, type_=type_, item=item)

        # 파일 처리 작업 --------------------------------------------------------------------------------------------------------
        if type_ == 'pull':
            parameter = file_parameter_by_pull(item)
        elif type_ == 'ngc':
            parameter = file_parameter_by_ngc(item)
        elif type_ == 'tag':
            parameter = file_parameter_by_tag(item)
        elif type_ == 'commit':
            parameter = file_parameter_by_commit(item, user_id)
        elif type_ == 'copy':
            parameter = file_parameter_by_copy(item)
        # elif type_ == 'build':
        elif item["save"] == "Dockerfile":
            res, message, result = save_file_for_installing_image(type_=type_, item=item)
            parameter = file_parameter_by_build(result)
        # elif type_ == 'tar':
        elif item["save"] == "tar":
            res, message, result = save_file_for_installing_image(type_=type_, item=item)
            if res == True and message == "testing":
                # 대용량 파일 전송시 필요
                # 아직 파일이 완전히 전송되지 않은 경우 message==testing 을 리턴, 완전히 전송 된 경우 message == "OK"
                # print("not end of file")
                return response(status=1, message=message, result=result)            
            parameter = file_parameter_by_tar(result)

        file_path = parameter['file_path']
        upload_filename = parameter['upload_filename']
        random_str = parameter['random_str']
        
        # 이미지 생성 --------------------------------------------------------------------------------------------------------
        result = create_image_by_type(image_name, description, access, workspace_id_list, user_id, type_=type_,
                             file_path=file_path, random_str=random_str, upload_filename=upload_filename)
        
        # 로그 ---------------------------------------------------------------------------------------------------------------
        user_name = db.get_user_name(user_id)['name']
        logging_history(user=user_name, task='image', action='create', workspace_id=workspace_id_list,
                        task_name='{} / {}'.format(type_, image_name))
        
        return response(status=1, message="OK", result=result)    
    except CustomErrorList as ce:
        if ce.response()["error"]["code"] == "015":
            print(" 에러 : 도커 이미지 생성 이름 중복")
        else:
            traceback.print_exc()
        raise ce
    except Exception as e:
        traceback.print_exc()
        raise PostImageError

def create_image_by_type(image_name, description, access, workspace_id_list,

                         user_id, type_, file_path=None, random_str=None, upload_filename=None):
    """DB에 이미지 생성, 생성시 status = 0으로 생성하여 이미지 설치 스레드가 진행되도록 함"""
    try:
        # force empty list if Global release type
        if access == ACCESS_ALL:
            workspace_id_list = []
        
        # Permission checking of workspace
        if user_id in db.get_admin_user_id_list():
            effective_user_id = None
        else:
            effective_user_id = user_id

        workspace_list = workspace.get_workspace_list(None, None, None, None, effective_user_id, None)
        for workspace_id in workspace_id_list:
            if workspace_id not in [row['id'] for row in workspace_list]:
                # Does not exist or No permission
                # raise ValueError('Workspace of requested id {} does not exist.'.format(workspace_id))
                raise NotExistWorkspaceError(workspace_id=workspace_id)
            
        # real_name
        if not random_str:
            real_name = generate_image_tag_name(image_name=image_name, type_=type_, random_str=None)
        else:
            real_name = generate_image_tag_name(image_name=image_name, type_=type_, random_str=random_str)

        # DB insert
        if type_ == "pull":
            upload_type = IMAGE_UPLOAD_TYPE_PULL
        elif type_ == "ngc":
            upload_type = IMAGE_UPLOAD_TYPE_NGC
        elif type_ == "build":
            upload_type = IMAGE_UPLOAD_TYPE_BUILD
        elif type_ == "tar":
            upload_type = IMAGE_UPLOAD_TYPE_TAR
        elif type_ == "tag":
            upload_type = IMAGE_UPLOAD_TYPE_TAG
        elif type_ == "commit":
            upload_type = IMAGE_UPLOAD_TYPE_COMMIT
        elif type_ == "copy":
            upload_type = IMAGE_UPLOAD_TYPE_COPY

        image_id = db.insert_create_image(user_id=user_id, image_name=image_name, real_name=real_name, description=description, 
                                          file_path=file_path, upload_filename=upload_filename, 
                                          upload_type=upload_type, access=access, iid=None)

        if len(workspace_id_list) > 0:
            db.insert_image_workspace(image_id, workspace_id_list)

        return {"id": image_id, "name": image_name, "build type": type_}
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception as error:
        # return 0, error, None
        traceback.print_exc()
        raise CreateImageError

def save_file_for_installing_image(type_, item):
    """이미지 생성: dockerfile build, tar 방식일때 파일 업로드"""
    try:
        # 업로드 파일명
        '''
        https://werkzeug.palletsprojects.com/en/2.0.x/datastructures/#werkzeug.datastructures.FileStorage

        example
        file_                   : <FileStorage: 'Dockerfile' ('application/octet-stream')>
        file_.filename(파일종류) : Dockerfile
        file_.content_type     : application/octet-stream
        file_.headers          : Content-Disposition: form-data; name="file"; filename="Dockerfile"
        '''
        #-------------------------------------------------------------------------------------------
        # if type_ == "tar":
        if item["save"] == "tar":
            chunk_file_name = item['chunk_file_name']
            end_of_file = item['end_of_file']
        # elif type_ == "build":
        elif item["save"] == "Dockerfile":
            chunk_file_name = None
        
        file_ = item['file_']
        upload_filename = file_.filename
        file_name = file_.filename.split('/')[-1]
        file_name = secure_filename(file_name)

        #-------------------------------------------------------------------------------------------
        # jf-data/tmp
        #-------------------------------------------------------------------------------------------
        '''
        ensure_path : 보안체크
        writable_path : 임시 경로로 write 테스트
        while문 : 임의의 문자를 넣어 파일 저장
        경로 : 파일 저장(도커) /jf-data/images, 이미지 빌드(호스트) /jfbcore/jf-data/images
        '''
        upload_dir = settings.JF_UPLOAD_DIR # '/jf-data/tmp'
        ensure_path(upload_dir)
        if not writable_path(upload_dir) and settings.FLASK_DEBUG:
            raise WritablePathError(path=upload_dir)
        
        if item["save"] == "Dockerfile":
            while True:
                random_str_temp = generate_alphanum(6)
                file_path_temp = upload_dir + '/{}.Dockerfile'.format(random_str_temp)
                if not os.path.exists(file_path_temp):
                    break
            file_.save(file_path_temp, buffer_size=16*1024)
        elif item["save"] == "tar":
            if chunk_file_name is None:
                # 처음에만 호출되고, temp 경로가 정해지면 chunk_file_name에 값이 담겨 이부분을 호출하지 않음
                while 1:
                    random_str_temp = generate_alphanum(6)
                    file_path_temp = upload_dir + '/{}.tar'.format(random_str_temp)
                    if not os.path.exists(file_path_temp):
                    # 존재하지 않으면, while문 나와서 file_path_temp 사용, 존재하면 다시 경로 생성
                        break
            else:
                random_str_temp = chunk_file_name
                file_path_temp = upload_dir + '/{}.tar'.format(random_str_temp)

            # 파일 write
            with open(file_path_temp, "ab") as fw:
                fw.write(file_.read())

            # 대용량 파일 전송시 front에서 파일을 잘라서 전송함, 아직 마지막까지 전달이 안된 경우 message=="testing", chunk_file_name을 리턴
            if not end_of_file:
                return True, "testing", {"chunk_file_name" : random_str_temp}

        #-------------------------------------------------------------------------------------------
        # check the dockerfile in tar if type == build && file == tarfile
        if type_ == "build" and item["save"] == "tar":
            try:
                # tar tvf {path} Dockerfile로 찾지 못하는 경우가 있음 && 압축해제시 폴더가 생성되면 안되고 바로 파일들이 풀려야함 (Dockerfile 최상위)
                command = """tar tvf {} | grep Dockerfile | awk '{{ print $6 }}'""".format(file_path_temp)
                output = subprocess.check_output(command , shell=True, stderr=subprocess.STDOUT).strip().decode()
                tmp_output_list = output.split('\n')

                if "No such" in output:
                    raise SaveFileForImageError(message=output)
                elif len(tmp_output_list) >= 2:
                    """Dockerfile, Dockerfile.xxx 같이 있는 경우
                    -> 'Dockerfile'을 기준으로 빌드
                    'Dockerfile' 은 없고 'Dockerfile.xxx' 만 있는 경우
                    -> Dockerfile.xxx 파일이 하나이면, 빌드
                    -> 여러개인 경우 에러
                    """
                    for i in tmp_output_list:
                        if i.split("/")[-1] == "Dockerfile":
                            dockerfile_path = i
                            break
                    else:
                        raise SaveFileForImageError(message="file named 'Dockerfile' must have only one")
                else:
                    dockerfile_path = output
            except subprocess.CalledProcessError as e:
                print("e->", e.output.decode('utf-8'))
                raise SaveFileForImageError(message=e.output.decode('utf-8'))

        #-------------------------------------------------------------------------------------------
        # jf-data/images
        #-------------------------------------------------------------------------------------------
        '''
        BASE_DOCKERFILE_PATH = '/jf-data/images' # in docker
        DOCKERFILE_PATH_SKEL = 'dockerfile/{random_str}/Dockerfile'  # relative path for db store
        DOCKERFILE_FULL_PATH_SKEL = BASE_DOCKERFILE_PATH + '/' + DOCKERFILE_PATH_SKEL
        -> file_path + '/' + file_fullpath = '/jf-data/images' + '/' + 'dockerfile/RblLnf/Dockerfile'
        -> path : file_path에서 Dockerfile 빠진 것
        '''
        random_string = generate_alphanum(6)
        if type_ == "build":
            global DOCKERFILE_PATH_SKEL
            if item["save"] == "tar":
                DOCKERFILE_PATH_SKEL = 'dockerfile/{random_str}.tar'
            file_path = DOCKERFILE_PATH_SKEL.format(random_str=random_string)
            file_fullpath = BASE_DOCKERFILE_PATH + '/' + file_path
        elif type_ == "tar":
            file_path = IMAGE_PATH_SKEL.format(random_str=random_string)
            file_fullpath = BASE_IMAGE_PATH + '/' + file_path

        path = os.path.dirname(file_fullpath)
        ensure_path(path)
        if not writable_path(path):
            raise WritablePathError(path=path)
        shutil.move(file_path_temp, file_fullpath)

        #-------------------------------------------------------------------------------------------
        # revise file_path (tar path + dockerfile path) if type == build && file == tarfile
        if type_ == "build" and item["save"] == "tar":
            file_path = file_path + "/" + dockerfile_path
            file_path = file_path.replace("/.", "") # Dockerfile이 최상위일 경우 dockerfile/abc.tar/./Dockerfile 이렇게 됨

        return True, "OK", {"upload_filename": upload_filename, "file_path": file_path, "random_string": random_string}
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception as e:
        traceback.print_exc()
        raise SaveFileForImageError

# ###############################################################################################
def check_previous_create_image(image_name, type_=None, item=None):
    """이미지 POST 할 경우, 이미지 create 하기 전에 체크"""
    try:
        # 도커 이미지 이름 중복 체크
        check_if_name_is_valid(image_name)
        
        # url 체크
        url, image_name = None, None
        if type_ == "pull":
            url = item['url']
        elif type_ == "ngc":
            url = item['selected_image_url']
        elif type_ == "tag":
            url = item['selected_image_name']
        if url:
            check_if_url_is_valid(url)

        # system image 체크
        if type_ == "tag":
            image_name = item['selected_image_name']
        elif type_ == 'copy':
            image_name = db.get_image_single(image_id=item['image_id'])["real_name"]
        if image_name:
            if not check_if_image_exists_in_system(image_name):
                raise NotExistImageError(image_name=image_name)
                # return False, "{} does not exist.".format(image_name), None
                
        # file check
        if type_ == "build" or type_ == "tar":
            file_ = item["file_"]
            file_name = file_.filename.split('/')[-1]
            file_name = secure_filename(file_name)
            try:
                chunk_file_name = item["chunk_file_name"]
            except:
                chunk_file_name = None

            if (not file_name.endswith('.tar') and chunk_file_name is None) and file_name != "Dockerfile":
                raise ValidTypeError
            elif (type_ == "tar" and file_name.endswith('.tar')) or (type_ == "build" and file_name.endswith('.tar')):
                item["save"] = "tar"
            elif file_name == "Dockerfile" and type_ == "build":
                item["save"] = "Dockerfile"
            else:
                raise ValidTypeError

        return
    except CustomErrorList as ce:
        if ce.response()["error"]["code"] == "015":
            pass
        else:
            traceback.print_exc()
        raise ce
    except Exception as e:
        traceback.print_exc()
        raise e

def check_if_name_is_valid(name):
    """도커 이미지 업로드 -> 이름 중복 체크"""
    if not name:
        raise ValidImageNameEmptyError
    elif db.check_if_image_name_exists(image_name=name):
        raise VaildImageNameDuplicatedError
    return True

def check_if_url_is_valid(url):
    """도커 이미지 업로드 -> URL format 체크 - https://같은게 앞에 있으면 안됨"""
    if url.startswith('http://') or url.startswith('https://'):
        # return False, "Invalid url format. Remove http scheme."
        raise ValidImageUrlProtocolError
    elif len(url.split(':')) > 3 or len(url.split('/')) > 3:
        # return False, "Invalid url format."
        raise ValidImageUrlFormatError
    return True, ""

def check_if_image_exists_in_system(image_name):
    """시스템에 이미지가 존재하는지 확인"""
    try:
        cmd = """docker images {} --digests --format "'{{{{json .}}}}'" """.format(image_name)
        res = list(i for i in launch_on_host(cmd=cmd, cluster=True).values() if i is not "")
        if res:
            return True
        else:
            return False
    except Exception as e:
        traceback.print_exc()
        raise NotExistImageError(image_name=image_name)

def check_if_ngc_image_exists_in_ngc_registry(url):
    """Check if an image with the provided url exists.

    :ptype url: string
    :param url: ngc repositry, image name and tag. (nvidia/name:tag)
    :return: True if exsits, otherwise False
    """
    try:
        _, error = launch_on_host(f"ngc registry image info {url}", ignore_stderr=True)
        if error == "":
            return
        raise NotExistImageError
    except Exception as e:
        traceback.print_exc()
        raise e

def generate_image_tag_name(image_name=None, type_=None, random_str=None):
    """Image create 할 때, real_name 생성"""
    try:
        if random_str is None:
            random_str = generate_alphanum(6)
        name_noescape = re.sub('[^a-zA-Z0-9\-]', '', image_name).lower()
        name_noescape = re.sub('[-]*$', '', name_noescape)
        real_name = DOCKER_REGISTRY_URL + 'jfb/by{}-{}:{}'.format(type_, name_noescape, random_str)
        return real_name
    except Exception as e:
        traceback.print_exc()
        raise e
# ####################################### file parameter #########################################
'''
[file paramter]
post_image_by_type에서 사용
type마다 post 파라미터로 받은 item 다름 -> db 저장 위해 파라미터 정리하는 코드
return parameter = {'file_path' : , 'upload_filename' : , 'random_str' :}

[item]
    pull : url
    build : file_
    ngc : selected_image_url
    tag : selected_image_name, node_ip
    tar : file_, chunk_file_name, end_of_file
'''
def file_parameter_by_pull(item):
    try:
        parameter = {
            'file_path' : item['url'],
            'upload_filename' : item['url'],
            'random_str' : None
        }
        return parameter
    except Exception as e:
        traceback.print_exc()
        raise e

def file_parameter_by_ngc(item):
    try:
        parameter = {
            'file_path' : item['selected_image_url'],
            'upload_filename' : item['selected_image_url'],
            'random_str' : None
        }
        return parameter        
    except Exception as e:
        traceback.print_exc()
        raise e

def file_parameter_by_tag(item):
    try:
        parameter = {
            'file_path' : json.dumps(item), # 임시로 item을 담음
            'upload_filename' : item['selected_image_name'],
            'random_str' : None
        }    
        return parameter
    except Exception as e:
        traceback.print_exc()
        raise e
    
def file_parameter_by_build(item):
    try:
        parameter = {
            'file_path' : item["file_path"],
            'upload_filename' : item["upload_filename"], 
            'random_str' : item["random_string"]
        }
        return parameter
    except Exception as e:
        traceback.print_exc()
        raise e

def file_parameter_by_tar(item):
    try:
        parameter = {
            'file_path' : item['file_path'],
            'upload_filename' : item['upload_filename'],
            'random_str' : item['random_string']
        }
        return parameter
    except Exception as e:
        traceback.print_exc()
        raise e
        
def file_parameter_by_commit(item, user_id):
    try:    
        item['user_id'] = user_id # install_imag_by_commit에서 docker commit 시 author 에 넣어줄 값
        parameter = {
            'file_path' : json.dumps(item),
            'upload_filename' : None,
            'random_str' : None
        }
        return parameter
    except Exception as e:
        traceback.print_exc()
        raise e
        
def file_parameter_by_copy(item):
    try:
        image_info = db.get_image_single(image_id=item['image_id'])
        tmp = {"original_image" : image_info["real_name"], "type_" : image_info['type']} # 임시로 기존 이미지의 타입을 담아 놓음
        parameter = {
            'file_path' : json.dumps(tmp),
            'upload_filename' : image_info["real_name"],
            'random_str' : None
        }
        return parameter
    except Exception as e:
        traceback.print_exc()
        raise e

# ###############################################################################################
# ##################################### Install #################################################
# ###############################################################################################
def install_docker_images():
    """Installing images thread.

    Get an image from images_to_install queue after a new image is added to installing queue,
    start installing by image type(pull, tar, build and tag) and
    set the status of the image to 3 with an error message if the installation did not succeed or
    set the status of the image to 2 if the installation succeed and then insert docker image digest if it exsits.
    """
    global images_to_install
    while True:
        # queue에 있는 이미지
        image = images_to_install.get()
        if image is not None:
            with image_sync_lock:
                # queue에서 가져온 이미지
                id_ = image["id"]
                real_name = image["real_name"]
                type_ = image["type"]
                file_path = image["file_path"]
                save_log_install_image(message="[START Image installation]", image_id=id_)
                
                # file_path에 저장한 json 아이템 타입변경 (db str -> dict)
                if type_ in (IMAGE_UPLOAD_TYPE_TAG, IMAGE_UPLOAD_TYPE_COPY, IMAGE_UPLOAD_TYPE_COMMIT):
                    file_path = json.loads(file_path)
                try:
                    image_info = db.get_image_single(image_id=id_)
                    cur_status = image_info["status"]
                    if cur_status is None:
                        continue
                    elif cur_status != 0:  # 1:installing 2: installed 3: error
                        continue
                    db.update_image_data(image_id=id_, data={"status" : 1}) # start installing

                    # 설치
                    save_log_install_image(message="[EXECUTE Docker Command]", image_id=id_)
                    is_installation_success = False
                    if type_ == IMAGE_UPLOAD_TYPE_PULL:
                        # is_installation_success, message_if_failed = install_image_by_pull(file_path, real_name)
                        install_image_by_pull(file_path, real_name, id_)
                    elif type_ == IMAGE_UPLOAD_TYPE_TAR:
                        # is_installation_success, message_if_failed = install_image_by_tar(file_path, real_name)
                        install_image_by_tar(file_path, real_name, id_)
                    elif type_ == IMAGE_UPLOAD_TYPE_BUILD:
                        # is_installation_success, message_if_failed = install_image_by_build(file_path, real_name)
                        install_image_by_build(file_path, real_name, id_)
                    elif type_ == IMAGE_UPLOAD_TYPE_TAG:
                        # is_installation_success, message_if_failed = install_image_by_tag(file_path, real_name)
                        install_image_by_tag(file_path, real_name, id_)
                    elif type_ == IMAGE_UPLOAD_TYPE_NGC:
                        # is_installation_success, message_if_failed = install_image_by_ngc(file_path, real_name)
                        install_image_by_ngc(file_path, real_name, id_)
                    elif type_ == IMAGE_UPLOAD_TYPE_COMMIT:
                        # is_installation_success, message_if_failed = install_image_by_commit(file_path, real_name)                        
                        install_image_by_commit(file_path, real_name, id_)                        
                    elif type_ == IMAGE_UPLOAD_TYPE_COPY:
                        # is_installation_success, message_if_failed = install_image_by_copy(file_path, real_name)
                        install_image_by_copy(file_path, real_name, id_)
                    elif type_ == IMAGE_UPLOAD_TYPE_BUILT_IN:
                        continue
                    else:
                        # message_if_failed = "Docker upload type error"
                        db.update_image_data(image_id=id_, data={"status": 3, "fail_reason": "Docker upload type error", "size" : None})
                        continue

                    # 설치 실패 (install_image_by_xxx 에서 db update 처리)
                    # if not is_installation_success:
                    #     error_message = str(message_if_failed)
                    #     error_message = error_message.replace("'", " ")  # mariadb syntax error
                    #     db.update_image_data(image_id=id_, data={"status": 3, "fail_reason": error_message})
                    #     continue
                    
                    # 설치 후 작업 -----------------------------------------------------------------------------------------

                    # 설치 후, Docker Registry에 푸시
                    # tag, commit은 install 에서 작업, 추후 다른 타입도 변경??
                    if type_ != IMAGE_UPLOAD_TYPE_COMMIT and type_ != IMAGE_UPLOAD_TYPE_TAG:
                        if (len(real_name.split(':')) > 2):
                            save_log_install_image(message="[PUSH Image in JONATHAN-Flightbase-Registry]", image_id=id_)
                            launch_on_host("docker push {}".format(real_name),
                                std_callback=(save_log_install_image, {"image_id" : id_, "layer_log" : True, "layer" : dict()}))

                    save_log_install_image(message="[GET Image information for JONATHAN Flightbase]", image_id=id_)
                    # 설치 후, DB 업데이트
                    # size, iid, docker_digest, library
                    libs_digest = get_library_version_of_image(real_name=real_name) # docker run 실행 (다른 host 이미지라도 레지스트리에서 pull)
                    sys_images = get_system_images()
                    for sys_image in sys_images:
                        if sys_image["name"] == real_name:
                            size = sys_image["size"] if sys_image["size"] else None
                            iid = sys_image["id"] if sys_image["id"] else None
                            digest = sys_image["digest"] if sys_image["digest"] else None

                            db.update_image_data(image_id=id_, data={
                                    "size" : size, "iid" : iid, "docker_digest" : digest, "libs_digest" : libs_digest,})
                            break
                    
                    # 나머지 정보 업데이트
                    if type_ == IMAGE_UPLOAD_TYPE_COPY:
                        type_ = file_path['type_']
                        db.update_image_data(image_id=id_, data={"type" : type_})
                    if type_ == IMAGE_UPLOAD_TYPE_COMMIT:
                        db.update_image_data(image_id=id_, data={"file_path" : real_name})

                    # 설치 성공, DB 업데이트 : status
                    db.update_image_data(image_id=id_, data={"status": 2})
                    save_log_install_image(message="[Image installation is complete]", image_id=id_)
                except CustomErrorList as ce:
                    if str(ce.response()["error"]["message"]) is not None:
                        err_msg = str(ce.response()["error"]["message"])
                    else:
                        err_msg = "Install image error"
                    db.update_image_data(image_id=id_, data={"status": 3, "fail_reason": err_msg, "size": None})
                    traceback.print_exc()
                except Exception as error:
                    db.update_image_data(image_id=id_, data={"status": 3, "fail_reason": error, "size" : None})
                    traceback.print_exc()

def install_image_by_pull(url, real_name, image_id):
    try:
        if len(url.split('/')[-1].split(':')) == 1:
            url += ':latest'
        # if check_if_image_exists_in_system(image_name=url): # If the image already exist in the system.
        #     launch_on_host("docker tag {} {}".format(url, real_name))
        # else: # Currently not exist in the system.
        #     launch_on_host("docker pull {}".format(url))
        #     launch_on_host("docker tag {} {}".format(url, real_name)) # Make alias
        #     launch_on_host("docker rmi {}".format(url), ignore_stderr=True) # And remove original name
        cmd = "docker pull {}".format(url)
        save_log_install_image(message=f"[Command : {cmd}]", image_id=image_id)
        launch_on_host(cmd, std_callback=(save_log_install_image, 
            {"image_id" : image_id, "layer_log" : True, "layer" : dict()}))
        launch_on_host("docker tag {} {}".format(url, real_name)) # Make alias
    except Exception as e:
        # print("docker image pull installation error")
        traceback.print_exc()
        raise InstallImageError(reason=str(e).replace("'", " "))

def install_image_by_build(file_path, real_name, image_id):
    """
    dockerfile_folder_host_fullpath : 폴더 경로 -> .../dockerfile/tag
    # Dockerfile
    file_path : dockerfile/vM6dpf/Dockerfile
    relative_build_context : dockerfile/vM6dpf
    full_path : HOST_BASE_DOCKERFILE_PATH(/jfbcore/jf-data/images) + relative_build_context

    # docker build tar
    file_path = dockerfile/{tag}.tar/.../Dockerfile
    random_str = dockerfile/{tag}
    압축해제 할때, format 변수 : {tag}
    """
    try:
        if "tar" in file_path:
            save_log_install_image(message="[File Processing for build tar file] - {}".format(file_path), image_id=image_id)

            file_path_tmp = file_path.split('.tar') 
            random_str = file_path_tmp[0]

            # 압축 해제 위한 폴더 생성
            os.chdir(BASE_DOCKERFILE_PATH)
            cmd = """mkdir {}""".format(random_str)            
            subprocess.run(cmd, shell=True, check=True)

            # 압축 해제
            os.chdir(BASE_DOCKERFILE_PATH + "/" + random_str)
            cmd = """tar -xvf ../{} -C . > /dev/null """.format(random_str.split('/')[-1] + ".tar")
            subprocess.run(cmd, shell=True, check=True)

            # docker build
            dockerfile_folder_host_fullpath = HOST_BASE_DOCKERFILE_PATH + "/" + file_path.replace(".tar", "")
            cmd = 'docker build --tag {} --force-rm=true --file {} {}'.format(
                    real_name, dockerfile_folder_host_fullpath, dockerfile_folder_host_fullpath.replace("/Dockerfile", ""))
            build_path = random_str
        else:
            # dockerfile_folder_host_fullpath = HOST_BASE_DOCKERFILE_PATH + '/' + '/'.join(file_path.split('/')[:-1])
            build_path = '/'.join(file_path.split('/')[:-1]) # relative_build_context
            cmd = 'docker build --tag {} --force-rm=true {}'.format(real_name, HOST_BASE_DOCKERFILE_PATH + '/' + build_path)

        save_log_install_image(message=f"[Command : {cmd}]", image_id=image_id)
        launch_on_host(cmd, std_callback=(save_log_install_image, {"image_id" : image_id}))
        delete_file_for_image_installation(build_path)
    except Exception as e:
        # print("Docker image dockerfile installation error")
        traceback.print_exc()
        raise InstallImageError(reason=str(e).replace("'", " "))

def install_image_by_ngc(url, real_name, image_id):
    """
    NOTE:
        NGC Client로 이미지 설치
    """
    try:
        check_if_ngc_image_exists_in_ngc_registry(url)
        
        # image pull
        if not check_if_image_exists_in_system(image_name=url):
            cmd = "ngc registry image pull {}".format(url)
            save_log_install_image(message=f"[Command : {cmd}]", image_id=image_id)
            launch_on_host(cmd, std_callback=(save_log_install_image, 
                {"image_id" : image_id, "layer_log" : True, "layer" : dict()}))
            
        # image tag
        cmd = "docker tag {} {}".format(url, real_name)
        save_log_install_image(message=f"[Command : {cmd}]", image_id=image_id)
        launch_on_host(cmd, std_callback=(save_log_install_image, {"image_id" : image_id})) # Make alias
        # launch_on_host("docker rmi {}".format(url), ignore_stderr=True) # And remove original name
    except Exception as e:
        # print("docker image ngc installation error")
        traceback.print_exc()
        raise InstallImageError(reason=str(e).replace("'", " "))

def install_image_by_tar(file_path, real_name, image_id):
    try:
        # docker load
        image_tar_host_fullpath = HOST_BASE_IMAGE_PATH + '/' + file_path
        cmd = "docker load --input " + image_tar_host_fullpath
        save_log_install_image(message=f"[Command : {cmd}]", image_id=image_id)
        stdout, err = launch_on_host(cmd, ignore_stderr=True, std_callback=(save_log_install_image, {"image_id" : image_id}))

        # docker tag
        # success
        if stdout.startswith('Loaded image ID: '):
            iid = stdout.split('Loaded image ID: ')[1].split('\n')[0]
            launch_on_host("docker tag {} {}".format(iid, real_name), std_callback=(save_log_install_image, {"image_id" : image_id}))
        # success
        elif stdout.startswith('Loaded image: '):
            iid = stdout.split('Loaded image: ')[1].split('\n')[0]
            launch_on_host("docker tag {} {}".format(iid, real_name), std_callback=(save_log_install_image, {"image_id" : image_id}))
        # error
        elif err.startswith('Loaded image: open /var/lib/docker'):
            raise InstallImageError(reason="Only upload save-type images. Can not upload export-type image")
        elif len(stdout.split("\n")) >= 2:
            loaded = False            
            for out in stdout.split("\n"):
                # success
                if out.startswith('Loaded image ID: '):
                    iid = out.split('Loaded image ID: ')[1].split('\n')[0]
                    launch_on_host("docker tag {} {}".format(iid, real_name), std_callback=(save_log_install_image, {"image_id" : image_id}))
                    loaded = True
                # success
                elif out.startswith('Loaded image: '):
                    iid = out.split('Loaded image: ')[1].split('\n')[0]
                    launch_on_host("docker tag {} {}".format(iid, real_name), std_callback=(save_log_install_image, {"image_id" : image_id}))
                    loaded = True
                # success
                elif out.startswith('The image '):
                    # Same tag docker image Recovery
                    # out ex)
                    # The image jf_cpu_jupyter:latest already exists, renaming the old one with ID sha256:e9aba3bf65652dcfb2f21bf0738f95610aa834ab97dbcd5e78bc92e415bc6cb9 to empty string
                    recover_cmd = out[10:]
                    recover_cmd = recover_cmd.split(" already exists, renaming the old one with ID sha256:")
                    recover_name_tag = recover_cmd[0]
                    recover_iid = recover_cmd[1].replace(" to empty string", "")
                    launch_on_host("docker tag {} {}".format(recover_iid, recover_name_tag), std_callback=(save_log_install_image, {"image_id" : image_id}))
                # success / error
                else:
                    print("Docker image install unknown output : {}".format(out))
            # error
            if loaded == False:
                # print("Docker image install Error - tar : ", stdout)
                # db.update_image_data(image_id=id_,data={"status": 3, "fail_reason": str(stdout).replace("'", " ")})
                traceback.print_exc()
                raise InstallImageError(reason=stdout)
        # error
        else:
            # print("Docker image install Error - tar : ", stdout)
            # db.update_image_data(image_id=id_,data={"status": 3, "fail_reason": str(stdout).replace("'", " ")})
            traceback.print_exc()
            raise InstallImageError(reason=stdout)

        # delete file
        delete_file_for_image_installation(file_path) # load 실패일때는 파일 삭제 안하고 남김 (디버깅)
    except Exception as e:
        traceback.print_exc()
        if err: e = err
        raise InstallImageError(reason=str(e).replace("'", " "))

def install_image_by_commit(file_path=None, real_name=None, image_id=None):
    try:
        # message
        training_tool_id = file_path["training_tool_id"]
        comment = file_path["comment"].replace('"', '')
        
        user_id = file_path['user_id']
        user_name = db.get_user(user_id=user_id)['name']
        
        message = """ \"{}\"-by_{} """.format(comment, user_name)
        
        # docker commit을 하기위한 container_id, launcher의 node_ip를 가져옴
        container_id, node_ip = kube.get_pod_container_commit_info(training_tool_id=training_tool_id)
        container_id = container_id.replace("docker://", "")
        
        # commmit
        script = """docker commit --author {} --message {} {} {}""".format(user_name, message, container_id, real_name)
        save_log_install_image(message=f"[Command : {script}]", image_id=image_id)
        launch_on_host(script, host=node_ip, std_callback=(save_log_install_image, {"image_id" : image_id}))

        # push
        save_log_install_image(message="PUSH Image in JONATHAN-Flightbase-Registry]", image_id=image_id)
        script = "docker push {}".format(real_name)
        launch_on_host(script, host=node_ip, std_callback=(save_log_install_image, {"image_id" : image_id, "layer_log" : True, "layer" : dict()}))
    except Exception as e:
        traceback.print_exc()
        raise InstallImageError(reason="Do not terminate training tool before completion")

def install_image_by_tag(file_path, real_name, image_id):
    """
    NOTE:
        현재 Admin 페이지에서만 사용 가능한 기능
    """
    try:
        original_image = file_path['selected_image_name']
        node_ip = file_path['node_ip']        
        launch_on_host("""docker tag {} {}""".format(original_image, real_name), host=node_ip, std_callback=(save_log_install_image, {"image_id" : image_id}))  # Make alias
        save_log_install_image(message="PUSH Image in JONATHAN-Flightbase-Registry]", image_id=image_id)
        launch_on_host("""docker push {}""".format(real_name), host=node_ip, std_callback=(save_log_install_image, {"image_id" : image_id, "layer_log" : True, "layer" : dict()})) # 레지스트리 푸시
    except Exception as e:
        traceback.print_exc()
        raise InstallImageError(reason=str(e).replace("'", " "))

def install_image_by_copy(file_path, real_name, image_id):
    """카피할 이미지 태그 변경"""
    try:
        original_image = file_path['original_image']
        launch_on_host("""docker tag {} {}""".format(original_image, real_name), std_callback=(save_log_install_image, {"image_id" : image_id}))
    except Exception as e:
        traceback.print_exc()
        raise InstallImageError(reason=str(e).replace("'", " "))

# ###############################################################################################
def get_library_version_of_image(image_id=None, real_name=None):
    """도커를 통해 이미지의 라이브러리(tensorflow, torch, mpi, cuda)를 확인 // 11~15초"""
    try:
        # real_name
        if real_name is None:
            real_name = db.get_image_single(image_id)["real_name"]

        # pip version -----------------------------------------------------------------
        script = """docker run --rm -i --entrypoint="/bin/bash" {} -c
                 "pip3;"
                 """.format(real_name)
        _, error = launch_on_host(script, ignore_stderr=True)
        
        pip = "pip3"
        if "pip3: command not found" in error:
            pip = "pip"

        # command -----------------------------------------------------------------
        command = """
        echo JFB_START_LINE;
        {} list 2>/dev/null  | grep -E 'tensorflow-gpu |tensorflow |torch ';
        mpirun -version 2>/dev/null |grep mpirun;
        nvcc --version 2>/dev/null | grep release | cut -d ',' -f -2;
        """.format(pip)

        script = """docker run --rm -i  --entrypoint="/bin/bash" {} -c \"\"\"{}\"\"\" """.format(real_name, command)

        version_raws, error = launch_on_host(script, ignore_stderr=True)
        version_raws = version_raws.split('\n')[:-1]
        for _ in range(len(version_raws)):
            if version_raws.pop(0) == 'JFB_START_LINE':
                break

        # version parsing -----------------------------------------------------------------
        library_name = {'tensorflow-gpu': 'tensorflow', 'tensorflow': 'tensorflow', 'torch': 'torch',
                        'mpirun': 'mpi', 'mpirun.real': 'mpi', 'Cuda': 'cuda'}
        library_list = []
        for raw in version_raws:
            temp_string = re.split(r'[=\s]', raw)
            try:
                name = library_name[temp_string[0]]
            except KeyError:
                continue
            version = temp_string[-1]

            library_list.append(
                {
                    "name": name,
                    "version": version
                }
            )

        return library_list if library_list else None
    except Exception as error:
        traceback.print_exc()
        return None

def delete_file_for_image_installation(file_path):
    """이미지 생성 (build, load) 때 사용한 파일 삭제"""
    try:
        full_path = BASE_IMAGE_PATH + '/' + file_path
        subprocess.run("""rm -rf {}*""".format(full_path), shell=True, check=True) # docker build -> tar 경우 폴더, tar 파일 모두 삭제
        # if os.path.exists(full_path):
        #     os.remove(full_path)
    except Exception as e:
        print(e)
        traceback.print_exc()
        pass

# ################################### Install log ###############################################
line = 0
def save_log_install_image(std_out=None, std_err=None, image_id=None, message=None, layer_log=False, layer=None):
    """
    Description :
        이미지 설치 시 launcher 로그 저장, docker command 부분 (pull, build, tag, push) + print
        pull(pull, ngc) -> _save_log_layer
        echo 사용시 std_out에 > 가 포함되어, 저장될 문자열이 파일로 만들어지는 경우가 있어서 ''으로 처리함
    Args :
        std_out, std_err, message (str) : log
        _type(int), layer(dict) : pull, ngc, push일 때 필요한 input
    """
    try:
        dir_path = BASE_IMAGE_PATH + "/log"
        ensure_path(dir_path)
        file_path = dir_path + "/{}.log".format(image_id)

        def _save_log_install_layer(std_out, file_path):
            '''
            Description
                pull(pull, ngc), push 설치 로그
                ! progressbar - pull, pushing은 안되고, ngc는 됨 
            # layer
                pull case
                    Already exists / Pulling fs layer, Waiting, Downloading
                    Verifying Checksum, Download complete, Extracting, Pull complete
                push case
                    Preparing, Waiting, Pusing, Pushed, Mounted from
            # layer 아닌 경우
                ':' 이 std_out에 포함되어도 layer가 아닌 경우가 있어서 따로 분리함
            '''
            global line
            if b'\x1b[F\x1b[K' in std_out.encode():
                pass
            elif "The push refers to repository" in std_out or "Pulling from" in std_out:
            # push 시작(The push refers to repository), pull 시작(Pulling from)
                    cmd = "echo '{}\\n.' >> {}".format(std_out, file_path) # '.'을 다음줄에 입력해줘야 sed 동작
                    os.system(cmd)
                    line = sum(1 for _ in open(file_path)) # sed 부분 업데이트를 위해 line 위치 가져옴
            elif any(x in std_out for x in ("Digest", 'Status', 'digest')):
            # 마지막 부분
                cmd = "echo '{}' >> {}".format(std_out, file_path)
            elif ":" in std_out:
            # layer 부분
                tmp = std_out.split(":")
                _hash = tmp[0]
                if len(_hash) == 12: # layer 인경우
                    _status = ''.join(tmp[1:])
                    if '/' in _status:
                        _status = _status.replace('/', '\/') # sed에서 '/'포함시 에러 (ex. Mounted from) 
                    layer[_hash] = _status
                    cmd = """sed -i "{}s/.*/layer: {}/g" {}""".format(line, layer, file_path)
                    os.system(cmd)
                else: # layer 아닌 경우
                    os.system("echo '{}' >> {}".format(std_out, file_path))
            else:
            # TODO 다른 case?
                os.system("echo '{}' >> {}".format(std_out, file_path))

        if std_out:
            if layer_log == True:
                _save_log_install_layer(std_out, file_path)
            else:
                os.system("echo '{}' >> {}".format(std_out, file_path))
        if std_err:
            os.system("echo '{}' >> {}".format(std_err, file_path))
        if message: # 코드에서 print로 보고 싶은 부분
            os.system("echo '{}' >> {}".format(message, file_path))
    except Exception as e:
        traceback.print_exc()

def get_image_install_log(image_id):
    """
    Description
        docker image 설치하는 로그 파일을 읽어옴
        pull(pull, ngc)인경우, layer 부분 json처럼 내려줌 (json은 아님, 프론트에서 str아니면 에러발생)
    """
    try:
        # dir_path = HOST_BASE_IMAGE_PATH + "/log"
        dir_path = BASE_IMAGE_PATH + "/log"
        file_path = dir_path + "/{}.log".format(image_id)

        image = db.get_image(image_id=image_id)
        status = image["status"]
        _type = image["type"]

        if not os.path.isfile(file_path): # 파일 없는 경우 빈문자열 내려줌
            return response(status=1, message="OK", result={"log" : [], "status" : status})
        
        with open(file_path, 'r') as r:
            res = list()
            for line in r.readlines():
                if "layer:" in line:
                    tmp = line.replace("layer:","").replace("'", '"')
                    for key, value in json.loads(tmp).items(): # log파일에 저장된 layer는 한줄로 저장된 형태
                        res.append("{}: {}".format(key, value))
                else:
                    res.append(line)
        return response(status=1, message="OK", result={"log" : res, "status" : status})
    except Exception as e:
        traceback.print_exc()
        raise e

###############################################################################################
####################################### Sync ##################################################
###############################################################################################
def start_refresh_loop():
    # Start a looper in a new thread. Auto reload.
    threading.Thread(target=_refresh_loop, daemon=True).start()
    # threading.Thread(target=check_image_install_queue, daemon=True).start()
    check_registry_url_of_image()

'''
def check_image_install_queue():
    """_refresh_loop에서는 다른 함수를 실행하기 때문에, 큐 확인이 늦어져서 따로 스레드를 만듬
    로그에 계속 올라와서, TEST 할때만 사용"""
    global images_to_install
    while 1:
        try:
            tmp = list(images_to_install.queue)
            if tmp:
                print("[IMAGE] install queue : ", tmp)
            print("[IMAGE] install queue : ", tmp)
            time.sleep(15)
        except Exception as error:
            traceback.print_exc()
'''

def _refresh_loop():
    # Looper for backgroun run. Interval of 10 seconds.
    while 1:
        try:
            sync_images()
            time.sleep(30)
        except Exception as error:
            traceback.print_exc()

def sync_images():
    """
    first loop : installation_thread_init = 0, is_installation_thread_alive = False
    -> install_docker_images start, installation_thread_init = 1, check_db_image
    """
    try:
        global installation_thread_init
        global is_installation_thread_alive

        # first loop: status 1인 이미지 롤백 
        if not is_installation_thread_alive:  # restart the server
            check_installation_status_and_rollback_if_not_installed()  # status 1 -> 2 if an image exists in the system else 0

        # first loop: install_docker_image thread start
        if installation_thread_init < 1: # init = 0
            installation_thread_init = 1
            one_time_thread = threading.Thread(target=install_docker_images, args=(), daemon=True) 
            one_time_thread.start() # install_docker_images thread start 
            is_installation_thread_alive = one_time_thread.is_alive() # True
            check_db_image() # status 2, 3 - 이미지 초기 체크 

        # check_db_image()
        add_images_to_queue()  # status of image is 0
        delete_image_all_place() # status 4 
    except Exception as e:
        traceback.print_exc()

def check_installation_status_and_rollback_if_not_installed():
    """Get the image whose status is 1 and check if its installed with installing thread lock.

    Do roll-back if its not installed.
    For roll-back, delete the image in system and set the status to 0 in order to reinstall.
    2022-10-11 : For roll-back, reinstall 안하고 설치 실패

    DB status 1 -> 시스템 확인후 설치된 경우 DB status 2로 변경
    DB status 1 -> 시스템 확인후 설치 안된 경우 DB status 3으로 변경
    """
    # status 1
    global images_to_install
    with image_sync_lock:
        installing_images = db.get_image_by_status(status=1)
        for image in installing_images:
            # 시스템에 설치된 경우
            if check_if_image_exists_in_system(image_name=image["real_name"]):
                # status를 2로 변경
                db.update_image_data(image_id=image["id"], data={"status": 2})
                continue
            else:
                # 설치 안된경우
                # DB : 설치 안된 경우
                db.update_image_data(image_id=image["id"], data={"status": 3, "size" : None})
                try:
                    # 시스템에서 rmi 삭제
                    launch_on_host("docker rmi {}".format(image["real_name"]), ignore_stderr=True)
                except:
                    pass

                try:
                    # 도커파일 빌드방식 시스템에서 삭제
                    if image["type"] == 2:
                        launch_on_host("rm -r {}/{}".format(HOST_BASE_DOCKERFILE_PATH, image["file_path"]))
                    # tar 빌드방식 시스템에서 삭제
                    elif image["type"] == 3:
                        launch_on_host("rm -r {}/{}".format(HOST_BASE_IMAGE_PATH, image["file_path"]))
                except:
                    pass

def add_images_to_queue():
    """Add images to queue to install"""
    with image_sync_lock:
        global images_to_install
        uninstalled_images = db.get_image_by_status(status=0)
        if uninstalled_images is not None:
            for uninstalled_image in uninstalled_images:
                images_to_install.put(uninstalled_image)
 
def check_db_image():
    """
    DB 이미지 status 2,3 -> 시스템, 레지스트리 체크
    
    <이미지 체크 방식>
        1. 시스템 and 레지스트리에 모두 없는지 확인
        -> 모두 없으면 status = 3
        -> 어디에라도 있으면 status = 2
            2. 시스템에만 있고, 레지스트리에 없으면 push
            3. 정보 업데이트
    
    <check 함수>
    1. image_library_init 사용 -> 초기에 library체크 & sync image로 매번체크
    2. check_installation_status_and_rollback_if_not_installed -> 한번만 체크 (이후 다른 정보도 체크 안함)
    지금은 두번째 방법 사용
    """
    try:
        # global image_library_init
        # 시스템 이미지
        system_image_list = get_system_images() # image 정보를 담고 있음 (정보 업데이트시 다시 조회하지 않고, 이 정보 사용)
        system_images = [i["name"] for i in system_image_list] # name만 담음

        # 레지스트리 이미지
        registry_images = get_registry_images()
        
        # # status 2 or 3 이미지
        db_images = list(db.get_image_by_status(status=IMAGE_STATUS_READY)) + list(db.get_image_by_status(status=IMAGE_STATUS_FAILED))

        # 이미지 체크 ====================================================================================================
        for db_image in db_images:
            # check_image에 담기고, status가 4로 변경되는경우가 있음 -> db_image update에서 처리
            # if db.get_image_single(image["id"])["status"] == IMAGE_STATUS_DELETING:
            #     continue
            data=dict()
            # 1. 없는 이미지
            if db_image["real_name"] not in system_images and db_image["real_name"] not in registry_images:
                data["status"] = 3
            # 1. 레지스트리 or 시스템에 있는 이미지
            else:
                data["status"] = 2
                data["fail_reason"] = None
                
                # 2. 레지스트리에는 없고, 시스템에 있는 이미지
                if db_image["real_name"] in system_images and db_image["real_name"] not in registry_images:
                    # jfb 이미지만 push
                    if DOCKER_REGISTRY_URL in db_image["real_name"]:
                        cmd = """docker push {}""".format(db_image["real_name"])
                        launch_on_host(cmd=cmd)
                        system_image_list = get_system_images() # system_image_list 정보 업데이트
                    
                # 3. 정보 업데이트
                # 3-1. size, iid
                if not db_image["iid"] or not db_image["size"]:
                    for system_image in system_image_list:
                        if system_image["name"] == db_image["real_name"]:
                            data["iid"] = system_image["id"]
                            data["size"] = system_image["size"]
                            data["docker_digest"] = system_image["digest"]
                            break
                # 3-2. library
                if not db_image["libs_digest"]:
                    data["libs_digest"] = get_library_version_of_image(image_id=db_image["id"])
            db.update_image_data(image_id=db_image["id"], data=data)
        # image_library_init = False # library 는 run 실행시 최초에만 실행
    except Exception as error:
        traceback.print_exc()

###############################################################################################
def get_system_images(registry=False):
    """ 시스템에 설치된 이미지 조회
    System images of host machine. launches `docker images' command.
    It may take some time to get information since it connects ssh.
    """
    try:
        result = launch_on_host(cmd = """docker images --digests --format "'{{json .}}'" """, cluster=True)
        if result is None:
            return None

        images = []
        for node, node_images in result.items():
            node_images = node_images.replace("'", "")
            node_images = node_images.split('\n')
            # 각 노드별 이미지
            for node_image in node_images:
                if node_image == "":
                    continue
                node_image = json.loads(node_image)
                if registry and DOCKER_REGISTRY_URL not in node_image["Repository"]:
                    continue
                image = {
                    "name": node_image["Repository"] + ':' + node_image["Tag"],
                    "repository": node_image["Repository"] if node_image["Repository"] != '<none>' else None,
                    "tag": node_image["Tag"] if node_image["Tag"] != '<none>' else None,
                    "digest": node_image["Digest"] if node_image["Digest"] != '<none>' else None,
                    "size": common.convert_unit_num(value=node_image["Size"][:-1], target_unit="", return_num=True)
                            if node_image["Size"] != '<none>' else None,
                    "id": node_image["ID"],
                    "node" : node
                }
                images.append(image)
        return images
    except Exception as e:
        traceback.print_exc()

def get_registry_images():
    """Docker Registry image 조회"""
    try:
        images = []
        # name
        for name in registry.get_registry_repositories(DOCKER_REGISTRY_URL):
            try:
                # tag
                for tag in registry.get_registry_repository_tags(DOCKER_REGISTRY_URL, name):
                    images.append(DOCKER_REGISTRY_URL + name+ ":" + tag)
            except:
                pass
        return images
    except Exception as e:
        traceback.print_exc()
        return False

def delete_image_all_place():
    """모든 곳에서 이미지 삭제 : 1. JFB-registry, 2. 각 노드 로컬 도커, 3. DB 삭제"""
    try:
        with image_sync_lock:
            delete_images = db.get_image_by_status(status=IMAGE_STATUS_DELETING) # status = 4
            for image in delete_images:
                # registry 삭제
                try:
                    repository = image["real_name"].replace(DOCKER_REGISTRY_URL, "").split(':')[0]
                    tag = image["real_name"].replace(DOCKER_REGISTRY_URL, "").split(':')[1]
                    if registry.get_registry_repository_tags(DOCKER_REGISTRY_URL, repository):
                        registry.delete_registry_repository_tag(DOCKER_REGISTRY_URL, repository, tag)
                except Exception as e:
                    pass
                # 각 노드의 로컬 도커에서 삭제
                try:
                    for node in db.get_node_list():
                        script = """docker rmi -f {}""".format(image["real_name"])
                        launch_on_host(script, host=node["ip"])
                except Exception as e:
                    pass
                # DB 삭제
                db.delete_image(image["id"])

                # 설치로그 파일 삭제
                file_path = BASE_IMAGE_PATH + "/log/{}.log".format(image["id"])
                os.remove(file_path)

                # 로그
                logging_history(user=None, task='image', action='deleted', task_name=image["real_name"])
            return True
    except Exception as e:
        traceback.print_exc()
        return False

def check_registry_image_to_db():
    """registry 이미지 중 db에 없는 이미지 확인"""
    try:
        res = []
        registry_images = get_registry_images()
        db_images = [i["real_name"] for i in db.get_image_list()]

        for registry_image in registry_images:
            if registry_image not in db_images:
                res.append(registry_image) 
                # registry.delete_registry_repository_tag(real_name=registry_image)
        return res
    except Exception as e:
        traceback.print_exc()

def check_registry_url_of_image():
    """
    Description: 
        registry의 url이 변경된 경우 대응, URL 기준은 settings.DOCKER_REGISTRY_URL O / DB X
        (start_refresh_loop) 에서 처음 시작할때 체크  
        url != DOCKER_REGISTRY_URL -> pull test -> 성공 : status 2, 실패 status 3
    """
    try:
        for item in db.get_image_list():
            real_name = item["real_name"]
            _split = real_name.split('/')
            url = _split[0] + '/'
            tag = '/'.join(_split[1:])
            
            if item["type"] != 0 and url != DOCKER_REGISTRY_URL:
                new_url = DOCKER_REGISTRY_URL + tag

                # pull test
                script = """docker pull {}""".format(new_url)
                _, err = launch_on_host(script, ignore_stderr=True)
                
                # DB 업데이트 : pull 성공한 경우에만 new_url로 변경
                if err is "": # 에러 없음
                    db.update_image_data(image_id=item["id"],
                        data={"real_name" : new_url, "status" : 2, "fail_reason" : None})
                else:
                    db.update_image_data(image_id=item["id"],
                        data={"status" : 3, "fail_reason" : err})
        return
    except Exception as error:
        traceback.print_exc()

###############################################################################################
'''
# def get_system_images_size_dict():
#     """Returns a size_dict of system images. It may take some time.
#     Example: {'some/repo:v1': '12 GB', 'some_other/repo:v1': '500 MB'}"""
#     try:
#         size_dict = {}
#         for i in range(3):  # max retry 3
#             images = get_system_images()
#             if images is not None:
#                 break
#         if images is None:
#             return None
#         for image in images:
#             size_dict[image["name"]] = image["size"]
#         return size_dict
#     except Exception as error:
#         traceback.print_exc()

# def fetch_size_dict():
#     # Fetch new size_dict. Manual reload.
#     try:
#         global cached_size_dict
#         size_dict = get_system_images_size_dict()

#         if size_dict is not None:
#             cached_size_dict = size_dict
#             return True
#         else:  # If failed to load new value, keep it old.
#             return False
#     except Exception as error:
#         traceback.print_exc()

# def get_cached_size_dict():
#     """Get size_dict from cache.
#     Initial call takes some time, but after cached, it returns
#     immediatly from cache."""
#     try:
#         global cached_size_dict
#         if cached_size_dict is None:
#             cached_size_dict = get_system_images_size_dict()

#         # Fetch size_dict asyncronously
#         threading.Thread(target=fetch_size_dict, daemon=True).start()
#         return cached_size_dict
#     except Exception as error:
#         traceback.print_exc()
'''
###############################################################################################
####################################### 기본 API ###############################################
###############################################################################################
# GET
def get_image_list(workspace_id, user_id):
    try:
        """db에 저장된 image 정보 가져옴"""
        image_list = []
        rows = db.get_image_list(workspace_id)

        for row in rows:
            item = {
                # 기본정보
                'id': row['id'],
                'image_name': row['name'],
                'status': row['status'],
                'fail_reason': row['fail_reason'], # 추가
                'type': row['type'],
                'access': row['access'],
                
                'size': row['size'] if row['size'] else None,
                'workspace': row['workspace'],
                'user_name': row['user_name'],
                'create_datetime': row['create_datetime'],
                'update_datetime': row['update_datetime'],

                # 상세정보
                'description': row['description'],
                'tag': row['real_name'].split(':')[-1],
                'iid': row['iid'],
                'repository': ':'.join(row['real_name'].split(':')[0:-1]),
                'library': row['libs_digest'] if row['libs_digest'] else None,

                # has_permission
                'has_permission': check_has_permission(user_id=user_id, build_type=row['type'], image_id=row['id'],
                                                       owner=row['uploader_id'], access=row['access'],
                                                       workspace_id=workspace_id),
                
                # 기타 
                'real_name' : row['real_name'],
                'docker_digest' : row['docker_digest'] if row['docker_digest'] else None,
                'upload_filename' : row['upload_filename'] if row['upload_filename'] else None
            }
            image_list.append(item)
        result = {
            "list": image_list,
            "total": len(image_list)
        }
        return response(status=1, message="OK", result=result)
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception as e:
        traceback.print_exc()
        raise GetImageError

def check_has_permission(image_id, user_id, workspace_id, owner, access, build_type):
    """
    flag to disable or enable buttons to edt/delete in User's Docker image page

    0 : 아무것도 못함
    1 : owner, 수정가능 + 전체삭제
    2 : owner, 수정가능 + 전체삭제 + 선택삭제
    3 : manager, 수정불가 + 선택삭제
    """
    try:
        # build-in 수정, 삭제 모두 막음
        if build_type == 0:
            return 0

        # root
        if user_id == ROOT_USRE:
            return 1

        # owner
        if user_id == owner:
            if access == ACCESS_ALL:
                return 1
            else:
                return 2

        # manager
        '''
        1. 이미지의 워크스페이스 모두 가져옴 -> 현재 워크스페이스 아이디가 있는지 확인
        2. 현재 워크스페이스의 매니저를 가져옴 -> 유저 아이디와 매니저 아이디가 같은지 확인
        '''
        for workspace in db.get_image_workspace_list(image_id):
            wid = workspace["workspace_id"]
            if workspace_id == wid:
                for manager_id in db.get_workspace_manager_id(wid):
                    if user_id == manager_id["manager_id"]:
                        return 3
        return 0
    except :
        traceback.print_exc()
        raise ImagePermissionError

# PUT
def update_image(image_id, image_name, workspace_id_list, access, description, user):
    """이미지 업데이트"""
    try:
        if access == ACCESS_ALL:
            workspace_id_list = []
            
        # update: name, access, description
        db.update_image_data(image_id=image_id, data={
            "name": image_name, "access": access, "description": description
        })

        # update: workspace
        db.update_image_workspace(
            image_id=image_id, access=access, workspace_id_list=workspace_id_list)

        # 로그
        logging_history(user=user, task='image', action='update',
                        task_name=image_name, workspace_id=workspace_id_list)

        return response(status=1, message="OK", result=None)
    except Exception as e:
        traceback.print_exc()
        raise UpdateImageError

# DELETE
def delete_image(delete_all_list, delete_ws_list, workspace_id, delete_user):
    """
    이미지 삭제
    이 함수에서는 워크스페이스 db만 수정(워크스페이스 삭제)하거나 status를 deleting으로 변경한다.
    실제로는 delete_image_all_place 에서 실제 이미지를 삭제 및 log 남김
    image_old에서는 삭제방식 다름 (def delete_image(user_id, image_id)) - status에 따라 바로 삭제 하거나, sync에서 삭제
    """
    try:
        status = 1
        message = {"success" : list(), "fail" : list(), "installing(try again)" : list()}
        
        delete_image_list = delete_all_list + delete_ws_list
        for delete_image in delete_image_list:
            try:
                image_info = db.get_image_single(delete_image)
            except:
                pass
            
            # access 확인
            res, delete_type = check_delete_access(delete_image, delete_all_list, delete_ws_list, workspace_id, delete_user)
            if not res:           
                status *= 0
                message["fail"].append(image_info["image_name"] + ' (permission error)')
                continue
            
            # 대기중, 설치중
            if image_info["status"] == 0 or image_info["status"] == 1:
                status *= 0
                message["installing(try again)"].append(image_info["image_name"])
                continue

            # 워크스페이스 : DB만 삭제
            if delete_type == ACCESS_WORKSPACE:
                db.delete_image_workspace(delete_image, workspace_id)
                message["success"].append(image_info["image_name"] + f' (in {workspace_id} workspace)')
                            
            # 전체 삭제 or (워크스페이스 삭제 & 이미지가 속해있는 워크스페이스가 없는 경우)
            if delete_type == ACCESS_ALL or (delete_type == ACCESS_WORKSPACE and not db.get_workspace_image_id(delete_image)):
                # 상태가 실패함이면 db 바로 삭제
                if image_info["status"] == 3:
                    db.delete_image(delete_image)
                    message["success"].append(image_info["image_name"] + ' (all)')
                    continue
                
                # 레지스트리, 로컬, DB 삭제
                db.update_image_data(image_id=delete_image, data={"status" : IMAGE_STATUS_DELETING})
                message["success"].append(image_info["image_name"] + ' (all)')

        message = str(message)
        return response(status=status, message=message, result=None)
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception as e:
        traceback.print_exc()
        raise DeleteImageError

def check_delete_access(image_id, delete_all_list, delete_ws_list, workspace_id, delete_user):
    """유저의 삭제 이미지 권한 확인"""
    try:
        uploader_id = db.get_image_single(image_id)["uploader_id"]
        
        # 전체 삭제 체크
        if image_id in delete_all_list:
            if delete_user == uploader_id or delete_user == ROOT_USRE:
                return True, ACCESS_ALL
        # WS 삭제 체크
        elif image_id in delete_ws_list: 
            manager_list = [manager['manager_id'] for manager in db.get_image_manager_list(image_id)]
            image_workspace_list = [workspace_id['workspace_id'] for workspace_id in db.get_image_workspace_list(image_id)]
                
            if delete_user == uploader_id or delete_user == ROOT_USRE or \
                (delete_user in manager_list and workspace_id in image_workspace_list):
                return True, ACCESS_WORKSPACE 
        else:
            return False, None
    except :
        traceback.print_exc()
        raise ImagePermissionError

image_get = api.parser()
image_get.add_argument('workspace_id', type=int, required=False, location='args', default=None, help="현재 접속한 워크스페이스 ID")

update_params = api.parser()
update_params.add_argument('image_id', type=int, required=True, location='json', help="수정 : 수정할 이미지 아이디")
update_params.add_argument('image_name', type=str, required=True, location='json', help="수정 내용 : 이미지 이름")
update_params.add_argument('description', type=str, required=True, location='json', help="수정 내용 : 설명")
update_params.add_argument('access', type=int, required=True, location='json', help="수정 내용 : 할당 범위 - 전체(1), 워크스페이스(0)")
update_params.add_argument('workspace_id_list', type=list, required=False, location='json', help="수정 내용 : 워크스페이스")

delete_params = api.parser()
delete_params.add_argument('delete_all_list', type=list, location='json', required=False, default=[], help='전체 삭제할 이미지 ID 리스트')
delete_params.add_argument('delete_ws_list', type=list, location='json', required=False, default=[], help='워크스페이스 삭제할 이미지 ID 리스트')
delete_params.add_argument('workspace_id', type=int, location='json', required=False, default=0, help="현재 접속한 워크스페이스 ID")

@ns.route('', methods=["GET", "PUT", "DELETE"])
@ns.response(200, "Success")
@ns.response(400, "Validation Error")
class Image(CustomResource):
    @ns.expect(image_get)
    @token_checker
    @workspace_access_check(image_get)
    def get(self):
        """
        이미지 조회
        ---
        # returns

            message (int)  : "OK"
            status  (int)  : 0(실패), 1(성공)
            result  (dict) : list(이미지 정보), total(이미지 개수)
                list (dict)
                - id              image id
                - status          상태 : 0(대기), 1(설치중), 2(준비됨), 3(실패함)
                - type            업로드 방식 : 0(Built-in), 1(Pull), 2(Tar), 3(Docker BUild), 4(Tag), 5(NGC)
                - access          공개범위 : 전체(1), 워크스페이스(0)
                - image_name      이미지 이름
                - size            크기
                - workspace       워크스페이스 [{workspace_id, workspace_name}]
                - user_name       업로더
                - create_datetime 업로드 날짜
                - update_datetime 업데이트 날짜
                - description     설명
                - tag             태그 : real_name에서 저장소를 뺀 부분
                - iid             이미지 ID (해시)
                - repository      저장소 : real_name에서 태그를 뺀 부분
                - library         라이브러리 버전(cuda, tensorflow, mpi, pytorch)
                - fail_reason     실패함의 경우 이유를 알려주기 위한 정보
                기타
                - real_name : DOCKER_REGISTRY_URL/jfb/bytype-image이름:tag
                - docker_digest : image digest 값
                - upload_filename : dockerfile, tar 업로드시 파일명
        """
        args = image_get.parse_args()
        try:
            workspace_id = args["workspace_id"]  # user 계정에서 query param
            res = get_image_list(workspace_id, user_id=self.check_user_id())
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

    @ns.expect(update_params)
    @token_checker
    @image_access_check(update_params, method="IMAGE_UPDATE", priority="OWNER")
    def put(self):
        """
        이미지 수정
        ---
        # returns

            message (int)  : "OK"
            status  (int)  : 0(실패), 1(성공)
            result         : None
        """
        args = update_params.parse_args()
        try:
            image_id = args["image_id"]
            image_name = args["image_name"]
            workspace_id_list = args["workspace_id_list"] if args["workspace_id_list"] is not None else []
            access = args["access"]
            description = args["description"]

            res = update_image(image_id=image_id, image_name=image_name, workspace_id_list=workspace_id_list,
                            access=access, description=description, user=self.check_user())
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

    @ns.expect(delete_params)
    @token_checker
    @image_access_check(delete_params, method="IMAGE_DELETE", priority="OWNER")
    def delete(self):
        """
        이미지 삭제
        ---
        # returns

            message (int)  : "OK"(성공), "{image_id}:you don't have permission to delete it."(실패한 이미지가 있는 경우)
            status  (int)  : 1(성공), 0(실패)
            result         : None

            경우에 따라 이미지를 여러 개 삭제 할 수 있는데, 하나라도 실패하면 실패한 경우의 메시지가 나옴
        """
        args = delete_params.parse_args()
        try:
            delete_all_list = args["delete_all_list"]
            delete_ws_list = args["delete_ws_list"]
            workspace_id = args["workspace_id"]
                    
            res = delete_image(delete_all_list=delete_all_list, delete_ws_list=delete_ws_list,
                            workspace_id=workspace_id, delete_user=self.check_user_id())
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

def get_image_single(image_id):
    """단일 image 상세 정보"""
    try:
        res = db.get_image_single(image_id)
        return response(status=1, message="OK", result=res)
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception as e:
        traceback.print_exc()
        raise GetImageError

@ns.route("/<string:image_id>", methods=["GET"])
@ns.response(200, "Success")
@ns.response(400, "Validation Error")
class SingleImage(CustomResource):
    @ns.param('image_id', '조회할 이미지 ID')
    @token_checker
    def get(self, image_id):
        """
        조회: 단일 이미지 정보 조회
        수정 / 복제 기능 눌렀을 때, 이미지에 대한 정보를 가져옴
        ---
        # returns

            message (int)  : "OK"
            status  (int)  : 0(실패), 1(성공)
            result  (dict) : 이미지 정보, workspace(list)
                이미지 정보
                - id              image id
                - status          상태 : 0(대기), 1(설치중), 2(준비됨), 3(실패함)
                - type            업로드 방식 : 0(Built-in), 1(Pull), 2(Tar), 3(Docker BUild), 4(Tag), 5(NGC)
                - access          공개범위 : 전체(1), 워크스페이스(0)
                - image_name      이미지 이름
                - size            크기
                - workspace       워크스페이스 [{workspace_id, workspace_name}]
                - user_name       업로더
                - create_datetime 업로드 날짜
                - description     설명
                - tag             태그 : real_name에서 저장소를 뺀 부분
                - iid             이미지 ID (해시)
                - repository      저장소 : real_name에서 태그를 뺀 부분
                - library         라이브러리 버전(cuda, tensorflow, mpi, pytorch)
                workspace(dict in list)
                - workspace_id
                - workspace_name
        """
        try:
            res = get_image_single(image_id)
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

def get_tag_list(registry=False):
    """tag_list is system images of host machine"""
    try:        
        docker_image_list = dict()
        cmd = """docker images --digests --format "'{{json .}}'" """
        for ip, value in launch_on_host(cmd=cmd,cluster=True).items():
            docker_image_list[ip] = list()
            if value is not "":
                result = value.split('\n')[:-1]
                for item in result:
                    item = json.loads(item.replace("'", ""))
                    docker_image_list[ip].append(item)

        image_list = []
        for ip, values in docker_image_list.items():
            for docker_image in values:
                # registry에 있는 이미지인데 docker url이 없거나, 이미지 이름 none인 것
                if (registry and DOCKER_REGISTRY_URL not in docker_image["Repository"]) \
                or docker_image["Repository"] == "<none>":
                    continue
                image = {
                    "name": docker_image["Repository"] + ':' + docker_image["Tag"],
                    "id": docker_image["ID"],
                    'node_ip' : ip
                }
                image_list.append(image)
        return response(status=1, message="OK", result=image_list)
    except :
        traceback.print_exc()
        raise GetAdminImageError

tag_params = api.parser()
tag_params.add_argument('image_name', type=str, required=True, location='form', help="이미지 이름")
tag_params.add_argument('description', type=str, required=False, location='form', help="이미지 설명")
tag_params.add_argument('access', type=int, required=True, location='form', help="공개범위 - 워크스페이스(0), 전체(1)")
tag_params.add_argument('workspace_id_list', type=int, action='append', required=False, location='form', help="할당할 워크스페이스 리스트")
tag_params.add_argument('selected_image_name', type=str, required=True, location='form', help="선택한 docker image의 Repository:Tag")
tag_params.add_argument('node_ip', type=str, required=False, default=settings.HOST_IP, location='form', help="선택한 docker image의 node_ip")
@ns.route("/tag", methods=["GET", "POST"])
@ns.response(200, "Success")
@ns.response(400, "Validation Error")
class TagImage(CustomResource):
    @token_checker
    @admin_access_check()
    def get(self):
        """
        모든 tag 조회 (admin)
        admin 계정에서 도커 이미지 업로드를 눌렀을 때 모든 이미지 목록을 가져옴
        ---
        # returns

            message (int)  : "OK"
            status  (int)  : 0(실패), 1(성공)
            result  (list)
                dict
                - name : {DOCKER_REGISTRY_URL}/{jfb}/{by-upload_type}-{image_name}:{digest}
                - id : image id
                - node_ip : "192.168.1.xx"
        """
        try:
            res = get_tag_list()
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

    @ns.expect(tag_params)
    @token_checker
    @admin_access_check()
    def post(self):
        """
        이미지 생성: tag
        ---
        # returns

            result : {
                id (int)
                name (str)
                build type (str)
            }
            message (str)
            status (int)
        """
        args = tag_params.parse_args()
        try:
            image_name = args["image_name"]
            description = args["description"]
            access = args["access"]
            workspace_id_list = args["workspace_id_list"] if args["workspace_id_list"] is not None else []
            selected_image_name = args["selected_image_name"]
            node_ip = args["node_ip"]
            
            res = post_image_by_type(image_name, description, access, workspace_id_list,
                                    user_id=self.check_user_id(), type_="tag", item={'selected_image_name' : selected_image_name, "node_ip" : node_ip})
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))     

def get_ngc_image_list():
    """
    Get all ngc registry images.
    :rtype: list
    """
    try:
        result, _ = launch_on_host("ngc registry image list --format_type 'json'", ignore_stderr=True)
        ngc_images = json.loads(result)
        images = []
        for ngc_image in ngc_images:
            if ngc_image.get("latestTag") is not None and ngc_image.get(
                    "publisher") is not None:  # can not install if latestTag is not provided
                if ngc_image["sharedWithOrgs"]:
                    repository = ngc_image["sharedWithOrgs"][0]
                elif ngc_image["sharedWithTeams"]:
                    repository = ngc_image["sharedWithTeams"][0]
                else:
                    print("NGC IMAGE URL NEW CASE")
                    continue

                name = ngc_image["name"]
                publisher = ngc_image["publisher"]
                ugc_image_name = f"nvcr.io/{repository}/{name}"

                image = {
                    "name": name,
                    "publisher": publisher,
                    "ngc_image_name": ugc_image_name,
                }
                images.append(image)

        if not images :
            raise GetNgcImageError
        return response(status=1, message="OK", result=images)
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception as e:
        traceback.print_exc()
        raise e

ngc_params = api.parser()
ngc_params.add_argument('image_name', type=str, required=True, location='form', help="이미지 이름")
ngc_params.add_argument('description', type=str, required=False, location='form', help="이미지 설명")
ngc_params.add_argument('access', type=int, required=True, location='form', help="공개범위 - 워크스페이스(0), 전체(1)")
ngc_params.add_argument('workspace_id_list', type=int, action='append', required=False, location='form', help="할당할 워크스페이스 리스트")
ngc_params.add_argument('selected_image_url', type=str, required=True, location='form', help="Url of NGC registry image")
@ns.route("/ngc", methods=["GET", "POST"])
@ns.response(200, "Success")
@ns.response(400, "Validation Error")
class NgcImage(CustomResource):
    @token_checker
    def get(self):
        """
        NGC Image 조회
        도커 이미지 업로드를 눌렀을 때 ngc image 목록을 가져옴
        ---
        # returns

            message (int)  : "OK"
            status  (int)  : 0(실패), 1(성공)
            result  (list)
                dict
                - name
                - publisher
                - ngc_image_name
        """
        try:
            res = get_ngc_image_list()
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

    @ns.expect(ngc_params)
    @token_checker
    def post(self):
        """
        이미지 생성: ngc
        ---
        # returns
            result : {id (int), name (str), build type (str)}
        """
        args = ngc_params.parse_args()
        try:
            image_name = args["image_name"]
            description = args["description"]
            access = args["access"]
            workspace_id_list = args["workspace_id_list"] if args["workspace_id_list"] is not None else []
            selected_image_url = args["selected_image_url"]

            res = post_image_by_type(image_name, description, access, workspace_id_list,
                                    user_id=self.check_user_id(), type_="ngc", item={'selected_image_url' : selected_image_url})
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

def get_ngc_image_tag_list(ngc_image_name):
    """
    ngc_image 의 Tag 조회
    ex) ngc_image_name : nvcr.io/nvidia/cuda
    """
    try:
        result, error = launch_on_host(f"ngc registry image info {ngc_image_name} --format_type 'json'",
                                       ignore_stderr=True)
        if error: raise GetNgcImageTagError
        ngc_image = json.loads(result)
        if ngc_image["canGuestPull"]:
            images = [
                {
                    "url": f"{ngc_image_name}:{tag}",
                    "tag": tag
                } for tag in ngc_image["tags"]
            ]
        return response(status=1, message="OK", result=images)
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception as e:
        traceback.print_exc()
        raise e

ngc_tag_params = api.parser()
ngc_tag_params.add_argument('ngc_image_name', type=str, required=True, location='args', help="NGC 이미지 이름")
@ns.route("/ngc/tags", methods=["GET"])
@ns.response(200, "Success")
@ns.response(400, "Validation Error")
class GetNgcTagImage(CustomResource):
    @ns.expect(ngc_tag_params)
    @token_checker
    def get(self):
        """
        조회: NGC 태그 조회
        도커 이미지 업로드 시 NGC 업로드 방식을 누른 후, NGC Name을 눌렀을 때 image에 대한 tag 목록을 가져옴
        ---
        # returns

            message (int)  : "OK"
            status  (int)  : 0(실패), 1(성공)
            result  (list)
                dict
                - url
                - tag
        """
        args = ngc_tag_params.parse_args()
        try:
            ngc_image_name = args["ngc_image_name"]
            res = get_ngc_image_tag_list(ngc_image_name)
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

# ###############################################################################################
# #################################┌──┐##┌──┐##┌──##──┬──########################################
# #################################├──┘##│##│##└─┐####│##########################################
# #################################│#####└──┘##──┘####│##########################################
# ###############################################################################################
pull_params = api.parser()
pull_params.add_argument('image_name', type=str, required=True, location='form', help="이미지 이름")
pull_params.add_argument('description', type=str, required=False, location='form', help="이미지 설명")
pull_params.add_argument('access', type=int, required=True, location='form', help="공개범위 - 워크스페이스(0), 전체(1)")
pull_params.add_argument('workspace_id_list', type=int, action='append', required=False, location='form', help="할당할 워크스페이스 리스트")
pull_params.add_argument('url', type=str, required=True, location='form', help="[DOCKER_REGISTRY_IP]:[DOCKER_REGISTRY_PORT]/[REPOGITORY]/[IMAGE_NAME]:[TAG]")

build_params = api.parser()
build_params.add_argument('image_name', type=str, required=True, location='form', help="이미지 이름")
build_params.add_argument('description', type=str, required=False, location='form', help="이미지 설명")
build_params.add_argument('access', type=int, required=True, location='form', help="공개범위 - 워크스페이스(0), 전체(1)")
build_params.add_argument('workspace_id_list', type=int, action='append', required=False, location='form', help="할당할 워크스페이스 리스트")
build_params.add_argument('file', type=FileStorage, location='files', required=True, help='Dockerfile for build / tar : dockerfile + otherfiles')
build_params.add_argument('end_of_file', type=bool, required=False, default=False, location='form', help="Chunk file end check")
build_params.add_argument('chunk_file_name', type=str, required=False, location='form', help="Chunk file name")

tar_params = api.parser()
tar_params.add_argument('image_name', type=str, required=True, location='form', help="이미지 이름")
tar_params.add_argument('description', type=str, required=False, location='form', help="이미지 설명")
tar_params.add_argument('access', type=int, required=True, location='form', help="공개범위 - 워크스페이스(0), 전체(1)")
tar_params.add_argument('workspace_id_list', type=int, action='append', required=False, location='form', help="할당할 워크스페이스 리스트")
tar_params.add_argument('file', type=FileStorage, location='files', required=True, help='Docker image tar file.')
tar_params.add_argument('end_of_file', type=bool, required=False, default=False, location='form', help="Chunk file end check")
tar_params.add_argument('chunk_file_name', type=str, required=False, location='form', help="Chunk file name")

commit_params = api.parser()
commit_params.add_argument('image_name', type=str, required=True, location='form', help="이미지 이름")
commit_params.add_argument('description', type=str, required=False, location='form', help="이미지 설명")
commit_params.add_argument('access', type=int, required=True, location='form', help="공개범위 - 워크스페이스(0), 전체(1)")
commit_params.add_argument('workspace_id_list', type=int, action='append', required=False, location='form', help="할당할 워크스페이스 리스트")
commit_params.add_argument('training_tool_id', type=int, required=True, location='form', help="commit을 시도한 training tool id")
commit_params.add_argument('message', type=str, required=False, location='form', help="commit 할때 등록할 메시지")

copy_params = api.parser()
copy_params.add_argument('image_name', type=str, required=True, location='form', help="이미지 이름")
copy_params.add_argument('description', type=str, required=False, location='form', help="이미지 설명")
copy_params.add_argument('access', type=int, required=True, location='form', help="공개범위 - 워크스페이스(0), 전체(1)")
copy_params.add_argument('workspace_id_list', type=int, action='append', required=False, location='form', help="할당할 워크스페이스 리스트")
copy_params.add_argument('image_id', type=str, required=True, location='form', help="복제하려는 이미지 아이디")

@ns.route("/pull", methods=["POST"])
@ns.response(200, "Success")
@ns.response(400, "Validation Error")
class PullImage(CustomResource):
    @ns.expect(pull_params)
    @token_checker
    def post(self):
        """
        이미지 생성: pull
        ---
        # returns

            result : {
                id (int)
                name (str)
                build type (str)
            }
            message (str)
            status (int)
        """
        args = pull_params.parse_args()
        try:
            image_name = args["image_name"]
            description = args["description"]
            access = args["access"]
            workspace_id_list = args["workspace_id_list"] if args["workspace_id_list"] is not None else []
            url = args["url"]

            res = post_image_by_type(image_name, description, access, workspace_id_list,
                                    user_id=self.check_user_id(), type_="pull", item = {'url' : url})
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

@ns.route("/build", methods=["POST"])
@ns.response(200, "Success")
@ns.response(400, "Validation Error")
class BuildImage(CustomResource):
    @ns.expect(build_params)
    @token_checker
    def post(self):
        """
        이미지 생성: build (Dockerfile + tar)
        tar 파일을 올릴때 압축 해제시, 폴더가 생성되면 안되고 파일들이 바로 나와야함. Dockerfile이 압축 하는 최상위에 있어야됨
        """
        args = build_params.parse_args()
        try:
            """
            <<(변경전) Dockerfile 만 업로드 할때>>
            args = build_params.parse_args()
            image_name = args["image_name"]
            description = args["description"]
            access = args["access"]
            workspace_id_list = args["workspace_id_list"] if args["workspace_id_list"] is not None else []
            file_ = args["file"]
        
            res = post_image_by_type(image_name, description, access, workspace_id_list,
                                    user_id=self.check_user_id(), type_="build", item={'file_' : file_})
            """
            image_name = args["image_name"]
            description = args["description"]
            access = args["access"]
            workspace_id_list = args["workspace_id_list"] if args["workspace_id_list"] is not None else []
            file_ = args["file"]
            chunk_file_name = args["chunk_file_name"]
            end_of_file = args["end_of_file"]
            
            # print("---------------------------------" + "\n" +
            #       "image_name : " + str(image_name) + "\n" +
            #       "access : " + str(access)  + "\n" +
            #       "file : " + str(file_)  + "\n" +
            #       "chunk_file_name : " + str(chunk_file_name) + "\n" +
            #       "end_of_file : " + str(end_of_file) + "\n" +
            #       "-------------------------------------")
            
            res = post_image_by_type(image_name, description, access, workspace_id_list,
                                    user_id=self.check_user_id(), type_="build",
                                    item={"file_":file_, "chunk_file_name":chunk_file_name, "end_of_file":end_of_file})

            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

@ns.route("/tar", methods=["POST"])
@ns.response(200, "Success")
@ns.response(400, "Validation Error")
class TarImage(CustomResource):
    @ns.expect(tar_params)
    @token_checker
    def post(self):
        """
        이미지 생성: tar
        ---
        # returns

            result : {
                id (int)
                name (str)
                build type (str)
            }
            message (str)
            status (int)
        """
        args = tar_params.parse_args()
        try:
            image_name = args["image_name"]
            description = args["description"]
            access = args["access"]
            workspace_id_list = args["workspace_id_list"] if args["workspace_id_list"] is not None else []
            file_ = args["file"]
            chunk_file_name = args["chunk_file_name"]
            end_of_file = args["end_of_file"]
            
            # print("---------------------------------" +
            #       "image_name : " + str(image_name) +
            #       "\nfile : " + str(file_) +
            #       "\nchunk_file_name : " + str(chunk_file_name) +
            #       "\nend_of_file : " + str(end_of_file) +
            #       "-------------------------------------")
            
            res = post_image_by_type(image_name, description, access, workspace_id_list,
                                    user_id=self.check_user_id(), type_="tar",
                                    item={"file_":file_, "chunk_file_name":chunk_file_name, "end_of_file":end_of_file})
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

@ns.route("/commit", methods=["POST"])
@ns.response(200, "Success")
@ns.response(400, "Validation Error")
class CommitImage(CustomResource):
    @ns.expect(commit_params)
    @token_checker
    def post(self):
        """
        이미지 생성: commit
        학습에서 이미지를 커밋하여 새로운 이미지 생성
        ---
        # returns

            result : {
                id (int)
                name (str)
                build type (str)
            }
            message (str)
            status (int)
        """
        args = commit_params.parse_args()
        try:
            image_name = args["image_name"]
            description = args["description"]
            access = args["access"]
            workspace_id_list = args["workspace_id_list"] if args["workspace_id_list"] is not None else []
            training_tool_id = args["training_tool_id"]
            comment = args["message"]

            res = post_image_by_type(image_name, description, access, workspace_id_list,
                                    user_id=self.check_user_id(), type_="commit", item={"training_tool_id" : training_tool_id, "comment" : comment})
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

@ns.route("/copy", methods=["POST"])
@ns.response(200, "Success")
@ns.response(400, "Validation Error")
class CopyImage(CustomResource):
    @ns.expect(copy_params)
    @token_checker
    def post(self):
        """
        이미지 생성: copy
        ---
        # returns

            result : {
                id (int)
                name (str)
                build type (str)
            }
            message (str)
            status (int)
        """
        args = copy_params.parse_args()
        try:
            image_name = args["image_name"]
            description = args["description"]
            access = args["access"]
            workspace_id_list = args["workspace_id_list"] if args["workspace_id_list"] is not None else []
            image_id = args["image_id"]
            
            res = post_image_by_type(image_name, description, access, workspace_id_list,
                                    user_id=self.check_user_id(), type_="copy", item={'image_id' : image_id})
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

# ###############################################################################################
# #################################### 기타 API #################################################
# ###############################################################################################
def get_image_history(image_id):
    """
    도커 이미지 히스토리를 가져옴
    # docker history에서 제공 하는 것 : IMAGE, CREATED(Created At), CREATED BY, SIZE, COMMENT
    """
    try:
        image_info = db.get_image_single(image_id)
        image_status = image_info['status']
        real_name = image_info["real_name"]
        
        # error : 설치되지 않은 이미지
        if image_status != IMAGE_STATUS_READY:
            raise NotExistImageError(image_name=real_name)
        
        # docker history 명령어
        script = """docker history {} --format='{{{{json .}}}}'""".format(real_name)
        result, err = launch_on_host(script)
        if err:
            raise LauncherError
        result = result.split('\n')[:-1]

        res = []
        for tmp in result:
            history = json.loads(tmp)
            if '<missing>' not in history['ID']: # docker history에서 <missing> 다음 히스토리만 가져옴 (missing은 commit 부분 아님) 
                res.append(
                    {
                        'Image ID': history['ID'],
                        'Comment': history['Comment'],
                        'CreatedAt': history['CreatedAt']

                    }
                )
        return response(status=1, message="OK", result=res)
    except CustomErrorList as ce:
        traceback.print_exc()
        raise ce
    except Exception as e:
        traceback.print_exc()
        raise e

history_params = api.parser()
history_params.add_argument('image_id', type=int, required=True, location='args', help='히스토리(=comment) 찾을 DB 이미지 아이디')

@ns.route("/history", methods=["GET"])
@ns.response(200, "Success")
@ns.response(400, "Validation Error")
class ImageHistory(CustomResource):
    @ns.expect(history_params)
    @token_checker
    def get(self):
        """
        조회: 이미지 히스토리
        ---
        # returns
            [
                {'Image ID': 'a951751b0120', 'Comment': '22222222222-by_root', 'CreatedAt': '2022-02-24T16:12:55+09:00'},
                {'Image ID': 'd40df4f95596', 'Comment': '', 'CreatedAt': '2021-01-08T14:37:44+09:00'}
            ]
        """
        args = history_params.parse_args()
        try:
            image_id = args['image_id']
            res = get_image_history(image_id)
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

image_install_log_params = api.parser()
image_install_log_params.add_argument('image_id', type=int, required=True, location='args', help='로그 가져올 이미지 아이디')

@ns.route("/install-log", methods=["GET"])
@ns.response(200, "Success")
@ns.response(400, "Validation Error")
class ImageInstallLog(CustomResource):
    @ns.expect(image_install_log_params)
    @token_checker
    def get(self):
        """
        조회 : 이미지 설치 로그
        ---
        # returns
            {'status': 1, 'message': 'OK',
             'result': ['1.9.0-cuda10.2-cudnn7-runtime: Pulling from pytorch/pytorch', 'eccbe17c44e1: Pulling fs layer', ..., '143f80195431: Pull complete']}
        """
        args = image_install_log_params.parse_args()
        try:
            image_id = args['image_id']
            res = get_image_install_log(image_id)
            return self.send(res)
        except CustomErrorList as ce:
            traceback.print_exc()
            return self.send(ce.response())
        except Exception as e:
            traceback.print_exc()
            return self.send(response(status=0, message=e))

###############################################################################################
#################################### 개발중 ###################################################
###############################################################################################
"""[Download]"""
# save_tar_list = manager.list()
# def save_image_to_tar(iid, real_name):
#     '''
#     다운로드 & tar 파일 정상인지 체크
#     '''
#     try:
#         ''' TODO 
#         host에서 동작시키고 있는 docker save process를 조회 할 수 없어서 우선은 확인 안하는걸로 진행
#         추후 host의 docker save 프로세스 조회용 bin 추가
#         스레드는 X , 안끝난 tar 데이터를 볼 수 있는가 ? - 용량 비교로
#         tar 파일 검증
#         '''
#         # save
#         full_path = "{}/tar/{}.tar".format(HOST_BASE_IMAGE_PATH, iid)
#         script = """docker save -o {} {}""".format(full_path, real_name)
#         launch_on_host(script)
        
#         # 리스트 제거
#         save_tar_list.remove(iid)
#         return
#     except Exception as e:
#         traceback.print_exc()

# def download_tar_file(file):
#     '''save된 이미지 tar 파일 다운로드'''
#     try:        
#         return
#     except Exception as e:
#         traceback.print_exc()

# def get_image_to_tar(image_id):
#     try:
#         image_info = db.get_image_single(image_id=image_id)
#         iid = image_info['iid']
#         real_name = image_info['real_name']
#         image_size = image_info['size']
        
#         find = os.path.isfile('{}/tar/{}.tar'.format(HOST_BASE_DOCKERFILE_PATH, iid))
        
#         # 파일이 저장이 안된 경우
#         if not find:
#             # 스레드 실행 안할때
#             if iid not in save_tar_list:
#                 # 파일저장
#                 save_tar_list.append(iid)
#                 threading.Thread(target=save_image_to_tar, args=(iid, real_name, image_size), daemon=True).start()
#             else: # 스레드 실행 중일때
#                 # 리턴: 스레드 실행 중일때 다운로드를 누르면, 다운로드 중임을 보여주기
#                 return response(status=1, message="saving", result=None)
            
#         # TODO 다운로드
#         # download_tar_file(file)
        
#         # 리턴: OK를 받으면 다운로드 & 다운로드 가능으로 프론트 변경
#         return response(status=1, message="OK", result=None)  
#     except Exception as e:
#         traceback.print_exc()
#         return response(status=0, message=e, result=None)  

# download_params = api.parser()
# download_params.add_argument('image_id', type=int, required=True, location='args', help='다운로드 할 이미지 아이디')

# @ns.route('/download', methods=["GET"])
# @ns.response(200, 'Success')
# @ns.response(400, 'Validation Error')
# class ImageDownload(CustomResource):
#     @ns.expect(download_params)
#     @token_checker
#     def get(self):
#         '''
#         개발중입니다
#         '''
#         args = download_params.parse_args()
#         try:
#             image_id = args['image_id']
#             res = get_image_to_tar(image_id)
#             return self.send(res)
#         except CustomErrorList as ce:
#             traceback.print_exc()
#             return self.send(ce.response())
#         except Exception as e:
#             traceback.print_exc()
#             return self.send(response(status=0, message=e))
# def raise_error():
#     try:
#         raise CreateImageError
#     except Exception as e:
#         traceback.print_exc()
#         raise e

###############################################################################################
"""[pip 관련 함수]"""
# def compare_pip_images(images):
#     """ 두 이미지의 pip 패키지 비교
#     input : [imageid1, imageid2] (image_id는 DB 이미지 id가 아닌, docker를 실행했을때 나오는 id)
#     """
#     try:
#         image_package_dict = dict()
#         compare_dict = {i : [] for i in images}

#         # 2. pip 출력 -> [{pkg : ver}, ...] 딕셔너리
#         def get_package_list(output):
#             package_dict = dict()
#             for i in output:
#                 package = i.split()
#                 if not package or package[0] == "Package" or '----' in package[0]:
#                     continue
#                 package_dict[package[0]] = package[1]
#             return package_dict

#         # 1. 이미지에서 pip 조회
#         for i in images:
#             cmd = """ docker run --rm  -i --entrypoint="/bin/bash" {} -c "pip list --disable-pip-version-check" """.format(i)
#             output = launch_on_host(cmd=cmd)
#             output = ''.join(output[0]).split('\n')
#             package_list = get_package_list(output)
#             image_package_dict[i] = package_list

#         # 3. 첫번째 이미지 pip 패키지 하나씩 꺼내면서 비교 
#         for pkg, ver in image_package_dict[images[0]].items():
#             if pkg in image_package_dict[images[1]]:
#                 # 패키지 버전이 다르면, compare_dict에 추가
#                 if ver == image_package_dict[images[1]][pkg]:
#                     image_package_dict[images[1]].pop(pkg)
#             # 패키지 없으면, compare_dict에 추가
#             else:
#                 compare_dict[images[0]].append({pkg : ver})

#         # 두번째 이미지에서 남은 이미지 compare_dict에 추가
#         if image_package_dict[images[1]]:
#             for pkg, ver in image_package_dict[images[1]].items():
#                 compare_dict[images[1]].append({pkg : ver})
#         return compare_dict
#     except Exception as e:
#         traceback.print_exc()
#         raise e

# def check_req_pip(image_id, pip_list):
#     """pip 목록을 불러옴"""
#     try:
#         cmd = """ docker run --rm -i --entrypoint="/bin/bash" {} -c "pip list --disable-pip-version-check" """.format(image_id)
#         output = launch_on_host(cmd=cmd)
#         pkg = [tmp.split()[0] for tmp in ''.join(output[0]).split('\n') if tmp]
        
#         res = dict()
#         for pip in pip_list:
#             if pip in pkg:
#                 res[pip] = True
#             else:
#                 res[pip] = False
#         return res
#     except Exception as e:
#         traceback.print_exc()
#         raise e

###############################################################################################
"""
[private docker login]
master : request worker API - 워커 노드에 JFB 레지스트리가 로그인 되어 있는지 확인
worker : check_login_registry 함수 실행 - *docker run 할때, -v /root/.docker:/root/.docker 마운트가 되어있어야 함.
master : post_login_jfb_registry - 로그인 안된경우, ip 받아서 launcher 통해 로그인 실행
"""
# def check_login_registry(registry_url=None):
#     """
#     JFB 레지스트리가 로그인 되어 있는지 확인
#     auth file example)
#     {
#         "auths": {
#             "192.168.1.11:32000": {
#                 "auth": "dGVzdHVzZXI6dGVzdHBhc3N3b3Jk"
#             },
#             "192.168.1.11:5000": {
#                 "auth": "dXNlcjI6cGFzc3dvcmQ="
#             }
#         }
#     }
#     """
#     import os.path
#     try:
#         file = os.getenv("HOME") + "/.docker/config.json"
#         with open(file, "r") as f:
#             data = f.read()
#         data = json.loads(data)
#         login_list = list(data["auths"].keys())
        
#         # 찾고하자는 url이 리스트에 있는 경우 True
#         if registry_url in login_list:
#             return True
#         return False
#     except Exception as e:
#         traceback.print_exc()

# def post_login_jfb_registry(node_ip, registry_url, username, password):
#     """
#     JFB 레지스트리에 로그인
#     다른 방법 : --password-stdin (파일 만들어서 입력) - docker login -u ... --password-stdin < ~/file 
#     """
#     try:
#         cmd = """docker login -u {} -p {} {}""".format(username, password, registry_url)
#         stdout, stderr = launch_on_host(cmd=cmd, host=node_ip, ignore_stderr=True)

#         if "because it doesn't contain any IP SANs" in stderr:
#             print("Check /etc/docker/cert.d or Run setting_insecure.sh at worker")
#             return False
#         elif "failed with status: 401 Unauthorized" in stderr:
#             print("Check your username or password")
#             return False
#         elif "Login Succeeded" in stdout:
#             return True
#         return False
#     except Exception as e:
#         traceback.print_exc()
#         return False

###############################################################################################
# def get_image_library_by_user(image_id, command):
#     """특정 이미지로 실행한 컨테이너에서 입력받은 커맨드를 실행"""
#     try:
#         # 라이브러리 검증 -> 일단 API 사용 안하는 방향 (API 는 주석처리함)

#         # result = launch_command_in_container(image_id, command)
#         # real_name = db.get_image_single(image_id)["real_name"]
#         real_name = db.get_image(image_id)["real_name"]        
#         script = """docker run --rm -i --entrypoint="/bin/bash" {} -c "echo JFB_START_LINE;" """.format(real_name)
#         script = script.strip()[:-1]
#         script += """
#                     {}"
#                     """.format(command)
#         res, error = launch_on_host(script, ignore_stderr=True)
#         res = res.split('\n')[:-1]

#         for _ in range(len(res)):
#             if res.pop(0) == 'JFB_START_LINE':
#                 break
#         if not res:
#             res = "No results"
#         return response(status=1, message="OK", result=res)
#     except Exception as e:
#         traceback.print_exc()
#         raise LauncherError
#         # return response(status=0, message=error, result=None)

# def update_image_library(image_id, image_library):
#     """
#     inputs
#         image_library : [{'name': 'torch', 'version': '1.7.1+cu110'}, {'name': 'cuda', 'version': '11.0'}]
#     """
#     try:
#         db.update_image_data(image_id=image_id, data={"libs_digest" : image_library})
#         return response(status=1, message="OK", result=None)
#     except CustomErrorList as ce:
#         traceback.print_exc()
#         raise ce
#     except Exception as e:
#         traceback.print_exc()
#         raise e

# library_params = api.parser()
# library_params.add_argument('image_id', type=int, required=True, location='json', help='라이브러리 찾을 DB 이미지 아이디')
# library_params.add_argument('command', type=str, required=True, location='json', help='library 찾는 명령어')

# library_update_params = api.parser()
# library_update_params.add_argument('image_id', type=int, required=False, location='json', help="수정 : 워크스페이스")
# library_update_params.add_argument('library', type=list, required=False, location='json', help="수정 : 워크스페이스")

# @ns.route("/user-library", methods=["PUT"]) # GET X -> command issue
# @ns.response(200, "Success")
# @ns.response(400, "Validation Error")
# class ImageUserLibrary(CustomResource):
#     @ns.expect(library_params)
#     @token_checker
#     def get(self):
#         """
#         조회: 사용자가 원하는 라이브러리
#         사용자가 원하는 라이브러리를 찾는 명령어를 입력하여 정보 조회
#         ---
#         ## returns

#             status  (int)
#             message (str)
#             result  (None)
#         """
#         args = library_params.parse_args()
#         try:
#             image_id = args['image_id']
#             command = args['command']
#             res = get_image_library_by_user(image_id, command)
#             return self.send(res)
#         except CustomErrorList as ce:
#             traceback.print_exc()
#             return self.send(ce.response())
#         except Exception as e:
#             traceback.print_exc()
#             return self.send(response(status=0, message=e))

#     @ns.expect(library_update_params)
#     @token_checker
#     def put(self):
#         """
#         수정: 사용자가 라이브러리 버전 정보를 직접 입력하여 수정
#         ---
        
#         ## inputs
#             library : dict in list
#             key of dictionary : 'name', 'version'
        
#         ## input example
#             [{'name': 'torch', 'version': '1.7.1+cu110'}, {'name': 'cuda', 'version': '11.0'}]

#         ## returns

#             status  (int)
#             message (str)
#             result  (None)
#         """
#         args = library_update_params.parse_args()
#         try:
#             image_id = args["image_id"]
#             library = args["library"]
#             res = update_image_library(image_id=image_id, image_library=library)
#             return self.send(res)
#         except CustomErrorList as ce:
#             traceback.print_exc()
#             return self.send(ce.response())
#         except Exception as e:
#             traceback.print_exc()
#             return self.send(response(status=0, message=e))

###############################################################################################
# def get_image_system_info(image_id):
#     """
#     이미지에 설치된 여러 시스템 정보를 확인 (패키지 추가 예정)
#     -> whami, curl, pip
#     ---
#     # returns
#         {
#             command(str) : result(list, 없는 경우 ['Not installed'])
#         }

#         {
#             'whoami' : ['root'],
#             'curl': ['....'],
#         }
#     """
#     try:
#         real_name = db.get_image(image_id)["real_name"]

#         # pip 체크
#         pip = """pip3"""
#         script = """docker run --rm -i --entrypoint="/bin/bash" {} -c pip3; """.format(real_name)
#         try:
#             result, error = launch_on_host(cmd=script)
#         except:
#             pip = """pip"""

#         # command
#         """
#         찾을 명령어 추가할 경우,
#         ---
#         echo start 명령어;
#         명령어;
#         echo end 명령어;
#         """
#         command = """echo start whoami;
#                     whoami;
#                     echo end;

#                     echo start curl;
#                     curl --version;
#                     echo end;

#                     echo start {};
#                     {} freeze;
#                     echo end;""".format(pip, pip)

#         # launcher
#         script = """docker run --rm -i --entrypoint="/bin/bash" {} -c " """.format(real_name)
#         script += """
#                     {}"
#                     """.format(command)
#         results, error = launch_on_host(script, ignore_stderr=True)

#         # parsing
#         value = []
#         res = {}
#         for result in results.split('\n'):
#             # print(result)
#             if "start" in result:
#                 key = result.split(' ')[1]
#             elif result == "end":
#                 if not value:
#                     value = ["Not installed"]

#                 res.update({key: value})
#                 value = []
#             else:
#                 value.append(result)
#         return response(status=1, message="OK", result=res)
#     except Exception as e:
#         traceback.print_exc()
#         raise e

# imgsys_params = api.parser()
# imgsys_params.add_argument('image_id', type=int, required=True, location='args', help='정보를 찾을 DB 이미지 아이디')

# @ns.route("/img-system", methods=["GET"])
# @ns.response(200, "Success")
# @ns.response(400, "Validation Error")
# class ImageSystemInfo(CustomResource):
#     @ns.expect(imgsys_params)
#     @token_checker
#     def get(self):
#         """
#         조회: 이미지의 여러 정보 (라이브러리 외 다른 정보들)
#         ---
#         ## returns

#             status  (int)
#             result  (str)
#             message (str)
#         """
#         args = imgsys_params.parse_args()
#         try:
#             image_id = args['image_id']
#             res = get_image_system_info(image_id)
#             return self.send(res)
#         except CustomErrorList as ce:
#             traceback.print_exc()
#             return self.send(ce.response())
#         except Exception as e:
#             traceback.print_exc()
#             return self.send(response(status=0, message=e))

###############################################################################################
# def get_unused_image():
#     """사용하지 않는 이미지 : 시스템에 설치된 이미지 중 (db에 없는 이미지 && container 동작을 하지 않는 이미지)"""
#     try:
#         script = """docker images -q""" # --quiet, -q : Only show image IDs
#         result, *_ =  launch_on_host(script)
#         sys_iid = result.split('\n')[:-1]

#         db_iid = db.get_db_iid_list() # db 이미지

#         script = """docker ps -a --filter status=running --format \"{{.Image}}\" """
#         res, *_ = launch_on_host(script)
#         running_container_iid = res.split('\n')[:-1] # container 동작 중인 이미지

#         # 전체 이미지 - db 이미지 - container 동작 중인 이미지
#         result = [item for item in sys_iid if item not in db_iid and item not in running_container_iid]
#         return response(status=1, message="OK", result=result)
#     except Exception as e:
#         traceback.print_exc()
#         raise e

# @ns.route("/unused-img", methods=["GET"])
# @ns.response(200, "Success")
# @ns.response(400, "Validation Error")
# class UnusedImage(CustomResource):
#     @token_checker
#     def get(self): 
#         """
#         조회: 사용되지 않는 이미지 조회
#         ---
#         ## returns

#             status  (int)
#             message (str)
#             result  (str) : ["9c97225e83c8", "3c9cc1350476", ...]
#         """
#         try:
#             res = get_unused_image()
#             return self.send(res)
#         except CustomErrorList as ce:
#             traceback.print_exc()
#             return self.send(ce.response())
#         except Exception as e:
#             traceback.print_exc()
#             return self.send(response(status=0, message=e))

###############################################################################################
# def check_running_image(real_name, host=None):
#     """시스템에서 container가 image를 사용 중인지 확인"""
#     try:
#         script = """docker ps --filter ancestor={} --filter status=running --format '{{{{json .}}}}' """.format(real_name)
#         result, *_ = launch_on_host(script, host)
#         result = result.split('\n')[:-1]
#         return True if result else False
#     except Exception as error:
#         traceback.print_exc()

# def check_devicequery(real_name):
#     """
#     image 테스트 : 1. 컨테이너 실행, 2. image deviceQuery Test(GPU 사용 가능성 테스트)
#     /bin/bash 안되는 이미지 (busybox, alpine) -> /bin/sh (bash 스크립트 안됨(devicequery x))
#     /bin/sh: ./deviceQuery: not found (bash가 안됨)
#     apk add --no-cache bash
    
#     if not check_devicequery(real_name=real_name):
#         raise InstallImageError(reason="Can not running container by this image")    
    
#     reason =>  can't -> db update 값 중 sql에 "'" 포함되면 에러
#     """
#     try:
#         # 도커 테스트
#         cmd = """docker run --rm -i -v /jfbcore/test_tool:/test_tool --entrypoint="/bin/bash" {} \
#               -c /test_tool/image_gpu/deviceQuery""".format(real_name)
#         res, err = launch_on_host(cmd=cmd, ignore_stderr=True)

#         # print("res -> ", res)
#         # print("err -> ", err)

#         # 결과
#         if len(res) >= 2:
#             if res.split('\n')[-2] == "Result = PASS":
#                 return True
#             if res.split('\n')[-2] == "Result = FAIL":
#                 return True # 도커 실행 O
#         else:
#             # id_ = db.get_image_id_by_name(real_name)
#             # db.update_image_data(image_id=id_, data={"status" : 3, "fail_reason" : "unsatisfied driver version, or use an earlier cuda container"})
#             return False # 도커 실행 X
#     except Exception as e:
#         traceback.print_exc()
#         print(e)

###############################################################################################
# def error():
#     try:
#         raise CreateImageError
#     except CustomErrorList as ce:
#         traceback.print_exc()
#         raise ce
#     except Exception as e:
#         traceback.print_exc()
#         return e

# @ns.route("/error", methods=["GET"])
# @ns.response(200, "Success")
# @ns.response(400, "Validation Error")
# class ErrorImage(CustomResource):
#     @token_checker
#     def get(self): 
#         try:
#             raise GetAdminDashboardError
#             res = response(status=1, message="OK", result=None)
#             return self.send(res)
#         except CustomErrorList as ce:
#             traceback.print_exc()
#             return self.send(ce.response(status=1, message="zzz"))
#         except Exception as e:
#             traceback.print_exc()
#             return self.send(response(status=0, message=e))
