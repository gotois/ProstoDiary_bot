const AbstractVoice = require('../models/abstract/abstract-voice');
/**
 * @param {object} requestObject - parameters
 * @returns {Promise<jsonldAction>}
 */
module.exports = async function (requestObject) {
  const abstractVoice = new AbstractVoice({
    ...requestObject,
  });
  await abstractVoice.prepare();
  return abstractVoice.context;
};
