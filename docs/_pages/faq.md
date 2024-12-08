---
layout: page
title: F.A.Q.
permalink: /faq/
---

## Добавил бота в телеграм чат и он не читает записи

Нужно сделать бота администратором чата

## Отправляя PDF появляется ошибка

Сейчас есть ограничение на размер файла. Примерно в 100кб

### Не получается установить зависимости

Рекомендуется установить сначала devDependencies, а затем dependencies отдельной

### Не приходят вебхуки с почты

В Event Notification Mail Settings надо указать путь вида `https://7d4a7fb7.eu.ngrok.io/mail`. 
Настроить <https://app.sendgrid.com/settings/mail_settings>

### Хочу делать API запросы через cURL 

Пример API запроса:

```bash
curl -X POST \ 
-H "Verification: $MARKETPLACE_SIGN" \ 
-H "Authorization: Bearer $JWT_TOKEN" \ 
-H "Content-Type: application/json" \ 
-H "Accept: application/schema+json" \
--data '{"jsonrpc":"2.0","method":"ping","params": $ACTION_JSONLD,"id":1}' http://127.0.0.1:5555/api
```

### Хочу получать JSON данные своего сообщения через iTerm

Пример получения JSON данных истории (Basic Auth):

```bash
curl --basic -u "user_email:master_password" -H "Accept: application/json" http://0.0.0.0:9000/message/73050f7c-2781-4f1a-b9f7-992f1d65f22e
```

### Не получается выполнить билд

Попробуй сначала `npm rebuild`

## Где получить FOURSQUARE_ACCESS_TOKEN

Чтобы получить token перейдите по ссылке и подтвердите привязку приложения. 
(В хэше открытого попапа будет access token)

### OAuth падает с непонятной ошибкой

Сначала выполни npm run dev, затем зайди в админку провайдера Oauth и 
поменяй callback урл на ngrok вида <https://xxx.ngrok.io/connect/yandex/callback>

### OAuth Facebook паадет с ошибкой

> URL заблокирован: Не удалось выполнить переадресацию, поскольку конечный URI не внесен в 
> «белый» список в разделе приложения «Клиентские настройки OAuth

1. Зайти в консоль Facebook в раздел 
<https://developers.facebook.com/apps/:YOURAPP/fb-login/settings/>
2. Поставить в поле Действительные URI перенаправления для OAuth значение 
`https://e692b549.eu.ngrok.io/connect/facebook/callback`

## Забыл команды Telegram

`
/help
`

### Не приходят уведомления к боту через группу

Нужно настроить `/setprivacy` ENABLED в @BotFather
Сделать бота админом группы

### Описание синтаксиса JSON-LD (необходимые)

@context 
> Должен быть расширенного вида

@type
> На данный момент используется только типы Action

agent.email 
> Email подключенного ассистента

participant.email
> Email бота пользователя

subjectOf
> ...

object.@type
> Тип вида Thing

name 
> Описание свойства

abstract
> Content данных. Кириллица не поддерживается. 
> Если используется несколько файлов - тогда ZIP архив формата Base64

encodingFormat
> MIME Content

## Ошибка

`UnhandledPromiseRejectionWarning: Error: No supported authentication method(s) available. Unable to login.`

Удостоверьтесь, система Yandex PDD имеет такой email, 
и что вы завершили регистрацию в системе PDD самостоятельно приняв их пользовательское соглашение 

## При OAuth Yandex ошибка 400 Required parameter 'client_id' missing

Проверьте правильность Environments

## No supported authentication method(s) available. Unable to login

Созданного бота необходимо авторизовать в Яндекс самостоятельно

### Не приходят данные созданные пользователем к боту

Нужно зайти в почту бота и проверить что они не находятся в папке спам писем
