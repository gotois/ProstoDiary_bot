# ProstoDiary
[![Build Status](https://travis-ci.org/gotois/ProstoDiary_bot.svg?branch=master)](https://travis-ci.org/gotois/ProstoDiary_bot)
[![dependencies Status](https://david-dm.org/gotois/ProstoDiary_bot/status.svg)](https://david-dm.org/gotois/ProstoDiary_bot)
[![devDependencies Status](https://david-dm.org/gotois/ProstoDiary_bot/dev-status.svg)](https://david-dm.org/gotois/ProstoDiary_bot?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/gotois/ProstoDiary_bot/badge.svg)](https://snyk.io/test/github/gotois/ProstoDiary_bot)
[![codecov](https://codecov.io/gh/gotois/ProstoDiary_bot/branch/master/graph/badge.svg)](https://codecov.io/gh/gotois/ProstoDiary_bot)
[![Maintainability](https://api.codeclimate.com/v1/badges/709ebb5f0eae1d062e5e/maintainability)](https://codeclimate.com/github/gotois/ProstoDiary_bot/maintainability)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/gotois/ProstoDiary_bot.svg?style=popout)
![GitHub repo size](https://img.shields.io/github/repo-size/gotois/ProstoDiary_bot.svg)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/m/gotois/ProstoDiary_bot.svg)](https://github.com/gotois/ProstoDiary_bot/commits/master)
[![Website](https://img.shields.io/website/https/prosto-diary.gotointeractive.com.svg?link=https://prosto-diary.gotointeractive.com)](https://prosto-diary.gotointeractive.com)
[![GitHub](https://img.shields.io/github/license/gotois/ProstoDiary_bot.svg)](https://github.com/gotois/ProstoDiary_bot/blob/master/LICENSE)
[![Issuehunt](https://img.shields.io/badge/ProstoDiary_bot-blueviolet.svg?link=https://issuehunt.io/r/gotois/ProstoDiary_bot&style=flat&label=issuehunt.io)](https://issuehunt.io/r/gotois/ProstoDiary_bot)

Install
---
```bash
brew install git-lfs
chmod +x scripts/index
npm rebuild
npm i
```
На Node 12 пакеты сразу могу не встать, поэтому рекомендуется установить сначала devDependencies, а затем dependencies

## Tests

### Unit
#### Checking Unit tests:
```bash
npm run unit
```

### E2E
#### Match files:

Example:
```
npm run e2e:fast -- --match='/start'
```

Example match titles starting with API:
```
npm run e2e -- --match='API:*'
```

Run
---
### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

CI
---
Необходимо выставить env:
* SALT_PASSWORD
* SERVER_NAME
* TELEGRAM_TOKEN

### Tools
#### Package upgrade
```bash
npx ncu -u
```

#### Fix lint
```bash
npm run lint -- --fix
```

#### docs
```
cd docs
bundle exec jekyll serve
```

Global Bot Environments
---
```
Name: ProstoDiary
Username: @ProstoDiary_bot
```

Run Telegram Bot
```
/start
```

License:
---
see LICENSE file

goto Interactive Software
