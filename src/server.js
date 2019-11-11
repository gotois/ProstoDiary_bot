const express = require('express');
const bodyParser = require('body-parser');
const auth = require('http-auth');
const session = require('express-session');
const pkg = require('../../package');
const logger = require('../services/logger.service');
const { IS_PRODUCTION, TELEGRAM, SERVER } = require('../environment');

const app = express();

// todo lобавить логгер запросов вида:
// app.use(logger('dev'))

app.use(session({ secret: 'some-secret-msg', saveUninitialized: false, resave: true }));
app.use(require('../middlewares/grant'));

// todo: сделать кастомный вход - https://www.npmjs.com/package/http-auth#custom-authentication
const digest = auth.digest({
  realm: 'demo', // demo:demo
  file: __dirname + '/../../.htdigest',
});

const jsonParser = bodyParser.json();
const digestParser = auth.connect(digest);

app.listen(SERVER.PORT, () => {
  logger.log('info', `${IS_PRODUCTION ? 'Production' : 'Dev'} server ${pkg.version} started on port ${SERVER.PORT}`);
});

app.get('/', digestParser, require('../middlewares/ping'));
// подтверждение авторизации oauth. Сначала переходить сначала по ссылке вида https://cd0b2563.eu.ngrok.io/connect/yandex. Через localhost не будет работать
app.get('/oauth', require('../middlewares/oauth'));
// json rpc server
app.post('/api', jsonParser, digestParser, require('../middlewares/jsonrpc'));
// sendgrid mail webhook server
app.post('/mail', jsonParser, require('../middlewares/sendgrid'));
// вебхуки нотификаций от ассистентов
app.post('/assistants', jsonParser, require('../middlewares/assistants'));
// telegram
app.post(`/bot${TELEGRAM.TOKEN}`, jsonParser, require('../middlewares/telegram'));

require('../controllers/telegram');

module.exports = app;
