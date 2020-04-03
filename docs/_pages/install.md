---
layout: page
title: Installer
permalink: /install/
---

Heroku addons
---
* Coralogix logging addon 
* Heroku Postgres 
* Heroku Redis 
* Heroku Scheduler 
* Secure Key 
* SendGrid 
* Sentry

Server Environments
---
* Create ```.env``` file in root project for dev test
> You can find your project ID in your Dialogflow agent settings https://dialogflow.com/docs/agents#settings

* Create ```keys``` directory in root. Create google-natural-lang.json (example from Google API)

```
NODE_ENV={ production|TRAVIS_CI|test }
TELEGRAM_TOKEN={ Your telegram bot token like 1234567890:AAA-qwertyuiopasdfghjklzxcvbnmqwert }

PGUSER={ database username }
PGHOST={ database host }
PGPASSWORD={ database password }
PGDATABASE={ database name }
PGPORT={ database port }

GOOGLE_MAPS_GEOCODING_API={ geocoding key }
GOOGLE_APPLICATION_CREDENTIALS={ one line stringify object } 

DIALOGFLOW_CREDENTIALS={ one line stringify object } 
DIALOGFLOW_CREDENTIALS_SEARCH={ one line stringify object }

NALOGRU_EMAIL={ nalog.ru email }
NALOGRU_NAME={ nalog.ru имя }
NALOGRU_PHONE={ nalog.ru телефон }
NALOGRU_KP_PASSWORD={ nalog.ru password  } #это вводится пользователем после kpSignUp (proverkacheka.nalog.ru:9999/v1/mobile/users/signup)

SENDGRID_API_KEY={ api key }
SENDGRID_API_KEY_DEV={ api key }

OPEN_WEATHER_KEY={ api key }

YA_DICTIONARY={ api key }

FOURSQUARE_CLIEND_ID={ string }
FOURSQUARE_CLIENT_SECRET={ string }
FOURSQUARE_PUSH_SECRET={ string }
FOURSQUARE_REDIRECT_URI=http://localhost
FOURSQUARE_ACCESS_TOKEN={ string } # Чтобы получить token перейдите по ссылке и подтвердите привязку приложения. (В хэше открытого попапа будет  access token)

SENTRY_DSN={ URL }

GOOGLE_KNOWLEDGE_GRAPH={ key }
REDIS_URL={ URL } # вида 127.0.0.1:6379
```

<details>
	<summary>Setup PostgreSQL 11.0</summary>
* Create database storydb
* Import Foods table from data/database/tables/foods.csv
</details>

<details>
  	<summary>Setup DialogFlow</summary>
* Create <Food> in Entities
* Upload data/dialogflow/entities/food.csv
</details>

Посмотреть список параметров oidc:
---
http://localhost:9000/oidc/.well-known/openid-configuration

Привязка ассистента
---
Выполните `npm run start:new-assistant` и следуйте инструкциям

Примеры
---
## Telegram assistant
- https://e309e9db.ngrok.io/oidc/auth?client_id=tg&response_type=code&scope=openid%20email%20email%20profile

3) Введите email/password вашего бота в OpenID Connect

4) Вы перейдете на http://0.0.0.0:9000/oidcallback?code=EOB2dYP9V6ZO7H1fFVFVS81LAfLPTzXVFeiZDNXJQZ2
- Ассистент получает jwt
