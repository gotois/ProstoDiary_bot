module.exports.RECORD_AUDIO = 'record_audio';
module.exports.TYPING = 'typing';
module.exports.UPLOAD_DOCUMENT = 'upload_document';

module.exports.sendPrepareAction = async function (bot, message, type) {
  try {
    await bot.sendChatAction(message.chat.id, type);
  } catch {
    // ...
  }
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

module.exports.parseMode = function (mediaType) {
  switch (mediaType) {
    case 'text/markdown': {
      return 'MarkdownV2';
    }
    case 'text/plain': {
      return 'Markdown';
    }
    case 'text/html': {
      return 'HTML';
    }
    default: {
      throw new Error('Unknown mediaType ' + mediaType);
    }
  }
};
