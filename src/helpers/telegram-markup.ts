import { TELEGRAM, IS_DEV } from '#env';

interface TelegramGroupMeetingData {
  name: string;
  description?: string;
  location?: string;
  start_date?: string | Date;
}

/**
 * @description Builds a link to a Telegram group message when the chat supports it.
 */
export function getTelegramMessageUrl(options: {
  chat /*: TelegramBot.Chat */,
  messageId: string;
}): string | undefined {
  console.log('options:', options);
  if (options.chat.username) {
    return `https://t.me/${options.chat.username}/${options.messageId}`;
  } else if (options.chat.type === 'group') {
    return `https://t.me/c/${Math.abs(options.chat.id)}/${options.messageId}`;
  }
  console.warn('unknown message url', options);

  return undefined;
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
 * @description Builds the inline keyboard for a Telegram group meeting.
 */
export function getTelegramGroupMeetingReplyMarkup(options: {
  chatId: string;
  messageId: string;
  taskId: number | string;
  sourceUrl?: string;
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
