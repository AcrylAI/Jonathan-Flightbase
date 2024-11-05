#!/bin/bash

. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

if [ "$TARGET_HA_MASTER_NAME" == "" ]
then
    echo "Run with --target_ha_master_name=XX"
    exit 2
fi

CA_CERT=/etc/kubernetes/pki/etcd/ca.crt
CERT=/etc/kubernetes/pki/etcd/peer.crt
KEY=/etc/kubernetes/pki/etcd/peer.key


TARGET_IP=$(kubectl get nodes -o wide | grep $TARGET_HA_MASTER_NAME | awk '{print $6}')
kubectl drain $TARGET_HA_MASTER_NAME

kubectl exec etcd-$MASTER_NAME -n kube-system -- etcdctl --cacert $CA_CERT --cert $CERT --key $KEY member list

MEMBER_HASH=$(kubectl exec etcd-$MASTER_NAME -n kube-system -- etcdctl --cacert $CA_CERT --cert $CERT --key $KEY member list | grep $TARGET_HA_MASTER_NAME | awk -F , '{print $1}')
#$MEMBER_HASH

kubectl exec etcd-$MASTER_NAME -n kube-system -- etcdctl --cacert $CA_CERT --cert $CERT --key $KEY member remove $MEMBER_HASH

if [[ "$TARGET_IP" == "" ]]
then
    echo SKIP haproxy.cfg delete
    exit 0
fi

sed -i '/server '$TARGET_IP'/d' $CFG_PATH
service haproxy restart

sshpass -p $LAUNCHER_PASSWORD ssh $LAUNCHER_UNAME@$TARGET_IP kubeadm reset -f

kubectl delete node $TARGET_HA_MASTER_NAME
