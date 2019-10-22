const jsonrpc = require('jsonrpc-lite');

module.exports = async (t) => {
  t.timeout(15000);
  // FIXME: не работает с гугл сервисами - https://github.com/jehy/telegram-test-api/issues/21
  // const { client } = t.context;
  // let message = client.makeMessage('Hello good@gmail.com my friend +79881112341 Alena https://google.com');
  // await client.sendMessage(message);
  // let updates = await client.getUpdates();
  // t.log(updates.result)
  // END

  const APIPost = require('../../src/api/v2/post');
  {
    const requestObject = jsonrpc.request('123', 'text', {
      buffer: Buffer.from('поел салат с сыром'),
      mime: 'plain/text',
      creator: 'xxxg@xxx.xyz',
      publisher: 'yyy@xxx.xyz',
      telegram_message_id: 1234567890,
    });
    const result = await APIPost(requestObject);
    t.log(result);
  }
  {
    const script = `INSERT INTO jsonld (telegram, id, name, email, image, url, sameAs) VALUES (1234567, 'http://xxx', 'test user', 'test@test.test', 'http://test.test/test.png', array${JSON.stringify(
      ['http://test.test/test'],
    ).replace(
      /"/g,
      '\'', // eslint-disable-line
    )}) ;`;
    const requestObject = jsonrpc.request('123', 'script', {
      buffer: Buffer.from(script),
      mime: 'application/sql',
      creator: 'test@test.test',
      publisher: 'test@gotointeractive.com',
    });
    const result = await APIPost(requestObject);
    t.is(result.error, undefined);
  }
};
