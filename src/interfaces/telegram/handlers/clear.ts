import { container } from '../../../app/container.ts';

export default async (activity, message) => {
  console.log('TODO: очистка истории агента');

  await container.clearConversation.execute({ chatId: message.chat.id, tenantId: message.from.id });
};
