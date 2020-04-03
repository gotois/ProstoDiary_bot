const qs = require('qs');
const { SERVER } = require('../../environment');

module.exports = ({ clients }) => {
  const data = clients.map((client) => {
    const linkQuery = qs.stringify({
      client_id: client.client_id,
      response_type: client.response_types[0],
      redirect_uri: client.redirect_uris[0],
      scope: 'openid email profile',
    });
    return {
      client_id: client.client_id,
      connect: `${SERVER.HOST}/oidc/auth?${linkQuery}`,
      homepage: client.homepage,
    };
  });
  return `
    <h1>Marketplace</h1>
    <ul>${data.map((assistant) => `
        <li><a href="${assistant.connect}">${assistant.client_id}</a> <a href="${assistant.homepage}">[Homepage]</a></li>
      `
    )}
    </ul>
  `;
};
