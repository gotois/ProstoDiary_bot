const weather = require('openweather-apis');
const { OPEN_WEATHER_KEY } = require('../env');

const LANG_RU = 'ru'; // TODO: брать из настроек env или telegram
const UNITS = 'metric';

weather.setLang(LANG_RU);
weather.setUnits(UNITS);
weather.setAPPID(OPEN_WEATHER_KEY);

const getSmartJSON = (weather) => {
  return new Promise((resolve, reject) => {
    weather.getSmartJSON((err, smart) => {
      if (err) {
        return reject(err);
      }
      resolve(smart);
    });
  });
};

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
