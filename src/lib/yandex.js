const { get } = require('./request');
/**
 * @see https://yandex.ru/dev/passport/doc/dg/tasks/algorithm-docpage/
 * @param {object} response - grant response
 * @param {string} response.access_token - yandex access token
 * @returns {Promise<string|Buffer|Error|*>}
 */
module.exports = ({ access_token }) => {
  const HOST = 'login.yandex.ru';
  return get(
    `https://${HOST}/info`,
    {
      format: 'json',
    },
    {
      Authorization: `OAuth ${access_token}`,
    },
    'utf8',
  );
};
