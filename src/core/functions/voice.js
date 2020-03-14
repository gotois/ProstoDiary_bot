const mm = require('music-metadata');
const speech = require('@google-cloud/speech');
const rpc = require('../lib/rpc');
const { GOOGLE } = require('../environment');
const package_ = require('../../../package');
const dialogService = require('./dialog.service');
const logger = require('../../services/logger.service');

const client = new speech.SpeechClient({
  credentials: GOOGLE.CREDENTIALS,
});

/**
 * @param {string} mimeType - mime type
 * @returns {string}
 */
const convertTelegramMimeToGoogleMime = (mimeType) => {
  switch (mimeType) {
    case 'audio/ogg': {
      return 'OGG_OPUS';
    }
    default: {
      return 'ENCODING_UNSPECIFIED';
    }
  }
};
const voiceMetadata = async ({ buffer, mimeType, fileSize, duration }) => {
  const metadata = await mm.parseBuffer(buffer, mimeType, {
    fileSize,
  });
  if (!duration || fileSize < 2048) {
    throw new Error('Недостаточно данных для получения текста');
  }
  const config = {
    encoding: convertTelegramMimeToGoogleMime(mimeType), // raw 16-bit signed LE samples
    sampleRateHertz: metadata.format.sampleRate,
    languageCode: 'ru-RU', // a BCP-47 language tag
  };
  return config;
};
/**
 * @param {Buffer} buffer - file or buffer
 * @param {object} obj - obj
 * @param {number} obj.duration - duration
 * @param {string} obj.mime_type - audio/ogg
 * @param {number} obj.file_size - file size
 * @returns {Promise<string|Error>}
 */
const voiceToText = async (buffer, { duration, mime_type, file_size }) => {
  const config = await voiceMetadata({
    buffer,
    mimeType: mime_type,
    fileSize: file_size,
    duration: duration,
  });

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

module.exports = async function(requestObject) {
  const {
    buffer,
    auth,
    jwt,
    mimeType,
    fileSize,
    duration,
    uid,
  } = requestObject;

  // сначала разбираем услышанное самостоятельно чтобы понять какой диалог дергать
  const text = await voiceToText(buffer, {
    duration,
    mime_type: mimeType,
    file_size: fileSize,
  });

  const config = await voiceMetadata({
    buffer,
    mimeType,
    fileSize,
    duration,
  });

  const audioConfig = {
    audioEncoding: 'AUDIO_ENCODING_' + config.encoding,
    sampleRateHertz: config.sampleRateHertz,
    languageCode: config.languageCode,
  };
  const dialogflowResult = await dialogService.detectAudio(
    buffer,
    audioConfig,
    uid,
  );

  logger.info(dialogflowResult);

  const document = {
    '@context': 'http://schema.org',
    '@type': 'AllocateAction',
    'agent': {
      '@type': 'Person',
      'name': package_.name,
      'url': package_.homepage,
    },
    'name': 'Voice',
    'object': {
      '@type': 'CreativeWork',
      'name': 'text',
      'abstract': buffer.toString('base64'),
      'encodingFormat': 'audio/ogg',
    },
    'subjectOf': [
      {
        '@type': 'CreativeWork',
        'text': text,
      },
    ],
  };

  const jsonldMessage = await rpc({
    body: {
      jsonrpc: '2.0',
      method: 'ping',
      id: 1,
      params: document,
    },
    jwt,
    auth,
  });
  return jsonldMessage;
};
