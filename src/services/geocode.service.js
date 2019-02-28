const logger = require('./logger.service');
const { get } = require('./request.service');
const { GOOGLE_MAPS_GEOCODING_API } = require('../env');
/**
 * @param {Object} obj - obj
 * @param {number} obj.latitude - latitude
 * @param {number} obj.longitude - longitude
 * @returns {Promise<Array<Object>|Error>}
 */
const getGeoCode = async ({ latitude, longitude }) => {
  try {
    const googleMapBuffer = await get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_GEOCODING_API}`,
    );
    const googleMapBufferData = googleMapBuffer.toString('utf8');
    return JSON.parse(googleMapBufferData);
  } catch (error) {
    logger.log('error', error.toString());
    throw new Error(error);
  }
};

module.exports = {
  getGeoCode,
};
