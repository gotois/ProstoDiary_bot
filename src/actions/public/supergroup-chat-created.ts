import { setGroup } from '../../models/groups.ts';

export default (activity, message) => {
  setGroup({
    id: message.chat.id,
    title: message.chat.title ?? '',
  });
  console.log('super group', message);
};
