const fs = require('fs');
const jsonrpc = require('jsonrpc-lite');

module.exports = async (t) => {
  t.timeout(5000);
  const APIv2KPP = require('../../src/api/v2/kpp');
  {
    const qrImage = fs.readFileSync('tests/data/photo/qr-example-big-1.jpg');
    const { error, result } = await APIv2KPP(
      jsonrpc.request('123', 'kpp', {
        buffer: qrImage,
        mime: 'image/jpeg',
      }),
    );
    t.true(!error);
    t.true(typeof result === 'object');
    t.is(result.ecashTotalSum, 43026);
    t.is(result.fiscalDriveNumber, '8710000101700889');
    t.is(result.fiscalDocumentNumber, 236081);
    t.is(result.fiscalSign, 3891955474);
    t.is(result.operationType, 1);
    t.is(result.dateTime, '2018-12-18T00:10:00');
    t.true(Array.isArray(result.items));
    t.is(result.items[0].price, 58858);
    t.is(result.items[0].quantity, 0.254);
    t.is(result.items[0].sum, 14950);
  }
  {
    const { error, result } = await APIv2KPP(
      't=20190708T1045&s=195.00&fn=8711000101658062&i=170428&fp=305056502&n=1',
    );
    t.true(!error);
    t.true(Array.isArray(result.items));
  }
};
