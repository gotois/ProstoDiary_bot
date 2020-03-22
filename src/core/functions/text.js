const rpc = require('../lib/rpc');
const AbstractText = require('../../models/abstract/abstract-text');
/**
 * @param {*} object - object
 * @returns {Promise<undefined>}
 */
module.exports = async ({
  // hashtags, // todo поддержать на стороне JSONLD
  telegram,
  silent,
  text,
  auth,
  creator,
  publisher,
  jwt,
}) => {
  const abstractText = new AbstractText({
    silent,
    telegram,
    text,
    auth,
    creator,
    publisher,
  });
  await abstractText.prepare();
  await rpc({
    body: {
      jsonrpc: '2.0',
      method: 'insert',
      id: 1,
      params: abstractText.context,
    },
    jwt,
    auth,
  });
};
