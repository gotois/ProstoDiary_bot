---
layout: page
title: F.A.Q.
permalink: /faq/
---

### Не получается установить зависимости
На Node 12 пакеты сразу могу не встать, поэтому рекомендуется установить сначала devDependencies, а затем dependencies

### Не приходят вебхуки с почты
В Event Notification Mail Settings надо указать путь вида `https://7d4a7fb7.eu.ngrok.io/mail`. Настроить https://app.sendgrid.com/settings/mail_settings

### Хочу делать API запросы через cURL 
Пример запроса без параметров:
```
curl --digest -u "user:password" -X POST -H "Content-Type: application/json" -H "Accept: application/json" --data '{"jsonrpc":"2.0","method":"ping","id":1}' http://127.0.0.1:9000/api
```
Пример запроса с параметрами:
```
curl --digest -u "demo:demo" -X POST -H "Content-Type: application/json" -H "Accept: application/json" --data '{"jsonrpc":"2.0","method":"help","params":{"id":1},"id":1}' http://127.0.0.1:9000/api
```

### Падает CI с неизвестной ошибкой
* Проверить логи CI
* На TravisCI нельзя указывать пробелы в env
> "END PRIVATE KEY" для `DIALOGFLOW_CREDENTIALS` и `GOOGLE_APPLICATION_CREDENTIALS` надо заменить такие пробелы на `\ `

### Не получается выполнить билд
Попробуй сначала `npm rebuild`

### Oauth падает с непонятной ошибкой
Сначала выполни npm run dev, затем зайди в админку провайдера Oauth и поменяй callback урл на ngrok вида https://xxx.ngrok.io/connect/yandex/callback

### Telegram commands
```
/help
```

### Как добавить новый интент в SQL?
```sqlite-psql
ALTER TYPE intent ADD VALUE 'intent_name';
```
