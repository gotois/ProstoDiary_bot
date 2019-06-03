const vision = require('@google-cloud/vision');
const { GOOGLE } = require('../env');
const client = new vision.ImageAnnotatorClient({
  credentials: GOOGLE.GOOGLE_CREDENTIALS_PARSED,
});
/**
 * Performs label detection on the image file
 *
 * @param {Buffer|string} image - image file
 * @returns {Promise<object>}
 */
const labelDetection = async (image) => {
  const [result] = await client.labelDetection(image);
  return result;
};
/**
 * @param {Buffer|string} image - image file
 * @returns {Promise<object>}
 */
const webDetection = async (image) => {
  const [result] = await client.webDetection({ image });
  return result;
};
/**
 * @param {Buffer|string} image - image file
 * @returns {Promise<object>}
 */
const objectLocalization = async (image) => {
  const result = await client.objectLocalization({ image });
  return result;
};
/**
 * @param {object} visionResult - google vision result
 * @returns {boolean}
 */
const isQR = (visionResult) => {
  // TODO: поддержать также поиск через objectLocalization и webDetection.
  return visionResult.labelAnnotations.some(({ description }) => {
    const descriptionLowerCase = description.toLowerCase();
    return (
      descriptionLowerCase === 'qr code' ||
      descriptionLowerCase === 'code' ||
      descriptionLowerCase === 'text' ||
      descriptionLowerCase === 'font'
    );
  });
};

module.exports = {
  isQR,
  labelDetection,
  webDetection,
  objectLocalization,
};
