/**
 * @description Foursquare node.js API
 * @see https://ru.foursquare.com/oauth2/authenticate?client_id=CLIENT_ID&response_type=token&redirect_uri=REDIRECT_URI
 */
const request = require('request');
const { FOURSQUARE } = require('../environment');
const FOURSQUARE_HOST = 'api.foursquare.com';
/**
 * @param {object} parameters - params
 * @param {object} parameters.ll - ll
 * @param {?object} [parameters.query] - query
 * @param {object} parameters.limit - limit
 * @returns {Promise}
 */
const search = (parameters) => {
  return new Promise((resolve, reject) => {
    request(
      {
        url: `https://${FOURSQUARE_HOST}/v2/venues/search`,
        method: 'GET',
        qs: {
          client_id: FOURSQUARE.CLIEND_ID,
          client_secret: FOURSQUARE.CLIENT_SECRET,
          ll: parameters.ll,
          near: parameters.near,
          query: parameters.query,
          intent: parameters.intent,
          radius: parameters.radius,
          sw: parameters.sw,
          ne: parameters.ne,
          v: '20150401',
          categoryId: parameters.categoryId,
          llAcc: parameters.llAcc,// eslint-disable-line
          altAcc: parameters.altAcc,// eslint-disable-line
          alt: parameters.alt,
          url: parameters.url,
          providerId: parameters.providerId,
          linkedId: parameters.linkedId,
          limit: parameters.limit || 1,
        },
      },
      (error, response, body) => {
        if (error) {
          return reject(error);
        } else if (response.statusCode >= 400) {
          return reject(response.statusMessage);
        }
        const bodyResult = JSON.parse(body);
        return resolve(bodyResult.response);
      },
    );
  });
};

module.exports = {
  search,
};
