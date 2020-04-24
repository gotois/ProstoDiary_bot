module.exports = (t) => {
  const { isJSONLD } = require('../../src/lib/jsonld');
  t.false(isJSONLD({}));
  t.false(isJSONLD(undefined));
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
