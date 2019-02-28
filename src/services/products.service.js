const products = require('../../data/products.json');

/**
 * TODO: потом получать данные из БД
 *
 * @param {string} name - product name
 * @returns {Promise<Object|undefined>}
 */
const getProductInfo = (name) => {
  return products[name.toLowerCase()];
};

module.exports = {
  getProductInfo,
};
