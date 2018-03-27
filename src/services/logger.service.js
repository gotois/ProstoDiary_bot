const Logentries = require('le_node');
const winston = require('winston');
const {PRODUCTION_MODE} = require('./../config/constants.config');
const {NODE_ENV, LOGENTRIES_TOKEN} = process.env;

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
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
  if (LOGENTRIES_TOKEN) {
    Logentries.provisionWinston(winston);
    logger.add(winston.transports.Logentries, {
      token: LOGENTRIES_TOKEN,
      handleExceptions: true,
    });
  }
}

module.exports = logger;
