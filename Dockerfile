FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i --production --omit=dev

COPY . .

CMD [ "node", "server.js" ]