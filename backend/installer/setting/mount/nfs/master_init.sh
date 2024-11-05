#!/bin/bash
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi


#TODO mount point * -> WORKER IP
mkdir $JFBCORE_ROOT
MASTER_MOUNT="$JFBCORE_ROOT *(rw,async,no_root_squash,no_all_squash,no_subtree_check)"
cat /etc/exports | grep ^$JFBCORE_ROOT' '
result_value=$?
if [ $result_value -gt 0 ]
then
    echo "$MASTER_MOUNT" >> /etc/exports
fi

exportfs -r
