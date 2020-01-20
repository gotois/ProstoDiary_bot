const jsonld = require('jsonld');
/**
 * @description сериализатор
 * @param {any} compacted - compacted
 * @returns {Promise<*>}
 */
const toRDF = async (compacted) => {
  if (!compacted) {
    throw new Error('Empty compacted');
  }
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

const canonize = async (document) => {
  const canonized = await jsonld.canonize(document, {
    algorithm: 'URDNA2015',
    format: 'application/n-quads',
  });
  return canonized;
};

module.exports = {
  toRDF,
  fromRDF,
  canonize,
};
