#!/bin/bash

openibd=`service openibd status 2>/dev/null | grep Active | awk '{ print $2}'` 
if [[ $openibd == "" ]];then
    openibd='not the find'
fi
opensmd=`service opensmd status 2>/dev/null | grep Active | awk '{ print $2}'`
if [[ $opensmd == "" ]];then
    opensmd='not the find'
fi
nv_peer_mem=`service nv_peer_mem status 2>/dev/null | grep Active | awk '{ print $2}'`
if [[ $nv_peer_mem == "" ]];then
    nv_peer_mem='not the find'
fi


echo '+───────────────────────+───────────────────────'
echo -e '│ infiniband service\t\t│ status\t\t\t'
echo '+───────────────────────+───────────────────────'
# openibd
echo -e '| openibd\t\t\t|' $openibd
#opensm
echo -e '| opensmd\t\t\t|'  $opensmd
#nv_peer_mem
echo -e '| nv_peer_mem\t\t\t|' $nv_peer_mem
echo '+───────────────────────+───────────────────────'