const fs = require('fs');

module.exports = async (t) => {
  const qr = require('../../src/services/qr.service');

  const buffer = fs.readFileSync('tests/data/photo/qr-example-1.jpg');
  const params = await qr.readQR(buffer);
  t.true(params.hasOwnProperty('fn'));
  t.true(params.hasOwnProperty('fp'));
  t.true(params.hasOwnProperty('i'));
  t.true(params.hasOwnProperty('n'));
  t.true(params.hasOwnProperty('s'));
  t.true(params.hasOwnProperty('t'));
  t.is(params.fn, '9286000100125664');
  t.is(params.t, '20181228T1319');

  const buffer2 = fs.readFileSync('tests/data/photo/qr-example-big-1.jpg');
  const params2 = await qr.readQR(buffer2);
  t.is(params2.t, '20181218T001000');
  t.is(params2.s, '430.26');
  t.is(params2.fn, '8710000101700889');
  t.is(params2.i, '236081');
  t.is(params2.fp, '3891955474');
  t.is(params2.n, '1');
};
