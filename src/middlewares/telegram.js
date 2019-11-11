const bot = require('../core/bot');

module.exports = (request, response) => {
  console.log(11111, request);
  // console.log(11111, request.session)

  request.body.message.from.id;

  bot.processUpdate(request.body);
  response.sendStatus(200);
};
