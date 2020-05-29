const winston = require('winston');
const CoralogixWinston = require('coralogix-logger-winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { IS_PRODUCTION, CORALOGIX } = require('../environment');

const { combine, timestamp, colorize, simple, prettyPrint } = winston.format;
const logger = winston.createLogger();

if (IS_PRODUCTION) {
  const coralogixConfig = {
    privateKey: CORALOGIX.CORALOGIX_WINSTON_PRIVATE_KEY,
    applicationName: CORALOGIX.CORALOGIX_WINSTON_APPLICATION_NAME,
    subsystemName: 'ALL SUBSYSTEM',
  };
  CoralogixWinston.CoralogixTransport.configure(coralogixConfig);
  logger.configure({
    transports: [
      new winston.transports.Console({
        format: combine(simple(), prettyPrint()),
      }),
      new CoralogixWinston.CoralogixTransport({
        category: 'Bot',
      }),
    ],
  });
} else {
  logger.configure({
    transports: [
      new winston.transports.Console({
        format: combine(colorize({ all: true }), simple(), timestamp()),
        handleExceptions: true,
      }),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: combine(simple()),
      }),
      new DailyRotateFile({
        filename: 'log-%DATE%',
        format: combine(simple()),
        level: 'info',
        utc: true,
        extension: '.log',
        dirname: 'logs',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxSize: '20m',
        maxFiles: '14d',
      }),
    ],
    exitOnError: false,
  });
}

module.exports = logger;
