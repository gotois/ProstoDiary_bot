const commands = require('../../src/commands');

class TestBot {
  constructor(bot) {
    global.bot = bot;
    // добавлять новые действия надо здесь
    bot.onText(commands.HELP, require('../../src/controllers/help.event'));
    bot.onText(
      commands.VERSION,
      require('../../src/controllers/version.event'),
    );
    bot.onText(
      commands.BALANCE,
      require('../../src/controllers/balance.event'),
    );
  }
}

module.exports = TestBot;
