const package_ = require('../../../package');
/**
 * @description Авторизация и разблокировка чтения/приема и общей работы бота
 * @param {object} requestObject - params
 * @returns {Promise<string>}
 */
module.exports = (requestObject) => {
  const { token } = requestObject;
  if (!token) {
    const document = {
      '@context': 'http://schema.org',
      '@type': 'RejectAction',
      'agent': {
        '@type': 'Person',
        'name': package_.name,
        'url': package_.homepage,
      },
      'object': {
        '@type': 'ExercisePlan',
        'name': 'xxxxxxx',
      },
      'purpose': {
        '@type': 'MedicalCondition',
        'text': 'Unknown token argument',
      },
    };
    return document;
  }

  const document = {
    '@context': 'http://schema.org',
    '@type': 'AllocateAction',
    'agent': {
      '@type': 'Person',
      'name': package_.name,
      'url': package_.homepage,
    },
    'name': 'SignIn',
    // todo добавить дату чтобы по ней делать асинхронные запросы двухфакторной аутентификации которые могут выполняться очень долго
    // 'startTime': date,
    'subjectOf': [
      {
        '@type': 'CreativeWork',
        'name': 'token',
        'abstract': token,
        'encodingFormat': 'text/plain',
      },
    ],
  };

  return document;
};
