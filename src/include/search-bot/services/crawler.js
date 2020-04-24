const fetch = require('node-fetch');
const FormData = require('form-data');
// const cheerio = require('cheerio');
const { isJSONLD } = require('../../../lib/jsonld');
const { JENA } = require('../../../environment');
/**
 * @param {object} jsonld - json-ld
 * @returns {*|Promise}
 */
function upload(jsonld) {
  const form = new FormData();
  form.append('files', jsonld, 'someFileName.rdf');
  return fetch(`${JENA.URL}/${JENA.DATABASE.NAME}/data`, {
    method: 'POST',
    body: form,
    headers: form.getHeaders(),
  });
}
/**
 * @description получаю ссылку, по ней нахожу JSON-LD и превращаю в RDF
 * @param {string} url - domain
 * @param {object} [auth] - auth
 * @returns {Promise<*>}
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
      const json = await response.json();
      if (!isJSONLD(json)) {
        throw new Error('Not JSON-LD');
      }
      const result = await upload(Buffer.from(JSON.stringify(json)));
      return result;
    }
    default: {
      // todo здесь использовать cheerio для получения jsonld
      // const $ = cheerio.load(html);
      // var xxx = $.root().html()
      break;
    }
  }
};
