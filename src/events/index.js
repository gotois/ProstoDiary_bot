const bot = require('../bot');
const commands = require('../commands');

bot.onText(commands.PING, require('./ping.event'));
bot.onText(commands.DOWNLOAD, require('./download.event'));
bot.onText(commands.DB_CLEAR, require('./dbclear.event'));
bot.onText(commands.START, require('./start.event'));
bot.onText(commands.HELP, require('./help.event'));
bot.onText(commands.GET_DATE, require('./get-date.event'));
bot.onText(commands.GET_TODAY, require('./get-date.event'));
bot.onText(commands.SET_DATE, require('./set-date.event'));
bot.onText(commands.GRAPH, require('./graph.event'));
bot.onText(commands.COUNT, require('./count.event'));
bot.onText(commands.SEARCH, require('./search.event'));
bot.onText(commands.VERSION, require('./version.event'));
bot.on(commands.EDITED_MESSAGE_TEXT, require('./edited-message-text.event'));
bot.on(commands.TEXT, require('./text.event'));
bot.on(commands.PHOTO, require('./photo.event'));
bot.on(commands.WEBHOOK_ERROR, require('./webhook-error.event'));
bot.on(commands.LOCATION, require('./location.event'));
bot.on(commands.VOICE, require('./voice.event'));

module.exports = bot;
