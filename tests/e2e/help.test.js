module.exports = async (t) => {
  const { client } = t.context;
  let message = client.makeMessage('/help');
  await client.sendMessage(message);
  let updates = await client.getUpdates();
  t.true(updates.ok);
  t.true(updates.result[0].message.text.length > 0);
};
