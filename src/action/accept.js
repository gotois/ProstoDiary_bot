// const { SERVER } = require('../../../environment');

module.exports = ({ result, agent, participant, mainEntity }) => {
  // todo сейчас урл /telegram жестко вшит в express сервер, его нужно перенести инициализировав во время CLI
  // agent.url = `${SERVER.HOST}/${'telegram'}`;
  return {
    '@context': 'http://schema.org',
    '@type': 'AcceptAction',
    'agent': agent,
    'participant': participant,
    'mainEntity': mainEntity,
    'result': result,
  };
};
