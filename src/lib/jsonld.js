// todo перенести в lib/jsonld.js
const jsonld = require('jsonld');
/**
 * @description сериализатор
 * @param {any} compacted - compacted
 * @returns {Promise<*>}
 */
const toRDF = async (compacted) => {
  const nquads = await jsonld.toRDF(compacted, {
    format: 'application/n-quads',
  });
  return nquads;
};
/**
 * @description Десериализатор
 * @param {*} nquads - nquads
 * @returns {Promise<*>}
 */
const fromRDF = async (nquads) => {
  const data = await jsonld.fromRDF(nquads, { format: 'application/n-quads' });
  return data;
};

module.exports = {
  toRDF,
  fromRDF,
};
