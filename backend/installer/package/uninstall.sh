#!/bin/bash

. ./os_check.sh
#OS=Ubnutu
#VER=18.04
#OS="CentOS Linux"
#VER=7

echo $OS
echo $VER

if [[ "$OS" == *"Ubuntu"* ]]
then
    echo Ubuntu
    apt remove -y docker-ce docker-ce-cli containerd.io
    apt remove -y nvidia-docker2
    apt remove -y kubelet kubeadm kubectl
    apt remove -y nvidia-peer-memory
    apt autoremove -y
elif [[ "$OS" == *"CentOS"* ]]
then
    echo CentOS
    yum remove -y docker docker-common docker-selinux docker-engine 
    yum remove -y docker-ce docker-ce-cli
    rm -rf /var/lib/docker
    yum remove -y nvidia-docker2
    yum remove -y kubeadm kubectl kubernetes-cni kubelet kube*
    yum autoremove -y

fi
