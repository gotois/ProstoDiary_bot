const { Storage } = require('@google-cloud/storage');
const { GOOGLE } = require('../environment');
const storage = new Storage({
  credentials: GOOGLE.CREDENTIALS,
});
/**
 * @description Uploads binary file to google storage
 * @param {Buffer} file - file
 * @param {string} filename - filename
 * @returns {Promise<string>} - storage filename
 */
const uploadFile = async (file, filename) => {
  await storage.bucket(GOOGLE.CLOUD.bucketName).file(filename).save(file);
  return filename;
};
const getFile = async (filename) => {
  const [result] = await storage
    .bucket(GOOGLE.CLOUD.bucketName)
    .file(filename)
    .download();
  return result;
};
/**
 * @description Lists files in the bucket, filtered by a prefix
 * @returns {Promise<Array>}
 */
const listFilesByPrefix = async () => {
  // todo директорию results надо создать в google storage
  const options = {
    prefix: 'results',
  };
  const [files] = await storage
    .bucket(GOOGLE.CLOUD.bucketName)
    .getFiles(options);
  return files;
};

module.exports = {
  getFile,
  uploadFile,
  listFilesByPrefix,
};
