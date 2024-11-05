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
    git clone -b 1_1_0_Release https://github.com/Mellanox/nv_peer_memory.git
    cd nv_peer_memory
    ./build_module.sh
    cd /tmp

    tar xzf /tmp/nvidia-peer-memory_1.1.orig.tar.gz
    cd nvidia-peer-memory-1.1
    dpkg-buildpackage -us -uc

    dpkg -i ../nvidia-peer-memory_1.1-0_all.deb
    dpkg -i ../nvidia-peer-memory-dkms_1.1-0_all.deb

    service nv_peer_mem start

elif [[ "$OS" == *"CentOS"* ]]
then
    echo CentOS
fi
