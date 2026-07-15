FROM node:26 AS build

LABEL org.opencontainers.image.authors="Denis Baskovsky <denis@baskovsky.ru>"

WORKDIR /app

COPY package.json ./
COPY bin/* ./bin/
COPY scripts/* ./scripts/
COPY src/ ./src/

ENV HUSKY=0
RUN npm install --omit=dev --ignore-scripts --legacy-peer-deps

RUN mkdir -p /app/database && chmod -R 777 /app/database

USER node

ENTRYPOINT [ "node", "--watch", "src/index.ts", "--port=8888" ]
