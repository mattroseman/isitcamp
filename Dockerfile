FROM node:13.7.0

WORKDIR /usr/src/app

RUN npm install

COPY . .

RUN npm run client-build

RUN npm run build

CMD ["npm", "start"]
