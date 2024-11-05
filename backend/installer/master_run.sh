#! /bin/bash
SCRIPT=$( readlink -m $( type -p $0 ))
BASE_DIR=`dirname ${SCRIPT}`
JF_IMAGE=$(cat $BASE_DIR/config/jf_api_image)
echo JF IMAGE : [ $JF_IMAGE ]
MASTER_PORT=56789

# RUN_COMMAND="cd /jf-src/master; uwsgi --ini uwsgi.ini"

RUN_COMMAND="cd /jf-src/master; ln -s /jfbcore/jf-data /jf-data; ./JF-CORE-MASTER"
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
RUN_COMMAND="cd /jf-src/master; ln -s /jfbcore/jf-data /jf-data; python flask_gunicorn_app.py"
fi

docker rm -f JF-master

docker run --name JF-master -d \
--privileged \
--restart always \
-v /jfbcore/jf-bin:/jf-bin:ro \
-v /jfbcore/jf-bin/built_in_models:/jf-bin/built_in_models:rw \
-v /jfbcore/jf-data/keys:/home:rw \
-v /jfbcore/jf-data/etc_host:/etc_host:rw \
-v /jfbcore/jf-src:/jf-src \
-v /jfbcore:/jfbcore:rw \
-v /root/.kube:/root/.kube \
-v /etc/:/host_etc_info:rw \
-v /jf-storage:/jf-storage \
-v /dev:/dev \
-e LC_ALL=C.UTF-8 \
-it --network=host $JF_IMAGE \
/bin/bash -c "$RUN_COMMAND"
# -v /jfbcore/jf-data:/jf-data:rw \

docker logs JF-master

docker stop JF-master
docker start JF-master

# # IF JF-master Default  port use ex) 6000
# docker run --name JF-master -d \
# -v /jfbcore/jf-bin:/jf-bin:ro\
# -v /jfbcore/jf-data:/jf-data:rw\
# -v /jfbcore/jf-data/etc_host:/etc_host:rw\
# -v /jfbcore/jf-src:/jf-src\
# -v /root/.kube:/root/.kube\
# -it -p $MASTER_PORT:56788 $JF_IMAGE\
# /bin/bash
