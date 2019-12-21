const jsonParser = require('body-parser').json();
const authParser = require('../middlewares/auth');
const oidsParser = require('../middlewares/oids');
const telegramController = require('../middlewares/telegram');
const mailController = require('../middlewares/mail');
const oauthParser = require('../middlewares/oauth');
const apiController = require('../middlewares/jsonrpc');
const passportParser = require('../middlewares/id');
const messageController = require('../middlewares/message');
const pingController = require('../middlewares/ping');
const notFoundController = require('../middlewares/not-found-handler');
const { TELEGRAM } = require('../environment');

module.exports = (app) => {
  // todo - oids перенести в контроллер
  // @see https://github.com/panva/node-oidc-provider-example/blob/master/03-oidc-views-accounts/index.js
  // app.get('/oidcallback', (req, res, next) => {
  //   console.log('finish');
  // });
  // app.get('/interaction/:uid', async (req, res, next) => {
  //   console.log('uid')
  // });
  // app.post('/interaction/:uid/login', async (req, res, next) => {
  //   console.log('login')
  // });
  // app.post('/interaction/:uid/confirm', async (req, res, next) => {
  //   console.log('confirm')
  // });
  // app.get('/interaction/:uid/abort', async (req, res, next) => {
  //   console.log('abort')
  // });
  // подтверждение авторизации oauth. Сначала переходить сначала по ссылке вида https://cd0b2563.eu.ngrok.io/connect/yandex. Через localhost не будет работать
  app.get('/oauth', oauthParser);
  // JSON-LD пользователя/организации
  // todo добавить список историй сылками и пагинацией <Array>
  //  список сообщений истории определенного пользователя
  app.get('/user/:uuid/:date', authParser, passportParser);
  // отображение прикрепленных некий глобальный JSON-LD включающий ссылки на остальные документы
  // todo делать читаемыми только для того пользователя кто создал. Нужны роли для этого
  app.get('/message/:uuid', authParser, messageController);
  // вебхуки нотификаций о почте, включая ассистентов
  app.post('/mail', jsonParser, mailController);
  // telegram
  app.post(`/bot${TELEGRAM.TOKEN}`, jsonParser, telegramController);
  app.get('/', authParser, pingController);
  // json rpc server
  app.post('/api*', jsonParser, authParser, apiController);
  // oids server
  app.use('/oidc', oidsParser.callback);
  // 404 - not found - todo благодаря использованию oidsParser это не используется
  app.get('*', notFoundController);
};
