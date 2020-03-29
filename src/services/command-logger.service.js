const winston = require('winston');
const CommandTransport = require('../db/adapters/command-transport');
const logger = require('../lib/log');
const notifyTelegram = require('../lib/notify-tg');

const commandTransport = new CommandTransport();
commandTransport.on('logged', async (info) => {
  const { document } = info.message;
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
  const telegramParseMode =
    document.purpose.encodingFormat === 'text/markdown' ? 'Markdown' : 'HTML';
  // todo поддержать notifyEmail
  await notifyTelegram({
    subject: document.purpose.abstract,
    parseMode: telegramParseMode,
    chatId: telegramChatId,
  });
});

const storyLogger = winston.createLogger({
  transports: [commandTransport],
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
