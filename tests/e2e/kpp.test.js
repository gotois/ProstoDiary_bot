module.exports = async (t) => {
  t.timeout(5000);
  const kpp = require('../../src/services/kpp.service');
  const FN = '9286000100125664';
  const FD = '967';
  const FDP = '841348588';
  const TYPE = '1';
  const DATE = '20181228T1319';
  const SUM = '299.90';
  await kpp.checkKPP({ FN, FD, FDP, TYPE, DATE, SUM });
  const kppData = await kpp.getKPPData({ FN, FD, FDP });
  t.is(kppData.dateTime, '2018-12-28T13:19:00');
  t.true(Array.isArray(kppData.items));
  t.is(kppData.items[0].price, 14995);
  t.is(kppData.items[0].quantity, 1);
  t.is(kppData.items[0].sum, 14995);
  t.is(kppData.totalSum, 29990);
};
