import os
import argparse
import sys

from subprocess import PIPE, run

def system_out(command):
    result = run(command, stdout=PIPE, stderr=PIPE, universal_newlines=True, shell=True)
    return result.stdout

def check_dependency():
  nginx = system_out('which nginx')
  docker = system_out('which docker') 
  if docker.find('/docker') != -1 and nginx.find('/nginx') != -1:
      return True
  else:
      return False

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
  dependency = check_dependency()    
  if dependency is False :
    print("종속성 프로그램이 필요합니다.")
    print("NginX 경로")
    os.system('which nginx')
    print('Docker 경로')
    os.system('which docker')
    sys.exit()

  print("====================JP UI INSTALLER====================")
  print("본 인스톨러는 ubuntu:20.04 버전에 최적화 되어있습니다.")
  print("배포 하실 UI 패키지를 선택해주세요.")
  print("1.전체 (개발 중), 2.ui-style, 3.ui-graph, 4. ui-react, 0.나가기")
  choice = int(sys.stdin.readline())

  if choice == 1 :
    print('개발중인 기능입니다.')
    sys.exit()
  elif choice == 0 :
    print('Installer를 종료합니다.')
    sys.exit()
  else :
    if choice > 4 :
      print('잘못된 번호입니다.')
      sys.exit()

  install_cmd = './install/ui-package/installer.sh -c {install_package} -i {master_ip}'.format(
    install_package=choice,
    master_ip=params["master_ip"],
  )
  os.system("chmod +x ./installer.sh")
  os.system("cd ../../; {cmd}".format(cmd=install_cmd))
  print("====================JP UI INSTALL ENDED====================")

# 실행 인자 파싱 (flag parse)
parser = argparse.ArgumentParser()
# 필수 옵션
parser.add_argument('--master_ip',type=str, required=True, help="실행 서버의 ip를 입력해주세요.")
params, _ = parser.parse_known_args()
params = vars(params)
install_front(params)