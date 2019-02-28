const { Client } = require('pg');
const {
  IS_PRODUCTION,
  user,
  password,
  host,
  port,
  database,
} = require('../env');
/**
 * @see path отличается одним символом @
 */
const client = (() => {
  if (IS_PRODUCTION) {
    return new Client(
      `postgres://${user}:${password}.${host}:${port}/${database}`,
    );
  } else {
    return new Client(
      `postgres://${user}:${password}@${host}:${port}/${database}`,
    );
  }
})();

module.exports = client;
