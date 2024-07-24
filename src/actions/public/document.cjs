const Dialog = require('../../libs/dialog.cjs');

module.exports = async (bot, message) => {
  const response = await fetch(message.document.file.url);
  const arrayBuffer = await response.arrayBuffer();
  const dialog = new Dialog(message);

  // todo: отправлять на сервер
  await bot.sendMessage(dialog.activity.target.id, 'Document: ' + JSON.stringify(activity.object), {
    parse_mode: 'markdown',
  });
};
