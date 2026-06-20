import { linkStartApp } from '../libs/tg-messages.ts';

function getFormatTime(date, tz) {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatTelegramGroupMeeting(data: any, tz: string): string {
  const lines = [data.name, ''];

  const date = new Intl.DateTimeFormat('ru-RU', {
    timeZone: tz,
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  }).format(new Date(data.start_date));
  if (date) {
    lines.push(`📅 ${date}`);
  }
  const time = getFormatTime(data.start_date, tz);
  if (time) {
    let str = `🕖 ${time}`;

    if (data.end_date) {
      str += ` - ${getFormatTime(data.end_date, tz)}`;
    }
    lines.push(str);
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
    chatId: options.chatId,
    messageId: options.messageId,
  });

  return {
    inline_keyboard: [
      [
        {
          text: 'Иду',
          callback_data: `meeting_rsvp:${options.taskId}:accept`,
        },
        {
          text: 'Не смогу',
          callback_data: `meeting_rsvp:${options.taskId}:reject`,
        },
      ],
      [
        {
          text: 'Редактировать событие',
          url: linkStartApp({to: `/calendar/${options.taskId}/edit?${to.toString()}`}),
        },
      ],
    ],
  };
}
