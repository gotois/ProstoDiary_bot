const weather = require('../lib/weather');
const { get } = require('./request.service');
const { GOOGLE } = require('../environment');
/**
 * @constant
 * @type {string}
 */
const MAPS_HOST = 'maps.googleapis.com';
/**
 * @param {object} obj - obj
 * @param {number} obj.latitude - latitude
 * @param {number} obj.longitude - longitude
 * @returns {Promise<Array<object>|Error>}
 */
const getGeoCode = async ({ latitude, longitude }) => {
  const googleData = await get(`https://${MAPS_HOST}/maps/api/geocode/json`, {
    latlng: `${latitude},${longitude}`,
    key: GOOGLE.GOOGLE_MAPS_GEOCODING_API,
  });
  if (!googleData) {
    throw new Error('GEO: empty data');
  }
  if (googleData.error_message) {
    throw new Error(googleData.error_message);
  }
  if (!Array.isArray(googleData.results)) {
    throw new ReferenceError('GEO: no results');
  }
  return googleData.results;
};
/**
 * @constant
 * @type {string}
 */
const RESTCOUNTRIES_HOST = 'restcountries.eu';
/**
 * @param {string} name - text
 * @returns {Promise<Array<object>|Error>}
 */
const getFullName = async (name) => {
  const encodeName = encodeURI(name);
  const parsedRestCountries = await get(
    `https://${RESTCOUNTRIES_HOST}/rest/v2/name/${encodeName}`,
    {
      fullText: true,
    },
  );
  if (!Array.isArray(parsedRestCountries)) {
    throw new ReferenceError('GEO: country not found');
  }
  return parsedRestCountries;
};
/**
 * @param {weather} weather - openweather-apis instance
 * @returns {Promise<any>}
 */
const getSmartJSON = (weather) => {
  return new Promise((resolve, reject) => {
    weather.getSmartJSON((error, smart) => {
      if (error) {
        return reject(error);
      }
      return resolve(smart);
    });
  });
};
/**
 * @param {object} obj - obj
 * @param {number} obj.latitude - lat
 * @param {number} obj.longitude - lng
 * @returns {Promise<Error|{description: string, humidity: any, pressure: any, rain: any, temp: number, weathercode: number}>}
 */
const getWeather = async ({ latitude, longitude }) => {
  if (!latitude || !longitude) {
    throw new Error('latitude or longitude is invalid');
  }
  weather.setCoordinate(latitude, longitude);
  const weatherInfo = await getSmartJSON(weather);
  return weatherInfo;
};

module.exports = {
  getGeoCode,
  getFullName,
  getWeather,
};
