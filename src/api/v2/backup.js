const jsonrpc = require('jsonrpc-lite');
const dbEntries = require('../../database/entities.database');
const { pack } = require('../../services/archive.service');
const format = require('../../services/format.service');
/**
 * @todo должен в том числе содержать StoryJSON в полном объеме и храниться в отдельном файле: story.json
 * @param {RequestObject} requestObject - requestObject
 * @returns {JsonRpc|JsonRpcError}
 */
module.exports = async (requestObject) => {
  const filename = `ProstoDiary_backup_${requestObject.params.date}.txt`;
  try {
    const rows = await dbEntries.getAll(requestObject.params.userId);
    if (rows.length === 0) {
      throw new Error('Backup data is empty');
    }
    const formatData = format.formatRows(rows);
    const fileBuffer = await pack(formatData, filename);
    return jsonrpc.success(requestObject.id, {
      filename,
      fileBuffer,
    });
  } catch (error) {
    return jsonrpc.error(requestObject.id, new jsonrpc.JsonRpcError(error, 99));
  }
};
