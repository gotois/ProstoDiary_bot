const rpc = require('../lib/rpc');
const AbstractText = require('../../models/abstract/abstract-text');
/**
 * @param {string} text - user text
 * @returns {Promise<Array<jsonld>>}
 */
module.exports = async ({
  // hashtags, // todo поддержать
  // chat_id, // todo поддержать
  tgMessageId,
  text,
  auth,
  creator,
  publisher,
  jwt,
}) => {
  const abstractText = new AbstractText({
    tgMessageId,
    text,
    auth,
    creator,
    publisher,
  });
  await abstractText.prepare();
  const jsonldMessage = await rpc({
    body: {
      jsonrpc: '2.0',
      method: 'insert',
      id: 1,
      params: abstractText.context,
    },
    jwt,
    auth,
  });
  return jsonldMessage;
};
