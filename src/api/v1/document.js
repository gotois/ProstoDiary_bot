const {
  uploadAppleHealthData,
} = require('../../services/apple-health.service');
const { getTelegramFile } = require('../../services/telegram-file.service');
const { unpack } = require('../../services/archive.service');
/**
 * @param {object} document - document
 * @returns {jsonrpc}
 */
module.exports = async (document) => {
  try {
    if (!['application/zip', 'multipart/x-zip'].includes(document.mime_type)) {
      throw new TypeError('unknown mime format');
    }
    const fileBuffer = await getTelegramFile(document.file_id);
    const zipContents = await unpack(fileBuffer);
    for await (const [fileName, buffer] of zipContents) {
      if (fileName === 'apple_health_export/export.xml') {
        const healthObject = await uploadAppleHealthData(buffer);
        return {
          jsonrpc: '2.0',
          result:
            'export apple health from ' +
            healthObject.HealthData.ExportDate.value,
        };
      }
    }
    return {
      jsonrpc: '2.0',
      result: 'test: document upload done',
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
