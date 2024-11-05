#!/bin/bash

NEED_NUM_OF_VFS=$(nvidia-smi -q -x | grep "gpu id" | wc -l)

echo $NEED_NUM_OF_VFS > /sys/class/net/ib0/device/sriov_numvfs


echo "==============================="
ibdev2netdev -v
echo "==============================="

echo "==============================="
lspci | grep Mellanox
echo "==============================="

echo "==============================="
ip link show
echo "==============================="

# ROOT GUID 기반 VF GUID 설정?
ROOT_GUID=$(cat /sys/class/infiniband/mlx5_0/node_guid |  sed -e 's/\://g')
GUID=()
GUID[0]=$(echo $ROOT_GUID | cut -c 1-2)
GUID[1]=$(echo $ROOT_GUID | cut -c 3-4)
GUID[2]=$(echo $ROOT_GUID | cut -c 5-6)
GUID[3]=$(echo $ROOT_GUID | cut -c 7-8)
GUID[4]=$(echo $ROOT_GUID | cut -c 9-10)
GUID[5]=$(echo $ROOT_GUID | cut -c 11-12)
GUID[6]=$(echo $ROOT_GUID | cut -c 13-13)
GUID[7]=$(echo $ROOT_GUID | cut -c 14-14)

echo ${GUID[0]} ${GUID[1]}

for (( i=0; i<${#GUID[@]}; i++ ))
do
    echo $i: ${GUID[$i]}
done


TIME_BASE_GUID=$(date +%s)
echo $TIME_BASE_GUID
TIME_GUID=()
TIME_GUID[0]=$(echo $TIME_BASE_GUID | cut -c 1-2)
TIME_GUID[1]=$(echo $TIME_BASE_GUID | cut -c 3-4)
TIME_GUID[2]=$(echo $TIME_BASE_GUID | cut -c 5-6)
TIME_GUID[3]=$(echo $TIME_BASE_GUID | cut -c 7-8)
TIME_GUID[4]=$(echo $TIME_BASE_GUID | cut -c 9-10)


INDEX=$(expr $NEED_NUM_OF_VFS - 1)

for i in $(seq 0 $INDEX);
do
   echo $i

   echo ${TIME_GUID[0]}:${TIME_GUID[1]}:${TIME_GUID[2]}:${TIME_GUID[3]}:${TIME_GUID[4]}:${GUID[5]}:${GUID[6]}:$i > /sys/class/infiniband/mlx5_0/device/sriov/$i/node
   echo ${TIME_GUID[0]}:${TIME_GUID[1]}:${TIME_GUID[2]}:${TIME_GUID[3]}:${TIME_GUID[4]}:${GUID[5]}:${GUID[6]}:$i > /sys/class/infiniband/mlx5_0/device/sriov/$i/port
   # echo 00:1$1:22:33:44:55:2:0 #> /sys/class/infiniband/mlx5_0/device/sriov/$i/port
done



echo 0 > /sys/class/net/ib0/device/sriov_numvfs
echo $NEED_NUM_OF_VFS > /sys/class/net/ib0/device/sriov_numvfs

ibstat | grep GUID
