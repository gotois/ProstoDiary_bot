const Abstract = require('.');
const photoAnalyze = require('../analyze/photo-analyze');
const jsonldAction = require('../action/base');

class AbstractPhoto extends Abstract {
  constructor(data) {
    super(data);
    this.imageBuffer = data.imageBuffer;
    // todo caption должен быть записан в контекст
    this.caption = data.caption;
  }
  /**
   * @returns {jsonldAction}
   */
  get context() {
    return {
      ...super.context,
      '@type': 'Action',
      'name': 'photo', // todo нужно иметь представление каждой возможной сущности (в том числе неизвестной прежде) в виде ее краткого имени - Ложбан?
      'result': {
        '@type': 'CreativeWork',
        'abstract': this.imageBuffer.toString('base64'),
        'encodingFormat': this.mime,
        'mainEntity': this.objectMainEntity,
      },
      'object': this.object,
    };
  }

  async prepare() {
    await photoAnalyze(this);
  }
}

module.exports = AbstractPhoto;
