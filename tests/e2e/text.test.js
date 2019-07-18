module.exports = async (t) => {
  t.timeout(10000);
  // FIXME: не работает с гугл сервисами - https://github.com/jehy/telegram-test-api/issues/21
  // const { client } = t.context;
  // let message = client.makeMessage('Hello good@gmail.com my friend +79881112341 Alena https://google.com');
  // await client.sendMessage(message);
  // let updates = await client.getUpdates();
  // t.log(updates.result)
  // END

  const { inputProcess } = require('../../src/services/input.service');
  const resultStoryRus = await inputProcess('поел салат с сыром');
  const resultStoryRusDefinition = await resultStoryRus.definition();
  t.log(resultStoryRusDefinition);
};
