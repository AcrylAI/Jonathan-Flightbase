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
WORKER_PORT=6000

RUN_COMMAND="cd /jf-src/worker; ./JF-CORE-WORKER >> system_worker.log"

cd /jfbcore/jf-src/worker/ && ln -s ../master/settings.ini settings.ini

ls /jfbcore/jf-src/worker/JF-CORE-WORKER
if [ $? -gt 0 ]
then
RUN_COMMAND="cd /jf-src/worker; python -u worker_app.py >> system_worker.log 2>> system_worker.log"
fi

if [ ! -f /jfbcore/jf-bin/stat ]; then
    touch /jfbcore/jf-bin/stat
fi

if [ ! -f /jfbcore/jf-bin/meminfo ]; then
    touch /jfbcore/jf-bin/meminfo
fi

docker rm -f JF-worker

docker run --name JF-worker -d \
--restart always \
-v /jfbcore/jf-bin:/jf-bin:ro \
-v /jfbcore/jf-data:/jf-data:rw \
-v /jfbcore/jf-data/etc_host:/etc_host:rw \
-v /jfbcore/jf-src:/jf-src \
-v /jfbcore/jf-storage:/jf-storage \
-v /jfbcore/test_tool:/test_tool:rw \
-v /root/.kube:/root/.kube \
-v /proc/stat:/jf-bin/stat \
-v /proc/meminfo:/jf-bin/meminfo \
-v /etc/:/host_etc_info:ro \
-it --network=host $JF_API_IMAGE \
/bin/bash -c "$RUN_COMMAND"

docker logs JF-worker

# # IF JF-worker Default  port use ex) 6000
# docker run --name JF-worker -d \
# -v /jfbcore/jf-bin:/jf-bin:ro\
# -v /jfbcore/jf-data:/jf-data:rw\
# -v /jfbcore/jf-data/etc_host:/etc_host:rw\
# -v /jfbcore/jf-src:/jf-src\
# -v /root/.kube:/root/.kube\
# -it -p $WORKER_PORT:6000 $JF_IMAGE\
# /bin/bash
