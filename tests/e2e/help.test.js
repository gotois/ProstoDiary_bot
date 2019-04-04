module.exports = async (t) => {
  const { client } = t.context;
  let message = client.makeMessage('/help');
  await client.sendMessage(message);
  let updates = await client.getUpdates();
  t.true(updates.ok);
  // message = client.makeMessage(keyboard[0][0].text);
};
