module.exports = (t) => {
  const { isJSONLD } = require('../../src/lib/jsonld');
  t.false(isJSONLD({}));
  t.false(isJSONLD(undefined));
  t.false(isJSONLD(null));
  t.false(isJSONLD(''));
  t.false(isJSONLD([]));
  t.true(
    isJSONLD({
      '@id': 'something',
    }),
  );
};
