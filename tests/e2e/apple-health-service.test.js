module.exports = async (t) => {
  t.timeout(4000);
  const fs = require('fs');
  const {
    uploadAppleHealthData,
  } = require('../../src/services/apple-health.service');
  const fileZip = fs.readFileSync('tests/data/apple-health/export.zip');
  await uploadAppleHealthData(fileZip);
  t.pass();
};
