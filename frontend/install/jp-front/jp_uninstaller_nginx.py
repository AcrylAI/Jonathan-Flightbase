import os

def uninstaller_front():
    print("====================JP FRONT NGINX UNINSTALLER====================")
    os.system('rm -rf /front-nginx-data')
    os.system('docker stop jp-front-nginx')
    os.system('docker rm jp-front-nginx')
    print("====================JP FRONT NGINX UNINSTALL DONE====================")

uninstaller_front()