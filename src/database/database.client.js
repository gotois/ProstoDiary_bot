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
  }
  return new Client(
    `postgres://${DATABASE.dbUser}:${DATABASE.password}@${DATABASE.dbHost}:${
      DATABASE.dbPort
    }/${DATABASE.dbName}`,
  );
})();
/**
 * @param {string} query - query
 * @param {Array|undefined} params - params
 * @returns {Promise}
 */
const $$ = (query, params = []) => {
  return new Promise((resolve, reject) => {
    if (!dbClient._connected) {
      return reject('Database not connected!');
    }
    dbClient.query(query, params, (error, result) => {
      if (error) {
        return reject(error);
      }
      // Check available updating
      switch (result.command) {
        case 'UPDATE': {
          if (!result.rowCount) {
            return reject('Update error');
          }
          break;
        }
      }
      return resolve(result);
    });
  });
};

module.exports = {
  dbClient,
  $$,
};
