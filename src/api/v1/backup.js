const dbEntries = require('../../database/entities.database');
const { pack } = require('../../services/archive.service');
const format = require('../../services/format.service');
/**
 * @todo должен в том числе содержать StoryJSON в полном объеме и храниться в отдельном файле: story.json
 * @returns {jsonrpc}
 */
module.exports = async (currentUser, date) => {
  const filename = `ProstoDiary_backup_${date}.txt`;
  try {
    const rows = await dbEntries.getAll(currentUser.id);
    if (rows.length === 0) {
      throw new Error('Backup data is empty');
    }
    const formatData = format.formatRows(rows);
    const fileBuffer = await pack(formatData, filename);
    return {
      jsonrpc: '2.0',
      result: {
        filename,
        fileBuffer,
      },
    };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      error: {
        message: error.toString(),
      },
    };
  }
};
