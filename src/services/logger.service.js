const winston = require('winston');
const CoralogixWinston = require('coralogix-logger-winston');
const {
  IS_PRODUCTION,
  CORALOGIX_WINSTON_PRIVATE_KEY,
  CORALOGIX_WINSTON_APPLICATION_NAME,
} = require('../env');

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.simple(),
  ),
  exitOnError: false,
});

if (IS_PRODUCTION) {
  const coralogixConfig = {
    privateKey: CORALOGIX_WINSTON_PRIVATE_KEY,
    applicationName: CORALOGIX_WINSTON_APPLICATION_NAME,
    subsystemName: 'ALL SUBSYSTEM',
  };
  CoralogixWinston.CoralogixTransport.configure(coralogixConfig);
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
  logger.add(
    new CoralogixWinston.CoralogixTransport({
      category: 'Bot',
    }),
  );
}

module.exports = logger;
