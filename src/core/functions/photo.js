const rpc = require('../lib/rpc');
const AbstractPhoto = require('../../models/abstract/abstract-photo');
/**
 * @param {object} requestObject - object
 * @param {string} requestObject.caption - photo caption text
 * @param {Buffer} requestObject.fileBuffer - file buffer
 * @returns {Promise<*>}
 */
module.exports = async function(requestObject) {
  const { imageBuffer, caption, auth, jwt } = requestObject;
  const abstractPhoto = new AbstractPhoto({
    imageBuffer,
    caption,
  });
  await abstractPhoto.prepare();

  const jsonldMessage = await rpc({
    body: {
      jsonrpc: '2.0',
      method: 'insert',
      id: 1,
      params: abstractPhoto.context,
    },
    jwt,
    auth,
  });
  return jsonldMessage;
};
