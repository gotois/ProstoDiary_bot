const AbstractPhoto = require('../models/abstracts/abstract-photo');
/**
 * @param {object} requestObject - object
 * @param {string} requestObject.caption - photo caption text
 * @param {Buffer} requestObject.fileBuffer - file buffer
 * @returns {Promise<Abstract>}
 */
module.exports = async function(requestObject) {
  const { imageBuffer, caption } = requestObject;
  const abstractPhoto = new AbstractPhoto({
    imageBuffer,
    caption,
  });
  await abstractPhoto.prepare();
  return abstractPhoto;
};
