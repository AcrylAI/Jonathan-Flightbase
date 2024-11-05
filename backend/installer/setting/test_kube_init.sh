#!/bin/bash
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

SCRIPT=$( readlink -m $( type -p $0 ))
BASE_DIR=`dirname ${SCRIPT}`

## KUBERNETES-MASTER-RUN
cd $BASE_DIR/kubernetes-master
./run.sh
cd $BASE_DIR

## KUBERNETES-PLUGIN-RUN
cd $BASE_DIR/kubernetes-plugin
./init.sh
./init.sh # For Order Error case
cd $BASE_DIR

## KUBERNETES-CERT-UPDATE
cd $BASE_DIR/kubernetes-certs
./update-9year.sh
cd $BASE_DIR
