module.exports = async (t) => {
  const { client } = t.context;
  let message = client.makeCommand('/help');
  await client.sendCommand(message);
  let updates = await client.getUpdates();
  t.true(updates.ok);
  t.true(updates.result[0].message.text.length > 0);
};
