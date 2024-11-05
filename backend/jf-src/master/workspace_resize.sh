#!/bin/bash

# image resize 실패 시 return code : 140
# loop device init 실패 시 return code : 141
# loop device resize 실패 시 return code : 142
while getopts ":n:c:d:l:" opts; do
    case $opts in 
        n)
            #echo ${$OPTARG}
            ws_name=$OPTARG
            ;;
        c)
            capacity=$OPTARG
            ;;
        d)
            device=$OPTARG
            ;;
        l)
            loop=$OPTARG
            ;;
    esac
done


# iamge resize
resize2fs -f /jf-storage/$device/$ws_name.img $capacity
if [ $? -gt 1 ]; then
  exit 1
fi

# loop device init 
losetup -c $loop
if [ $? -gt 0 ]; then
  exit 1
fi

# loop device resize
resize2fs -f $loop $capacity
if [ $? -gt 0 ]; then
  exit 1
fi

exit 0