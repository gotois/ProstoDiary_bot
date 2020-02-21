const package_ = require('../../../package');
const { IS_AVA_OR_CI } = require('../../environment');
const { mail } = require('../../lib/sendgrid');
const logger = require('../../services/logger.service');

/**
 * @description Отправляем сообщение. Попадает на почту на специально сгенерированный ящик gotois и после прочтения ботом удаляем
 * @param {object} requestObject - requestObject
 * @param {object} passport - passport
 * @returns {Promise<string>}
 */
async function notifyEmail(requestObject, passport) {
  const {
    tags,
    content,
    subject,
    mime,
    categories = ['notify'],
    date = Math.round(new Date().getTime() / 1000),
    telegram_message_id = null,
    chat_id = null,
  } = requestObject;
  const headers = {
    'x-bot': package_.name,
    'x-bot-version': package_.version,
    'x-bot-tags': JSON.stringify(tags), // todo лучше перенести в отдельный attachment
  };
  const message = {
    personalizations: [
      {
        to: passport.userEmail,
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
    from: passport.botEmail,
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
    // html,
    // attachments,
  };
  logger.info('mail.send');
  try {
    const [mailResult] = await mail.send(message);
    if (!mailResult.complete) {
      throw new Error('Mail send not completed');
    }
    return '📨';
  } catch (error) {
    logger.error(error.response.body.errors);
    throw new Error('Email bad request');
  }
}
/**
 * npm run e2e -- --match='API notify'
 *
 * https://github.com/gotois/ProstoDiary_bot/issues/343
 * Нотификация пользователю. Текст не читаем для бота.
 * в зависимости от доступных девайсов (телеграм, почта)
 *
 * @description аналогичны push-notification
 * @param {object} parameters - parameters
 * @param {object} passport - passport gotoisCredentions
 * @returns {Promise<*>}
 */
module.exports = async function(parameters, { passport }) {
  logger.info('notify');
  const { provider, subject } = parameters;
  if (typeof subject !== 'string') {
    throw new TypeError('Subject is not a string');
  }
  await notifyEmail(parameters, passport);
};
