import secretaryAI from '../../libs/secretary-ai.mjs';

export default async (bot, message) => {
  console.log('TODO: очистка истории агента');

  await secretaryAI.clear({
    configurable: {
      thread_id: message.chat.id,
      tenant_id: message.from.id,
    },
  });
};
