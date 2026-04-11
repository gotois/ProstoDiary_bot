const { fileTypeFromBuffer } = require('file-type');

/**
 * @param {Buffer|Uint8Array|string} input - input
 * @param {string} [filename] - filename
 * @returns {Promise<string>}
 */
module.exports.getMimeType = async function (input, filename) {
  if (input instanceof Uint8Array || Buffer.isBuffer(input)) {
    const result = await fileTypeFromBuffer(input);
    if (result && result.mime) {
      const [mime] = result.mime.split(' ');
      return mime.replace(';', '');
    } else if (filename.endsWith('.txt')) {
      return 'text/plain';
    }
  }
  if (typeof input === 'string') {
    if (input.startsWith('data:')) {
      return input.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
    } else {
      return 'text/plain';
    }
  }
  throw new Error('Cannot detect input');
}
