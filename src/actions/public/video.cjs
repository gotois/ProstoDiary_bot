const Dialog = require('../../libs/dialog.cjs');

module.exports = async (bot, message) => {
  const dialog = new Dialog();
  dialog.push(message);

  console.log('video, activity', dialog.activity);
};
