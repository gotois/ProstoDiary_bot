const QrCode = require('qrcode-reader');
const Jimp = require('jimp');
/**
 * @param {Buffer} buffer - buffer
 * @returns {Promise<any>}
 */
module.exports = (buffer) => new Promise ((resolve, reject) => {
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
