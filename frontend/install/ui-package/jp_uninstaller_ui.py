import os
import sys

def uninstaller_front():
  print("====================JP FRONT UNINSTALLER====================")
  print("삭제 하실 패키지를 선택해주세요.")
  print("1.전체 (개발 중), 2.ui-style, 3.ui-graph, 4. ui-react, 0.나가기")
  choice = int(sys.stdin.readline())

  if choice == 1 :
    print("개발 중 입니다.")
  elif choice == 2:
    delete_style()
  elif choice == 3:
    delete_graph()
  elif choice == 4:
    delete_react()
  elif choice == 0 or choice > 4:
    print('Uninstaller를 종료합니다.')
    sys.exit()

  print("====================JP FRONT UNINSTALL DONE====================")

def delete_style():
  os.system('docker stop ui-style')
  os.system('docker rm -f ui-style')
  os.system('docker rmi jp:ui-style')
  os.system('rm -rf /etc/nginx/conf.d/ui-style.conf')
  os.system('nginx -s reload')

def delete_graph():
  os.system('docker stop ui-graph')
  os.system('docker rm -f ui-graph')
  os.system('docker rmi jp:ui-graph')
  os.system('rm -rf /etc/nginx/conf.d/ui-graph.conf')
  os.system('nginx -s reload')

def delete_react():
  os.system('docker stop ui-react')
  os.system('docker rm -f ui-react')
  os.system('docker rmi jp:ui-react')
  os.system('rm -rf /etc/nginx/conf.d/ui-react.conf')
  os.system('nginx -s reload')

uninstaller_front()