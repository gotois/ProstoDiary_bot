const request = require('supertest');

module.exports = async (t) => {
  t.timeout(15000);

  // const textAction = require('../../src/core/functions/text');
  const result = await textAction({
    text: 'поел салат с сыром',
    creator: 'ci@gotointeractive.com',
    publisher: 'test@gotointeractive.com',
    telegram: {
      title: 'test',
      chatId: 42,
      messageId: 1234567890,
    },
  });
  const response = await request(t.context.app)
    .post('/api')
    .send({
      method: 'POST',
      url: '/api',
      headers: {
        'User-Agent': 'Ava Supertest',
        'Content-Type': 'application/json',
        'Accept': 'application/schema+json',
      },
      body: {
        jsonrpc: '2.0',
        method: 'insert',
        id: 1,
        params: result.context,
      },
    });
  t.is(response.status, 200);
  t.log(result);
};
