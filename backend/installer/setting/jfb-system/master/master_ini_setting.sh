#! /bin/bash
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

MASTER_IP=$MASTER_IP
BASE=$JF_SRC_MASTER_DIR

# setting.conf
DOCKER_REPOSITORY_PORT=$DOCKER_REPOSITORY_PORT
JFB_DB_DOCKER_PORT=$JFB_DB_DOCKER_PORT

# global_param.conf
JF_DATA_DIR=$JF_DATA_DIR
JFB_DB_DOCKER_NAME=$JFB_DB_DOCKER_NAME
JFB_DB_DATABASE=$JFB_DB_DATABASE
JFB_DB_ROOT_PASSWORD=$JFB_DB_ROOT_PASSWORD

LAUNCHER_HOME=$LAUNCHER_HOME
LAUNCHER_UNAME=$LAUNCHER_UNAME
LAUNCHER_PASSWORD=$LAUNCHER_PASSWORD

JF_DEFAULT_IMAGE=$JF_DEFAULT_IMAGE
JF_CPU_IMAGE=$JF_CPU_IMAGE
JF_TF2_IMAGE=$JF_TF2_IMAGE
JF_TORCH_IMAGE=$JF_TORCH_IMAGE

sed -e 's/@MASTER_IP@/'$MASTER_IP'/'\
    -e 's/@DOCKER_REPOSITORY_PORT@/'$DOCKER_REPOSITORY_PORT'/' \
    -e 's/@JFB_DB_DOCKER_PORT@/'$JFB_DB_DOCKER_PORT'/' \
    -e 's/@JFB_DB_ROOT_PASSWORD@/'$JFB_DB_ROOT_PASSWORD'/' \
    -e 's/@JFB_DB_DOCKER_NAME@/'$JFB_DB_DOCKER_NAME'/' \
    -e 's/@JFB_DB_DATABASE@/'$JFB_DB_DATABASE'/' \
    -e 's|@JF_DATA_DIR@|'$JF_DATA_DIR'|' \
    -e 's/@LAUNCHER_UNAME@/'$LAUNCHER_UNAME'/' \
    -e 's/@LAUNCHER_PASSWORD@/'$LAUNCHER_PASSWORD'/' \
    -e 's|@LAUNCHER_HOME@|'$LAUNCHER_HOME'|' \
    -e 's/@JF_DEFAULT_IMAGE@/'$JF_DEFAULT_IMAGE'/' \
    -e 's/@JF_CPU_IMAGE@/'$JF_CPU_IMAGE'/' \
    -e 's/@JF_TF2_IMAGE@/'$JF_TF2_IMAGE'/' \
    -e 's/@JF_TORCH_IMAGE@/'$JF_TORCH_IMAGE'/' \
    $BASE/settings.ini.example > $BASE/settings.ini
# sed 명령어 -> settings.ini.example -> {@...@ 부분 -> $값으로 변경} -> ini파일을 생성
# DB JFB_DB_SOCKET_MOUNT