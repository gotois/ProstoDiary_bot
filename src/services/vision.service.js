const vision = require('@google-cloud/vision');
const { GOOGLE_CREDENTIALS_PARSED } = require('../env');
const client = new vision.ImageAnnotatorClient({
  credentials: GOOGLE_CREDENTIALS_PARSED,
});
/**
 * Performs label detection on the image file
 *
 * @param {Buffer|string} image - image file
 * @returns {Promise<Object>}
 */
const labelDetection = async (image) => {
  const [result] = await client.labelDetection(image);
  return result;
};
/**
 * @param {Buffer|string} image - image file
 * @returns {Promise<Object>}
 */
const webDetection = async (image) => {
  const [result] = await client.webDetection({ image });
  return result;
};
/**
 * @param {Buffer|string} image - image file
 * @returns {Promise<Object>}
 */
const objectLocalization = async (image) => {
  const result = await client.objectLocalization({ image });
  return result;
};
/**
 * @param {Object} visionResult - google vision result
 * @returns {boolean}
 */
const isQR = (visionResult) => {
  return visionResult.labelAnnotations.some(({ description }) => {
    const descriptionLowerCase = description.toLowerCase();
    return (
      descriptionLowerCase === 'qr code' || descriptionLowerCase === 'code'
    );
  });
};

module.exports = {
  isQR,
  labelDetection,
  webDetection,
  objectLocalization,
};
