import { sendPrepareMessage } from '../../libs/tg-messages.ts';
import { container } from '../../app/container.ts';

export default async (activity, message, bot) => {
  await sendPrepareMessage(activity, message, bot);
  console.log('message:', message);

  const { url } = await container.processDocument.execute({ fileId: message.file.file_id });

  const type = 'text/markdown'; // todo
  switch (type) {
    case 'text/markdown': {
      await bot.sendMessage(message.chat.id, url, {
        parse_mode: 'MarkdownV2',
        reply_to_message_id: message.message_id,
        protect_content: true,
      });
      break;
    }
    case 'text/plain': {
      await bot.sendMessage(message.chat.id, url, {
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
