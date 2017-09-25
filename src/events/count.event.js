const dbEntries = require('../database/bot.database');
const sessions = require('../services/session.service');
const crypt = require('../services/crypt.service');
const bot = require('./../config/bot.config');
const {getMoney, TYPES} = require('../services/calc.service');
/***
 * TODO: @example /count RegExp -> выведет потраченного по RegExp
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

  if (rows.length <= 0) {
    throw 'Null rows exception';
  }
  const entryRows = rows.map(({entry}) => crypt.decode(entry));
  // TODO: на будущее дать выбор формату финансов (рубли, евро, доллары)
  const local = 'RUB';

  switch (match[2].toUpperCase()) {
    case '-': {
      const allSpentMoney = getMoney({
        texts: entryRows,
        type: TYPES.allSpent,
        local,
      });
      bot.sendMessage(chatId, `Всего потрачено: ${allSpentMoney}`);

      break;
    }
    case '+': {
      const allSpentMoney = getMoney({
        texts: entryRows,
        type: TYPES.allReceived,
        local,
      });
      bot.sendMessage(chatId, `Всего получено: ${allSpentMoney}`);

      break;
    }
    default: {
      bot.sendMessage(chatId, 'Проверьте правильность запроса. \nНапример: "/count -"');
      break;
    }
  }
};

module.exports = onCount;
