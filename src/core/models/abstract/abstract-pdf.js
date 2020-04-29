const visionService = require('../../../lib/vision');
const googleStorage = require('../../../lib/google-storage');
const Abstract = require('.');

class AbstractPDF extends Abstract {
  constructor(data) {
    super(data);
    this.buffer = data.buffer;
    this.filename = data.filename;
    this.filesize = data.filesize;
    this.mimeType = data.mimeType;
  }
  /**
   * @returns {jsonldApiRequest}
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
  // загружаем бинарник в cloud, производим расчеты, получаем сгенерированный json, разбиваем его на объекты
  async prepare() {
    const filename = await googleStorage.uploadFile(this.buffer, this.filename);
    const file = await visionService.pdfReader(filename);
    const storageFile = await googleStorage.getFile(file);
    const filesResponse = JSON.parse(storageFile.toString());
    const [{ fullTextAnnotation, context }] = filesResponse.responses;
    const { /* pages, */ text } = fullTextAnnotation;
    this.object.push({
      '@type': 'CreativeWork',
      'description': text,
      'url': context.uri,
    });
  }
}

module.exports = AbstractPDF;
