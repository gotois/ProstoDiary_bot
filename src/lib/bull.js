const { QueueEvents, QueueScheduler, Queue, Worker } = require('bullmq');
const client = require('../db/redis');
// const logger = require('../lib/log');

const connection = client.duplicate();
connection.options.keyPrefix = ''; // remove other prefix
/**
 * @param {string} name - queue name
 * @param {Function} workerFunction - worker callback
 * @param {boolean} [repeat] - cron or repeater
 * @returns {object}
 */
module.exports = (name, workerFunction, repeat = false) => {
  let scheduler;
  if (repeat) {
    scheduler = new QueueScheduler(name);
  }
  const queue = new Queue(name, {
    connection,
  });
  const worker = new Worker(name, workerFunction, {
    connection,
  });
  worker.on('failed', (job, error) => {
    //logger.error(error);
  });
  const queueEvents = new QueueEvents(name);
  queueEvents.on('waiting', (job) => {
    //logger.info(`job ${job.jobId} waiting`);
  });
  queueEvents.on('completed', (job) => {
    //logger.info(`job ${job.jobId} completed`);
  });
  queueEvents.on('failed', (job) => {
    //logger.error(`Job ${job.jobId} failed. Reason: ${job.failedReason}`);
  });
  return {
    queue,
    worker,
    queueEvents,
    scheduler,
  };
};
