const jsonrpc = require('jsonrpc-lite');

module.exports = async (t) => {
  t.timeout(1000);
  const APIv2 = require('../../src/api/v2');

  const requestObject = jsonrpc.request('123', 'system', {
    buffer: Buffer.from(`INSERT INTO user_story (salt) VALUES (${'123'})`),
    mime: 'application/sql',
  });
  const result = await APIv2.system(requestObject);
  t.log(result);
};
