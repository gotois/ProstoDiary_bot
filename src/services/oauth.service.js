const { get } = require('../services/request.service');
/**
 * https://yandex.ru/dev/passport/doc/dg/tasks/algorithm-docpage/
 *
 * @param {object} response - grant response
 * @param {string} response.access_token - yandex access token
 * @param {object} response.raw - yandex raw response
 * @returns {Promise<string|Buffer|Error|*>}
 */
const yandexPassportInfo = async ({ access_token }) => {
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
/**
 * https://developers.facebook.com/docs/graph-api/using-graph-api/?locale=ru_RU
 *
 * @param {object} response - grant response
 * @param {string} response.name - name
 * @param {object} response.id - facebook id
 * @returns {Promise<string|Buffer|Error|*>}
 */
const facebookPassportInfo = async ({ access_token }) => {
  const HOST = 'graph.facebook.com';
  const response = await get(
    `https://${HOST}/v5.0/me`,
    {
      access_token,
      fields: 'email,id,gender,location,work,languages,name',
    },
    null,
    'utf8',
  );
  return JSON.parse(response);
};

module.exports = {
  yandexPassportInfo,
  facebookPassportInfo,
};
