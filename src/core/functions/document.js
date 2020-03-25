// todo на основе данных возвращать нужный тип абстрактов
const Abstract = require('../../models/abstract/abstract');
/**
 * @description работа с документами
 * @returns {Promise<Abstract>}
 */
module.exports = async function() {
  const abstractCommand = new Abstract();
  await abstractCommand.prepare();
  return abstractCommand;
};
