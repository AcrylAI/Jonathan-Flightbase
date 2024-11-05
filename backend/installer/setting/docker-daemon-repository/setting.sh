#!/bin/bash
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

ls $DOCKER_SSL_CERT >> /dev/null 2>> /dev/null
if [ $? -gt 1 ]
then
    echo "Please Check Docker SSL CERT FILE [$DOCKER_SSL_CRET]"
    exit 1
fi

ls $DOCKER_SSL_KEY >> /dev/null 2>> /dev/null
if [ $? -gt 1 ]
then
    echo "Please Check Docker SSL KEY FILE [$DOCKER_SSL_KEY]"
    exit 1
fi


DOCKER_CA_PATH=/etc/docker/certs.d/$DOCKER_REPOSITORY_IP:$DOCKER_REPOSITORY_PORT

mkdir -p $DOCKER_CA_PATH >> /dev/null 2>> /dev/null

diff $DOCKER_SSL_CERT $DOCKER_CA_PATH/ca.crt >> /dev/null 2>> /dev/null
if [ $? -eq 0 ]
then
    echo "Already ca.crt exist. skip"
    exit 0
fi 

cp $DOCKER_SSL_CERT $DOCKER_CA_PATH/ca.crt

exit $?
