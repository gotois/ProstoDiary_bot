const Abstract = require('../models/abstract');
/**
 * @description работа с документами
 * @param {*} parameters - object
 * @returns {Promise<jsonldApiRequest|Error>}
 */
module.exports = async function (parameters) {
  const AnyAbstract = await Abstract.getAbstractFromDocument(
    parameters.buffer,
    parameters.filename,
  );
  const anyAbstract = new AnyAbstract(parameters);
  await anyAbstract.prepare();
  return anyAbstract.context;
};
