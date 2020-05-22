const Abstract = require('.');
const pdfAnalze = require('../analyze/pdf-analyze');
const jsonldAction = require('../action/base');

class AbstractPDF extends Abstract {
  constructor(data) {
    super(data);
    this.buffer = data.buffer;
    this.filename = data.filename;
    this.filesize = data.filesize;
    this.mimeType = data.mimeType;
  }
  /**
   * @returns {jsonldAction}
   */
  get context() {
    return {
      ...super.context,
      '@type': 'Action',
      'name': 'pdf',
      'result': {
        '@type': 'CreativeWork',
        'name': this.filename,
        'abstract': this.buffer.toString('base64'),
        'encodingFormat': this.mimeType,
        'mainEntity': this.objectMainEntity,
      },
      'object': this.object,
    };
  }

  async prepare() {
    await pdfAnalze(this);
  }
}

module.exports = AbstractPDF;
