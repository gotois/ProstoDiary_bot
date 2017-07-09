const client = require('./database.client.js');
/**
 *
 * @param query {String}
 * @param params {Array|undefined}
 * @returns {Promise}
 */
module.exports = (query, params = []) => {
  return new Promise((resolve, reject) => {
    client.query(query, params, (error, result) => {
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
      resolve(result);
    });
  });
};
