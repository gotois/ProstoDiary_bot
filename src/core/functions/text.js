const AbstractText = require('../models/abstracts/abstract-text');
const textService = require('../../services/text.service');
/**
 * @param {*} object - object
 * @returns {Promise<Abstract>}
 */
module.exports = async ({
  // hashtags, // todo поддержать на стороне JSONLD
  telegram,
  silent,
  text,
  auth,
  creator,
  publisher,
}) => {
  const abstractText = new AbstractText({
    silent,
    telegram,
    text: await textService.correctionText(text),
    auth,
    creator,
    publisher,
  });
  await abstractText.prepare();
  return abstractText;
};
