const jayson = require('jayson/promise');
const API = require('../api/v4');
const crypt = require('../services/crypt.service');
const signatures = require('./libs/signatures');

const server = jayson.server(
  {
    ...API,
  },
  {
    useContext: true,
    params: Object,
  },
);

/**
 * @param {string} method - json rpc method
 * @param {object} document - unsigned jsonld document
 * @param {object} passport - passport
 * @returns {Promise<jsonld>}
 */
const rpcRequest = async (method, document, passport) => {
  const signedDocument = await signatures.signature.call(passport, document);

  return new Promise((resolve, reject) => {
    server.call(
      {
        jsonrpc: '2.0',
        id: 1, // todo изменить используя guid ?
        method,
        params: signedDocument,
      },
      {
        passport,
      },
      async (error, result) => {
        if (error) {
          // сначала показываем jsonld, остальное фоллбэк
          return reject(
            error.error.data || error.error.message || error.error.code,
          );
        }
        // пример реализации дешифровки
        const decryptAbstractMessage = await crypt.openpgpDecrypt(
          result.result.purpose.abstract,
          [passport.secret_key],
        );
        result.result.purpose.abstract = decryptAbstractMessage;
        return resolve(result.result);
      },
    );
  });
};

module.exports = {
  rpcRequest,
};
