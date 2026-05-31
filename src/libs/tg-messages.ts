export const RECORD_AUDIO = 'record_audio';
export const TYPING = 'typing';
export const UPLOAD_DOCUMENT = 'upload_document';

export type ChatAction = typeof RECORD_AUDIO | typeof TYPING | typeof UPLOAD_DOCUMENT;

export async function sendPrepareAction(bot: { sendChatAction: (chatId: number, type: ChatAction) => Promise<void> }, chatId: number, type: ChatAction): Promise<void> {
  try {
    await bot.sendChatAction(chatId, type);
  } catch {
    // ...
  }
}

export async function sendPrepareMessage(activity: unknown, message: { chat: { id: number }; message_id: number }, bot: { setMessageReaction: (chatId: number, messageId: number, options: Record<string, unknown>) => Promise<void> }): Promise<void> {
  await bot.setMessageReaction(message.chat.id, message.message_id, {
    reaction: JSON.stringify([
      {
        type: 'emoji',
        emoji: '✍',
      },
    ]),
  });
}

export function parseMode(mediaType: 'text/markdown' | 'text/plain' | 'text/html' | 'text/xhtml'): 'MarkdownV2' | 'Markdown' | 'HTML' | undefined {
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
