#!/bin/bash

. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

SCRIPT=$( readlink -m $( type -p $0 ))
BASE_DIR=`dirname ${SCRIPT}`  

function common_setting_first_func(){
    echo "common setting"
    ## DOCKER-daemon-set
    #cd $BASE_DIR/docker-daemon-nvidia
    #./setting.sh
    #cd $BASE_DIR

    #cd $BASE_DIR/docker-daemon-path
    #./setting.sh
    #cd $BASE_DIR

    #cd $BASE_DIR/docker-daemon-cgroup
    #./setting.sh
    #cd $BASE_DIR

    ## JF-Default-Image-load
    cd $BASE_DIR/jfb-default-image
    ./jf_default_image_init.sh
    cd $BASE_DIR

}

function common_setting_last_func(){
    echo "common last setting"
    ## LAUNCHER
    cd $BASE_DIR/launcher-user-create
    ./create.sh
    cd $BASE_DIR

    cd $BASE_DIR/launcher-binary-build
    ./build.sh
    cd $BASE_DIR

}

function master_setting_func(){
    echo "master setting"
    ## OPENSSL
    cd $BASE_DIR/openssl
    ./create_ssl.sh
    ./create_docker_ssl.sh
    cd $BASE_DIR

    ## DOCKER-Registory-daemon-setting
    cd $BASE_DIR/docker-daemon-repository
    ./setting.sh
    cd $BASE_DIR

    ## DOCKER-Repository-run
    cd $BASE_DIR/docker-repository-run
    ./setting.sh
    ./test.sh
    cd $BASE_DIR

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

    ## MARIADB
    cd $BASE_DIR/mariadb
    ./mariadb_init.sh
    cd $BASE_DIR

    ## NFS-MOUNT
    cd $BASE_DIR/mount/nfs
    ./master_init.sh
    cd $BASE_DIR

    ## JFB-SYSTEM
    cd $BASE_DIR/jfb-system/master
    ./master_ini_setting.sh
    cd $BASE_DIR

    cd $BASE_DIR/jfb-system/worker
    ./worker_run.sh
    cd $BASE_DIR

    cd $BASE_DIR/jfb-system/master
    ./master_run.sh
    cd $BASE_DIR
}

function worker_setting_func(){
    echo "worker setting"
    
    ## KUBERNETES-WORKER
    cd $BASE_DIR/kubernetes-worker
    ./init.sh
    cd $BASE_DIR

    ## NFS-MOUNT
    cd $BASE_DIR/mount/nfs
    ./worker_init.sh
    cd $BASE_DIR

    ## DOCKER-REPO CERT KEY SETTING
    cd $BASE_DIR/docker-daemon-repository
    ./setting.sh
    cd $BASE_DIR

    ## DOCKER-Repository-Connect-test
    cd $BASE_DIR/docker-repository-run
    ./test.sh
    cd $BASE_DIR

    ## JFB-SYSTEM
    cd $BASE_DIR/jfb-system/worker
    ./worker_run.sh
    cd $BASE_DIR
}


common_setting_first_func

if [ "$INSTALL_TYPE" == "MASTER" ]
then
    master_setting_func
fi

if [ "$INSTALL_TYPE" == "WORKER" ]
then
    worker_setting_func
fi

common_setting_last_func









