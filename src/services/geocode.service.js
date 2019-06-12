const { get } = require('./request.service');
const { GOOGLE } = require('../env');
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
  const googleMapBuffer = await get(
    `https://${MAPS_HOST}/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE.GOOGLE_MAPS_GEOCODING_API}`,
  );
  const googleMapBufferData = googleMapBuffer.toString('utf8');
  const googleData = JSON.parse(googleMapBufferData);
  if (!googleData) {
    throw new Error('GEO: empty data');
  }
  if (googleData.error_message) {
    throw new Error(googleData.error_message);
  }
  if (!Array.isArray(googleData.results)) {
    throw new Error('GEO: no results');
  }
  return googleData.results;
};

module.exports = {
  getGeoCode,
};
