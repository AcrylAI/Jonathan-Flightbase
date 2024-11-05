FROM ubuntu:18.04 

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

ENV PYTHON_VERSION=3.8
RUN apt-get install -y python${PYTHON_VERSION} python${PYTHON_VERSION}-dev python${PYTHON_VERSION}-distutils
RUN unlink /usr/bin/python | echo "unlink skip"
RUN unlink /usr/bin/python3 | echo "unlink skip"
RUN ln -s /usr/bin/python${PYTHON_VERSION} /usr/bin/python
RUN ln -s /usr/bin/python${PYTHON_VERSION} /usr/bin/python3
RUN curl -O https://bootstrap.pypa.io/get-pip.py && \
    python get-pip.py && \
    rm get-pip.py


ENV OPENMPI_VERSION=3.1.6
# Install Open MPI
RUN mkdir /tmp/openmpi && \
    cd /tmp/openmpi && \
    wget https://www.open-mpi.org/software/ompi/v3.1/downloads/openmpi-${OPENMPI_VERSION}.tar.gz && \
    tar zxf openmpi-${OPENMPI_VERSION}.tar.gz && \
    cd openmpi-${OPENMPI_VERSION} && \
    ./configure --enable-orterun-prefix-by-default && \
    make -j $(nproc) all && \
    make install && \
    ldconfig && \
    rm -rf /tmp/openmpi

ENV TENSORFLOW_VERSION=2.4.0
ENV PYTORCH_VERSION=1.8.0
ENV TORCHVISION_VERSION=0.9.0
ENV PILLOW_VERION=5.3.0
ENV NUMPY_VERSION=1.19.4
ENV KERAS_VERSION=2.4.2
ENV TENSORBOARD_VERSION=2.4

# Install TensorFlow, Keras and PyTorch
RUN pip install future typing
RUN pip install numpy==${NUMPY_VERSION} \
        tensorflow==${TENSORFLOW_VERSION} \
        keras==${KERAS_VERSION} \
        tensorboard==${TENSORBOARD_VERSION} \
        h5py==2.10.0 \
        Pillow==${PILLOW_VERION}

RUN pip install torch==${PYTORCH_VERSION} torchvision==${TORCHVISION_VERSION}

ENV HOROVOD_VERSION=0.22.0
# Install Horovod
RUN HOROVOD_WITH_TENSORFLOW=1 HOROVOD_WITH_PYTORCH=1 \
    pip install --no-cache-dir horovod==${HOROVOD_VERSION}
RUN mv /usr/local/bin/mpirun /usr/local/bin/mpirun.real && \
    echo '#!/bin/bash' > /usr/local/bin/mpirun && \
    echo 'mpirun.real --allow-run-as-root "$@"' >> /usr/local/bin/mpirun && \
    chmod a+x /usr/local/bin/mpirun
# Configure OpenMPI to run good defaults:
RUN echo "hwloc_base_binding_policy = none" >> /usr/local/etc/openmpi-mca-params.conf && \
    echo "rmaps_base_mapping_policy = slot" >> /usr/local/etc/openmpi-mca-params.conf && \
    echo "btl_tcp_if_exclude = lo,docker0" >> /usr/local/etc/openmpi-mca-params.conf


RUN pip install mecab-python3==1.0.3 konlpy==0.5.2 numpy==1.19.4 konlpy==0.5.2
RUN bash <(curl -s https://raw.githubusercontent.com/konlpy/konlpy/master/scripts/mecab.sh)

RUN pip install sklearn==0.0 scikit-image==0.17.2 pandas==1.0.3 tensorlayer==2.2.2 \
            tqdm==4.46.0 nltk==3.5 opencv-python==4.4.0.46 PyGithub==1.54 

# Jupyter
RUN pip install jupyter jupyterlab==3.0.14 jupyterlab-git==0.30.0

# Deployment
RUN pip install Werkzeug==0.16.0 flask==1.1.2 flask_cors==3.0.9 flask_restful==0.3.8 flask_restplus==0.13.0