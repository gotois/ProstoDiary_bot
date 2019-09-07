const fs = require('fs');

module.exports = (t) => {
  const ofxTestData = fs.readFileSync('tests/data/tinkoff/example.ofx');
  const tinkoffService = require('../../src/services/tinkoff.service');
  tinkoffService.readOFX(ofxTestData);
  t.pass();
};
