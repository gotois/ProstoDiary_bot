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
const detect = async (image) => {
  const [result] = await client.labelDetection(image);
  return result;
};

module.exports = {
  detect,
};
