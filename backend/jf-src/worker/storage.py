import subprocess
import os
import json
import traceback
import settings
from restplus import api
from utils.resource import CustomResource, token_checker, response

ns = api.namespace('', description='Worker API')

def parsing_path(path):
    # /폴더명/.../...
    if path[0] != "/":
        path = "/" + path # '/' 맨앞에 없으면 붙여줌
    if path[-1] == "/":
        path = path[:-1] # '/' 맨 뒤에 있으면 삭제

    # PATH 확인
    if settings.MAIN_STORAGE_PATH == path and path == "/jfbcore":
        test_path = "/jf-data"
    else:
        test_path = "/jf-storage{}".format(path) # worker storage -> pv 변경 예정
        if not os.path.isdir(test_path):
            test_path = "/jf-storage"

    tmp_test_file_name = test_path.replace('/', '_')
    host_name = "_" + os.popen("echo $HOSTNAME").read().strip()
    log_file_path = "/test_tool/fio_test/log" + host_name + tmp_test_file_name + ".log"
    return test_path, log_file_path

def get_storage_benchmark_fio(path):
    """storage benchmark fio 테스트를 실행하여 결과를 내려줌"""
    try:
        # 0. path
        test_path, log_file_path = parsing_path(path)

        # 1. install
        # command = """cd /test_tool/fio_test; python3 fio_bench.py {} {}""".format(test_path, log_file_path)
        command = "/test_tool/fio_test/fio_install.sh"
        res = subprocess.call(command, shell=True)
        if res != 0:
            return 1 # Package Install error
        print("installed fio package")
        
        # 2. Test
        print("start fio test")
        command = """cd /test_tool/fio_test/ ; python3 /test_tool/fio_test/fio_bench.py {} {}""".format(test_path, log_file_path)
        process = subprocess.call(command, shell=True)
        
        if process != 0:
            return 2 # Execute Command error

        # 3. Result
        res = {
                'Read-WithBuffer-Rand': None,
                'Write-WithBuffer-Rand': None,
                'Read-WithoutBuffer-Rand': None,
                'Write-WithoutBuffer-Rand': None
            }
        
        with open(log_file_path, "r") as f:
            for i in f.read().split('\n'):
                # 헤더(처음), 공백(마지막)
                # data header : case,size/numjobs/bs,Readtotal,runtime,iops,speed
                if i.startswith("case") or i == "":
                    continue

                # data
                data = i.split(',') 
                if data[0] not in res.keys() or len(data) != 6:
                    continue
                res[data[0]] = {
                    "speed" : "{:.2f}".format(float(data[-1])),
                    "iops" : "{:.2f}".format(float(data[-2])),
                    "runtime" : "{:.2f}".format(float(data[-3]))
                }
        return res
    except Exception as e:
        traceback.print_exc()
        return False
    
get_storage_benchmark_fio_params = api.parser()
get_storage_benchmark_fio_params.add_argument('path', type=str, required=True, location='args', help="fio 실행 디렉토리 리스트")
@ns.route("/fio-check", methods=["GET"])
@ns.response(200, "Success")
@ns.response(400, "Validation Error")
class StorageBenchmark(CustomResource):
    @token_checker
    @ns.expect(get_storage_benchmark_fio_params)
    def get(self):
        """ Worker에서 fio storage benchmark 스크립트 실행
        # Input (list)
            [/jfb-src/master, /jfb-src/worker]
        
        # result
        ---------
        {
            "Read-WithBuffer-Rand": {
                "speed(MiB/s)": "26.09",
                "iops": "6679.63",
                "runtime": "10.00"
            },
            "Write-WithBuffer-Rand": {
                "speed(MiB/s)": "145.17",
                "iops": "37162.46",
                "runtime": "7.05"
            },
            "Read-WithoutBuffer-Rand": {
                "speed(MiB/s)": "20.70",
                "iops": "5298.67",
                "runtime": "10.00"
            },
            "Write-WithoutBuffer-Rand": {
                "speed(MiB/s)": "139.19",
                "iops": "35631.92",
                "runtime": "7.36"
            }
        }
        """
        try:
            args = get_storage_benchmark_fio_params.parse_args()
            path = args["path"]
            res = get_storage_benchmark_fio(path)
            if type(res) != dict:
                return response(status=0, result=res, messeage="error")
            return response(status=1, result=res)
        except Exception as e:
            traceback.print_exc()
            return response(status=0, result=e)