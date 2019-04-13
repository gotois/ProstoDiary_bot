const weather = require('openweather-apis');
const { OPEN_WEATHER } = require('../env');
/**
 * @constant
 * @type {string}
 */
const LANG_RU = 'ru'; // TODO: брать из detect-language.service/
/**
 * @constant
 * @type {string}
 */
const UNITS = 'metric';

weather.setLang(LANG_RU);
weather.setUnits(UNITS);
weather.setAPPID(OPEN_WEATHER.OPEN_WEATHER_KEY);
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
 * @param {number} latitude - lat
 * @param {number} longitude - lng
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
  getWeather,
};
