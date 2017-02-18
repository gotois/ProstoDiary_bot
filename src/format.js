const crypt = require('./crypt');
/**
 *
 * @param text {Number|String}
 * @returns {string}
 */
function convertIn2DigitFormat(text) {
  return ('0' + text).slice(-2);
}
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
}

module.exports = {
  formatRows
};
