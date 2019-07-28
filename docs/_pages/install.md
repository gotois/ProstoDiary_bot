---
layout: page
title: Installer
permalink: /install/
---

Server Environments
---
* Create ```.env``` file in root project for dev test
> You can find your project ID in your Dialogflow agent settings https://dialogflow.com/docs/agents#settings

* Create ```keys``` directory in root. Create google-natural-lang.json (example from Google API)

```
NODE_ENV={ production|development|TRAVIS_CI|test }
TELEGRAM_TOKEN={ Your telegram bot token like 1234567890:AAA-qwertyuiopasdfghjklzxcvbnmqwert }
SERVER_NAME={ In DASH-CASE style }
SALT_PASSWORD={ User salt password }

PGUSER={ database username }
PGHOST={ database host }
PGPASSWORD={ database password }
PGDATABASE={ database name }
PGPORT={ database port }

PLOTLY_LOGIN={ plotly login }
PLOTLY_TOKEN={ plotly token }

GOOGLE_MAPS_GEOCODING_API={ geocoding key }
GOOGLE_APPLICATION_CREDENTIALS={ one line stringify object } 

DIALOGFLOW_CREDENTIALS={ one line stringify object } 
DIALOGFLOW_PROJECT_ID={ project_id }

NALOGRU_EMAIL={ nalog.ru email }
NALOGRU_NAME={ nalog.ru имя }
NALOGRU_PHONE={ nalog.ru телефон }
NALOGRU_KP_PASSWORD={ nalog.ru password  } #это вводится пользователем после kpSignUp (proverkacheka.nalog.ru:9999/v1/mobile/users/signup)

FAT_SECRET_APPNAME={ application name }
FAT_SECRET_API_ACCESS_KEY={ access key string }
FAT_SECRET_API_SHARED_SECRET={ shared secret string }

SENDGRID_API_KEY={ api key }

OPEN_WEATHER_KEY={ api key }

WOLFRAM_ALPHA_APP_NAME={ string }
WOLFRAM_ALPHA_APPID={ string }
WOLRFRAM_ALPHA_USAGE_TYPE={ string }

# https://developer.todoist.com/appconsole.html
TODOIST_CLIENT_ID={ string }
TODOIST_CLIENT_SECRET={ string }
# легко получить можно через https://todoist.com/prefs/integrations
TODOIST_ACCESS_TOKEN={ string }
```

<details>
	<summary>Setup PostgreSQL 11.0</summary>
* Create database ProstoDiaryDB
* Import Foods table from data/database/tables/foods.csv
</details>

<details>
  	<summary>Setup DialogFlow</summary>
* Create <Food> in Entities
* Upload data/dialogflow/entities/food.csv
</details>
