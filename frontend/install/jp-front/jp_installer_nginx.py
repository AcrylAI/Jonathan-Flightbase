import os
import argparse
import sys
from subprocess import PIPE, run

def system_out(command):
    result = run(command, stdout=PIPE, stderr=PIPE, universal_newlines=True, shell=True)
    return result.stdout

def check_dependency():
  nginx = system_out('docker ps | grep jp-front-nginx')
  if nginx.find('jp-front-nginx') != -1 :
      return True 
  else:
      return False

def install_front(params):
    dependency = check_dependency()    
    if dependency is True :
        print("이미 설치되어있습니다.")    
        sys.exit() 

    print("====================JP NGINX INSTALLER====================")
    install_cmd = './install/jp-front/installer-nginx.sh -i {master_ip} -p {protocol}'.format(
        master_ip=params["master_ip"],
        protocol=params["protocol"]
      )
    os.system("chmod +x ./installer-nginx.sh")
    os.system("chmod +x ./nginx/init.sh")
    os.system('cd ../../; {cmd}'.format(cmd=install_cmd))
    print("====================JP NGINX INSTALL ENDED================")

  
# 실행 인자 파싱 (flag parse)
parser = argparse.ArgumentParser()
# 필수 옵션
parser.add_argument('--master_ip',type=str, required=True, help="실행 서버의 ip를 입력해주세요.")
# 선택 옵션
parser.add_argument('--protocol', type=str, required=False, default="http", help="연결 프로토콜을 결정해주세요. (http | https)")
params, _ = parser.parse_known_args()
params = vars(params)
install_front(params)
