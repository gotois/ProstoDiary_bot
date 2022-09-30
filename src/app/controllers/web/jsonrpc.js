const jose = require('jose');
const e = require('express');
const createError = require('http-errors');
const package_ = require('../../../../package.json');
const logger = require('../../../lib/log');
const apiRequestPublic = require('../../../lib/api').public;
const apiRequestPrivate = require('../../../lib/api').private;
const ldSignature = require('../../../services/linked-data-signature.service');
const bullService = require('../../../services/bull.service');
/**
 * @param {object} job - bullmq job
 * @returns {Promise<object|TypeError>}
 */
async function execution(job) {
  if (!job.name) {
    throw new TypeError('Empty method');
  }
  const { verification, body, passport, clientId } = job.data;
  const { publicKeyNode, marketplace } = await apiRequestPrivate({
    jsonrpc: '2.0',
    id: 'xxxxx',
    method: 'authorization',
    params: {
      verification,
      clientId,
    },
  });
  await ldSignature.verifyDocument(
    body.params,
    publicKeyNode,
    `https://gotointeractive.com/marketplace/${clientId.split('@')[0]}`,
  );
  return apiRequestPublic(body, passport, marketplace);
}
const { queue, queueEvents } = bullService('API', execution);
/**
 * @description express.js wrapper for jayson server
 * @param {e.Request} request - request
 * @param {e.Response} response - response
 * @param {e.NextFunction} next - next
 */
module.exports = async (request, response, next) => {
  logger.info(`JSONRPC_API: ${request.body.method}`);
  try {
    response.header('X-Bot', [package_.name]);
    response.header('X-Bot-Version', [package_.version]);
    const [_basic, id_token] = request.headers.authorization.split(' ');
    const decoded = jose.JWT.decode(id_token);
    const job = await queue.add(request.body.method, {
      verification: request.headers.verification,
      body: request.body,
      passport: request.session.passport[decoded.sub],
      clientId: decoded.aud,
    });
    const message = await job.waitUntilFinished(queueEvents, 60000);
    response.contentType('application/ld+json').status(200).send(message);
  } catch (error) {
    next(createError(error.statusCode || 400, error.message));
  }
};
