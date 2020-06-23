FROM node:10.18-stretch

WORKDIR /assets

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . /assets