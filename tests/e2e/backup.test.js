module.exports = async (t) => {
  t.timeout(2000);
  const { client } = t.context;
  let message = client.makeCommand('/backup');
  await client.sendCommand(message);
  let updates = await client.getUpdates();
  // t.true(updates.ok);
  // t.true(updates.result[0].message.text.length > 0);
};
