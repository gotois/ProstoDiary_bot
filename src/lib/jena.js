const fetch = require('node-fetch');
const FormData = require('form-data');
const { JENA } = require('../environment');
/**
 * @param {string} query - sparql string
 * @returns {any}
 */
const query = async function (query) {
  const JENA_SERVER = JENA.URL + '/' + JENA.DATABASE.NAME + '/query';
  const body = 'query=' + encodeURIComponent(query);
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  };
  const result = await fetch(JENA_SERVER, {
    method: 'POST',
    body,
    headers,
  });
  return result.json();
};
/**
 * @description выгрузка документа на Jena server
 * @param {Buffer} jsonld - json-ld
 * @returns {Promise}
 */
const upload = async (jsonld) => {
  const form = new FormData();
  form.append('files', jsonld, 'id.jsonld');
  const url = `${JENA.URL}/${JENA.DATABASE.NAME}/data`;
  const headers = {
    ...form.getHeaders(),
    Accept: 'application/json, text/javascript, */*; q=0.01',
  };
  const fetching = await fetch(url, {
    method: 'POST',
    body: form,
    headers,
  });
  if (fetching.status >= 400) {
    return Promise.reject(fetching.statusText);
  }
  return Promise.resolve(fetching);
};

module.exports = {
  query,
  upload,
};
