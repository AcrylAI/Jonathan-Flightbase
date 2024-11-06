#! /bin/bash
# sudo ./installer.sh -h 192.168.1.105 -p 56789 -l 192.168.1.105

# ip
front_ip=''
# api server ip
api_ip=''
# api port 
api_port=''
# build config
front_build_config='default'
# protocol ('http' | 'https')
protocol_config='http'
# ui guide
ui_guide=''
# marker ip
marker_url=''
# enc key 
enc_key=''
# iv
iv=''


while getopts h:p:l:c:r:u:s:m:e:i: opt
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
    c)
      front_build_config=$OPTARG
      ;;
    r)
      protocol_config=$OPTARG
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

# index.html 설정 값
favicon_item='favicon.ico'
title_item='JONATHAN'

# api 요청 port 설정
if [ $api_port == '80' ] || [ $api_port == '' ]; then
  api_call_port=""
else
  api_call_port=":$api_port"
fi

if [ $api_ip == '' ]; then
  api_ip=$front_ip
fi

if [ $marker_url == '' ]; then
  marker_url="$front_ip:9000"
fi

# yarn 설치
npm install -g yarn
yarn install --network-timeout 600000
yarn build-pack:all


if [ $front_build_config == 'kisti' ]; then
  sed "s|api-url|$protocol_config://$api_ip$api_call_port/api/|g; s|marker-url|$protocol_config://$marker_url/|g" ./install/flight-base/config-kisti > .env.kisti
  mv -f .env.kisti apps/flightbase/configs/app-config/vite-env/
  favicon_item='images/custom/DNA+DRONE.ico'
  title_item='DNA+DRONE'
  sed "s|faviconItem|$favicon_item|g; s|titleItem|$title_item|g" ./install/flight-base/index.html > index.html
  mv -f index.html apps/flightbase/
  yarn workspace @jonathan/flightbase build:kisti
  cd ./apps/flightbase/build
elif [ $front_build_config == 'etri' ]; then
  sed "s|api-url|$protocol_config://$api_ip$api_call_port/api/|g; s|marker-url|$protocol_config://$marker_url/|g" ./install/flight-base/config-etri > .env.etri
  mv -f .env.etri apps/flightbase/configs/app-config/vite-env/
  favicon_item='images/custom/DNA+DRONE.ico'
  title_item='DNA+DRONE'
  sed "s|faviconItem|$favicon_item|g; s|titleItem|$title_item|g" ./install/flight-base/index.html > index.html
  mv -f index.html apps/flightbase/
  yarn workspace @jonathan/flightbase build:etri
  cd ./apps/flightbase/build
elif [ $front_build_config == 'cbtp' ]; then
  sed "s|api-url|$protocol_config://$api_ip$api_call_port/api/|g; s|marker-url|$protocol_config://$marker_url/|g" ./install/flight-base/config-cbtp > .env.cbtp
  mv -f .env.cbtp apps/flightbase/configs/app-config/vite-env/
  sed "s|faviconItem|$favicon_item|g; s|titleItem|$title_item|g" ./install/flight-base/index.html > index.html
  mv -f index.html apps/flightbase/
  yarn workspace @jonathan/flightbase build:cbtp
  cd ./apps/flightbase/build
elif [ $front_build_config == 'wellcare' ]; then
  sed "s|api-url|$protocol_config://$api_ip$api_call_port/api/|g; s|marker-url|$protocol_config://$marker_url/|g" ./install/flight-base/config-wellcare > .env.wellcare
  mv -f .env.wellcare apps/flightbase/configs/app-config/vite-env/
  sed "s|faviconItem|$favicon_item|g; s|titleItem|$title_item|g" ./install/flight-base/index.html > index.html
  mv -f index.html apps/flightbase/
  yarn workspace @jonathan/flightbase build:wellcare
  cd ./apps/flightbase/build
elif [ $front_build_config == 'keti' ]; then
  sed "s|api-url|$protocol_config://$api_ip$api_call_port/api/|g; s|marker-url|$protocol_config://$marker_url/|g" ./install/flight-base/config-keti > .env.keti
  mv -f .env.keti apps/flightbase/configs/app-config/vite-env/
  sed "s|faviconItem|$favicon_item|g; s|titleItem|$title_item|g" ./install/flight-base/index.html > index.html
  mv -f index.html apps/flightbase/
  yarn workspace @jonathan/flightbase build:keti
  cd ./apps/flightbase/build
elif [ $front_build_config == 'dgtp' ]; then
  sed "s||$protocol_config://$api_ip$api_call_port/api/|g; s|marker-url|$protocol_config://$marker_url/|g" ./install/flight-base/config-dgtp > .env.dgtp
  mv -f .env.dgtp apps/flightbase/configs/app-config/vite-env/
  sed "s|faviconItem|$favicon_item|g; s|titleItem|$title_item|g" ./install/flight-base/index.html > index.html
  mv -f index.html apps/flightbase/
  yarn workspace @jonathan/flightbase build:dgtp
  cd ./apps/flightbase/build
