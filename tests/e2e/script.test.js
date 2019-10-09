const jsonrpc = require('jsonrpc-lite');

module.exports = async (t) => {
  t.timeout(1000);
  const APIv2Script = require('../../src/api/v2/script');

  const requestObject = jsonrpc.request('123', 'script', {
    buffer: Buffer.from(`INSERT INTO user_story (salt) VALUES (${'123'})`),
    mime: 'application/sql',
  });
  const result = await APIv2Script(requestObject);
  t.log(result);
};
