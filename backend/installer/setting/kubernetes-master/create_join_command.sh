#!/bin/bash
CERT=$(kubeadm init phase upload-certs --upload-certs | tail -1 )

JOIN_COMMAND=$(kubeadm token create --print-join-command --certificate-key $CERT | tail -1 )

echo JOIN_COMMAND [$JOIN_COMMAND]


# kubeadm token create --print-join-command --certificate-key $(kubeadm init phase upload-certs --upload-certs | tail -1 ) | tail -1