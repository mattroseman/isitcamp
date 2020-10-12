FROM node:13.7.0

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "start"]
