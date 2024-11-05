#! /bin/bash
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

SCRIPT=$( readlink -m $( type -p $0 ))
BASE_DIR=`dirname ${SCRIPT}`

cd $LAUNCHER_HOME
cp $BASE_DIR/ngccli_linux.zip $LAUNCHER_HOME

unzip -o ngccli_linux.zip && chmod u+x ngc-cli/ngc
mv ngc-cli/ngc ngc-cli/ngc_origin
rm ngccli_linux.zip

# wget -O ngccli_linux.zip https://ngc.nvidia.com/downloads/ngccli_linux.zip && unzip -o ngccli_linux.zip && chmod u+x ngc-cli/ngc