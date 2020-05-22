const package_ = require('../../../package.json');
const jsonldAction = require('../models/action/base');
/**
 * @todo использовать враппер
 * @description edit
 * @param {object} requestObject - requestObject
 * @returns {Promise<jsonldAction>}
 */
module.exports = (requestObject) => {
  const { text, date, telegram_message_id, telegram_user_id } = requestObject;

  const document = {
    '@context': 'http://schema.org',
    '@type': 'AllocateAction',
    'agent': {
      '@type': 'Person',
      'name': package_.name,
      'url': package_.homepage,
    },
    'name': 'EditMessage',
    'subjectOf': [
      {
        '@type': 'CreativeWork',
        'name': telegram_message_id,
        'dateModified': date,
        'abstract': text,
        'encodingFormat': 'text/plain',
        'creator': {
          '@type': 'Person',
          'knows': {
            '@type': 'Person',
            'name': telegram_user_id,
          },
        },
      },
    ],
  };

  return document;
};
