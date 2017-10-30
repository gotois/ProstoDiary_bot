module.exports = t => {
  const dbConfig = require('../src/config/database.config');
  t.is(typeof dbConfig, 'object');
};
