const { post } = require('../services/request.service');
const logger = require('../lib/log');
const { SERVER } = require('../environment');

/* eslint-disable */
class EmailNotifyObject {
  constructor(document) {
    // console.log('document', document)
    // fixme насыщать из документа
    this.tags = null;
    this.content = null;
    this.subject = null;
    this.mime = null;
    this.categories = null;
    this.date = null;
    this.telegram_message_id = null;
    this.chat_id = null;
    this.attachments = [];
  }
}
/* eslint-enable */

class TelegramNotifyObject {
  // AcceptAction or RejectAction jsonld
  constructor(document) {
    let isSilent = document.result.mainEntity.find((entity) => {
      return entity.name === 'silent';
    });
    isSilent = isSilent && isSilent['value'];
    if (isSilent) {
      logger.info('skip notify message');
      return;
    }
    let telegramMessageId = document.result.mainEntity.find((entity) => {
      return entity.name === 'TelegramMessageId';
    });
    telegramMessageId = telegramMessageId && telegramMessageId['value'];
    let telegramChatId = document.result.mainEntity.find((entity) => {
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
    this.attachments = [];
    if (document.purpose.messageAttachment) {
      this.attachments.push({
        content: document.purpose.messageAttachment.abstract,
        filename: document.purpose.messageAttachment.name,
        type: document.purpose.messageAttachment.encodingFormat,
      });
      this.subject = document.purpose.about.name;
    }
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
    case 'email@gotointeractive.com': {
      // const emailNotify = new EmailNotifyObject(document);
      // todo отправлять по урлу /assistant/email
      break;
    }
    case 'tg@gotointeractive.com': {
      const telegramNotify = new TelegramNotifyObject(document);
      await post(
        `${SERVER.HOST}/assistant/tg`,
        {
          subject: telegramNotify.subject,
          html: telegramNotify.html,
          url: telegramNotify.url,
          messageId: telegramNotify.messageId,
          chatId: telegramNotify.chatId,
          parseMode: telegramNotify.parseMode,
          attachments: telegramNotify.attachments,
        },
        undefined,
        undefined,
        {
          user: 'tg@gotointeractive.com',
          pass: 'foobar', // fixme убрать хардкод. брать client_secret из БД
          sendImmediately: false,
        },
      );
      break;
    }
    default: {
      throw new Error('Unknown agent sender');
    }
  }
};
