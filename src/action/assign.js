// const { SERVER } = require('../../../environment');

module.exports = ({ agent, identifier, mainEntity }) => {
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
