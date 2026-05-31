import { TYPING, sendPrepareAction } from '../../libs/tg-messages.mjs';

export default async (activity, message, bot) => {
  console.log('reply to message', message);

  await sendPrepareAction(bot, message.chat.id, TYPING);
};
