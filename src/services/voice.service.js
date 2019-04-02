const mm = require('music-metadata');
const speech = require('@google-cloud/speech');
const { GOOGLE_CREDENTIALS_PARSED } = require('../env');
const client = new speech.SpeechClient({
  credentials: GOOGLE_CREDENTIALS_PARSED,
});
/**
 * @param {string} mimeType - mime type
 * @returns {string}
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
 * @param {Buffer} buffer - file or buffer
 * @param {number} duration - duration
 * @param {string} mime_type - audio/ogg
 * @param {number} file_size - file size
 * @returns {Promise<string|Error>}
 */
const voiceToText = async (buffer, { duration, mime_type, file_size }) => {
  const metadata = await mm.parseBuffer(buffer, mime_type, {
    fileSize: file_size,
  });
  if (!duration || file_size < 2048) {
    throw new Error('Недостаточно данных для получения текста');
  }
  const config = {
    encoding: convertTelegramMIMEToGoogleMIME(mime_type), // raw 16-bit signed LE samples
    sampleRateHertz: metadata.format.sampleRate,
    languageCode: 'ru-RU', // a BCP-47 language tag
  };
  const request = {
    audio: {
      content: buffer,
    },
    config: config,
  };
  const [response] = await client.recognize(request, { autoPaginate: true });
  if (
    response &&
    Array.isArray(response.results) &&
    Array.isArray(response.results[0] && response.results[0].alternatives)
  ) {
    return response.results[0].alternatives[0].transcript;
  }
  throw new Error('Ничего не распознано');
};

module.exports = {
  voiceToText,
};
