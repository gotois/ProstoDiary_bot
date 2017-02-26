const client = require('./database.client');
/**
 *
 * @param query {String}
 * @param params {Array|undefined}
 * @returns {Promise}
 */
module.exports = (query, params = []) => {
  return new Promise((resolve, reject) => {
    client.query(query, params, (err, result) => {
      if (err) {
        return reject(err);
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
