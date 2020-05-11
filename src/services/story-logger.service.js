const winston = require('winston');
const RejectAction = require('../core/models/action/reject');
const StoryTransport = require('../db/adapters/story-transport');
const { SERVER } = require('../environment');
const logger = require('../lib/log');
const Notifier = require('../lib/notifier');
const { v1: uuidv1 } = require('uuid');
const { post } = require('../services/request.service');

const storyTransport = new StoryTransport();

// уведомляем что данные обрабатываются в очереди
storyTransport.on('pre-logged', async () => {
  const headers = {
    'User-Agent': 'Bot-Hookshot',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Bot-Delivery': uuidv1(),
    'X-Bot-Assistant': 'tg',
  };
  await post(`${SERVER.HOST}/telegram/hooks/message-processing`, {}, headers);
});
// уведомляем вебхукой что данные сохранены
storyTransport.on('tg-logged', async (formData) => {
  logger.info('saveToDatabase:success');
  const headers = {
    'User-Agent': 'Bot-Hookshot',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Bot-Delivery': uuidv1(),
    'X-Bot-Assistant': 'tg',
  };
  await post(
    `${SERVER.HOST}/telegram/hooks/message-inserted`,
    formData,
    headers,
  );
});

const storyLogger = winston.createLogger({
  transports: [storyTransport],
});
// уведомляем вебхукой что данные не сохранены
storyLogger.on('error', async (error) => {
  const notifyObject = new Notifier.convertToTelegramNotifyObject(
    RejectAction(error),
  );
  const headers = {
    'User-Agent': 'Bot-Hookshot',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Bot-Delivery': uuidv1(),
    'X-Bot-Assistant': 'tg',
  };
  await post(
    `${SERVER.HOST}/telegram/hooks/message-error`,
    notifyObject,
    headers,
  );
});

module.exports = storyLogger;
