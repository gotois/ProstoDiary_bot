const package_ = require('../../../package');
const { IS_AVA_OR_CI } = require('../../environment');
const { mail } = require('../../lib/sendgrid');
const logger = require('../../services/logger.service');
/**
 * Нотификация боту. Текст нечитаем для пользователя
 *
 * @description Отправляем сообщение. Попадает на почту на специально сгенерированный ящик gotois и после прочтения ботом удаляем
 * @param {object} requestObject - requestObject
 * @returns {Promise<string>}
 */
module.exports = async function(requestObject) {
  const {
    tags,
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
    'x-bot-tags': JSON.stringify(tags), // todo лучше перенести в отдельный attachment
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
          experimental: IS_AVA_OR_CI,
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
  logger.info('mail.send');
  try {
    const [mailResult] = await mail.send(message);
    if (!mailResult.complete) {
      return Promise.reject(this.error(400, 'Mail send not completed'));
    }
    return '📨';
  } catch (error) {
    logger.error(error.response.body.errors);
    return Promise.reject(this.error(error.code, 'Email bad request'));
  }
};
