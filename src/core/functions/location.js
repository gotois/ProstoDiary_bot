const package_ = require('../../../package');
const AbstractGeo = require('../../models/abstract/abstract-geo');

module.exports = async function({ latitude, longitude }) {
  const locationGeo = new AbstractGeo({ latitude, longitude });
  const locationGeoJSON = await locationGeo.prepare();

  const document = {
    '@context': 'http://schema.org',
    '@type': 'AllocateAction',
    'agent': {
      '@type': 'Person',
      'name': package_.name,
      'url': package_.homepage,
    },
    'name': 'Location',
    'object': {
      '@type': 'CreativeWork',
      'name': 'location',
      'abstract': locationGeoJSON.geo.toString('base64'),
      'encodingFormat': 'application/vnd.geo+json',
    },
  };

  return document;
};
