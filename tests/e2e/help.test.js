module.exports = async (t) => {
  const { client } = t.context;
  const message = client.makeMessage('/help');
  await client.sendMessage(message);
  const updates = await client.getUpdates();
  t.true(updates.ok);
  t.true(updates.result[0].message.text.length > 0);
};
