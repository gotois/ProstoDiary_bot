const mm = require('music-metadata');
const speech = require('@google-cloud/speech');
const package_ = require('../../../package.json');
const dialogService = require('../../services/dialog.service');
const logger = require('../../services/logger.service');
const { GOOGLE } = require('../../environment');
const Abstract = require('../abstract/index');

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

class AbstractVoice extends Abstract {
  /**
   * @param {object} data - data
   * @param {*} data.buffer - data
   * @param {*} data.mimeType - data
   * @param {*} data.fileSize - data
   * @param {*} data.duration - data
   * @param {*} data.uid - data
   */
  constructor(data) {
    super(data);
    this.buffer = data.buffer;
    this.mimeType = data.mimeType;
    this.fileSize = data.fileSize;
    this.duration = data.duration;
    this.uid = data.uid;
  }

  get context() {
    return {
      ...super.context,
      '@context': {
        schema: 'http://schema.org/',
        agent: 'schema:agent',
        name: 'schema:name',
        object: 'schema:object',
        abstract: 'schema:abstract',
        encodingFormat: 'schema:encodingFormat',
        subjectOf: 'schema:subjectOf',
      },
      '@type': 'AllocateAction',
      'agent': {
        '@type': 'Person',
        'name': package_.name,
        'url': package_.homepage,
      },
      'name': 'Voice',
      'object': {
        '@type': 'CreativeWork',
        'name': 'voice',
        'abstract': this.buffer.toString('base64'),
        'encodingFormat': this.mimeType,
      },
      'subjectOf': [
        {
          '@type': 'CreativeWork',
          'text': encodeURIComponent(this.text),
        },
      ],
    };
  }

  async prepare() {
    const { buffer,
      mimeType,
      fileSize,
      duration } = this;
    // сначала разбираем услышанное самостоятельно чтобы понять какой диалог дергать
    this.text = await voiceToText(buffer, {
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
      this.uid,
    );

    logger.info(dialogflowResult);
  }
}

module.exports = AbstractVoice;
