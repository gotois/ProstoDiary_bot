const crypt = require('./crypt');
const datetime = require('./datetime');
/**
 *
 * @param entries {Array}
 * @returns {string}
 */
function formatRows(entries) {
  let out = '';
  let currentDateStr = '';
  entries.forEach(data => {
    const dataDate = data.date_added;
    const DD = datetime.convertIn2DigitFormat(dataDate.getDate());
    const MM = datetime.convertIn2DigitFormat(dataDate.getMonth() + 1);
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
}
/***
 * Message updated
 * @param input {String}
 * @returns {string}
 */
function prevInput(input) {
  return '✓' + input.replace(/\n/g, ' ').substring(0, 6) + '…';
}

module.exports = {
  formatRows,
  prevInput,
};
