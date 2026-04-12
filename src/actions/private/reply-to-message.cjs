const { TYPING, sendPrepareAction } = require('../../libs/tg-messages.cjs');

module.exports = async (bot, message) => {
  console.log('reply to message', message);

  await sendPrepareAction(bot, message.chat.id, TYPING);
};
