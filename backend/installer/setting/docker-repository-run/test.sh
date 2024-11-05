#!/bin/bash
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

docker pull busybox:latest

docker tag busybox:latest $DOCKER_REPOSITORY_IP:$DOCKER_REPOSITORY_PORT/busybox:latest

docker push $DOCKER_REPOSITORY_IP:$DOCKER_REPOSITORY_PORT/busybox:latest

if [ $? -eq 0 ]
then 
    echo "Docker Repository Push Test [OK]"
else 
    echo "Docker Repository Push Test [Error]"
fi

docker pull $DOCKER_REPOSITORY_IP:$DOCKER_REPOSITORY_PORT/busybox:latest
if [ $? -eq 0 ]
then
    echo "Docker Repository Pull Test [OK]"
else
    echo "Docker Repository Pull Test [Error]"
fi

# key, cert 파일 확인 (floder X)
check_docker_key=$(file $DOCKER_SSL_KEY) 
check_docker_cert=$(file $DOCKER_SSL_CERT) 

if [[ "$check_docker_key" == *text* ]] && [[ "$check_docker_cert" == *certificate* ]];then
    echo "DOCKER SSL KEY CERT ALREADY EXIST"
else
    echo "Check /jfbcore/jf-binocker docker.key, docker.crt
    It could be directory, not files.
    If it is directory,
    1. Stop JFB-Docker-Registry
    2. Remove docker.key, docker.crt directory
    3. Run /jfbcore/installer/openssl/create_docker_ssl.sh"
fi