module.exports = (abstract, encoding = 'text/plain') => {
  return {
    '@context': 'http://schema.org',
    '@type': 'AcceptAction',
    'purpose': {
      '@type': 'Answer',
      'abstract': abstract,
      'encodingFormat': encoding,
    },
  };
};
