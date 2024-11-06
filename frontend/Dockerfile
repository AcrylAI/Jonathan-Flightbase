FROM nginx:1.24
RUN apt-get update && apt-get install -y vim apt-utils build-essential libssl-dev curl git-core make wget python3 sudo openssl && curl -sL https://deb.nodesource.com/setup_16.x | bash - && apt-get install -y nodejs
RUN node -v
