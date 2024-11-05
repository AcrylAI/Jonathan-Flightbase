import utils.db as db
import utils.common as common

import time
import re
import os
import sys
sys.path.insert(0, os.path.abspath('..'))
from settings import *
from TYPE import *

# NGINX DATA FORM ex
# [{'time_local': '2022-09-27T10:58:32+00:00',
#   'remote_addr': '10.44.0.0',
#   'remote_user': '',
#   'request': 'POST / HTTP/1.1',
#   'status': '200',
#   'body_bytes_sent': '74',
#   'request_time': '0.265',
#   'http_referrer': 'http://localhost:3000/',
#   'http_user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'},
#  {'time_local': '2022-09-27T10:58:39+00:00',
#   'remote_addr': '10.44.0.0',
#   'remote_user': '',
#   'request': 'POST / HTTP/1.1',
#   'status': '200',
#   'body_bytes_sent': '74',
#   'request_time': '0.069',
#   'http_referrer': 'http://localhost:3000/',
#   'http_user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'},
# ]
class PodNginxInfo:
    # Deployment Worker 만 갖는 정보
    def __init__(self, deployment_worker_id):
        self.deployment_worker_id = deployment_worker_id 
        self.workspace_name, self.deployment_name = self._get_init_info(deployment_worker_id=deployment_worker_id)
        self.nginx_log_data = None

    def _get_init_info(self, deployment_worker_id):
        deployment_worker_info = db.get_deployment_worker(deployment_worker_id=deployment_worker_id)
        if deployment_worker_info is None:
            raise Exception("Deployment Worker Not Exist")

        workspace_name = deployment_worker_info["workspace_name"]
        deployment_name = deployment_worker_info["deployment_name"]

        return workspace_name, deployment_name


    def update_nginx_log_data(self):
        nginx_log_file_path = GET_POD_NGINX_ACEESS_LOG_FILE_PATH_IN_JF_API(workspace_name=self.workspace_name, deployment_name=self.deployment_name, 
                                                                            deployment_worker_id=self.deployment_worker_id)

        # TODO nginx 전용 data loader - 로그가 너무 커지면 메모리 부담 + 아주 예전 데이터를 사용할 필요성이 없을 수 있음
        # ex)
        # 콜 개수 (가장 앞에서 부터 XX개, 마지막에서 부터 XX개)
        # 시간 범위 (1시간 전 까지)
        self.nginx_log_data = common.load_json_file_to_list(file_path=nginx_log_file_path)

    def get_nginx_log_data(self):
        # nginx 데이터는 시간 순으로 쌓임
        # 마지막 줄이 최신 데이터
        if self.nginx_log_data is None:
            self.update_nginx_log_data()

        return self.nginx_log_data


    def _get_relative_index(self, first_index, time_local, time_interval):
        time_local_ts = int(common.date_str_to_timestamp(time_local))
        return time_local_ts//time_interval - first_index

    def _get_absolute_index(self, time_local, time_interval):
        time_local_ts = int(common.date_str_to_timestamp(time_local))
        return time_local_ts//time_interval

    def _get_current_time_absolute_index(self, time_local, time_interval, current_timestamp=None):
        # correction_timestamp = self._get_correction_timestamp(time_local) #TODO 삭제 예정. 불필요해짐 (2022-10-24 Yeobie)
        if current_timestamp is None:
            current_timestamp = time.time()
        current_ts = int(current_timestamp) #+ correction_timestamp # UTC 기준에서 nginx log tz 시간 보정 #TODO 삭제 예정. 불필요해짐 (2022-10-24 Yeobie)
        return current_ts//time_interval

    # TODO 불필요해짐. common.date_str_to_timestamp - return 값을 무조건 UTC 기준의 timestamp로 변형하기에 (2022-10-24 Yeobie)
    def _get_correction_timestamp(self, time_local):
        """
            Description : nginx log가 찍히는 데이터의 tz이 서로 다를 수 있기 때문에 현재 시간으로 사용하는 값(UTC 기준)에서 얼마나 시간 보정을 해야하는지 알려주는 함수
            Args:
                time_local (str) : nginx log에 있는 call 정보 중 time_local 값 ex) 2022-10-13T13:29:12+00:00
            Return:
                (int) : 초 값이며 UTC기준에서 nginx tz값으로 변환하기 위한 보정 값. ex) +09:00 -> +32400
        """

        # log_data로 부터 TZ 데이터 얻어서 보정
        # 동일 시간에 tz만 다르게 하여 실행한 경우 nginx time_local을 date_str_to_timestamp에 실행 시 
        # 2022-10-13T04:29:12+00:00 -> 1665635352.0
        # 2022-10-13T13:29:12+09:00 -> 1665667752.0
        # TZ 보정은 별도로 해야함
        #    2022-10-13T13:29:12+00:00 1665667752.0
        #    2022-10-13T13:29:12+09:00 1665667752.0
        # -> time.time() 결과 값은 UTC로 나오기 때문에 NGINX에서 나온 TZ 값을 확인하여 보정 필요
        m = re.search(pattern="[-+]..:..", string=time_local)
        if m is None:
            raise Exception("Unexpect Time Local - [{}]".format(time_local))

        tz_value = m.group()
        symbol = tz_value[0]
        hour, minute = tz_value[1:].split(":")
        hour = int(hour)
        minute = int(minute)

        if symbol == "-":
            return -1 * ( hour * 3600 + minute * 60 ) 
        elif symbol == "+":
            return 1 * ( hour * 3600 + minute * 60 ) 
        else:
            raise Exception("Unexpect Symbol(+,-) - [{}]".format(symbol))

    def _get_base_list(self, log_data, time_interval, default_value=None, current_timestamp=None):
        """
            Description : Nginx log 데이터의 첫 데이터 시간 ~ 현재 시간을 time interval 값만큼 배열화
                        과거 데이터가 0번 인덱스 부터 채워짐
                        ex) 총 1시간 길이에 time_interval=60 이면 총 길이 60개의 배열 생성
                        ex) 총 1시간 길이에 time_interval=1 이면 총 길이 3600개의 배열 생성
            Args :
                log_data (list) : aip가 load한 nginx log의 call list
                time_interval (int) : 시간 간격 (초)
                default_value (any) : 배열 생성 시 각 인덱스 마다의 기본 값
        """
        if log_data == None:
            raise Exception("Log empty.")
        if len(log_data) == 0:
            raise Exception("Log empty.")
        
        first_index = self._get_absolute_index(log_data[0]["time_local"], time_interval)
        last_index = self._get_absolute_index(log_data[-1]["time_local"], time_interval)
        
        current_index = self._get_current_time_absolute_index(time_local=log_data[-1]["time_local"], time_interval=time_interval, current_timestamp=current_timestamp)
        
        if first_index > current_index:
            raise Exception("Log time wrong. - Current time is earlier than start time")
        
        
        base_list = [ default_value ] * (current_index - first_index + 1)
        return base_list

    def get_call_count_per_time_interval(self, time_interval, current_timestamp=None):
        """
            Description : Nginx에 기록된 API로 들어온 Call을 특정 시간 간격으로 그 사이의 개수 내려주는 함수
            Args :
                time_interval (int) : 시간 간격
                current_timestamp (float) : 이 함수를 실행 했을 때 특정 시간을 현재 시간으로 두는 경우. Worker가 여러개일 때 실행 시점마다 시간이 몇초라도 다를 수 있기 때문에 ex) timestamp time.time() - 1665633963.1319203 
        """
        # NGINX 로그 상 TZ을 고려해서 만들어야 함

        log_data = self.get_nginx_log_data()
        base_list = self._get_base_list(log_data=log_data, time_interval=time_interval, default_value=0, current_timestamp=current_timestamp)
        first_index = self._get_absolute_index(log_data[0]["time_local"], time_interval)
        
        for log in log_data:
            relative_index = self._get_relative_index(first_index=first_index, time_local=log["time_local"], time_interval=time_interval)
            if len(base_list) <= relative_index:
                # current_timestamp가 last_index 보다 짧은 경우 스킵
                continue
            base_list[relative_index] += 1
            
        return base_list


    # TODO
    # 1. 특정 시간 내 call 양 
    # 2. 특정 시간 내 call 당 처리 시간 평균 
    # 3. 특정 시간 내 성공 비율 (200번대 300번대를 제외한 status 코드를 에러로 보고 ?) 
    # 1,2,3 모두 초 or 분 단위 지정 가능하도록

    def get_XXX(self):
        nginx_log_data = self.get_nginx_log_data()

        # TODO

        return 