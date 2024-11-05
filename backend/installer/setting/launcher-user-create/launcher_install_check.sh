#!/bin/bash
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
fi
JFBCORE_ROOT=/jfbcore


# launcher ssh connection check
LAUNCHER_SSH_OUTPUT=$(sshpass -p $LAUNCHER_PASSWORD ssh launcher@localhost)
if [[ "$LAUNCHER_SSH_OUTPUT" =~ "Permission denied" ]]
then
    LAUNCHER_SSH_RESULT="PERMISSION DENIED"
elif [[ "$LAUNCHER_SSH_OUTPUT" =~ "Welcome" ]]
then
    LAUNCHER_SSH_RESULT="SUCCESS"
else
    LAUNCHER_SSH_RESULT="FAIL"
fi

# launcher user exist check
if [ -n "$(cat /etc/passwd |grep launcher)" ]
then
    LAUNCHER_USER_RESULT="SUCCESS"
else
    LAUNCHER_USER_RESULT="FAIL"
fi

#launcher docker, kubeadm, kubectl, network_interface install check
JF_BIN="$JFBCORE_ROOT/jf-bin"
LAUNCHER_BINS_DIR="$JF_BIN/launcher_bins"
VERSION_CHECK_PACKAGE=( docker kubeadm kubectl )

for i in ${!VERSION_CHECK_PACKAGE[@]}
do
    VERSION_COMMAND[$i]="$LAUNCHER_BINS_DIR/${VERSION_CHECK_PACKAGE[i]} version"
done

for i in "${!VERSION_COMMAND[@]}"
do
    VERSION_OUTPUT=$(${VERSION_COMMAND[$i]})
    VERSION_OUTPUT=${VERSION_OUTPUT,,}
    if [[ "$VERSION_OUTPUT" =~ "version:" ]]
    then
        LAUNCHER_BINARY_RESULT[$i]="SUCCESS"
    else
        LAUNCHER_BINARY_RESULT[$i]="FAIL"
    fi
done

NETWORK_INTERFACE_COMMAND="$LAUNCHER_BINS_DIR/network_interfaces"
NETWORK_INTERFACE_OUTPUT=$($NETWORK_INTERFACE_COMMAND)
if [ -n "$NETWORK_INTERFACE_OUTPUT" ]
then
    LAUNCHER_BINARY_RESULT_NETWORK="SUCCESS"
else
    LAUNCHER_BINARY_RESULT_NETWORK="FAIL"
fi

PRINT_BAR="=============================="
echo $PRINT_BAR
echo "1. LAUNCHER SSH CONNECTION CHECK"
echo "$LAUNCHER_SSH_RESULT"
echo $PRINT_BAR
echo "2. LAUNCHER USER CHECK"
echo "$LAUNCHER_USER_RESULT"
echo $PRINT_BAR
echo "3. LAUNCHER BINARY WORKING CHECK"
for i in ${!VERSION_CHECK_PACKAGE[@]}
do
    echo "${VERSION_CHECK_PACKAGE[$i]}: ${LAUNCHER_BINARY_RESULT[$i]}"
done
echo "network_interfaces: $LAUNCHER_BINARY_RESULT_NETWORK"