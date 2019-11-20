const bot = require('../core/bot');

module.exports = (request, response) => {
  bot.processUpdate(request.body);
  response.sendStatus(200);
};
