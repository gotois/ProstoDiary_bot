const fetch = require('node-fetch');
// const cheerio = require('cheerio');
const { isJSONLD } = require('../../../lib/jsonld');
/**
 * @description получаю ссылку, по ней нахожу JSON-LD и превращаю в RDF
 * @param {string} url - domain
 * @param {object} [auth] - auth
 * @returns {Promise<object>} - json-ld
 */
module.exports = async (url, auth) => {
  const headers = {};
  if (auth) {
    headers['Authorization'] =
      'Basic ' +
      Buffer.from(auth.user + ':' + auth.password).toString('base64');
  }
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  if (response.status >= 400) {
    throw new Error('crawler error');
  }
  switch (response.headers.get('content-type')) {
    case 'application/ld+json; charset=utf-8': {
      const resultObject = await response.json();
      if (!isJSONLD(resultObject)) {
        throw new Error('Not JSON-LD');
      }
      return resultObject;
    }
    default: {
      // todo здесь использовать cheerio для получения jsonld из html страницы
      // const $ = cheerio.load(html);
      // var xxx = $.root().html()
      break;
    }
  }
};
