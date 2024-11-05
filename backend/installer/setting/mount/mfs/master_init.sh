#!/bin/bash

master=$1

cd /etc/mfs
cp mfsmaster.cfg.sample mfsmaster.cfg
cp mfsexports.cfg.sample mfsexports.cfg
cp mfschunkserver.cfg.sample mfschunkserver.cfg
cp mfshdd.cfg.sample mfshdd.cfg
echo "192.168.1.0/24 / rw,alldirs,maproot=0" >> /etc/mfs/mfsexports.cfg
systemctl enable moosefs-master.service
systemctl start moosefs-master.service
systemctl enable moosefs-cgiserv.service
systemctl start moosefs-cgiserv.service
mkdir /loop
chmod 777 /loop
echo "/loop" >> /etc/mfs/mfshdd.cfg
echo "MASTER_HOST = ${master}"  >> /etc/mfs/mfschunkserver.cfg
systemctl enable moosefs-chunkserver.service
systemctl start moosefs-chunkserver.service
mkdir /jfbcore/jf-data/workspaces
mfsmount /jfbcore/jf-data/workspaces -H $master
