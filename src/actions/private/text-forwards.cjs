const { parseMode, sendPrepareMessage } = require('../../libs/tg-messages.cjs');

module.exports = async (bot, messages) => {
  console.log(`Обработка транзакции из ${messages.length} сообщений:`);
  const [message] = messages;
  await sendPrepareMessage(bot, message);
  await bot.sendMessage(message.chat.id, credentialSubject.object.name, {
    parse_mode: parseMode(credentialSubject.object.mediaType),
    reply_to_message_id: message.message_id,
    protect_content: true,
  });
};
