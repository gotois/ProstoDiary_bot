import { deleteGroup, setGroup } from '../../models/groups.ts';

export default (activity, message) => {
  deleteGroup(message.migrate_from_chat_id);
  setGroup(message.chat.id);
  console.log('migrate from chat', message);
};
