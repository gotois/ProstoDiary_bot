module.exports.notifyDice = async (bot, message) => {
  const diceMessage = await bot.sendDice(message.chat.id, {
    emoji: '🎰',
  });
  const {
    dice: { value },
  } = diceMessage;

  setTimeout(async () => {
    await bot.sendMessage(message.chat.id, 'Напоминаю.', {
      message_id: message.message_id,
    });
  }, value * 1000);
};

module.exports.notifyNextHour = (bot, message) => {
  setTimeout(async () => {
    await bot.sendMessage(message.chat.id, 'Напоминаю.', {
      message_id: message.message_id,
    });
  }, 60_000);
};

module.exports.notifyNextDay = (bot, message) => {
  setTimeout(async () => {
    await bot.sendMessage(message.chat.id, 'Напоминаю.', {
      message_id: message.message_id,
    });
  }, 1000); // fixme - напоминать рано утром
};
