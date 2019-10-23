---
layout: page
title: F.A.Q.
permalink: /faq/
---

### Не получается установить зависимости
На Node 12 пакеты сразу могу не встать, поэтому рекомендуется установить сначала devDependencies, а затем dependencies

## Хочу делать запросы через cURL 
Пример запроса без параметров:
```
curl -X POST -H "Content-Type: application/json" -H "Accept: application/json" --data '{"jsonrpc":"2.0","method":"ping","id":67}' http://127.0.0.1:9090/api
```
Пример запроса с параметрами:
```
curl -X POST -H "Content-Type: application/json" -H "Accept: application/json" --data '{"jsonrpc":"2.0","method":"help","params":{"id":1},"id":67}' http://127.0.0.1:9090/api
```

### Падает CI с неизвестной ошибкой
* Проверить логи CI
* На TravisCI нельзя указывать пробелы в env
> "END PRIVATE KEY" для `DIALOGFLOW_CREDENTIALS` и `GOOGLE_APPLICATION_CREDENTIALS` надо заменить такие пробелы на `\ `

### Не получается выполнить билд.
Попробуй `npm rebuild`

### Telegram commands
```
/help
```

### Как добавить новый интент в SQL?
```sqlite-psql
ALTER TYPE intent ADD VALUE 'intent_name';
```
