#!/bin/bash

. ../os_check.sh
#OS=Ubnutu
#VER=18.04
#OS="CentOS Linux"
#VER=7

echo $OS
echo $VER

if [[ "$OS" == *"Ubuntu"* ]]
then
    echo Ubuntu

    apt-get install -y nfs-common nfs-server

    systemctl start nfs-server
    systemctl enable nfs-server

elif [[ "$OS" == *"CentOS"* ]]
then
    echo CentOS

    yum install -y nfs-utils

    systemctl start nfs-server
    systemctl enable nfs-server
fi
