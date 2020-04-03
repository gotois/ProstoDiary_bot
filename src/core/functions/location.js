const AbstractGeo = require('../models/abstracts/abstract-geo');
/**
 * @param {object} object - object
 * @param {number} object.latitude - latitude
 * @param {number} object.longitude - longitude
 * @returns {Promise<AbstractGeo>}
 */
module.exports = async function ({ latitude, longitude }) {
  const locationGeo = new AbstractGeo({ latitude, longitude });
  await locationGeo.prepare();
  return locationGeo;
};
