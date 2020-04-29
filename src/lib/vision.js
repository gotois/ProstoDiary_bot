const vision = require('@google-cloud/vision');
const { GOOGLE } = require('../environment');
const client = new vision.ImageAnnotatorClient({
  credentials: GOOGLE.CREDENTIALS,
});
// The folder to store the where 'output' is store folder
// todo надо создавать эту директорию в Google Cloud Platform
//  а также дать доступ на запись в Google Cloud пользователю установленного при инициализации vision
const resultsFolder = 'results';
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
 * @param {string} fileName - Path to PDF file within bucket
 * @returns {Promise<string>} - destination uri
 */
const pdfReader = async (fileName) => {
  const request = {
    requests: [
      {
        inputConfig: {
          gcsSource: {
            uri: `gs://${GOOGLE.CLOUD.bucketName}/${fileName}`,
          },
          mimeType: 'application/pdf',
        },
        features: [
          {
            type: 'DOCUMENT_TEXT_DETECTION',
          },
        ],
        outputConfig: {
          gcsDestination: {
            uri: `gs://${GOOGLE.CLOUD.bucketName}/${resultsFolder}/`,
          },
          batchSize: 1,
        },
      },
    ],
  };
  const [operation] = await client.asyncBatchAnnotateFiles(request);
  const [filesResponse] = await operation.promise();

  // hack стандартно батчинге файл именуется как "output-1-to-1.json"
  if (filesResponse.responses[0].outputConfig.gcsDestination.uri) {
    return `${resultsFolder}/output-1-to-1.json`;
  }
  throw new Error('Vision response unknown');
};
/**
 * @deprecated
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
  pdfReader,
  objectLocalization,
};
