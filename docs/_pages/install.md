---
layout: page
title: Installer
permalink: /install/
---

Server Environments
---

* Create ```.env``` file in root project for dev test

> You can find your project ID in your Dialogflow agent settings <https://dialogflow.com/docs/agents#settings>

* Create ```keys``` directory in root. Create google-natural-lang.json (example from Google API)

```text
NODE_ENV={ production|development }
NGROK_AUTHTOKEN={ Your ngrok token }

TELEGRAM_TOKEN={ Your telegram bot token like 1234567890:AAA-qwertyuiopasdfghjklzxcvbnmqwert }
TELEGRAM_MINI_APP
SERVER_APP={ Your server app name like https://archive.gotointeractive.com }
SERVER_HOST={ Your server api like https://api.gotointeractive.com }

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
