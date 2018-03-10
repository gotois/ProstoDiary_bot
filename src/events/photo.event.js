const bot = require('../config');
const logger = require('../services/logger.service');
const {get} = require('../services/request.service');
const qr = require('../services/qr.service');
const {getParams} = require('../services/params.service');
/**
 * @param chat {Object}
 * @param photo {Array}
 * @returns {Promise<void>}
 */
const onPhoto = async ({chat, /*date, from, message_id,*/photo}) => {
  const chatId = chat.id;
  const fileInfo = await bot.getFile(photo[photo.length - 1].file_id);
  
  try {
    const buffer = await get(`https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`);
    const qrData = await qr(buffer);
    const params = getParams(qrData);
    
    const time = params.t;
    const sum = params.s;
    const fn = params.fn;
    
    await bot.sendMessage(chatId, '___TEST_FEATURE__  TIME:' + time + '  SUMMA:' + sum + '  FN:' + fn);
  } catch (error) {
    logger.log('error', error);
    await bot.sendMessage(chatId, error.toString());
  }
};

module.exports = onPhoto;
