const AbstractText = require('../models/abstracts/abstract-text');
const textService = require('../../services/text.service');
/**
 * @param {object} parameters - object
 * @returns {Promise<AbstractText>}
 */
module.exports = async (parameters) => {
  const abstractText = new AbstractText({
    ...parameters,
    text: await textService.correctionText(parameters.text),
  });
  await abstractText.prepare();
  return abstractText;
};
