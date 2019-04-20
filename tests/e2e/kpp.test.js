const fs = require('fs');

module.exports = async (t) => {
  t.timeout(5000);
  const kppService = require('../../src/services/kpp.service');
  {
    const fn = '9286000100125664';
    const i = '967';
    const fp = '841348588';
    const n = '1';
    const s = '299.90';
    const kppData = await kppService({ fn, i, fp, n, t: '20181228T1319', s });
    t.is(kppData.dateTime, '2018-12-28T13:19:00');
    t.true(Array.isArray(kppData.items));
    t.is(kppData.items[0].price, 14995);
    t.is(kppData.items[0].quantity, 1);
    t.is(kppData.items[0].sum, 14995);
    t.is(kppData.totalSum, 29990);
  }
  {
    const buffer = fs.readFileSync('tests/data/photo/qr-example-1.jpg');
    const params = await kppService(buffer);
    t.true(params.hasOwnProperty('fn'));
    t.true(params.hasOwnProperty('fp'));
    t.true(params.hasOwnProperty('i'));
    t.true(params.hasOwnProperty('n'));
    t.true(params.hasOwnProperty('s'));
    t.true(params.hasOwnProperty('t'));
    t.is(params.fn, '9286000100125664');
    t.is(params.t, '20181228T1319');
  }
  {
    const buffer2 = fs.readFileSync('tests/data/photo/qr-example-big-1.jpg');
    const params2 = await kppService(buffer2);
    t.is(params2.t, '20181218T001000');
    t.is(params2.s, '430.26');
    t.is(params2.fn, '8710000101700889');
    t.is(params2.i, '236081');
    t.is(params2.fp, '3891955474');
    t.is(params2.n, '1');
  }
};
