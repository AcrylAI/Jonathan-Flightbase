#!/bin/bash

. /jfbcore/installer/package/os_check.sh

# 패키지 버전 map
declare -A map

# apt
if [[ "$OS" == *"Ubuntu"* ]]
then
    IFS=$'\n' package=(`apt 2> /dev/null `)
    if [ -z "$package" ]; then
        tool='Not Installed'
    else
        tool='Ubuntu - apt'
    fi

    function parser() {
        if  [ -z "$package"  ]; then
            :
        else
            for i in "${package[@]}";
            do
                key="${i%%/*}"
                tmp="${i#*now }"
                value="${tmp%% *}"

                map[$key]=$value
            done
        fi
    }

    aptlist=(docker containerd.io kube nfs unzip wget make gcc g++ haproxy sshpass)
    for i in "${aptlist[@]}"
    do
        IFS=$'\n' package=(`apt list --installed 2>/dev/null | grep "$i" 2>/dev/null `)
        parser $package
    done

    # ofed
    IFS=$'\n' package=(`ofed_info -s 2> /dev/null `)
    map["ofed"]=$package

# yum
elif [[ "$OS" == *"CentOS"* ]]
then
    IFS=$'\n' package=(`yum 2> /dev/null `)
    if [ -z "$package" ]; then
        tool='Not Installed'
    else
        tool='CentOS - yum'
    fi

    function parser() {
        if  [ -z "$package"  ]; then
            :
        else
            for i in "${package[@]}";
            do
                key=$(echo $i | sed 's/.x86_64/@/g' | sed 's/ //g' | cut -d '@' -f1)
                value=$(echo $i | sed 's/.x86_64/@/g' | sed 's/ //g' | cut -d '@' -f2)
                map[$key]=$value
            done
        fi
    }

    yumlist=(docker containerd.io kube nfs unzip wget make gcc g++ haproxy sshpass)
    for i in "${yumlist[@]}"
    do
        IFS=$'\n' package=(`yum list installed 2>/dev/null | grep "$i" 2>/dev/null`)
        parser $package
    done

    # nvidia 추가 파싱
    key=$(yum list installed | grep nvidia-docker | sed 's/ //g' | sed 's/.noarch/@/g' | cut -d '@' -f1 )
    value=$(yum list installed | grep nvidia-docker | sed 's/ //g' | sed 's/.noarch/@/g' | cut -d '@' -f2 )
    map[$key]=$value
fi

# cli --------------------------------------------------------------------------------------
docker=`docker version --format='{{.Server.Version}}' 2> /dev/null`
if [ -z "$docker" ]; then
    docker='Error\t'
fi

nvidiasmi=`nvidia-smi --query-gpu=driver_version --format=csv,noheader --id=0  2> /dev/null`
if [ -z "$nvidiasmi" ]; then
    nvidiasmi='Error\t'
fi

IFS=$'\n' kubectl=(`kubectl version --short 2> /dev/null `)
if  [ -z "$kubectl"  ]; then
    kubectl="error\t"
else
    kubectl="${kubectl#*: }"
fi

kubeadm=`kubeadm version -o short  2> /dev/null`
if [ -z "$kubeadm" ]; then
    kubeadm='Error\t'
fi

# # 출력 --------------------------------------------------------------------------------------
echo '+───────────────────────+───────────────────────'
echo -e '│ package\t\t│ status\t\t\t'
echo '+───────────────────────+───────────────────────'
echo -e '│ package\t\t│ '$tool
echo -e '│ docker-ce\t\t│ '${map["docker-ce"]}
echo -e '│ docker-ce-cli\t\t│ '${map["docker-ce-cli"]}
echo -e '│ nvidia-docker\t\t│ '${map["nvidia-docker2"]}
echo -e '│ containerd.io\t\t│ '${map["containerd.io"]}

echo -e '│ kubectl\t\t│ '${map["kubectl"]}
echo -e '│ kubeadm\t\t│ '${map["kubeadm"]}
echo -e '│ kubelet\t\t│ '${map["kubelet"]}
echo -e '│ kubernetes-cni\t│ '${map["kubernetes-cni"]}
           
echo -e '│ nfs-common\t\t│ '${map["nfs-common"]}
echo -e '│ nfs-kernel-server\t│ '${map["nfs-kernel-server"]}
echo -e '│ nfs-common\t\t│ '${map["nfs-common"]}
echo -e '│ nfs-utils\t\t│ '${map["nfs-utils"]}

echo -e '│ unzip\t\t\t│ '${map["unzip"]}
echo -e '│ wget\t\t\t│ '${map["wget"]}
echo -e '│ make\t\t\t│ '${map["make"]}
echo -e '│ gcc\t\t\t│ '${map["gcc"]}
echo -e '│ gcc-7-base\t\t│ '${map["gcc-7-base"]}
echo -e '│ gcc-8-base\t\t│ '${map["gcc-8-base"]}
echo -e '│ haproxy\t\t│ '${map["haproxy"]}
echo -e '│ sshpass\t\t│ '${map["sshpass"]}

echo -e '├───────────────────────────────────────────────'
echo -e '│                      cli'
echo -e '├───────────────────────────────────────────────'
echo -e '│ docker\t\t│ '$docker
echo -e '│ nvidia-smi\t\t│ '$nvidiasmi
echo -e '│ kubctl \t\t│ '$kubectl
echo -e '│ kubeadm\t\t│ '$kubeadm
echo '+───────────────────────+───────────────────────'