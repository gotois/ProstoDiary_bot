---
layout: page
title: Installer
permalink: /install/
---

Local addons
---
* Redis - https://redis.io/docs/stack/get-started/install/

Heroku addons
---

* Coralogix logging addon 
* Heroku Postgres 
* Heroku Redis 
* Heroku Scheduler 
* Secure Key 
* SendGrid 
* Sentry
* MemCachier

Server Environments
---

* Create ```.env``` file in root project for dev test

> You can find your project ID in your Dialogflow agent settings <https://dialogflow.com/docs/agents#settings>

* Create ```keys``` directory in root. Create google-natural-lang.json (example from Google API)

```text
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
FOURSQUARE_ACCESS_TOKEN={ string }

SENTRY_DSN={ URL }

GOOGLE_KNOWLEDGE_GRAPH={ key }
REDIS_URL={ URL } # вида 127.0.0.1:6379
JENA_URL={ URL }
ASSISTANTS={ object } # create from /scripts/add-assistant

# memcache
MEMCACHIER_SERVERS={ }
MEMCACHIER_USERNAME={ }
MEMCACHIER_PASSWORD={ }
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

## Настройте SOLID сервер

Получите вход по WebID, например, в Inrupt - https://signup.pod.inrupt.com/
