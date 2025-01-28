module.exports.RECORD_AUDIO = 'record_audio';
module.exports.TYPING = 'typing';
module.exports.UPLOAD_DOCUMENT = 'upload_document';

module.exports.sendPrepareAction = async function (bot, message, type) {
  await bot.sendChatAction(message.chat.id, type);
};

module.exports.sendPrepareMessage = async function (bot, message) {
  await bot.setMessageReaction(message.chat.id, message.message_id, {
    reaction: JSON.stringify([
      {
        type: 'emoji',
        emoji: '✍',
      },
    ]),
  });
};
