// Помощь
module.exports = (bot, message) => {
  const commands = Object.keys(this);
  let commandsReadable = '';
  for (const c of commands) {
    commandsReadable += c + '\n';
  }
  bot.sendMessage(message.chat.id, 'Используйте команды: ' + commandsReadable);
};
