const jsQR = require('jsqr');
const Jimp = require('jimp');
const visionService = require('./vision.service');
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
  // image = image.greyscale().contrast(-0.1); // - не особо помогает :(
  const qrValue = jsQR(
    image.bitmap.data,
    image.bitmap.width,
    image.bitmap.height,
    {
      inversionAttempts: 'dontInvert',
    },
  );
  if (!qrValue) {
    throw new Error('QR: not found');
  } else if (!qrValue.data) {
    throw new Error('QR: data is null');
  }
  return qrValue.data;
};
/**
 * Детектировать что сфоткано через Google Vision
 *
 * @param {Buffer} buffer - photo buffer
 * @returns {{isQR: boolean}}
 */
const getVisionDetection = async (buffer) => {
  let isQR = false;
  const visionResult = await visionService.labelDetection(buffer);
  if (visionService.isQR(visionResult)) {
    isQR = true;
  }
  return {
    isQR,
  };
};
/**
 * @param {string} caption - photo caption text
 * @returns {{isQR}}
 */
const getTextDetection = (caption) => {
  caption = caption.toLowerCase();
  // TODO: https://github.com/gotois/ProstoDiary_bot/issues/101
  return {
    isQR: caption.includes('qr'),
  };
};
/**
 * @param {object} obj - obj
 * @param {string} obj.caption - photo caption text
 * @param {Buffer} obj.fileBuffer - fileBuffer
 * @returns {Promise<object>}
 */
const getPhotoDetection = async ({ caption, fileBuffer }) => {
  if (caption) {
    return getTextDetection(caption);
  } else if (fileBuffer) {
    const visionResult = await getVisionDetection(fileBuffer);
    return visionResult;
  }
};

module.exports = {
  getPhotoDetection,
  readQR,
};
