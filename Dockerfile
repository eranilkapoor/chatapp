FROM node:12.16.0

WORKDIR /Library/WebServer/Documents/chatapp

COPY package.json .

RUN npm install

EXPOSE 3000

COPY . .

CMD [ "npm", "start" ]