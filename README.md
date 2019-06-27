# ProstoDiary
[![Build Status](https://travis-ci.org/gotois/ProstoDiary_bot.svg?branch=master)](https://travis-ci.org/gotois/ProstoDiary_bot)
[![dependencies Status](https://david-dm.org/gotois/ProstoDiary_bot/status.svg)](https://david-dm.org/gotois/ProstoDiary_bot)
[![devDependencies Status](https://david-dm.org/gotois/ProstoDiary_bot/dev-status.svg)](https://david-dm.org/gotois/ProstoDiary_bot?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/gotois/ProstoDiary_bot/badge.svg)](https://snyk.io/test/github/gotois/ProstoDiary_bot)
[![codecov](https://codecov.io/gh/gotois/ProstoDiary_bot/branch/master/graph/badge.svg)](https://codecov.io/gh/gotois/ProstoDiary_bot)
[![Maintainability](https://api.codeclimate.com/v1/badges/709ebb5f0eae1d062e5e/maintainability)](https://codeclimate.com/github/gotois/ProstoDiary_bot/maintainability)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/gotois/ProstoDiary_bot.svg?style=popout)
![GitHub repo size](https://img.shields.io/github/repo-size/gotois/ProstoDiary_bot.svg)

Install
---
```bash
brew install git-lfs
chmod +x scripts/index
npm rebuild
npm i
```
На Node 12 пакеты сразу могу не встать, поэтому рекомендуется установить сначала devDependencies, а затем dependencies

Package upgrade
---
```bash
npx ncu -u
```

Usage
===
Fix lint:
```bash
npm run lint -- --fix
```

Checking Unit tests:
```bash
npm run unit
```

E2E
---
#### Match files:
npm run e2e:fast -- --match='something'

Example:
```
npm run e2e:fast -- --match='/start'
```

Example match titles starting with API:
```
npm run e2e -- --match='API:*'
```

Run development:
```bash
npm run dev
```

Run production:
```bash
npm start
```

CI
---
Необходимо выставить env:
* SALT_PASSWORD
* SERVER_NAME
* TELEGRAM_TOKEN

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

docs
---
```
cd docs
bundle exec jekyll serve
```

License:
---
see LICENSE file

goto Interactive Software
