#!/bin/bash

. ../os_check.sh

echo $OS
echo $VER

if [[ "$OS" == *"Ubuntu"* ]]
then
    echo Ubuntu
    #./install_kube.sh
    # 로컬 repo 사용하도록 수정 
    apt-get install -y kubelet=1.17.4-00 kubeadm=1.17.4-00 kubectl=1.17.4-00
    systemctl enable kubelet
    systemctl stop kubelet
    systemctl start kubelet

elif [[ "$OS" == *"CentOS"* ]]
then
    echo CentOS

    cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOF

    setenforce 0
    systemctl disable firewalld
    yum install -y kubelet-1.17.4-0 kubeadm-1.17.4-0 kubectl-1.17.4-0
    
fi

systemctl enable kubelet
systemctl stop kubelet
systemctl start kubelet

