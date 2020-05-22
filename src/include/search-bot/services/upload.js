const fetch = require('node-fetch');
const FormData = require('form-data');
const { JENA } = require('../../../environment');
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

module.exports = upload;
