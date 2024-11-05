#!/bin/bash
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi
## User info copy
mkdir -p $JF_ETC_DIR
cp /etc/passwd $JF_ETC_DIR
cp /etc/shadow $JF_ETC_DIR
cp /etc/gshadow $JF_ETC_DIR
cp /etc/group $JF_ETC_DIR
