module.exports = async function (bot, message) {
  const text = message.entities
    .filter(entity => entity.type === 'bot_command')
    .reduce((acc, command) => {
      acc = acc.substring(command.offset + command.length);
      return acc;
    }, message.text)
    .trim();

  // todo предлагаем клиенту перейти в нужный чат если Сеть нашла таковой
  //  ...

  await bot.sendMessage(message.chat.id, 'Задача ' + text + ' начата', {
    disable_web_page_preview: true,
  });
}
