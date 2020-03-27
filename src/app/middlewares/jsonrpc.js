const jose = require('jose');
const { v1: uuidv1 } = require('uuid');
const package_ = require('../../../package.json');
const jsonRpcServer = require('../api');
const { pool } = require('../../db/sql');
const passportQueries = require('../../db/passport');
const signatures = require('../../lib/signature');
const logger = require('../../lib/log');
const crypt = require('../../services/crypt.service');
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

module.exports = async (request, response, next) => {
  logger.info(`RPC:${request.body.method}`);
  let passport;
  let email;
  try {
    passport = await pool.connect(async (connection) => {
      // By token auth
      if (request.headers.authorization) {
        const [_basic, id_token] = request.headers.authorization.split(' ');
        const decoded = jose.JWT.decode(id_token);
        // fixme: на данный момент считаем все токены вечными, затем надо будет их валидировать jose.JWT.verify(...)
        const botTable = await connection.maybeOne(
          passportQueries.selectBotByEmail(decoded.email),
        );
        if (!botTable) {
          return {};
        }
        return botTable;
      } else {
        // By basic auth
        email = request.user;

        const userTable = await connection.maybeOne(
          passportQueries.selectUserByEmail(email),
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
      }
    });
  } catch (error) {
    logger.error(error);
    return response.status(500).json('Bad error :/');
  }
  if (!passport) {
    return response.sendStatus(401).send('401 Unauthorized');
  }
  logger.info(`API:${request.body.method}`);
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
