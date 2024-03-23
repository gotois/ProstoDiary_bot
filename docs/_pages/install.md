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
NODE_ENV={ production|TRAVIS_CI|test }
TELEGRAM_TOKEN={ Your telegram bot token like 1234567890:AAA-qwertyuiopasdfghjklzxcvbnmqwert }

SENDGRID_API_KEY={ api key }
SENDGRID_API_KEY_DEV={ api key }

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
