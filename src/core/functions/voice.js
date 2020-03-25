const AbstractVoice = require('../../models/abstract/abstract-voice');

module.exports = async function(requestObject) {
  const {
    date,
    buffer,
    silent,
    mimeType,
    fileSize,
    duration,
    uid,
  } = requestObject;
  const abstractVoice = new AbstractVoice({
    date,
    buffer,
    silent,
    mimeType,
    fileSize,
    duration,
    uid,
  });
  await abstractVoice.prepare();
  return abstractVoice;
};
