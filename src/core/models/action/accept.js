module.exports = ({ abstract, url, text, encodingFormat = 'text/plain' }) => {
  return {
    '@context': 'http://schema.org',
    '@type': 'AcceptAction',
    'purpose': {
      '@type': 'Answer',
      'abstract': abstract,
      'encodingFormat': encodingFormat,
      'text': text,
      'url': url,
    },
  };
};
