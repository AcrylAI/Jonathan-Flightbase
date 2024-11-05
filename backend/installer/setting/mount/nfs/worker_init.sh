#!/bin/bash
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

# NFS_MASTER_JFBCORE_ROOT=$JFBCORE_ROOT

umount $JFBCORE_ROOT
mkdir $JFBCORE_ROOT

echo "MASTER MOUNT POINT" [$NFS_MASTER_IP:$NFS_MASTER_JFBCORE_ROOT]

mount -t nfs -o async $NFS_MASTER_IP:$NFS_MASTER_JFBCORE_ROOT $JFBCORE_ROOT
result_value=$?
if [ $result_value -gt 0 ]
then
    echo "MOUNT ERROR "
    exit 1
fi

AUTO_MOUNT="$NFS_MASTER_IP:$NFS_MASTER_JFBCORE_ROOT $JFBCORE_ROOT nfs tcp,nolock 0 0"

cat /etc/fstab | grep ^$NFS_MASTER_IP:$NFS_MASTER_JFBCORE_ROOT > /dev/null
result_value=$?

if [ $result_value -gt 0 ]
then
    echo "Auto mount add"
    echo "$AUTO_MOUNT" >> /etc/fstab
fi
