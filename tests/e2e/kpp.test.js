const fs = require('fs');

module.exports = async (t) => {
  t.timeout(5000);
  const kppService = require('../../src/services/kpp.service');
  {
    const qrImage = fs.readFileSync('tests/data/photo/qr-example-big-1.jpg');
    const kppServiceData = await kppService(qrImage);
    t.true(typeof kppServiceData === 'object');
    t.is(kppServiceData.ecashTotalSum, 43026);
    t.is(kppServiceData.fiscalDriveNumber, '8710000101700889');
    t.is(kppServiceData.fiscalDocumentNumber, 236081);
    t.is(kppServiceData.fiscalSign, 3891955474);
    t.is(kppServiceData.operationType, 1);
    t.is(kppServiceData.dateTime, '2018-12-18T00:10:00');
    t.true(Array.isArray(kppServiceData.items));
    t.is(kppServiceData.items[0].price, 58858);
    t.is(kppServiceData.items[0].quantity, 0.254);
    t.is(kppServiceData.items[0].sum, 14950);
  }
};
