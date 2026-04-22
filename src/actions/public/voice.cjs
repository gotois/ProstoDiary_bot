const { SERVER } = require('../../environments/index.cjs');
const { RECORD_AUDIO, parseMode, sendPrepareAction, sendPrepareMessage } = require('../../libs/tg-messages.cjs');
const secretaryAI = require('../../libs/secretary-ai.cjs');

module.exports = async (bot, message) => {
  await sendPrepareAction(bot, message.chat.id, RECORD_AUDIO);

  const headers = new Headers();
  headers.set('Accept', 'text/plain');
  headers.set('Authorization', 'Bearer ' + message.user.access_token);
  if (message.user.location) {
    headers.set('Geolocation', message.user.location);
  } else {
    headers.set('Timezone', message.user.timezone);
  }

  const url = `${SERVER.HOST}/transcription/${message.voice.file_id}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Ошибка Voice');
  }
  const query = await response.text();

  const secretaryData = await secretaryAI.chat(query, {
    configurable: {
      thread_id: message.chat.id,
      tenant_id: message.from.id,
    },
    metadata: {
      user_id: message.user.sub,
      locale: message.user.language,
    },
    headers,
  });
  console.log('secretaryData', secretaryData);
  const { content, artifact } = secretaryData;

  const inlineKeyboard = [];
  await bot.sendMessage(message.chat.id, content[0].text, {
    parse_mode: parseMode('text/plain'),
    reply_to_message_id: message.message_id,
    protect_content: true,
    disable_notification: true,
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: inlineKeyboard,
    },
  });
  if (artifact) {
    await sendPrepareMessage(bot, message);
  }
};
