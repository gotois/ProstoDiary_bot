const commands = require('../../src/commands/index');

class TestBot {
  constructor(bot) {
    global.bot = bot;
    
    bot.onText(commands.HELP, require('../../src/events/help.event'));
  }
}

module.exports = TestBot;
