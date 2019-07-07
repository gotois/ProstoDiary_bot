module.exports = async (t) => {
  t.timeout(4000);
  const fs = require('fs');
  const { uploadAppleHealth } = require('../services/apple-health.service');
  const fileZip = fs.readFileSync('tests/data/apple-health/export.zip');
  await uploadAppleHealth(fileZip);
  t.todo('check db');
};
