FROM node:12.16.0

WORKDIR /Library/Webserver/chatapp

COPY package.json .

RUN npm install

EXPOSE 3000

CMD [ "npm", "start" ]

COPY . .