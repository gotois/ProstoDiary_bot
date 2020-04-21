module.exports = (t) => {
  const SchemaOrg = require('schema.org');
  const schemaOrg = new SchemaOrg();
  const placeGet = schemaOrg.get('Place');
  t.is(placeGet.label, 'Place');
};
