const jsQR = require('jsqr');
const Jimp = require('jimp');
/**
 * @param {Buffer} buffer - buffer
 * @returns {Promise<string|Error>}
 */
const readQR = async (buffer) => {
  let image = await Jimp.read(buffer);
  const MAX_SIZE = 640;
  if (image.bitmap.width > MAX_SIZE || image.bitmap.height > MAX_SIZE) {
    image = image.contain(MAX_SIZE, MAX_SIZE).autocrop({
      cropOnlyFrames: false,
      cropSymmetric: true,
    });
  }
  const qrValue = jsQR(
    image.bitmap.data,
    image.bitmap.width,
    image.bitmap.height,
  );
  if (!qrValue) {
    throw new Error('QR: not found');
  } else if (!qrValue.data) {
    throw new Error('QR: data not found');
  }
  return getParams(qrValue.data);
};
/**
 * @param {string} query - query
 * @returns {string|Error}
 */
const getParams = (query) => {
  if (!query) {
    throw new Error('empty query');
  }
  return (/^[?#]/.test(query) ? query.slice(1) : query)
    .split('&')
    .reduce((params, param) => {
      const [key, value] = param.split('=');
      params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
      return params;
    }, {});
};

module.exports = {
  readQR,
};
