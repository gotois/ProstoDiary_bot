const expressWinston = require('express-winston');
const winston = require('winston');

module.exports = expressWinston.logger({
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.simple(),
  ),
  transports: [new winston.transports.Console()],
});
