const FileType = require('file-type');
const format = require('date-fns/format');
const fromUnixTime = require('date-fns/fromUnixTime');
const { unpack } = require('../../../lib/archiver');
const jsonldAction = require('../action/base');

class Abstract {
  constructor(data) {
    // это параметры которые были установлены при создании
    this._data = data;
    this.filename = data.filename || undefined;
    this.object = [];
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
  /**
   * @param {Buffer} buffer - buffer
   * @returns {Promise<Abstract>}
   */
  static async getAbstractFromDocument(buffer) {
    const { mime, ext } = await FileType.fromBuffer(buffer);
    switch (mime) {
      case 'application/zip': {
        return require('./abstract-archive');
      }
      case 'application/octet-stream': {
        const mapBuffer = await unpack(buffer);
        if (mapBuffer.size === 0) {
          throw new Error('Empty file');
        }
        // eslint-disable-next-line
        mapBuffer.forEach((buffer) => {
          // todo нужен рекурсивных обход документов
        });
        break;
      }
      case 'application/xml': {
        return require('./abstract-dsl');
      }
      case 'application/pdf': {
        return require('./abstract-pdf');
      }
      default: {
        throw new Error(`Unknown ${ext} document mimetype: ${mime}`);
      }
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
  get instrument() {
    return {
      '@type': 'Thing',
      'name': 'Core',
      'url': 'https://github.com/gotois/core',
    };
  }
  get target() {
    return {
      '@type': 'EntryPoint',
      'actionApplication': {
        '@type': 'SoftwareApplication',
        'name': 'Telegram',
      },
    };
  }
  get startTime() {
    return format(
      fromUnixTime(Math.round(new Date().getTime() / 1000)),
      'yyyy-MM-dd',
    );
  }
  get participant() {
    return {
      '@type': 'Organization',
      'email': 'posrednik@example.com',
    };
  }
  /**
   * @returns {jsonldAction}
   */
  get context() {
    return {
      // fixme для вложенных абстрактов требуется использовать $ref?
      //  https://github.com/APIDevTools/json-schema-ref-parser
      '@context': {
        mainEntity: 'schema:mainEntity',
        schema: 'http://schema.org/',
        agent: 'schema:agent',
        name: 'schema:name',
        startTime: 'schema:startTime',
        object: 'schema:object',
        target: 'schema:target',
        result: 'schema:result',
        actionApplication: 'schema:actionApplication',
        subjectOf: 'schema:subjectOf',
        abstract: 'schema:abstract',
        description: 'schema:description',
        instrument: 'schema:instrument',
        encodingFormat: 'schema:encodingFormat',
        identifier: 'schema:identifier',
        provider: 'schema:provider',
        participant: 'schema:participant',
        value: 'schema:value',
        url: 'schema:url',
        email: 'schema:email',
        geo: 'schema:geo',
        addressCountry: 'schema:Country',
        addressLocality: 'schema:Text',
        addressRegion: 'schema:Text',
        streetAddress: 'schema:Text',
        postalCode: 'schema:Text',
        address: 'schema:address',
        latitude: 'schema:latitude',
        longitude: 'schema:longitude',
      },
      '@id': this.namespace, // изоляцинные идентификаторы сообщения
      'agent': this.agent, // ассистент, например tg
      'participant': this.participant, // прочие агенты - например посредник от ассистента к паспорту бота
      'startTime': this.startTime, // время отправки отданное создателем
      // endTime: null // todo время отправки сообщение которое пришло после ответа API боту
      'instrument': this.instrument, // core инструмент
      'target': this.target, // ПО чем было записано, например TelegramWeb
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
