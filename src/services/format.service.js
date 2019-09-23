const crypt = require('./crypt.service');
const { convertIn2DigitFormat } = require('./date.service');
/**
 * @param {Array} rows - entries
 * @returns {string}
 */
const formatRows = (rows) => {
  let currentDateString = '';
  return rows
    .reduce((accumulator, { date, text }) => {
      const DD = convertIn2DigitFormat(date.getDate());
      const MM = convertIn2DigitFormat(date.getMonth() + 1);
      const YYYY = date.getFullYear();
      const dateString = `${DD}.${MM}.${YYYY}`;
      const decodeEntry = crypt.decode(text);
      if (dateString !== currentDateString) {
        accumulator += `\n${dateString}\n`;
      }
      currentDateString = dateString;
      if (decodeEntry) {
        accumulator += `${decodeEntry}\n`;
      }
      return accumulator;
    }, '')
    .trim();
};
/**
 * Message updated text
 *
 * @param {string} input - user input text
 * @returns {string}
 */
const formatterText = (input) => {
  return `${input.replace(/\n/g, ' ').substring(0, 6)}…`;
};
/**
 * @param {Array} rows - array rows
 * @returns {Array}
 */
const decodeRows = (rows = []) => {
  return rows.map(({ date_added, entry }) => {
    return {
      date: date_added,
      entry: crypt.decode(entry),
    };
  });
};

module.exports = {
  formatRows,
  previousInput: formatterText,
  decodeRows,
};
