const jsQR = require('jsqr');
const Jimp = require('jimp');
const fileType = require('file-type');
const crypt = require('./crypt.service');
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
 * @param {object} requestObject - object
 * @param {string} requestObject.caption - photo caption text
 * @param {Buffer} requestObject.fileBuffer - file buffer
 * @returns {Promise<*>}
 */
const prepareImage = async (requestObject) => {
  const { imageBuffer, secretKey, caption } = requestObject;
  const { mime } = fileType(imageBuffer);
  const tags = [];
  let subject;
  if (caption) {
    // fixme отправляю subject в DialogFlow для детектирования Action
    caption.toLowerCase();
  }
  const visionResult = await visionService.labelDetection(imageBuffer);
  visionResult.labelAnnotations.forEach((annotation) => {
    tags.push(annotation.description);
  });
  const encrypted = await crypt.openpgpEncrypt(imageBuffer, [secretKey]);
  return {
    mime,
    // eslint-disable-next-line
    subject: subject || 'UndefinedPhoto', // todo распознавать интент-намерение в самой картинке через Vision
    content: encrypted.data,
    original: imageBuffer,
    tags,
  };
};

module.exports = {
  prepareImage,
  readQR,
};
