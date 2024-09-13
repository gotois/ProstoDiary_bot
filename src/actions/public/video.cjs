const Dialog = require('../../libs/dialog.cjs');

// eslint-disable-next-line
module.exports = async (bot, message) => {
  const dialog = new Dialog();
  await dialog.push(message);

  console.log('video, activity', dialog.activity);
};
