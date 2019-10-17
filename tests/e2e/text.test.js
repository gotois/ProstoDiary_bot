const jsonrpc = require('jsonrpc-lite');

module.exports = async (t) => {
  t.timeout(10000);
  // FIXME: не работает с гугл сервисами - https://github.com/jehy/telegram-test-api/issues/21
  // const { client } = t.context;
  // let message = client.makeMessage('Hello good@gmail.com my friend +79881112341 Alena https://google.com');
  // await client.sendMessage(message);
  // let updates = await client.getUpdates();
  // t.log(updates.result)
  // END

  const APIv2Text = require('../../src/api/v2/text');
  const requestObject = jsonrpc.request('123', 'text', {
    buffer: Buffer.from('поел салат с сыром'),
    mime: 'plain/text',
    email_message_id: 'xxxg@xxx.sendgrid.net',
  });
  const result = await APIv2Text(requestObject);
  t.log(result);
};
