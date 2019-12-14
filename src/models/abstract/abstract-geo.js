const Abstract = require('../abstract/index');
const foursquare = require('../../lib/foursquare');
const { getFullName, getGeoCode } = require('../../services/location.service');

/**
 * @param {Array} parsedData - geocode parsed data
 * @returns {Error|string}
 */
const getLocShortName = (parsedData) => {
  const resultLength = parsedData.length;
  if (!resultLength) {
    throw new Error('No results');
  }
  return parsedData[resultLength - 1].address_components[0].short_name;
};

class AbstractGeo extends Abstract {
  #latlng;
  #near;
  #name;
  /**
   * @param {object} search - latlng
   */
  constructor(search) {
    super();
    if (search.latitude && search.longitude) {
      this.#latlng = {
        latitude: search.latitude,
        longitude: search.longitude,
      };
    } else {
      this.#near = search.near;
    }
  }

  get context() {
    return {
      ...super.context,
      geocode: this.geocode,
      currencies: this.currencies,
      geo: {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            this.#latlng.latitude,
            this.#latlng.longitude,
          ]
        },
        "properties": {
          "name": this.#name,
        }
      },
    };
  }

  async prepare() {
    let ll;
    if (this.#latlng) {
      ll = `${this.#latlng.latitude},${this.#latlng.longitude}`;
    }
    this.fqData = await foursquare.search({
      ll,
      near: this.#near,
      limit: 1,
    });
    if (Array.isArray(this.fqData.venues)) {
      this.#latlng = {
        latitude: this.fqData.venues[0].location.lat,
        longitude: this.fqData.venues[0].location.lng,
      };
      this.#name = this.fqData.venues[0].name;
    } else {
      this.#name = this.fqData.geocode.feature.name;
    }

    this.geocode = await getGeoCode(this.#latlng);
    // todo похоже на костыль
    // const locShortName = getLocShortName(this.geocode[0]);
    // this.currencies = await getFullName(locShortName);
  }
}

module.exports = AbstractGeo;
