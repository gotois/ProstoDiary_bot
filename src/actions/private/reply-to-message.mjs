import { TYPING, sendPrepareAction } from '../../libs/tg-messages.mjs';

export default async (bot, message) => {
  console.log('reply to message', message);

  await sendPrepareAction(bot, message.chat.id, TYPING);
};
