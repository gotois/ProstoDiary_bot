const winston = require('winston');
const {PRODUCTION_MODE} = require('./../config/constants.config');
const {NODE_ENV} = process.env;

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  silly: 5
};

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
}

module.exports = logger;
