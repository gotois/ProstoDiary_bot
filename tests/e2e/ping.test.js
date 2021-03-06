module.exports = async (t) => {
  const { client } = t.context;
  const message = client.makeMessage('/ping');
  await client.sendMessage(message);
  const updates = await client.getUpdates();
  t.true(updates.ok);
  t.is(updates.result[0].message.text, 'pong');
};
