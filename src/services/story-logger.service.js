const winston = require('winston');
const PsqlTransport = require('../db/adapters/psql-transport');
const { SERVER } = require('../environment');
const logger = require('../lib/log');
const notifyTelegram = require('../lib/notify-tg');

const pqsqlTransport = new PsqlTransport();
pqsqlTransport.on('logged', async (info) => {
  logger.info('saveToDatabase:success ' + info.messageId);
  const { document } = info.message;
  const telegramMessageId = document.object.mainEntity.find((entity) => {
    return entity.name === 'TelegramMessageId';
  })['value'];
  const telegramChatId = document.object.mainEntity.find((entity) => {
    return entity.name === 'TelegramChatId';
  })['value'];
  const isSilent = document.object.mainEntity.find((entity) => {
    return entity.name === 'silent';
  })['value'];
  if (isSilent) {
    logger.info('skip notify message');
    return;
  }
  await notifyTelegram({
    subject: 'Запись добавлена',
    html: 'Открыть запись',
    url: `${SERVER.HOST}/message/${info.messageId}`,
    parseMode: 'HTML',
    chatId: telegramChatId,
    messageId: telegramMessageId,
  });
});

const storyLogger = winston.createLogger({
  transports: [pqsqlTransport],
});
storyLogger.on('error', async (error) => {
  logger.error(error.message);

  await notifyTelegram({
    subject: error.message,
    chatId: error.chatId,
    messageId: error.messageId,
  });
});

module.exports = storyLogger;
