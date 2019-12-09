const package_ = require('../../../package');
const { IS_AVA_OR_CI } = require('../../environment');
const { mail } = require('../../lib/sendgrid');
/**
 * @description Отправляем сообщение. Попадает на почту на специально сгенерированный ящик gotois и после прочтения ботом удаляем
 * @param {object} requestObject - requestObject
 * @returns {Promise<string>}
 */
module.exports = async (requestObject) => {
  const {
    content,
    subject,
    mime,
    from,
    to,
    categories = [],
    date = Math.round(new Date().getTime() / 1000),
    telegram_message_id = null,
    chat_id = null,
  } = requestObject;
  const headers = {
    'x-bot': package_.name,
    'x-bot-version': package_.version,
    // todo: x-bot-sign - уникальная подпись бота
  };
  const message = {
    personalizations: [
      {
        to,
        headers,
        subject,
        customArgs: {
          timestamp: date,
          test: IS_AVA_OR_CI,
          chat_id: chat_id,
          telegram_message_id: telegram_message_id,
        },
      },
    ],
    from,
    replyTo: {
      email: 'bugs@gotointeractive.com',
      name: 'Bug gotois',
    },
    content: [
      {
        type: mime,
        value: content,
      },
    ],
    mailSettings: {
      // "sandbox_mode": {
      //   "enable": true // todo set true for CI and test
      // },
    },
    categories,
  };
  const [mailResult] = await mail.send(message);
  if (!mailResult.complete) {
    throw new Error('Mail send not completed');
  }
  return '📨';
};
