#!/bin/bash
# 2021-10-27 11:24
. /etc/jfb/setting.conf
if [ $? -gt 0 ]
then
    echo "There are no setting.conf"
    exit 1
fi

echo $MASTER_IP
echo $DOCKER_REPOSITORY_IP
echo $DOCKER_DATA_ROOT

if [ "$MASTER_IP" == "" ]
then
    echo "Must declare MASTER_IP"
    exit 2
fi

if [ "$MASTER_NAME" == "" ]
then
    echo "Must declare MASTER_NAME"
    exit 3
fi

if [ "$JFB_IMAGES_PATH" == "" ]
then 
    echo "Must declare JFB_IMAGES_PATH"
    exit 4
fi

if [ "$INSTALL_TYPE" == "" ]
then
    echo "Must declare INSTALL_TYPE"
    exit 5
fi

if [ "$MASTER_JFBCORE_ORIGIN_PATH" == "" ]
then 
    echo "Must declare MASTER_JFBCORE_ORIGIN_PATH"
    exit 6
fi

if [ "$IB_IP" == "" ] && [ "$OFED_INSTALL" == True ]
then
    echo "Must declare IB_IP. CONF OFED_INSTALL = $OFED_INSTALL"
    exit 7
fi