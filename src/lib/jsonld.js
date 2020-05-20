const jsonld = require('jsonld');
const validator = require('validator');
const schemaOrg = require('./schema');
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
/**
 * @param {object} [document] - jsonld
 * @returns {boolean}
 */
const isJSONLD = (document) => {
  if (!document) {
    return false;
  }
  let object;
  if (typeof document === 'object') {
    object = document;
  }
  if (typeof document === 'string') {
    if (validator.isJSON(document)) {
      object = JSON.parse(document);
    }
  }
  if (typeof object === 'object') {
    if (schemaOrg.getType(object) !== undefined) {
      return true;
    }
  }
  return false;
};

module.exports = {
  toRDF,
  fromRDF,
  canonize,
  isJSONLD,
};
