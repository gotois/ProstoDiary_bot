const FileType = require('file-type');
const visionService = require('../../../lib/vision');
const Abstract = require('.');

class AbstractPhoto extends Abstract {
  constructor(data) {
    super(data);
    this.imageBuffer = data.imageBuffer;
    // todo caption должен быть записан в контекст
    this.caption = data.caption;
  }
  /**
   * @returns {jsonldApiRequest}
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
    const { mime } = await FileType.fromBuffer(this.imageBuffer);
    this.mime = mime;
    const visionResult = await visionService.labelDetection(this.imageBuffer);
    // todo распознавать интент-намерение в самой картинке через Vision
    visionResult.labelAnnotations.forEach((annotation) => {
      this.object.push({
        '@type': 'CreativeWork',
        'description': annotation.description,
        'name': annotation.mid, // todo больше хак, потому что хранится строка вида "/m/014cnc"
      });
    });
  }
}

module.exports = AbstractPhoto;
