FROM nvcr.io/nvidia/tensorflow:20.06-tf2-py3

# language
RUN apt-get update && apt-get install locales
ENV LANGUAGE=ko_KR.UTF-8
ENV LANG=ko_KR.UTF-8
RUN locale-gen ko_KR.UTF-8
RUN update-locale LANG=ko_KR.UTF-8

SHELL ["/bin/bash", "-cu"]
RUN apt-get update && DEBIAN_FRONTEND="noninteractive" TZ="America/New_York" apt-get install -y --allow-downgrades --allow-change-held-packages --no-install-recommends \
        build-essential \
        cmake \
        g++ \
        git \
        curl \
        vim \
        wget \
        ca-certificates \
        iputils-ping \
        net-tools \
        ethtool \
        perl \
        lsb-release \
        iproute2 \
        pciutils \
        libnl-route-3-200 \
        kmod \
        libnuma1 \
        lsof \
        libjpeg-dev \
        libpng-dev \
        librdmacm1 \
        libibverbs1 \
        libibverbs-dev 

# Install OpenSSH for MPI to communicate between containers
RUN apt-get update && apt-get install -y --no-install-recommends openssh-client openssh-server && \
    mkdir -p /var/run/sshd
# Allow OpenSSH to talk to containers without asking for confirmation
RUN cat /etc/ssh/ssh_config | grep -v StrictHostKeyChecking > /etc/ssh/ssh_config.new && \
    echo "    StrictHostKeyChecking no" >> /etc/ssh/ssh_config.new && \
    mv /etc/ssh/ssh_config.new /etc/ssh/ssh_config

COPY id_rsa /root/.ssh/id_rsa
COPY id_rsa.pub /root/.ssh/id_rsa.pub

RUN chmod 600 /root/.ssh/id_rsa
RUN cat /root/.ssh/id_rsa.pub >> /root/.ssh/authorized_keys

RUN curl -O https://bootstrap.pypa.io/get-pip.py && \
    python get-pip.py && \
    rm get-pip.py

# Configure OpenMPI to run good defaults:
RUN echo "hwloc_base_binding_policy = none" >> /usr/local/etc/openmpi-mca-params.conf && \
    echo "rmaps_base_mapping_policy = slot" >> /usr/local/etc/openmpi-mca-params.conf && \
    echo "btl_tcp_if_exclude = lo,docker0" >> /usr/local/etc/openmpi-mca-params.conf

ENV NUMPY_VERSION=1.19.5

RUN pip install mecab-python3==1.0.3 konlpy==0.5.2 numpy==${NUMPY_VERSION}
RUN bash <(curl -s https://raw.githubusercontent.com/konlpy/konlpy/master/scripts/mecab.sh)

RUN pip install sklearn==0.0 scikit-image==0.17.2 pandas==1.0.3 tensorlayer==2.2.2 \
            tqdm==4.46.0 nltk==3.5 opencv-python==4.4.0.46 PyGithub==1.54


RUN sed -i '/PATH=/d' /etc/environment 
RUN echo PATH='"'$PATH'"' >> /etc/environment