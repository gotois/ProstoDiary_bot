const commands = require('../../src/commands');

class TestBot {
  constructor(bot) {
    global.bot = bot;
    // добавлять новые действия надо здесь
    bot.onText(
      commands.HELP.alias,
      require('../../src/controllers/help.event'),
    );
    bot.onText(
      commands.VERSION.alias,
      require('../../src/controllers/version.event'),
    );
    bot.onText(
      commands.BALANCE.alias,
      require('../../src/controllers/balance.event'),
    );
  }
}

module.exports = TestBot;
