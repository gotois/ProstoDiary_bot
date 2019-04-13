---
layout: page
title: Install
permalink: /install/
---

Server Environments
---
* Create ```.env``` file in root project for dev test
> You can find your project ID in your Dialogflow agent settings https://dialogflow.com/docs/agents#settings
```
NODE_ENV={ production|development|TRAVIS_CI|test }
TELEGRAM_TOKEN={ Your telegram bot token like 1234567890:AAA-qwertyuiopasdfghjklzxcvbnmqwert }
SERVER_NAME={ Your heroku server name }
SALT_PASSWORD={ User salt password }

# Database
DB_HOST={ database host }
DB_NAME={ database name }
DB_USER_NAME={ database username }
DB_PORT={ database port }
DB_PASSWORD={ database password }

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
```

Setup PostgreSQL 11.0
---
* Create database ProstoDiaryDB
* Import Foods table from data/database/tables/foods.csv

Setup DialogFlow
---
* Create <Food> in Entities
* Upload data/dialogflow/entities/food.csv
