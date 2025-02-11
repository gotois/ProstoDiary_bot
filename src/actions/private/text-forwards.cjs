const { generateCalendar } = require('../../controllers/generate-calendar.cjs');
const { parseMode, sendPrepareMessage } = require('../../libs/tg-messages.cjs');

module.exports = async (bot, messages, dialog) => {
  console.log(`Обработка транзакции из ${messages.length} сообщений:`);
  const [message] = messages;
  for (const message of messages) {
    await sendPrepareMessage(bot, message);
    dialog.push(message);
  }
  const { credentialSubject } = await generateCalendar(dialog);
  await sendPrepareMessage(bot, message);
  await bot.sendMessage(message.chat.id, credentialSubject.object.name, {
    parse_mode: parseMode(credentialSubject.object.mediaType),
    reply_to_message_id: message.message_id,
    protect_content: true,
  });
};
