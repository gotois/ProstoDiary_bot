const { get } = require('../services/request.service');
/**
 * @see https://developers.facebook.com/docs/graph-api/using-graph-api/?locale=ru_RU
 * @param {object} response - grant response
 * @returns {Promise<string|Error>}
 */
module.exports = async ({ access_token }) => {
  const HOST = 'graph.facebook.com';
  const API_VERSION = 'v6.0';
  const response = await get(
    `https://${HOST}/${API_VERSION}/me`,
    {
      access_token,
      fields: [
        'email',
        'id',
        'link',
        'gender',
        'birthday',
        'hometown',
        'political',
        'religion',
        'website',
        'location',
        'work',
        'education',
        'address',
        'languages',
        'name',
      ].join(','),
    },
    null,
    'utf8',
  );
  return JSON.parse(response);
};
