---
layout: page
title: F.A.Q.
permalink: /faq/
---

### Не получается установить зависимости
На Node 12 пакеты сразу могу не встать, поэтому рекомендуется установить сначала devDependencies, а затем dependencies

### Неработает CI
Необходимо выставить env:
* `SALT_PASSWORD`
* `TELEGRAM_TOKEN`

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
