const { IS_PRODUCTION } = require('../../environment');
const Story = require('../../services/story.service');
const format = require('../../services/format.service');
/**
 * @description весь pipe работы с input
 * @param {string} text - text
 * @param {*} message_id - *
 * @param {*} date - *
 * @param {*} currentUser - *
 * @returns {Promise<string>}
 */
module.exports = async (text, message_id, date, currentUser) => {
  const story = new Story(text);
  await story.fill();
  const storyDefinition = story.toJSON();
  const storyResult = JSON.stringify(storyDefinition, null, 2);
  if (IS_PRODUCTION) {
    await story.save(currentUser, message_id, date);
  }
  // ограничиваем 1000 символами из-за ошибки "ETELEGRAM: 400 Bad Request: message is too long"
  return storyResult.slice(0, 1000) + format.previousInput(text);
};
