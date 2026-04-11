const { Readable } = require('node:stream');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const FormData = require('form-data'); // todo cделать нативными средствами чтобы не грузить лишний пакет
const { parseBuffer } = require('music-metadata');
const { SERVER, VOSK } = require('../environments/index.cjs');

ffmpeg.setFfmpegPath(ffmpegStatic);

const AUDIO_DURATION_LIMIT = 60;

/**
 * Основная функция транскрипции
 * @param {Buffer} inputBuffer - input buffer
 * @returns {Promise<Buffer>}
 */
const convertAudio = (inputBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = Readable.from(inputBuffer);
    const buffers = [];
    ffmpeg()
      .input(stream)
      .audioChannels(1)
      .audioBitrate('16k')
      .audioCodec('pcm_s16le')
      .format('wav')
      .stream()
      .on('data', (chunk) => {
        buffers.push(chunk);
      })
      .on('end', () => {
        resolve(Buffer.concat(buffers));
      })
      .on('error', (err) => {
        console.error('Conversion error:', err);
        reject(err);
      });
  });
};

/**
 * @description Преобразует аудиофайл из Telegram по file_id
 * @param {import('express').Request<{ file_id: string }>} request
 * @param {import('express').Response} response
 * @returns {Promise<void>} Результат транскрипции
 */
module.exports = async (request, response) => {
  const fileId = request.params.file_id;

  const url = `${SERVER.HOST}/file/${fileId}`;
  const response0 = await fetch(url);
  if (!response0.ok) {
    throw new Error('Ошибка');
  }

  const mime = response0.headers.get('content-type');
  switch (mime) {
    case 'audio/wav':
    case 'audio/ogg':
    case 'audio/mpeg':
    case 'audio/m4a': {
      break;
    }
    default: {
      throw new Error(`Unsupported mime type: ${mime}`);
    }
  }

  let buffer = Buffer.from(await response0.arrayBuffer());
  const metadata = await parseBuffer(buffer, mime, {
    duration: true,
    skipCovers: false,
    includeChapters: false,
  });
  if (metadata.format.duration > AUDIO_DURATION_LIMIT) {
    throw new Error(`AUDIO DURATION LIMIT IS ${AUDIO_DURATION_LIMIT} sec`);
  }
  if (metadata.format.container !== 'WAVE') {
    buffer = await convertAudio(buffer);
  }

  const formData = new FormData();
  formData.append('audio', buffer, 'audio.wav');

  const response2 = await fetch(VOSK.URL, {
    method: 'POST',
    body: formData.getBuffer(),
    headers: {
      'Content-Length': formData.getLengthSync(),
      ...formData.getHeaders(),
    },
  });
  if (!response2.ok) {
    throw new Error('Vosk API error');
  }
  const { text } = await response2.json();

  response.send(text);
};
