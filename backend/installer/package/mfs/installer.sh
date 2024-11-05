#!/bin/bash

. ../os_check.sh
echo $OS
echo $VER

#OS=Ubnutu
#VER=18.04
#OS="CentOS Linux"
#VER=7

if [[ "$OS" == *"Ubuntu"* ]]
then
                wget -O - https://ppa.moosefs.com/moosefs.key | apt-key add -
                if  [ "$VER" = "18.04" ];
                then
                        echo "deb http://ppa.moosefs.com/moosefs-3/apt/ubuntu/bionic bionic main" > /etc/apt/sources.list.d/moosefs.list
                elif  [ "$VER" = "16.04" ];
                then
                        echo "deb http://ppa.moosefs.com/moosefs-3/apt/ubuntu/xenial xenial main" > /etc/apt/sources.list.d/moosefs.list
                fi
                apt-get update
                if [[ "$1" == "master" ]]
                then
                  apt -y install moosefs-master moosefs-cgi moosefs-cgiserv moosefs-cli moosefs-chunkserver fuse libfuse2 moosefs-client
                fi
                apt -y install  moosefs-chunkserver fuse libfuse2 moosefs-client
elif [[ "$OS" == *"CentOS"* ]]
then
                curl "https://ppa.moosefs.com/RPM-GPG-KEY-MooseFS" > /etc/pki/rpm-gpg/RPM-GPG-KEY-MooseFS
                if  [ "$VER" = "7" ];
                then
                        curl "http://ppa.moosefs.com/MooseFS-3-el7.repo" > /etc/yum.repos.d/MooseFS.repo
                elif  [ "$VER" = "8" ];
                then
                        curl "http://ppa.moosefs.com/MooseFS-3-el8.repo" > /etc/yum.repos.d/MooseFS.repo
                fi
                if [[ "$1" == "master" ]]
                then
                  yum -y install moosefs-master moosefs-cgi moosefs-cgiserv moosefs-cli moosefs-chunkserver fuse fuse-devel moosefs-client
                fi
                yum -y install  moosefs-chunkserver fuse fuse-devel moosefs-client
fi