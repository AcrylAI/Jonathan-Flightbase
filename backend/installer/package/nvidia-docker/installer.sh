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

    curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | \
    apt-key add -
    distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
    curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
     tee /etc/apt/sources.list.d/nvidia-docker.list
    apt-get update

    curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | \
    apt-key add -

    apt-get install -y nvidia-docker2=2.5.0-1
    pkill -SIGHUP dockerd


elif [[ "$OS" == *"CentOS"* ]]
then
    echo CentOS

    distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
    curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.repo | \
    sudo tee /etc/yum.repos.d/nvidia-docker.repo

    DIST=$(sed -n 's/releasever=//p' /etc/yum.conf)
    DIST=${DIST:-$(. /etc/os-release; echo $VERSION_ID)}
    sudo rpm -e gpg-pubkey-f796ecb0
    echo "y" | sudo gpg --homedir /var/lib/yum/repos/$(uname -m)/$DIST/nvidia-docker/gpgdir --delete-key f796ecb0
    echo "y" | sudo yum makecache

    sudo yum install -y nvidia-docker2-2.5.0-1
    sudo pkill -SIGHUP dockerd

fi
