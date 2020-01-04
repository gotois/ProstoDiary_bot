const fs = require('fs');

module.exports = async (t) => {
  t.timeout(1500);
  // fixme использовать рандомный zip
  const { unpack } = require('../../src/services/archive.service');
  const fileZip = fs.readFileSync('tests/data/apple-health/export.zip');
  const mapBuffer = await unpack(fileZip);
  t.is(mapBuffer.size, 2);
  mapBuffer.forEach((value) => {
    t.true(Buffer.isBuffer(value));
  });
};
