const qs = require('qs');
const { SERVER, CLIENTS } = require('../../environment');

module.exports = () => {
  let html = '';
  html += `
    <h1>Assistants</h1>
    <p>Bind your input assistant:</p>
  `;

  CLIENTS.forEach((client) => {
    const tgParameters = qs.stringify({
      client_id: client.client_id,
      response_type: client.response_types[0],
      scope: 'openid email profile',
    });
    html += `<a href="${SERVER.HOST}/oidc/auth?${tgParameters}">${client.client_id}</a>`;
  });

  return html;
};
