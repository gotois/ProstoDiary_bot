const sessions = require('../services/session.service');
const bot = require('../bot');
const datetime = require('../services/date.service');
const dbEntries = require('../database');
const crypt = require('../services/crypt.service');
const commands = require('../commands');
const format = require('../services/format.service');
const logger = require('../services/logger.service');
/**
 * /set 2016-12-29 something text
 *
 * @param {Object} msg - message
 * @param {Object} msg.chat - chat
 * @param {string} msg.text - text
 * @param {Object} msg.from - from
 * @param {number} msg.message_id - id message
 * @param {Array} match - match
 * @returns {undefined}
 */
const setDataFromDate = async ({ chat, text, from, message_id }, match) => {
  logger.log('info', setDataFromDate.name);
  const chatId = chat.id;
  const input = text.replace(commands.SETDATE, '').trim();
  let date;
  try {
    date = datetime.convertToNormalDate(match[1]);
    if (!datetime.isNormalDate(date)) {
      throw new Error('Wrong date');
    }
  } catch (e) {
    logger.log('error', e.message);
    await bot.sendMessage(chatId, e.message);
    return;
  }
  const currentUser = sessions.getSession(from.id);
  try {
    await dbEntries.post(
      currentUser.id,
      crypt.encode(input),
      message_id,
      new Date(),
      date,
    );
    const prevInput = format.prevInput(input);
    await bot.sendMessage(chatId, prevInput);
  } catch (error) {
    logger.log('error', error);
    await bot.sendMessage(chatId, 'Произошла ошибка');
  }
};

module.exports = setDataFromDate;
