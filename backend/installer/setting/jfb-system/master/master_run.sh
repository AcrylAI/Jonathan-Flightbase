#! /bin/bash
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi
SCRIPT=$( readlink -m $( type -p $0 ))
BASE_DIR=`dirname ${SCRIPT}`

echo JF IMAGE : [ $JF_API_IMAGE ]

MASTER_PORT=56789

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

docker rm -f JF-master

rm /jfbcore/jf-src/master/conf/project-master.pid >> /dev/null

docker run --name JF-master -d \
--restart always \
-v /jfbcore/jf-bin:/jf-bin:ro \
-v /jfbcore/jf-bin/built_in_models:/jf-bin/built_in_models:rw \
-v /jfbcore/jf-data:/jf-data:rw \
-v /jfbcore/jf-data/keys:/home:rw \
-v /jfbcore/jf-data/etc_host:/etc_host:rw \
-v /jfbcore/jf-src:/jf-src \
-v /jfbcore:/jfbcore:ro \
-v /root/.kube:/root/.kube \
-v /etc/:/host_etc_info:ro \
-e LC_ALL=C.UTF-8 \
-it --network=host $JF_API_IMAGE \
/bin/bash -c "$RUN_COMMAND"

docker logs JF-master
docker stop JF-master
docker start JF-master

# [memory]
# memory=$(free -m | grep Mem | awk -F ' ' '{print $2}')
# memory_limit=$(($memory * 80 / 100)) # 가져온 메모리의 80%
# --memory=${memory_limit} \ # docker run memory option

# [auth]
# docker run --entrypoint htpasswd httpd:2 -Bbn [USERNAME] [PASSWORD] > [file경로] # auth 파일 생성
# -v [auth 파일 폴더]:/auth
# -e "REGISTRY_AUTH=htpasswd" \
# -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
# -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \

# # IF JF-master Default  port use ex) 6000
# docker run --name JF-master -d \
# -v /jfbcore/jf-bin:/jf-bin:ro\
# -v /jfbcore/jf-data:/jf-data:rw\
# -v /jfbcore/jf-data/etc_host:/etc_host:rw\
# -v /jfbcore/jf-src:/jf-src\
# -v /root/.kube:/root/.kube\
# -it -p $MASTER_PORT:56788 $JF_API_IMAGE\
# /bin/bash