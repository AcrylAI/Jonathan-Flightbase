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

ls $HTTPS_KEY && ls $HTTPS_CERT
if [ $? -eq 0 ]
then
   echo "HTTPS KEY CERT ALREADY EXIST"
   exit 0
fi

# ssl setting
# openssl version && openssl req -x509 -nodes -newkey rsa:2048 -keyout $domain.key -out $domain.crt -subj "/C=KR/ST=Seoul/L=Seoul/O=Acryl/OU=Flightbase/CN=https-ssl"
# openssl version
# echo "KR:Seoul:Gang-nam:acryl:Flightbase:$ip:ACRYL" | tr ":" "\n" | openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt
# sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048

# 이미지 빌드
chech_image=`docker images | grep jfb_openssl`
if [[ -z $chech_image ]]
then
    docker load -i jfb_openssl.tar
fi

# openssl
docker run --rm -it -v /jfbcore:/jfbcore -v /etc/jfb:/etc/jfb jfb_openssl:latest /bin/bash -c """
openssl req \
    -x509 -nodes -newkey rsa:2048 -keyout $HTTPS_KEY -out $HTTPS_CERT \
    -subj '/C=KR/ST=Seoul/L=Seoul/O=Acryl/OU=Flightbase/CN=https-ssl'
echo '---------------------------'
echo '-----Below is your CRT-----'
echo '---------------------------'
echo
cat $HTTPS_CERT
echo
echo '---------------------------'
echo '-----Below is your Key-----'
echo '---------------------------'
echo
cat $HTTPS_KEY
"""