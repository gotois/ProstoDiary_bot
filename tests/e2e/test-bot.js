class TestBot {
  constructor(bot) {
    global.bot = bot;
    require('../../src/controllers');
  }
}

module.exports = TestBot;
