const bot = require('../core/bot');
const { client } = require('../core/jsonrpc');
/**
 * @param {string} token - token
 * @param {TelegramMessage} message - telegram message
 * @returns {Promise<undefined>}
 */
const telegramSignInCallback = async (token, message) => {
  await client.request('signin', {
    token,
    telegram: message.from.id,
  });
  const me = await bot.getMe();
  await bot.sendMessage(
    message.chat.id,
    `Приветствую ${message.chat.first_name}!\n` +
      `Я твой персональный бот __${me.first_name}__.\n` +
      'Узнай все мои возможности командой /help.',
    {
      parse_mode: 'Markdown',
    },
  );
};

module.exports = async (request, response, next) => {
  try {
    const { grant } = request.session;
    switch (grant.provider) {
      case 'yandex':
      case 'facebook': {
        if (grant.response.error) {
          return response.status(400).send(grant.response.error.error_message);
        }
        break;
      }
      default: {
        return response.status(404).send('unknown provider: ' + grant.provider);
      }
    }
    const { error, result } = await client.request('oauth', {
      [grant.provider]: {
        ...grant.response,
        access_token: response.access_token,
      },
      telegram: grant.dynamic && grant.dynamic.telegram, // если делаем прямой переход по урлу, то никакого telegram не будет
    });
    if (error) {
      return response.status(400).send(error);
    }
    if (grant.dynamic && grant.dynamic.telegram) {
      await bot.sendMessage(grant.dynamic.telegram.chat.id, result);
      const checkSecretValue = await bot.sendMessage(
        grant.dynamic.telegram.chat.id,
        'Ваш токен от двухфакторной аутентификации:',
        {
          reply_markup: {
            force_reply: true,
          },
        },
      );
      bot.onReplyToMessage(
        grant.dynamic.telegram.chat.id,
        checkSecretValue.message_id,
        async ({ text }) => {
          await telegramSignInCallback(text, grant.dynamic.telegram);
        },
      );
      return response.redirect('tg://resolve?domain=ProstoDiary_bot');
    }
    return response.status(200).send(result);
  } catch (error) {
    next(error);
  }
};
