module.exports = async (t) => {
  const { client } = t.context;
  const message = client.makeMessage('/version');
  await client.sendMessage(message);
  const updates = await client.getUpdates();
  t.true(updates.ok);
  const { version } = require('../../package');
  t.true(updates.result[0].message.text.startsWith(version));
  t.true(updates.result[0].message.text.length > 32);
};
