module.exports = (t) => {
  const { isJSONLD } = require('../../src/lib/jsonld');
  t.false(isJSONLD({}));
  // eslint-disable-next-line unicorn/no-useless-undefined
  t.false(isJSONLD(undefined));
  // eslint-disable-next-line unicorn/no-null
  t.false(isJSONLD(null));
  t.false(isJSONLD(''));
  t.false(isJSONLD([]));
  t.false(
    isJSONLD({
      '@id': 'something',
    }),
  );
  t.true(
    isJSONLD({
      '@context': 'http://schema.org',
      '@type': 'CreateAction',
      'agent': {
        '@type': 'Person',
        'name': 'John',
      },
      'result': {
        '@type': 'ExercisePlan',
        'name': 'Some plan',
      },
      'participant': {
        '@type': 'Person',
        'name': 'Steve',
      },
    }),
  );
};
