#!/bin/bash

master_ip=''
package_name='ui-style'
listen_port='8081'
container_port='8084'

while getopts c:i: opt
do
  case $opt in
    c)
      install_package=$OPTARG
      ;;
    i)
      master_ip=$OPTARG
      ;;
    *)
      exit 0
      ;;
  esac
done

# 전체 설치
if [ $install_package == '1' ]; then
echo "아직 지원되지 않습니다."
elif [ $install_package == '2' ]; then
# ui-style 설치
package_name='ui-style'
listen_port='8081'
container_port='8084'
elif [ $install_package == '3' ]; then
# ui-graph 설치
package_name='ui-graph'
listen_port='8082'
container_port='8085'
elif [ $install_package == '4' ]; then
# ui-react 설치
package_name='ui-react'
listen_port='8083'
container_port='8086'
fi

service_name="jp:$package_name"

# 도커 생성
docker build -t "$service_name" --build-arg PACKAGE=$install_package -f DockerfileUI . ;

# 도커 실행
docker run -p "$container_port:3000" --name "$package_name" --restart always -d "$service_name";

# conf 수정
rm -rf /etc/nginx/sites-enabled/default;
cp ./install/ui-package/nginx/ui-package.conf -f /etc/nginx/conf.d/$package_name.conf;
sed -i "s/replaceIp/$master_ip/" /etc/nginx/conf.d/$package_name.conf;
sed -i "s/replacePort/$container_port/" /etc/nginx/conf.d/$package_name.conf;
sed -i "s/serverName/$master_ip/" /etc/nginx/conf.d/$package_name.conf;
sed -i "s/listenPort/$listen_port/" /etc/nginx/conf.d/$package_name.conf;

# nginx 재시작
nginx -s reload
