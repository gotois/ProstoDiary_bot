const { TYPING, sendPrepareMessage, sendPrepareAction } = require('../../libs/tg-messages.cjs');
const secretaryAI = require('../../libs/secretary-ai.cjs');
module.exports = async (bot, message) => {
  await sendPrepareAction(bot, message, TYPING);

  const headers = new Headers();
  headers.set('Accept', 'text/markdown');
  headers.set('Authorization', message.user.jwt);
  headers.set('Geolocation', message.user.location);
  headers.set('Timezone', message.user.timezone);

  if (!secretaryAI.isConnected) {
    try {
      await secretaryAI.connect(headers);
    } catch (error) {
      if (error.code === 401) {
        await bot.sendMessage(message.chat.id, 'Пройдите авторизацию заново', {
          reply_markup: {
            remove_keyboard: true,
            resize_keyboard: true,
            one_time_keyboard: true,
            keyboard: [
              [
                {
                  text: '📞 Отправить контакт',
                  request_contact: true,
                },
              ],
            ],
          },
        });
        return;
      }
    }
  }
  // todo на будущее используй callbacks, tags, signal
  const secretaryData = await secretaryAI.chat(message.text, {
    configurable: {
      thread_id: message.chat.id,
      tenant_id: message.from.id,
    },
    metadata: {
      user_id: message.user.id,
      locale: message.user.language,
    },
    headers: headers,
  });
  const { content, artifact } = secretaryData;

  await bot.sendMessage(message.chat.id, content[0].text, {
    parse_mode: 'Markdown',
    reply_to_message_id: message.message_id,
    protect_content: true,
    disable_notification: true,
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: artifact?.inline_keyboard ?? [],
      force_reply: true,
    },
  });
  if (artifact) {
    await sendPrepareMessage(bot, message);
  }
};
