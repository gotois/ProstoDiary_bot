module.exports = async (t) => {
  const { client } = t.context;
  let message = client.makeCommand('/version');
  await client.sendCommand(message);
  let updates = await client.getUpdates();
  t.true(updates.ok);
  const { version } = require('../../package');
  t.true(updates.result[0].message.text.startsWith(version));
  t.true(updates.result[0].message.text.length > 32);
};
