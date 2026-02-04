const { TYPING, sendPrepareMessage, sendPrepareAction } = require('../../libs/tg-messages.cjs');
const secretaryAI = require('../../libs/secretary-ai.cjs');

module.exports = async (bot, userMessage, dialog) => {
  await sendPrepareAction(bot, userMessage, TYPING);
  if (!secretaryAI.isConnected) {
    await secretaryAI.connect({
      Authorization: dialog.user.jwt,
      Geolocation: dialog.user.location,
    });
  }
  const secretaryData = await secretaryAI.chat(userMessage.text, {
    configurable: {
      thread_id: userMessage.chat.id,
    },
    headers: {
      'Accept': 'text/markdown',
      'Accept-Language': dialog.user.language,
      'Authorization': dialog.user.jwt,
      'Geolocation': dialog.user.location,
    },
  });
  const { content, artifact } = secretaryData;

  await bot.sendMessage(userMessage.chat.id, content[0].text, {
    parse_mode: 'Markdown',
    reply_to_message_id: userMessage.message_id,
    protect_content: true,
    disable_notification: true,
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: artifact?.inline_keyboard ?? [],
      force_reply: true,
    },
  });
  await sendPrepareMessage(bot, userMessage);
};
