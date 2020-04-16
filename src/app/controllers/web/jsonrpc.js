const validator = require('validator');
const jose = require('jose');
const { Ed25519KeyPair } = require('crypto-ld');
const package_ = require('../../../../package.json');
const jsonRpcServer = require('../../../api/server');
const logger = require('../../../lib/log');
const crypt = require('../../../services/crypt.service');
const linkedDataSignature = require('../../../services/linked-data-signature.service');
const { pool } = require('../../../db/sql');
const signatureQueries = require('../../../db/selectors/signature');
/**
 * @param {object} rpcValues - json rpc method
 * @param {object} passport - passport
 * @returns {Promise<jsonld>}
 */
function apiRequest(rpcValues, passport) {
  logger.info('apiRequest');
  return new Promise((resolve, reject) => {
    jsonRpcServer.call(rpcValues, { passport }, async (error, result) => {
      if (error) {
        // сначала показываем jsonld, остальное фоллбэк
        return reject(
          error.error.data || error.error.message || error.error.code,
        );
      }
      // пример реализации дешифровки
      try {
        const decryptAbstractMessage = await crypt.openpgpDecrypt(
          result.result.purpose.abstract,
          [passport.secret_key],
        );
        result.result.purpose.abstract = decryptAbstractMessage;
        // eslint-disable-next-line no-empty
      } catch {}
      return resolve(result.result);
    });
  });
}
/**
 * @description express.js wrapper for jayson server
 * @param {*} request - request
 * @param {*} response - response
 * @returns {Promise<void>}
 */
module.exports = async (request, response) => {
  try {
    response.header('X-Bot', [package_.name]);
    response.header('X-Bot-Version', [package_.version]);
    if (!request.body.method) {
      throw new TypeError('Empty method');
    }
    logger.info(`JSONRPC_API: ${request.body.method}`);
    const [_basic, id_token] = request.headers.authorization.split(' ');
    const decoded = jose.JWT.decode(id_token);
    const passport = request.session.passport[decoded.sub];
    const { fingerprint } = await pool.connect(async (connection) => {
      const result = await connection.one(
        signatureQueries.selectByVerification(request.headers.verification),
      );
      return result;
    });
    const publicKey = Ed25519KeyPair.fromFingerprint({ fingerprint });
    publicKey.id = request.headers.verification;
    await linkedDataSignature.verifyDocument(request.body.params, publicKey);
    const result = await apiRequest(request.body, passport);
    response.send(result);
  } catch (error) {
    if (validator.isJSON(error)) {
      response.status(400).json(JSON.parse(error));
      return;
    }
    response.status(400).json(error);
  }
};
