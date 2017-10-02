const crypt = require('./crypt.service');
const {convertIn2DigitFormat} = require('./date.service');
/**
 *
 * @param entries {Array}
 * @returns {string}
 */
const formatRows = entries => {
  let out = '';
  let currentDateStr = '';
  entries.map(({date_added, entry}) => {
    const DD = convertIn2DigitFormat(date_added.getDate());
    const MM = convertIn2DigitFormat(date_added.getMonth() + 1);
    const YYYY = date_added.getFullYear();
    return {
      dateStr: `${DD}.${MM}.${YYYY}`,
      decodeEntry: crypt.decode(entry)
    };
  }).forEach(({dateStr, decodeEntry}) => {
    if (dateStr !== currentDateStr) {
      out += `\n${dateStr}\n`;
    }
    currentDateStr = dateStr;
    if (decodeEntry) {
      out += `${decodeEntry}\n`;
    }
  });
  return out.trim();
};
/***
 * Message updated text
 * @param input {String}
 * @returns {string}
 */
const prevInput = input => (`✓${input.replace(/\n/g, ' ').substring(0, 6)}…`);
/**
 * @param rows {Array}
 * @return {Array}
 */
const decodeRows = (rows = []) => {
  return rows.map(({date_added, entry}) => ({
    date: date_added,
    entry: crypt.decode(entry),
  }));
};

module.exports = {
  formatRows,
  prevInput,
  decodeRows,
};
