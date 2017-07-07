const dbEntries = require('./../database/database.entries.js');
const sessions = require('./../sessions');
const crypt = require('./../crypt');
const bot = require('./../config/bot.config.js');
const spentMoney = require('./../services/spent_money');
/***
 * TODO: https://github.com/tewst/ProstoDiary_bot/issues/15
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

  dbEntries.getAll(currentUser.id).then(data => {

    if (data.rows.length <= 0) {
      throw 'Null rows exception';
    }
    const entryRows = data.rows.map(row => {
      const entry = crypt.decode(row.entry);
      return entry;
    });

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
        bot.sendMessage(chatId, 'Проверьте правильность запроса. \n Например \count ЗП');
        break;
      }
    }
  });
}

module.exports = onCount;
