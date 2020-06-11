module.exports = async (t) => {
  t.timeout(1500);
  const { unpack, pack } = require('../../src/lib/archiver');
  const testPack = await pack([
    {
      buffer: Buffer.from('test', 'utf8'),
      filename: 'test.txt',
    },
  ]);
  const maptestUnpackBuffer = await unpack(testPack);
  t.is(maptestUnpackBuffer.size, 1);
  maptestUnpackBuffer.forEach((value) => {
    t.true(Buffer.isBuffer(value));
    t.is(value.toString('utf8'), 'test');
  });
  const testPackBase64 = testPack.toString('base64');
  const testUnpackFromBase64 = Buffer.from(testPackBase64, 'base64');
  const maptestUnpackBufferFromBase64 = await unpack(testUnpackFromBase64);
  t.is(maptestUnpackBufferFromBase64.size, 1);
};
