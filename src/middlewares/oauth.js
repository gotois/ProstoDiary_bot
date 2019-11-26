const bot = require('../core/bot');
const { client } = require('../core/jsonrpc');
/**
 * @param {string} token - token
 * @param {TelegramMessage} message - telegram message
 * @returns {Promise<void>}
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
      case 'facebook': {
        if (grant.response.error) {
          return response.status(400).send(grant.response.error.error_message);
        }
        break;
      }
      case 'yandex': {
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
      const checkCodeMessageValue = await bot.sendMessage(
        grant.dynamic.telegram.chat.id,
        result,
        {
          reply_markup: {
            force_reply: true,
          },
        },
      );
      bot.onReplyToMessage(
        grant.dynamic.telegram.chat.id,
        checkCodeMessageValue.message_id,
        async ({ text }) => {
          await telegramSignInCallback(text, grant.dynamic.telegram);
        },
      );
      return response.redirect('tg://resolve?domain=ProstoDiary_bot');
    }
    return response.redirect('https://prosto-diary.gotointeractive.com/');
  } catch (error) {
    next(error);
  }
};
