const express = require('express');
const Sentry = require('@sentry/node');
const jsonParser = require('body-parser').json();
const OpenApiValidator = require('express-openapi-validator').OpenApiValidator;
const package_ = require('../package');
const logger = require('./services/logger.service');
const { IS_PRODUCTION, SENTRY, TELEGRAM, SERVER } = require('./environment');
const authParser = require('./middlewares/auth');
const telegramParser = require('./middlewares/telegram');
const mailParser = require('./middlewares/mail');
const oauthParser = require('./middlewares/oauth');
const apiParser = require('./middlewares/jsonrpc');
const passportParser = require('./middlewares/id');
const messageParser = require('./middlewares/message');
const format = require('date-fns/format');
const fromUnixTime = require('date-fns/fromUnixTime');

const app = express();
Sentry.init({
  dsn: SENTRY.DSN,
  debug: IS_PRODUCTION,
});

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
app.use(require('./middlewares/session'));
app.use(require('./middlewares/grant'));
app.use(require('./middlewares/logger'));
// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

(async function main() {
  // подтверждение авторизации oauth. Сначала переходить сначала по ссылке вида https://cd0b2563.eu.ngrok.io/connect/yandex. Через localhost не будет работать
  app.get('/oauth', oauthParser);
  // JSON-LD пользователя/организации
  // todo добавить список историй сылками и пагинацией <Array>
  //  список сообщений истории определенного пользователя
  app.get('/user/:uuid/:date', authParser, passportParser);
  // отображение прикрепленных некий глобальный JSON-LD включающий ссылки на остальные документы
  app.get('/message/:uuid', authParser, messageParser);
  // вебхуки нотификаций о почте, включая ассистентов
  app.post('/mail', jsonParser, mailParser);
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
  const imapService = require('./services/imap.service');
  const { pool } = require('./core/database');
  const bot = require('./core/bot');
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
      try {
        // пингуем тем самым проверяем пользователя
        await bot.sendChatAction(passport.telegram_id, 'typing');
      } catch (error) {
        logger.error(error);
        switch (error.response && error.response.statusCode) {
          case 403: {
            await connection.query(
              botQueries.deactivateByPassportId(passport.id),
            );
            break;
          }
          default: {
            break;
          }
        }
        return;
      }
      if (botTable.activated) {
        const imap = imapService(
          {
            host: 'imap.yandex.ru',
            port: 993,
            user: botTable.email,
            password: botTable.password,
          },
          botTable.secret_key,
        );

        // находим письма за сегодняшний день
        // считываем их содержимое и записываем в БД
        const today = format(
          fromUnixTime(Math.round(new Date().getTime() / 1000)),
          'MMM dd, yyyy',
        );
        // eslint-disable-next-line no-unused-vars
        const mailMap = await imap.search(['ALL', ['SINCE', today]]);
        // todo сохранять необработанные письма в Story
        // ...
      }
    }
  });
})();
