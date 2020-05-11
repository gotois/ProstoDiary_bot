const logger = require('../lib/log');

module.exports = class Notifier {
  /* eslint-disable */
  static convertToEmailNotifyObject(document) {
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
  /* eslint-enable */
  static convertToTelegramNotifyObject(document) {
    let isSilent = document.result.mainEntity.find((entity) => {
      return entity.name === 'silent';
    });
    isSilent = isSilent && isSilent['value'];
    if (isSilent) {
      logger.info('skip notify message');
      return;
    }
    const telegramMessageId = document.result.mainEntity.find((entity) => {
      return entity.name === 'TelegramMessageId';
    });
    const messageId = telegramMessageId && telegramMessageId['value'];
    const telegramChatId = document.result.mainEntity.find((entity) => {
      return entity.name === 'TelegramChatId';
    });
    const chatId = telegramChatId && telegramChatId['value'];
    const attachments = [];
    const parseMode =
      document.purpose.encodingFormat === 'text/markdown' ? 'Markdown' : 'HTML';
    let subject = document.purpose.abstract;
    if (document.purpose.messageAttachment) {
      attachments.push({
        content: document.purpose.messageAttachment.abstract,
        filename: document.purpose.messageAttachment.name,
        type: document.purpose.messageAttachment.encodingFormat,
      });
      subject = document.purpose.about.name;
    }
    return {
      subject,
      parseMode,
      html: document.purpose.text,
      url: document.purpose.url,
      chatId,
      messageId,
      attachments,
    };
  }
};
