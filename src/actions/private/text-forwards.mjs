import { parseMode, sendPrepareMessage } from '../../libs/tg-messages.mjs';
import voiceAction from '../public/voice.mjs';
import textAction from '../public/voice.mjs';

export default async (bot, messages) => {
  console.log(`Обработка транзакции из ${messages.length} сообщений:`);

  for (const message of messages) {
    console.log('mess', message);
    await sendPrepareMessage(bot, message);

    if (message.voice) {
      await voiceAction(bot, message);
    } else if (message.text) {
      await textAction(bot, message);
    } else {
      await bot.sendMessage(message.chat.id, 'Unknown message type', {
        parse_mode: parseMode('text/plain'),
        reply_to_message_id: message.message_id,
        protect_content: true,
      });
    }
  }
};