elif [ $front_build_config == 'hanlim' ]; then
  sed "s|api-url|$protocol_config://$api_ip$api_call_port/api/|g" ./install/flight-base/config-hanlim > .env.hanlim
  mv -f .env.dgtp apps/flightbase/configs/app-config/vite-env/
  sed "s|faviconItem|$favicon_item|g; s|titleItem|$title_item|g" ./install/flight-base/index.html > index.html
  mv -f index.html apps/flightbase/
  yarn workspace @jonathan/flightbase build:hanlim
  cd ./apps/flightbase/build
elif [ $front_build_config == 'integration' ]; then
  sed "s|api-url|$protocol_config://$api_ip$api_call_port/api/|g; s|marker-url|$protocol_config://$marker_url/|g" ./install/flight-base/config-integration > .env.integration
  mv -f .env.integration apps/flightbase/configs/app-config/vite-env/
  sed "s|faviconItem|$favicon_item|g; s|titleItem|$title_item|g" ./install/flight-base/index.html > index.html
  mv -f index.html apps/flightbase/
  yarn workspace @jonathan/flightbase build:integration
  cd ./apps/flightbase/build
elif [ $front_build_config == 'dev' ]; then
  sed "s|api-url|$protocol_config://dev.flightbase.acryl.ai/api/|g; s|marker-url|$protocol_config://$marker_url/|g" ./install/flight-base/config-real > .env.real
  mv -f .env.real apps/flightbase/configs/app-config/vite-env/
  sed "s|faviconItem|$favicon_item|g; s|titleItem|$title_item|g" ./install/flight-base/index.html > index.html
  mv -f index.html apps/flightbase/
  yarn workspace @jonathan/flightbase build:real
  cd ./apps/flightbase/build
else
  if [ $api_ip == $front_ip ]; then
    sed "s|api-url||g; s|marker-url|$protocol_config://$marker_url/|g; s|enc-key|${enc_key//\//\\/}|g; s|iv|${iv//\//\\/}|g" ./install/flight-base/config-real > .env.real
  else
    sed "s|api-url|$protocol_config://$api_ip$api_call_port/api/|g; s|marker-url|$protocol_config://$marker_url/|g; s|enc-key|${enc_key//\//\\/}|g; s|iv|${iv//\//\\/}|g" ./install/flight-base/config-real > .env.real
  fi
  mv -f .env.real apps/flightbase/configs/app-config/vite-env/
  sed "s|faviconItem|$favicon_item|g; s|titleItem|$title_item|g" ./install/flight-base/index.html > index.html
  mv -f index.html apps/flightbase/
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

if [ $protocol_config == 'https' ]; then
  nginx_listen_config=' http2 ssl'
fi

ui_style_path='/front-data/packages/ui/ui-style/dist'
ui_graph_path='/front-data/packages/ui/ui-graph/dist'
ui_react_path='/front-data/packages/ui/ui-react/storybook-static'
error_path='/front-data/apps/flightbase'
# @jonathan/flightbase nginx conf
sed "s|replaceIp|$front_ip|g; s|rootLocation|$project_path|g; s|errorLocation|$error_path|g; s|apiPort|$api_port|g; s|protocolConfig|$protocol_config|g; s|listenConfig|$nginx_listen_config|g" ../../../install/flight-base/jp.conf > jp.conf
mv jp.conf /etc/nginx/conf.d/

if [ $ui_guide == 'true' ]; then
  # @jonathan/ui-style
  sed "s|replaceIp|$front_ip|g; s|uiStyleLocation|$ui_style_path|g; s|errorLocation|$error_path|g" ../../../install/flight-base/ui-style.conf > ui-style.conf
  # @jonathan/ui-graph
  sed "s|replaceIp|$front_ip|g; s|uiD3Location|$ui_d3_path|g; s|errorLocation|$error_path|g" ../../../install/flight-base/ui-graph.conf > ui-graph.conf
  # @jonathan/ui-react
  sed "s|replaceIp|$front_ip|g; s|uiReactLocation|$ui_react_path|g; s|errorLocation|$error_path|g" ../../../install/flight-base/ui-react.conf > ui-react.conf
  mv ui-style.conf /etc/nginx/conf.d/
  mv ui-graph.conf /etc/nginx/conf.d/
  mv ui-react.conf /etc/nginx/conf.d/
fi

mkdir /etc/nginx/snippets
cp ../../../install/flight-base/self-signed.conf /etc/nginx/snippets/self-signed.conf
cp ../../../install/flight-base/ssl-params.conf /etc/nginx/snippets/ssl-params.conf

# api conf
sed "s|replaceIp|$api_ip|g; s|apiPort|$api_port|g; s|listenConfig|$nginx_listen_config|g;" ../../../install/flight-base/api.conf > api.conf
mv api.conf ../../../install/flight-base/
cp ../../../install/flight-base/api.conf /etc/nginx/conf.d/


nginx -t
service nginx start
