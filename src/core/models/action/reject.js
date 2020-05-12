/**
 * @param {object} object - object
 * @param {string} [object.encodingFormat] - encoding
 * @param {Array} [object.mainEntity] - mainEntity
 * @param {object} object.agent - agent
 * @param {string} object.message - message
 * @returns {object}
 */
module.exports = ({
  message,
  agent,
  mainEntity = [],
  encodingFormat = 'text/plain',
}) => {
  return {
    '@context': 'http://schema.org',
    '@type': 'RejectAction',
    'agent': agent,
    'purpose': {
      '@type': 'Answer',
      'abstract': message,
      'encodingFormat': encodingFormat,
    },
    'object': {
      mainEntity: mainEntity,
    },
  };
};
