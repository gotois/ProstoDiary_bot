module.exports = async (t) => {
  t.timeout(15000);
  const { client } = require('../../src/core/jsonrpc');

  // FIXME: не работает с гугл сервисами - https://github.com/jehy/telegram-test-api/issues/21
  // const { client } = t.context;
  // let message = client.makeMessage('Hello good@gmail.com my friend +79881112341 Alena https://google.com');
  // await client.sendMessage(message);
  // let updates = await client.getUpdates();
  // t.log(updates.result)
  // END

  {
    // fixme переделать на jsonrpc.rpcRequest
    const { error, result } = await client.request('post', {
      text: 'поел салат с сыром',
      mime: 'plain/text',
      creator: 'denis@baskovsky.ru',
      date: Math.round(new Date().getTime() / 1000),
      publisher: 'test@gotointeractive.com',
      telegram_message_id: 1234567890,
    });
    t.is(error, undefined);
    t.log(result);
    return;
  }
};
