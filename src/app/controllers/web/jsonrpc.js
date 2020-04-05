const jose = require('jose');
const { v1: uuidv1 } = require('uuid');
const package_ = require('../../../../package.json');
const jsonRpcServer = require('../../api');
const { pool } = require('../../../db/sql');
const passportQueries = require('../../../db/passport');
const logger = require('../../../lib/log');
const crypt = require('../../../services/crypt.service');
const linkedDataSignature = require('../../../services/linked-data-signature.service');
/**
 * @param {object} server - json rpc server
 * @param {string} method - json rpc method
 * @param {object} document - unsigned jsonld document
 * @param {object} passport - passport
 * @returns {Promise<jsonld>}
 */
async function apiRequest(server, method, document, passport) {
  const signedDocument = await linkedDataSignature.signDocument(
    document,
    passport.public_key_cert.toString('utf8'),
    passport.private_key_cert.toString('utf8'),
    passport.passport_id,
  );
  return new Promise((resolve, reject) => {
    server.call(
      {
        jsonrpc: '2.0',
        id: uuidv1(),
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
        try {
          const decryptAbstractMessage = await crypt.openpgpDecrypt(
            result.result.purpose.abstract,
            [passport.secret_key],
          );
          result.result.purpose.abstract = decryptAbstractMessage;
          // eslint-disable-next-line no-empty
        } catch {}

        return resolve(result.result);
      },
    );
  });
}
// json rpc server via header jwt
module.exports = async (request, response, next) => {
  logger.info(`JSONRPC:${request.body.method}`);
  try {
    response.header('X-Bot', [package_.name]);
    response.header('X-Bot-Version', [package_.version]);
    const passport = await pool.connect(async (connection) => {
      // By token auth
      if (request.headers.authorization) {
        // на данный момент считаем все токены вечными, затем надо будет их валидировать jose.JWT.verify(...)
        const [_basic, id_token] = request.headers.authorization.split(' ');
        const decoded = jose.JWT.decode(id_token);
        const botTable = await connection.one(
          passportQueries.selectBotByEmail(decoded.email),
        );
        return botTable;
      } else {
        throw new Error('Unknown assistant');
      }
    });
    if (!passport) {
      response.sendStatus(401).send('Unauthorized');
      return;
    }
    logger.info(`API:${request.body.method}`);
    const result = await apiRequest(
      jsonRpcServer,
      request.body.method,
      request.body.params,
      passport,
    );
    response.send(result);
  } catch (error) {
    if (typeof error === 'string') {
      response.status(400).json(JSON.parse(error));
      return;
    }
    next(error);
  }
};
