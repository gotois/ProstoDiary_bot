[![Build Status](https://travis-ci.org/tewst/ProstoDiary_bot.svg?branch=master)](https://travis-ci.org/tewst/ProstoDiary_bot) 
[![dependencies Status](https://david-dm.org/tewst/ProstoDiary_bot/status.svg)](https://david-dm.org/tewst/ProstoDiary_bot) 
[![devDependencies Status](https://david-dm.org/tewst/ProstoDiary_bot/dev-status.svg)](https://david-dm.org/tewst/ProstoDiary_bot?type=dev) 

Installing:
---
```bash
npm i
```
Execute SQL queries (it hosted in directory /SQL)

Usage:
---
Checking Unit tests:
```bash
npm test -- --watch
```

Server Environments: 
---
```
TOKEN={ Your telegram bot token like 1234567890:AAA-qwertyuiopasdfghjklzxcvbnmqwert }
HEROKU_NAME={ Your heroku server name }
SALT_PASSWORD={ User salt password }
HOST={ database host }
DATABASE={ database name }
USER={ database username }
DBPORT={ database port }
PASSWORD={ database password }
```
Optional:
```
PLOTLY_LOGIN={ plotly login }
PLOTLY_TOKEN={ plotly token }
```

Bot Environments:
---
Name: ProstoDiary

Username: @ProstoDiary_bot

Telegram commands:
---
```
download - Скачать txt описание на устройство
dbclear - Очистить базу данных пользователя
get - Получить все что я делал за эту дату
set - Что я делал в эту дату
graph - Построить график
```

License:
---
goto Interactive Software.

Licensed under the GPLv3 License.
