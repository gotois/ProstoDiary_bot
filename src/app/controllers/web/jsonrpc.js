const jose = require('jose');
const e = require('express');
const { QueueEvents, Queue, Worker } = require('bullmq');
const package_ = require('../../../../package.json');
const client = require('../../../db/redis');
const logger = require('../../../lib/log');
const apiRequestPublic = require('../../../lib/api').public;
const apiRequestPrivate = require('../../../lib/api').private;
const ldSignature = require('../../../services/linked-data-signature.service');

const connection = client.duplicate();
connection.options.keyPrefix = ''; // remove oidc prefix
const queue = new Queue('API', { connection });
const worker = new Worker('API', execution, { connection });
worker.on('failed', (job, error) => {
  logger.error(error);
});
const queueEvents = new QueueEvents('API');
queueEvents.on('waiting', (job) => {
  logger.info(`job ${job.jobId} waiting`);
});
queueEvents.on('completed', (job) => {
  logger.info(`job ${job.jobId} completed`);
});
queueEvents.on('failed', (job) => {
  logger.error(`Job ${job.jobId} failed. Reason: ${job.failedReason}`);
});
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
  const result = await apiRequestPublic(body, passport, marketplace);
  return result;
}
/**
 * @description express.js wrapper for jayson server
 * @param {e.Request} request - request
 * @param {e.Response} response - response
 */
module.exports = async (request, response) => {
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
    response.status(error.statusCode || 400).json({ error: error.message });
  }
};
