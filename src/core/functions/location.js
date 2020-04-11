const AbstractGeo = require('../models/abstracts/abstract-geo');
/**
 * @param {object} parameters - parameters
 * @returns {Promise<AbstractGeo>}
 */
module.exports = async function (parameters) {
  const locationGeo = new AbstractGeo({
    ...parameters,
  });
  await locationGeo.prepare();
  return locationGeo;
};
