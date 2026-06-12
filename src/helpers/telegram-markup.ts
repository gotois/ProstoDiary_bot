import { TELEGRAM, IS_DEV } from '#env';

interface TelegramGroupMeetingData {
  name: string;
  description?: string;
  location?: string;
  start_date?: string | Date;
}

export function formatTelegramGroupMeeting(data: TelegramGroupMeetingData): string {
  const lines = [data.name, ''];

  const date = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  }).format(new Date(data.start_date));
  if (date) {
    lines.push(`📅 ${date}`);
  }
  const time = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(data.start_date));
  if (time) {
    lines.push(`🕖 ${time}`);
  }
  if (data.location) {
    lines.push(`📍 ${data.location}`);
  }
  if (data.description) {
    lines.push('', data.description);
  }
  return lines.join('\n');
}

/**
 * Builds the inline keyboard for a Telegram group meeting.
 * @param options - Keyboard and edit link parameters.
 * @param options.chatId - Telegram group chat id.
 * @param options.debug - Whether the Mini App should use debug mode.
 * @param options.messageId - Telegram message id.
 * @param options.taskId - Calendar event id.
 * @returns Telegram inline keyboard markup.
 */
export function getTelegramGroupMeetingReplyMarkup(options: {
  chatId: string;
  messageId: string;
  taskId: number | string;
}) {
  const to = new URLSearchParams({
    tgGroupChatId: options.chatId,
    tgGroupMessageId: options.messageId,
  });
  const payload = Buffer.from(
    JSON.stringify({
      debug: IS_DEV,
      to: `/calendar/${options.taskId}/edit?${to.toString()}`,
    }),
  ).toString('base64url');

  return {
    inline_keyboard: [
      [
        {
          text: 'Иду',
          callback_data: 'meeting_rsvp:yes',
        },
        {
          text: 'Не смогу',
          callback_data: 'meeting_rsvp:no',
        },
      ],
      [
        {
          text: 'Возможно иду',
          callback_data: 'meeting_rsvp:maybe',
        },
      ],
      [
        {
          text: 'Редактировать событие',
          url: `${TELEGRAM.BOT_LINK}?startapp=${payload}`,
        },
      ],
    ],
  };
}
