const bot = require('../bot');
const logger = require('../services/logger.service');
const { voiceToText } = require('../services/voice.service');
const { get } = require('../services/request.service');
/**
 * @function
 * @param {Object} msg - msg
 * @param {Object} msg.chat - chat
 * @param {Object} msg.voice - voice
 * @returns {Promise<undefined>}
 */
const getVoice = async ({ chat, voice }) => {
  logger.log('info', getVoice.name);
  const chatId = chat.id;
  const fileInfo = await bot.getFile(voice.file_id);
  const buffer = await get(
    `https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`,
  );
  try {
    const text = await voiceToText(buffer, voice);
    await bot.sendMessage(chatId, 'распознано: ' + text);
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, 'Распознавание голоса неудачно');
  }
};

module.exports = getVoice;
