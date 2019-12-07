const { publisher } = require('../../../package');

class Abstract {
  get context() {
    return {
      jurisdiction: this.jurisdiction,
    };
  }
  /**
   * @todo: это правовое поле действий бота
   * @type {JSON|undefined}
   */
  get jurisdiction() {
    return JSON.stringify([
      {
        'publisher': publisher,
        'coding': [
          {
            'system': 'urn:iso:std:iso:3166',
            'code': 'GB',
            // "display": "United Kingdom of Great Britain and Northern Ireland (the)"
          },
        ],
      },
    ]);
  }
}

module.exports = Abstract;
