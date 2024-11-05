#!/bin/bash

# SCRIPT=$( readlink -m $( type -p $0 ))
# BASE_DIR=`dirname ${SCRIPT}`  
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

# JFBCORE_ROOT=/jfbcore
# JF_BIN_DIR=$JFBCORE_ROOT/jf-bin
# JF_SRC_DIR=$JFBCORE_ROOT/jf-src
# LAUNCHER_BINS_DIR=$JFBCORE_ROOT/jf-bin/launcher_bins
# LAUNCHER_HOME=$LAUNCHER_BINS_DIR
# LOGIN_SHELL=$JF_BIN_DIR/launcher
# LAUNCHER_SRC=$JFBCORE_ROOT/jf-src/launcher_new
# PROGGEN_SRC=$JF_SRC_DIR/launcher_progs_generator
# LAUNCHER_UNAME=launcher
# LAUNCHER_GNAME=launcher
# LAUNCHER_UID=2020
# LAUNCHER_GID=2020
# PASSWORD="qwerty" # Don't use `:'. it will be used as a delimiter.



if [[ "$LAUNCHER_HOME" == "" ]]
then
    echo None
    exit 123
fi

rm -rf $LAUNCHER_HOME
mkdir -p $LAUNCHER_HOME

pwd=`pwd`


mv $JF_BIN_DIR/mfs_bin/mfs_util $JF_BIN_DIR/launcher_bins/mfs_util
chmod 777 $JF_BIN_DIR/launcher_bins/mfs_util

$PROGGEN_SRC/builder.sh /usr/bin "docker" "$LAUNCHER_HOME/docker"
./launcher_ngc_install.sh && $PROGGEN_SRC/builder.sh "$LAUNCHER_HOME/ngc-cli" "ngc_origin" "$LAUNCHER_HOME/ngc"
$PROGGEN_SRC/builder.sh /usr/bin "kubeadm" "$LAUNCHER_HOME/kubeadm"
$PROGGEN_SRC/builder.sh /usr/bin "kubectl" "$LAUNCHER_HOME/kubectl"
$PROGGEN_SRC/builder.sh /bin "rm -rf /etc/cni/net.d" "$LAUNCHER_HOME/rm_cni" 1 #disable dynamic arguments
$PROGGEN_SRC/builder.sh /bin "ls /sys/class/net/" "$LAUNCHER_HOME/network_interfaces" #GET NETWORK INTERFACE
$PROGGEN_SRC/builder.sh /jfbcore/installer "/worker_run.sh" "$LAUNCHER_HOME/restart-worker"
$PROGGEN_SRC/builder.sh /bin "mount -a" "$LAUNCHER_HOME/mount-sync" # For Storage Mount

ln -s /root/.kube $LAUNCHER_HOME/.kube
