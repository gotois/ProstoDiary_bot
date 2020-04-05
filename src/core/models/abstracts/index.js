const format = require('date-fns/format');
const fromUnixTime = require('date-fns/fromUnixTime');
const { publisher } = require('../../../../package.json');

class Abstract {
  constructor(data) {
    this.objectMainEntity = [];
    this.objectMainEntity.push({
      '@type': 'PropertyValue',
      'name': 'silent',
      'value': data.silent || false,
    });
    if (data.telegram) {
      if (data.telegram.messageId) {
        this.objectMainEntity.push({
          '@type': 'PropertyValue',
          'name': 'TelegramMessageId',
          'value': data.telegram.messageId,
        });
      }
      if (data.telegram.chatId) {
        this.objectMainEntity.push({
          '@type': 'PropertyValue',
          'name': 'TelegramChatId',
          'value': data.telegram.chatId,
        });

        // телеграм чат
        this.namespace = `https://t.me/chat#${data.telegram.chatId}`;
      }
    } else {
      // сообщение пришло из почты
      // this.namespace будет устанавливаться из Message-Id письма
    }
  }
  // identifier assistant
  get agent() {
    // hack считаем что это ассистент tg@gotointeractive.com
    if (this.namespace.includes('//t.me/')) {
      return {
        '@type': 'Organization',
        'email': 'tg@gotointeractive.com',
      };
    }
    throw new Error('Unknown agent');
  }
  get context() {
    return {
      '@id': this.namespace, // изоляцинные идентификаторы сообщения
      'agent': this.agent,
      'participant': {
        '@type': 'Person',
        'email': this.publisher, // fixme identifier user
      },
      'startTime': format(
        fromUnixTime(Math.round(new Date().getTime() / 1000)),
        'yyyy-MM-dd',
      ),
      // uncomment
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
        publisher,
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
