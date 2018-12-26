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
* Grant roles > SQL/roles.sql
* Create user table > SQL/table_users.sql
* Create entries table > SQL/table_entries.sql
```

Run Telegram Bot
```
/start
```

After change node version
```bash
npm rebuild
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

Server Environments (needs update file .env in root project)
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
GOOGLE_APPLICATION_CREDENTIALS={ one line stringify object } 

DIALOGFLOW_CREDENTIALS={ one line stringify object } 
# You can find your project ID in your Dialogflow agent settings https://dialogflow.com/docs/agents#settings
DIALOGFLOW_PROJECT_ID={ project_id }

NALOGRU_EMAIL={ nalog.ru email }
NALOGRU_NAME={ nalog.ru имя }
NALOGRU_PHONE={ nalog.ru телефон }
NALOGRU_KP_PASSWORD={ nalog.ru password  } #это вводится пользователем после kpSignUp (proverkacheka.nalog.ru:9999/v1/mobile/users/signup)
```

Global Bot Environments
---
Name: ProstoDiary

Username: @ProstoDiary_bot

Telegram commands
---
```
help - Помощь по командам
download - Загрузка файла с данными /download
dbclear - Удаление БД /dbclear YES
graph - Построение графиков /graph String|RegExp
get - Получение данных за этот срок /get YYYY-MM-DD | /get today
set - Добавление данных за этот срок /set YYYY-MM-DD something
count - Подсчет потраченого /count - и полученного /count +
search - Поиск вхождения /search something
version - Получение версии /version
```

License:
---
goto Interactive Software

Licensed under the GPLv3 License.
