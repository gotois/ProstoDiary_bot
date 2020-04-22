const winston = require('winston');
const RejectAction = require('../core/models/action/reject');
const CommandTransport = require('../db/adapters/command-transport');
const notifier = require('../lib/notifier');

const commandTransport = new CommandTransport();
commandTransport.on('logged', async (info) => {
  const { document } = info.message;
  await notifier(document);
});

const storyLogger = winston.createLogger({
  transports: [commandTransport],
});
storyLogger.on('error', async (error) => {
  await notifier(RejectAction(error));
});

module.exports = storyLogger;
