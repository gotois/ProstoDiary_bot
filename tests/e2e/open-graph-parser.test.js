module.exports = async (t) => {
  t.timeout(5000);
  const ogParser = require('../../src/lib/og-parser');
  const { title, name, encodingFormat } = await ogParser('https://github.com');
  t.is(typeof title, 'string');
  t.is(typeof name, 'string');
  t.is(encodingFormat, 'text/html');
};
