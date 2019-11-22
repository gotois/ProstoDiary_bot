const jsonld = require('jsonld');
/**
 * @param {object} document - doc
 * @param {object} context - context
 * @returns {Promise<*>}
 */
const compact = async (document, context) => {
  const compacted = await jsonld.compact(document, context);
  return compacted;
};
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
  compact,
  toRDF,
  fromRDF,
};
