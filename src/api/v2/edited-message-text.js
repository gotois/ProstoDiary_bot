const jsonrpc = require('jsonrpc-lite');
const logger = require('../../services/logger.service');
const format = require('../../services/format.service');
const UserStory = require('../../models/story/user-story');
/**
 * @param {RequestObject} requestObject - requestObject
 * @returns {JsonRpc|JsonRpcError}
 */
module.exports = async (requestObject) => {
  const { text, date, message_id, telegram_user_id } = requestObject.params;
  //fixme манипулировать Абстрактом, а не UserStory
  logger.log('warn', '!!!!!!!!!!');
  const story = new UserStory({
    source: Buffer.from(text),
    date,
    telegram_user_id: telegram_user_id,
    telegram_message_id: message_id,
  });
  try {
    await story.fill();
    await story.update();
    return jsonrpc.success(
      requestObject.id,
      '_Запись обновлена_\n' + format.previousInput(text),
    );
  } catch (error) {
    return jsonrpc.error(requestObject.id, new jsonrpc.JsonRpcError(error, 99));
  }
};
