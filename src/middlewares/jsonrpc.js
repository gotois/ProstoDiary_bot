const package_ = require('../../package.json');
const jsonRpcServer = require('../api');
const { pool } = require('../db/database');
const passportQueries = require('../db/passport');
const logger = require('../services/logger.service');
const crypt = require('../services/crypt.service');
const signatures = require('../core/security/signature');

/**
 * @param {object} server - json rpc server
 * @param {string} method - json rpc method
 * @param {object} document - unsigned jsonld document
 * @param {object} passport - passport
 * @returns {Promise<jsonld>}
 */
async function apiRequest(server, method, document, passport) {
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

module.exports = async (request, response, next) => {
  logger.info(`RPC:${request.body.method}`);
  let passport;
  try {
    passport = await pool.connect(async (connection) => {
      const userTable = await connection.maybeOne(
        passportQueries.selectUserByEmail(request.user),
      );
      if (!userTable) {
        throw new Error('Unknown login');
      }
      const botTable = await connection.maybeOne(
        passportQueries.selectByPassport(userTable.id),
      );
      if (!botTable) {
        return {};
      }
      return botTable;
    });
  } catch (error) {
    logger.error(error);
    return response.status(500).json('Bad error :/');
  }
  if (!passport) {
    return response.sendStatus(401).send('401 Unauthorized');
  }
  try {
    const result = await apiRequest(
      jsonRpcServer,
      request.body.method,
      request.body.params,
      passport,
    );
    response.header('X-Bot', [package_.name]);
    response.header('X-Bot-Version', [package_.version]);
    return response.send(result);
  } catch (error) {
    next(error);
  }
};
