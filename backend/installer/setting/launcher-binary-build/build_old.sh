#!/bin/bash

# SCRIPT=$( readlink -m $( type -p $0 ))
# BASE_DIR=`dirname ${SCRIPT}`
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

LAUNCHER_SRC="$JF_SRC_DIR/launcher"

if [[ "$LAUNCHER_HOME" == "" ]]
then
    echo None
    exit 123
fi

rm -f $LOGIN_SHELL
rm -rf $LAUNCHER_HOME
mkdir -p $LAUNCHER_HOME

pwd=`pwd`
gcc $LAUNCHER_SRC/main.c  -Wall -Wextra -o $JF_BIN_DIR/launcher -D"BASE_PATH=\"$LAUNCHER_HOME\""
python3 $LAUNCHER_SRC/sudoer.py

$PROGGEN_SRC/builder.sh /usr/bin "docker" "$LAUNCHER_HOME/docker"
./launcher_ngc_install.sh && $PROGGEN_SRC/builder.sh $LAUNCHER_HOME "ngc_origin" "$LAUNCHER_HOME/ngc"
$PROGGEN_SRC/builder.sh /usr/bin "kubeadm" "$LAUNCHER_HOME/kubeadm"
$PROGGEN_SRC/builder.sh /usr/bin "kubectl" "$LAUNCHER_HOME/kubectl"
$PROGGEN_SRC/builder.sh /bin "rm -rf /etc/cni/net.d" "$LAUNCHER_HOME/rm_cni" 1 #disable dynamic arguments
$PROGGEN_SRC/builder.sh /bin "ls /sys/class/net/" "$LAUNCHER_HOME/network_interfaces" #GET NETWORK INTERFACE
