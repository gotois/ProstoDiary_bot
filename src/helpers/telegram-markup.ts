import { linkStartApp } from '../libs/tg-messages.ts';

type TelegramGroupMeeting = {
  name?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  description?: string;
};

/**
 * Форматирует время события для Telegram
 * @param date - дата события
 * @param tz - timezone пользователя
 * @returns Время события
 */
function getFormatTime(date: string, tz: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Форматирует событие для сообщения в Telegram группе
 * @param data - данные события
 * @param tz - timezone пользователя
 * @returns Текст сообщения
 */
export function formatTelegramGroupMeeting(data: TelegramGroupMeeting, tz: string): string {
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
    let string_ = `🕖 ${time}`;

    if (data.end_date) {
      string_ += ` - ${getFormatTime(data.end_date, tz)}`;
    }
    lines.push(string_);
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
 * @param options - параметры inline-клавиатуры
 * @param options.chatId - id Telegram чата
 * @param options.messageId - id Telegram сообщения
 * @param options.taskId - id задачи
 * @param options.sourceUrl - исходная ссылка события
 * @returns Inline-клавиатура Telegram
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
          text: 'Не иду',
          callback_data: `meeting_rsvp:${options.taskId}:reject`,
        },
      ],
      [
        {
          text: 'Редактировать событие',
          url: linkStartApp({ to: `/calendar/${options.taskId}/edit?${to.toString()}` }),
        },
      ],
    ],
  };
}
