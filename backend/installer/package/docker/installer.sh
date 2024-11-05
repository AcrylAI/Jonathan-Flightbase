#!/bin/bash

. ../os_check.sh
echo $OS
echo $VER

if [[ "$OS" == *"Ubuntu"* ]]
then
    echo Ubuntu
    apt-get update && apt-get install -y \
      apt-transport-https ca-certificates curl software-properties-common gnupg2

    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

    apt-get update && apt-get install -y --allow-downgrades \
      containerd.io=1.2.13-2 \
      docker-ce=5:19.03.15~3-0~ubuntu-$(lsb_release -cs) \
      docker-ce-cli=5:19.03.15~3-0~ubuntu-$(lsb_release -cs)

    systemctl daemon-reload
    systemctl restart docker
    systemctl enable docker
    
elif [[ "$OS" == *"CentOS"* ]]
then
    echo CentOS

    yum install -y yum-utils

    if ! grep -q '27d' /etc/yum.conf
    then
        echo "metadata_expire=27d" >> /etc/yum.conf
    fi

    yum-config-manager \
        --add-repo \
        https://download.docker.com/linux/centos/docker-ce.repo

    yum install -y docker-ce-19.03.8-3.el7 \
                docker-ce-cli-19.03.8-3.el7 \
                containerd.io-1.2.13-3.1.el7

    if grep -Fq "exclude=" /etc/yum.conf
        then
            if [[ $(sed -n '/exclude/p' /etc/yum.conf_b) == *"docker-ce docker-ce-cli containerd.io"*  ]]; then
                :
            else
                sed -i '/exclude=/ s/$/ docker-ce docker-ce-cli containerd.io/' /etc/yum.conf
            fi
        else
            echo "exclude=docker-ce docker-ce-cli containerd.io" >> /etc/yum.conf
    fi
                
    systemctl daemon-reload
    systemctl restart docker
    systemctl enable docker
fi
