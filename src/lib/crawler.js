const fetch = require('node-fetch');
const jsonld = require('jsonld');
const { isJSONLD } = require('./jsonld');

async function setUrls(document) {
  const flattened = await jsonld.flatten(document);
  return flattened
    .filter((rdf) => {
      return rdf['http://schema.org/url'] !== undefined;
    })
    .map((rdf) => {
      return rdf['http://schema.org/url'][0]['@id'];
    });
}
/**
 * @param {string} url - domain
 * @param {object} [headers] - headers
 * @returns {Promise<object>} - json-ld
 */
const sniff = async (url, headers) => {
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
/**
 * @description Getting JSON-LD from Link
 * @param {object} object - object
 * @param {string} object.url - link
 * @param {object} [object.auth] - auth
 * @returns {Promise<object>} - json-ld
 */
module.exports = async ({ url, auth }) => {
  const headers = {};
  if (auth) {
    headers['Authorization'] =
      'Basic ' +
      Buffer.from(auth.user + ':' + auth.password).toString('base64');
  }

  const jsonld = await sniff(url, headers);
  const urls = await setUrls(jsonld);
  const documentMap = new Map();

  documentMap.set(url, { jsonld, urls });

  return documentMap;
};
