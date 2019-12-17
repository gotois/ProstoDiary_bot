const express = require('express');
const Sentry = require('@sentry/node');
const helmet = require('helmet');
// const OpenApiValidator = require('express-openapi-validator').OpenApiValidator;
const package_ = require('../package');
const logger = require('./services/logger.service');
const { IS_PRODUCTION, SENTRY, SERVER } = require('./environment');
const format = require('date-fns/format');
const fromUnixTime = require('date-fns/fromUnixTime');

const app = express();
Sentry.init({
  dsn: SENTRY.DSN,
  debug: IS_PRODUCTION,
});
// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
app.use(helmet());
app.use(require('./middlewares/session'));
app.use(require('./middlewares/grant'));
app.use(require('./middlewares/logger'));
// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());
require('./routes')(app);
// Express error handler
app.use(require('./middlewares/error-handler'));

(async function main() {
  // fixme перестал работать, возможно новая версия поломала API
  // try {
  //   await new OpenApiValidator({
  //     apiSpec: './docs/openapi.json',
  //     validateRequests: {
  //       allowUnknownQueryParameters: true,
  //     },
  //     validateResponses: true,
  //     unknownFormats: ['uuid'],
  //     validateSecurity: {
  //       handlers: {
  //         ApiKeyAuth: (req, scopes, schema) => {
  //           throw { status: 401, message: 'sorry' }
  //         },
  //         BasicAuth: (_request, _scopes, _schema) => {
  //           return Promise.resolve(true);
  //         },
  //       },
  //     },
  //   }).install(app);
  // } catch {
  //   logger.error('OpenApiValidator');
  // }

  app.listen(SERVER.PORT, () => {
    logger.log(
      'info',
      `${IS_PRODUCTION ? 'Production' : 'Dev'} server ${
        package_.version
      } started on ${SERVER.HOST}:${SERVER.PORT}`,
    );
  });

  // запускать инстанс vzor для каждого активного пользователя
  const imapService = require('./services/imap.service');
  const { pool } = require('./core/database');
  const bot = require('./core/bot');
  const passportQueries = require('./db/passport');
  await pool.connect(async (connection) => {
    const passportsTable = await connection.many(
      passportQueries.getPassports(),
    );
    for (const passport of passportsTable) {
      const botTable = await connection.one(
        passportQueries.selectByPassport(passport.id),
      );
      try {
        // пингуем тем самым проверяем что пользователь активен
        await bot.sendChatAction(passport.telegram_id, 'typing');
      } catch (error) {
        logger.error(error);
        switch (error.response && error.response.statusCode) {
          case 403: {
            await connection.query(
              passportQueries.deactivateByPassportId(passport.id),
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
        // eslint-disable-next-line no-unused-vars
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
        // eslint-disable-next-line no-unused-vars
        const today = format(
          fromUnixTime(Math.round(new Date().getTime() / 1000)),
          'MMM dd, yyyy',
        );
        // const emails = await imap.search(['ALL', ['SINCE', today]]);
        // todo сохранять необработанные письма в Story
        // ...
      }
    }
  });
})();
