const rpc = require('../lib/rpc');
const AbstractVoice = require('../../models/abstract/abstract-voice');

module.exports = async function(requestObject) {
  const {
    buffer,
    mimeType,
    fileSize,
    duration,
    uid,
    auth,
    jwt,
  } = requestObject;
  const abstractVoice = new AbstractVoice({
    buffer,
    mimeType,
    fileSize,
    duration,
    uid,
  });
  await abstractVoice.prepare();
  const jsonldMessage = await rpc({
    body: {
      jsonrpc: '2.0',
      method: 'insert',
      id: 1,
      params: abstractVoice.context,
    },
    jwt,
    auth,
  });
  return jsonldMessage;
};
