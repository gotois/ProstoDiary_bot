const Abstract = require('../models/abstracts');
/**
 * @description работа с документами
 * @param {*} parameters - object
 * @returns {Promise<Abstract>}
 */
module.exports = async function (parameters) {
  // todo на основе данных возвращать нужный тип абстрактов вида: PdfAbstract
  const abstractCommand = new Abstract({
    ...parameters,
  });
  await abstractCommand.prepare();
  return abstractCommand;
};
