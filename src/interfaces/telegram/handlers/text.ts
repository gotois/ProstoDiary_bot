import { TYPING, parseMode, linkPayload, linkStartApp, sendPrepareMessage, sendPrepareAction } from '../../../libs/tg-messages.ts';
import { container } from '../../../app/container.ts';

/**
 * Генерирует inline-клавиатуру из артефактов
 * @param {unknown[]} artifact - список артефактов из ответа AI
 * @returns {unknown[][]} Массив строк inline-кнопок
 */
function generateInlineKeyboard(artifact: unknown[] = []): unknown[][] {
  const inlineKeyboard = [];
  for (const action of artifact) {
    switch (action['@type']) {
      case 'CreateAction': {
        const taskId = getTaskId(action.id);
        const to = `/edit/${taskId}`; // todo - переделать под формат ссылки календаря
        const text = 'Открыть';
        const isMiniApp = 1; // Открыто в MiniApp или WebApp
        if (isMiniApp) {
          inlineKeyboard.push([
            {
              text: text,
              url: linkStartApp({ to }),
            },
          ]);
        } else {
          inlineKeyboard.push([
            {
              text: text,
              web_app: linkPayload({ to }),
            },
          ]);
        }
        break;
      }
      default: {
        break;
      }
    }
  }
  return inlineKeyboard;
}

const getTaskId = (id) => {
  const url = new URL(id);
  const segments = url.pathname.split('/').filter(Boolean);
  const result = segments.at(-1);
  if (result.length > 0) {
    return Number(result);
  }
};

export default async (activity, message, bot) => {
  await sendPrepareAction(bot, message.chat.id, TYPING);

  let secretaryData;
  try {
    secretaryData = await container.processTextMessage.execute({
      text: message.text,
      chatId: message.chat.id,
      tenantId: message.from.id,
      userId: message.user.sub,
      language: message.user.language,
      accessToken: message.user.access_token,
      location: message.user.location,
      timezone: message.user.timezone,
    });
  } catch (error) {
    if (error?.code === 401) {
      await bot.sendMessage(message.chat.id, 'Пройдите авторизацию заново /start');
      return;
    }
    throw error;
  }
  console.log('secretaryData', secretaryData);
  const { content, artifact } = secretaryData;

  await bot.sendMessage(message.chat.id, content[0].text, {
    parse_mode: parseMode('text/markdown'),
    reply_to_message_id: message.message_id,
    protect_content: true,
    disable_notification: true,
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: generateInlineKeyboard(artifact),
      force_reply: true,
    },
  });
  if (artifact) {
    await sendPrepareMessage(activity, message, bot);
  }
};
