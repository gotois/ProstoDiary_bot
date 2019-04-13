module.exports = async (t) => {
  t.timeout(5000);
  const kpp = require('../../src/services/kpp.service');
  const fn = '9286000100125664';
  const i = '967';
  const fp = '841348588';
  const n = '1';
  const s = '299.90';
  await kpp.checkKPP({ fn, i, fp, n, t: '20181228T1319', s });
  const kppData = await kpp.getKPPData({ fn, i, fp });
  t.is(kppData.dateTime, '2018-12-28T13:19:00');
  t.true(Array.isArray(kppData.items));
  t.is(kppData.items[0].price, 14995);
  t.is(kppData.items[0].quantity, 1);
  t.is(kppData.items[0].sum, 14995);
  t.is(kppData.totalSum, 29990);
};
