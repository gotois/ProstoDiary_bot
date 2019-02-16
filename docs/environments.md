Server Environments (needs update file .env in root project)
---
```
TOKEN={ Your telegram bot token like 1234567890:AAA-qwertyuiopasdfghjklzxcvbnmqwert }
HEROKU_NAME={ Your heroku server name }
SALT_PASSWORD={ User salt password }
HOST={ database host }
DATABASE={ database name }
DB_USER={ database username }
DBPORT={ database port }
PASSWORD={ database password }

# Optional variables
PLOTLY_LOGIN={ plotly login }
PLOTLY_TOKEN={ plotly token }
GOOGLE_MAPS_GEOCODING_API={ geocoding key }
GOOGLE_APPLICATION_CREDENTIALS={ one line stringify object } 

DIALOGFLOW_CREDENTIALS={ one line stringify object } 
# You can find your project ID in your Dialogflow agent settings https://dialogflow.com/docs/agents#settings
DIALOGFLOW_PROJECT_ID={ project_id }

NALOGRU_EMAIL={ nalog.ru email }
NALOGRU_NAME={ nalog.ru имя }
NALOGRU_PHONE={ nalog.ru телефон }
NALOGRU_KP_PASSWORD={ nalog.ru password  } #это вводится пользователем после kpSignUp (proverkacheka.nalog.ru:9999/v1/mobile/users/signup)
```
