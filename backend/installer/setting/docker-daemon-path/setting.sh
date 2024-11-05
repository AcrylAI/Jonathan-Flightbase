#! /bin/bash
# settings.sh --docker_data_root=/var/lib/docker
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi
echo DOCKER SETIING : $DOCKER_DATA_ROOT
# insecure-registries
# data-root

cat /etc/docker/daemon.json | grep '"data-root":' >> /dev/null
if [ "$DOCKER_DATA_ROOT" == "" ] || [ "$DOCKER_DATA_ROOT" == "None" ] && [ $? -eq 0 ]
then
    DIR_INFO=$(docker info | grep "Docker Root Dir:")
    ROOT_DIR=(${DIR_INFO//Docker Root Dir:/})
    DOCKER_DATA_ROOT=$ROOT_DIR
fi


sed -i '/"data-root"/d' /etc/docker/daemon.json
sed -e '2 i\\    "data-root":' -i /etc/docker/daemon.json

if [ "$DOCKER_DATA_ROOT" == "" ] || [ "$DOCKER_DATA_ROOT" == "None" ];
then
    echo "SKIP SET Docker data dir "
else

    echo "Change Docker data dir "

    DIR_INFO=$(docker info | grep "Docker Root Dir:")
    ROOT_DIR=(${DIR_INFO//Docker Root Dir:/})
    if [ "$DOCKER_DATA_COPY" == "True" ] && [ "$ROOT_DIR" != "$DOCKER_DATA_ROOT" ]
    then
        echo DOCKER DATA COPY TO $DOCKER_DATA_ROOT 
        cp -a $ROOT_DIR/. $DOCKER_DATA_ROOT # CP OLD PATH DATA
    fi
    sed -i 's\"data-root":.*\"data-root": "'$DOCKER_DATA_ROOT'",\g' /etc/docker/daemon.json

fi
systemctl daemon-reload
systemctl restart docker

