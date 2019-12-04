const weather = require('openweather-apis');
const { OPEN_WEATHER } = require('../environment');
/**
 * @constant
 * @type {string}
 */
const LANG_RU = 'ru';
/**
 * @constant
 * @type {string}
 */
const UNITS = 'metric';

weather.setLang(LANG_RU);
weather.setUnits(UNITS);
weather.setAPPID(OPEN_WEATHER.OPEN_WEATHER_KEY);

module.exports = weather;
