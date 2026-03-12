const { TYPING, sendPrepareMessage, sendPrepareAction } = require('../../libs/tg-messages.cjs');
const secretaryAI = require('../../libs/secretary-ai.cjs');
const { SERVER, TELEGRAM } = require('../../environments/index.cjs');

function generateInlineKeyboard(artifact = []) {
  const inlineKeyboard = [];
  for (const action of artifact) {
    switch (action['@type']) {
      case 'CreateAction': {
        const taskId = getTaskId(action.id);
        const to = `/edit/${taskId}`; // todo - переделать под формат ссылки календаря
        const text = 'Открыть';
        const isMiniApp = 1; // Открыто в MiniApp или WebApp
        if (isMiniApp) {
          const payload = Buffer.from(
            JSON.stringify({
              debug: SERVER.IS_DEV,
              to: to,
            }),
          ).toString('base64url');
          inlineKeyboard.push([
            {
              text: text,
              url: `${TELEGRAM.BOT_LINK}?startapp=${payload}`,
            },
          ]);
        } else {
          inlineKeyboard.push([
            {
              text: text,
              web_app: `${TELEGRAM.APP_URL}${to}`,
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
  const result = segments[segments.length - 1];
  if (result.length > 0) {
    return Number(result);
  }
};

module.exports = async (bot, message) => {
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
      user_id: message.user.id,
      locale: message.user.language,
    },
    headers: headers,
  });
  const { content, artifact } = secretaryData;

  await bot.sendMessage(message.chat.id, content[0].text, {
    parse_mode: 'Markdown',
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
    await sendPrepareMessage(bot, message);
  }
};
