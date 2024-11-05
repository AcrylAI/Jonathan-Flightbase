#!/bin/bash

# image remove 실패 시 return code : 132
# directory remove 실패 시 return code : 134

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

# image file remove
rm /jf-storage/$device/$ws_name.img 
if [ $? -gt 0   ]; then
  exit 132
fi

# directory remove 
rm -r /jf-data/workspaces/$ws_name
if [ $? -gt 0   ]; then
  exit 134
fi

exit 0