const AbstractVoice = require('../models/abstracts/abstract-voice');

module.exports = async function (requestObject) {
  const abstractVoice = new AbstractVoice({
    ...requestObject,
  });
  await abstractVoice.prepare();
  return abstractVoice;
};
