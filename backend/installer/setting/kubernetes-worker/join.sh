#!/bin/bash
# --master_ip=192.168.1.16
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

# if [ "$KUBER_MASTER_JOIN_COMMAND" == "" ]
# then
#     echo "SKIP KUBERNETES JOIN"
#     exit 0
# fi
CERT=$(sshpass -p $LAUNCHER_PASSWORD ssh -o StrictHostKeyChecking=no $LAUNCHER_UNAME@$MASTER_IP kubeadm init phase upload-certs --upload-certs | tail -1)

echo CERT [$CERT]

JOIN_COMMAND=$(sshpass -p $LAUNCHER_PASSWORD ssh -o StrictHostKeyChecking=no $LAUNCHER_UNAME@$MASTER_IP kubeadm token create --print-join-command --certificate-key  $CERT | tail -1)
echo JOIN_COMMAND [$JOIN_COMMAND]
$JOIN_COMMAND
