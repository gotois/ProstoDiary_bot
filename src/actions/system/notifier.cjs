module.exports.notifyDice = async (bot, message) => {
  const diceMessage = await bot.sendDice(message.chat.id, {
    emoji: '🎰',
  });
  const { dice: { value } } = diceMessage;
  await bot.sendMessage(message.chat.id, "Напомню через: " + value + 'мин.', {
    message_id: message.message_id,
  });
}

module.exports.notifyNextHour = async (bot, message) => {
  await bot.sendMessage(message.chat.id, 'Напомню через: 60 мин.', {
    message_id: message.message_id,
  });
}

module.exports.notifyNextDay = async (bot, message) => {
  await bot.sendMessage(message.chat.id, 'Напомню завтра', {
    message_id: message.message_id,
  });
}
