#!/bin/bash

master_ip=''
api_port=''
install_package=''
protocol='http'
start_cmd=''
today=`date`
package_name='portal'
stand_alone='false'
conatiner_port='12123'
# deprecated
#listen_port='80'


while getopts c:i:p:s:a: opt
do
  case $opt in
    c)
      install_package=$OPTARG
      ;;
    i)
      master_ip=$OPTARG
      ;;
    p)
      protocol=$OPTARG
      ;;
    s)
      stand_alone=$OPTARG
      ;;
    a)
      api_port=$OPTARG
      ;;
    *)
      exit 0
      ;;
  esac
done



# 전체설치
if [ $install_package == '1' ]; then
echo "아직 지원되지 않습니다."
# portal 설치
elif [ $install_package == '2' ]; then
start_cmd='start:pt-start-real'
package_name='portal'
container_port='12124'
# 연합학습 설치
elif [ $install_package == '3' ]; then
#start_cmd='start:fl-yb'
package_name='federated-learning'
container_port='10000'
fi

service_name="jp:$package_name"

# docker build
if [ $install_package == '2' ]; then
docker build -t "$service_name" --build-arg PACKAGE=$install_package -f DockerfilePm2 . ;
else
docker build -t "$service_name" --build-arg PACKAGE=$install_package -f DockerfileStatic . ;
fi

# 도커 실행
if [ $install_package == '2' ]; then
docker run -p "$container_port:3001" --name "$package_name" --restart always -d  "$service_name" "$start_cmd";
else
docker run -p "$container_port:80" --name "$package_name" --restart always -d "$service_name";
fi


