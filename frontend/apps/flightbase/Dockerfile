FROM nginx
RUN apt-get update && apt-get install -y vim build-essential libssl-dev curl git-core make wget python3 sudo openssl && curl -sL https://deb.nodesource.com/setup_15.x | bash - && apt-get install -y nodejs

COPY jfb-dev.conf /etc/nginx/conf.d
COPY . /home/fb-front
WORKDIR /home/fb-front
RUN npm install -g yarn && yarn install
# RUN yarn build:real
# RUN service nginx restart
