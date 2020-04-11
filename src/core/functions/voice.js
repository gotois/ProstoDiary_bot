const AbstractVoice = require('../models/abstracts/abstract-voice');
/**
 * @param {object} requestObject - parameters
 * @returns {Promise<AbstractVoice>}
 */
module.exports = async function (requestObject) {
  const abstractVoice = new AbstractVoice({
    ...requestObject,
  });
  await abstractVoice.prepare();
  return abstractVoice;
};
