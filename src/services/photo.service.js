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
 * @param {Object} obj - obj
 * @param {string} obj.caption - photo caption text
 * @param {Buffer} obj.fileBuffer - fileBuffer
 * @returns {Promise<Object>}
 */
const getPhotoDetection = async ({ caption, fileBuffer }) => {
  let res = {};
  if (caption) {
    res = getTextDetection(caption);
  } else if (fileBuffer) {
    res = await getVisionDetection(fileBuffer);
  }
  return res;
};

module.exports = {
  getPhotoDetection,
};
