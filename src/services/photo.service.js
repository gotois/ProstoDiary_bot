const visionService = require('../services/vision.service');
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

// todo: перенести это в Abstract-Photo.js
module.exports = {
  getPhotoDetection,
};
