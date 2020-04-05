const { post } = require('../services/request.service');
const logger = require('../lib/log');
const { SERVER } = require('../environment');

class TelegramNotify {
  // AcceptAction or RejectAction jsonld
  constructor(document) {
    let isSilent = document.object.mainEntity.find((entity) => {
      return entity.name === 'silent';
    });
    isSilent = isSilent && isSilent['value'];
    if (isSilent) {
      logger.info('skip notify message');
      return;
    }
    let telegramMessageId = document.object.mainEntity.find((entity) => {
      return entity.name === 'TelegramMessageId';
    });
    telegramMessageId = telegramMessageId && telegramMessageId['value'];
    let telegramChatId = document.object.mainEntity.find((entity) => {
      return entity.name === 'TelegramChatId';
    });
    telegramChatId = telegramChatId && telegramChatId['value'];

    this.subject = document.purpose.abstract;
    this.parseMode =
      document.purpose.encodingFormat === 'text/markdown' ? 'Markdown' : 'HTML';
    this.html = document.purpose.text;
    this.url = document.purpose.url;
    this.chatId = telegramChatId;
    this.messageId = telegramMessageId;
  }
}
/**
 * Кидаем вебхуку на адрес ассистента
 *
 * @param {object} document - jsonld
 * @returns {Promise<void>}
 */
module.exports = async (document) => {
  logger.info(document);
  switch (document.agent.email) {
    case 'tg@gotointeractive.com': {
      const telegramNotify = new TelegramNotify(document);
      await post(`${SERVER.HOST}/assistant/tg`, {
        subject: telegramNotify.subject,
        html: telegramNotify.html,
        url: telegramNotify.url,
        messageId: telegramNotify.messageId,
        chatId: telegramNotify.chatId,
        parseMode: telegramNotify.parseMode,
      });
      break;
    }
    default: {
      throw new Error('Unknown agent sender');
    }
  }
};
