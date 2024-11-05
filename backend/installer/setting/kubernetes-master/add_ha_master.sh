#!/bin/bash
# --new_ha_master_ip=192.168.1.12
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

if [ "$NEW_HA_MASTER_IP" == "" ]
then 
    echo "Run with --new_ha_master_ip=XXX"
    exit 2
fi

IP=$NEW_HA_MASTER_IP
CFG_PATH=/etc/haproxy/haproxy.cfg


CFG_END_LINE_N=$(cat -n  $CFG_PATH | grep "#JF-SETTING-END" | awk '{print $1}')

sed -i '/server '$IP'/d' $CFG_PATH
sed -e ''$CFG_END_LINE_N' i\\        server '$IP' '$IP':6443 check' -i $CFG_PATH

service haproxy restart

netstat -nltp | grep $KUBER_MASTER_LB_PORT


CERT=$(kubeadm init phase upload-certs --upload-certs | tail -1 )

JOIN_COMMAND=$(kubeadm token create --print-join-command --certificate-key $CERT | tail -1 )

#TODO ssh fingerprint 하지 않는 경우 무응답. 해결 방안 필요
sshpass -p $LAUNCHER_PASSWORD ssh -o StrictHostKeyChecking=no $LAUNCHER_UNAME@$IP kubeadm reset -f 
sshpass -p $LAUNCHER_PASSWORD ssh $LAUNCHER_UNAME@$IP rm_cni
sshpass -p $LAUNCHER_PASSWORD ssh $LAUNCHER_UNAME@$IP $JOIN_COMMAND

kubectl taint nodes --all node-role.kubernetes.io/master-
