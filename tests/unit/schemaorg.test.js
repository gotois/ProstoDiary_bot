module.exports = (t) => {
  const schemaOrg = require('../../src/lib/schema');
  const placeGet = schemaOrg.get('Place');
  t.is(placeGet.label, 'Place');
};
