const express = require('express');
const jsonParser = require('body-parser').json();
const OpenApiValidator = require('express-openapi-validator').OpenApiValidator;
const package_ = require('../package');
const logger = require('./services/logger.service');
const { IS_PRODUCTION, TELEGRAM, SERVER } = require('./environment');
const authParser = require('./middlewares/auth');
const telegramParser = require('./middlewares/telegram');
const mailParser = require('./middlewares/mail');
const oauthParser = require('./middlewares/oauth');
const apiParser = require('./middlewares/jsonrpc');
const passportParser = require('./middlewares/id');

const app = express();

app.use(require('./middlewares/session'));
app.use(require('./middlewares/grant'));
app.use(require('./middlewares/logger'));

(async function main() {
  // подтверждение авторизации oauth. Сначала переходить сначала по ссылке вида https://cd0b2563.eu.ngrok.io/connect/yandex. Через localhost не будет работать
  app.get('/oauth', oauthParser);
  // JSON-LD пользователя/организации
  app.get('/id/:uuid/:date', authParser, passportParser);
  // sendgrid mail webhook server
  app.post('/mail', jsonParser, mailParser);
  // вебхуки нотификаций от ассистентов
  app.post('/assistants', jsonParser, require('./middlewares/assistants'));
  // telegram
  app.post(`/bot${TELEGRAM.TOKEN}`, jsonParser, telegramParser);
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
  app.post('/api*', jsonParser, authParser, apiParser);
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

  // запускать инстанс vzor для каждого активного пользователя
  const Vzor = require('./core/vzor');
  const { pool } = require('./core/database');
  const passportQueries = require('./db/passport');
  const botQueries = require('./db/bot');
  await pool.connect(async (connection) => {
    const passportsTable = await connection.many(
      passportQueries.getPassports(),
    );
    for (const passport of passportsTable) {
      const botTable = await connection.one(
        botQueries.selectByPassport(passport.id),
      );
      if (botTable.activated) {
        const vzor = new Vzor({
          host: 'imap.yandex.ru',
          port: 993,
          user: botTable.email,
          password: botTable.password,
        });
        vzor.listen();
      }
    }
  });
})();
