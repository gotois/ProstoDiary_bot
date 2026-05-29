FROM node:26 AS build

MAINTAINER Denis Baskovsky <denis@baskovsky.ru>

WORKDIR /app

COPY package.json package-lock.json ./
COPY bin/* ./bin/
COPY scripts/* ./scripts/
COPY src/ ./src/

RUN npm install --omit=dev

RUN mkdir -p /app/database && chmod -R 777 /app/database

USER node

ENTRYPOINT [ "node", "--watch", "src/index.mjs" ]
