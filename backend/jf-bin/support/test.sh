#!/bin/bash

RUN_BIN=$1

#TEST_IMAGE=(centos:6.10 centos:7.1.1503 centos:7.2.1511 centos:7.3.1611 centos:7.4.1708 centos:7.5.1804 centos:7.6.1810 centos:7.7.1908 centos:7.8.2003 centos:7.9.2009)
TEST_IMAGE=(ubuntu:14.04 ubuntu:16.04 ubuntu:18.04 ubuntu:20.04)

for (( i=0; i<${#TEST_IMAGE[@]}; i++ ))
do
    echo ${TEST_IMAGE[$i]}
    docker run -it --rm -v $PWD/:/support_bin ${TEST_IMAGE[$i]} /support_bin/$RUN_BIN
done

#docker run -it --rm -v $PWD/:/support_bin centos:6.10 /support_bin/$RUN_BIN
