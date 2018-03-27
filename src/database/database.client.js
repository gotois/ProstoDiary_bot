const pg = require('pg');
const {user, password, host, port, database} = require('./../config/database.config');
const {PRODUCTION_MODE} = require('./../config/constants.config');
const {NODE_ENV} = process.env;
/**
 * @return pg.Client
 * @see path отличается одним символом @
 */
const client = (() => {
  if (NODE_ENV === PRODUCTION_MODE) {
    return new pg.Client(`postgres://${user}:${password}.${host}:${port}/${database}`);
  } else {
    return new pg.Client(`postgres://${user}:${password}@${host}:${port}/${database}`);
  }
})();

module.exports = client;
