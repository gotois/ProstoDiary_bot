module.exports = ({ result, agent, participant, mainEntity }) => {
  return {
    '@context': 'http://schema.org',
    '@type': 'AcceptAction',
    'agent': agent,
    'participant': participant,
    'mainEntity': mainEntity,
    'result': result,
  };
};
