#!/bin/bash

## User info copy
mkdir -p /jfbcore/jf-data/etc_host
cp /etc/passwd /jfbcore/jf-data/etc_host/
cp /etc/shadow /jfbcore/jf-data/etc_host/
cp /etc/gshadow /jfbcore/jf-data/etc_host/
cp /etc/group /jfbcore/jf-data/etc_host/

# apt remove kubeadm kubectl kubelet kubernetes-cni kube*
# apt install kubectl kubelet kubeadm kubernetes-cni
# systemctl enable kubelet
# systemctl start kubelet


swapoff -a
sed -i '/swap/d' /etc/fstab

echo '1' > /proc/sys/net/bridge/bridge-nf-call-iptables
kubeadm reset -f
kubeadm config images pull
kubeadm init


## 
rm -r  $HOME/.kube/config
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config


kubectl apply -f "https://cloud.weave.works/k8s/net?k8s-version=$(kubectl version | base64 | tr -d '\n')"
kubectl create -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/1.0.0-beta4/nvidia-device-plugin.yml
kubectl taint nodes --all node-role.kubernetes.io/master-

## coredns error => (JF Server)
## vi /etc/resolov.conf
## nameserver 168.126.63.1
## nameserver 8.8.8.8
