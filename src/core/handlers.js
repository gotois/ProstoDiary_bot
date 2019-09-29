const commands = require('./commands');
const { IS_CI } = require('../../src/environment');

/**
 * @param {TelegramBot} bot - bot
 */
module.exports = (bot) => {
  bot.onText(commands.PING.alias, require('../controllers/ping.event'));
  bot.onText(commands.BACKUP.alias, require('../controllers/backup.event'));
  bot.onText(commands.DBCLEAR.alias, require('../controllers/dbclear.event'));
  bot.onText(commands.START.alias, require('../controllers/start.event'));
  bot.onText(commands.HELP.alias, require('../controllers/help.event'));
  bot.onText(commands.SET.alias, require('../controllers/set-date.event'));
  bot.onText(commands.SEARCH.alias, require('../controllers/search.event'));

  // todo: переместить в SEARCH
  bot.onText(commands.COUNT.alias, require('../controllers/count.event'));
  bot.onText(commands.GRAPH.alias, require('../controllers/plot.event'));
  bot.onText(commands.GET.alias, require('../controllers/get-date.event'));
  bot.onText(commands.GETTODAY.alias, require('../controllers/get-date.event'));
  bot.onText(commands.BALANCE.alias, require('../controllers/balance.event'));
  // end

  bot.onText(commands.VERSION.alias, require('../controllers/version.event'));

  bot.on(
    commands.EDITED_MESSAGE_TEXT.alias,
    require('../controllers/edited-message-text.event'),
  );
  bot.on(commands.TEXT.alias, require('../controllers/text.event'));
  bot.on(commands.PHOTO.alias, require('../controllers/photo.event'));
  bot.on(
    commands.WEBHOOK_ERROR.alias,
    require('../controllers/webhook-error.event'),
  );
  bot.on(commands.LOCATION.alias, require('../controllers/location.event'));
  // hack for skip CI errors
  if (!IS_CI) {
    bot.on(commands.VOICE.alias, require('../controllers/voice.event'));
  }
  bot.on(commands.DOCUMENT.alias, require('../controllers/document.event'));
};
