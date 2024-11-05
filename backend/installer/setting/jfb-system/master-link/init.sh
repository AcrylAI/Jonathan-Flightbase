#! /bin/bash
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

if [ "$MASTER_JFBCORE_ORIGIN_PATH" != "$JFBCORE_ROOT" ]
then 
    echo "LINK " $MASTER_JFBCORE_ORIGIN_PATH -> $JFBCORE_ROOT
    ln -s $MASTER_JFBCORE_ORIGIN_PATH $JFBCORE_ROOT
else 
    echo "LINK SKIP"
fi