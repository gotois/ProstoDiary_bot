const bot = require('../../core/bot');
const jsonrpc = require('../../core/jsonrpc');
const logger = require('../../services/logger.service');
const { SignIn } = require('../telegram/signin.event');

module.exports = async (request, response) => {
  logger.info('web:oauth');
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
  try {
    logger.info('web:oauth:rpcRequest');
    const result = await jsonrpc.rpcRequest(
      'oauth',
      {
        [grant.provider]: {
          ...grant.response,
          access_token: response.access_token,
        },
        telegram: grant.dynamic && grant.dynamic.telegram, // если делаем прямой переход по урлу, то никакого telegram не будет
      },
      {},
    );
    // todo здесь может имеет смысл использовать v3/notify
    if (grant.dynamic && grant.dynamic.telegram) {
      await bot.sendMessage(grant.dynamic.telegram.chat.id, result);
      try {
        const signIn = new SignIn(grant.dynamic.telegram);
        await signIn.beginDialog();
      } finally {
        response.redirect('tg://resolve?domain=ProstoDiary_bot');
      }
      return;
    }
    return response.status(200).send(result);
  } catch (error) {
    response.status(400).json(error);
  }
};
