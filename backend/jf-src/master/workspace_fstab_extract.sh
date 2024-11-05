#!/bin/bash

# fstab extract 실패시 return code : 136


while getopts ":n:" opts; do
    case $opts in 
        n)
            #echo ${$OPTARG}
            ws_name=$OPTARG
            ;;
    esac
done


#fstab update
sed -i "/$ws_name/d" /host_etc_info/jfb/fstab_jfb_ws
if [ $? -gt 0   ]; then
  exit 136
fi

exit 0