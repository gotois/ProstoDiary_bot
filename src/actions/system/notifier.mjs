export const notifyDice = async (bot, message) => {
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

export const notifyNextHour = (bot, message) => {
  setTimeout(async () => {
    await bot.sendMessage(message.chat.id, 'Напоминаю.', {
      message_id: message.message_id,
    });
  }, 60_000);
};

export const notifyNextDay = (bot, message) => {
  setTimeout(async () => {
    await bot.sendMessage(message.chat.id, 'Напоминаю.', {
      message_id: message.message_id,
    });
  }, 1000); // fixme - напоминать рано утром
};
