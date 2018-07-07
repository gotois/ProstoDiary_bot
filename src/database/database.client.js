const pg = require('pg');
const {IS_PRODUCTION, user, password, host, port, database} = require('../env');
/**
 * @return pg.Client
 * @see path отличается одним символом @
 */
const client = (() => {
  if (IS_PRODUCTION) {
    return new pg.Client(`postgres://${user}:${password}.${host}:${port}/${database}`);
  } else {
    return new pg.Client(`postgres://${user}:${password}@${host}:${port}/${database}`);
  }
})();

module.exports = client;
