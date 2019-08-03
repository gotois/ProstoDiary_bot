const bot = require('../core');
const logger = require('../services/logger.service');
/**
 * @param {object} msg - msg
 * @param {object} msg.chat - chat
 * @param {object} msg.voice - voice
 * @returns {Promise<undefined>}
 */
const getVoice = async ({ chat, voice }) => {
  logger.log('info', getVoice.name);
  const chatId = chat.id;
  const voiceAPI = require('../api/v1/voice');
  const { error, result } = await voiceAPI(voice);
  if (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, 'Распознавание голоса неудачно');
    return;
  }
  await bot.sendMessage(chatId, result);
};

module.exports = getVoice;
