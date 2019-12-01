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

(async function main() {
  // подтверждение авторизации oauth. Сначала переходить сначала по ссылке вида https://cd0b2563.eu.ngrok.io/connect/yandex. Через localhost не будет работать
  app.get('/oauth', require('./middlewares/oauth'));
  // JSON-LD пользователя/организации
  app.get('/id/:uuid/:date', authParser, require('./middlewares/id'));
  // sendgrid mail webhook server
  app.post('/mail', jsonParser, require('./middlewares/mail'));
  // вебхуки нотификаций от ассистентов
  app.post('/assistants', jsonParser, require('./middlewares/assistants'));
  // telegram
  app.post(
    `/bot${TELEGRAM.TOKEN}`,
    jsonParser,
    require('./middlewares/telegram'),
  );
  try {
    await new OpenApiValidator({
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
  } catch {
    logger.error('OpenApiValidator');
  }
  app.get('/', authParser, require('./middlewares/ping'));
  // json rpc server
  app.post('/api*', jsonParser, authParser, require('./middlewares/jsonrpc'));
  // 404 - not found
  app.get('*', require('./middlewares/not-found-handler'));
  // Express error handler
  app.use(require('./middlewares/error-handler'));
  app.listen(SERVER.PORT, () => {
    logger.log(
      'info',
      `${IS_PRODUCTION ? 'Production' : 'Dev'} server ${
        package_.version
      } started on port ${SERVER.PORT}`,
    );
  });
})();
