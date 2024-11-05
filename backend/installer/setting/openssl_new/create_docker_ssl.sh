#!/bin/bash
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

SCRIPT=$( readlink -m $( type -p $0 ))
BASE_DIR=`dirname ${SCRIPT}`
DOCKER_BASE_DIR=/openssl

echo $BASE_DIR

# key, cert 파일 확인
check_docker_key=$(file $DOCKER_SSL_KEY) 
check_docker_cert=$(file $DOCKER_SSL_CERT) 

if [[ "$check_docker_key" == *text* ]] && [[ "$check_docker_cert" == *certificate* ]];then
    echo "DOCKER SSL KEY CERT ALREADY EXIST"
    exit 0
else
    echo "rm JFB-Docker-Registry & docker key, cert folder"
    docker rm -f JFB-Docker-REGISTRY
    rm -rf $DOCKER_SSL_KEY $DOCKER_SSL_CERT
fi

# 이미지 빌드
chech_image=`docker images | grep jfb_openssl`
if [[ -z $chech_image ]]
then
    docker load -i jfb_openssl.tar
fi

# openssl
docker run --rm -it -v /jfbcore:/jfbcore -v /etc/jfb:/etc/jfb jfb_openssl:latest /bin/bash -c """
openssl req  \
        -newkey rsa:4096 -nodes -sha256 -keyout $DOCKER_SSL_KEY \
        -addext 'subjectAltName = IP:$DOCKER_REPOSITORY_IP' \
        -x509 -days 36500 -out $DOCKER_SSL_CERT \
        -subj '/C=KR/ST=Seoul/L=Seoul/O=Acryl/OU=Flightbase'
echo '---------------------------'
echo '-----Below is your CRT-----'
echo '---------------------------'
echo
cat $DOCKER_SSL_CERT
echo
echo '---------------------------'
echo '-----Below is your Key-----'
echo '---------------------------'
echo
cat $DOCKER_SSL_KEY
"""