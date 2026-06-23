import { container } from '../../app/container.ts';

export default async (activity, message) => {
  await container.removeGroup.execute({ groupId: message.migrate_from_chat_id });
  await container.registerGroup.execute({
    id: message.chat.id,
    title: message.chat.title ?? '',
  });
  console.log('migrate from chat', message);
};
