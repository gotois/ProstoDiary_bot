const fs = require('fs');

module.exports = async (t) => {
  t.timeout(1000);
  const { unpack } = require('../../src/services/archive.service');
  const fileZip = fs.readFileSync('tests/data/apple-health/export.zip');
  const buffer = await unpack(fileZip);
  t.true(Buffer.isBuffer(buffer));
};
