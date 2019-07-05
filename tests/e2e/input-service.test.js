module.exports = async (t) => {
  const { inputProcess } = require('../../src/services/input.service');
  const result = await inputProcess('привет мир');
  t.log(result);
};
