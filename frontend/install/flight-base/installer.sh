#! /bin/bash
docker rm -f JP-front 2>/dev/null

# 도커 빌드
DOCKER_BUILDKIT=0 docker build -t nginx:jp-front .

# ip
front_ip=''
# front port
front_port='8000'
# api server ip
api_ip=''
# api port 
api_port=''
# build config
front_build_config='default'
# protocol type
protocol_config='http'
# ui guide 
ui_guide=''
# listen port
listen_port='80'
# marker ip
marker_url=''
# ENC KEY
enc_key=''
# iv
iv=''


while getopts a:h:p:l:c:r:s:u:m:e:i: opt
do
  case $opt in
    a)
      stand_alone=$OPTARG
      ;;
    h)
      api_ip=$OPTARG
      ;;
    p)
      api_port=$OPTARG
      ;;
    l)
      front_ip=$OPTARG
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
    m)
      marker_url=$OPTARG
      ;;
    e)                      
      enc_key=$OPTARG
      ;;
    i)
      iv=$OPTARG
      ;;
    *)
      exit 0
      ;;
  esac
done

#rm -rf /etc/nginx/sites-enabled/default

#if [ $protocol_config == 'http' ] 
#then
  #cp ./install/jp-front/nginx/default /etc/nginx/sites-enabled/default
#else
  #cp ./install/jp-front/nginx/default-ssl /etc/nginx/sites-enabled/default
#fi

#sed -i "s/replaceIp/$front_ip/" /etc/nginx/sites-enabled/default
#nginx -s reload

if [ $marker_url == '' ]; then
  marker_url="$front_ip:9000"
fi

if [ $ui_guide == 'true' ]; then
  docker run -d -it --name JP-front --restart always -p $front_port:8001 -p $api_port:56789 -p 8081:8081 -p 8082:8082 -p 8083:8083 -v /jp-front:/front-data -v /jfbcore:/jfbcore nginx:jp-front /bin/bash -c "service nginx start; sleep infinity;"
else
  docker run -d -it --name JP-front --restart always -p $front_port:8001 -p $api_port:56789 -v /jp-front:/front-data -v /jfbcore:/jfbcore nginx:jp-front /bin/bash -c "service nginx start; sleep infinity;"
fi
docker exec JP-front /bin/sh -c "cd /front-data; ./install/flight-base/install.sh -h $api_ip -p $api_port -l $front_ip -c $front_build_config -r $protocol_config -u $ui_guide -m $marker_url -e $enc_key -i $iv"

# nginx 재시작
docker exec JP-front service nginx stop
sleep 2
docker exec JP-front service nginx start
