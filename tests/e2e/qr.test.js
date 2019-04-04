const fs = require('fs');

module.exports = async (t) => {
  const qr = require('../../src/services/qr.service');
  const buffer = fs.readFileSync('tests/data/photo/qr-example-1.jpg');
  const qrResult = await qr.readQR(buffer);
  const params = qr.getParams(qrResult);
  t.true(params.hasOwnProperty('fn'));
  t.true(params.hasOwnProperty('fp'));
  t.true(params.hasOwnProperty('i'));
  t.true(params.hasOwnProperty('n'));
  t.true(params.hasOwnProperty('s'));
  t.true(params.hasOwnProperty('t'));
  t.is(params.fn, '9286000100125664');
  t.is(params.t, '20181228T1319');
};
