const package_ = require('../../package.json');
const { IS_AVA_OR_CI } = require('../environment');
const { mail } = require('./sendgrid');
const logger = require('./log');
/**
 * @description Отправляем сообщение. Попадает на почту на специально сгенерированный ящик gotois и после прочтения ботом удаляем
 * @param {object} requestObject - requestObject
 * @param {object} passport - passport credentions
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
  if (typeof subject !== 'string') {
    throw new TypeError('Subject is not a string');
  }
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

module.exports = notifyEmail;
