const winston = require('winston');
const CoralogixWinston = require('coralogix-logger-winston');
const { IS_PRODUCTION, CORALOGIX } = require('../env');

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
        format: winston.format.simple(),
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
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.simple(),
        ),
      }),
      new winston.transports.File({
        filename: 'logs/log.log',
      }),
    ],
    exitOnError: false,
  });
}

module.exports = logger;
