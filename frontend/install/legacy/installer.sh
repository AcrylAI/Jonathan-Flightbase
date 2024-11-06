#! /bin/bash


# 도커 빌드
DOCKER_BUILDKIT=0 docker build -t nginx:jp-front .

# ip
front_ip=''
# front port
front_port='443'
# api server ip
api_ip=''
# api port 
api_port=''
# branch
branch='master'
# build config
front_build_config='default'
# protocol type
protocol_config='https'
# ui guide 
ui_guide=''


while getopts h:p:l:b:c:r:s:u: opt
do
  case $opt in
    h)
      api_ip=$OPTARG
      ;;
    p)
      api_port=$OPTARG
      ;;
    l)
      front_ip=$OPTARG
      ;;
    b)
      branch=$OPTARG
      ;;
    c)
      front_build_config=$OPTARG
      ;;
    r)
      protocol_config=$OPTARG
      ;;
    s)
      front_port=$OPTARG
      ;;
    u)
      ui_guide=$OPTARG
      ;;
    *)
      exit 0
      ;;
  esac
done

if [ $ui_guide == 'true' ]
then
  docker run -d -it --name JP-front --restart always -p $front_port:443 -p $api_port:56789 -p 8081:8081 -p 8082:8082 -p 8083:8083 -v /jp-front:/front-data -v /jfbcore:/jfbcore nginx:jp-front /bin/bash -c "service nginx start; sleep infinity;"
else
  docker run -d -it --name JP-front --restart always -p $front_port:443 -p $api_port:56789 -v /jp-front:/front-data -v /jfbcore:/jfbcore nginx:jp-front /bin/bash -c "service nginx start; sleep infinity;"
fi
docker exec  JP-front /bin/sh -c "cd /front-data; ./install/legacy/install.sh -h $api_ip -p $api_port -l $front_ip -b $branch -c $front_build_config -r $protocol_config -s $front_port -u $ui_guide"

# nginx 재시작
docker exec JP-front service nginx stop
sleep 2
docker exec JP-front service nginx start
