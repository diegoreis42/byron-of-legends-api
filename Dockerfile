
FROM node:21.7.2-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV production


RUN npm run build

CMD ["npm", "run", "start:prod"]