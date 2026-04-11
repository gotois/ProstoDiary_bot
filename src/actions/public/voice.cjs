const { SECRETARY } = require('../../environments/index.cjs');
const { RECORD_AUDIO, sendPrepareAction, sendPrepareMessage } = require('../../libs/tg-messages.cjs');
const secretaryAI = require('../../libs/secretary-ai.cjs');

module.exports = async (bot, userMessage) => {
  await sendPrepareAction(bot, userMessage.chat.id, RECORD_AUDIO);

  const url = `${SECRETARY.HOST}/transcription/${userMessage.voice.file_id}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Ошибка');
  }
  const query = await response.text();

  const secretaryData = await secretaryAI.chat(query, {
    configurable: {
      thread_id: userMessage.chat.id,
    },
    headers: {
      Accept: 'text/plain',
      Authorization: userMessage.user.jwt,
    },
  });
  await sendPrepareMessage(bot, userMessage);
  const inlineKeyboard = [];

  const assistMessage = await bot.sendMessage(userMessage.chat.id, reminder, {
    parse_mode: credentialSubject.object.mediaType === 'text/markdown' ? 'MarkdownV2' : 'Markdown',
    reply_to_message_id: userMessage.message_id,
    protect_content: true,
    disable_notification: true,
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: inlineKeyboard,
    },
  });
};
