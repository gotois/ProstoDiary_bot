const AbstractPhoto = require('../models/abstract/abstract-photo');
const jsonldAction = require('../models/action/base');
/**
 * @param {object} requestObject - object
 * @param {string} requestObject.caption - photo caption text
 * @param {Buffer} requestObject.fileBuffer - file buffer
 * @returns {Promise<jsonldAction>}
 */
module.exports = async function (requestObject) {
  const abstractPhoto = new AbstractPhoto({
    ...requestObject,
  });
  await abstractPhoto.prepare();
  return abstractPhoto.context;
};
