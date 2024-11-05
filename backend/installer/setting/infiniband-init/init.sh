#! /bin/bash
# --ib_ip=192.168.30.XX
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

ibstat_result=$(ibstat -p)
IFS='' read -ra ib_items <<< $ibstat_result

for item in $ib_items; do
opensm -g $item --daemon
done
echo ifconfig ib0 $IB_IP
ifconfig ib0 $IB_IP
ifconfig ib0

ifconfig ib0 $IB_IP
ifconfig ib0

service nv_peer_mem restart
service openibd restart
service opensmd restart