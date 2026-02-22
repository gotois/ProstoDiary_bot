const { TYPING, sendPrepareMessage, sendPrepareAction } = require('../../libs/tg-messages.cjs');
const secretaryAI = require('../../libs/secretary-ai.cjs');

module.exports = async (bot, userMessage) => {
  await sendPrepareAction(bot, userMessage, TYPING);
  const headers = new Headers();
  headers.set('Accept', 'text/markdown');
  headers.set('Accept-Language', userMessage.user.language);
  headers.set('Authorization', userMessage.user.jwt);
  headers.set('Geolocation', userMessage.user.location);
  headers.set('Timezone', userMessage.user.timezone);

  const secretaryData = await secretaryAI.chat(userMessage.text, {
    configurable: {
      thread_id: userMessage.chat.id,
      tenant_id: userMessage.from.id,
    },
    metadata: {
      user_id: userMessage.user.id,
    },
    headers: headers,
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
  if (artifact) {
    await sendPrepareMessage(bot, userMessage);
  }
};
