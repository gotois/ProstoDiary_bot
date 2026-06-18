import { setGroup } from '../../models/groups.ts';

export default (activity, message) => {
  setGroup(message.chat.id);
  console.log('super group', message);
};
