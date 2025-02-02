FROM node:22.8 AS build

MAINTAINER Denis Baskovsky <denis@baskovsky.ru>

WORKDIR /app

COPY package.json package-lock.json ./
COPY bin/* ./bin/
COPY scripts/* ./scripts/
COPY src/ ./src/

RUN npm install --omit=dev

USER node

ENTRYPOINT [ "node", "--experimental-sqlite", "--watch", "src/index.cjs" ]
