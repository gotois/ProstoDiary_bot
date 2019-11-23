const express = require('express');
const jsonParser = require('body-parser').json();
const OpenApiValidator = require('express-openapi-validator').OpenApiValidator;
const package_ = require('../package');
const logger = require('./services/logger.service');
const { IS_PRODUCTION, TELEGRAM, SERVER } = require('./environment');
const authParser = require('./middlewares/auth');

const app = express();

app.use(require('./middlewares/session'));
app.use(require('./middlewares/grant'));
app.use(require('./middlewares/logger'));

// OpenApiValidator onto your express app
new OpenApiValidator({
  apiSpec: './docs/openapi.json',
  validateRequests: true,
  validateResponses: true,
  unknownFormats: ['uuid'],
  securityHandlers: {
    BasicAuth: (_request, _scopes, _schema) => {
      return Promise.resolve(true);
    },
  },
}).install(app);

app.listen(SERVER.PORT, () => {
  logger.log(
    'info',
    `${IS_PRODUCTION ? 'Production' : 'Dev'} server ${
      package_.version
    } started on port ${SERVER.PORT}`,
  );
});
app.get('/', authParser, require('./middlewares/ping'));
// подтверждение авторизации oauth. Сначала переходить сначала по ссылке вида https://cd0b2563.eu.ngrok.io/connect/yandex. Через localhost не будет работать
app.get('/oauth', require('./middlewares/oauth'));
// JSON-LD пользователя/организации
app.get('/id/:uuid/:date', authParser, require('./middlewares/id'));
// json rpc server
app.post('/api*', jsonParser, authParser, require('./middlewares/jsonrpc'));
// sendgrid mail webhook server
app.post('/mail', jsonParser, require('./middlewares/sendgrid'));
// вебхуки нотификаций от ассистентов
app.post('/assistants', jsonParser, require('./middlewares/assistants'));
// telegram
app.post(
  `/bot${TELEGRAM.TOKEN}`,
  jsonParser,
  require('./middlewares/telegram'),
);
// обработчик ошибок express
app.use(require('./middlewares/error-handler'));

module.exports = app;
