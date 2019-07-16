const {
  uploadAppleHealthData,
} = require('../../services/apple-health.service');
const { getTelegramFile } = require('../../services/telegram-file.service');
const { unpack } = require('../../services/archive.service');

module.exports = async (document) => {
  if (!['application/zip', 'multipart/x-zip'].includes(document.mime_type)) {
    throw new Error('unknown mime format');
  }
  const fileBuffer = await getTelegramFile(document.file_id);
  const zipContents = await unpack(fileBuffer);
  for await (const [fileName, buffer] of zipContents) {
    if (fileName === 'apple_health_export/export.xml') {
      const healthObject = await uploadAppleHealthData(buffer);
      return (
        'export apple health from ' + healthObject.HealthData.ExportDate.value
      );
    }
  }
  return 'test: document upload done';
};
