const Abstract = require('.');
const { getGeoCode } = require('../../../services/location.service');

class AbstractGeo extends Abstract {
  #latitude;
  #longitude;
  #name;
  /**
   * @param {object} data - data
   */
  constructor(data) {
    super(data);
    if (data.latitude && data.longitude) {
      this.#latitude = data.latitude;
      this.#longitude = data.longitude;
    } else {
      throw new TypeError('latitude or longitude not found');
    }
  }
  get geoJSON() {
    return JSON.stringify({
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': [
          this.#latitude,
          this.#longitude,
        ],
      },
      'properties': {
        'name': this.#name,
      },
    });
  }
  /**
   * @returns {jsonldApiRequest}
   */
  get context() {
    return {
      ...super.context,
      '@context': {
        schema: 'http://schema.org/',
        agent: 'schema:agent',
        name: 'schema:name',
        startTime: 'schema:startTime',
        object: 'schema:object',
        subjectOf: 'schema:subjectOf',
        abstract: 'schema:abstract',
        description: 'schema:description',
        encodingFormat: 'schema:encodingFormat',
        identifier: 'schema:identifier',
        provider: 'schema:provider',
        participant: 'schema:participant',
        value: 'schema:value',
        email: 'schema:email',
        geo: 'schema:geo',
        addressCountry: 'schema:Country',
        addressLocality: 'schema:Text',
        addressRegion: 'schema:Text',
        streetAddress: 'schema:Text',
        postalCode: 'schema:Text',
        address: 'schema:address',
        latitude: 'schema:latitude',
        longitude: 'schema:longitude',
        mainEntity: 'schema:mainEntity',
      },
      '@type': 'Action',
      'object': {
        '@type': 'CreativeWork',
        'name': 'Location',
        'abstract': this.geoJSON.toString('base64'),
        'encodingFormat': 'application/vnd.geo+json',
        'mainEntity': this.objectMainEntity,
      },
      'subjectOf': this.subjectOf,
    };
  }

  async prepare() {
    const [geocode] = await getGeoCode({
      latitude: this.#latitude,
      longitude: this.#longitude,
    });
    if (geocode) {
      const streetAddress = geocode.address_components.find(address => address.types.includes('route'));
      const postalCode = geocode.address_components.find(address => address.types.includes('postal_code'));
      const addressCountry = geocode.address_components.find(address => address.types.includes('country'));
      const addressLocality = geocode.address_components.find(address => address.types.includes('locality'));
      const addressRegion = geocode.address_components.find(address => address.types.includes('sublocality'));
      this.address = {
        '@type': 'PostalAddress',
        'addressCountry': addressCountry.short_name,
        'addressLocality': addressLocality.short_name,
        'addressRegion': addressRegion.short_name,
        'postalCode': postalCode.short_name,
        'streetAddress': streetAddress.short_name,
      };
      this.#name = geocode.formatted_address;
    }
    this.subjectOf.push({
      '@type': 'Place',
      'name': `${this.#latitude},${this.#longitude}`,
      'address': this.address,
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": this.#latitude,
        "longitude": this.#longitude,
      },
    })
  }
}

module.exports = AbstractGeo;
