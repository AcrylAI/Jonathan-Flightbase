#! /bin/bash
# setting.sh --docker_repository_dir=/var/lib/registry --docker_repository_port=5000
# TODO 
# REPOSITORY DIR 변경 후 default로 세팅하면 다시 디폴트로 돌아오는 부분은 어떻게?
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

# ln -s /mnt/docker_files_registry/ /var/lib/rg
if [ "$DOCKER_REPOSITORY_DIR" == "" ] || [ "$DOCKER_REPOSITORY_DIR" == "None" ];
then
  echo "SKIP SET Docker registry data dir "
  DOCKER_REPOSITORY_DIR="/var/lib/registry"
else
  mkdir -p $DOCKER_REPOSITORY_DIR
#   ln -s $DOCKER_REPOSITORY_DIR /var/lib/registry
fi

mkdir -p /etc/docker/registry/
cat > /etc/docker/registry/config.yml <<EOF
version: 0.1
log:
  fields:
    service: registry
storage:
  cache:
    blobdescriptor: inmemory
  filesystem:
    rootdirectory: /var/lib/registry
  delete:
    enabled: true
http:
  addr: :5000
  headers:
    X-Content-Type-Options: [nosniff]
health:
  storagedriver:
    enabled: true
    interval: 10s
    threshold: 3
EOF
docker rm -f $DOCKER_REPOSITORY_NAME

# docker run -d -p $DOCKER_REPOSITORY_PORT:5000 --restart always --name $DOCKER_REPOSITORY_NAME \
# -v $DOCKER_REPOSITORY_DIR:/var/lib/registry \
# -v /etc/docker/registry:/etc/docker/registry \
# -e REGISTRY_HTTP_ADDR=0.0.0.0:5000 \
# -e REGISTRY_STORAGE_DELETE_ENABLED=true registry:latest

# docker run -d -p $DOCKER_REPOSITORY_PORT:5000 --restart always --name $DOCKER_REPOSITORY_NAME \
# -v $DOCKER_REPOSITORY_DIR:/var/lib/registry \
# -v /etc/docker/registry:/etc/docker/registry \
# -v $DOCKER_SSL_KEY:$DOCKER_SSL_KEY \
# -v $DOCKER_SSL_CERT:$DOCKER_SSL_CERT \
# -v /root/test/dockerrepo-cert/certs:/certs \
# -e REGISTRY_HTTP_ADDR=0.0.0.0:5000 \
# -e REGISTRY_STORAGE_DELETE_ENABLED=true \
# -e REGISTRY_HTTP_TLS_CERTIFICATE=$DOCKER_SSL_CERT \
# -e REGISTRY_HTTP_TLS_KEY=$DOCKER_SSL_KEY \
# registry:latest


docker run -d -p $DOCKER_REPOSITORY_PORT:5000 --restart always --name $DOCKER_REPOSITORY_NAME \
-v $DOCKER_REPOSITORY_DIR:/var/lib/registry \
-v /etc/docker/registry:/etc/docker/registry \
-v $DOCKER_SSL_KEY:$DOCKER_SSL_KEY \
-v $DOCKER_SSL_CERT:$DOCKER_SSL_CERT \
-e REGISTRY_HTTP_ADDR=0.0.0.0:5000 \
-e REGISTRY_STORAGE_DELETE_ENABLED=true \
-e REGISTRY_HTTP_TLS_CERTIFICATE=$DOCKER_SSL_CERT \
-e REGISTRY_HTTP_TLS_KEY=$DOCKER_SSL_KEY \
registry:latest
