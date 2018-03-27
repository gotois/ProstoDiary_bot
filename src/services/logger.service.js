const winston = require('winston');
const CoralogixWinston = require('coralogix-logger-winston');
const {PRODUCTION_MODE} = require('./../config/constants.config');
const {NODE_ENV, CORALOGIX_WINSTON_PRIVATE_KEY, CORALOGIX_WINSTON_APPLICATION_NAME} = process.env;

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
  ],
  format: winston.format.combine(
    winston.format.colorize({all: true}),
    winston.format.simple(),
  ),
  exitOnError: false,
});

if (NODE_ENV === PRODUCTION_MODE) {
  const coralogixConfig = {
    privateKey: CORALOGIX_WINSTON_PRIVATE_KEY,
    applicationName: CORALOGIX_WINSTON_APPLICATION_NAME,
    subsystemName: 'ALL SUBSYSTEM',
  };
  CoralogixWinston.CoralogixTransport.configure(coralogixConfig);
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
  logger.add(new CoralogixWinston.CoralogixTransport({
    category: 'Bot'
  }));
}

module.exports = logger;
