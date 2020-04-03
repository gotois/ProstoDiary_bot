const AbstractPhoto = require('../models/abstracts/abstract-photo');
/**
 * @param {object} requestObject - object
 * @param {string} requestObject.caption - photo caption text
 * @param {Buffer} requestObject.fileBuffer - file buffer
 * @returns {Promise<AbstractPhoto>}
 */
module.exports = async function (requestObject) {
  const abstractPhoto = new AbstractPhoto({
    ...requestObject,
  });
  await abstractPhoto.prepare();
  return abstractPhoto;
};
