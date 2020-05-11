const winston = require('winston');
const { v1: uuidv1 } = require('uuid');
const { SERVER } = require('../environment');
const RejectAction = require('../core/models/action/reject');
const CommandTransport = require('../db/adapters/command-transport');
const Notifier = require('../lib/notifier');
const { post } = require('../services/request.service');

const commandTransport = new CommandTransport();
// уведомляем что данные обрабатываются в очереди
commandTransport.on('pre-logged', async () => {
  const headers = {
    'User-Agent': 'Bot-Hookshot',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Bot-Delivery': uuidv1(),
    'X-Bot-Assistant': 'tg',
  };
  await post(`${SERVER.HOST}/telegram/hooks/message-processing`, {}, headers);
});
// уведомляем вебхукой что данные обработаны
commandTransport.on('tg-logged', async (formData) => {
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
  transports: [commandTransport],
});
// уведомляем вебхукой что данные не сохранены
storyLogger.on('error', async (error) => {
  const notifyObject = Notifier.convertToTelegramNotifyObject(
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
