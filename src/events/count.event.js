const dbEntries = require('../database/bot.database');
const sessions = require('../services/session.service');
const bot = require('./../config/bot.config');
const {getMoney, TYPES} = require('../services/calc.service');
const {decodeRows} = require('./../services/format.service');
/**
 * @param startTime {String}
 * @param endTime {String}
 * @param money {String}
 * @return {string}
 */
const formatResponse = ({startTime, endTime, money}) => {
  return `С ${startTime} по ${endTime}:\n*${money}*`;
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
  const getAllSpentMoney = () => getMoney({
    texts: entries,
    type: TYPES.allSpent,
    local,
  });
  const getReceivedMoney = () => getMoney({
    texts: entries,
    type: TYPES.allReceived,
    local,
  });
  const getResult = async (data, params) => {
    switch (data) {
      case '-': {
        const money = getAllSpentMoney();
        await bot.sendMessage(chatId, '_Всего потрачено_:\n' + formatResponse({startTime, endTime, money}), params);
        return;
      }
      case '+': {
        const money = getReceivedMoney();
        await bot.sendMessage(chatId, '_Всего получено_:\n' + formatResponse({startTime, endTime, money}), params);
        return;
      }
      default: {
        await bot.sendMessage(chatId, 'Проверьте правильность запроса. \nНапример: "/count -"');
        return;
      }
    }
  };
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
  if (match[1]) {
    await getResult(match[1].toUpperCase(), params);
  } else {
    const replyParams = Object.assign({}, params, {
      'reply_markup': {
        inline_keyboard: [
          [
            { 'text': 'Всего потрачено', 'callback_data': '-' },
            { 'text': 'Всего получено', 'callback_data': '+' }
          ]
        ]
      }
    });
    await bot.sendMessage(chatId, 'Финансы', replyParams);
    // TODO: возможна утечка, если не уничтожать слушатель
    bot.once('callback_query', async ({data}) => {
      await getResult(data, params);
    });
  }
};

module.exports = onCount;
