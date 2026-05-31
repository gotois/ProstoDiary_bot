export const notifyDice = async (activity, message, bot) => {
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

export const notifyNextHour = (activity, message, bot) => {
  setTimeout(async () => {
    await bot.sendMessage(message.chat.id, 'Напоминаю.', {
      message_id: message.message_id,
    });
  }, 60_000);
};

export const notifyNextDay = (activity, message, bot) => {
  setTimeout(async () => {
    await bot.sendMessage(message.chat.id, 'Напоминаю.', {
      message_id: message.message_id,
    });
  }, 1000); // fixme - напоминать рано утром
};
