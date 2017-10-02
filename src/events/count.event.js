const dbEntries = require('../database/bot.database');
const sessions = require('../services/session.service');
const bot = require('./../config/bot.config');
const {getMoney, TYPES} = require('../services/calc.service');
const {decodeRows} = require('./../services/format.service');
/**
 * @param startTime
 * @param endTime
 * @param allSpentMoney
 * @return {string}
 */
const formatResponse = ({startTime, endTime, allSpentMoney}) => {
  return `С ${startTime} по ${endTime}:\n*${allSpentMoney}*`;
};
/***
 * @example /count - -> выведет сколько всего потрачено
 * @example /count + -> выведет сколько всего получено
 *
 * @param msg {Object}
 * @param msg.chat {Object}
 * @param msg.from {Object}
 * @param match {Array}
 * @return {void}
 */
const onCount = async ({chat, from}, match) => {
  const chatId = chat.id;
  const fromId = from.id;
  const currentUser = sessions.getSession(fromId);
  const {rows} = await dbEntries.getAll(currentUser.id);
  const objRows = decodeRows(rows);
  if (!objRows.length) {
    await bot.sendMessage(chatId, 'No data');
    return;
  }
  // TODO: на будущее дать выбор формату финансов (рубли, евро, доллары)
  const local = 'RUB';
  const entries = objRows.map(row => row.entry);
  const startTime = objRows[0].date.toLocaleDateString();
  const endTime = objRows[objRows.length - 1].date.toLocaleDateString();
  const params = {
    'parse_mode': 'Markdown',
  };
  switch (match[2].toUpperCase()) {
    case '-': {
      const allSpentMoney = getMoney({
        texts: entries,
        type: TYPES.allSpent,
        local,
      });
      await bot.sendMessage(chatId, '_Всего потрачено_:\n' + formatResponse({startTime, endTime, allSpentMoney}), params);
      return;
    }
    case '+': {
      const allSpentMoney = getMoney({
        texts: entries,
        type: TYPES.allReceived,
        local,
      });
      await bot.sendMessage(chatId, '_Всего получено_:\n' + formatResponse({startTime, endTime, allSpentMoney}), params);
      return;
    }
    default: {
      await bot.sendMessage(chatId, 'Проверьте правильность запроса. \nНапример: "/count -"');
      return;
    }
  }
};

module.exports = onCount;
