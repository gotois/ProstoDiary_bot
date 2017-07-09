const dbEntries = require('../database/bot.database');
const sessions = require('../services/sessions');
const crypt = require('../services/crypt');
const bot = require('./../config/bot.config');
const spentMoney = require('./../services/spent_money');
/***
 * @example /count зп -> выведет всю полученную зарплату
 * @example /count RegExp -> выведет потраченного по RegExp
 * @example /count - -> выведет сколько всего потрачено
 * @example /count + -> выведет сколько всего получено
 *
 * Очистить базу данных с подтверждением
 * @param msg {Object}
 * @param msg.chat {Object}
 * @param msg.from {Object}
 * @param match {Array}
 * @return {void}
 */
function onCount({chat, from}, match) {
  const chatId = chat.id;
  const fromId = from.id;
  const currentUser = sessions.getSession(fromId);

  dbEntries.getAll(currentUser.id).then(({rows}) => {
    if (rows.length <= 0) {
      throw 'Null rows exception';
    }
    const entryRows = rows.map(row => crypt.decode(row.entry));

    switch (match[2].toUpperCase()) {
      case 'ЗП': {
        const allSpentMoney = spentMoney(entryRows, 'RUB');
        bot.sendMessage(chatId, `Потрачено ${allSpentMoney}`);

        break;
      }
      case '-': {
        // TODO: выведет сколько всего потрачено
        break;
      }
      case '+': {
        // TODO: выведет сколько всего получено
        break;
      }
      default: {
        bot.sendMessage(chatId, 'Проверьте правильность запроса. \nНапример: "count ЗП"');
        break;
      }
    }
  });
}

module.exports = onCount;
