module.exports = async (t) => {
  const { client } = t.context;
  let message = client.makeMessage('/version');
  await client.sendMessage(message);
  let updates = await client.getUpdates();
  t.true(updates.ok);
  const { version } = require('../../package');
  t.true(updates.result[0].message.text.startsWith(version));
  t.true(updates.result[0].message.text.length > 32);
};
