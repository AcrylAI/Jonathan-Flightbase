#!/bin/bash

## User info copy
mkdir -p /jfbcore/jf-data/etc_host
cp /etc/passwd /jfbcore/jf-data/etc_host/
cp /etc/shadow /jfbcore/jf-data/etc_host/
cp /etc/gshadow /jfbcore/jf-data/etc_host/
cp /etc/group /jfbcore/jf-data/etc_host/
