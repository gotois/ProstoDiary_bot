const TelegramNotifyError = require('../errors/telegram-notify-error');
/**
 * @param {TelegramNotifyError|Error} error - error
 * @param {?string} [encoding] - encoding
 * @returns {{purpose: {'@type': string, encodingFormat: string, abstract: *}, '@type': string, '@context': string}}
 */
module.exports = (error, encoding = 'text/plain') => {
  const mainEntity = [];
  let agent;
  if (error instanceof TelegramNotifyError) {
    agent = {
      '@type': 'Organization',
      'email': 'tg@gotointeractive.com',
    };
    if (error.messageId) {
      mainEntity.push({
        name: 'TelegramMessageId',
        value: error.messageId,
      });
    }
    if (error.chatId) {
      mainEntity.push({
        name: 'TelegramChatId',
        value: error.chatId,
      });
    }
  }

  return {
    '@context': 'http://schema.org',
    '@type': 'RejectAction',
    'agent': agent,
    'purpose': {
      '@type': 'Answer',
      'abstract': error.message,
      'encodingFormat': encoding,
    },
    'object': {
      mainEntity: mainEntity,
    },
  };
};
