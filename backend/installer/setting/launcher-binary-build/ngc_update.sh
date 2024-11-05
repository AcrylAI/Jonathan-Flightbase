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

wget --content-disposition https://ngc.nvidia.com/downloads/ngccli_linux.zip # binary download
$BASE_DIR/launcher_ngc_install.sh # install script