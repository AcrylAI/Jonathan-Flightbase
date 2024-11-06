import os
import sys

def uninstaller_front():
  print("====================JP FRONT UNINSTALLER====================")
  print("삭제 하실 패키지를 선택해주세요.")
  print("1.전체 (개발 중), 2.포탈, 3.연합 학습, 0.나가기")
  choice = int(sys.stdin.readline())

  if choice == 1 :
    delete_portal()
    delete_federated_learning()
  elif choice == 2:
    delete_portal()
  elif choice == 3:
    delete_federated_learning()
  elif choice == 3:
    delete_federated_learning()
  elif choice == 0 or choice > 4:
    print('Uninstaller를 종료합니다.')
    sys.exit()

  print("====================JP FRONT UNINSTALL DONE====================")


# 공용 함수로 만들수도 있으나, 각 패키지별로 커스텀 가능하도록 개별 함수로 제작
def delete_portal():
  os.system('docker stop portal')
  os.system('docker rm -f portal')
  os.system('docker rmi jp:portal')

def delete_federated_learning():
  os.system('docker stop federated-learning')
  os.system('docker rm -f federated-learning')
  os.system('docker rmi jp:federated-learning')


uninstaller_front()
