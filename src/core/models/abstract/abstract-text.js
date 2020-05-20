const Abstract = require('.');
const textAnalyze = require('../analyze/text-analyze');

class AbstractText extends Abstract {
  #creator;
  #publisher;
  #hashtags;
  constructor(data) {
    super(data);
    this.text = data.text;
    this.#hashtags = data.hashtags;
    this.#creator = data.creator;
    this.#publisher = data.publisher;
  }
  get creator() {
    return this.#creator;
  }
  get publisher() {
    return this.#publisher;
  }
  get hashtags() {
    return this.#hashtags || [];
  }
  /**
   * @returns {jsonldAction}
   */
  get context() {
    return {
      ...super.context,
      '@type': 'Action',
      'name': 'text', // todo нужно иметь представление каждой возможной сущности (в том числе неизвестной прежде) в виде ее краткого имени - Ложбан?
      'result': {
        '@type': 'CreativeWork',
        'abstract': this.abstract,
        'encodingFormat': 'text/plain',
        'mainEntity': this.objectMainEntity,
      },
      'object': this.object,
    };
  }

  async prepare() {
    await textAnalyze(this);
  }
}

module.exports = AbstractText;
