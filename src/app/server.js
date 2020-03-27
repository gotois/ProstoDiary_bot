const express = require('express');
const Sentry = require('@sentry/node');
const helmet = require('helmet');
const csrf = require('csurf');
// const OpenApiValidator = require('express-openapi-validator').OpenApiValidator;
const package_ = require('../../package.json');
const logger = require('../lib/log');
const { IS_PRODUCTION, SENTRY, SERVER } = require('../environment');

const app = express();
Sentry.init({
  dsn: SENTRY.DSN,
  debug: IS_PRODUCTION,
});
app.set('trust proxy', true);
// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
app.use(helmet());
app.use(require('./middlewares/session'));
app.use(require('./middlewares/grant'));
app.use(require('./middlewares/logger'));
// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());
require('./routes')(app);
// настроить позже отдельные страницы с формами где требуется csrf
app.use(csrf({ cookie: true }));
// Express error handler
app.use(require('./middlewares/error-handler'));

// eslint-disable-next-line require-await
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

  let listenMessage;
  if (IS_PRODUCTION) {
    listenMessage = `Production server ${package_.version} started on ${SERVER.HOST}:${SERVER.PORT}`;
  } else {
    listenMessage = `Dev server started on ${SERVER.HOST}`;
  }
  app.listen(SERVER.PORT, () => {
    logger.log('info', listenMessage);
  });

  // запускать инстанс vzor для каждого активного пользователя
  // await require('./functions/check-users');
})();
