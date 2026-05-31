import { parseMode, sendPrepareMessage } from '../../libs/tg-messages.ts';
import voiceAction from '../public/voice.ts';
import textAction from '../public/voice.ts';

export default async (activity, message, bot) => {
  console.log(`Обработка транзакции из ${messages.length} сообщений:`);

  for (const message of messages) {
    console.log('mess', message);
    await sendPrepareMessage(activity, message, bot);

    if (message.voice) {
      await voiceAction(activity, message, bot);
    } else if (message.text) {
      await textAction(activity, message, bot);
    } else {
      await bot.sendMessage(message.chat.id, 'Unknown message type', {
        parse_mode: parseMode('text/plain'),
        reply_to_message_id: message.message_id,
        protect_content: true,
      });
    }
  }
};
