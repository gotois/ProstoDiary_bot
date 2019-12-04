const fs = require('fs');

module.exports = async (t) => {
  t.timeout(4000);
  const fileZip = fs.readFileSync('tests/data/apple-health/export.zip');
  // todo ...
  t.pass();
};
