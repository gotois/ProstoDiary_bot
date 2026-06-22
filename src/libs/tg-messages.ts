import { TELEGRAM, IS_DEV } from '#env';

export const RECORD_AUDIO = 'record_audio';
export const TYPING = 'typing';
export const UPLOAD_DOCUMENT = 'upload_document';

export type ChatAction = typeof RECORD_AUDIO | typeof TYPING | typeof UPLOAD_DOCUMENT;

/**
 * Отправляет действие «печатает» в указанный чат
 * @param {object} bot - экземпляр бота
 * @param {Function} bot.sendChatAction - метод отправки действия
 * @param {number} chatId - идентификатор чата
 * @param {ChatAction} type - тип действия
 */
export async function sendPrepareAction(
  bot: { sendChatAction: (chatId: number, type: ChatAction) => Promise<void> },
  chatId: number,
  type: ChatAction,
): Promise<void> {
  try {
    await bot.sendChatAction(chatId, type);
  } catch {
    // ...
  }
}

/**
 * Устанавливает реакцию «пишет» на сообщение
 * @param {unknown} activity - активность ActivityPub
 * @param {object} message - сообщение Telegram
 * @param {object} message.chat - чат сообщения
 * @param {number} message.chat.id - идентификатор чата
 * @param {number} message.message_id - идентификатор сообщения
 * @param {object} bot - экземпляр бота
 * @param {Function} bot.setMessageReaction - метод установки реакции
 */
export async function sendPrepareMessage(
  activity: unknown,
  message: { chat: { id: number }; message_id: number },
  bot: { setMessageReaction: (chatId: number, messageId: number, options: Record<string, unknown>) => Promise<void> },
): Promise<void> {
  await bot.setMessageReaction(message.chat.id, message.message_id, {
    reaction: JSON.stringify([
      {
        type: 'emoji',
        emoji: '✍',
      },
    ]),
  });
}

/**
 * Определяет parse_mode Telegram по MIME-типу
 * @param {'text/markdown'|'text/plain'|'text/html'|'text/xhtml'} mediaType - MIME-тип контента
 * @returns {'MarkdownV2'|'Markdown'|'HTML'|undefined} Режим форматирования Telegram
 */
export function parseMode(
  mediaType: 'text/markdown' | 'text/plain' | 'text/html' | 'text/xhtml',
): 'MarkdownV2' | 'Markdown' | 'HTML' | undefined {
  switch (mediaType) {
    case 'text/markdown': {
      return 'MarkdownV2';
    }
    case 'text/plain': {
      return 'Markdown';
    }
    case 'text/xhtml':
    case 'text/html': {
      return 'HTML';
    }
    default: {
      return;
    }
  }
}

/**
 *
 * @param root0
 * @param root0.to
 */
export function linkStartApp({ to }) {
  const payload = Buffer.from(
    JSON.stringify({
      to: to,
    }),
  ).toString('base64url');

  return `${TELEGRAM.BOT_LINK}?startapp=${payload}`;
}

/**
 *
 * @param root0
 * @param root0.to
 */
export function linkPayload({ to }) {
  const payload = Buffer.from(
    JSON.stringify({
      debug: IS_DEV,
      to: to,
    }),
  ).toString('base64url');

  return `${TELEGRAM.APP_URL}?payload=${payload}`;
}
