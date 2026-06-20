import { deleteGroup, setGroup } from '../../models/groups.ts';

export default (activity, message) => {
  deleteGroup(message.migrate_from_chat_id);
  setGroup({
    id: message.chat.id,
    title: message.chat.title ?? '',
  });
  console.log('migrate from chat', message);
};
