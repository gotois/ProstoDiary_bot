import { TYPING, linkPayload, linkStartApp, sendPrepareMessage, sendPrepareAction } from '../../libs/tg-messages.ts';
import secretaryAI from '../../libs/secretary-ai.ts';

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
              url: linkStartApp({to}),
            },
          ]);
        } else {
          inlineKeyboard.push([
            {
              text: text,
              web_app: linkPayload({to}),
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

  const headers = new Headers();
  headers.set('Accept', 'text/markdown');
  headers.set('Authorization', 'Bearer ' + message.user.access_token);
  if (message.user.location) {
    headers.set('Geolocation', message.user.location);
  } else {
    headers.set('Timezone', message.user.timezone);
  }

  if (!secretaryAI.isConnected) {
    try {
      await secretaryAI.connect(headers);
    } catch (error) {
      if (error.code === 401) {
        await bot.sendMessage(message.chat.id, 'Пройдите авторизацию заново /start');
        return;
      }
    }
  }
  // todo на будущее используй callbacks, tags, signal
  const secretaryData = await secretaryAI.chat(message.text, {
    configurable: {
      thread_id: message.chat.id,
      tenant_id: message.from.id,
    },
    metadata: {
      user_id: message.user.sub,
      locale: message.user.language,
    },
    headers: headers,
  });
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
