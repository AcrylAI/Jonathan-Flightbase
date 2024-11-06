#!/bin/bash
master_ip=''
protocol='http'

while getopts i:p: opt
do
  case $opt in
    i)
      master_ip=$OPTARG
      ;;
    p)
      protocol=$OPTARG
      ;;
    *)
      exit 0
      ;;
  esac
done

# nginx data copy
mkdir /front-nginx-data
mkdir /front-nginx-data/config
# http
if [ $protocol == "http" ]; then
cp ./install/jp-front/nginx/default -f /front-nginx-data/config/default
else
#https
cp ./install/jp-front/nginx/default-ssl -f /front-nginx-data/config/default
fi

sed -i "s/replaceIp/$master_ip/" /front-nginx-data/config/default

# declare service_name
service_name="jp-front-nginx"

# docker build
docker build -t "$service_name" -f DockerfileNginx . ;

# docker run
docker run -p 80:80 -p 443:443 --name jp-front-nginx --restart always -d -v /front-nginx-data:/front-nginx-data -v /jfbcore:/jfbcore "$service_name";

# docker exec
docker exec  "$service_name" /bin/sh -c "cd /front-nginx-init; ./init.sh"

# nginx restart
docker exec "$service_name" service nginx stop
sleep 2
docker exec "$service_name" service nginx start
