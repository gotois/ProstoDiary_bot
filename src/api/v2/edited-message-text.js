const format = require('../../services/format.service');
const Story = require('../../services/story.service');
/**
 * @param {string} text - text
 * @param {Date} date - date
 * @param {number} message_id - message_id
 * @param {number} telegram_user_id - telegram_user_id
 * @returns {jsonrpc}
 */
module.exports = async (text, date, message_id, telegram_user_id) => {
  const story = new Story({
    source: Buffer.from(text),
    date,
    telegram_user_id: telegram_user_id,
    telegram_message_id: message_id,
  });
  try {
    await story.fill();
    await story.update();
    return {
      jsonrpc: '2.0',
      result: '_Запись обновлена_\n' + format.previousInput(text),
    };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      error: {
        message: error.message.toString(),
      },
    };
  }
};
