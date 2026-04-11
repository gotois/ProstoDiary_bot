const { SECRETARY } = require('../../environments/index.cjs');
const secretaryAI = require('../../libs/secretary-ai.cjs');
const { sendPrepareMessage } = require('../../libs/tg-messages.cjs');

module.exports = async (bot, message) => {
  await sendPrepareMessage(bot, message);

  console.log('message:', message);
  const url = `${SECRETARY.HOST}/file/${message.audio.audio_id}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Ошибка');
  }
  const query = await secretaryAI.vzor(response);
  console.log('query', query);

  const type = 'text/markdown';
  switch (type) {
    case 'text/markdown': {
      await bot.sendMessage(message.chat.id, data, {
        parse_mode: 'MarkdownV2',
        reply_to_message_id: message.message_id,
        protect_content: true,
      });
      break;
    }
    case 'text/plain': {
      await bot.sendMessage(message.chat.id, data, {
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
