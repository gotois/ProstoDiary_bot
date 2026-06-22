import { container } from '../../../app/container.ts';

export default async (activity, message) => {
  await container.registerGroup.execute({
    id: message.chat.id,
    title: message.chat.title ?? '',
  });
  console.log('super group', message);
};
