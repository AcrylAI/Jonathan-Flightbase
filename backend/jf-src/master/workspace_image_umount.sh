#!/bin/bash

# fstab extract 실패시 return code : 136
# mount 실패시 return code : 138

while getopts ":n:" opts; do
    case $opts in 
        n)
            #echo ${$OPTARG}
            ws_name=$OPTARG
            ;;
    esac
done


#Iamge umount 
umount -f /jf-data/workspaces/$ws_name 
umount -f /jfbcore/jf-data/workspaces/$ws_name 
if [ $? -gt 0 ]; then
  exit 138
fi

exit 0