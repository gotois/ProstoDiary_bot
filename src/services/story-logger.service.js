const winston = require('winston');
const AcceptAction = require('../core/models/action/accept');
const RejectAction = require('../core/models/action/reject');
const StoryTransport = require('../db/adapters/story-transport');
const { SERVER } = require('../environment');
const logger = require('../lib/log');
const notifier = require('../lib/notifier');

const storyTransport = new StoryTransport();
storyTransport.on('logged', async (info) => {
  logger.info('saveToDatabase:success');
  logger.warn(info.messageId);
  const { document, passport } = info.message;
  await notifier({
    agent: document.agent,
    object: document.object,
    purpose: document.purpose,
    ...AcceptAction({
      abstract: 'Запись добавлена',
      url: `${SERVER.HOST}/message/${passport.email}/${info.messageId}`,
      text: 'Открыть запись',
      encodingFormat: 'text/html',
    }),
  });
});

const storyLogger = winston.createLogger({
  transports: [storyTransport],
});
storyLogger.on('error', async (error) => {
  await notifier(RejectAction(error));
});

module.exports = storyLogger;
