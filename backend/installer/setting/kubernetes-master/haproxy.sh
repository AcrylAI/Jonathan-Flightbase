#!/bin/bash
# --kuber_master_lb_port=26443 --kuber_master_ips=192.168.1.11,192.168.1.12,192.168.1.13
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

CFG_START_LINE_N=$(cat -n  /etc/haproxy/haproxy.cfg | grep '#JF-SETTING-START' | awk '{print $1}')
CFG_END_LINE_N=$(cat -n  /etc/haproxy/haproxy.cfg | grep '#JF-SETTING-END' | awk '{print $1}')


echo START_LINE $CFG_START_LINE_N
echo END_LIST $CFG_END_LINE_N

sed -i "$CFG_START_LINE_N","$CFG_END_LINE_N"d  $CFG_PATH


echo "
#JF-SETTING-START
frontend kubernetes-master-lb
        bind 0.0.0.0:$KUBER_MASTER_LB_PORT
        option tcplog
        mode tcp
        default_backend kubernetes-master-nodes

backend kubernetes-master-nodes
        mode tcp
        balance roundrobin
        option tcp-check
        option tcplog
#JF-SETTING-END
" >> $CFG_PATH


CFG_START_LINE_N=$(cat -n  $CFG_PATH | grep "#JF-SETTING-START" | awk '{print $1}')
CFG_END_LINE_N=$(cat -n  $CFG_PATH | grep "#JF-SETTING-END" | awk '{print $1}')

# KUBER_MASTER_IPS=192.168.1.16,192.168.1.12,192.168.1.15
KUBER_MASTER_IPS=($(echo $KUBER_MASTER_IPS | tr "," "\n"))

for IP in ${KUBER_MASTER_IPS[@]}
do
    sed -e ''$CFG_END_LINE_N' i\\        server '$IP' '$IP':6443 check' -i $CFG_PATH
done

service haproxy restart

netstat -nltp | grep $KUBER_MASTER_LB_PORT