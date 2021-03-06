const schemaOrg = require('../../../lib/schema');
/**
 * @description На основе набора свойств пытаюсь насытить schema.org
 * @todo покрыть тестами и перенести в analyze
 * example:
 * myForm({
 * "availability": "http://schema.org/InStock",
 * 'priceCurrency': 'USD',
 * 'price': 900,
 * })
 * @param {object} parameters - Параметры полученные например от Diglogflow
 * @returns {object} - тип JSON-LD
 */
module.exports = (parameters) => {
  const type = schemaOrg.getType(parameters);
  return {
    '@type': type || 'Thing',
    ...parameters,
  };
};
