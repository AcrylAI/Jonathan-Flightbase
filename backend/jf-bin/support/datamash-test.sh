#!/bin/bash
SCRIPT=$( readlink -m $( type -p $0 ))
BASE_DIR=`dirname ${SCRIPT}` 

printf "%s\n" 20 22 1 5 10 15 20 | $BASE_DIR/datamash max 1 min 1 median 1 mean 1
