/**
 * @description Foursquare node.js API
 * @see https://ru.foursquare.com/oauth2/authenticate?client_id=CLIENT_ID&response_type=token&redirect_uri=REDIRECT_URI
 */
const request = require('request');
const { FOURSQUARE } = require('../environment');
const host = 'api.foursquare.com';
/**
 * @param {object} params - ll, query, limit, etc
 * @returns {Promise}
 */
const search = (params) => {
  return new Promise((resolve, reject) => {
    request(
      {
        url: `https://${host}/v2/venues/search`,
        method: 'GET',
        qs: {
          client_id: FOURSQUARE.CLIEND_ID,
          client_secret: FOURSQUARE.CLIENT_SECRET,
          ll: params.ll,
          near: params.near,
          query: params.query,
          intent: params.intent,
          radius: params.radius,
          sw: params.sw,
          ne: params.ne,
          v: '20150401',
          categoryId: params.categoryId,
          llAcc: params.llAcc,
          alt: params.alt,
          altAcc: params.altAcc,
          url: params.url,
          providerId: params.providerId,
          linkedId: params.linkedId,
          limit: params.limit || 1,
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
