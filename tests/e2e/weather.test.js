module.exports = async (t) => {
  t.timeout(3000);
  const weatherService = require('../../src/services/weather.service');
  const weatherInfo = await weatherService.getWeather({
    latitude: 50.0467656,
    longitude: 20.0048731,
  });
  t.true(typeof weatherInfo === 'object');
  t.true(weatherInfo.hasOwnProperty('description'));
  t.true(weatherInfo.hasOwnProperty('humidity'));
  t.true(weatherInfo.hasOwnProperty('pressure'));
  t.true(weatherInfo.hasOwnProperty('rain'));
  t.true(weatherInfo.hasOwnProperty('temp'));
  t.true(weatherInfo.hasOwnProperty('weathercode'));

  await t.throwsAsync(async () => {
    await weatherService.getWeather('wrong param');
  });
};
