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
  // TODO reduce
  entries.forEach(data => {
    const dataDate = data.date_added;
    const DD = convertIn2DigitFormat(dataDate.getDate());
    const MM = convertIn2DigitFormat(dataDate.getMonth() + 1);
    const YYYY = dataDate.getFullYear();
    const dateStr = `${DD}.${MM}.${YYYY}`;
    if (dateStr !== currentDateStr) {
      out += '\n' + dateStr + '\n';
    }
    currentDateStr = dateStr;
    const decodeEntry = crypt.decode(data.entry);
    if (decodeEntry) {
      out += decodeEntry + '\n';
    }
    return out;
  });

  return out.trim();
};
/***
 * Message updated text
 * @param input {String}
 * @returns {string}
 */
const prevInput = input => (`✓${input.replace(/\n/g, ' ').substring(0, 6)}…`);

module.exports = {
  formatRows,
  prevInput,
};
