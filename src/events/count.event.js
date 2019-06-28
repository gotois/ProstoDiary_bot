const bot = require('../bot');
const dbEntries = require('../database/entities.database');
const sessions = require('../services/session.service');
const { getMoney, getFormatMoney, TYPES } = require('../services/calc.service');
const { decodeRows } = require('./../services/format.service');
const logger = require('../services/logger.service');
/**
 * @param {object} msg - message
 * @param {string} msg.startTime - start time
 * @param {string} msg.endTime - end time
 * @param {object} msg.money - money
 * @returns {string}
 */
const formatResponse = ({ startTime, endTime, money }) => {
  const formatMoney = getFormatMoney(money);
  return (
    `С ${startTime} по ${endTime}:\n` +
    `*${formatMoney.rub}*\n` +
    `*${formatMoney.eur}*\n` +
    `*${formatMoney.usd}*`
  );
};
/**
 * /count - -> выведет сколько всего потрачено
 * /count + -> выведет сколько всего получено
 *
 * @param {object} msg - message
 * @param {object} msg.chat - chat
 * @param {object} msg.from - from
 * @param {Array} match - mather
 * @returns {undefined}
 */
const onCount = async ({ chat, from }, match) => {
  logger.log('info', onCount.name);
  const chatId = chat.id;
  const fromId = from.id;
  const currentUser = sessions.getSession(fromId);
  const getAllSpentMoney = () => {
    return getMoney({
      texts: entries,
      type: TYPES.allSpent,
    });
  };
  const getReceivedMoney = () => {
    return getMoney({
      texts: entries,
      type: TYPES.allReceived,
    });
  };
  const getResult = async (data, params) => {
    switch (data) {
      case '-': {
        const money = getAllSpentMoney();
        await bot.sendMessage(
          chatId,
          '_Всего потрачено_:\n' +
            formatResponse({ startTime, endTime, money }),
          params,
        );
        return;
      }
      case '+': {
        const money = getReceivedMoney();
        await bot.sendMessage(
          chatId,
          '_Всего получено_:\n' + formatResponse({ startTime, endTime, money }),
          params,
        );
        return;
      }
      default: {
        await bot.sendMessage(
          chatId,
          'Проверьте правильность запроса. \nНапример: "/count -"',
        );
        return;
      }
    }
  };
  const rows = await dbEntries.getAll(currentUser.id);
  const objectRows = decodeRows(rows);
  if (objectRows.length === 0) {
    await bot.sendMessage(chatId, 'No data');
    return;
  }
  const entries = objectRows.map((row) => {
    return row.entry;
  });
  const startTime = objectRows[0].date.toLocaleDateString();
  const endTime = objectRows[objectRows.length - 1].date.toLocaleDateString();
  const params = {
    parse_mode: 'Markdown',
  };
  if (match[1]) {
    await getResult(match[1].toUpperCase(), params);
  } else {
    const replyParams = Object.assign({}, params, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Всего потрачено', callback_data: '-' },
            { text: 'Всего получено', callback_data: '+' },
          ],
        ],
      },
    });
    await bot.sendMessage(chatId, 'Финансы', replyParams);
    // TODO: возможна утечка, если не уничтожать слушатель
    bot.once('callback_query', async ({ data }) => {
      await getResult(data, params);
    });
  }
};

module.exports = onCount;
