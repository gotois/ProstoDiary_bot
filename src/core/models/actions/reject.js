/**
 * @param {Error} error - error
 * @param {?string} [encoding] - encoding
 * @returns {{purpose: {'@type': string, encodingFormat: string, abstract: *}, '@type': string, '@context': string}}
 */
module.exports = (error, encoding = 'text/plain') => {
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
