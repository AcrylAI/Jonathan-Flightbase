#!/bin/bash

mst start

mst status

MST_DEVICE=$(mst status | grep /dev | awk '{print $1}')

MST_SRIOV_EN=$(mlxconfig -d $MST_DEVICE q | grep SRIOV_EN | awk '{print $2}') # True(1) or False(0)

MST_NUM_OF_VFS=$(mlxconfig -d $MST_DEVICE q | grep NUM_OF_VFS | awk '{print $2}')

NEED_NUM_OF_VFS=$(nvidia-smi -q -x | grep "gpu id" | wc -l)

if [ "$MST_SRIOV_EN" == "True(1)" ] && [ "$MST_NUM_OF_VFS" == "$NEED_NUM_OF_VFS" ] 
then
    echo "SKIP SRIOV_EN NUM_OF_VFS SET "
    echo "RUN mst_after.sh"
else 
    mlxconfig -d $MST_DEVICE set SRIOV_EN=1 NUM_OF_VFS=$NEED_NUM_OF_VFS
fi
