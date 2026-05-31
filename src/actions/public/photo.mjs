import env from '../../environments/index.mjs';
import { sendPrepareMessage } from '../../libs/tg-messages.mjs';
import secretaryAI from '../../libs/secretary-ai.mjs';

const { SECRETARY } = env;

export default async (activity, message, bot) => {
  await sendPrepareMessage(activity, message, bot);

  console.log('message:', message);
  const url = `${SECRETARY.HOST}/file/${message.photo.photo_id}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Ошибка');
  }

  const query = await secretaryAI.vzor(response);
  console.log('query', query);

  const type = 'text/markdown';
  switch (type) {
    case 'text/markdown': {
      await bot.sendMessage(message.chat.id, query, {
        parse_mode: 'MarkdownV2',
        reply_to_message_id: message.message_id,
        protect_content: true,
      });
      break;
    }
    case 'text/plain': {
      await bot.sendMessage(message.chat.id, query, {
        reply_to_message_id: message.message_id,
        protect_content: true,
      });
      break;
    }
    default: {
      throw new Error('Unknown type ' + type);
    }
  }
};
