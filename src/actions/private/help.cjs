// Помощь
module.exports = (bot, message) => {
  const commands = Object.keys(this);
  let commandsReadable = "";
  commands.forEach(c => {
    commandsReadable += c + "\n";
  });
  bot.sendMessage(message.chat.id, "Используйте команды: " + commandsReadable);
};
