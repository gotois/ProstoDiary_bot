const { IS_CI } = require('../../environment');
const Story = require('../../services/story.service');
const format = require('../../services/format.service');
/**
 * @description весь pipe работы с input
 * @param {string} text - text
 * @param {*} date - *
 * @param {*} currentUser - *
 * @param {*} telegram_message_id - *
 * @returns {jsonrpc}
 */
module.exports = async (text, date, currentUser, telegram_message_id) => {
  try {
    const story = new Story({
      text,
      date,
      currentUser,
      telegram_message_id,
    });
    await story.fill();
    if (!IS_CI) {
      await story.save();
    }
    const storyDefinition = story.toJSON();
    const storyResult = JSON.stringify(storyDefinition.context, null, 2);
    // ограничиваем 1000 символами из-за ошибки "ETELEGRAM: 400 Bad Request: message is too long"
    return {
      jsonrpc: '2.0',
      result: storyResult.slice(0, 1000) + format.previousInput(text),
    };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      error: {
        message: error.toString(),
      },
    };
  }
};
