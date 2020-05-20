const qs = require('qs');
const { SERVER } = require('../../environment');
/**
 * @returns {jsonld}
 */
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
  /* eslint-disable */
  return `
    <h1>Marketplace</h1>
    <p>Передайте OIDC серверу логин и пароль бота полученный в письме</p>
    <ul>
    ${data.map((assistant) => {
      return `
        <li><a href="${assistant.connect}">${assistant.client_id}</a> <a href="${assistant.homepage}">[Homepage]</a></li>
      `;
    })}
    </ul>
  `;
};
