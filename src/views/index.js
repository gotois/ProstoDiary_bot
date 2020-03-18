const qs = require('qs');
const { SERVER } = require('../environment');

module.exports = () => {
  const tgParameters = qs.stringify({
    client_id: 'tg',
    response_type: 'code',
    scope: 'openid email profile',
  });
  return `
    <h1>Assistants</h1>
    <p>Bind your input assistant:</p>
    <a href="${SERVER.HOST}/oidc/auth?${tgParameters}">Telegram</a>
  `;
};
