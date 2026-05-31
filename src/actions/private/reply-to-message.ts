import { TYPING, sendPrepareAction } from '../../libs/tg-messages.ts';

export default async (activity, message, bot) => {
  console.log('reply to message', message);

  await sendPrepareAction(bot, message.chat.id, TYPING);
};
