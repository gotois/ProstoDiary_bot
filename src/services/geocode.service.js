const { get } = require('./request.service');
const { GOOGLE_MAPS_GEOCODING_API } = require('../env');
/**
 * @param {Object} obj - obj
 * @param {number} obj.latitude - latitude
 * @param {number} obj.longitude - longitude
 * @returns {Promise<Array<Object>|Error>}
 */
const getGeoCode = async ({ latitude, longitude }) => {
  const googleMapBuffer = await get(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_GEOCODING_API}`,
  );
  const googleMapBufferData = googleMapBuffer.toString('utf8');
  const googleData = JSON.parse(googleMapBufferData);
  if (googleData.error_message) {
    throw new Error(googleData.error_message);
  }
  return googleData;
};

module.exports = {
  getGeoCode,
};
