// modified https://github.com/OverFlow636/fatsecret ver. 1.0.2
// docs - https://platform.fatsecret.com/api/Default.aspx?screen=rapih
const crypto = require('crypto');
const request = require('request');
const {
  FAT_SECRET_API_ACCESS_KEY,
  FAT_SECRET_API_SHARED_SECRET,
} = require('../env');
const API_BASE = 'https://platform.fatsecret.com/rest/server.api';

class FatSecret {
  constructor() {
    if (!FAT_SECRET_API_ACCESS_KEY || !FAT_SECRET_API_SHARED_SECRET) {
      throw new Error('FAT_SECRET ENV not found');
    }
  }
  /**
   * Perform the request to fatsecret with default params merged in.
   *
   * @param {Object} params - параметры
   * @returns {Promise}
   * @public
   */
  request(params) {
    return new Promise((resolve, reject) => {
      request(
        {
          uri: this._signRequest(params),
          json: true,
        },
        (error, response, body) => {
          if (error) {
            reject(error);
          } else {
            resolve(body);
          }
        },
      );
    });
  }
  /**
   * Calculates and appends the signature hash to the query params
   *
   * @param {Object} params - параметры
   * @returns {string}
   * @private
   */
  _signRequest(params) {
    params['format'] = 'json';
    params['oauth_version'] = '1.0';
    params['oauth_signature_method'] = 'HMAC-SHA1';
    params['oauth_nonce'] = crypto.randomBytes(10).toString('HEX');
    params['oauth_timestamp'] = Math.floor(new Date().getTime() / 1000);
    params['oauth_consumer_key'] = FAT_SECRET_API_ACCESS_KEY;
    const query = ((str = '') => {
      // build the sorted key value pair string that will be used for the hmac and request
      Object.keys(params)
        .sort()
        .forEach((param) => {
          str += '&' + param + '=' + encodeURIComponent(params[param]);
        });
      return str.substr(1); // remove first &
    })();
    // generate the hmac
    const mac = crypto.createHmac('sha1', FAT_SECRET_API_SHARED_SECRET + '&');
    mac.update(
      'GET&' + encodeURIComponent(API_BASE) + '&' + encodeURIComponent(query),
    );
    // add the generated signature to the request params and return it
    return `${API_BASE}?${query}&oauth_signature=${encodeURIComponent(
      mac.digest('base64'),
    )}`;
  }
}

const fatSecret = new FatSecret();

module.exports = {
  get(foodId) {
    return fatSecret.request({
      method: 'food.get',
      food_id: foodId,
    });
  },
  search(searchExpression = '', maxResults = 1) {
    return fatSecret.request({
      method: 'foods.search',
      search_expression: searchExpression,
      max_results: maxResults,
    });
  },
};
