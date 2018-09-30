const speech = require('@google-cloud/speech');
const mm = require('music-metadata');
const {GOOGLE_CREDENTIALS_PARSED} = require('../env');
const logger = require('../services/logger.service');
const bot = require('../config');
const {get} = require('../services/request.service');
const client = new speech.SpeechClient({
  'credentials': GOOGLE_CREDENTIALS_PARSED
});
/**
 *
 * @param mimeType
 * @return {string}
 */
const convertTelegramMIMEToGoogleMIME = (mimeType) => {
  switch (mimeType) {
    case 'audio/ogg': {
      return 'OGG_OPUS';
    }
    default: {
      return 'ENCODING_UNSPECIFIED';
    }
  }
};
/**
 *
 * @param chat {Object}
 * @param voice {Object}
 * @returns {Promise<void>}
 */
const getVoice = async ({chat, voice}) => {
  logger.log('info', getVoice.name);
  const chatId = chat.id;
  const fileInfo = await bot.getFile(voice.file_id);
  const buffer = await get(`https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`);
  const metadata = await mm.parseBuffer(buffer, voice.mime_type, {fileSize: voice.file_size});
  const config = {
    encoding: convertTelegramMIMEToGoogleMIME(voice.mime_type), // raw 16-bit signed LE samples
    sampleRateHertz: metadata.format.sampleRate,
    languageCode: 'ru-RU', // a BCP-47 language tag
  };
  const request = {
    audio: {
      content: buffer
    },
    config: config,
  };
  logger.log('info', config);
  try {
    const [response] = await client.recognize(request);
    if (response && Array.isArray(response.results)) {
      if (Array.isArray(response.results[0] && response.results[0].alternatives)) {
        await bot.sendMessage(chatId, 'распознано: ' + response.results[0].alternatives[0].transcript);
        return;
      }
    }
    await bot.sendMessage(chatId, 'Ничего не распознано');
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, 'Распознавание голоса неудачно');
  }
};

module.exports = getVoice;
