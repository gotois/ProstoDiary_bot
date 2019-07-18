const bot = require('../bot');
const commands = require('../commands');

bot.onText(commands.PING.alias, require('./ping.event'));
bot.onText(commands.BACKUP.alias, require('./backup.event'));
bot.onText(commands.DB_CLEAR.alias, require('./dbclear.event'));
bot.onText(commands.START.alias, require('./start.event'));
bot.onText(commands.HELP.alias, require('./help.event'));
bot.onText(commands.GET_DATE.alias, require('./get-date.event'));
bot.onText(commands.GET_TODAY.alias, require('./get-date.event'));
bot.onText(commands.SET_DATE.alias, require('./set-date.event'));
bot.onText(commands.GRAPH.alias, require('./graph.event'));
bot.onText(commands.COUNT.alias, require('./count.event'));
bot.onText(commands.SEARCH.alias, require('./search.event'));
bot.onText(commands.VERSION.alias, require('./version.event'));
bot.onText(commands.KPP.alias, require('./kpp.event'));
bot.onText(commands.BALANCE.alias, require('./balance.event'));

bot.on(
  commands.EDITED_MESSAGE_TEXT.alias,
  require('./edited-message-text.event'),
);
bot.on(commands.TEXT.alias, require('./text.event'));
bot.on(commands.PHOTO.alias, require('./photo.event'));
bot.on(commands.WEBHOOK_ERROR.alias, require('./webhook-error.event'));
bot.on(commands.LOCATION.alias, require('./location.event'));
bot.on(commands.VOICE.alias, require('./voice.event'));
bot.on(commands.DOCUMENT.alias, require('./document.event'));

module.exports = bot;
