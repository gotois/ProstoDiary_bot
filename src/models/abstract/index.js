const INTENTS = require('../../core/intents');

class Abstract {
  #intent = []; // Определяем намерения
  #publisher = undefined;
  /**
   * @type {Buffer}
   */
  buffer = null;
  /**
   * @param {Buffer} content - raw content
   * @param {string} publisher - кто ответственнен за контент
   */
  constructor(content, publisher) {
    this.buffer = content;
    this.#publisher = publisher;
  }
  get publisher () {
    return this.#publisher;
  }
  get intent() {
    if (this.#intent.length) {
      return this.#intent[0].replace('Intent', '').toLowerCase();
    }
    return [];
  }
  set intent(intentName) {
    this.#intent.unshift(intentName);
  }
  /**
   * @todo: добавить криптование контента crypt.encode(context)
   * параметры проставляются в зависимости от типа Abstract
   * @returns {object}
   */
  get context() {
    switch (this.constructor.name) {
      case 'AbstractText': {
        return {
          abstract: 'text',
          languageCode: this.language,
          text: this.text,
          sentiment: this.sentiment,
          hrefs: this.hrefs,
          entities: this.entities,
          emails: this.emails,
          phones: this.phones,
          category: this.category,
          names: this.names,
          parameters: this.parameters,
          // geo: this.geo // todo: geoJSON доступен из текста
          // wiki: todo: {topologyLink} ?краткое описание из вики?
        }
      }
      case 'AbstractPhoto': {
        return {
          abstract: 'photo',
        }
      }
      case 'AbstractDocument': {
        return {
          abstract: 'document',
        }
      }
      default: {
        throw new Error('Unknown abstract');
      }
    }
  }
}

module.exports = Abstract;
