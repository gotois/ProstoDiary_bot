const Dialog = require('../../libs/dialog.cjs');

module.exports = async (bot, message) => {
  const response = await fetch(message.audio.file.url);
  const arrayBuffer = await response.arrayBuffer();
  const dialog = new Dialog(message);

  console.log('audio:', dialog.activity);
  // todo: отправлять на сервер
  await bot.sendMessage(dialog.activity.target.id, 'Audio', {
    parse_mode: 'markdown',
  });
};
