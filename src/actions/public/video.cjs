const Dialog = require('../../libs/dialog.cjs');

module.exports = async (bot, message) => {
  const dialog = new Dialog();
  await dialog.push(message);

  console.log('video, activity', dialog.activity);
};
