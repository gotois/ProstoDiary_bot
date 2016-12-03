const client = require('./database.client');

module.exports = (query, params = []) => {
  return new Promise((resolve, reject) => {
    client.query(query, params, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};