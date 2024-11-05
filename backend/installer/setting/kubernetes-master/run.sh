#!/bin/bash
# --kuber_master_ips=192.168.1.11,192.168.1.12,192.168.1.13 --kuber_master_lb_ip=192.168.1.16 --kuber_master_lb_port=6443
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

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

./haproxy.sh --kuber_master_ips=$KUBER_MASTER_IPS --kuber_master_lb_port=$KUBER_MASTER_LB_PORT

kubeadm config images pull
# kubeadm init
kubeadm init --control-plane-endpoint "$KUBER_MASTER_LB_IP:$KUBER_MASTER_LB_PORT" \
    --upload-certs 


## 
rm -r  $HOME/.kube/config
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config

## Launcher Kube config setting
rm -r -f $LAUNCHER_HOME/.kube
cp -r /root/.kube $LAUNCHER_HOME/.kube


kubectl taint nodes --all node-role.kubernetes.io/master-