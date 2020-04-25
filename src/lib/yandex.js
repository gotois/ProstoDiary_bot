const { get } = require('../services/request.service');
/**
 * @see https://yandex.ru/dev/passport/doc/dg/tasks/algorithm-docpage/
 * @param {object} response - grant response
 * @param {string} response.access_token - yandex access token
 * @param {object} response.raw - yandex raw response
 * @returns {Promise<string|Buffer|Error|*>}
 */
module.exports = async ({ access_token }) => {
  const HOST = 'login.yandex.ru';
  const response = await get(
    `https://${HOST}/info`,
    {
      format: 'json',
    },
    {
      Authorization: `OAuth ${access_token}`,
    },
    'utf8',
  );
  return response;
};
