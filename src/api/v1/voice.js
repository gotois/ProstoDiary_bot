const { voiceToText } = require('../../services/voice.service');
const { getTelegramFile } = require('../../services/telegram-file.service');
/**
 * @returns {jsonrpc}
 */
module.exports = async (voice) => {
  try {
    const fileBuffer = await getTelegramFile(voice.file_id);
    const text = await voiceToText(fileBuffer, voice);
    return {
      jsonrpc: '2.0',
      result: text,
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
