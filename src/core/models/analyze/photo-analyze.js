const FileType = require('file-type');
const visionService = require('../../../lib/vision');

module.exports = async (abstract) => {
  const { mime } = await FileType.fromBuffer(abstract.imageBuffer);
  abstract.mime = mime;
  const visionResult = await visionService.labelDetection(abstract.imageBuffer);
  // todo распознавать интент-намерение в самой картинке через Vision
  // ...
  visionResult.labelAnnotations.forEach((annotation) => {
    abstract.object.push({
      '@type': 'CreativeWork',
      'description': annotation.description,
      'name': annotation.mid, // todo больше хак, потому что хранится строка вида "/m/014cnc"
    });
  });
};
