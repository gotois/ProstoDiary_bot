module.exports = (t) => {
  const databaseConfig = require('../../src/environment');
  t.is(typeof databaseConfig, 'object');
};
