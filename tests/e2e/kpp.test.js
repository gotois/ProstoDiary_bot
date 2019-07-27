const fs = require('fs');

module.exports = async (t) => {
  t.timeout(5000);
  const kppAPI = require('../../src/api/v1/kpp');
  {
    const qrImage = fs.readFileSync('tests/data/photo/qr-example-big-1.jpg');
    let kppServiceData = await kppAPI(qrImage);
    kppServiceData = JSON.parse(kppServiceData);
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
  {
    let kppServiceData = await kppAPI(
      't=20190708T1045&s=195.00&fn=8711000101658062&i=170428&fp=305056502&n=1',
    );
    kppServiceData = JSON.parse(kppServiceData);
    t.true(Array.isArray(kppServiceData.items));
  }
};
