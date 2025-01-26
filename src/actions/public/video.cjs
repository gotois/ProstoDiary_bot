const Dialog = require('../../libs/dialog.cjs');

module.exports = (bot, message) => {
  const dialog = new Dialog();
  dialog.push(message);

  console.log('video, activity', dialog.activity);
};
