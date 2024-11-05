#! /bin/bash
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

echo $JFB_DB_DOCKER_NAME
MYSQL_ROOT_PASSWORD=$(docker exec JF-mariadb env | grep PASSWORD | sed -r 's/MYSQL_ROOT_PASSWORD=//')

docker exec -i JF-master passwd
echo 'UPDATE jfb.user SET login_counting = 0 WHERE NAME = "root"' | docker exec -i $JFB_DB_DOCKER_NAME /usr/bin/mysql -p$MYSQL_ROOT_PASSWORD -uroot
