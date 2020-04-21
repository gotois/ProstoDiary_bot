const AbstractGeo = require('../models/abstract/abstract-geo');
/**
 * @param {object} parameters - parameters
 * @returns {Promise<jsonldApiRequest>}
 */
module.exports = async function (parameters) {
  const locationGeo = new AbstractGeo({
    ...parameters,
  });
  await locationGeo.prepare();
  return locationGeo.context;
};
