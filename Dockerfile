FROM node:21-7.3-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ENV NODE_ENV production


RUN npm run build

CMD ["npm", "run", "start:prod"]