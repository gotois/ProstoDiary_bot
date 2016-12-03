[![Build Status](https://travis-ci.org/tewst/ProstoDiary_bot.svg?branch=master)](https://travis-ci.org/tewst/ProstoDiary_bot)

Установка
---
```bash
npm install
```
Выполните SQL запросы на создание таблицы  (запросы содержатся в директории /SQL)

Разработка:
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

Bot Environments:
---
Name: ProstoDiary

Username: @ProstoDiary_bot

Комманды:
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
```
