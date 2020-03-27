module.exports = async (t) => {
  t.timeout(4000);
  const {
    getFullName,
    getWeather,
  } = require('../../src/services/location.service');
  const parsedRestCountries = await getFullName('aruba');
  t.true(Array.isArray(parsedRestCountries));

  const weatherInfo = await getWeather({
    latitude: 50.0467656,
    longitude: 20.0048731,
  });
  t.true(typeof weatherInfo === 'object');
  t.true(Object.prototype.hasOwnProperty.call(weatherInfo, 'description'));
  t.true(Object.prototype.hasOwnProperty.call(weatherInfo, 'humidity'));
  t.true(Object.prototype.hasOwnProperty.call(weatherInfo, 'pressure'));
  t.true(Object.prototype.hasOwnProperty.call(weatherInfo, 'rain'));
  t.true(Object.prototype.hasOwnProperty.call(weatherInfo, 'temp'));
  t.true(Object.prototype.hasOwnProperty.call(weatherInfo, 'weathercode'));

  await t.throwsAsync(async () => {
    await getWeather('wrong param');
  });
};
