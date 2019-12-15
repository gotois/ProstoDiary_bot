const jsonParser = require('body-parser').json();
const authParser = require('../middlewares/auth');
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
  // example oidc
  // app.get('/cb', (request) => {
  //   console.log(request);
  // });
  // json rpc server
  app.post('/api*', jsonParser, authParser, apiController);
  // 404 - not found
  app.get('*', notFoundController);
};
