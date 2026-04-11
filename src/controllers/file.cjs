const { TELEGRAM } = require('../environments/index.cjs');
const { getMimeType } = require('../libs/file-type.cjs');

/**
 * @description Проксирует аудиофайл из Telegram по file_id.
 * @param {import('express').Request<{ file_id: string }>} request
 * @param {import('express').Response} response
 * @returns {Promise<void>}
 */
module.exports = async (request, response) => {
  const fileId = request.params.file_id;
  if (!fileId) {
    throw new Error('Unknown file ID');
  }

  const responseGetFile = await fetch(`https://api.telegram.org/bot${TELEGRAM.TOKEN}/getFile?file_id=${fileId}`);
  if (!responseGetFile.ok) {
    throw new Error(`Ошибка при получении файла: ${responseGetFile.statusText}`);
  }

  const data = await responseGetFile.json();
  if (!data.ok) {
    throw new Error(`Ошибка API Telegram: ${data.description}`);
  }

  const href = decodeURIComponent(`https://api.telegram.org/file/bot${TELEGRAM.TOKEN}/${data.result.file_path}`);
  const response1 = await fetch(href);
  if (!response1.ok) {
    throw new Error('Ошибка при загрузке файла: ' + response1.statusText);
  }

  const contentType = response1.headers.get('content-type');
  if (!contentType.startsWith('application/octet-stream')) {
    throw new Error('Unknown content type');
  }

  const arrayBuffer = await response1.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const mime = await getMimeType(buffer, href);

  response.set('Content-Type', mime);
  response.send(buffer);
};
