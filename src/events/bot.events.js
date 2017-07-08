const bot = require('./../config/bot.config');
const commands = require('../commands/bot.commands');
/***
 * Events
 */
{
  bot.onText(commands.DOWNLOAD, require('./_download.event'));
  bot.onText(commands.DBCLEAR, require('./_dbclear.event'));
  bot.onText(commands.START, require('./_start.event'));
  bot.onText(commands.HELP, require('./_help.event'));
  bot.onText(commands.GETDATE, require('./_getdate.event'));
  bot.onText(commands.SETDATE, require('./_setdate.event'));
  bot.onText(commands.GRAPH, require('./_graph.event'));
  bot.onText(commands.COUNT, require('./_count.event'));
  bot.on('edited_message_text', require('./_edited_message_text.event'));
  bot.on('text', require('./_text.event'));
}

module.exports = bot;
