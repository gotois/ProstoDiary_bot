const express = require('express');
const Sentry = require('@sentry/node');
const helmet = require('helmet');
// const OpenApiValidator = require('express-openapi-validator').OpenApiValidator;
const package_ = require('../../package.json');
const provider = require('../lib/oidc');
const logger = require('../lib/log');
const { IS_PRODUCTION, SENTRY, SERVER } = require('../environment');
const session = require('./middlewares/session');
const grant = require('./middlewares/grant');
const winstonLog = require('./middlewares/logger');
const mainRoutes = require('./routes/main');
const botRoutes = require('./routes/bot');
const userRoutes = require('./routes/user');
const apiRoutes = require('./routes/api');
const marketplaceRoutes = require('./routes/marketplace');
const telegramRoutes = require('./routes/telegram');
const messageRoutes = require('./routes/message');
const assistantWebhookRoutes = require('./routes/assistant');
const pingRoutes = require('./routes/ping');
const thingRoutes = require('./routes/thing');
const documentationRoutes = require('./routes/documentation');

(async function main() {
  Sentry.init({
    dsn: SENTRY.DSN,
    debug: IS_PRODUCTION,
  });
  const oidcProvider = await provider();
  const app = express();
  app.set('trust proxy', true);
  // The request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler());
  app.use(helmet());
  app.use(session);
  app.use(grant);
  app.use(winstonLog);
  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler());
  app.use('/', mainRoutes(oidcProvider));
  app.use('/ping', pingRoutes);
  app.use('/thing', thingRoutes);
  app.use('/telegram', telegramRoutes);
  app.use('/documentation', documentationRoutes);
  app.use('/api', apiRoutes);
  app.use('/bot', botRoutes);
  app.use('/user', userRoutes);
  app.use('/message', messageRoutes);
  app.use('/marketplace', marketplaceRoutes);
  app.use('/assistant', assistantWebhookRoutes);
  app.use('/oidc/', oidcProvider.callback);

  // Express error handler
  app.use(require('./middlewares/error-handler'));

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
  // но лучше перенести в ассистента, где он будет выполнять скрипт раз в день и выявлять неактивных пользователей
  // await require('./functions/check-users');
})();
