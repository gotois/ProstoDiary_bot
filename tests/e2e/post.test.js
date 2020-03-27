module.exports = async (t) => {
  t.timeout(15000);

  const textAction = require('../../src/core/functions/text');
  const result = await textAction({
    text: 'поел салат с сыром',
    mime: 'plain/text',
    creator: 'denis@baskovsky.ru',
    date: Math.round(new Date().getTime() / 1000),
    publisher: 'test@gotointeractive.com',
    telegram_message_id: 1234567890,
  });
  const res = await request(t.context.app)
    .post('/api')
    .send({
      method: 'POST',
      url: '/api',
      headers: {
        'User-Agent': `Ava Supertest`,
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
  t.is(res.status, 200);
  if (validator.isJSON(res.body.result)) {
    t.fail('Invalid JSON-LD body');
  }
  t.is(error, undefined);
  t.log(result);
};
