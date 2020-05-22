const AbstractGeo = require('../models/abstract/abstract-geo');
const jsonldAction = require('../models/action/base');
/**
 * @param {object} parameters - parameters
 * @returns {Promise<jsonldAction>}
 */
module.exports = async function (parameters) {
  const locationGeo = new AbstractGeo({
    ...parameters,
  });
  await locationGeo.prepare();
  return locationGeo.context;
};
