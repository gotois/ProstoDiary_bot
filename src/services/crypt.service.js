const openpgp = require('openpgp');
const crypto = require('crypto');
/**
 * @param {Buffer|string} buffer - file
 * @param {string} algorithm - algorithm
 * @param {string} encoding - encoding
 * @returns {string}
 */
const getCheckSum = (buffer, algorithm = 'md5', encoding = 'hex') => {
  return crypto.createHash(algorithm).update(buffer, 'utf8').digest(encoding);
};

// в идеале надо генерировать новую пару PGP ключей на каждый запрос, но это оверхед на данном этапе
const openpgpEncrypt = async (buffer, passwords) => {
  if (Buffer.byteLength(buffer) === 0) {
    throw new Error('Empty buffer');
  }
  const encrypted = await openpgp.encrypt({
    message: openpgp.message.fromBinary(buffer),
    passwords,
    compression: openpgp.enums.compression.zlib,
  });
  return encrypted;
};

const openpgpDecrypt = async (buffer, passwords) => {
  const utf8Content = buffer.toString('utf8');
  if (utf8Content.startsWith('-----BEGIN PGP MESSAGE-----')) {
    const rawDecrypt = await openpgp.decrypt({
      message: await openpgp.message.readArmored(utf8Content),
      passwords,
      format: 'binary',
    });
    return rawDecrypt.data;
  }
  return utf8Content;
};
// Генерация открытого и закрытого pem-ключа
// deprecated?
const generateRSA = () => {
  return new Promise((resolve, reject) => {
    const { generateKeyPair } = crypto;
    generateKeyPair(
      'rsa',
      {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      },
      (error, publicKey, privateKey) => {
        if (error) {
          return reject(error);
        }
        resolve({
          publicKey,
          privateKey,
        });
      },
    );
  });
};

module.exports = {
  openpgpEncrypt,
  openpgpDecrypt,
  getCheckSum,
  generateRSA,
};
