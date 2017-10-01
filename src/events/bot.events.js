const bot = require('./../config/bot.config');
const commands = require('../commands/bot.commands');
/**
 * Events
 */
{
  bot.onText(commands.DOWNLOAD, require('./download.event'));
  bot.onText(commands.DBCLEAR, require('./dbclear.event'));
  bot.onText(commands.START, require('./start.event'));
  bot.onText(commands.HELP, require('./help.event'));
  bot.onText(commands.GETDATE, require('./getdate.event'));
  bot.onText(commands.SETDATE, require('./setdate.event'));
  bot.onText(commands.GRAPH, require('./graph.event'));
  bot.onText(commands.COUNT, require('./count.event'));
  bot.onText(commands.SEARCH, require('./search.event'));
  bot.on(commands.EDITED_MESSAGE_TEXT, require('./edited_message_text.event'));
  bot.on(commands.TEXT, require('./text.event'));
}

module.exports = bot;
