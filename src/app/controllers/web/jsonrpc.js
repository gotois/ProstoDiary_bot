const jose = require('jose');
const { Ed25519KeyPair } = require('crypto-ld');
const package_ = require('../../../../package.json');
const jsonRpcServer = require('../../../api/server');
const logger = require('../../../lib/log');
const linkedDataSignature = require('../../../services/linked-data-signature.service');
const { pool } = require('../../../db/sql');
const signatureQueries = require('../../../db/selectors/signature');
const marketplaceQueries = require('../../../db/selectors/marketplace');
const RejectAction = require('../../../core/models/action/reject');
/**
 * @param {object} rpcValues - json rpc method
 * @param {object} passport - passport
 * @param {object} marketplace - marketplace
 * @returns {Promise<jsonld>}
 */
function apiRequest(rpcValues, passport, marketplace) {
  logger.info('apiRequest');
  return new Promise((resolve, reject) => {
    jsonRpcServer.call(
      rpcValues,
      { passport, marketplace },
      (error = {}, result) => {
        if (error && error.error) {
          return reject(
            jsonRpcServer.error(
              error.error.code,
              error.error.message,
              JSON.stringify(RejectAction(error.error.data)),
            ),
          );
        }
        // todo здесь должна быть обертка AcceptAction
        return resolve(result.result);
      },
    );
  });
}
/**
 * @description express.js wrapper for jayson server
 * @param {Request} request - request
 * @param {Response} response - response
 * @returns {Promise<void>}
 */
module.exports = async (request, response) => {
  logger.info(`JSONRPC_API: ${request.body.method}`);
  try {
    if (!request.body.method) {
      throw new TypeError('Empty method');
    }
    // set headers
    response.header('X-Bot', [package_.name]);
    response.header('X-Bot-Version', [package_.version]);
    // decode auth
    const [_basic, id_token] = request.headers.authorization.split(' ');
    const decoded = jose.JWT.decode(id_token);
    const passport = request.session.passport[decoded.sub];
    const { fingerprint, marketplace } = await pool.connect(
      async (connection) => {
        const result = await connection.one(
          signatureQueries.selectByVerification(request.headers.verification),
        );
        const marketplace = await connection.one(
          marketplaceQueries.selectByClientId(decoded.aud),
        );
        return {
          fingerprint: result.fingerprint,
          marketplace: marketplace,
        };
      },
    );
    // public key
    // @see https://github.com/digitalbazaar/minimal-cipher
    const publicKeyNode = Ed25519KeyPair.fromFingerprint({ fingerprint });
    publicKeyNode.id = request.headers.verification;
    await linkedDataSignature.verifyDocument(
      request.body.params,
      publicKeyNode,
      `https://gotointeractive.com/marketplace/${decoded.aud.split('@')[0]}`,
    );
    const result = await apiRequest(request.body, passport, marketplace);
    response.contentType('application/ld+json').status(200).send(result);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};
