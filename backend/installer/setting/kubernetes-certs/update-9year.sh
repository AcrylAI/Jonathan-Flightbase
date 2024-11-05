#!/bin/bash

# TEST VERSION - v1.17.4
# 이미 만료 된 인증서를 업데이트 해야하는 경우에는 update-1year.sh를 먼저 실행 후 해당 스크립트를 실행

TEMP_KUBEADM_YAML="/tmp/kubeadm.yaml"

# --cluster-signing-duration (1.19 이전은 --experimental-cluster-signing-duration)
cat /etc/kubernetes/manifests/kube-controller-manager.yaml | \
    grep "    \- \-\-experimental-cluster-signing-duration=87600h" || \
    sed -i -r -e "/    - kube-controller-manager/a\    - --experimental-cluster-signing-duration=87600h" /etc/kubernetes/manifests/kube-controller-manager.yaml


sleep 5

# Wait kube-controller-manager
while ((1))
do
    kubectl get pods -n kube-system | grep kube-controller-manager | grep Running > /dev/null && break
done

kubeadm alpha certs check-expiration

kubeadm config view > $TEMP_KUBEADM_YAML

# renew all on --use-api
kubeadm alpha certs renew all --use-api --config $TEMP_KUBEADM_YAML&

sleep 1

# csr approve
while [ $(ps -ef | grep "kubeadm alpha certs renew all \-\-use-api \-\-config $TEMP_KUBEADM_YAML" | wc -l) -gt 0 ]
do
    kubectl get csr | grep Pending | awk '{cmd="kubectl certificate approve  " $1; system(cmd)}'
done

kubeadm alpha certs check-expiration

#############################################################################
## etcd setting for ca
ETCD_YAML=/etc/kubernetes/manifests/etcd.yaml

sed -i 's\    - --peer-trusted-ca-file=.*\    - --peer-trusted-ca-file=/etc/kubernetes/pki/ca.crt\' $ETCD_YAML

sed -i 's\    - --trusted-ca-file=.*\    - --trusted-ca-file=/etc/kubernetes/pki/ca.crt\' $ETCD_YAML

sed -i 's\    - mountPath: /etc/kubernetes/pki/etcd\    - mountPath: /etc/kubernetes/pki\' $ETCD_YAML

sed -i 's\      path: /etc/kubernetes/pki/etcd\      path: /etc/kubernetes/pki\' $ETCD_YAML
#############################################################################

#############################################################################
## kube-apiserver setting for ca
APISERVER_YAML=/etc/kubernetes/manifests/kube-apiserver.yaml
ADMIN_CONF=/etc/kubernetes/admin.conf
sed -i 's\    - --etcd-cafile=/etc/kubernetes/pki/etcd/ca.crt\    - --etcd-cafile=/etc/kubernetes/pki/ca.crt\' $APISERVER_YAML

cp /etc/kubernetes/pki/ca.crt /etc/kubernetes/pki/front-proxy-ca.crt
cp /etc/kubernetes/pki/ca.key /etc/kubernetes/pki/front-proxy-ca.key


# cp new config
cp $ADMIN_CONF $HOME/.kube/config

cp $ADMIN_CONF /jfbcore/jf-bin/launcher_bins/.kube/config
#############################################################################

#docker ps --format="table {{.Names}}" | grep -e k8s_kube-apiserver -e k8s_kube-controller -e k8s_kube-scheduler | awk '{cmd="docker restart " $1; system(cmd)}'
#service kubelet restart

#############################################################################
## kubelet update
ADMIN_CONF=$ADMIN_CONF
KUBELET_CONF=/etc/kubernetes/kubelet.conf

cert_auth_data=$(cat $ADMIN_CONF | grep certificate-authority-data)
client_cert_data=$(cat $ADMIN_CONF | grep client-certificate-data)
client_key_data=$(cat $ADMIN_CONF | grep client-key-data)

#echo $cert_auth_data
#echo $client_cert_data
#echo $client_key_data



#cat /etc/kubernetes/kubelet.conf

#sed -i 's\.*certificate-authority-data:.*\'"$cert_auth_data"'\g' /etc/kubernetes/kubelet.conf
#sed -i 's\.*client-certificate:.*\'"$client_cert_data"'\g' /etc/kubernetes/kubelet.conf
#sed -i 's\.*client-key:.*\'"$client_key_data"'\g' /etc/kubernetes/kubelet.conf

KUBELET_PEM=/var/lib/kubelet/pki/kubelet-client-current.pem

openssl x509 -in $KUBELET_PEM  -text | grep Not
rm  /var/lib/kubelet/pki/kubelet-client-*

sed -i -e 's\.*certificate-authority-data:.*\'"$cert_auth_data"'\g' \
        -e 's\.*client-certificate:.*\'"$client_cert_data"'\g' \
        -e 's\.*client-key:.*\'"$client_key_data"'\g' $KUBELET_CONF
service kubelet stop
service kubelet start

while [ $(ls $KUBELET_PEM | wc -l) -eq 0 ]
do
    sleep 1
done


openssl x509 -in $KUBELET_PEM -text | grep Not


#############################################################################
