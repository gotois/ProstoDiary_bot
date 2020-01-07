const Abstract = require('../abstract/index');
const { getWeather } = require('../../services/location.service');

class AbstractWeather extends Abstract {
  #latlng;
  /**
   * @param {object} latlng - latlng
   */
  constructor(latlng) {
    super();
    this.#latlng = latlng;
  }

  // todo взять какой-нибудь стандарт выдачи погоды
  get context() {
    return {
      ...super.context,
      temperature: '...',
      description: this.weatherInfo.description,
    };
  }

  async prepare() {
    this.weatherInfo = await getWeather(this.#latlng);
  }
}

module.exports = AbstractWeather;
