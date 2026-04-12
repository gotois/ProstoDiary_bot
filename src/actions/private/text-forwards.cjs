const { parseMode, sendPrepareMessage } = require('../../libs/tg-messages.cjs');

module.exports = async (bot, messages) => {
  console.log(`Обработка транзакции из ${messages.length} сообщений:`);
  const [message] = messages;
  await sendPrepareMessage(bot, message);
  await bot.sendMessage(message.chat.id, 'message', {
    parse_mode: parseMode(/*mediaType*/),
    reply_to_message_id: message.message_id,
    protect_content: true,
  });
};
