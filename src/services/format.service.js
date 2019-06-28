const crypt = require('./crypt.service');
const { convertIn2DigitFormat } = require('./date.service');
/**
 *
 * @param {Array} entries - entries
 * @returns {string}
 */
const formatRows = (entries) => {
  let out = '';
  let currentDateString = '';
  entries
    .map(({ date_added, entry }) => {
      const DD = convertIn2DigitFormat(date_added.getDate());
      const MM = convertIn2DigitFormat(date_added.getMonth() + 1);
      const YYYY = date_added.getFullYear();
      return {
        dateString: `${DD}.${MM}.${YYYY}`,
        decodeEntry: crypt.decode(entry),
      };
    })
    .forEach(({ dateString, decodeEntry }) => {
      if (dateString !== currentDateString) {
        out += `\n${dateString}\n`;
      }
      currentDateString = dateString;
      if (decodeEntry) {
        out += `${decodeEntry}\n`;
      }
    });
  return out.trim();
};
/**
 * Message updated text
 *
 * @param {string} input - user input text
 * @returns {string}
 */
const previousInput = (input) => {
  return `✓${input.replace(/\n/g, ' ').substring(0, 6)}…`;
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
  previousInput,
  decodeRows,
};
