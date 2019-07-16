const dbEntries = require('../../database/entities.database');
const { pack } = require('../../services/archive.service');
const format = require('../../services/format.service');
/**
 * @param {string} date - date
 * @returns {string}
 */
const generateName = (date) => {
  return `ProstoDiary_backup_${date}`;
};

module.exports = async (currentUser, date) => {
  const filename = generateName(date) + '.txt';
  const rows = await dbEntries.getAll(currentUser.id);
  if (rows.length === 0) {
    throw new Error('No data');
  }
  const formatData = format.formatRows(rows);
  const fileBuffer = await pack(formatData, filename);
  return {
    filename,
    fileBuffer,
  };
};
