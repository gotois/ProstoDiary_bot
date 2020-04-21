const Abstract = require('../models/abstract');
/**
 * @description работа с документами
 * @param {*} parameters - object
 * @returns {Promise<object>}
 */
module.exports = async function (parameters) {
  // todo на основе данных возвращать нужный тип абстрактов вида: PdfAbstract
  //  добавить проверку на входящие параметры для этого
  // ...
  const abstractCommand = new Abstract({
    ...parameters,
  });
  await abstractCommand.prepare();
  return abstractCommand.context;
};
