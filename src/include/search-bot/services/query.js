const fetch = require('node-fetch');
const { JENA } = require('../../../environment');

const JENA_SERVER = JENA.URL + '/' + JENA.DATABASE.NAME + '/query';
/**
 * @param {string} query - sparql string
 * @returns {any}
 */
module.exports = async function (query) {
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
