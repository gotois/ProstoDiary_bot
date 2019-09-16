const bot = require('../core');
const logger = require('../services/logger.service');
const { voiceToText } = require('../services/voice.service');
const { getTelegramFile } = require('../services/telegram-file.service');
const APIv2 = require('../api/v2');
/**
 * @param {object} msg - msg
 * @param {object} msg.chat - chat
 * @param {object} msg.voice - voice
 * @returns {Promise<undefined>}
 */
const getVoice = async ({ chat, voice }) => {
  logger.log('info', getVoice.name);
  const chatId = chat.id;
  const fileBuffer = await getTelegramFile(voice.file_id);
  const text = await voiceToText(fileBuffer, voice);
  // todo: вычлинять команды из текста
  const { error, result } = await APIv2.insert(Buffer.from(text), {});
  if (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, 'Распознавание голоса неудачно');
    return;
  }
  await bot.sendMessage(chatId, result);
};

module.exports = getVoice;
