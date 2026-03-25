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
  }, value * 1_000);
};

module.exports.notifyNextHour = async (bot, message) => {
  setTimeout(async () => {
    await bot.sendMessage(message.chat.id, 'Напоминаю.', {
      message_id: message.message_id,
    });
  }, 60_000);
};

module.exports.notifyNextDay = async (bot, message) => {
  setTimeout(async () => {
    await bot.sendMessage(message.chat.id, 'Напоминаю.', {
      message_id: message.message_id,
    });
  }, 1_000); // fixme - напоминать рано утром
};
