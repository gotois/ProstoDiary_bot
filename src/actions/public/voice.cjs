const { RECORD_AUDIO, sendPrepareAction, sendPrepareMessage } = require('../../libs/tg-messages.cjs');
const { saveCalendar } = require('../../models/calendars.cjs');

module.exports = async (bot, userMessage, dialog, client) => {
  await sendPrepareAction(bot, userMessage, RECORD_AUDIO);
  const transcriptionData = await client.readResource({
    uri: `transcription://${userMessage.voice.file_id}`,
  });
  dialog.push(userMessage);
  const { reminder, credentialSubject, googleCalendarUrl } = await generateCalendar(dialog);
  const text = transcriptionData.contents[0].text;
  const chatTool = await client.callTool({
    name: 'chat',
    arguments: {
      query: text,
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
