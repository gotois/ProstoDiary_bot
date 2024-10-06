const Dialog = require('../../libs/dialog.cjs');

module.exports = async (bot, message) => {
  const dialog = new Dialog();
  await dialog.push(message);

  console.log('audio:', dialog.activity);
  // todo: отправлять на сервер
  await bot.sendMessage(message.chat.id, 'Audio', {
    parse_mode: 'MarkdownV2',
  });
};
