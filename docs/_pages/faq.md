---
layout: page
title: F.A.Q.
permalink: /faq/
---

### Не получается установить зависимости
На Node 12 пакеты сразу могу не встать, поэтому рекомендуется установить сначала devDependencies, а затем dependencies

### Не приходят вебхуки с почты
В Event Notification Mail Settings надо указать путь вида `https://7d4a7fb7.eu.ngrok.io/mail`. Настроить https://app.sendgrid.com/settings/mail_settings

### Где получить свой Authorization Token?
Хранится в БД `assistant`
```sql
select token from assistant
```

### Хочу делать API запросы через cURL 
Пример API запроса без параметров (Authorization Token):
```bash
curl -X POST -H "Authorization: Bearer YOUR_JWT_TOKEN" -H "Content-Type: application/json" -H "Accept: application/schema+json" --data '{"jsonrpc":"2.0","method":"ping","params":{},"id":1}' http://127.0.0.1:9000/api/ping
```

Пример API запроса с параметрами (Authorization Token):
```bash
curl -X POST -H "Authorization: Bearer YOUR_JWT_TOKEN" -H "Content-Type: application/json" -H "Accept: application/schema+json" --data '{"jsonrpc":"2.0","method":"help","params":'{"jsonrpc":"2.0","method":"ping","params":{"@context":{"schema":"http://schema.org/","agent":"schema:agent","name":"schema:name"},"@type":"AllocateAction","agent":{"@type":"Person","name":"prosto-diary"},"name":"Ping", ... }}}},"id":1}'' http://127.0.0.1:9000/api
```

### Хочу получать JSON данные своего сообщения:
Пример получения JSON данных истории (Basic Auth):
```bash
curl --basic -u "user_email:master_password" -H "Accept: application/json" http://0.0.0.0:9000/message/73050f7c-2781-4f1a-b9f7-992f1d65f22e
```

### Падает CI с неизвестной ошибкой
* Проверить логи CI
* На TravisCI нельзя указывать пробелы в env
> "END PRIVATE KEY" для `DIALOGFLOW_CREDENTIALS` и `GOOGLE_APPLICATION_CREDENTIALS` надо заменить такие пробелы на `\ `

### Не получается выполнить билд
Попробуй сначала `npm rebuild`

### Oauth падает с непонятной ошибкой
Сначала выполни npm run dev, затем зайди в админку провайдера Oauth и поменяй callback урл на ngrok вида https://xxx.ngrok.io/connect/yandex/callback

### Oath Facebook паадет с ошибкой
> URL заблокирован: Не удалось выполнить переадресацию, поскольку конечный URI не внесен в «белый» список в разделе приложения «Клиентские настройки OAuth
- Зайти в консоль Facebook в раздел https://developers.facebook.com/apps/:YOURAPP/fb-login/settings/
- Поставить в поле Действительные URI перенаправления для OAuth значение `https://e692b549.eu.ngrok.io/connect/facebook/callback`

### Telegram commands
```
/help
```

### Как добавить новый интент в SQL?
```sqlite-psql
ALTER TYPE intent ADD VALUE 'intent_name';
```

### Не приходят уведомления к боту через группу
Нужно настроить `/setprivacy` ENABLED в @BotFather
Сделать бота админом группы

### Описание синтаксиса JSON-LD (необходимые)
- @context 
> Должен быть расширенного вида
- @type
> На данный момент используется только типы Action
- agent
-- email 
> Email подключенного ассистента

- participant
-- email
> Email бота пользователя

- subjectOf

- object
-- @type
> Тип вида Thing

-- name 
> Описание свойства

-- abstract
> Content данных. Кириллица не поддерживается. Если используется несколько файлов - тогда ZIP архив формата Base64

-- encodingFormat
> MIME Content

## При Oauth Yandex ошибка 400 Required parameter 'client_id' missing
Проверьте правильность Environments

## No supported authentication method(s) available. Unable to login.
Созданного бота необходимо авторизовать в Яндекс самостоятельно

### Не приходят данные созданные пользователем к боту
Нужно зайти в почту бота и проверить что они не находятся в папке спам писем

## Хочу напрямую из БД узнать какой текст записался в историю
```sql
select encode(content, 'escape') as text_content from story where id = 'b8ea5534-7a39-4846-a559-fb480f57bc14'
``

### Очистить БД
```sql
DROP USER IF EXISTS bot;
DROP ROLE IF EXISTS demo;

DROP TYPE IF EXISTS TAG CASCADE;
DROP TYPE IF EXISTS STATUS_TYPE CASCADE;

DROP MATERIALIZED VIEW public.story;

DROP SCHEMA passport CASCADE;
DROP SCHEMA story CASCADE;

DROP TABLE IF EXISTS story.message CASCADE;
DROP TABLE IF EXISTS passport.user CASCADE;
DROP TABLE IF EXISTS passport.bot CASCADE;
``` 
