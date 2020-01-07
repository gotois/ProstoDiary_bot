const { publisher } = require('../../../package');

class Abstract {
  constructor (data) {
    // this.storyId = data.storyId;
    // this.contentId = data.contentId;
    // this.category = data.category;
  }
  get context() {
    return {
      jurisdiction: this.jurisdiction,
      status: 'draft',
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
  /**
   * @override
   */
  async prepare() {
  }
}

module.exports = Abstract;
