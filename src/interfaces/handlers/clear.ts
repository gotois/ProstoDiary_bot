import { assistantGateway } from '../../app/container.ts';

export default async (activity, message) => {
  console.log('TODO: очистка истории агента');

  await assistantGateway.clearConversation({ chatId: message.chat.id, tenantId: message.from.id });
};
