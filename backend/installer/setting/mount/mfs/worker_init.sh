#!/bin/bash

master=$1
cd /etc/mfs
cp mfschunkserver.cfg.sample mfschunkserver.cfg
cp mfshdd.cfg.sample mfshdd.cfg
mkdir /jfbcore/jf-data/workspaces
mfsmount /jfbcore/jf-data/workspaces -H $master
