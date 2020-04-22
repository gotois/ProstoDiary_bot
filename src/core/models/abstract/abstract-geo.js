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
      '@type': 'Action',
      'name': this.#name,
      'result': {
        '@type': 'CreativeWork',
        'abstract': this.geoJSON.toString('base64'),
        'encodingFormat': 'application/vnd.geo+json',
        'mainEntity': this.objectMainEntity,
      },
      'object': this.object,
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
    this.object.push({
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
