#! /bin/bash

# /jfbcore/installer/setting/jfb-system/master/master_run-sub.sh -n=JF-master2 -v=/jfbcore/jf-src
# -n=/--name=마스터이름, -v=/--volume=SRC위치

. /etc/jfb/parser.sh

SCRIPT=$( readlink -m $( type -p $0 ))
BASE_DIR=`dirname ${SCRIPT}`
JF_IMAGE=$(cat $BASE_DIR/config/jf_api_image)
echo JF IMAGE : [ $JF_API_IMAGE ]

# RUN_COMMAND="cd /jf-src/master; uwsgi --ini uwsgi.ini"

RUN_COMMAND="cd /jf-src/master; ./JF-CORE-MASTER"
mkdir -p /jfbcore/jf-data/keys
ls /jfbcore/jf-data/etc_host/passwd >> /dev/null
if [ $? -gt 0 ]
then
echo "CP LINUX ID"
./user_info_init.sh
fi

ls /jfbcore/jf-src/master/JF-CORE-MASTER
if [ $? -gt 0 ]
then
RUN_COMMAND="cd /jf-src/master; python flask_gunicorn_app.py"
fi

max_port() {
    port_list=()
    IFS=$'\n'
    for i in $(docker ps --format '{{.Image}} {{.Ports}}'  | grep $JF_API_IMAGE);
    do  
        tmp="${i#*0.0.0.0:}"
        container_port="${tmp%%-*}"
        if [[ "$container_port" == *$JF_API_IMAGE* ]];then
            continue
        fi
        port_list+=($container_port)
    done
    port_list=($(for item in "${port_list[@]}"; do echo "$item"; done | sort -rn))
    echo ${port_list[0]}
}

if [[ $# == 0 ]];then
    DOCKER_MASTER_NAME="JF-master"
    HOST_SRC="/jfbcore/jf-src"
    NETWORK="--network=host"
else
    # [name, src 파라미터]
    for i in "$@"; do
        case $i in
            -n=*|--name=*)
            DOCKER_MASTER_NAME="${i#*=}"
            shift # past argument=value
            ;;
            -v=*|--volume=*)
            HOST_SRC="${i#*=}"
            shift # past argument=value
            ;;
        esac
    done

    if [[ -z $DOCKER_MASTER_NAME || -z $HOST_SRC ]];then
        echo "fill in the option --name, --volume"
        exit 1
    fi
    
    # [port number]
    # 같은 이름의 마스터가 있는 경우
    if [[ ! -z $(docker ps --format '{{.Names}}' | grep $DOCKER_MASTER_NAME) ]];then
        # 같은 포트번호 사용
        DOCKER_PORT=$(docker ps --format '{{.Names}} {{.Ports}}'  | grep $DOCKER_MASTER_NAME)
        tmp="${DOCKER_PORT#*0.0.0.0:}"
        HOST_PORT="${tmp%%-*}"
    else
        # 포트번호 = jf_api_image 사용하는 포트 중 가장 큰 숫자 + 1
        # MASTER_NUM=$(docker ps | grep $JF_API_IMAGE | wc -l)
        port=$(max_port)
        if [[ -z $port ]];then
            port=56789
        fi
        HOST_PORT=$(($port + 1))
    fi

    # [Network] : settings.ini, LAUNCHER_DEFAULT_ADDR
    if [ ! -e  $HOST_SRC/master/settings.ini ];then
        cp /jfbcore/jf-src/master/settings.ini $HOST_SRC/master/settings.ini
    fi
    sed -i '/LAUNCHER_DEFAULT_ADDR/ c \LAUNCHER_DEFAULT_ADDR = "'"${MASTER_IP}"'"' $HOST_SRC/master/settings.ini
    NETWORK="-p $HOST_PORT:56788"
fi

docker rm -f $DOCKER_MASTER_NAME

docker run --name $DOCKER_MASTER_NAME -d \
--restart always \
-v /jfbcore/jf-bin:/jf-bin:ro \
-v /jfbcore/jf-bin/built_in_models:/jf-bin/built_in_models:rw \
-v /jfbcore/jf-data:/jf-data:rw \
-v /jfbcore/jf-data/keys:/home:rw \
-v /jfbcore/jf-data/etc_host:/etc_host:rw \
-v $HOST_SRC:/jf-src \
-v $JFB_DB_SOCKET_MOUNT:/jf-src/master/conf/db \
-v /jfbcore:/jfbcore:ro \
-v /root/.kube:/root/.kube \
-v /etc/:/host_etc_info:ro \
-e LC_ALL=C.UTF-8 \
-it $NETWORK $JF_API_IMAGE \
/bin/bash -c "$RUN_COMMAND"

echo $HOST_SRC $HOST_PORT