// modified https://github.com/OverFlow636/fatsecret ver. 1.0.2
// docs - https://platform.fatsecret.com/api/Default.aspx?screen=rapih
const crypto = require('crypto');
const request = require('request');
const { FAT_SECRET } = require('../env');
const API_BASE = 'https://platform.fatsecret.com/rest/server.api';
const { detectLang, languages } = require('./detect-language.service');
const translateService = require('./translate.service');

class FatSecret {
  constructor() {
    if (
      !FAT_SECRET.FAT_SECRET_API_ACCESS_KEY ||
      !FAT_SECRET.FAT_SECRET_API_SHARED_SECRET
    ) {
      throw new Error('FAT_SECRET ENV not found');
    }
  }
  /**
   * build the sorted key value pair string that will be used for the hmac and request
   *
   * @param {object} params - params
   * @returns {string}
   */
  static createQuery(params) {
    params['format'] = 'json';
    params['oauth_version'] = '1.0';
    params['oauth_signature_method'] = 'HMAC-SHA1';
    params['oauth_nonce'] = crypto.randomBytes(10).toString('HEX');
    params['oauth_timestamp'] = Math.floor(new Date().getTime() / 1000);
    params['oauth_consumer_key'] = FAT_SECRET.FAT_SECRET_API_ACCESS_KEY;
    return Object.keys(params)
      .sort()
      .reduce((acc, param) => {
        acc += '&' + param + '=' + encodeURIComponent(params[param]);
        return acc;
      }, '')
      .substr(1); // remove first &
  }
  /**
   * Perform the request to fatsecret with default params merged in.
   *
   * @param {object} params - параметры
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
            return reject(error);
          }
          return resolve(body);
        },
      );
    });
  }
  /**
   * Calculates and appends the signature hash to the query params
   *
   * @param {object} params - параметры
   * @returns {string}
   * @private
   */
  _signRequest(params) {
    const query = FatSecret.createQuery(params);
    // generate the hmac
    const mac = crypto.createHmac(
      'sha1',
      FAT_SECRET.FAT_SECRET_API_SHARED_SECRET + '&',
    );
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

/**
 * @param {string} searchExpression - food name
 * @param {number} maxResults - max results
 * @returns {Promise<Array<{food_name: string}>>}
 */
const search = async (searchExpression = '', maxResults = 1) => {
  if (maxResults > 50) {
    maxResults = 50;
  }
  searchExpression = searchExpression.trim();
  // TODO: сначала использовать возможности БД foods
  // ...
  // FatSecret не поддерживает русский язык - переводим в английский
  if (detectLang(searchExpression) !== languages.ENG) {
    searchExpression = await translateService.translate(
      searchExpression,
      languages.ENG,
    );
  }
  const result = await fatSecret.request({
    method: 'foods.search',
    search_expression: searchExpression,
    max_results: maxResults,
  });
  if (!result.foods || !result.foods.food) {
    throw new Error('Food: not found');
  }
  return result.foods.food;
};

module.exports = {
  /**
   * @deprecated ?
   * @param {*} foodId - food id
   * @returns {Promise.food<any>}
   */
  get(foodId) {
    const { food } = fatSecret.request({
      method: 'food.get',
      food_id: foodId,
    });
    return food;
  },
  search,
};
