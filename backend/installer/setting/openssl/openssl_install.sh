#!/bin/bash

apt-get update
apt-get install -y build-essential libssl-dev wget
# openssl install
rm /usr/lib/libcrypto.so*
rm /usr/lib/libssl.so*
ln -s /usr/local/lib/libcrypto.so.1.1 /usr/lib/libcrypto.so
ln -s /usr/local/lib/libssl.so.1.1 /usr/lib/libssl.so
ln -s /usr/local/lib/libcrypto.so.1.1 /usr/lib/libcrypto.so.1.1
ln -s /usr/local/lib/libssl.so.1.1 /usr/lib/libssl.so.1.1

cd /usr/src
wget https://www.openssl.org/source/old/1.1.1/openssl-1.1.1c.tar.gz
tar -xvzf openssl-1.1.1c.tar.gz

cd openssl-1.1.1c
./config
make
make test
make install

mv /usr/bin/openssl /usr/bin/openssl1.1.1c
ln -s /usr/local/ssl/bin/openssl /usr/bin/openssl

