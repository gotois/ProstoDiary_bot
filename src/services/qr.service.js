const QrCode = require('qrcode-reader');
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
      const qr = new QrCode();
      qr.callback = (error, value) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(value.result);
      };
      qr.decode(image.bitmap);
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
