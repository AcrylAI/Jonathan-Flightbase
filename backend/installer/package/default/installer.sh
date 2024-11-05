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
    apt update
    apt install -y unzip wget make gcc g++ haproxy sshpass jq

elif [[ "$OS" == *"CentOS"* ]]
then
    echo CentOS

    if [ -e "/etc/haproxy/haproxy.cfg" ];then
        mv /etc/haproxy/haproxy.cfg /etc/haproxy/haproxy_backup.cfg
    fi

    yum install -y unzip wget make gcc g++ haproxy sshpass
fi
