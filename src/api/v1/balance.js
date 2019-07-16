/**
 * @param {Array<object>} items - balance items
 * @returns {string}
 */
const formatBalanceText = (items) => {
  const currencyPadLength = 12;
  const valuePadLength = 12;
  const bankPadLength = 20;
  /**
   * @param {object} obj - obj
   * @param {string} obj.currency - currency
   * @param {number} obj.value - value
   * @param {string} obj.bank - bank name
   * @returns {string}
   */
  const getColumnText = ({ currency, value, bank }) => {
    return `\`${currency.padEnd(currencyPadLength)}| ${String(value).padEnd(
      valuePadLength,
    )}| ${bank.padEnd(bankPadLength)}\`\n`;
  };
  const balanceMarkDown =
    `\`${'Currency'.padEnd(currencyPadLength)}| ${'Value'.padEnd(
      valuePadLength,
    )}| ${'Bank'.padEnd(bankPadLength)}\`\n` +
    `\`${''.padEnd(currencyPadLength, '-')}+${''.padEnd(
      valuePadLength + 1,
      '-',
    )}+${''.padEnd(bankPadLength, '-')}\`\n` +
    items
      .map((item) => {
        return getColumnText(item);
      })
      .join('');
  return balanceMarkDown.trim();
};

// todo: данные брать из сервера
module.exports = () => {
  const balanceResult = formatBalanceText([
    { currency: 'BTC', value: 20, bank: 'Blockchain' },
    { currency: 'RUB', value: 2250, bank: 'Альфа-банк' },
    { currency: 'ETH', value: 150, bank: 'undefined' },
    { currency: 'USD', value: 550, bank: 'ГазпромБанк - дебет' },
    { currency: 'EUR', value: 1550, bank: 'Cash' },
    { currency: 'RUB', value: 2500, bank: 'Cash' },
    { currency: 'RUB', value: 10, bank: 'вклад - 5 лет' },
    { currency: 'Акции', value: 100, bank: 'Tesl' },
    { currency: 'Облигации', value: 100, bank: 'Disney' },
    { currency: 'ETF', value: 10, bank: 'BANK' },
    { currency: 'ИСЖ', value: 100, bank: 'BANK' },
  ]);
  return balanceResult;
};
