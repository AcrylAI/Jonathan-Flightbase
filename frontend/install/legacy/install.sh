#! /bin/bash
# sudo ./installer.sh -h 192.168.1.105 -p 56789 -l 192.168.1.105

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

# index.html 설정 값
favicon_item='favicon.ico'
title_item='JONATHAN'

# api 요청 port 설정
api_call_port=''
if [ $protocol_config == 'http' ]
then
  api_call_port = ":$front_port"
fi

# yarn 설치
npm install -g yarn
yarn install --network-timeout 600000
yarn build-pack:all

# yarn workspace @jonathan/flightbase add --dev webpack

if [ $front_build_config == 'kisti' ]
then
  sed "s|api-url|$protocol_config://$api_ip$api_call_port/api/|g" ./install/legacy/config-kisti > config-kisti
  mv -f config-kisti apps/flightbase/configs/app-config/
  favicon_item='images/custom/DNA+DRONE.ico'
  title_item='DNA+DRONE'
  sed "s|faviconItem|$favicon_item|g; s|titleItem|$title_item|g" ./install/legacy/index.html > index.html
  mv -f index.html apps/flightbase/public/
  yarn workspace @jonathan/flightbase build:kisti
  cd ./apps/flightbase/build
elif [ $front_build_config == 'integration' ]
then
  sed "s|api-url|$protocol_config://$api_ip$api_call_port/api/|g" ./install/legacy/config-integration > config-integration
  mv -f config-integration apps/flightbase/configs/app-config/
  sed "s|faviconItem|$favicon_item|g; s|titleItem|$title_item|g" ./install/legacy/index.html > index.html
  mv -f index.html apps/flightbase/public/
  yarn workspace @jonathan/flightbase build:integration
  cd ./apps/flightbase/build
elif [ $front_build_config == 'etri' ]
then
  sed "s|api-url|$protocol_config://$api_ip$api_call_port/api/|g" ./install/legacy/config-etri > config-etri
  mv -f config-etri apps/flightbase/configs/app-config/
  favicon_item='images/custom/DNA+DRONE.ico'
  title_item='DNA+DRONE'
  sed "s|faviconItem|$favicon_item|g; s|titleItem|$title_item|g" ./install/legacy/index.html > index.html
  mv -f index.html apps/flightbase/public/
  yarn workspace @jonathan/flightbase build:etri
  cd ./apps/flightbase/build
elif [ $front_build_config == 'cbtp' ]
then
  sed "s|api-url|$protocol_config://$api_ip$api_call_port/api/|g" ./install/leagcy/config-cbtp > config-cbtp
  mv -f config-cbtp apps/flightbase/configs/app-config/
  sed "s|faviconItem|$favicon_item|g; s|titleItem|$title_item|g" ./install/legacy/index.html > index.html
  mv -f index.html apps/flightbase/public/
  yarn workspace @jonathan/flightbase build:cbtp
  cd ./apps/flightbase/build
elif [ $front_build_config == 'wellcare' ]
then
  sed "s|api-url|$protocol_config://$api_ip$api_call_port/api/|g" ./install/legacy/config-wellcare > config-wellcare
  mv -f config-wellcare apps/flightbase/configs/app-config/
  sed "s|faviconItem|$favicon_item|g; s|titleItem|$title_item|g" ./install/legacy/index.html > index.html
  mv -f index.html apps/flightbase/public/
  yarn workspace @jonathan/flightbase build:wellcare
  cd ./apps/flightbase/build
elif [ $front_build_config == 'keti' ]
then
  sed "s|api-url|$protocol_config://$api_ip$api_call_port/api/|g" ./install/legacy/config-keti > config-keti
  mv -f config-keti apps/flightbase/configs/app-config/
  sed "s|faviconItem|$favicon_item|g; s|titleItem|$title_item|g" ./install/legacy/index.html > index.html
  mv -f index.html apps/flightbase/public/
  yarn workspace @jonathan/flightbase build:keti
  cd ./apps/flightbase/build
elif [ $front_build_config == 'dgtp' ]
then
  sed "s|api-url|$protocol_config://$api_ip$api_call_port/api/|g" ./install/legacy/config-dgtp > config-dgtp
  mv -f config-dgtp apps/flightbase/configs/app-config/
  sed "s|faviconItem|$favicon_item|g; s|titleItem|$title_item|g" ./install/legacy/index.html > index.html
  mv -f index.html apps/flightbase/public/
  yarn workspace @jonathan/flightbase build:dgtp
  cd ./apps/flightbase/build
else
  sed "s|api-url|$protocol_config://$api_ip$api_call_port/api/|g" ./install/legacy/config-real > config-real
  mv -f config-real apps/flightbase/configs/app-config/
  sed "s|faviconItem|$favicon_item|g; s|titleItem|$title_item|g" ./install/legacy/index.html > index.html
  mv -f index.html apps/flightbase/public/
  yarn workspace @jonathan/flightbase build:real
  cd ./apps/flightbase/build
fi

# 빌드 파일 경로
project_path=`pwd`

# nginx 업로드 사이즈 설정 
cat /etc/nginx/nginx.conf | grep "client_max_body_size 100M;"
if [ $? -gt 0 ]
then
  sed -i'' -r -e "/^http/a\\\tclient_max_body_size 10240M;" /etc/nginx/nginx.conf
fi

openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048

# front conf
nginx_listen_config=''
if [ $protocol_config == 'https' ]
then
  nginx_listen_config=' http2 ssl'
fi

ui_style_path='/front-data/packages/ui/ui-style/dist'
ui_graph_path='/front-data/packages/ui/ui-graph/dist'
ui_react_path='/front-data/packages/ui/ui-react/storybook-static'
error_path='/front-data/apps/flightbase/'
# @jonathan/flightbase nginx conf
sed "s|replaceIp|$front_ip|g; s|rootLocation|$project_path|g; s|errorLocation|$error_path|g; s|apiPort|$api_port|g; s|protocolConfig|$protocol_config|g; s|listenConfig|$nginx_listen_config|g" ../../../install/legacy/jp.conf > jp.conf
mv jp.conf /etc/nginx/conf.d/

if [ $ui_guide == 'true' ]
then
  # @jonathan/ui-style
  sed "s|replaceIp|$front_ip|g; s|uiStyleLocation|$ui_style_path|g; s|errorLocation|$error_path|g" ../../../legacy/install/ui-style.conf > ui-style.conf
  # @jonathan/ui-graph
  sed "s|replaceIp|$front_ip|g; s|uiD3Location|$ui_d3_path|g; s|errorLocation|$error_path|g" ../../../install/legacy/ui-graph.conf > ui-graph.conf
  # @jonathan/ui-react
  sed "s|replaceIp|$front_ip|g; s|uiReactLocation|$ui_react_path|g; s|errorLocation|$error_path|g" ../../../install/legacy/ui-react.conf > ui-react.conf
  mv ui-style.conf /etc/nginx/conf.d/
  mv ui-graph.conf /etc/nginx/conf.d/
  mv ui-react.conf /etc/nginx/conf.d/
fi

mkdir /etc/nginx/snippets
cp ../../../install/legacy/self-signed.conf /etc/nginx/snippets/self-signed.conf
cp ../../../install/legacy/ssl-params.conf /etc/nginx/snippets/ssl-params.conf

# api conf
sed "s|replaceIp|$api_ip|g; s|apiPort|$api_port|g; s|listenConfig|$nginx_listen_config|g" ../../../install/legacy/api.conf > api.conf
mv api.conf ../../../install/legacy
cp ../../../install/legacy/api.conf /etc/nginx/conf.d/


nginx -t
service nginx start
