const Dialog = require('../../libs/dialog.cjs');
const { TYPING, sendPrepareAction } = require('../../libs/tg-messages.cjs');

// todo поддержать отправку сообщений из диалога, если они были reply на сообщения, тогда кидать всю цепочку сообщений
module.exports = async (bot, message) => {
  console.log('reply to message', message);
  await sendPrepareAction(bot, message, TYPING);
  const dialog = new Dialog();
  dialog.push(message);
  console.log('WIP');
};
