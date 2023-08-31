/**
 * 'Some' => 'Some…'
 * '123456789' => '123456…'
 *
 * @description Message updated text
 * @param {string} input - user input text
 * @returns {string}
 */
const previousInput = (input) => {
  return `${input.replace(/\n/g, ' ').slice(0, 6)}…`;
};

module.exports = async (bot, message) => {
  if (message.text.startsWith("/")) {
    await bot.sendMessage(message.chat.id, "Редактирование этой записи невозможно");
  }
  // ...
  await bot.sendMessage(message.chat.id, `Запись ${previousInput(message.text)} обновлена`);
};
