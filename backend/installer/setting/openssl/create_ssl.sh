#!/bin/bash
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

IN_DOCKER=$1
if [ "$IN_DOCKER" == "" ]
then
    IN_DOCKER=0
fi

SCRIPT=$( readlink -m $( type -p $0 ))
BASE_DIR=`dirname ${SCRIPT}`
DOCKER_BASE_DIR=/openssl

echo $BASE_DIR

TEMP_DOCKER_NAME=JF-OPENSSL-Install

ls $HTTPS_KEY && ls $HTTPS_CERT
if [ $? -eq 0 ]
then
   echo "HTTPS KEY CERT ALREADY EXIST"
   exit 0
fi

# ssl setting
# openssl version && openssl req -x509 -nodes -newkey rsa:2048 -keyout $domain.key -out $domain.crt -subj "/C=KR/ST=Seoul/L=Seoul/O=Acryl/OU=Flightbase/CN=https-ssl"
openssl version
# echo "KR:Seoul:Gang-nam:acryl:Flightbase:$ip:ACRYL" | tr ":" "\n" | openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt
# sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048

SUBJ=

if [ $? -gt 0 ] && [ $IN_DOCKER -ne 1 ]
then 
    echo "OpenSSL installing"
    docker run -it -d -v /jfbcore:/jfbcore -v /etc/jfb:/etc/jfb -v $BASE_DIR:$DOCKER_BASE_DIR --name $TEMP_DOCKER_NAME ubuntu:16.04 /bin/bash
    docker exec $TEMP_DOCKER_NAME /bin/bash $DOCKER_BASE_DIR/openssl_install.sh
    docker exec $TEMP_DOCKER_NAME /bin/bash $DOCKER_BASE_DIR/create_ssl.sh 1
    docker rm -f $TEMP_DOCKER_NAME
else
    openssl req -x509 -nodes -newkey rsa:2048 -keyout $HTTPS_KEY -out $HTTPS_CERT -subj "/C=KR/ST=Seoul/L=Seoul/O=Acryl/OU=Flightbase/CN=https-ssl"

    echo "---------------------------"
    echo "-----Below is your CRT-----"
    echo "---------------------------"
    echo
    cat $HTTPS_CERT
    echo
    echo "---------------------------"
    echo "-----Below is your Key-----"
    echo "---------------------------"
    echo
    cat $HTTPS_KEY
fi


