[![Build Status](https://travis-ci.org/tewst/ProstoDiary_bot.svg?branch=master)](https://travis-ci.org/tewst/ProstoDiary_bot) 
[![dependencies Status](https://david-dm.org/tewst/ProstoDiary_bot/status.svg)](https://david-dm.org/tewst/ProstoDiary_bot) 
[![devDependencies Status](https://david-dm.org/tewst/ProstoDiary_bot/dev-status.svg)](https://david-dm.org/tewst/ProstoDiary_bot?type=dev) 

Installing:
---
```bash
npm install
```
Выполните SQL запросы на создание таблицы  (запросы содержатся в директории /SQL)

Usage:
---
Постоянная проверка тест-юнитов:
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
Необязательные:
```
PLOTLY_LOGIN={ plotly login }
PLOTLY_TOKEN={ plotly token }
```

Bot Environments:
---
Name: ProstoDiary

Username: @ProstoDiary_bot

Commands:
---
```
Скачать txt описание на устройство:
/download

Очистить базу данных пользователя с подтверждением:
/dbclear

Получить все что я делал за эту дату:
/get 26.11.2016

Установить что я делал в эту дату:
/set 26.11.2016 something text

Получить график:
/graph something text
```

License:
---
goto Interactive Software.

Licensed under the GPLv3 License.
