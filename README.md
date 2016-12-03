Установка
---
```
npm install
```

Постоянная проверка тест-юнитов
```
npm test -- --watch
```

Выполните SQL запросы на создание таблицы 
Запросы содержатся в директории SQL

Server Environments: 
---
TOKEN={ Your telegram bot token like 1234567890:AAA-qwertyuiopasdfghjklzxcvbnmqwert }
HEROKU_NAME={ Your heroku server name }
SALT_PASSWORD={ User salt password }
HOST={ database host }
DATABASE={ database name }
USER={ database username }
DBPORT={ database port }
PASSWORD={ database password }

Bot Environments:
---
Name: 
ProstoDiary

Username: 
ProstoDiary_bot

URL:
telegram.me/ProstoDiary_bot

Комманды
---
Скачать txt описание на устройство:
/download
Затем скачать файл

Очистить базу данных пользователя с подтверждением:
/dbclear

Получить все что я делал в эту дату:
/get 26.11.2016

Установить что я делал в какой-то день:
/set 26.11.2016 something text

---

MSG Редактируется через интерфейс Telegram

Пока удаление отдельного MSG не поддерживается

Все что пишешь просто в формате текста - записывается в сегодняшний день

Issues:
---
Для каждого пользователя "свой" пароль

Использовать CI
