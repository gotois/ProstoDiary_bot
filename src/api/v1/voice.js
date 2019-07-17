const { voiceToText } = require('../../services/voice.service');
const { getTelegramFile } = require('../../services/telegram-file.service');

module.exports = async (voice) => {
  const fileBuffer = await getTelegramFile(voice.file_id);
  const text = await voiceToText(fileBuffer, voice);
  return 'распознано: ' + text;
};
