import { unpack } from 'zip-pack-unpack';
const { SECRETARY } = require('../../environments/index.cjs');
const { sendPrepareMessage } = require('../../libs/tg-messages.cjs');
const secretaryAI = require('../../libs/secretary-ai.cjs');

module.exports = async (bot, message) => {
  await sendPrepareMessage(bot, message);
  console.log('message:', message);

  const url = `${SECRETARY.HOST}/file/${message.file.file_id}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Ошибка');
  }

  let query;
  // todo в случае zip архива, распаковываем и передаем данные секретарю
  if (response.headers.get('content-type') === 'application/zip') {
    const documents = [];
    const input = Buffer.from(await response.arrayBuffer())
    const data = await unpack(input);
    for (const [name, input] of data.entries()) {
      // ...
    }
  } else {
    query = await secretaryAI.vzor(response);
    console.log('query', query);
  }

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
