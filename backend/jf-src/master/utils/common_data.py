import traceback
import os
import subprocess
import sys
import multiprocessing
from utils.exceptions import *
import settings

class DiskUsage():
    

    def __init__(self, path):
        self._path = path
        self._flag=False

    @property
    def used(self):
        if self._flag == False:
            self._used = subprocess.run(["du -b -s {} ".format(self._path)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').stdout.split('\t')[0]
            self._flag = True
        return self._used


class DeviceInfo:
    
    def __init__(self, path):
        self._path = path
        self._flag = False

    def _is_init(self):
        
        if self._flag == False:
            
            # filter 함수 filter(func, iterable object)
            # func -> 조건 및 필터링할 string
            # iterable object -> 반복이 가능한 객체
            # psutil도 비슷한 값들을 조회하며 더 빠르지만 loop device를 psutil 에서 바로 사용할 방법이 없어서 df를 사용
            disk_info = list(filter(None, subprocess.run(["df -T --block-size=1 {}".format(self._path)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').stdout.split('\n')[1].split(' ')))
            self._device = disk_info[0]
            self._fstype = disk_info[1]
            self._size = int(disk_info[2])
            self._used = int(disk_info[3])
            self._avail = int(disk_info[4])
            self._pcent = disk_info[5]

            self._flag = True

    def get_device_usage_form(self):
        """
            return {                         
                    "device": "/dev/sda",
                    "fstype": "ext4",
                    "size": "1967847137280",
                    "used": "1093632",
                    "avail": "1867809320960",
                    "pcent": "1%",
                    "allocation_pcent": "1%" 
                } 
        """
        self._is_init()
        return {
            "device" : self._device,
            "fstype" : self._fstype,
            "size" : self._size,
            "used" : self._used,
            "avail" : self._avail,
            "pcent" : self._pcent
        }
    
    @property
    def device(self):
        """
            return /dev/sda -> str
        """
        self._is_init()
        return self._device
    
    @property
    def fstype(self):
        """
            return ext4(overlay, nfs ...) -> str
        """
        self._is_init()
        return self.fstype
    
    @property
    def size(self):
        """
            return 134315915(byte) -> int
        """
        self._is_init()
        return self.size
    
    @property
    def used(self):
        """
            return 13513(byte) -> int
        """
        self._is_init()
        return self.used
    
    @property
    def avail(self):
        """
            return 123451(byte) -> int
        """
        self._is_init()
        return self.avail
    
    @property
    def pcent(self):
        """
            return 7%(str)
        """
        self._is_init()
        return self.pcent 

class PathCount: #이름 수정
    
    def __init__(self, path):
        self._path = path
        self._flag = False
        

    def is_init(self):
        if self._flag == False :
            # tree binary file import
            # docker image에 tree 패키지가 설치되어있지 않아서 tree package를 binary로 사용
            from PATH import TREE_BINARY_PATH
            dir_count, file_count = subprocess.run(['{} -a {} | tail -1'.format(TREE_BINARY_PATH, self._path)],stdout= subprocess.PIPE,shell=True,encoding = 'utf-8').stdout.split(', ')
            self._dir = dir_count.split(' ')[0]
            self._file = file_count.split(' ')[0]
            self._flag = True
    
    @property
    def dir_count(self):
        """
            return 1234 -> int
        """
        self.is_init()
        
        return self._dir

    @property
    def file_count(self):
        """
            return 1234 -> int
        """
        self.is_init()
        return self._file

class AllPathInfo():
    """
        path 만 입력하여 정보를 조회하는 클래스

        정보의 종류
            disk usage
            device info, usage
            file count
            directory count
    """
    def __init__(self, path):
        self._diskusage = DiskUsage(path=path)
        self._pathcount =PathCount(path=path)
        self._deviceinfo = DeviceInfo(path=path)
        self._path = path

    @property
    def path(self):
        return self._path

    #사용량 리턴(int)
    def get_disk_usage(self):
        return self._diskusage.used 

    #해당 경로의 폴더 갯수(int)
    def get_dir_count(self):
        return self._pathcount.dir_count

    #dir일 경우 dir에 들어있는 전체 파일 갯수(int)
    def get_file_count(self):
        return self._pathcount.file_count

    #디바이스 정보 및 사용량을 json으로 리턴
    def get_device_info(self):
        return self._deviceinfo.get_device_usage_form()
