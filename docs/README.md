# Secretary: your personal assistant

[![Website](https://img.shields.io/website/https/prosto-diary.gotointeractive.com.svg?link=https://prosto-diary.gotointeractive.com)](https://prosto-diary.gotointeractive.com)
[![Known Vulnerabilities](https://snyk.io/test/github/gotois/ProstoDiary_bot/badge.svg)](https://snyk.io/test/github/gotois/ProstoDiary_bot)
[![codecov](https://codecov.io/gh/gotois/ProstoDiary_bot/branch/master/graph/badge.svg)](https://codecov.io/gh/gotois/ProstoDiary_bot)
[![Maintainability](https://api.codeclimate.com/v1/badges/709ebb5f0eae1d062e5e/maintainability)](https://codeclimate.com/github/gotois/ProstoDiary_bot/maintainability)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/gotois/ProstoDiary_bot.svg?style=popout)
![GitHub repo size](https://img.shields.io/github/repo-size/gotois/ProstoDiary_bot.svg)
![Docker Image](https://img.shields.io/docker/image-size/qertis/secretary-tg)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/m/gotois/ProstoDiary_bot.svg)](https://github.com/gotois/ProstoDiary_bot/commits/master)
[![License: Common Public License Version 1.0](https://img.shields.io/badge/License-CPL-blue.svg)](https://github.com/gotois/ProstoDiary_bot/blob/master/LICENSE)
[![Issuehunt](https://img.shields.io/badge/issuehunt.io-blueviolet.svg?link=https://issuehunt.io/r/gotois/ProstoDiary_bot&style=flat&label=jobs)](https://issuehunt.io/r/gotois/ProstoDiary_bot)

## About

Text diary, food analyze, health watcher, sleep analyze

Install
---

> Dev only

```bash
npm i
chmod +x scripts/prepare
scripts/prepare
```

### ENVIRONMENTS

Create a `.env` file and write:

`TELEGRAM_TOKEN`

`TELEGRAM_DOMAIN`

`TELEGRAM_MINI_APP`

`SERVER_HOST`

`SERVER_APP`

## Tests

### Unit

```bash
npm run test:unit [-- --watch]
#npm run test:unit [-- --match='config']
```

Tools
---

### Package upgrade

```bash
ncu -u
```

#### Fix lint

```bash
npm run lint -- --fix --quite
```

#### Show dependencies graph

```bash
brew install graphviz
npm run report:dependency
```

#### Validate dependencies 

```bash
npm run lint:dependency
```

#### docs only Dev

Install

```bash
sudo gem install bundler jekyll
cd docs
bundle install
```

Run

```bash
npm run dev:docs
```

## Docker Image

```bash
docker compose --env-file .env up --build
```

### Run Telegram Bot Dev

```bash
docker compose --env-file .env up -d
```

Возможности управления системой

1) `something text` - Уведомление
2) `? something search` - Поиск
3) `! something execute` - Выполнение поручения

---
Make with [Manifest GIC DAO](https://gotointeractive.com/manifest).
