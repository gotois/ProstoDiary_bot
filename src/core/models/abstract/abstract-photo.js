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
      '@context': {
        schema: 'http://schema.org/',
        agent: 'schema:agent',
        name: 'schema:name',
        startTime: 'schema:startTime',
        object: 'schema:object',
        subjectOf: 'schema:subjectOf',
        abstract: 'schema:abstract',
        description: 'schema:description',
        encodingFormat: 'schema:encodingFormat',
        identifier: 'schema:identifier',
        provider: 'schema:provider',
        participant: 'schema:participant',
        value: 'schema:value',
        email: 'schema:email',
        mainEntity: 'schema:mainEntity',
      },
      '@type': 'Action',
      'object': {
        '@type': 'CreativeWork',
        'name': 'photo',
        'abstract': this.imageBuffer.toString('base64'),
        'encodingFormat': this.mime,
        'mainEntity': this.objectMainEntity,
      },
      'subjectOf': this.subjectOf,
    };
  }

  async prepare() {
    const { mime } = await FileType.fromBuffer(this.imageBuffer);
    this.mime = mime;
    const visionResult = await visionService.labelDetection(this.imageBuffer);
    // todo распознавать интент-намерение в самой картинке через Vision
    visionResult.labelAnnotations.forEach((annotation) => {
      this.subjectOf.push({
        '@type': 'CreativeWork',
        'description': annotation.description,
        'object': {
          '@type': 'Thing',
          'name': annotation.mid, // todo больше хак, потому что хранится строка вида "/m/014cnc"
        },
      });
    });
  }
}

module.exports = AbstractPhoto;
