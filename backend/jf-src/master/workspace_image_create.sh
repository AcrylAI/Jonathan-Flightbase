#!/bin/bash

# image create 실패 시 return code : 131
# image fromat 실패 시 return code : 133

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

# create image file
dd if=/dev/zero of=/jf-storage/$device/$ws_name.img bs=100M count=10
if [ $? -gt 0 ]; then
  exit 131
fi

# ext4 format
mkfs ext4 -F /jf-storage/$device/$ws_name.img 
if [ $? -gt 0 ]; then
  exit 133
fi
exit 0