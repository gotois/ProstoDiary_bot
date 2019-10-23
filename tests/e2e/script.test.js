const jsonrpc = require('jsonrpc-lite');

module.exports = async (t) => {
  t.timeout(10000);
  const APIPost = require('../../src/api/v2/post');

  const requestObject = jsonrpc.request('123', 'script', {
    buffer: Buffer.from(`INSERT INTO user_story (salt) VALUES (${'123'})`),
    mime: 'application/sql',
  });
  const result = await APIPost(requestObject);
  t.log(result);
};
