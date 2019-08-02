const { IS_CI } = require('../../environment');
const Story = require('../../services/story.service');
const format = require('../../services/format.service');
/**
 * @description весь pipe работы с input
 * @param {string} text - text
 * @param {*} date - *
 * @param {*} currentUser - *
 * @param {*} telegram_message_id - *
 * @returns {Promise<string>}
 */
module.exports = async (text, date, currentUser, telegram_message_id) => {
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
  return storyResult.slice(0, 1000) + format.previousInput(text);
};
