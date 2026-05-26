export const RECORD_AUDIO = 'record_audio';
export const TYPING = 'typing';
export const UPLOAD_DOCUMENT = 'upload_document';

export async function sendPrepareAction(bot, chatId, type) {
  try {
    await bot.sendChatAction(chatId, type);
  } catch {
    // ...
  }
}

export async function sendPrepareMessage(bot, message) {
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
 * @param {'text/markdown'|'text/plain'|'text/html'|'text/xhtml'} mediaType - media types
 * @returns {'MarkdownV2'|'Markdown'|'HTML'|undefined}
 */
export function parseMode(mediaType) {
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
