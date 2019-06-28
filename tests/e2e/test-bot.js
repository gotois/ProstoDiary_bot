const commands = require('../../src/commands');

class TestBot {
  constructor(bot) {
    global.bot = bot;
    // добавлять новые действия надо здесь
    bot.onText(commands.HELP, require('../../src/events/help.event'));
    bot.onText(commands.VERSION, require('../../src/events/version.event'));
    bot.onText(commands.BALANCE, require('../../src/events/balance.event'));
  }
}

module.exports = TestBot;
