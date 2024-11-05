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
    apt install -y nvidia-driver-525-server

elif [[ "$OS" == *"CentOS"* ]]
then
    echo CentOS

fi
