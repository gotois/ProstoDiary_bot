const bot = require('../core/bot');
const { client } = require('../core/jsonrpc');
const oauthService = require('../services/oauth.service');
/**
 * @param {string} token - token
 * @param {TelegramMessage} message - telegram message
 * @returns {Promise<void>}
 */
const telegramSignInCallback = async (token, message) => {
  await client.request('sign-in', {
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

module.exports = async (request, response) => {
  const { grant } = request.session;
  let passportData;
  switch (grant.provider) {
    // https://developers.facebook.com/docs/graph-api/using-graph-api/?locale=ru_RU
    case 'facebook': {
      if (grant.response.error) {
        return response.status(400).send(grant.response.error.error_message);
      }
      passportData = await oauthService.facebookPassportInfo(grant.response);
      break;
    }
    // https://yandex.ru/dev/passport/doc/dg/tasks/algorithm-docpage/
    case 'yandex': {
      passportData = await oauthService.yandexPassportInfo(grant.response);
      break;
    }
    default: {
      return response.status(404).send('unknown provider: ' + grant.provider);
    }
  }
  const { error, result } = await client.request('registration', {
    [grant.provider]: {
      ...passportData,
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
};
