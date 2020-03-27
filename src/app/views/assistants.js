const qs = require('qs');
const { CLIENTS } = require('../../environment');

module.exports = () => {
  const data = CLIENTS.map((client) => {
    const tgParameters = qs.stringify({
      client_id: client.client_id,
      response_type: client.response_type,
      scope: 'openid email profile',
    });
    return {
      client_id: client.client_id,
      application_type: client.application_type,
      link: `/oidc/auth?${tgParameters}`,
    };
  });
  return JSON.stringify(data, null, 2);
};
