#! /bin/bash
# settings.sh --docker_data_root=/var/lib/docker
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

sed -i '/"default-runtime"/d' /etc/docker/daemon.json
sed -e '2 i\\    "default-runtime": "nvidia",' -i /etc/docker/daemon.json

systemctl daemon-reload
systemctl restart docker

