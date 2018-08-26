const products = require('../../data/products.json');

/**
 * TODO: потом получать данные из БД
 * @param name {string}
 * @return {Promise<Object|undefined>}
 */
const getProductInfo = async (name) => {
  return products[name.toLowerCase()];
};

module.exports = {
  getProductInfo,
};
