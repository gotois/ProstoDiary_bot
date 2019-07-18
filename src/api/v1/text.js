const { inputProcess } = require('../../services/input.service');
const commands = require('../../commands');
const crypt = require('../../services/crypt.service');
const format = require('../../services/format.service');
const dbEntries = require('../../database/entities.database');
/**
 * @description Проверка тексты на команды
 * @param {string} input - input string
 * @returns {boolean}
 */
const checkUnknownInput = (input) => {
  // Пропускаем зарезервированные команды
  for (const command of Object.keys(commands)) {
    if (input.search(commands[command]) >= 0) {
      return true;
    }
  }
  // TODO: https://github.com/gotois/ProstoDiary_bot/issues/74
  // ...
  return false;
};

module.exports = async (text, message_id, date, currentUser) => {
  if (text.startsWith('/')) {
    throw new TypeError('Unknown command. Enter /help');
  }
  const originalText = text.trim();
  if (checkUnknownInput(originalText)) {
    throw new TypeError('Unknown command. Enter /help');
  }
  const story = await inputProcess(originalText);
  const storyDefinition = await story.definition();
  // todo: https://github.com/gotois/ProstoDiary_bot/issues/98
  const storyResult = JSON.stringify(storyDefinition, null, 2);
  // todo: в БД записывать originalText
  // await story.save();
  // todo: перенести этот вызов в story.save
  await dbEntries.post(
    currentUser.id,
    crypt.encode(text),
    message_id,
    new Date(date * 1000),
  );
  const okText = format.previousInput(text);
  return storyResult + okText;
};
