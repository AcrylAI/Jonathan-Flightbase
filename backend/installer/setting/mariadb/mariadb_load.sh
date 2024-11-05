#!/bin/bash
#--jfb_db_backup_file=
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

if [ "$JFB_DB_BACKUP_FILE" == "" ]
then
    echo "Not defined --jfb_db_backup_file="
    exit 1
fi


cp $JFB_DB_BACKUP_FILE $JFB_DB_BACKUP_MOUNT/

DEPTH=(`echo $JFB_DB_BACKUP_FILE | tr "/" "\n"`)
BACKUP=/backup
JFB_DB_BACKUP_FILE_NAME=${DEPTH[-1]}

MYSQL_ROOT_PASSWORD=$(docker exec $JFB_DB_DOCKER_NAME env | grep PASSWORD | sed -r 's/MYSQL_ROOT_PASSWORD=//')

docker exec -i $JFB_DB_DOCKER_NAME /bin/sh -c "mysql -uroot -p$MYSQL_ROOT_PASSWORD $JFB_DB_DATABASE < $BACKUP/$JFB_DB_BACKUP_FILE_NAME"
