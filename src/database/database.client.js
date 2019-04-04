const { Client } = require('pg');
const { IS_PRODUCTION, DATABASE } = require('../env');
/**
 * @see path отличается одним символом @
 */
const dbClient = (() => {
  if (IS_PRODUCTION) {
    return new Client(
      `postgres://${DATABASE.dbUser}:${DATABASE.password}.${DATABASE.dbHost}:${
        DATABASE.dbPort
      }/${DATABASE.dbName}`,
    );
  } else {
    return new Client(
      `postgres://${DATABASE.dbUser}:${DATABASE.password}@${DATABASE.dbHost}:${
        DATABASE.dbPort
      }/${DATABASE.dbName}`,
    );
  }
})();

module.exports = dbClient;
