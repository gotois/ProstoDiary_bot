/**
 * @param {object} t - test
 */
module.exports = (t) => {
  const environmentHelpers = require('../../src/helpers/environments');
  const result = environmentHelpers.convertEnvironmentObjectToString({
    string: 'bar',
    object: { value: 42 },
  });
  t.is(typeof result, 'string');
  t.true(result.length > 0);
};
