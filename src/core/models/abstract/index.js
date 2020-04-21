const format = require('date-fns/format');
const fromUnixTime = require('date-fns/fromUnixTime');

class Abstract {
  constructor(data) {
    this.subjectOf = [];
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
    if (this.namespace) {
      // fixme убрать хардкод
      if (this.namespace.includes('//t.me/')) {
        return {
          '@type': 'Organization',
          'email': 'tg@gotointeractive.com',
        };
      }
    }
    throw new Error('Unknown agent');
  }
  // дополняемый участник - например посредник от ассистента к паспорту бота
  get participant() {
    return {
      '@type': 'Organization',
      'email': 'posrednik@example.com',
    };
  }
  /**
   * @returns {jsonldApiRequest}
   */
  get context() {
    return {
      // fixme для вложенных абстрактов требуется использовать $ref?
      //  https://github.com/APIDevTools/json-schema-ref-parser
      '@id': this.namespace, // изоляцинные идентификаторы сообщения
      'agent': this.agent,
      'participant': this.participant,
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
