// todo на основе данных возвращать нужный тип абстрактов
const Abstract = require('../models/abstracts');
/**
 * @description работа с документами
 * @returns {Promise<Abstract>}
 */
module.exports = async function({ buffer, mimeType, date, telegram, silent }) {
  const abstractCommand = new Abstract({
    buffer,
    mimeType,
    date,
    telegram,
    silent,
  });
  await abstractCommand.prepare();
  return abstractCommand;
};
