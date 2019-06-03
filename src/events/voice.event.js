const bot = require('../bot');
const logger = require('../services/logger.service');
const { voiceToText } = require('../services/voice.service');
const { getTelegramFile } = require('../services/telegram-file.service');
/**
 * @function
 * @param {object} msg - msg
 * @param {object} msg.chat - chat
 * @param {object} msg.voice - voice
 * @returns {Promise<undefined>}
 */
const getVoice = async ({ chat, voice }) => {
  logger.log('info', getVoice.name);
  const chatId = chat.id;
  try {
    const fileBuffer = await getTelegramFile(voice.file_id);
    const text = await voiceToText(fileBuffer, voice);
    await bot.sendMessage(chatId, 'распознано: ' + text);
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, 'Распознавание голоса неудачно');
  }
};

module.exports = getVoice;
