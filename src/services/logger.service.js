const winston = require('winston');
const CoralogixWinston = require('coralogix-logger-winston');
const {PRODUCTION_MODE} = require('./../config/constants.config');
const {NODE_ENV, CORALOGIX_WINSTON_PRIVATE_KEY, CORALOGIX_WINSTON_APPLICATION_NAME} = process.env;

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  silly: 5
};

// global configuration for coralogix
const coralogixConfig = {
  privateKey: CORALOGIX_WINSTON_PRIVATE_KEY,
  applicationName: CORALOGIX_WINSTON_APPLICATION_NAME,
  subsystemName: 'YOUR SUBSYSTEM',
};

CoralogixWinston.CoralogixTransport.configure(coralogixConfig);

const logger = winston.createLogger({
  level: 'info',
  levels: levels,
  transports: [
    new winston.transports.Console(),
  ],
  format: winston.format.combine(
    winston.format.colorize({all: true}),
    winston.format.simple(),
  )
});

if (NODE_ENV === PRODUCTION_MODE) {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
  logger.add(new CoralogixWinston.CoralogixTransport({
    category: 'YOUR CATEGORY'
  }));
}

module.exports = logger;
