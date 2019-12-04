const logger = require('../../services/logger.service');
const format = require('../../services/text.service');
const UserStory = require('../../models/story/user-story');
/**
 * может не работать если абстракт уже натурализован
 *
 * @description edit
 * @param {object} requestObject - requestObject
 * @returns {Promise<string>}
 */
module.exports = async (requestObject) => {
  const { text, date, message_id, telegram_user_id } = requestObject;
  //fixme манипулировать Абстрактом, а не UserStory
  logger.log('warn', '!!!!!!!!!!');
  const story = new UserStory({
    source: Buffer.from(text),
    date,
    telegram_user_id: telegram_user_id,
    telegram_message_id: message_id,
  });
  await story.fill();
  await story.update();
  return '_Запись обновлена_\n' + format.previousInput(text);
};
