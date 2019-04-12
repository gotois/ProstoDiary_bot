const jsQR = require('jsqr');
const Jimp = require('jimp');
/**
 * @param {Buffer} buffer - buffer
 * @returns {Promise<string>}
 */
const readQR = (buffer) => {
  return new Promise((resolve, reject) => {
    Jimp.read(buffer, (error, image) => {
      if (error) {
        reject(error);
        return;
      }
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
        reject('qr not found');
      }
      resolve(qrValue.data);
    });
  });
};
// TODO: объединить это с readQR
/**
 * @param {string} query - query
 * t - время нужно преобразовать
 * s - сумма
 * @returns {{t: string, fn: string, i: string, fp: string, n: string}}
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
  getParams,
};
