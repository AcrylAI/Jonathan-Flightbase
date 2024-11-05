#!/bin/bash
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

MYSQL_ROOT_PASSWORD=$(docker exec $JFB_DB_DOCKER_NAME env | grep PASSWORD | sed -r 's/MYSQL_ROOT_PASSWORD=//')
BACKUP=/backup
BACKUP_FILE_NAME="$JFB_DB_DATABASE"_$(python3 -c "import time; print(time.strftime('%Y%m%d-%H%M%S'))").sql

echo "BACKUP FILE NAME : " [$JFB_DB_BACKUP_MOUNT/$BACKUP_FILE_NAME]

docker exec -i $JFB_DB_DOCKER_NAME /bin/sh -c "mysqldump -uroot -p$MYSQL_ROOT_PASSWORD $JFB_DB_DATABASE > $BACKUP/$BACKUP_FILE_NAME"