FROM node:10.18-stretch

RUN apt-get update && apt-get install -y --no-install-recommends \
    firefox-esr && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /assets

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . /assets