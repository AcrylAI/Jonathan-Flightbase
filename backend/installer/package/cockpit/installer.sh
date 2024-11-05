#!/bin/bash

. ../os_check.sh
echo $OS
echo $VER

if [[ "$OS" == *"Ubuntu"* ]]
then
    echo Ubuntu

    apt-get install -y cockpit
    mkdir /etc/systemd/system/cockpit.socket.d
    echo "[Socket]" > /etc/systemd/system/cockpit.socket.d/listen.conf
    echo "ListenStream=" >> /etc/systemd/system/cockpit.socket.d/listen.conf
    echo "ListenStream=9999" >> /etc/systemd/system/cockpit.socket.d/listen.conf
    systemctl daemon-reload
    systemctl restart cockpit.socket

elif [[ "$OS" == *"CentOS"* ]]
then
    echo CentOS

    yum -y install cockpit
    systemctl enable --now cockpit.socket

fi
