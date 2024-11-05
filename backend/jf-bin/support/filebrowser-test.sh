#!/bin/bash
SCRIPT=$( readlink -m $( type -p $0 ))
BASE_DIR=`dirname ${SCRIPT}`

$BASE_DIR/filebrowser config init
$BASE_DIR/filebrowser -r / &
