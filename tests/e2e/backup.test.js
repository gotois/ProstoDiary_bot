module.exports = async (t) => {
  t.timeout(2000);
  const { client } = t.context;
  const message = client.makeCommand('/backup');
  await client.sendCommand(message);
  const updates = await client.getUpdates();
  t.true(updates.ok);
};
