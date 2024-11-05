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

    MOFED_VERSION=4.9-3.1.5.0
    # Modify the variable to desired OS
    MOFED_OS=ubuntu$VER
    pushd /tmp
    curl -fSsL https://www.mellanox.com/downloads/ofed/MLNX_OFED-${MOFED_VERSION}/MLNX_OFED_LINUX-${MOFED_VERSION}-${MOFED_OS}-x86_64.tgz | tar -zxpf -
    cd MLNX_OFED_LINUX-*
    echo "y" | ./mlnxofedinstall
    popd
    service openibd restart

elif [[ "$OS" == *"CentOS"* ]]
then
    echo CentOS
    # TODO
    # need CentOS minor ver
    # ex) rhel7.6 
fi
