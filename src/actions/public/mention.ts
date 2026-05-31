import environment from '../../environments/index.ts';

const { TELEGRAM, IS_DEV } = environment;

/**
 * Обработка упоминания бота в групповом чате
 * @param {unknown} activity - активность ActivityPub
 * @param {object} message - сообщение Telegram
 * @param {object} bot - экземпляр бота
 */
export default async (activity, message, bot) => {
  console.log('mention', message);

  const botMention = '@' + TELEGRAM.BOT_NAME;
  const isBotMentioned = message.entities?.some((entity) => {
    return (
      entity.type === 'mention' && message.text?.slice(entity.offset, entity.offset + entity.length) === botMention
    );
  });

  if (!isBotMentioned) {
    return;
  }

  const newMeetingPayload = Buffer.from(JSON.stringify({ debug: IS_DEV, to: '/calendar/new' })).toString('base64url');

  await bot.sendMessage(message.chat.id, 'Чем могу помочь?', {
    reply_to_message_id: message.message_id,
    disable_notification: true,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '📅 Настроить встречу',
            url: `${TELEGRAM.BOT_LINK}?startapp=${newMeetingPayload}`,
          },
        ],
        [
          {
            text: '❓ Помощь',
            callback_data: 'mention_help',
          },
        ],
      ],
    },
  });
};
