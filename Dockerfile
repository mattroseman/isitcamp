FROM node:13.7.0

WORKDIR /usr/src/app

RUN npm install

COPY . .

RUN npm run build
