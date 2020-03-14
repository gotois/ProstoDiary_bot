const fileType = require('file-type');
const visionService = require('./vision.service');
const rpc = require('../lib/rpc');
const package_ = require('../../../../package');
/**
 * @param {object} requestObject - object
 * @param {string} requestObject.caption - photo caption text
 * @param {Buffer} requestObject.fileBuffer - file buffer
 * @returns {Promise<*>}
 */
module.exports = async function(requestObject) {
  const { imageBuffer, /* caption, */ auth, jwt } = requestObject;
  const { mime } = fileType(imageBuffer);
  const tags = [];
  const visionResult = await visionService.labelDetection(imageBuffer);
  // todo распознавать интент-намерение в самой картинке через Vision
  // ...
  visionResult.labelAnnotations.forEach((annotation) => {
    tags.push(annotation.description);
  });
  const document = {
    '@context': {
      schema: 'http://schema.org/',
    },
    '@type': 'Action',
    'agent': {
      '@type': 'Person',
      'name': package_.name,
    },
    'object': {
      '@type': 'CreativeWork',
      'name': 'photo',
      'abstract': encodeURIComponent(imageBuffer).toString('base64'),
      'encodingFormat': mime,
    },
  };
  const jsonldMessage = await rpc({
    body: {
      jsonrpc: '2.0',
      method: 'ping',
      id: 1,
      params: document,
    },
    jwt,
    auth,
  });
  return jsonldMessage;
};
