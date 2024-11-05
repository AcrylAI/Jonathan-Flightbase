FROM nvidia/cuda:11.1.1-devel-ubuntu18.04

ENV PYTHON_VERSION=3.6

# language
RUN apt-get update && apt-get install locales
ENV LANGUAGE=ko_KR.UTF-8
ENV LANG=ko_KR.UTF-8
RUN locale-gen ko_KR.UTF-8
RUN update-locale LANG=ko_KR.UTF-8

SHELL ["/bin/bash", "-cu"]

RUN apt-get update && apt-get install -y --allow-downgrades --allow-change-held-packages --no-install-recommends \
        build-essential \
        cmake \
        g++-4.8 \
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
        python${PYTHON_VERSION} \
        python${PYTHON_VERSION}-dev 

RUN apt-get install -y python${PYTHON_VERSION}-distutils
RUN unlink /usr/bin/python || echo "SKIP"
RUN ln -s /usr/bin/python${PYTHON_VERSION} /usr/bin/python
RUN curl -O https://bootstrap.pypa.io/pip/3.6/get-pip.py && \
    python get-pip.py && \
    rm get-pip.py

RUN pip install Werkzeug==0.16.0 flask==1.1.2 flask_cors==3.0.9 flask_restful==0.3.8 flask_restplus==0.13.0 \
                paramiko==2.7.2 cherrypy==18.6.0 kubernetes==12.0.1 pymysql==0.10.1 pycrypto==2.6.1 uwsgi==2.0.19.1 \
                gunicorn==19.9.0 pyinstaller==4.0 \
                PyGithub==1.54 Pillow==8.0.1