module.exports = async (bot, message) => {
  await bot.sendMessage(
    message.chat.id,
    'Приветствую! Я ваш виртуальный секретарь.\n' + 'Проанализирую ваши активности и сформирую из них контракты.',
    {
      parse_mode: 'MarkdownV2',
    },
  );
};
