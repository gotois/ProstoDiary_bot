const fs = require('fs');

module.exports = async (t) => {
  const qr = require('../../src/services/qr.service');

  const buffer = fs.readFileSync('tests/data/photo/qr-example-1.jpg');
  const qrResult1 = await qr.readQR(buffer);
  const params = qr.getParams(qrResult1);
  t.true(params.hasOwnProperty('fn'));
  t.true(params.hasOwnProperty('fp'));
  t.true(params.hasOwnProperty('i'));
  t.true(params.hasOwnProperty('n'));
  t.true(params.hasOwnProperty('s'));
  t.true(params.hasOwnProperty('t'));
  t.is(params.fn, '9286000100125664');
  t.is(params.t, '20181228T1319');

  const buffer2 = fs.readFileSync('tests/data/photo/qr-example-big-1.jpg');
  const qrResult2 = await qr.readQR(buffer2);
  t.is(
    qrResult2,
    't=20181218T001000&s=430.26&fn=8710000101700889&i=236081&fp=3891955474&n=1',
  );
};
