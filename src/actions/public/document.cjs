const Dialog = require('../../libs/dialog.cjs');

module.exports = async (bot, message) => {
  const response = await fetch(message.document.file.url);
  const arrayBuffer = await response.arrayBuffer();
  const dialog = new Dialog();
  await dialog.push(message);

  // todo: отправлять на сервер
  await bot.sendMessage(message.chat.id, 'Document: ' + JSON.stringify(dialog.activity.object), {
    parse_mode: 'markdown',
  });
};
