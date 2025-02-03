module.exports = async function (bot, message) {
  const text = message.entities
    .filter((entity) => {
      return entity.type === 'bot_command';
    })
    // eslint-disable-next-line unicorn/no-array-reduce
    .reduce((accumulator, command) => {
      accumulator = accumulator.slice(Math.max(0, command.offset + command.length));
      return accumulator;
    }, message.text)
    .trim();

  // todo предлагаем клиенту перейти в нужный чат если Сеть нашла таковой
  //  ...

  await bot.sendMessage(message.chat.id, 'Задача ' + text + ' начата', {
    disable_web_page_preview: true,
  });
};
