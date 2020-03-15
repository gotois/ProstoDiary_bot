const rpc = require('../lib/rpc');
const AbstractGeo = require('../../models/abstract/abstract-geo');
/**
 * @param {object} object - object
 * @param {number} object.latitude - latitude
 * @param {number} object.longitude - longitude
 * @param {*} object.jwt - jwt
 * @param {*} object.auth - basic auth
 * @returns {Promise<*>}
 */
module.exports = async function({ latitude, longitude, jwt, auth }) {
  const locationGeo = new AbstractGeo({ latitude, longitude });
  await locationGeo.prepare();
  const jsonldMessage = await rpc({
    body: {
      jsonrpc: '2.0',
      method: 'insert',
      id: 1,
      params: locationGeo.context,
    },
    jwt,
    auth,
  });
  return jsonldMessage;
};
