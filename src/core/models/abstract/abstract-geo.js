const Abstract = require('.');
const geoAnalyze = require('../analyze/geo-analyze');
const jsonldAction = require('../action/base');

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
  set name(name) {
    this.#name = name;
  }
  get latlng() {
    return {
      latitude: this.#latitude,
      longitude: this.#longitude,
    };
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
   * @returns {jsonldAction}
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
    await geoAnalyze(this);
  }
}

module.exports = AbstractGeo;
