const { IS_PRODUCTION } = require('../../env');
const { inputProcess } = require('../../services/input.service');
const crypt = require('../../services/crypt.service');
const format = require('../../services/format.service');
const dbEntries = require('../../database/entities.database');

module.exports = async (text, message_id, date, currentUser) => {
  const originalText = text.trim();
  const story = await inputProcess(originalText);
  const storyDefinition = await story.definition();
  // todo: https://github.com/gotois/ProstoDiary_bot/issues/98
  const storyResult = JSON.stringify(storyDefinition, null, 2);
  // todo: в БД записывать originalText
  // await story.save();
  if (IS_PRODUCTION) {
    // todo: перенести этот вызов в story.save
    await dbEntries.post(
      currentUser.id,
      crypt.encode(text),
      message_id,
      new Date(date * 1000),
    );
  }
  // ограничиваем 1000 символами из-за ошибки "ETELEGRAM: 400 Bad Request: message is too long"
  return storyResult.slice(0, 1000) + format.previousInput(text);
};
