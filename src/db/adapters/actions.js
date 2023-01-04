/**
 * @description API request
 * @typedef {object} jsonldAction
 * @property {string} '@id' - jsonld context
 * @property {object} '@context' - jsonld context
 * @property {object} '@type' - jsonld type
 * @property {string} name - name
 * @property {object} object - object
 * @property {object} agent - agent
 * @property {object} participant - participant
 * @property {string} startTime - startTime
 */

module.exports.AcceptAction = ({ result, agent, participant, mainEntity }) => {
  return {
    '@context': 'http://schema.org',
    '@type': 'AcceptAction',
    'agent': agent,
    'participant': participant,
    'mainEntity': mainEntity,
    'result': result,
  };
};

module.exports.AllocateAction = ({ result, agent, participant, mainEntity }) => {
  return {
    '@type': 'AllocateAction',
      'name': this.command,
      'result': {
        '@type': 'CreativeWork',
        'abstract': this.abstract,
        'encodingFormat': 'text/plain',
        'mainEntity': this.objectMainEntity,
      },
  }
};

module.exports.AssignAction = ({ agent, identifier, mainEntity }) => {
  // todo сейчас урл /telegram жестко вшит в express сервер, его нужно перенести инициализировав во время CLI
  // agent.url = `${SERVER.HOST}/${'telegram'}`;
  return {
    '@context': 'http://schema.org',
    '@type': 'AssignAction',
    'agent': agent,
    'identifier': identifier,
    'mainEntity': mainEntity,
  };
};


module.exports.AuthorizeAction = ({ agent, identifier, mainEntity }) => {
  return {
    '@context': 'http://schema.org',
    '@type': 'AuthorizeAction',
    'agent': agent,
    'identifier': identifier,
    'mainEntity': mainEntity,
  };
};


/**
 * @param {object} object - object
 * @param {string} [object.encodingFormat] - encoding
 * @param {Array} [object.mainEntity] - mainEntity
 * @param {object} object.agent - agent
 * @param {string} object.message - message
 * @returns {object}
 */
module.exports.RejectAction = ({
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