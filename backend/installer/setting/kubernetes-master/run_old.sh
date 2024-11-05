#!/bin/bash

. ../base.sh

SCRIPT=$( readlink -m $( type -p $0 ))
BASE_DIR=`dirname ${SCRIPT}`
# /etc/resolv.conf  >> nameserver 8.8.8.8

cat /etc/resolv.conf | grep ^"nameserver 8.8.8.8" >> /dev/null
if [ $? -gt 0 ] 
then
    echo nameserver 8.8.8.8 >> /etc/resolv.conf
fi

sed -i 's/^nameserver 127.0.1.1/#nameserver 127.0.1.1/' /etc/resolv.conf

systemctl stop kubelet
systemctl start kubelet

# [Swap]
swapoff -a
sed -i '/swap/d' /etc/fstab

# [iptables]
echo '1' > /proc/sys/net/bridge/bridge-nf-call-iptables

kubeadm reset -f 
rm -r /etc/cni/net.d

kubeadm config images pull
kubeadm init


## 
rm -r  $HOME/.kube/config
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config

## Launcher Kube config setting
rm -r -f $LAUNCHER_HOME/.kube
cp -r /root/.kube $LAUNCHER_HOME/.kube


kubectl taint nodes --all node-role.kubernetes.io/master-