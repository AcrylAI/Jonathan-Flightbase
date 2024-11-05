
## Installing (2022-03-28)

# MASTER

* 폴더 설정 ( 실제 폴더가 /jfbcore 에 위치하도록)

    * cp -r [Git Folder]  /jfbcore   Or ln -s [Git Folder] /jfbcore
    
* JF 시스템용 도커 이미지 옮기기
   
    * 작성일(2022-03-30) 기준 16번 서버 /root/JF-Docker 
    * cpu, gpu 서버에 따라서 api image는 cpu, gpu 중 필요한 것 가져가기
    * /jfbcore/installer/global_param.conf 에 있는 JF_XXX_IMAGE 만큼 준비 필요
    * 설치하려는 서버에 옮긴 후 해당 경로를 기억 (setting.conf에 입력)

cd /jfbcore/installer

./init.sh

vi /etc/jfb/setting.conf 

입력 해줘야 하는 값들 입력 후


* /etc/jfb/setting.conf

    * Install 타입 선언  - INSTALL_TYPE=MASTER             # MASTER | WORKER

    * MASTER IP 선언 - MASTER_IP=192.168.0.97          # Default  MASTER_IP = KUBER_MASTER_LB_IP = DOCKER_REPOSITORY_IP = NFS_MASTER_IP   * MAIN MASTER IP

    * MASTER_NAME 선언 - MASTER_NAME=Acryl

    * JFBCORE 실제 위치 선언 - MASTER_JFBCORE_ORIGIN_PATH=/jfbcore   # Default /jfbcore || if /data/jfbcore - link -> /jfbcore  then /data/jfbcore

    * JF-Docker Default 폴더 위치 선언 - JFB_IMAGES_PATH=/root/JF-Docker # 없이 미리 설치하거나 이미 있으면 None으로 설정

* /etc/jfb/global_param.conf

    * db 비밀번호 변경 - JFB_DB_ROOT_PASSWORD=
    
    * /jfbcore/jf-src/master/settings.ini 에 있는 JF_DB_PW 도 같이 변경 필요

    * 이미 생성 되어있는 DB 의 비밀번호를 변경하여 설치 시 혹은 mariadb_init.sh 가 계속 넘어가지 않는 경우

        * /jfbcore/installer/setting/mariadb/mariadb_backup.sh 실행 후 backup 파일 경로 확인 후

        * docker rm -f JF-mariadb 

        * rm -r /jfbcore/jf-data/db_data 

        * /jfbcore/installer/setting/mariadb/mariadb_init.sh 

        * /jfbcore/installer/setting/mariadb/mariadb_load.sh --jfb_db_backup_file=[Backup File PATH]

cd /jfbcore/installer/package

./run.sh

cd /jfbcore/installer/setting

./all_init.sh

# WORKER

* 폴더 설정 ( 실제 폴더가 /jfbcore 이외에 위치하도록 - 해당 경로는 마운트 시킴)

* JF 시스템용 도커 이미지 옮기기
   
    * 작성일(2022-03-30) 기준 16번 서버 /root/JF-Docker 
    * cpu, gpu 서버에 따라서 api image는 cpu, gpu 중 필요한 것 가져가기
    * 설치하려는 서버에 옮긴 후 해당 경로를 기억 (setting.conf에 입력)

cd /jfbcore/installer

./init.sh

vi /etc/jfb/setting.conf 

입력 해줘야 하는 값들 입력 후

* /etc/jfb/setting.conf

    * Install 타입 선언  - INSTALL_TYPE=WORKER             # MASTER | WORKER

    * MASTER IP 선언 - MASTER_IP=192.168.0.97          # Default  MASTER_IP = KUBER_MASTER_LB_IP = DOCKER_REPOSITORY_IP = NFS_MASTER_IP   * MAIN MASTER IP

    * MASTER_NAME 선언 - MASTER_NAME=Acryl

    * JFBCORE 실제 위치 선언 - MASTER_JFBCORE_ORIGIN_PATH=/jfbcore   # Default /jfbcore || if /data/jfbcore - link -> /jfbcore  then /data/jfbcore

    * JF-Docker Default 폴더 위치 선언 - JFB_IMAGES_PATH=/root/JF-Docker # 없이 미리 설치하거나 이미 있으면 None으로 설정
    
cd /jfbcore/installer/package

./run.sh

cd /jfbcore/installer/setting

./all_init.sh


# gen_bin
gen_bin.sh
- binary file을 만드는 스크립트     
- 외부에서 JF를 실행할 때, flightbase 코드 접근을 막기 위해 binary 파일을 만들어서 실행   
- 로컬에서 실행할 때는, gen_bin_on_host.sh 를 실행시키고, gen_bin.sh 는 도커에서 작동하는 스크립트이다.

gen_bin 과정
- gen_bin 실행 -> pyinstaller => jf-src/master-bin, jf-src/worker-bin에 바이너리 파일 생성
- update_all.sh 실행 -> 바이너리 파일을 jf-src/master, jf-worker 로 복사
- jf를 master_run 할 때, 터미널에서 "그런 파일이나 디렉터리가 없습니다" 출력 부분 -> 도커 실행 or 바이너리 실행 확인
- 스웨거가 실행 되지 않으면 바이너리로 정상 실행

cd /jfbcore

./gen_bin_setting.sh
