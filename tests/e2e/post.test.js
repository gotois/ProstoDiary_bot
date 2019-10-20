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
  const requestObject = jsonrpc.request('123', 'post', {
    buffer: Buffer.from('поел салат с сыром'),
    mime: 'plain/text',
    creator: 'xxxg@xxx.xyz',
    publisher: 'yyy@xxx.xyz',
    telegram_message_id: 1234567890,
  });
  const result = await APIPost(requestObject);
  t.log(result);
};
