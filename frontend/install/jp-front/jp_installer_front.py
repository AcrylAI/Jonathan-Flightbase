import os
import argparse
import sys
from subprocess import PIPE, run

def system_out(command):
    result = run(command, stdout=PIPE, stderr=PIPE, universal_newlines=True, shell=True)
    return result.stdout



def str2bool(v):
    if isinstance(v, bool):
       return v
    if v.lower() in ('yes', 'true', 't', 'y', '1'):
        return True
    elif v.lower() in ('no', 'false', 'f', 'n', '0'):
        return False
    else:
        raise argparse.ArgumentTypeError('Boolean value expected.')

def install_front(params):
  print("====================JP FRONT INSTALLER====================")
  print("배포 하실 패키지를 선택해주세요.")
  print("1.전체 (개발 중), 2.포탈, 3.연합 학습, 0.나가기")
  choice = int(sys.stdin.readline())

  if choice == 1 :
    print('개발 중인 기능입니다.') 
    sys.exit()
  elif choice == 0:
    print('Installer를 종료합니다.')
    sys.exit()
  else :
    if choice > 3 :
      print('잘못된 번호입니다.')
      sys.exit()
  
    
  install_cmd = './install/jp-front/installer.sh -c {install_package} -i {master_ip} -p  {protocol} -a {api_port} -s {stand_alone}'.format(
    install_package=choice,
    master_ip=params["master_ip"],
    protocol=params["protocol"] ,
    api_port=params["api_port"],
    stand_alone=params["stand_alone"],
  )
  os.system("chmod +x ./installer.sh")
  os.system("cd ../../; {cmd}".format(cmd=install_cmd))
  print("====================JP FRONT INSTALL ENDED====================")

  
# 실행 인자 파싱 (flag parse)
parser = argparse.ArgumentParser()
# 필수 옵션
parser.add_argument('--master_ip',type=str, required=True, help="실행 서버의 ip를 입력해주세요.")
parser.add_argument('--api_port', type=str, required=False, help="API의 포트를 지정해주세요.")
# 선택 옵션
parser.add_argument('--protocol', type=str, required=False, default="http", help="연결 프로토콜을 결정해주세요. (http | https)")
parser.add_argument('--stand_alone', type=str2bool, required=False, default=False, help="단독 설치 여부를 설정해주세요. ('yes', 'true', 't', 'y', '1' | 'no', 'false', 'f', 'n', '0')")
params, _ = parser.parse_known_args()
params = vars(params)
install_front(params)
