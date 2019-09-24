const Abstract = require('./');
const foursquare = require('../../services/foursquare.service');

class AbstractGeo extends Abstract {
  #place = []; // {geoJSON} - место где была сделана запись. // todo rename location
  
  async fill () {
    // насыщаем foursquare
    try {
      // todo: entities - смотри abstract-text
      for (let entity of this.#entities) {
        if (entity.type === 'LOCATION') {
          const data = await foursquare.search({
            near: entity.name,
            limit: 1,
          });
          this.#place.push({
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [data.geocode.feature.geometry.center.lat, data.geocode.feature.geometry.center.lng]
            },
            "properties": {
              "name": data.geocode.feature.name
            }
          });
        }
      }
    } catch (error) {
      logger.error(error.message);
    }
  }
}

module.exports = AbstractGeo;
