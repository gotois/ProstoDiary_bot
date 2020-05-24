const jose = require('jose');
const e = require('express');
const package_ = require('../../../../package.json');
const logger = require('../../../lib/log');
const apiRequestPublic = require('../../../lib/api').public;
const apiRequestPrivate = require('../../../lib/api').private;
const ldSignature = require('../../../services/linked-data-signature.service');
/**
 * @description express.js wrapper for jayson server
 * @param {e.Request} request - request
 * @param {e.Response} response - response
 */
module.exports = async (request, response) => {
  logger.info(`JSONRPC_API: ${request.body.method}`);
  try {
    if (!request.body.method) {
      throw new TypeError('Empty method');
    }
    response.header('X-Bot', [package_.name]);
    response.header('X-Bot-Version', [package_.version]);
    // decode auth
    const [_basic, id_token] = request.headers.authorization.split(' ');
    const decoded = jose.JWT.decode(id_token);
    const passport = request.session.passport[decoded.sub];
    const { publicKeyNode, marketplace } = await apiRequestPrivate({
      jsonrpc: '2.0',
      id: 'xxxxx',
      method: 'authorization',
      params: {
        verification: request.headers.verification,
        clientId: decoded.aud,
      },
    });
    await ldSignature.verifyDocument(
      request.body.params,
      publicKeyNode,
      `https://gotointeractive.com/marketplace/${decoded.aud.split('@')[0]}`,
    );
    const result = await apiRequestPublic(request.body, passport, marketplace);
    response.contentType('application/ld+json').status(200).send(result);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};
