const RejectAction = (error, encoding = 'text/plain') => {
  return {
    '@context': 'http://schema.org',
    '@type': 'RejectAction',
    'purpose': {
      '@type': 'Answer',
      'abstract': error.message,
      'encodingFormat': encoding,
    },
  };
};
module.exports = RejectAction;
