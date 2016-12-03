const crypt = require('./crypt');

function formatRows(entries) {
  let out = '';
  let currentDateStr = '';
  entries.forEach(data => {
    const dataDate = data.date_added;
    const dateStr = `${dataDate.getDate()}.${dataDate.getMonth() + 1}.${dataDate.getFullYear()}`;
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
