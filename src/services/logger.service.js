require('le_node');
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
  )
});

if (NODE_ENV === PRODUCTION_MODE) {
  winston.add(winston.transports.Logentries, { token: LOGENTRIES_TOKEN });
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
