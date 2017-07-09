const pg = require('pg');
const config = require('./../config/database.config.js');
const {PRODUCTION_MODE} = require('./../config/constants.config');
const {NODE_ENV} = process.env;

/**
 * @return pg.Client
 */
const client = (() => {
  // отличается одним символом @
  if (NODE_ENV === PRODUCTION_MODE) {
    return new pg.Client(`postgres://${config.user}:${config.password}.${config.host}:${config.port}/${config.database}`);
  } else {
    return new pg.Client(`postgres://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`);
  }
})();

module.exports = client;
