const dbEntries = require('../../database/entities.database');
const {
  getMoney,
  getFormatMoney,
  TYPES,
} = require('../../services/calc.service');
const { decodeRows } = require('../../services/format.service');
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

module.exports = async (data, params, currentUser) => {
  const rows = await dbEntries.getAll(currentUser.id);
  const objectRows = decodeRows(rows);
  if (objectRows.length === 0) {
    throw new Error('No data');
  }
  const entries = objectRows.map((row) => {
    return row.entry;
  });
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
  const startTime = objectRows[0].date.toLocaleDateString();
  const endTime = objectRows[objectRows.length - 1].date.toLocaleDateString();

  switch (data) {
    case '-': {
      const money = getAllSpentMoney();
      return (
        '_Всего потрачено_:\n' + formatResponse({ startTime, endTime, money })
      );
    }
    case '+': {
      const money = getReceivedMoney();
      return (
        '_Всего получено_:\n' + formatResponse({ startTime, endTime, money })
      );
    }
    default: {
      throw new Error('Проверьте правильность запроса. \nНапример: "/count -"');
    }
  }
};
