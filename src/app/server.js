const { performance } = require('perf_hooks');
const startServerTime = performance.now();
const express = require('express');
const Sentry = require('@sentry/node');
const helmet = require('helmet');
const boxen = require('boxen');
// todo проверить функционал
// eslint-disable-next-line no-unused-vars
const OpenApiValidator = require('express-openapi-validator').OpenApiValidator;
const package_ = require('../../package.json');
const { IS_PRODUCTION, /*SENTRY,*/ SERVER } = require('../environment');
const session = require('./middlewares/session');
const winstonLog = require('./middlewares/logger');
// routes
const mainRoutes = require('./routes/main');
const documentationRoutes = require('./routes/documentation');

// const botRoutes = require('./routes/bot');
// const userRoutes = require('./routes/user');
const apiRoutes = require('./routes/api');
// const marketplaceRoutes = require('./routes/marketplace');















// const messageRoutes = require('./routes/message');
const pingRoutes = require('./routes/ping');
// const thingRoutes = require('./routes/thing');
// const passportRoutes = require('./routes/passport');

(async function main() {
  // Sentry.init({
  //   dsn: SENTRY.DSN,
  //   debug: IS_PRODUCTION,
  // });
  const app = express();
  app.set('trust proxy', true);
  // The request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler());
  app.use(helmet());
  app.use(session);
  app.use(winstonLog);
  app.use('/', mainRoutes());
  app.use('/', documentationRoutes); // => /openapi.json
  app.use('/ping', pingRoutes);

  // app.use('/thing', thingRoutes);





  const newTG = require('./routes/telegram');
  app.use(newTG({
    BOT_TOKEN: process.env.TELEGRAM_TOKEN,
    HOST: process.env.NGROK_URL,
    events: {
  //     document(/*jsonldAction | */TelegramBotRequest) {
  //
  //     },
  //     photo(/*jsonldAction | */TelegramBotRequest) {
  //
  //     },
  //     '/^\/(ping|пинг)$/' (/*jsonldAction*/ TelegramBotRequest) {
  //
  //     },
    },
  }));









  app.use('/api', apiRoutes);
  // app.use('/passport', passportRoutes);

  // app.use('/bot', botRoutes);
  // app.use('/user', userRoutes);
  // app.use('/message', messageRoutes);
  // app.use('/marketplace', marketplaceRoutes);


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

  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler());
  // Express error handler
  app.use(require('./middlewares/error-handler'));

  let listenMessage;
  if (IS_PRODUCTION) {
    listenMessage = `Production server ${package_.version} started on: ${SERVER.HOST}:${SERVER.PORT}`;
  } else {
    listenMessage = `Dev server started on: ${SERVER.HOST}`;
  }
  app.listen(SERVER.PORT, () => {
    const endServerTime = performance.now();
    const diffServerTime = (endServerTime - startServerTime).toFixed(2);
    const boxenOptions = {
      padding: 1,
      margin: 1,
      align: 'left',
      float: 'left',
      borderStyle: 'double',
    };
    const result = boxen(
      `${package_.name} ${package_.version}\n
 Time: ${diffServerTime}ms
 ${listenMessage}`,
      boxenOptions,
    );
    // eslint-disable-next-line no-console
    console.log(result);
  });

  // await require('../jobs')();
})();
