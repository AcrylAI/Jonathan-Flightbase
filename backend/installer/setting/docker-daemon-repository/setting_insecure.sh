#! /bin/bash
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi


if [ "$DOCKER_REPOSITORY_IP" == "" ]
then
    echo SKIP REPOSITORY SETTING
    exit 0
fi

REPOSITORY_ADDR=$DOCKER_REPOSITORY_IP:$DOCKER_REPOSITORY_PORT

#$(cat /etc/docker/daemon.json  | grep "insecure-registries" | awk '{print $2}')

sed -i '/"insecure-registries"/d' /etc/docker/daemon.json
sed -e '2 i\\    "insecure-registries":' -i /etc/docker/daemon.json


sed -i 's\"insecure-registries":.*\"insecure-registries": ["'$REPOSITORY_ADDR'"],\g' /etc/docker/daemon.json

systemctl daemon-reload
systemctl restart docker
