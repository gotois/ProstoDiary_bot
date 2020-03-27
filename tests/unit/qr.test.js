const fs = require('fs');

module.exports = async (t) => {
  const { readQR } = require('../../src/lib/qr');
  const buffer = fs.readFileSync('tests/data/photo/qr-example-1.jpg');
  const qrString = await readQR(buffer);
  t.is(
    qrString,
    't=20181228T1319&s=299.90&fn=9286000100125664&i=967&fp=841348588&n=1',
  );
};
