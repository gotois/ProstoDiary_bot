import { parseMode, sendPrepareMessage } from '../../libs/tg-messages.ts';
import voiceAction from '../public/voice.ts';
import textAction from '../public/text.ts';

export default async (activity, messages, bot) => {
  console.log(`Обработка транзакции из ${messages.length} сообщений:`);

  for (const message of messages) {
    console.log('mess', message);
    await sendPrepareMessage(activity, message, bot);

    if (message.voice) {
      // fixme implemented
      // await voiceAction(activity, message, bot);
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
