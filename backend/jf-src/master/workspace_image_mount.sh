#!/bin/bash

# fstab insert 실패시 return code : 135
# mount 실패시 return code : 137
while getopts ":n:d:" opts; do
    case $opts in 
        n)
            #echo ${$OPTARG}
            ws_name=$OPTARG
            ;;
        d)
            device=$OPTARG
            ;;
    esac
done

#fstab update
echo "/jf-storage/$device/$ws_name.img   /jfbcore/jf-data/workspaces/$ws_name ext4 defaults 0 0 #workspace" >> /host_etc_info/jfb/fstab_jfb_ws #|| res=$?
if [ $? -gt 0 ]; then
  exit 135
fi

# mount
# mount -a --fstab /host_etc_info/jfb/fstab_jfb_ws
# # mount -o async,rw /jf-storage/$device/$ws_name.img /jf-data/workspaces/$ws_name #|| res=$?
# if [ $? -gt 0 ]; then
#   exit 137
# fi

exit 0