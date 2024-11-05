#!/bin/bash
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

MYSQL_ROOT_PASSWORD=$JFB_DB_ROOT_PASSWORD

docker rm -f $JFB_DB_DOCKER_NAME
#docker pull mariadb
docker pull $JFB_DB_DOCKER_IMAGE
docker tag $JFB_DB_DOCKER_IMAGE mariadb:latest

docker run -d \
--restart always \
-p $JFB_DB_DOCKER_PORT:3306 \
-e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
-v $JFB_DB_DATA_MOUNT:/var/lib/mysql \
-v $JFB_DB_BACKUP_MOUNT:/backup \
-v $JFB_DB_SOCKET_MOUNT:/run/mysqld \
--name $JFB_DB_DOCKER_NAME mariadb:latest


docker exec $JFB_DB_DOCKER_NAME chown -R mysql:root /run/mysqld

# 13번 서버의 경우 90초 정도 기다려야 정상 동작
cnt=1
max=10000
while [ $cnt -lt $max ]
    do
    result_message=$((echo "CREATE DATABASE $JFB_DB_DATABASE default character set utf8 collate utf8_general_ci" | docker exec -i $JFB_DB_DOCKER_NAME /usr/bin/mysql -p$MYSQL_ROOT_PASSWORD -uroot) 2>&1) #&& break
    result_value=$?

    echo $result_value, $result_message
    if [ "$result_value" == "0" ] || [ `echo $result_message | grep -c "database exists"` -gt 0 ]
    then
        echo "CRAETED DATABASE " $JFB_DB_DATABASE
        break
    fi
    echo "Try to CREATE DATABASE : " $cnt "/"  $max
    cnt=`expr $cnt + 1`
    sleep 5
done
