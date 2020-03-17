// todo перенести в core/models/
const { publisher } = require('../../../package.json');

class Abstract {
  constructor(data) {
    this.objectMainEntity = [];
    this.objectMainEntity.push({
      "@type": "PropertyValue",
      "name": "silent",
      "value": data.silent
    });
    if (data.telegram) {
      this.objectMainEntity.push({
        "@type": "PropertyValue",
        "name": 'TelegramMessageId',
        "value": data.telegram.messageId
      });
      this.objectMainEntity.push({
        "@type": "PropertyValue",
        "name": "TelegramChatId",
        "value": data.telegram.chatId
      });
    }
  }
  get context() {
    return {
      // расширить когда потребуется
      // target: {
      //   "@type": "EntryPoint",
      //   actionApplication: {
      //     "@type": "SoftwareApplication",
      //     "name": "Telegram", // или email
      //   }
      // }
    };
  }
  /**
   * Это правовое поле действий бота/ассистента. Это значит что часть абстрактов может не быть включено в историю по неким причинам
   * Intended jurisdiction for operation definition
   *
   * @type {JSON|undefined}
   */
  get jurisdiction() {
    return JSON.stringify([
      {
        publisher: publisher,
        coding: [
          {
            system: 'urn:iso:std:iso:3166',
            code: 'GB',
            // "display": "United Kingdom of Great Britain and Northern Ireland (the)"
          },
        ],
      },
    ]);
  }
  /**
   * @override
   */
  async prepare() {}
}

module.exports = Abstract;
