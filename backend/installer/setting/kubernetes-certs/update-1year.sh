#!/bin/bash
# --kuber_master_lb_ip=192.168.1.16 --kuber_master_lb_port=26443
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

kubeadm alpha certs check-expiration

kubeadm alpha certs renew all

mv /etc/kubernetes/{admin.conf,controller-manager.conf,kubelet.conf,scheduler.conf} /etc/kubernetes/Backup

kubeadm init phase kubeconfig all --control-plane-endpoint="$KUBER_MASTER_LB_IP:$KUBER_MASTER_LB_PORT"

cp /etc/kubernetes/admin.conf $HOME/.kube/config

cp /etc/kubernetes/admin.conf /jfbcore/jf-bin/launcher_bins/.kube/config

docker ps --format="table {{.Names}}" | grep -e k8s_kube-apiserver -e k8s_kube-controller -e k8s_kube-scheduler | awk '{cmd="docker restart " $1; system(cmd)}'

service kubelet restart
