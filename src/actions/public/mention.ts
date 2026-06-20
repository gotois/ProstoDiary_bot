import { linkPayload } from '../../libs/tg-messages.ts';

const ADMIN_STATUSES = new Set(['creator', 'administrator']);

/**
 * @description Обработка упоминания бота в групповом чате
 * @param {unknown} activity - активность ActivityPub
 * @param {object} message - сообщение Telegram
 * @param {object} bot - экземпляр бота
 */
export default async (activity: unknown, message, bot) => {
  const chatMember = await bot.getChatMember(message.chat.id, message.from.id);
  if (!ADMIN_STATUSES.has(chatMember.status)) {
    console.log('Настраивать встречу могут только админы группы.');
    return;
  }

  const sentMessage = await bot.sendMessage(message.chat.id, 'ЧЕРНОВИК СОБЫТИЯ', {
    disable_notification: true,
  });

  const to = new URLSearchParams({
    tgGroupChatId: message.chat.id,
    tgGroupMessageId: sentMessage.message_id,
  });

  await bot.editMessageReplyMarkup(
    {
      inline_keyboard: [
        [
          {
            text: '📅 Настроить событие',
            url: linkPayload({ to: `/calendar/new?${to.toString()}` }),
          },
        ],
      ],
    },
    {
      chat_id: message.chat.id,
      message_id: sentMessage.message_id,
    },
  );
  await bot.deleteMessage(message.chat.id, message.message_id);
};
