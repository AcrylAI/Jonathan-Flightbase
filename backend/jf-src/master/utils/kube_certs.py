import base64
import cryptography
from cryptography import x509
from cryptography.hazmat.backends import default_backend
import sys
import os
import datetime

import utils.common as common
sys.path.insert(0, os.path.abspath('..'))
from TYPE import *
from settings import *
# For Control Kubernetes certs

def data_decode(pem: str):
    decode_data = base64.b64decode(pem).decode('utf-8')
    return decode_data

def get_cert_object(pem: bytes):
    if type(pem) == str:
        pem = pem.encode("utf-8")
    cert = x509.load_pem_x509_certificate(pem, default_backend())
    return cert

def get_cert_detail(pem: bytes):
    pem_object = get_cert_object(pem=pem)
    result = {
        "not_valid_after": pem_object.not_valid_after,
        "not_valid_before": pem_object.not_valid_before,
        "residual_time": pem_object.not_valid_after - datetime.datetime.now().replace(microsecond=0)
    }
    return result 
    
def get_kube_client_certificate_data():    
    certificate_authority_data = "" # PEM
    client_certificate_data = "" # PEM
    client_key_data = "" # RSA PRIVATE KEY
    with open(KUBER_CONFIG_PATH,"r") as fr:
        for line in fr.readlines():
            if "certificate-authority-data" in line:
                certificate_authority_data = line.split(":")[1].replace(" ","")
                continue
            if "client-certificate-data" in line:
                client_certificate_data = line.split(":")[1].replace(" ","")
                continue
            if "client-key-data" in line:
                client_key_data = line.split(":")[1].replace(" ","")
                continue
    # print(certificate_authority_data)
    # print(data_decode(certificate_authority_data))

    # print(client_certificate_data)
    # print(data_decode(client_certificate_data))

    # print(client_key_data)
    # print(data_decode(client_key_data))
    return data_decode(client_certificate_data)

def get_jf_kube_cert_detail():
    return get_cert_detail(get_kube_client_certificate_data())

def update_kube_cert():
    # Gen by launcher-binary_build.sh 
    common.launch_on_host(cmd="kubernetes-certs-update", ignore_stderr=True)

def auto_update_jf_kube_cert():
    jf_kube_cert_detail = get_jf_kube_cert_detail()
    days = jf_kube_cert_detail["residual_time"].days
    seconds = jf_kube_cert_detail["residual_time"].seconds


    if days == 0:
        if seconds < 100:
            print("The system automatically renews the certificate. remaining {}s.".format(seconds))

    if days < 0 :
        print("System Auto Update.")
        update_kube_cert()