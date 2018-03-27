# ProstoDiary
[![Build Status](https://travis-ci.org/gotois/ProstoDiary_bot.svg?branch=master)](https://travis-ci.org/gotois/ProstoDiary_bot)
[![dependencies Status](https://david-dm.org/gotois/ProstoDiary_bot/status.svg)](https://david-dm.org/gotois/ProstoDiary_bot)
[![devDependencies Status](https://david-dm.org/gotois/ProstoDiary_bot/dev-status.svg)](https://david-dm.org/gotois/ProstoDiary_bot?type=dev)
[![codecov](https://codecov.io/gh/gotois/ProstoDiary_bot/branch/master/graph/badge.svg)](https://codecov.io/gh/gotois/ProstoDiary_bot)
[![Maintainability](https://api.codeclimate.com/v1/badges/709ebb5f0eae1d062e5e/maintainability)](https://codeclimate.com/github/gotois/ProstoDiary_bot/maintainability)

Install
---
```bash
npm i
```

```bash
chmod +x bin/index 
```

```
Setup PostgreSQL 10.2+
* Create database ProstoDiaryDB
* Create user table > SQL/table_users.sql
* Create entries table > SQL/table_entries.sql
```

```
Run Telegram Bot
/start
```

Usage
---
Checking Unit tests:
```bash
npm run test:watch
```

Run development:
```bash
npm run dev
```

Run production:
```bash
npm start
```

Server Environments (needs update .env file)
---
```
TOKEN={ Your telegram bot token like 1234567890:AAA-qwertyuiopasdfghjklzxcvbnmqwert }
HEROKU_NAME={ Your heroku server name }
SALT_PASSWORD={ User salt password }
HOST={ database host }
DATABASE={ database name }
DB_USER={ database username }
DBPORT={ database port }
PASSWORD={ database password }

# Optional variables
PLOTLY_LOGIN={ plotly login }
PLOTLY_TOKEN={ plotly token }
GOOGLE_MAPS_GEOCODING_API={ geocoding key }
GOOGLE_APPLICATION_CREDENTIALS={ Path to your Google Natural Language.json }
```

Global Bot Environments
---
Name: ProstoDiary

Username: @ProstoDiary_bot

Telegram commands
---
```
/help
```

License:
---
goto Interactive Software

Licensed under the GPLv3 License.
