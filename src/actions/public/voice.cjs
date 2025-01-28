const Dialog = require('../../libs/dialog.cjs');
const { sentToSecretary } = require('../../controllers/generate-calendar.cjs');
const { RECORD_AUDIO, sendPrepareAction, sendPrepareMessage } = require('../../libs/tg-messages.cjs');

module.exports = async (bot, message, user) => {
  await sendPrepareAction(bot, message, RECORD_AUDIO);
  const dialog = new Dialog();
  dialog.push(message);
  const { credentialSubject } = await sentToSecretary({
    id: dialog.uid,
    activity: dialog.activity,
    jwt: user.jwt,
    language: dialog.language,
  });
  await sendPrepareMessage(bot, message);
  const data = credentialSubject.object.contentMap[dialog.language];
  switch (credentialSubject.object.mediaType) {
    case 'text/markdown': {
      await bot.sendMessage(message.chat.id, data, {
        parse_mode: 'MarkdownV2',
        reply_to_message_id: message.message_id,
        protect_content: true,
      });
      break;
    }
    case 'text/plain': {
      await bot.sendMessage(message.chat.id, data, {
        reply_to_message_id: message.message_id,
        protect_content: true,
      });
      break;
    }
    default: {
      throw new Error('Unknown type ' + credentialSubject.object.mediaType);
    }
  }
};
