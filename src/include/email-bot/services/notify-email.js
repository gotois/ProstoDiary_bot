const package_ = require('../../../../package.json');
const { IS_AVA_OR_CI } = require('../../../environment');
const { mail } = require('../../../lib/sendgrid');
const logger = require('../../../lib/log');
/**
 * @description Отправляем сообщение. Попадает на почту на специально сгенерированный ящик gotois и после прочтения ботом удаляем
 * @param {object} requestObject - requestObject
 * @returns {Promise<string>}
 */
async function notifyEmail(requestObject) {
  const {
    from,
    to,
    tags,
    content,
    subject,
    mime,
    attachments,
    categories = ['notify'],
    date = Math.round(new Date().getTime() / 1000),
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
        to,
        headers,
        subject,
        customArgs: {
          timestamp: date,
          experimental: IS_AVA_OR_CI,
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
    // html,
    attachments,
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
