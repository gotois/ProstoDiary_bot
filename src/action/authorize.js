module.exports = ({ agent, identifier, mainEntity }) => {
  return {
    '@context': 'http://schema.org',
    '@type': 'AuthorizeAction',
    'agent': agent,
    'identifier': identifier,
    'mainEntity': mainEntity,
  };
};
