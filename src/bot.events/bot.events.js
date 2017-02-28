const bot = require('./../config/bot.config.js');
const commands = require('./../bot.commands.js');
/***
 * Events
 */
{
  bot.onText(commands.DOWNLOAD, require('./_download.js'));
  bot.onText(commands.DBCLEAR, require('./_dbclear.js'));
  bot.onText(commands.START, require('./_start.js'));
  bot.onText(commands.HELP, require('./_help.js'));
  bot.onText(commands.GETDATE, require('./_getdatafromdate.js'));
  bot.onText(commands.SETDATE, require('./_setdatafromdate.js'));
  bot.onText(commands.GRAPH, require('./_getgraph.js'));
  bot.on('edited_message_text', require('./_editedmessagetext.js'));
  bot.on('text', require('./_text.js'));
}

module.exports = bot;
