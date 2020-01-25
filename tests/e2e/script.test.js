// @deprecated
module.exports = async (t) => {
  t.timeout(10000);
  const { client } = require('../../src/core/jsonrpc');

  {
    // fixme переделать на jsonrpc.rpcRequest
    const { result } = await client.request('post', {
      // eslint-disable-next-line sql/no-unsafe-query
      buffer: Buffer.from(`INSERT INTO user_story (salt) VALUES (${'123'})`),
      mime: 'application/sql',
    });
    t.log(result);
  }
  {
    const script = `INSERT INTO jsonld (telegram, id, name, email, image, url, same_as) VALUES (1234567, 'http://xxx', 'test user', 'test@test.test', 'http://test.test/test.png', array${JSON.stringify(
      ['http://test.test/test'],
    ).replace(
      /"/g,
      '\'', // eslint-disable-line
    )}) ;`;
    const { result } = await client.request('post', {
      buffer: Buffer.from(script),
      mime: 'application/sql',
      creator: 'no-reply@gotointeractive.com',
      publisher: 'test@gotointeractive.com',
    });
    t.is(result.error, undefined);
  }
};
